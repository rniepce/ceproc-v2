import os
from pathlib import Path
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """Application configuration"""

    # Azure OpenAI
    AZURE_OPENAI_KEY: str = os.getenv("AZURE_OPENAI_KEY", "")
    AZURE_OPENAI_ENDPOINT: str = os.getenv("AZURE_OPENAI_ENDPOINT", "")
    AZURE_OPENAI_DEPLOYMENT: str = os.getenv("AZURE_OPENAI_DEPLOYMENT", "gpt-4")
    AZURE_OPENAI_API_VERSION: str = "2024-02-15-preview"

    # Whisper (transcrição)
    WHISPER_MODEL: str = "whisper-1"

    # App
    APP_NAME: str = "CEPROC V2"
    APP_VERSION: str = "2.0.0"
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"

    # CORS
    ALLOWED_ORIGINS: list = ["*"]

    # Database (opcional, para MVP usar SQLite)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./ceproc.db")

    # Paths
    BASE_DIR: Path = Path(__file__).parent.parent.parent
    PROMPTS_DIR: Path = Path(__file__).parent / "prompts"
    TEMP_DIR: Path = BASE_DIR / "temp"

    # Limits
    MAX_AUDIO_SIZE_MB: int = 100
    MAX_TEXT_LENGTH: int = 50000

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()

# Ensure temp directory exists
settings.TEMP_DIR.mkdir(exist_ok=True)
