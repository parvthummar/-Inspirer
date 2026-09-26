import re
import uuid

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Message, Project, User
from app.schemas.project import ProjectUpdate
from app.services import build_simulator, checkpoint_service

MAX_NAME_LENGTH = 60
_FILLER = re.compile(
    r"^(please\s+)?(i\s+(want|need|would like)\s+(to\s+build\s+)?|build\s+(me\s+)?|create\s+|make\s+)?(an?\s+)?",
    re.IGNORECASE,
)

_TRAILING_FILLER = {"a", "an", "the", "and", "or", "to", "in", "on", "of", "for", "with", "from", "that", "which", "by"}


def draft_name_from_prompt(prompt: str) -> str:
    """A readable working name taken from the prompt. Replaced by the AI-suggested name once planning runs."""
    first_sentence = re.split(r"[.\n!?]", prompt.strip(), maxsplit=1)[0]
    words = _FILLER.sub("", first_sentence).split()
    name = ""
    for word in words:
        if len(name) + len(word) + 1 > MAX_NAME_LENGTH:
            break
        name = f"{name} {word}".strip()
    # Don't end a shortened name on a filler word ("...puts totals in a").
    words_in_name = name.rstrip(",;:").split()
    while len(words_in_name) > 1 and words_in_name[-1].lower() in _TRAILING_FILLER:
        words_in_name.pop()
    name = " ".join(words_in_name).rstrip(",;:")
    return name[:1].upper() + name[1:] if name else "Untitled project"


def list_projects(db: Session, user: User) -> list[Project]:
    query = select(Project).where(Project.user_id == user.id).order_by(Project.updated_at.desc())
    projects = list(db.scalars(query))
    for project in projects:
        build_simulator.finish_if_done(db, project)
    return projects


def get_project(db: Session, user: User, project_id: uuid.UUID) -> Project:
    """Load a project owned by this user. Other users' projects look exactly like missing ones."""
    project = db.scalar(select(Project).where(Project.id == project_id, Project.user_id == user.id))
    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="We couldn't find that project. It may have been deleted.",
        )
    build_simulator.finish_if_done(db, project)
    return project


def create_project(db: Session, user: User, prompt: str, source: dict | None = None) -> Project:
    """Create a project. `source` is set for imports (e.g. the GitHub repository and its file list)."""
    prompt = prompt.strip()
    project = Project(
        user_id=user.id,
        name=draft_name_from_prompt(prompt),
        initial_prompt=prompt,
        status="planning",  # the plan is written in the background right after creation
        source=source,
    )
    # The prompt is the first message of the project's chat, and the earliest checkpoint.
    first_message = Message(role="user", content=prompt)
    project.messages.append(first_message)
    db.add(project)
    checkpoint_service.record(db, project, first_message)
    db.commit()
    db.refresh(project)
    return project


def update_project(db: Session, project: Project, changes: ProjectUpdate) -> Project:
    if changes.name is not None:
        project.name = changes.name.strip()
    if changes.view_mode is not None:
        project.view_mode = changes.view_mode
    db.commit()
    db.refresh(project)
    return project


def delete_project(db: Session, project: Project) -> None:
    db.delete(project)
    db.commit()
