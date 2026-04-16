"""KPI generation routes."""
import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List, Any, Dict
from ..services.llm_service import get_llm_service
from ..models import KPISchema

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/kpi", tags=["kpi"])


class KPIValidationRequest(BaseModel):
    """KPI data for validation"""
    indicador: str
    objetivo: str
    processo: str
    cliente: str
    metadados: str
    fonte_extracao: str
    formula_calculo: str
    unidade: str
    filtro: str
    meta: str
    periodicidade: str
    polaridade: str
    responsavel: str
    criticidade: str
    justificativa: str


class KPIGenerationRequest(BaseModel):
    """Request model for KPI generation."""
    dpt: dict
    process_name: Optional[str] = None
    filter_by_criticality: Optional[str] = None  # high, medium, low, all
    focus_areas: Optional[List[str]] = None


class KPIGenerationResponse(BaseModel):
    """Response model for KPI generation."""
    status: str
    kpis: List[dict]
    summary: dict
    message: str


@router.post("", response_model=KPIGenerationResponse)
async def generate_kpis(request: KPIGenerationRequest):
    """
    Generate KPI indicators from DPT structure.

    This endpoint:
    1. Takes validated DPT data
    2. Uses Azure OpenAI to identify relevant metrics
    3. Generates 16-column KPI structure
    4. Returns list of KPIs ready for Excel export

    Args:
        request: KPIGenerationRequest with DPT and options

    Returns:
        KPIGenerationResponse with list of KPIs
    """
    logger.info(f"KPI generation requested for: {request.process_name or 'unnamed'}")

    if not request.dpt:
        raise HTTPException(
            status_code=400,
            detail="DPT data is required"
        )

    try:
        llm_service = get_llm_service()

        # Generate KPIs from DPT
        kpi_result = llm_service.generate_kpis(request.dpt, request.process_name or "")

        kpis = kpi_result.get("kpis", [])

        # Filter by criticality if specified
        if request.filter_by_criticality and request.filter_by_criticality != "all":
            kpis = [
                kpi for kpi in kpis
                if kpi.get("criticidade", "").lower() == request.filter_by_criticality.lower()
            ]

        # Filter by focus areas if specified
        if request.focus_areas:
            focus_areas_lower = [f.lower() for f in request.focus_areas]
            kpis = [
                kpi for kpi in kpis
                if any(
                    focus in kpi.get("justificativa", "").lower()
                    for focus in focus_areas_lower
                )
            ]

        # Validate each KPI
        validated_kpis = []
        for kpi in kpis:
            if _validate_kpi_structure(kpi):
                validated_kpis.append(kpi)

        logger.info(f"KPI generation completed: {len(validated_kpis)} KPIs generated")

        # Generate summary statistics
        summary = {
            "total_kpis": len(validated_kpis),
            "by_criticality": _count_by_field(validated_kpis, "criticidade"),
            "by_periodicidade": _count_by_field(validated_kpis, "periodicidade"),
            "by_polaridade": _count_by_field(validated_kpis, "polaridade")
        }

        return KPIGenerationResponse(
            status="success",
            kpis=validated_kpis,
            summary=summary,
            message=f"Generated {len(validated_kpis)} KPI indicators successfully"
        )

    except Exception as e:
        logger.error(f"Error generating KPIs: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"KPI generation failed: {str(e)}"
        )


@router.post("/validate")
async def validate_kpi(request: KPIValidationRequest):
    """
    Validate a KPI structure.

    Args:
        request: KPI data to validate

    Returns:
        Validation results
    """
    logger.info("KPI validation requested")

    kpi_data = request.dict()
    required_fields = [
        "indicador", "objetivo", "processo", "cliente",
        "metadados", "fonte_extracao", "formula_calculo", "unidade",
        "filtro", "meta", "periodicidade", "polaridade",
        "responsavel", "criticidade", "justificativa"
    ]

    errors = []
    warnings = []

    # Check required fields
    for field in required_fields:
        if field not in kpi_data or not kpi_data[field]:
            errors.append(f"Missing or empty field: {field}")

    # Validate field formats
    valid_periodicidades = ["diária", "semanal", "mensal", "trimestral", "anual"]
    if kpi_data.get("periodicidade") and kpi_data["periodicidade"] not in valid_periodicidades:
        warnings.append(f"Unusual periodicity: {kpi_data.get('periodicidade')}")

    valid_polaridades = ["maximizar", "minimizar", "manter"]
    if kpi_data.get("polaridade") and kpi_data["polaridade"] not in valid_polaridades:
        warnings.append(f"Unusual polarity: {kpi_data.get('polaridade')}")

    valid_criticidades = ["alta", "média", "baixa"]
    if kpi_data.get("criticidade") and kpi_data["criticidade"] not in valid_criticidades:
        warnings.append(f"Unusual criticality: {kpi_data.get('criticidade')}")

    is_valid = len(errors) == 0

    return {
        "status": "valid" if is_valid else "invalid",
        "is_valid": is_valid,
        "errors": errors,
        "warnings": warnings,
        "fields_present": len([f for f in required_fields if f in kpi_data and kpi_data[f]]),
        "fields_total": len(required_fields)
    }


@router.get("/{kpi_id}")
async def get_kpi(kpi_id: str):
    """
    Retrieve a KPI by ID.

    Args:
        kpi_id: ID of the KPI

    Returns:
        KPI data
    """
    logger.info(f"Retrieving KPI: {kpi_id}")

    # TODO: Implement database retrieval
    raise HTTPException(
        status_code=501,
        detail="Database storage not yet implemented"
    )


@router.put("/{kpi_id}")
async def update_kpi(kpi_id: str, kpi_update: dict):
    """
    Update a KPI with corrections or additional information.

    Args:
        kpi_id: ID of the KPI to update
        kpi_update: Dictionary with updates

    Returns:
        Updated KPI data
    """
    logger.info(f"Updating KPI: {kpi_id}")

    # TODO: Implement database update
    raise HTTPException(
        status_code=501,
        detail="Database storage not yet implemented"
    )


@router.post("/batch-validate")
async def batch_validate_kpis(kpis: List[dict]):
    """
    Validate multiple KPIs at once.

    Args:
        kpis: List of KPI dictionaries

    Returns:
        Validation results for each KPI
    """
    logger.info(f"Batch validation requested for {len(kpis)} KPIs")

    results = []
    total_valid = 0

    for i, kpi in enumerate(kpis):
        is_valid = _validate_kpi_structure(kpi)
        results.append({
            "index": i,
            "is_valid": is_valid,
            "kpi_name": kpi.get("indicador", "unnamed")
        })
        if is_valid:
            total_valid += 1

    return {
        "status": "completed",
        "total_kpis": len(kpis),
        "valid_kpis": total_valid,
        "invalid_kpis": len(kpis) - total_valid,
        "results": results
    }


def _validate_kpi_structure(kpi: dict) -> bool:
    """Check if KPI has all required fields."""
    required_fields = [
        "indicador", "objetivo", "processo", "cliente",
        "metadados", "fonte_extracao", "formula_calculo", "unidade",
        "filtro", "meta", "periodicidade", "polaridade",
        "responsavel", "criticidade", "justificativa"
    ]
    return all(field in kpi and kpi[field] for field in required_fields)


def _count_by_field(items: list, field: str) -> dict:
    """Count occurrences of each value in a field."""
    counts = {}
    for item in items:
        value = item.get(field, "unknown")
        counts[value] = counts.get(value, 0) + 1
    return counts
