from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Settings loaded from environment variables (and backend/.env)."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+psycopg://architect:architect@localhost:5432/architect"
    jwt_secret: str = "change-me"
    openai_api_key: str = ""
    openai_model: str = ""
    frontend_origin: str = "http://localhost:5173"
    # Set to true in production, where frontend and backend live on different domains
    # and the auth cookie must be sent cross-site (SameSite=None requires Secure).
    cookie_secure: bool = False


@lru_cache
def get_settings() -> Settings:
    return Settings()
