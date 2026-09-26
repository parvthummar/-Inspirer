"""
The build is simulated. Starting a build writes a scripted list of steps (generated from the approved plan)
with realistic durations. The frontend animates them; the backend marks the project "ready" once the
scripted time has passed, the next time the project is read.
"""

import hashlib
import re
import uuid
from datetime import datetime, timedelta
from typing import Any

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import Message, Plan, Project

BUILDABLE_STATUSES = ("draft", "ready", "error")


def _slug(text: str, separator: str = "-") -> str:
    return re.sub(r"[^a-z0-9]+", separator, text.lower()).strip(separator) or "app"


def _component(text: str) -> str:
    return "".join(word.capitalize() for word in re.split(r"[^a-zA-Z0-9]+", text) if word) or "Page"


def _duration(seed: str, low: int, high: int) -> int:
    """A stable duration between low and high milliseconds, so a plan always builds at the same pace."""
    value = int(hashlib.sha256(seed.encode()).hexdigest()[:8], 16)
    return low + value % (high - low + 1)


def _step(key: str, label: str, dev_label: str, low: int, high: int, logs: list[str]) -> dict[str, Any]:
    return {
        "id": _slug(key),
        "label": label,
        "dev_label": dev_label,
        "duration_ms": _duration(key, low, high),
        "logs": logs,
    }


def build_script(project_name: str, plan: dict[str, Any]) -> list[dict[str, Any]]:
    """The scripted build steps for a plan. Each step takes between 300 ms and 2 s."""
    app_slug = _slug(project_name)
    pages = plan.get("pages", [])
    agents = plan.get("agents", [])
    integrations = plan.get("integrations", [])

    steps = [
        _step(
            "setup",
            "Setting up your project",
            f"Scaffolding {app_slug} (React 18 + FastAPI)",
            700,
            1100,
            [f"create {app_slug}/frontend (vite, react-ts)", f"create {app_slug}/backend (fastapi)", "install 214 packages"],
        ),
        _step(
            "database",
            "Creating a place to store your data",
            f"Creating Postgres schema ({len(pages) + 2} tables)",
            900,
            1400,
            ["alembic revision 0001_initial", f"create {len(pages) + 2} tables", "seed 48 sample rows"],
        ),
    ]
    for page in pages:
        name = page.get("name", "Page")
        component = _component(name)
        steps.append(
            _step(
                f"page {name}",
                f"Building the {name} page",
                f"Generating src/pages/{component}.tsx",
                800,
                1600,
                [f"write src/pages/{component}.tsx", f"register route /{_slug(name)}", "type check passed"],
            )
        )
    for agent in agents:
        name = agent.get("name", "Agent")
        tools = agent.get("tools", [])
        steps.append(
            _step(
                f"agent {name}",
                f"Setting up the {name}",
                f"Configuring agent {_slug(name, '_')} with {len(tools)} tools",
                1200,
                2000,
                [f"write agents/{_slug(name, '_')}.py", *[f"register tool {_slug(tool, '_')}" for tool in tools[:4]]],
            )
        )
    for integration in integrations:
        steps.append(
            _step(
                f"integration {integration}",
                f"Connecting to {integration}",
                f"Registering {integration} connector",
                500,
                1000,
                [f"add connector {_slug(integration, '_')}", "store credentials placeholder in env"],
            )
        )
    steps += [
        _step(
            "tests",
            "Checking that everything works",
            f"Running {12 + 3 * len(pages) + 4 * len(agents)} tests",
            1300,
            1900,
            [f"{12 + 3 * len(pages) + 4 * len(agents)} passed, 0 failed", "lint: no problems"],
        ),
        _step(
            "publish",
            "Publishing your preview",
            f"Deploying preview to {app_slug[:40]}.architect.app",
            900,
            1400,
            ["build frontend (vite) in 3.8s", f"preview live at https://{app_slug[:40]}.architect.app"],
        ),
    ]
    return steps


def _approved_plan(db: Session, project: Project) -> Plan:
    query = (
        select(Plan)
        .where(Plan.project_id == project.id, Plan.status == "approved")
        .order_by(Plan.created_at.desc())
        .limit(1)
    )
    plan = db.scalar(query)
    if plan is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Approve the plan first, then Architect can build your app.",
        )
    return plan


def start_build(db: Session, project: Project) -> None:
    """Write the build script and the chat message that tracks it. The caller commits."""
    if project.status not in BUILDABLE_STATUSES:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Your app is already being built.")
    plan = _approved_plan(db, project)
    steps = build_script(project.name, plan.content)

    message = Message(
        project_id=project.id,
        role="assistant",
        content="Building your app. You can watch it come together in the preview.",
        steps=[{"label": step["label"], "status": "running" if i == 0 else "pending"} for i, step in enumerate(steps)],
        created_at=func.clock_timestamp(),
    )
    db.add(message)
    db.flush()

    started_at = db.scalar(select(func.clock_timestamp()))
    assert started_at is not None
    project.template_key = plan.content.get("template_key")
    project.status = "building"
    project.build_state = {
        "started_at": started_at.isoformat(),
        "message_id": str(message.id),
        "total_ms": sum(step["duration_ms"] for step in steps),
        "steps": steps,
    }


def elapsed_ms(db: Session, project: Project) -> int:
    if not project.build_state:
        return 0
    started_at = datetime.fromisoformat(project.build_state["started_at"])
    now = db.scalar(select(func.clock_timestamp()))
    assert now is not None
    return max(0, int((now - started_at) / timedelta(milliseconds=1)))


def finish_if_done(db: Session, project: Project) -> None:
    """Mark a building project as ready once its scripted build time has passed."""
    if project.status != "building" or not project.build_state:
        return
    state = project.build_state
    if elapsed_ms(db, project) < state["total_ms"]:
        return

    seconds = round(state["total_ms"] / 1000)
    build_message = db.get(Message, uuid.UUID(state["message_id"]))
    if build_message is not None:
        build_message.steps = [{"label": step["label"], "status": "done"} for step in state["steps"]]
        build_message.content = f"Built your app in {seconds} seconds."
    db.add(
        Message(
            project_id=project.id,
            role="assistant",
            content=(
                "Your app is ready. Try it out in the preview on the right. "
                "If you'd like anything changed, just tell me here."
            ),
            created_at=func.clock_timestamp(),
        )
    )
    project.status = "ready"
    db.commit()
    db.refresh(project)
