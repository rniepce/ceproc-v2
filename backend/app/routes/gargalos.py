"""Bottleneck analysis routes (Gargalos)."""
import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from ..services.llm_service import get_llm_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/gargalos", tags=["gargalos"])


class BottleneckAnalysisRequest(BaseModel):
    """Request model for bottleneck analysis."""
    dpt: dict
    bpmn: dict
    focus_areas: Optional[List[str]] = None
    severity_threshold: Optional[str] = None  # high, medium, low, all


class BottleneckItem(BaseModel):
    """Single bottleneck item."""
    activity: str
    severity: str
    description: str
    impact: str
    recommendation: str


class ImprovementItem(BaseModel):
    """Single improvement opportunity."""
    improvement: str
    effort: str
    expected_benefit: str


class BottleneckAnalysisResponse(BaseModel):
    """Response model for bottleneck analysis."""
    status: str
    bottlenecks: List[dict]
    improvements: List[dict]
    summary: dict
    message: str


@router.post("", response_model=BottleneckAnalysisResponse)
async def analyze_bottlenecks(request: BottleneckAnalysisRequest):
    """
    Analyze process for bottlenecks and improvement opportunities.

    This endpoint:
    1. Takes DPT and BPMN structures
    2. Uses Azure OpenAI to identify bottlenecks
    3. Prioritizes improvement opportunities
    4. Returns actionable recommendations

    Args:
        request: BottleneckAnalysisRequest with DPT and BPMN

    Returns:
        BottleneckAnalysisResponse with analysis results
    """
    logger.info("Bottleneck analysis requested")

    if not request.dpt or not request.bpmn:
        raise HTTPException(
            status_code=400,
            detail="Both DPT and BPMN data are required"
        )

    try:
        llm_service = get_llm_service()

        # Analyze bottlenecks using LLM
        analysis = llm_service.analyze_bottlenecks(request.dpt, request.bpmn)

        bottlenecks = analysis.get("bottlenecks", [])
        improvements = analysis.get("prioritized_improvements", [])

        # Filter by severity threshold if specified
        if request.severity_threshold and request.severity_threshold != "all":
            severity_order = {"low": 1, "medium": 2, "high": 3}
            threshold_value = severity_order.get(request.severity_threshold, 0)

            bottlenecks = [
                b for b in bottlenecks
                if severity_order.get(b.get("severity", "low"), 0) >= threshold_value
            ]

        # Filter by focus areas if specified
        if request.focus_areas:
            focus_areas_lower = [f.lower() for f in request.focus_areas]
            bottlenecks = [
                b for b in bottlenecks
                if any(
                    focus in b.get("description", "").lower()
                    for focus in focus_areas_lower
                )
            ]

        logger.info(
            f"Bottleneck analysis completed: "
            f"{len(bottlenecks)} bottlenecks, "
            f"{len(improvements)} improvement opportunities"
        )

        # Generate summary
        summary = {
            "total_bottlenecks": len(bottlenecks),
            "high_severity": len([b for b in bottlenecks if b.get("severity") == "high"]),
            "medium_severity": len([b for b in bottlenecks if b.get("severity") == "medium"]),
            "low_severity": len([b for b in bottlenecks if b.get("severity") == "low"]),
            "total_improvements": len(improvements),
            "high_effort": len([i for i in improvements if i.get("effort") == "high"]),
            "medium_effort": len([i for i in improvements if i.get("effort") == "medium"]),
            "low_effort": len([i for i in improvements if i.get("effort") == "low"]),
        }

        return BottleneckAnalysisResponse(
            status="success",
            bottlenecks=bottlenecks,
            improvements=improvements,
            summary=summary,
            message="Bottleneck analysis completed successfully"
        )

    except Exception as e:
        logger.error(f"Error in bottleneck analysis: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Bottleneck analysis failed: {str(e)}"
        )


@router.post("/quick")
async def quick_bottleneck_check(dpt: dict):
    """
    Quick bottleneck check based on DPT only (no BPMN required).

    Identifies potential bottlenecks from the process description
    without full workflow analysis.

    Args:
        dpt: DPT dictionary

    Returns:
        List of potential bottlenecks
    """
    logger.info("Quick bottleneck check requested")

    if not dpt:
        raise HTTPException(
            status_code=400,
            detail="DPT data is required"
        )

    try:
        # Extract potential bottleneck indicators from DPT
        bottleneck_indicators = []

        # Check for manual steps
        etapas = dpt.get("etapas", [])
        for etapa in etapas:
            if etapa.get("automatizado") == False or "manual" in etapa.get("descricao", "").lower():
                bottleneck_indicators.append({
                    "type": "manual_process",
                    "activity": etapa.get("titulo", ""),
                    "severity": "medium",
                    "description": f"Manual process: {etapa.get('descricao', '')}"
                })

        # Check for multiple handoffs
        atores = dpt.get("atores", [])
        if len(atores) > 5:
            bottleneck_indicators.append({
                "type": "high_handoff",
                "severity": "medium",
                "description": f"High number of actors involved ({len(atores)}), potential for many handoffs"
            })

        # Check for external system dependencies
        sistemas = dpt.get("sistemas", [])
        if len(sistemas) > 3:
            bottleneck_indicators.append({
                "type": "system_complexity",
                "severity": "low",
                "description": f"Multiple system dependencies ({len(sistemas)}), potential integration issues"
            })

        return {
            "status": "success",
            "bottleneck_indicators": bottleneck_indicators,
            "recommendation": "Use full analysis (POST /api/gargalos) for comprehensive bottleneck assessment"
        }

    except Exception as e:
        logger.error(f"Error in quick bottleneck check: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Quick check failed: {str(e)}"
        )


@router.post("/validate-improvement")
async def validate_improvement(improvement: dict):
    """
    Validate an improvement opportunity structure.

    Args:
        improvement: Improvement dictionary

    Returns:
        Validation results
    """
    logger.info("Improvement validation requested")

    required_fields = ["improvement", "effort", "expected_benefit"]
    errors = []

    for field in required_fields:
        if field not in improvement or not improvement[field]:
            errors.append(f"Missing field: {field}")

    valid_effort = ["low", "medium", "high"]
    if improvement.get("effort") and improvement["effort"] not in valid_effort:
        errors.append(f"Invalid effort level: {improvement['effort']}")

    is_valid = len(errors) == 0

    return {
        "status": "valid" if is_valid else "invalid",
        "is_valid": is_valid,
        "errors": errors
    }


@router.get("/{analysis_id}")
async def get_analysis(analysis_id: str):
    """
    Retrieve a previous bottleneck analysis.

    Args:
        analysis_id: ID of the analysis

    Returns:
        Analysis data
    """
    logger.info(f"Retrieving analysis: {analysis_id}")

    # TODO: Implement database retrieval
    raise HTTPException(
        status_code=501,
        detail="Database storage not yet implemented"
    )
