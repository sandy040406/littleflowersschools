"""
Little Flowers Schools — Backend Configuration
Loads settings from .env file using pydantic-settings.
"""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # "development" (local) or "production" (live). Production turns on strict checks.
    ENVIRONMENT: str = "development"

    # Database
    DATABASE_URL: str = "sqlite:///./app.db"

    # JWT
    SECRET_KEY: str = "change-me"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Admin seed
    ADMIN_EMAIL: str = "admin@littleflowersschools.com"
    ADMIN_PASSWORD: str = "admin123"

    # Uploads
    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE_MB: int = 10
    MAX_VIDEO_SIZE_MB: int = 200

    # Cloudflare R2 (optional, filled in later)
    R2_ACCOUNT_ID: str = ""
    R2_ACCESS_KEY_ID: str = ""
    R2_SECRET_ACCESS_KEY: str = ""
    R2_BUCKET_NAME: str = ""
    R2_PUBLIC_URL: str = ""

    # CORS
    FRONTEND_URL: str = "http://localhost:3000"
    # Extra allowed origins, comma-separated (e.g. "https://www.littleflowersschools.com")
    CORS_ORIGINS: str = ""

    # Rate limiting
    # Set TRUST_PROXY_HEADERS=true only when running behind a reverse proxy
    # (e.g. Render) that appends the real client IP to X-Forwarded-For.
    TRUST_PROXY_HEADERS: bool = False
    ENQUIRY_RATE_LIMIT: int = 10           # submissions allowed per window, per IP
    ENQUIRY_RATE_WINDOW_SECONDS: int = 300  # 5 minutes
    # Login attempts per IP per window. Generous because many families may share
    # one school/office Wi-Fi address, but it still stops password guessing.
    LOGIN_RATE_LIMIT: int = 30
    LOGIN_RATE_WINDOW_SECONDS: int = 300

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() == "production"

    @property
    def allowed_origins(self) -> list[str]:
        """Origins allowed by CORS. localhost is only allowed outside production."""
        origins = [self.FRONTEND_URL.rstrip("/")]
        origins += [o.strip().rstrip("/") for o in self.CORS_ORIGINS.split(",") if o.strip()]
        if not self.is_production:
            origins += ["http://localhost:3000", "http://localhost:3001"]
        return list(dict.fromkeys(origins))  # de-duplicate, keep order

    def validate_for_production(self) -> None:
        """Raise if production is configured with unsafe defaults. No-op in development."""
        if not self.is_production:
            return
        problems = []
        if self.SECRET_KEY in ("change-me", "change-me-to-a-random-secret-string") or len(self.SECRET_KEY) < 32:
            problems.append("SECRET_KEY must be a random string of at least 32 characters")
        if self.ADMIN_PASSWORD == "admin123" or len(self.ADMIN_PASSWORD) < 10:
            problems.append("ADMIN_PASSWORD must not be the default and must be at least 10 characters")
        if self.FRONTEND_URL.startswith("http://localhost"):
            problems.append("FRONTEND_URL must be your real https website address")
        if problems:
            raise RuntimeError("Unsafe production configuration:\n - " + "\n - ".join(problems))

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }


@lru_cache()
def get_settings() -> Settings:
    return Settings()
