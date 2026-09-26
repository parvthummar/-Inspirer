from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Settings loaded from environment variables (and backend/.env)."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+psycopg://architect:architect@localhost:5432/architect"
    jwt_secret: str = "change-me"
    openai_api_key: str = ""
    openai_model: str = ""
    # Where the frontend runs. Several origins can be given, separated by commas.
    frontend_origin: str = "http://localhost:5173"
    # Set to true in production (HTTPS). The cookie is then Secure and SameSite=None, so it also
    # works if the frontend calls the backend directly instead of through Vercel's /api proxy.
    cookie_secure: bool = False
    # OAuth client ID for "Continue with Google". Empty turns Google sign-in off.
    google_client_id: str = ""
    # Optional. Raises GitHub's limit for reading public repositories from 60 to 5000 requests an hour.
    github_token: str = ""

    @field_validator("database_url")
    @classmethod
    def use_psycopg_driver(cls, url: str) -> str:
        """Accept the URL exactly as Neon (or Render, Supabase...) gives it: postgres:// or postgresql://."""
        for prefix in ("postgres://", "postgresql://"):
            if url.startswith(prefix):
                return "postgresql+psycopg://" + url[len(prefix) :]
        return url

    @property
    def frontend_origins(self) -> list[str]:
        return [origin.strip().rstrip("/") for origin in self.frontend_origin.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
