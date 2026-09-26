from collections.abc import Iterator

from sqlalchemy.orm import Session

from app.db import get_session


def get_db() -> Iterator[Session]:
    yield from get_session()


# get_current_user is added with auth in Phase 1, step 3.
