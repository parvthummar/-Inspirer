from typing import Literal

from pydantic import BaseModel

from app.schemas.project import SourceOut


class RepoFile(BaseModel):
    path: str
    size: int


class Language(BaseModel):
    name: str
    share: int


class Note(BaseModel):
    tone: Literal["info", "warn"]
    text: str


class Agent(BaseModel):
    name: str
    role: str


class RepoSummary(BaseModel):
    description: str
    pages: list[str]
    agents: list[Agent]
    integrations: list[str]
    stack: list[str]
    files: int
    languages: list[Language]
    notes: list[Note]
    readme_excerpt: str


class RepoAnalysis(BaseModel):
    source: SourceOut
    summary: RepoSummary


class ProjectFiles(BaseModel):
    repository: SourceOut
    files: list[RepoFile]
    truncated: bool


class PullResult(ProjectFiles):
    added: int
    removed: int
    changed: int


class FileContent(BaseModel):
    path: str
    content: str
    binary: bool
    truncated: bool
