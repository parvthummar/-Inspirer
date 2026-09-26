import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Any

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base
from app.models.base import CreatedAt, UUIDPrimaryKey

if TYPE_CHECKING:
    from app.models.message import Message
    from app.models.plan import Plan
    from app.models.user import User

VIEW_MODES = ("simple", "developer")
PROJECT_STATUSES = ("draft", "planning", "building", "ready", "error")


class Project(UUIDPrimaryKey, CreatedAt, Base):
    __tablename__ = "projects"
    __table_args__ = (
        CheckConstraint(f"view_mode IN {VIEW_MODES}", name="view_mode_valid"),
        CheckConstraint(f"status IN {PROJECT_STATUSES}", name="status_valid"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    name: Mapped[str] = mapped_column(String(120))
    description: Mapped[str] = mapped_column(Text, default="", server_default="")
    initial_prompt: Mapped[str] = mapped_column(Text)
    # New projects open in Developer view; users can switch to Simple at any time.
    view_mode: Mapped[str] = mapped_column(String(20), default="developer", server_default="developer")
    status: Mapped[str] = mapped_column(String(20), default="draft", server_default="draft")
    template_key: Mapped[str | None] = mapped_column(String(60))
    # The latest simulated build: {"started_at", "message_id", "total_ms", "steps": [...]}. See build_simulator.
    build_state: Mapped[dict[str, Any] | None] = mapped_column(JSONB)
    # Where an imported project came from, e.g. {"type": "github", "owner", "name", "branch", "files": [...]}.
    source: Mapped[dict[str, Any] | None] = mapped_column(JSONB)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    user: Mapped["User"] = relationship(back_populates="projects")
    messages: Mapped[list["Message"]] = relationship(
        back_populates="project",
        cascade="all, delete-orphan",
        passive_deletes=True,
        order_by="Message.created_at",
    )
    plans: Mapped[list["Plan"]] = relationship(
        back_populates="project",
        cascade="all, delete-orphan",
        passive_deletes=True,
        order_by="Plan.created_at",
    )
