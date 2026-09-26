from fastapi import Depends, FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.config import get_settings
from app.deps import get_db
from app.routers import auth, build, chat, checkpoints, plans, projects, usage

settings = get_settings()

app = FastAPI(title="Architect API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,  # needed for the httpOnly auth cookie
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(chat.router)
app.include_router(plans.router)
app.include_router(build.router)
app.include_router(checkpoints.router)
app.include_router(usage.router)


def _describe_validation_error(error: dict) -> str:
    field = str(error["loc"][-1]) if error.get("loc") else "request"
    if field == "email":
        return "Enter a valid email address."
    if field == "password" and error.get("type") == "string_too_short":
        return "Use at least 8 characters for your password."
    if field == "name":
        return "Enter a name."
    if field == "content":
        return "Write a message before sending."
    if field == "feedback":
        return "Tell Architect what to change in the plan."
    if field == "prompt":
        return "Describe your app in a few more words so Architect can plan it."
    return f"Check the {field} field: {error.get('msg', 'invalid value')}."


@app.exception_handler(RequestValidationError)
def validation_error_handler(_: Request, exc: RequestValidationError) -> JSONResponse:
    """Return one plain-language message instead of FastAPI's list of errors."""
    errors = exc.errors()
    detail = _describe_validation_error(errors[0]) if errors else "The request was not valid."
    return JSONResponse(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, content={"detail": detail})


@app.get("/api/health")
def health(db: Session = Depends(get_db)) -> dict[str, str]:
    db.execute(text("SELECT 1"))
    return {"status": "ok", "database": "ok"}
