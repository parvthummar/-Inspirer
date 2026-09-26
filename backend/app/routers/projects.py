import uuid

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.deps import get_current_user, get_db
from app.models import Project, User
from app.schemas.project import ProjectCreate, ProjectOut, ProjectUpdate
from app.services import github_service, plan_service, project_service

router = APIRouter(prefix="/api/projects", tags=["projects"])


@router.get("", response_model=list[ProjectOut])
def list_projects(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[Project]:
    return project_service.list_projects(db, user)


@router.post("", response_model=ProjectOut, status_code=status.HTTP_201_CREATED)
def create_project(
    body: ProjectCreate,
    background_tasks: BackgroundTasks,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Project:
    """Create the project and start writing its plan. The plan appears in the chat when it is ready."""
    source = None
    if body.source is not None:
        # Read the repository on the server (cached from the import review) rather than trusting the client.
        try:
            source = github_service.analyze(body.source.owner, body.source.name)["source"]
        except github_service.GitHubError as error:
            raise HTTPException(status_code=error.status, detail=error.message)
    project = project_service.create_project(db, user, body.prompt, source)
    background_tasks.add_task(plan_service.run_planning, project.id)
    return project


@router.get("/{project_id}", response_model=ProjectOut)
def get_project(
    project_id: uuid.UUID, user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> Project:
    return project_service.get_project(db, user, project_id)


@router.patch("/{project_id}", response_model=ProjectOut)
def update_project(
    project_id: uuid.UUID,
    body: ProjectUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Project:
    project = project_service.get_project(db, user, project_id)
    return project_service.update_project(db, project, body)


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: uuid.UUID, user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> None:
    project = project_service.get_project(db, user, project_id)
    project_service.delete_project(db, project)
