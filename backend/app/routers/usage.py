import uuid
from datetime import datetime
from typing import Literal

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.deps import get_current_user, get_db
from app.models import User
from app.services import usage_service

router = APIRouter(prefix="/api/usage", tags=["usage"])


class UsageLine(BaseModel):
    kind: Literal["plans", "replies", "builds"]
    count: int
    credits: int


class ProjectUsage(BaseModel):
    project_id: uuid.UUID
    name: str
    credits: int


class UsageOut(BaseModel):
    plan_name: str
    credits_total: int
    credits_used: int
    period_start: datetime
    resets_at: datetime
    breakdown: list[UsageLine]
    by_project: list[ProjectUsage]


@router.get("", response_model=UsageOut)
def get_usage(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    """Credits used this month, with a breakdown by kind and by project."""
    return usage_service.usage_for(db, user)
