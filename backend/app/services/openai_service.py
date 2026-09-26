"""All OpenAI calls live here. Routers and other services never call OpenAI directly."""

import json
import logging
from typing import Literal

from openai import OpenAI
from pydantic import BaseModel, ConfigDict

from app.config import get_settings
from app.services.templates import (
    DEFAULT_TEMPLATE,
    TEMPLATE_DESCRIPTIONS,
    TEMPLATE_KEYWORDS,
    TemplateKey,
)

logger = logging.getLogger(__name__)

ViewMode = Literal["simple", "developer"]
REQUEST_TIMEOUT_SECONDS = 45


class AgentSpec(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str
    role: str
    tools: list[str]


class PageSpec(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str
    purpose: str


class PlanDraft(BaseModel):
    """The structured plan the model must return."""

    model_config = ConfigDict(extra="forbid")

    project_name: str
    summary: str
    agents: list[AgentSpec]
    pages: list[PageSpec]
    integrations: list[str]
    template_key: TemplateKey


def _system_prompt(view_mode: ViewMode) -> str:
    templates = "\n".join(f"- {key}: {description}" for key, description in TEMPLATE_DESCRIPTIONS.items())
    if view_mode == "simple":
        voice = (
            "The user is not technical. Write in plain, friendly language. Never mention code, frameworks, "
            "databases, APIs or other technical terms. Describe tools by what they do, e.g. 'Look up an order', "
            "'Send an email'."
        )
    else:
        voice = (
            "The user is a developer. You may use precise technical terms. Name tools as short function-style "
            "identifiers, e.g. 'search_help_center', 'send_email'. Integrations can name specific services."
        )
    return f"""You are Architect, an assistant that plans agentic apps: apps where AI agents do work for people.
Before anything is built, you write a short plan the user approves.

{voice}

Rules for the plan:
- project_name: 2 to 4 words, title case, no quotes, e.g. "Leave Request Tracker".
- summary: 1 to 2 sentences saying what the app does and for whom.
- agents: 1 to 3 AI agents. name is short ("Support agent"). role is one sentence on what it does. tools: 2 to 4 items.
- pages: 2 to 5 pages of the app, each with a one-sentence purpose.
- integrations: 0 to 4 outside services the app connects to (e.g. "Gmail", "Slack", "Google Calendar"). Empty if none are needed.
- template_key: the closest match from this list:
{templates}

Keep it realistic and small enough to build as a first version."""


def _client() -> OpenAI | None:
    settings = get_settings()
    if not settings.openai_api_key or not settings.openai_model:
        return None
    return OpenAI(api_key=settings.openai_api_key, timeout=REQUEST_TIMEOUT_SECONDS, max_retries=0)


def _request_plan(
    client: OpenAI,
    prompt: str,
    view_mode: ViewMode,
    previous: PlanDraft | None,
    feedback: str | None,
) -> PlanDraft:
    messages = [
        {"role": "system", "content": _system_prompt(view_mode)},
        {"role": "user", "content": prompt},
    ]
    if previous is not None:
        messages.append({"role": "assistant", "content": previous.model_dump_json()})
        messages.append(
            {
                "role": "user",
                "content": f"Revise the plan with this feedback, keeping everything else the same: {feedback}",
            }
        )
    completion = client.beta.chat.completions.parse(
        model=get_settings().openai_model,
        messages=messages,
        response_format=PlanDraft,
    )
    parsed = completion.choices[0].message.parsed
    if parsed is None:
        raise ValueError("The model returned no plan")
    return PlanDraft.model_validate(parsed.model_dump())


def _pick_template(text: str) -> TemplateKey:
    lowered = f" {text.lower()} "
    scores = {key: sum(word in lowered for word in words) for key, words in TEMPLATE_KEYWORDS.items()}
    best = max(scores, key=lambda key: scores[key])
    return best if scores[best] > 0 else DEFAULT_TEMPLATE  # type: ignore[return-value]


def fallback_plan(prompt: str, project_name: str, previous: PlanDraft | None = None) -> PlanDraft:
    """A sensible plan used when OpenAI is not configured or fails twice, so the user never sees a crash."""
    if previous is not None:
        return previous
    return PlanDraft(
        project_name=project_name,
        summary=f"An app based on your request: {prompt.strip()[:180]}",
        agents=[
            AgentSpec(
                name="Assistant agent",
                role="Handles the main task you described and asks a person when it is unsure.",
                tools=["Read the app's records", "Draft a reply or summary", "Notify a teammate"],
            )
        ],
        pages=[
            PageSpec(name="Home", purpose="See what needs attention today at a glance."),
            PageSpec(name="Records", purpose="Browse, search and edit everything the app keeps track of."),
            PageSpec(name="Settings", purpose="Choose who has access and how the agent behaves."),
        ],
        integrations=["Email"],
        template_key=_pick_template(prompt),
    )


def _clean(plan: PlanDraft) -> PlanDraft:
    """Keep lists within the sizes the UI is designed for."""
    return plan.model_copy(
        update={
            "project_name": plan.project_name.strip().strip('"')[:60] or "Untitled project",
            "agents": plan.agents[:3],
            "pages": plan.pages[:6],
            "integrations": [item for item in plan.integrations if item.strip()][:5],
        }
    )


def generate_plan(
    prompt: str,
    view_mode: ViewMode,
    fallback_name: str,
    previous: PlanDraft | None = None,
    feedback: str | None = None,
) -> tuple[PlanDraft, bool]:
    """
    Ask OpenAI for a plan, or a revision of `previous` when `feedback` is given.
    Retries once, then falls back. Never raises. Returns (plan, used_ai).
    """
    client = _client()
    if client is None:
        logger.warning("OPENAI_API_KEY or OPENAI_MODEL is not set; using the fallback plan.")
        return fallback_plan(prompt, fallback_name, previous), False

    for attempt in (1, 2):
        try:
            return _clean(_request_plan(client, prompt, view_mode, previous, feedback)), True
        except Exception:  # any API, network or parsing failure: retry once, then fall back
            logger.exception("Plan generation failed (attempt %s of 2)", attempt)
    return fallback_plan(prompt, fallback_name, previous), False


def plan_from_content(project_name: str, content: dict) -> PlanDraft | None:
    """Rebuild a PlanDraft from a stored plan's content, or None if it no longer matches the schema."""
    try:
        return PlanDraft.model_validate({"project_name": project_name, **content})
    except Exception:
        logger.warning("Stored plan content could not be parsed: %s", json.dumps(content)[:200])
        return None
