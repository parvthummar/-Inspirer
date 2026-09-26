import uuid

from fastapi import APIRouter, BackgroundTasks, Depends, status
from sqlalchemy.orm import Session

from app.deps import get_current_user, get_db
from app.models import Plan, Project, User
from app.schemas.plan import PlanContent, PlanOut, PlanRevisionRequest
from app.schemas.project import ProjectOut
from app.services import plan_service, project_service

router = APIRouter(prefix="/api/projects/{project_id}/plan", tags=["plan"])


@router.post("", response_model=ProjectOut, status_code=status.HTTP_202_ACCEPTED)
def request_plan(
    project_id: uuid.UUID,
    body: PlanRevisionRequest,
    background_tasks: BackgroundTasks,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Project:
    """Write a new plan, or revise the current one with feedback. Runs in the background."""
    project = project_service.get_project(db, user, project_id)
    if plan_service.start_planning(db, project, body.feedback):
        background_tasks.add_task(plan_service.run_planning, project.id, body.feedback)
    return project


@router.patch("", response_model=PlanOut)
def update_plan(
    project_id: uuid.UUID,
    body: PlanContent,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Plan:
    project = project_service.get_project(db, user, project_id)
    return plan_service.update_plan(db, project, body)


@router.post("/approve", response_model=PlanOut)
def approve_plan(
    project_id: uuid.UUID, user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> Plan:
    project = project_service.get_project(db, user, project_id)
    return plan_service.approve_plan(db, project)
