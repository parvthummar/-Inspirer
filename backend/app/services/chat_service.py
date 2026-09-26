from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import Message, Project


def list_messages(db: Session, project: Project) -> list[Message]:
    query = select(Message).where(Message.project_id == project.id).order_by(Message.created_at)
    return list(db.scalars(query))


def _assistant_reply(project: Project, content: str) -> str:
    """Placeholder reply until OpenAI chat replies are added in Phase 1, step 7."""
    return (
        "Got it. I've added that to this project's notes and will include it when I put together "
        "the plan for your app."
    )


def send_message(db: Session, project: Project, content: str) -> list[Message]:
    """Save the user's message and the assistant's reply. Returns both, oldest first."""
    # clock_timestamp() instead of the default now(): both rows share one transaction, and now()
    # would give them the same time. Using the database clock keeps order consistent with older rows.
    user_message = Message(
        project_id=project.id, role="user", content=content.strip(), created_at=func.clock_timestamp()
    )
    db.add(user_message)
    db.flush()
    reply = Message(
        project_id=project.id,
        role="assistant",
        content=_assistant_reply(project, content),
        created_at=func.clock_timestamp(),
    )
    db.add(reply)
    project.updated_at = func.now()  # new chat activity moves the project to the top of the dashboard
    db.commit()
    db.refresh(user_message)
    db.refresh(reply)
    return [user_message, reply]
