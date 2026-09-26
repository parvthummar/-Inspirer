"""new projects default to developer view

Revision ID: 0ead0f30fde5
Revises: f9143ff94903
Create Date: 2026-09-26 17:53:20.208348

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0ead0f30fde5'
down_revision: Union[str, None] = 'f9143ff94903'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Only the default for new rows changes; existing projects keep their view.
    op.alter_column("projects", "view_mode", server_default="developer")


def downgrade() -> None:
    op.alter_column("projects", "view_mode", server_default="simple")
