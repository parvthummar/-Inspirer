import uuid
from typing import TYPE_CHECKING, Any

from sqlalchemy import CheckConstraint, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base
from app.models.base import CreatedAt, UUIDPrimaryKey

if TYPE_CHECKING:
    from app.models.plan import Plan
    from app.models.project import Project

MESSAGE_ROLES = ("user", "assistant")


class Message(UUIDPrimaryKey, CreatedAt, Base):
    __tablename__ = "messages"
    __table_args__ = (CheckConstraint(f"role IN {MESSAGE_ROLES}", name="role_valid"),)

    project_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"), index=True
    )
    role: Mapped[str] = mapped_column(String(20))
    content: Mapped[str] = mapped_column(Text)
    # Action steps shown under an assistant message, e.g. [{"label": "Created login page"}].
    steps: Mapped[list[dict[str, Any]]] = mapped_column(JSONB, default=list, server_default="[]")
    # Set when this assistant message presents a plan; the chat shows it as a plan card.
    plan_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("plans.id", ondelete="SET NULL"))
    # Project state right after this message, so the project can be restored to this point.
    snapshot: Mapped[dict[str, Any] | None] = mapped_column(JSONB)

    project: Mapped["Project"] = relationship(back_populates="messages")
    plan: Mapped["Plan | None"] = relationship(lazy="joined")

    @property
    def has_checkpoint(self) -> bool:
        return self.snapshot is not None
