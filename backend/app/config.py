from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str
    GEMINI_API_KEY: str
    DEEPSEEK_API_KEY: str = ""
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    ENVIRONMENT: str = "development"
    CORS_ORIGINS: str = "http://localhost:5500"
    ADMIN_EMAILS: str = ""
    FRONTEND_URL: str = "http://127.0.0.1:5500"
    model_config = SettingsConfigDict(
        env_file=str(Path(__file__).resolve().parents[1] / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def admin_emails_list(self) -> set[str]:
        return {email.strip().casefold() for email in self.ADMIN_EMAILS.split(",") if email.strip()}

settings = Settings()
