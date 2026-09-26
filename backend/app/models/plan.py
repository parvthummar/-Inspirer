import uuid
from typing import TYPE_CHECKING, Any

from sqlalchemy import CheckConstraint, ForeignKey, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base
from app.models.base import CreatedAt, UUIDPrimaryKey

if TYPE_CHECKING:
    from app.models.project import Project

PLAN_STATUSES = ("proposed", "approved", "revised")


class Plan(UUIDPrimaryKey, CreatedAt, Base):
    __tablename__ = "plans"
    __table_args__ = (CheckConstraint(f"status IN {PLAN_STATUSES}", name="status_valid"),)

    project_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"), index=True
    )
    # Shape: {"summary", "agents": [...], "pages": [...], "integrations": [...]}
    content: Mapped[dict[str, Any]] = mapped_column(JSONB)
    status: Mapped[str] = mapped_column(String(20), default="proposed", server_default="proposed")

    project: Mapped["Project"] = relationship(back_populates="plans")
