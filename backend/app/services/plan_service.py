import logging
import uuid
from datetime import timedelta

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db import SessionLocal
from app.models import Message, Plan, Project
from app.schemas.plan import PlanContent
from app.services import openai_service
from app.services.project_service import draft_name_from_prompt

logger = logging.getLogger(__name__)

# A plan request older than this is treated as lost (e.g. the server restarted) and may be started again.
PLANNING_TIMEOUT = timedelta(seconds=60)


def latest_plan(db: Session, project: Project) -> Plan | None:
    query = select(Plan).where(Plan.project_id == project.id).order_by(Plan.created_at.desc()).limit(1)
    return db.scalar(query)


def _proposed_plan(db: Session, project: Project) -> Plan:
    plan = latest_plan(db, project)
    if plan is None or plan.status != "proposed":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="There's no plan waiting for review. Refresh the page to see the latest plan.",
        )
    return plan


def start_planning(db: Session, project: Project, feedback: str | None = None) -> bool:
    """
    Mark the project as planning and save the user's feedback as a chat message.
    Returns False when a plan is already being written, so callers don't start a second one.
    """
    if project.status == "planning":
        # Compare against the database clock, which also set updated_at.
        database_now = db.scalar(select(func.now()))
        if database_now is not None and database_now - project.updated_at < PLANNING_TIMEOUT:
            return False
    if project.status not in ("draft", "planning"):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="The plan can't be changed once the build has started.",
        )
    if feedback:
        db.add(Message(project_id=project.id, role="user", content=feedback.strip(), created_at=func.clock_timestamp()))
    project.status = "planning"
    project.updated_at = func.now()
    db.commit()
    db.refresh(project)
    return True


def _intro_message(project_name: str, revising: bool, used_ai: bool) -> str:
    if revising and not used_ai:
        return (
            "I couldn't update the plan just now, so here it is unchanged. "
            "Try asking again in a moment, or edit the plan yourself."
        )
    if revising:
        return "I've updated the plan with your changes. Take a look, then approve it or tell me what else to change."
    return (
        f"Here's my plan for {project_name}. Take a look, then approve it to start building, "
        "or tell me what to change."
    )


def run_planning(project_id: uuid.UUID, feedback: str | None = None) -> None:
    """Background job: ask OpenAI for a plan (or a revision), save it and post it in the chat."""
    with SessionLocal() as db:
        project = db.get(Project, project_id)
        if project is None or project.status != "planning":
            return
        try:
            # Any earlier plan is replaced. With feedback, the new plan is a revision of it;
            # without (a retry), a fresh plan is written from the original prompt.
            previous_plan = latest_plan(db, project)
            previous = (
                openai_service.plan_from_content(project.name, previous_plan.content)
                if previous_plan is not None and feedback
                else None
            )
            revising = previous is not None

            draft, used_ai = openai_service.generate_plan(
                prompt=project.initial_prompt,
                view_mode=project.view_mode,  # type: ignore[arg-type]
                fallback_name=project.name,
                previous=previous,
                feedback=feedback,
            )

            if previous_plan is not None:
                previous_plan.status = "revised"
            plan = Plan(project_id=project.id, content=draft.model_dump(exclude={"project_name"}))
            db.add(plan)
            db.flush()

            # Use the suggested name unless the user has already renamed the project.
            if used_ai and project.name == draft_name_from_prompt(project.initial_prompt):
                project.name = draft.project_name
            project.description = draft.summary
            project.status = "draft"
            db.add(
                Message(
                    project_id=project.id,
                    role="assistant",
                    content=_intro_message(project.name, revising, used_ai),
                    plan_id=plan.id,
                    created_at=func.clock_timestamp(),
                )
            )
            db.commit()
        except Exception:
            logger.exception("Saving the plan failed for project %s", project_id)
            db.rollback()
            project.status = "error"
            db.commit()


def update_plan(db: Session, project: Project, content: PlanContent) -> Plan:
    plan = _proposed_plan(db, project)
    plan.content = content.model_dump()
    project.description = content.summary
    db.commit()
    db.refresh(plan)
    return plan


def approve_plan(db: Session, project: Project) -> Plan:
    plan = _proposed_plan(db, project)
    plan.status = "approved"
    project.template_key = plan.content.get("template_key")
    db.add(
        Message(
            project_id=project.id,
            role="assistant",
            content="Plan approved. I'll build your app from this plan.",
            created_at=func.clock_timestamp(),
        )
    )
    db.commit()
    db.refresh(plan)
    return plan
