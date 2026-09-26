import uuid
from datetime import datetime

from pydantic import BaseModel

from app.schemas.project import ProjectStatus


class BuildStep(BaseModel):
    id: str
    label: str
    dev_label: str
    duration_ms: int
    logs: list[str]


class BuildOut(BaseModel):
    status: ProjectStatus
    started_at: datetime
    # Time since the build started, by the server's clock, so the frontend can sync its animation.
    elapsed_ms: int
    total_ms: int
    message_id: uuid.UUID
    steps: list[BuildStep]
