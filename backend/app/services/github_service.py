"""
Reads public GitHub repositories for imports: metadata, languages, the file list, the README and
dependency files. File contents come from raw.githubusercontent.com, which doesn't count against
GitHub's API rate limit (60 requests an hour without a token, 5000 with GITHUB_TOKEN).
"""

import json
import logging
import re
from functools import lru_cache
from pathlib import PurePosixPath
from typing import Any
from urllib.parse import quote

import httpx

from app.config import get_settings

logger = logging.getLogger(__name__)

API = "https://api.github.com"
RAW = "https://raw.githubusercontent.com"
TIMEOUT_SECONDS = 15
MAX_FILES = 2000
MAX_FILE_BYTES = 400_000
MAX_README_CHARS = 20_000

SKIP_DIRS = {
    "node_modules", ".git", "dist", "build", ".next", "out", "vendor", "__pycache__", ".venv", "venv",
    "coverage", ".idea", ".vscode", ".turbo", ".cache", "target",
}
BINARY_EXTENSIONS = {
    ".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".bmp", ".svgz", ".pdf", ".zip", ".gz", ".tgz", ".tar",
    ".rar", ".7z", ".woff", ".woff2", ".ttf", ".otf", ".eot", ".mp3", ".mp4", ".mov", ".avi", ".wav", ".webm",
    ".exe", ".dll", ".so", ".dylib", ".jar", ".class", ".pyc", ".bin", ".psd", ".sqlite", ".db",
}

# Dependency name (lower case) -> what to call it.
STACK_DEPENDENCIES = {
    "next": "Next.js", "react": "React", "vue": "Vue", "svelte": "Svelte", "@angular/core": "Angular",
    "express": "Express", "@nestjs/core": "NestJS", "vite": "Vite", "tailwindcss": "Tailwind CSS",
    "typescript": "TypeScript", "prisma": "Prisma", "mongoose": "MongoDB (Mongoose)", "pg": "PostgreSQL",
    "fastapi": "FastAPI", "django": "Django", "flask": "Flask", "streamlit": "Streamlit",
    "sqlalchemy": "SQLAlchemy", "psycopg": "PostgreSQL", "psycopg2": "PostgreSQL", "psycopg2-binary": "PostgreSQL",
    "langchain": "LangChain", "langgraph": "LangGraph", "crewai": "CrewAI",
}
STACK_FILES = {
    "go.mod": "Go", "cargo.toml": "Rust", "pom.xml": "Java (Maven)", "build.gradle": "Java/Kotlin (Gradle)",
    "gemfile": "Ruby", "composer.json": "PHP", "dockerfile": "Docker", "docker-compose.yml": "Docker Compose",
}
INTEGRATION_DEPENDENCIES = {
    "stripe": "Stripe", "@slack/web-api": "Slack", "@slack/bolt": "Slack", "slack_sdk": "Slack", "slack-sdk": "Slack",
    "openai": "OpenAI", "anthropic": "Anthropic", "@anthropic-ai/sdk": "Anthropic", "twilio": "Twilio",
    "@sendgrid/mail": "SendGrid", "sendgrid": "SendGrid", "nodemailer": "Email", "resend": "Resend",
    "googleapis": "Google APIs", "firebase": "Firebase", "firebase-admin": "Firebase", "@supabase/supabase-js": "Supabase",
    "supabase": "Supabase", "aws-sdk": "AWS", "@aws-sdk/client-s3": "AWS S3", "boto3": "AWS", "@hubspot/api-client": "HubSpot",
    "discord.js": "Discord", "telegraf": "Telegram", "python-telegram-bot": "Telegram", "pinecone-client": "Pinecone",
}
AI_DEPENDENCIES = {"openai", "anthropic", "@anthropic-ai/sdk", "langchain", "langgraph", "crewai", "llama-index", "ai"}
PAGE_DIRS = {"pages", "app", "routes", "views", "screens", "templates"}
PAGE_EXTENSIONS = {".tsx", ".jsx", ".vue", ".svelte", ".html", ".astro"}


class GitHubError(Exception):
    def __init__(self, status: int, message: str):
        super().__init__(message)
        self.status = status
        self.message = message


REPO_PATTERN = re.compile(r"^(?:https?://)?(?:www\.)?(?:github\.com/)?([\w.-]+)/([\w.-]+?)(?:\.git)?/?$", re.IGNORECASE)


def parse_repo(value: str) -> tuple[str, str]:
    match = REPO_PATTERN.match(value.strip())
    if not match:
        raise GitHubError(400, "Paste a repository link like github.com/your-team/your-app.")
    return match.group(1), match.group(2)


def _headers(raw: bool = False) -> dict[str, str]:
    headers = {
        "Accept": "application/vnd.github.raw" if raw else "application/vnd.github+json",
        "User-Agent": "Architect-prototype",
    }
    token = get_settings().github_token
    if token:
        headers["Authorization"] = f"Bearer {token}"
    return headers


