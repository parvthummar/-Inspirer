import uuid
from datetime import UTC, datetime, timedelta

import jwt
from fastapi import Response
from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import get_settings
from app.models import User

AUTH_COOKIE = "architect_session"
TOKEN_LIFETIME = timedelta(days=7)
JWT_ALGORITHM = "HS256"

_password_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class EmailTakenError(Exception):
    pass


def hash_password(password: str) -> str:
    return _password_context.hash(password)


def verify_password(password: str, password_hash: str | None) -> bool:
    if password_hash is None:
        return False
    return _password_context.verify(password, password_hash)


def normalize_email(email: str) -> str:
    return email.strip().lower()


def create_user(db: Session, name: str, email: str, password: str) -> User:
    email = normalize_email(email)
    if db.scalar(select(User).where(User.email == email)) is not None:
        raise EmailTakenError
    user = User(name=name.strip(), email=email, password_hash=hash_password(password))
    db.add(user)
    db.commit()
    return user


def authenticate(db: Session, email: str, password: str) -> User | None:
    user = db.scalar(select(User).where(User.email == normalize_email(email)))
    if user is None or not verify_password(password, user.password_hash):
        return None
    return user


def create_token(user_id: uuid.UUID) -> str:
    now = datetime.now(UTC)
    payload = {"sub": str(user_id), "iat": now, "exp": now + TOKEN_LIFETIME}
    return jwt.encode(payload, get_settings().jwt_secret, algorithm=JWT_ALGORITHM)


def read_token(token: str) -> uuid.UUID | None:
    """Return the user id in a valid token, or None if the token is invalid or expired."""
    try:
        payload = jwt.decode(token, get_settings().jwt_secret, algorithms=[JWT_ALGORITHM])
        return uuid.UUID(payload["sub"])
    except (jwt.PyJWTError, KeyError, ValueError):
        return None


def set_auth_cookie(response: Response, user_id: uuid.UUID) -> None:
    secure = get_settings().cookie_secure
    response.set_cookie(
        AUTH_COOKIE,
        create_token(user_id),
        max_age=int(TOKEN_LIFETIME.total_seconds()),
        httponly=True,
        secure=secure,
        samesite="none" if secure else "lax",
        path="/",
    )


def clear_auth_cookie(response: Response) -> None:
    secure = get_settings().cookie_secure
    response.delete_cookie(
        AUTH_COOKIE, httponly=True, secure=secure, samesite="none" if secure else "lax", path="/"
    )
