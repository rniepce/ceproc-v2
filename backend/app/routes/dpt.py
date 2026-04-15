"""DPT (Process Description) extraction routes."""
import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from ..services.llm_service import get_llm_service
from ..models import DPTSchema

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/dpt", tags=["dpt"])


class DPTExtractionRequest(BaseModel):
    """Request model for DPT extraction."""
    interview_text: str
    process_name: Optional[str] = None
    analyst: Optional[str] = None
    department: Optional[str] = None
    date: Optional[str] = None


class DPTExtractionResponse(BaseModel):
    """Response model for DPT extraction."""
    status: str
    dpt: dict
    validation: dict
    message: str


@router.post("", response_model=DPTExtractionResponse)
async def extract_dpt(request: DPTExtractionRequest):
    """
    Extract DPT (Descrição de Processo e Tarefas) from interview text.

    This endpoint:
    1. Takes raw interview/meeting text
    2. Uses Azure OpenAI to analyze and structure the information
    3. Validates against the DPT schema
    4. Returns structured process description

    Args:
        request: DPTExtractionRequest with interview text and metadata

    Returns:
        DPTExtractionResponse with extracted DPT structure
    """
    logger.info(f"DPT extraction requested for: {request.process_name or 'unnamed process'}")

    if not request.interview_text or not request.interview_text.strip():
        raise HTTPException(
            status_code=400,
            detail="Interview text is required"
        )

    if len(request.interview_text) < 100:
        raise HTTPException(
            status_code=400,
            detail="Interview text too short (minimum 100 characters)"
        )

    if len(request.interview_text) > 100000:
        raise HTTPException(
            status_code=413,
            detail="Interview text too long (maximum 100,000 characters)"
        )

    try:
        llm_service = get_llm_service()

        # Prepare context
        context = {}
        if request.process_name:
            context["processo"] = request.process_name
        if request.analyst:
            context["analista"] = request.analyst
        if request.department:
            context["departamento"] = request.department
        if request.date:
            context["data_analise"] = request.date

        # Extract DPT from interview text
        dpt = llm_service.extract_dpt(request.interview_text, context)

        # Validate DPT structure
        validation_errors = []
        required_fields = [
            "metadados", "negocio", "finalidade", "conceitos",
            "clientes", "normas", "entradas", "etapas", "saidas",
            "atores", "sistemas", "expectativas", "documentos",
            "indicadores", "pontos_sensiveis"
        ]

        for field in required_fields:
            if field not in dpt:
                validation_errors.append(f"Missing field: {field}")

        validation_status = "passed" if not validation_errors else "partial"

        logger.info(f"DPT extraction completed: {validation_status}")

        return DPTExtractionResponse(
            status="success",
            dpt=dpt,
            validation={
                "status": validation_status,
                "errors": validation_errors,
                "fields_present": len([f for f in required_fields if f in dpt]),
                "fields_total": len(required_fields)
            },
            message=f"DPT extracted successfully ({validation_status} validation)"
        )

    except Exception as e:
        logger.error(f"Error extracting DPT: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"DPT extraction failed: {str(e)}"
        )


@router.get("/{dpt_id}")
async def get_dpt(dpt_id: str):
    """
    Retrieve a previously extracted DPT.

    Args:
        dpt_id: ID of the DPT to retrieve

    Returns:
        Stored DPT data with metadata
    """
    logger.info(f"Retrieving DPT: {dpt_id}")

    # TODO: Implement database retrieval
    raise HTTPException(
        status_code=501,
        detail="Database storage not yet implemented"
    )


@router.put("/{dpt_id}")
async def update_dpt(dpt_id: str, dpt_update: dict):
    """
    Update a DPT with corrections or additional information.

    Args:
        dpt_id: ID of the DPT to update
        dpt_update: Dictionary with updates

    Returns:
        Updated DPT data
    """
    logger.info(f"Updating DPT: {dpt_id}")

    # TODO: Implement database update
    raise HTTPException(
        status_code=501,
        detail="Database storage not yet implemented"
    )


@router.post("/validate")
async def validate_dpt(dpt: dict):
    """
    Validate a DPT structure without saving.

    Args:
        dpt: DPT dictionary to validate

    Returns:
        Validation results with errors and warnings
    """
    logger.info("Validating DPT structure")

    required_fields = [
        "metadados", "negocio", "finalidade", "conceitos",
        "clientes", "normas", "entradas", "etapas", "saidas",
        "atores", "sistemas", "expectativas", "documentos",
        "indicadores", "pontos_sensiveis"
    ]

    errors = []
    warnings = []

    # Check required fields
    for field in required_fields:
        if field not in dpt:
            errors.append(f"Missing required field: {field}")

    # Check content of specific fields
    if dpt.get("etapas") and not isinstance(dpt["etapas"], list):
        errors.append("'etapas' must be a list")

    if dpt.get("atores") and not isinstance(dpt["atores"], list):
        errors.append("'atores' must be a list")

    if dpt.get("sistemas") and not isinstance(dpt["sistemas"], list):
        errors.append("'sistemas' must be a list")

    is_valid = len(errors) == 0

    return {
        "status": "valid" if is_valid else "invalid",
        "is_valid": is_valid,
        "errors": errors,
        "warnings": warnings,
        "fields_present": len([f for f in required_fields if f in dpt]),
        "fields_total": len(required_fields)
    }
