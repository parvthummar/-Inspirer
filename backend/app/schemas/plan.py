import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from app.services.templates import TemplateKey


class AgentIn(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    role: str = Field(max_length=400)
    tools: list[str] = Field(default_factory=list, max_length=8)


class PageIn(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    purpose: str = Field(max_length=400)


class PlanContent(BaseModel):
    """Plan content as stored in plans.content and as edited by the user."""

    summary: str = Field(max_length=1000)
    agents: list[AgentIn] = Field(max_length=6)
    pages: list[PageIn] = Field(max_length=10)
    integrations: list[str] = Field(default_factory=list, max_length=10)
    template_key: TemplateKey


class PlanRevisionRequest(BaseModel):
    """Empty feedback means "try again"; otherwise the plan is revised with it."""

    feedback: str | None = Field(default=None, min_length=1, max_length=2000)


class PlanOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    status: Literal["proposed", "approved", "revised"]
    content: PlanContent
    created_at: datetime
