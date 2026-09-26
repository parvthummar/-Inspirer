import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.deps import get_current_user, get_db
from app.models import Message, User
from app.schemas.message import MessageCreate, MessageOut
from app.services import chat_service, project_service

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
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[Message]:
    project = project_service.get_project(db, user, project_id)
    return chat_service.send_message(db, project, body.content)
