import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.deps import get_current_user, get_db
from app.models import User
from app.schemas.github import FileContent, ProjectFiles, PullResult, RepoAnalysis
from app.services import github_service, project_service
from app.services.github_service import GitHubError

router = APIRouter(prefix="/api", tags=["github"])


def _raise(error: GitHubError) -> HTTPException:
    return HTTPException(status_code=error.status, detail=error.message)


@router.get("/github/analyze", response_model=RepoAnalysis)
def analyze_repository(repo: str = Query(min_length=3, max_length=300), user: User = Depends(get_current_user)) -> dict:
    """Read a public repository for the import review: what it is, its stack, pages and services."""
    try:
        owner, name = github_service.parse_repo(repo)
        return github_service.analyze(owner, name)
    except GitHubError as error:
        raise _raise(error)


def _github_source(db: Session, user: User, project_id: uuid.UUID) -> dict:
    project = project_service.get_project(db, user, project_id)
    if not project.source or project.source.get("type") != "github":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="This project wasn't imported from GitHub.")
    return project.source


@router.get("/projects/{project_id}/files", response_model=ProjectFiles)
def list_files(project_id: uuid.UUID, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    """The imported repository's files."""
    source = _github_source(db, user, project_id)
    return {"repository": source, "files": source.get("files", []), "truncated": source.get("truncated", False)}


@router.post("/projects/{project_id}/files/pull", response_model=PullResult)
def pull_latest(project_id: uuid.UUID, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    """Read the imported repository again from GitHub and update the project's file list."""
    project = project_service.get_project(db, user, project_id)
    source = _github_source(db, user, project_id)
    try:
        fresh = github_service.refresh(source["owner"], source["name"])["source"]
    except GitHubError as error:
        raise _raise(error)
    before = {f["path"]: f["size"] for f in source.get("files", [])}
    after = {f["path"]: f["size"] for f in fresh["files"]}
    project.source = fresh
    db.commit()
    return {
        "repository": fresh,
        "files": fresh["files"],
        "truncated": fresh.get("truncated", False),
        "added": len(after.keys() - before.keys()),
        "removed": len(before.keys() - after.keys()),
        "changed": sum(1 for path in after.keys() & before.keys() if after[path] != before[path]),
    }


@router.get("/projects/{project_id}/files/content", response_model=FileContent)
def file_content(
    project_id: uuid.UUID,
    path: str = Query(min_length=1, max_length=1000),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    """One file from the imported repository. Only files from the imported file list can be opened."""
    source = _github_source(db, user, project_id)
    if path not in {f["path"] for f in source.get("files", [])}:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="That file isn't part of this project.")
    try:
        return github_service.file_content(source["owner"], source["name"], source["branch"], path)
    except GitHubError as error:
        raise _raise(error)
