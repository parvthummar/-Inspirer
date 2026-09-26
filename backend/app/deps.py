from collections.abc import Iterator

from fastapi import Cookie, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db import get_session
from app.models import User
from app.services.auth_service import AUTH_COOKIE, read_token


def get_db() -> Iterator[Session]:
    yield from get_session()


def get_current_user(
    db: Session = Depends(get_db),
    token: str | None = Cookie(default=None, alias=AUTH_COOKIE),
) -> User:
    user_id = read_token(token) if token else None
    user = db.get(User, user_id) if user_id else None
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Your session has ended. Please log in again.",
        )
    return user
