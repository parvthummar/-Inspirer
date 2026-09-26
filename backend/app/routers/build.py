import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.deps import get_current_user, get_db
from app.models import Project, User
from app.schemas.build import BuildOut
from app.services import build_simulator, project_service

router = APIRouter(prefix="/api/projects/{project_id}/build", tags=["build"])


def _build_out(db: Session, project: Project) -> BuildOut:
    if not project.build_state:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="This project hasn't been built yet.")
    return BuildOut(
        status=project.status,  # type: ignore[arg-type]
        elapsed_ms=build_simulator.elapsed_ms(db, project),
        **project.build_state,
    )


@router.post("", response_model=BuildOut, status_code=status.HTTP_202_ACCEPTED)
def start_build(
    project_id: uuid.UUID, user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> BuildOut:
    """Build (or rebuild) the app from the approved plan."""
    project = project_service.get_project(db, user, project_id)
    build_simulator.start_build(db, project)
    db.commit()
    db.refresh(project)
    return _build_out(db, project)


@router.get("", response_model=BuildOut)
def get_build(
    project_id: uuid.UUID, user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> BuildOut:
    """The scripted build steps with their timings, and the build's current status."""
    project = project_service.get_project(db, user, project_id)
    return _build_out(db, project)
