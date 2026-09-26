from typing import TYPE_CHECKING

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base
from app.models.base import CreatedAt, UUIDPrimaryKey

if TYPE_CHECKING:
    from app.models.project import Project


class User(UUIDPrimaryKey, CreatedAt, Base):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(120))
    # Nullable so Google sign-in users (Phase 2) can exist without a password.
    password_hash: Mapped[str | None] = mapped_column(String(255))
    auth_provider: Mapped[str] = mapped_column(String(20), default="email", server_default="email")

    @property
    def has_password(self) -> bool:
        return self.password_hash is not None

    projects: Mapped[list["Project"]] = relationship(
        back_populates="user", cascade="all, delete-orphan", passive_deletes=True
    )