def _get(client: httpx.Client, url: str, owner: str, name: str, raw: bool = False, allow_missing: bool = False):
    try:
        response = client.get(url, headers=_headers(raw), follow_redirects=True, timeout=TIMEOUT_SECONDS)
    except httpx.HTTPError as error:
        logger.warning("GitHub request failed: %s", error)
        raise GitHubError(502, "Architect couldn't reach GitHub. Check your connection and try again.") from error
    if response.status_code == 404:
        if allow_missing:
            return None
        raise GitHubError(
            404,
            f"We couldn't find a public repository at github.com/{owner}/{name}. "
            "Check the link, or make the repository public.",
        )
    if response.status_code in (403, 429) and response.headers.get("x-ratelimit-remaining") == "0":
        raise GitHubError(429, "GitHub's limit for requests without a token was reached. Try again in about an hour.")
    if response.status_code >= 400:
        logger.warning("GitHub returned %s for %s", response.status_code, url)
        raise GitHubError(502, "GitHub didn't respond as expected. Please try again in a moment.")
    return response


def _raw_text(client: httpx.Client, owner: str, name: str, branch: str, path: str) -> str | None:
    url = f"{RAW}/{owner}/{name}/{quote(branch)}/{quote(path)}"
    try:
        response = client.get(url, headers={"User-Agent": "Architect-prototype"}, follow_redirects=True, timeout=TIMEOUT_SECONDS)
    except httpx.HTTPError:
        return None
    return response.text if response.status_code == 200 else None


def _keep(path: str) -> bool:
    return not any(part.lower() in SKIP_DIRS for part in path.split("/")[:-1])


def _dependencies(client: httpx.Client, owner: str, name: str, branch: str, paths: set[str]) -> set[str]:
    """Dependency names from package.json, requirements.txt and pyproject.toml (root and common subfolders)."""
    names: set[str] = set()
    for folder in ("", "frontend/", "backend/", "client/", "server/", "web/", "api/"):
        if f"{folder}package.json" in paths:
            text = _raw_text(client, owner, name, branch, f"{folder}package.json")
            try:
                data = json.loads(text or "{}")
                for key in ("dependencies", "devDependencies"):
                    names.update(k.lower() for k in (data.get(key) or {}))
            except (ValueError, AttributeError):
                pass
        if f"{folder}requirements.txt" in paths:
            for line in (_raw_text(client, owner, name, branch, f"{folder}requirements.txt") or "").splitlines():
                match = re.match(r"^\s*([A-Za-z0-9_.-]+)", line)
                if match and not line.strip().startswith("#"):
                    names.add(match.group(1).lower())
        if f"{folder}pyproject.toml" in paths:
            text = _raw_text(client, owner, name, branch, f"{folder}pyproject.toml") or ""
            names.update(m.lower() for m in re.findall(r'^\s*"?([A-Za-z0-9_.-]+)\s*[=<>~!"\[]', text, re.MULTILINE))
    return names


def _page_name(path: str) -> str | None:
    parts = PurePosixPath(path)
    if parts.suffix.lower() not in PAGE_EXTENSIONS:
        return None
    folders = [p.lower() for p in parts.parts[:-1]]
    if not any(folder in PAGE_DIRS for folder in folders):
        return None
    stem = parts.stem
    if stem.lower() in {"page", "index", "+page", "route"}:
        stem = parts.parent.name if parts.parent.name.lower() not in PAGE_DIRS else "Home"
    if stem.startswith(("_", "[", "(")) or stem.lower() in {"layout", "loading", "error", "not-found", "base", "head"}:
        return None
    words = re.sub(r"[-_]+", " ", re.sub(r"(?<=[a-z])(?=[A-Z])", " ", stem)).strip()
    return words[:1].upper() + words[1:] if words else None


def _readme_description(readme: str | None) -> str | None:
    if not readme:
        return None
    for block in re.split(r"\n\s*\n", readme):
        text = re.sub(r"<[^>]+>|!\[[^\]]*\]\([^)]*\)|\[([^\]]*)\]\([^)]*\)", r"\1", block).strip()
        if text and not text.startswith(("#", "=", "-", "|", "```")) and len(text) > 30:
            return re.sub(r"\s+", " ", text)[:300]
    return None


