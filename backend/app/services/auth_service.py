import logging
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


class GoogleOnlyAccountError(Exception):
    """The account was created with Google and has no password."""


class GoogleTokenError(Exception):
    pass


logger = logging.getLogger(__name__)

GOOGLE_ISSUERS = ["accounts.google.com", "https://accounts.google.com"]
# Tolerate clocks that are a little off (this machine runs ~15 s behind), or fresh tokens look "not yet valid".
GOOGLE_CLOCK_LEEWAY_SECONDS = 120
_google_keys = jwt.PyJWKClient("https://www.googleapis.com/oauth2/v3/certs", cache_keys=True)


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
    if user is not None and user.password_hash is None:
        raise GoogleOnlyAccountError
    if user is None or not verify_password(password, user.password_hash):
        return None
    return user


def verify_google_credential(credential: str) -> dict:
    """Check a Google ID token's signature, audience, issuer and expiry. Returns its claims."""
    client_id = get_settings().google_client_id
    if not client_id:
        raise GoogleTokenError("Google sign-in isn't set up on this server.")
    try:
        key = _google_keys.get_signing_key_from_jwt(credential)
        claims = jwt.decode(
            credential,
            key.key,
            algorithms=["RS256"],
            audience=client_id,
            issuer=GOOGLE_ISSUERS,
            leeway=GOOGLE_CLOCK_LEEWAY_SECONDS,
        )
    except jwt.PyJWTError as error:
        logger.warning("Google sign-in rejected: %s: %s", type(error).__name__, error)
        raise GoogleTokenError("Google couldn't confirm who you are. Please try again.") from error
    if not claims.get("email") or not claims.get("email_verified"):
        raise GoogleTokenError("Your Google account's email address isn't verified yet.")
    return claims


def login_with_google(db: Session, credential: str) -> User:
    """Log in with Google, creating the account the first time. A matching email account is reused."""
    claims = verify_google_credential(credential)
    email = normalize_email(claims["email"])
    user = db.scalar(select(User).where(User.email == email))
    if user is None:
        name = (claims.get("name") or email.split("@")[0]).strip()[:120]
        user = User(email=email, name=name, password_hash=None, auth_provider="google")
        db.add(user)
        db.commit()
    return user


def update_name(db: Session, user: User, name: str) -> User:
    user.name = name.strip()
    db.commit()
    db.refresh(user)
    return user


def change_password(db: Session, user: User, current_password: str, new_password: str) -> bool:
    """Returns False when the current password is wrong."""
    if not verify_password(current_password, user.password_hash):
        return False
    user.password_hash = hash_password(new_password)
    db.commit()
    return True


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
