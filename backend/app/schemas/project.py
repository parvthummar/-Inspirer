import uuid
from datetime import datetime
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, StringConstraints

ViewMode = Literal["simple", "developer"]
ProjectStatus = Literal["draft", "planning", "building", "ready", "error"]


class ImportSourceIn(BaseModel):
    """The repository a project is imported from. The server reads it again; the client only names it."""

    type: Literal["github"]
    owner: str = Field(min_length=1, max_length=100)
    name: str = Field(min_length=1, max_length=100)


class SourceOut(BaseModel):
    type: Literal["github"]
    owner: str
    name: str
    branch: str
    url: str


class ProjectCreate(BaseModel):
    # Any non-blank prompt is accepted; a short one gives a rough plan the user can refine in the chat.
    prompt: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=4000)]
    source: ImportSourceIn | None = None


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
    source: SourceOut | None
    created_at: datetime
    updated_at: datetime