@lru_cache(maxsize=32)
def analyze(owner: str, name: str) -> dict[str, Any]:
    """Read a public repository and describe it. Cached, so importing right after the review costs nothing."""
    with httpx.Client() as client:
        repo = _get(client, f"{API}/repos/{owner}/{name}", owner, name).json()
        owner, name = repo["owner"]["login"], repo["name"]
        branch = repo.get("default_branch") or "main"
        languages: dict[str, int] = _get(client, f"{API}/repos/{owner}/{name}/languages", owner, name).json()
        tree = _get(client, f"{API}/repos/{owner}/{name}/git/trees/{quote(branch)}?recursive=1", owner, name).json()
        readme_response = _get(client, f"{API}/repos/{owner}/{name}/readme", owner, name, raw=True, allow_missing=True)
        readme = readme_response.text[:MAX_README_CHARS] if readme_response is not None else None

        blobs = [entry for entry in tree.get("tree", []) if entry.get("type") == "blob" and _keep(entry["path"])]
        truncated = bool(tree.get("truncated")) or len(blobs) > MAX_FILES
        files = [{"path": entry["path"], "size": entry.get("size", 0)} for entry in blobs[:MAX_FILES]]
        paths = {f["path"] for f in files}
        lower_names = {PurePosixPath(p).name.lower() for p in paths}
        dependencies = _dependencies(client, owner, name, branch, paths)

    stack = sorted({label for dep, label in STACK_DEPENDENCIES.items() if dep in dependencies}
                   | {label for file, label in STACK_FILES.items() if file in lower_names})
    if not stack and languages:
        stack = sorted(languages, key=languages.get, reverse=True)[:3]
    integrations = sorted({label for dep, label in INTEGRATION_DEPENDENCIES.items() if dep in dependencies})

    pages: list[str] = []
    for path in sorted(paths):
        page = _page_name(path)
        if page and page not in pages:
            pages.append(page)
    agent_files = [p for p in sorted(paths) if re.search(r"(^|/)(agents?/[^/]+|[^/]*agent[^/]*)\.(py|ts|js)$", p, re.IGNORECASE)]
    agents = []
    for path in agent_files[:3]:
        stem = re.sub(r"[-_]+", " ", PurePosixPath(path).stem).strip()
        label = stem[:1].upper() + stem[1:]
        agents.append({"name": label if "agent" in label.lower() else f"{label} agent", "role": f"Defined in {path}"})

    total_bytes = sum(languages.values()) or 1
    ranked = sorted(languages.items(), key=lambda item: item[1], reverse=True)
    language_shares = [{"name": lang, "share": round(size * 100 / total_bytes)} for lang, size in ranked[:3]]
    other = 100 - sum(item["share"] for item in language_shares)
    if len(ranked) > 3 and other > 0:
        language_shares.append({"name": "Other", "share": other})

    description = repo.get("description") or _readme_description(readme) or f"a {', '.join(stack[:2]) or 'software'} project"
    notes = [{"tone": "info", "text": f"Read {len(files)} files from the {branch} branch of github.com/{owner}/{name}."}]
    if truncated:
        notes.append({"tone": "warn", "text": f"This repository is large, so only the first {MAX_FILES} files are included."})
    if not readme:
        notes.append({"tone": "info", "text": "There's no README, so this summary is based on the code and its dependencies."})
    if dependencies & AI_DEPENDENCIES:
        notes.append({"tone": "info", "text": "It already uses AI libraries, so Architect can build on its existing agent code."})
    notes.append({"tone": "info", "text": "Your real code will be in the Code tab. In this prototype the preview is still an example app."})

    return {
        "source": {
            "type": "github",
            "owner": owner,
            "name": name,
            "branch": branch,
            "url": repo.get("html_url") or f"https://github.com/{owner}/{name}",
            "files": files,
            "truncated": truncated,
        },
        "summary": {
            "description": description.rstrip("."),
            "pages": pages[:6],
            "agents": agents,
            "integrations": integrations,
            "stack": stack,
            "files": len(files),
            "languages": language_shares,
            "notes": notes,
            "readme_excerpt": (readme or "")[:3000],
        },
    }


def refresh(owner: str, name: str) -> dict[str, Any]:
    """Read the repository again from GitHub, ignoring anything cached (for "Pull latest")."""
    analyze.cache_clear()
    file_content.cache_clear()
    return analyze(owner, name)


def is_binary(path: str) -> bool:
    return PurePosixPath(path).suffix.lower() in BINARY_EXTENSIONS


@lru_cache(maxsize=256)
def file_content(owner: str, name: str, branch: str, path: str) -> dict[str, Any]:
    """One file's text, fetched from raw.githubusercontent.com (not rate limited like the API)."""
    if is_binary(path):
        return {"path": path, "content": "", "binary": True, "truncated": False}
    url = f"{RAW}/{owner}/{name}/{quote(branch)}/{quote(path)}"
    try:
        with httpx.Client() as client:
            response = client.get(url, headers={"User-Agent": "Architect-prototype"}, follow_redirects=True, timeout=TIMEOUT_SECONDS)
    except httpx.HTTPError as error:
        raise GitHubError(502, "Architect couldn't reach GitHub to open this file. Please try again.") from error
    if response.status_code != 200:
        raise GitHubError(404 if response.status_code == 404 else 502, "This file couldn't be opened from GitHub.")
    data = response.content
    if b"\x00" in data[:8000]:
        return {"path": path, "content": "", "binary": True, "truncated": False}
    truncated = len(data) > MAX_FILE_BYTES
    return {
        "path": path,
        "content": data[:MAX_FILE_BYTES].decode("utf-8", errors="replace"),
        "binary": False,
        "truncated": truncated,
    }
