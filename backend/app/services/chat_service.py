from dataclasses import dataclass

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import Message, Project
from app.services import checkpoint_service, openai_service, plan_service


@dataclass
class SendResult:
    messages: list[Message]
    # True when the reply started a plan revision; the caller runs it in the background.
    revising_plan: bool


def list_messages(db: Session, project: Project) -> list[Message]:
    query = select(Message).where(Message.project_id == project.id).order_by(Message.created_at)
    return list(db.scalars(query))


def _history_entry(message: Message) -> tuple[str, str]:
    content = message.content
    if message.plan is not None:
        content += f"\n[Plan card shown here, {message.plan.status}]"
    return message.role, content


def _context(db: Session, project: Project) -> openai_service.ChatContext:
    plan = plan_service.latest_plan(db, project)
    return openai_service.ChatContext(
        project_name=project.name,
        initial_prompt=project.initial_prompt,
        view_mode=project.view_mode,  # type: ignore[arg-type]
        project_status=project.status,
        plan=plan.content if plan else None,
        plan_status=plan.status if plan else None,
        history=[_history_entry(message) for message in list_messages(db, project)],
    )


def save_visual_edit(db: Session, project: Project, element: str, instruction: str, change: str, file: str) -> list[Message]:
    """Record a click-to-edit change in the chat: the request, and Architect's confirmation."""
    if project.status != "ready":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="The app needs to finish building before you can edit it in the preview.",
        )
    request = Message(
        project_id=project.id,
        role="user",
        content=f"{instruction.strip()} (on {element.strip()} in the preview)",
        created_at=func.clock_timestamp(),
    )
    db.add(request)
    db.flush()
    reply = Message(
        project_id=project.id,
        role="assistant",
        content=f"Done. {change.strip()}",
        steps=[{"label": f"Updated {file.strip()}", "status": "done"}, {"label": "Refreshed the preview", "status": "done"}],
        created_at=func.clock_timestamp(),
    )
    db.add(reply)
    project.updated_at = func.now()
    checkpoint_service.record(db, project, reply)
    db.commit()
    db.refresh(request)
    db.refresh(reply)
    return [request, reply]


def send_message(db: Session, project: Project, content: str) -> SendResult:
    """Save the user's message, get Architect's reply, and save it. Messages are returned oldest first."""
    content = content.strip()
    context = _context(db, project)
    decision, _ = openai_service.chat_reply(context, content)

    # clock_timestamp() instead of the default now(): both rows share one transaction, and now()
    # would give them the same time. Using the database clock keeps order consistent with older rows.
    user_message = Message(project_id=project.id, role="user", content=content, created_at=func.clock_timestamp())
    db.add(user_message)
    db.flush()
    reply = Message(
        project_id=project.id,
        role="assistant",
        content=decision.reply.strip(),
        created_at=func.clock_timestamp(),
    )
    db.add(reply)
    project.updated_at = func.now()  # new chat activity moves the project to the top of the dashboard
    checkpoint_service.record(db, project, reply)
    db.commit()
    db.refresh(user_message)
    db.refresh(reply)

    revising = decision.revise_plan and plan_service.start_planning(db, project)
    return SendResult(messages=[user_message, reply], revising_plan=revising)
