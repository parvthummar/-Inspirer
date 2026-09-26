import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

ViewMode = Literal["simple", "developer"]
ProjectStatus = Literal["draft", "planning", "building", "ready", "error"]


class ProjectCreate(BaseModel):
    prompt: str = Field(min_length=3, max_length=4000)


class ProjectUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    view_mode: ViewMode | None = None


class ProjectOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    description: str
    initial_prompt: str
    view_mode: ViewMode
    status: ProjectStatus
    template_key: str | None
    created_at: datetime
    updated_at: datetime
