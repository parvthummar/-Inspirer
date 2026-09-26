import uuid

from fastapi import APIRouter, BackgroundTasks, Depends, status
from sqlalchemy.orm import Session

from app.deps import get_current_user, get_db
from app.models import Message, User
from app.schemas.message import MessageCreate, MessageOut, VisualEditCreate
from app.services import chat_service, plan_service, project_service

router = APIRouter(prefix="/api/projects/{project_id}", tags=["chat"])


@router.get("/messages", response_model=list[MessageOut])
def list_messages(
    project_id: uuid.UUID, user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> list[Message]:
    project = project_service.get_project(db, user, project_id)
    return chat_service.list_messages(db, project)


@router.post("/messages", response_model=list[MessageOut], status_code=status.HTTP_201_CREATED)
def send_message(
    project_id: uuid.UUID,
    body: MessageCreate,
    background_tasks: BackgroundTasks,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[Message]:
    """Returns the user's message and Architect's reply. If the message asked for plan changes,
    the project switches to "planning" and the revised plan follows in the background."""
    project = project_service.get_project(db, user, project_id)
    result = chat_service.send_message(db, project, body.content)
    if result.revising_plan:
        background_tasks.add_task(plan_service.run_planning, project.id, body.content.strip())
    return result.messages


@router.post("/edits", response_model=list[MessageOut], status_code=status.HTTP_201_CREATED)
def save_visual_edit(
    project_id: uuid.UUID,
    body: VisualEditCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[Message]:
    """Save a click-to-edit change from the preview as a chat exchange. No AI call is needed."""
    project = project_service.get_project(db, user, project_id)
    return chat_service.save_visual_edit(db, project, body.element, body.instruction, body.change, body.file)
