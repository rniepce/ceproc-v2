"""
CEPROC V2 — API Principal
Sistema inteligente para mapeamento de processos com IA
"""

from fastapi import FastAPI, HTTPException, File, UploadFile, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from contextlib import asynccontextmanager
import logging
from datetime import datetime
from pathlib import Path

from app.config import settings
from app.models import (
    TranscriptionRequest, TranscriptionResponse,
    DPTRequest, DPTResponse, DPTSchema,
    BPMNRequest, BPMNResponse,
    KPIRequest, KPIResponse,
    HealthCheckResponse, APIResponse
)

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

# ============= ROUTES =============

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


@app.post("/api/transcribe", response_model=TranscriptionResponse)
async def transcribe_audio(request: TranscriptionRequest):
    """
    Transcreve áudio para texto
    Modo 1: Envio de arquivo áudio → Whisper
    Modo 2: Texto direto (já transcrito)
    """
    if request.mode == "text" and request.text:
        return TranscriptionResponse(
            transcription=request.text,
            duration_seconds=request.audio_duration_seconds,
            confidence=1.0,
            timestamp=datetime.now()
        )

    raise HTTPException(status_code=400, detail="Invalid request")


@app.post("/api/dpt", response_model=DPTResponse)
async def analyze_dpt(request: DPTRequest):
    """
    Analisa transcrição/texto e gera JSON DPT estruturado
    Usa: prompt_dpt.md + LLM
    """
    try:
        logger.info(f"📋 Analyzing text for DPT... ({len(request.transcription)} chars)")

        # TODO: Chamar LLM service com prompt_dpt.md
        # dpt_json = await llm_service.generate_dpt(request.transcription)

        # Placeholder response
        dpt_json = DPTSchema(
            metadados={
                "nome_processo": "Processamento do Sinistro",
                "nome_unidade": "COTRANS",
                "elaborado_por": "Sistema CEPROC V2",
                "descricao": "Processamento de sinistros veiculares",
                "versao": "v1"
            },
            negocio={
                "descricao": "Gestão centralizada de sinistros",
                "lista": ["Eficiência", "Confiabilidade"]
            },
            finalidade={
                "descricao": "Documentar e processar sinistros",
                "lista": ["Rastreabilidade", "Controle"]
            },
            principais_etapas=[
                {
                    "id": "etapa_1",
                    "etapa": "Documentar danos",
                    "responsavel": "Motorista",
                    "tempo_estimado": "30 min",
                    "criticidade": "Alta"
                }
            ],
            atores={
                "descricao": "Participantes do processo",
                "lista": ["Motorista", "Setor Sinistros", "Oficina"]
            }
        )

        return DPTResponse(
            success=True,
            dpt_json=dpt_json,
            version="v1",
            timestamp=datetime.now()
        )
    except Exception as e:
        logger.error(f"❌ Error in DPT analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/bpmn", response_model=BPMNResponse)
async def generate_bpmn(request: BPMNRequest):
    """
    Gera BPMN JSON otimizado a partir de DPT
    Usa: prompt_dpt_to_bpmn_json.md + LLM
    Output: JSON com coordenadas + XML BPMN 2.0
    """
    try:
        logger.info(f"📊 Generating BPMN from DPT...")

        # TODO: Chamar LLM service com prompt_dpt_to_bpmn_json.md
        # bpmn_json = await llm_service.generate_bpmn(request.dpt_json)
        # bpmn_xml = await bpmn_service.generate_xml(bpmn_json)

        # Placeholder
        bpmn_xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<bpmn2:definitions xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL"
                   id="Definitions" targetNamespace="http://example.org">
  <!-- BPMN XML gerado automaticamente -->
</bpmn2:definitions>"""

        return BPMNResponse(
            success=True,
            bpmn_json={
                "metadata": {
                    "processo": request.dpt_json.metadados.nome_processo,
                    "versao": "v1",
                    "unidade": request.dpt_json.metadados.nome_unidade
                },
                "lanes": [],
                "events": [],
                "activities": [],
                "sequence_flows": []
            },
            bpmn_xml=bpmn_xml,
            version="v1",
            timestamp=datetime.now()
        )
    except Exception as e:
        logger.error(f"❌ Error in BPMN generation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/kpi", response_model=KPIResponse)
async def generate_kpi(request: KPIRequest):
    """
    Gera proposta de indicadores (KPI) a partir de DPT
    Usa: prompt_kpi_generation.md + LLM
    """
    try:
        logger.info(f"📈 Generating KPIs from DPT...")

        # TODO: Chamar LLM service com prompt_kpi_generation.md
        # kpis = await llm_service.generate_kpis(request.dpt_json)

        # Placeholder
        kpis = []

        return KPIResponse(
            success=True,
            kpis=kpis,
            total_count=len(kpis),
            alta_criticidade=0,
            timestamp=datetime.now()
        )
    except Exception as e:
        logger.error(f"❌ Error in KPI generation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/export/{format}")
async def export_file(format: str, dpt_id: str, version: str = "v1"):
    """
    Exporta artefatos em diferentes formatos
    Formatos: docx, xlsx, bpmn, zip
    """
    try:
        logger.info(f"💾 Exporting {format.upper()} for DPT {dpt_id} v{version}...")

        # TODO: Implementar lógica de export
        # if format == "docx":
        #     file = await export_service.generate_docx(dpt_id, version)
        # elif format == "xlsx":
        #     file = await export_service.generate_xlsx(dpt_id, version)
        # ... etc

        raise HTTPException(status_code=501, detail=f"Export format {format} not implemented yet")
    except Exception as e:
        logger.error(f"❌ Error in export: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


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
