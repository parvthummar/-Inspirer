from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.deps import get_current_user, get_db
from app.models import User
from app.schemas.auth import GoogleLoginRequest, LoginRequest, PasswordChange, ProfileUpdate, SignupRequest, UserOut
from app.services import auth_service

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/signup", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def signup(body: SignupRequest, response: Response, db: Session = Depends(get_db)) -> User:
    try:
        user = auth_service.create_user(db, body.name, body.email, body.password)
    except auth_service.EmailTakenError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists. Try logging in instead.",
        )
    auth_service.set_auth_cookie(response, user.id)
    return user


@router.post("/login", response_model=UserOut)
def login(body: LoginRequest, response: Response, db: Session = Depends(get_db)) -> User:
    try:
        user = auth_service.authenticate(db, body.email, body.password)
    except auth_service.GoogleOnlyAccountError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="This account signs in with Google. Use Continue with Google instead.",
        )
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="That email and password don't match. Check them and try again.",
        )
    auth_service.set_auth_cookie(response, user.id)
    return user


@router.post("/google", response_model=UserOut)
def login_with_google(body: GoogleLoginRequest, response: Response, db: Session = Depends(get_db)) -> User:
    """Sign in or sign up with a Google ID token from the "Continue with Google" button."""
    try:
        user = auth_service.login_with_google(db, body.credential)
    except auth_service.GoogleTokenError as error:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(error))
    auth_service.set_auth_cookie(response, user.id)
    return user


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(response: Response) -> None:
    auth_service.clear_auth_cookie(response)


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)) -> User:
    return user


@router.patch("/me", response_model=UserOut)
def update_me(body: ProfileUpdate, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> User:
    return auth_service.update_name(db, user, body.name)


@router.post("/password", status_code=status.HTTP_204_NO_CONTENT)
def change_password(
    body: PasswordChange, user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> None:
    if not auth_service.change_password(db, user, body.current_password, body.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Your current password isn't right. Check it and try again.",
        )
