from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/kanachakumb"
    SECRET_KEY: str = "CHANGE_THIS_SECRET_KEY_IN_PRODUCTION_MAKE_IT_VERY_LONG_AND_RANDOM"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_DAYS: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 365

    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""

    APPLE_CLIENT_ID: str = ""
    APPLE_TEAM_ID: str = ""
    APPLE_KEY_ID: str = ""
    APPLE_PRIVATE_KEY: str = ""

    FRONTEND_URL: str = "http://localhost:5173"
    BACKEND_URL: str = "http://localhost:8000"

    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""

    BASIC_PLAN_PRICE_AMD: int = 40000
    PREMIUM_PLAN_PRICE_AMD: int = 55000

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
