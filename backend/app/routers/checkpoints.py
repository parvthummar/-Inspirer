import uuid

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.deps import get_current_user, get_db
from app.models import User
from app.schemas.project import ProjectOut
from app.services import checkpoint_service, project_service

router = APIRouter(prefix="/api/projects/{project_id}/checkpoints", tags=["checkpoints"])


class RestoreRequest(BaseModel):
    message_id: uuid.UUID


class RestoreResult(BaseModel):
    project: ProjectOut
    removed_messages: int


@router.post("/restore", response_model=RestoreResult)
def restore_checkpoint(
    project_id: uuid.UUID,
    body: RestoreRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> RestoreResult:
    """Restore the project to just after the given message, removing everything that came later."""
    project = project_service.get_project(db, user, project_id)
    removed = checkpoint_service.restore(db, project, body.message_id)
    return RestoreResult(project=ProjectOut.model_validate(project), removed_messages=removed)
