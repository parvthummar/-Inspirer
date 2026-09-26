import uuid
from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.plan import PlanOut


class MessageCreate(BaseModel):
    content: str = Field(min_length=1, max_length=4000)


class VisualEditCreate(BaseModel):
    """A change made by clicking an element in the preview. The frontend has already applied it."""

    element: str = Field(min_length=1, max_length=200)
    instruction: str = Field(min_length=1, max_length=1000)
    change: str = Field(min_length=1, max_length=500)
    file: str = Field(min_length=1, max_length=200)


class MessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    role: Literal["user", "assistant"]
    content: str
    steps: list[dict[str, Any]]
    plan: PlanOut | None
    # Whether the project can be restored to just after this message.
    has_checkpoint: bool
    created_at: datetime
