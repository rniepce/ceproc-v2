"""
CEPROC V2 — API Principal
Sistema inteligente para mapeamento de processos com IA
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import logging
from datetime import datetime
from pathlib import Path

from app.config import settings
from app.models import HealthCheckResponse

# Import route modules
from app.routes import transcription, dpt, bpmn, kpi, gargalos, export

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============= LIFESPAN =============
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown"""
    logger.info(f"🚀 {settings.APP_NAME} v{settings.APP_VERSION} starting...")
    yield
    logger.info("⛔ Application shutting down...")

# ============= APP INIT =============
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Plataforma inteligente para mapeamento de processos com IA",
    lifespan=lifespan
)

# ============= CORS =============
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============= ROUTE REGISTRATION =============
app.include_router(transcription.router)
app.include_router(dpt.router)
app.include_router(bpmn.router)
app.include_router(kpi.router)
app.include_router(gargalos.router)
app.include_router(export.router)

# ============= CORE ROUTES =============

@app.get("/api/health", response_model=HealthCheckResponse)
async def health_check():
    """Health check endpoint"""
    return HealthCheckResponse(
        status="ok",
        app_name=settings.APP_NAME,
        version=settings.APP_VERSION,
        llm_connected=bool(settings.AZURE_OPENAI_KEY),
        database_connected=True,
        timestamp=datetime.now()
    )


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "docs": "/docs",
        "api": "/api"
    }


@app.get("/api")
async def api_root():
    """API endpoints root"""
    return {
        "endpoints": {
            "health": "GET /api/health",
            "transcribe": "POST /api/transcribe",
            "dpt": "POST /api/dpt",
            "bpmn": "POST /api/bpmn",
            "kpi": "POST /api/kpi",
            "export": "POST /api/export/{format}"
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
