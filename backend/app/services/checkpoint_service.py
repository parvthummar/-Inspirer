"""
Checkpoints: every message Architect posts stores a snapshot of the project at that moment.
Restoring to a message removes everything after it and puts the project back to that snapshot.
"""

import uuid
from typing import Any

from fastapi import HTTPException, status
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.models import Message, Plan, Project


def _snapshot(db: Session, project: Project) -> dict[str, Any]:
    plans = db.scalars(select(Plan).where(Plan.project_id == project.id))
    return {
        "name": project.name,
        "description": project.description,
        "status": project.status,
        "template_key": project.template_key,
        "build_state": project.build_state,
        "plans": {str(plan.id): plan.status for plan in plans},
    }


def record(db: Session, project: Project, message: Message) -> None:
    """Store the project's current state on the message. Call before committing, after all changes."""
    db.flush()
    message.snapshot = _snapshot(db, project)


def restore(db: Session, project: Project, message_id: uuid.UUID) -> int:
    """Remove every message and plan after the checkpoint and restore its state. Returns messages removed."""
    if project.status == "planning":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Architect is writing a plan right now. Wait for it to finish, then restore.",
        )
    message = db.scalar(select(Message).where(Message.id == message_id, Message.project_id == project.id))
    if message is None or message.snapshot is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="That checkpoint no longer exists.")

    snapshot = message.snapshot
    removed = db.execute(
        delete(Message).where(Message.project_id == project.id, Message.created_at > message.created_at)
    ).rowcount
    db.execute(delete(Plan).where(Plan.project_id == project.id, Plan.created_at > message.created_at))
    for plan in db.scalars(select(Plan).where(Plan.project_id == project.id)):
        plan.status = snapshot["plans"].get(str(plan.id), plan.status)

    project.name = snapshot["name"]
    project.description = snapshot["description"]
    project.template_key = snapshot["template_key"]
    project.build_state = snapshot["build_state"]
    # A plan being written can't be resumed; the chat offers to write it again instead.
    project.status = "draft" if snapshot["status"] == "planning" else snapshot["status"]
    db.commit()
    db.refresh(project)
    return removed or 0
