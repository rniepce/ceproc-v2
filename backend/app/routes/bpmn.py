"""BPMN generation and visualization routes."""
import logging
from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
from typing import Optional, List, Any, Dict
from ..services.llm_service import get_llm_service
from ..services.bpmn_processor import get_bpmn_processor

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/bpmn", tags=["bpmn"])


class BPMNGenerationRequest(BaseModel):
    """Request model for BPMN generation."""
    dpt: dict
    include_coordinates: bool = True
    include_visualization: bool = True


class BPMNGenerationResponse(BaseModel):
    """Response model for BPMN generation."""
    status: str
    bpmn_json: dict
    validation: dict
    message: str


@router.post("", response_model=BPMNGenerationResponse)
async def generate_bpmn(request: BPMNGenerationRequest):
    """
    Generate BPMN from DPT structure.

    This endpoint:
    1. Takes validated DPT data
    2. Uses Azure OpenAI to convert to BPMN JSON
    3. Validates BPMN structure
    4. Returns BPMN JSON and optionally XML

    Args:
        request: BPMNGenerationRequest with DPT and options

    Returns:
        BPMNGenerationResponse with BPMN data
    """
    logger.info("BPMN generation requested")

    if not request.dpt:
        raise HTTPException(
            status_code=400,
            detail="DPT data is required"
        )

    try:
        llm_service = get_llm_service()
        bpmn_processor = get_bpmn_processor()

        # Convert DPT to BPMN JSON
        bpmn_json = llm_service.convert_dpt_to_bpmn(request.dpt)

        # Validate BPMN structure
        is_valid, validation_errors = bpmn_processor.validate_bpmn(bpmn_json)

        logger.info(f"BPMN generation completed: {'valid' if is_valid else 'invalid'}")

        return BPMNGenerationResponse(
            status="success",
            bpmn_json=bpmn_json,
            validation={
                "is_valid": is_valid,
                "errors": validation_errors,
                "elements_count": (
                    len(bpmn_json.get("activities", [])) +
                    len(bpmn_json.get("gateways", [])) + 2  # +2 for start and end events
                ),
                "flows_count": len(bpmn_json.get("sequenceFlows", []))
            },
            message=f"BPMN generated successfully (valid: {is_valid})"
        )

    except Exception as e:
        logger.error(f"Error generating BPMN: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"BPMN generation failed: {str(e)}"
        )


@router.post("/xml")
async def generate_bpmn_xml(request: BPMNGenerationRequest):
    """
    Generate BPMN 2.0 XML from BPMN JSON.

    Args:
        request: BPMNGenerationRequest with BPMN JSON

    Returns:
        BPMN 2.0 XML string
    """
    logger.info("BPMN XML generation requested")

    if not request.dpt:
        raise HTTPException(
            status_code=400,
            detail="DPT data is required"
        )

    try:
        llm_service = get_llm_service()
        bpmn_processor = get_bpmn_processor()

        # Convert DPT to BPMN JSON
        bpmn_json = llm_service.convert_dpt_to_bpmn(request.dpt)

        # Convert BPMN JSON to XML
        bpmn_xml = bpmn_processor.convert_json_to_xml(bpmn_json)

        return {
            "status": "success",
            "bpmn_xml": bpmn_xml,
            "bpmn_json": bpmn_json,
            "message": "BPMN XML generated successfully"
        }

    except Exception as e:
        logger.error(f"Error generating BPMN XML: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"BPMN XML generation failed: {str(e)}"
        )


@router.post("/validate")
async def validate_bpmn(bpmn_data: Dict[str, Any] = Body(...)):
    """
    Validate BPMN structure without generating XML.

    Args:
        bpmn_data: BPMN JSON structure to validate

    Returns:
        Validation results
    """
    logger.info("BPMN validation requested")

    if not bpmn_data:
        raise HTTPException(
            status_code=400,
            detail="BPMN JSON is required"
        )

    try:
        bpmn_processor = get_bpmn_processor()
        is_valid, errors = bpmn_processor.validate_bpmn(bpmn_data)

        return {
            "status": "valid" if is_valid else "invalid",
            "is_valid": is_valid,
            "errors": errors,
            "elements_count": (
                len(bpmn_data.get("activities", [])) +
                len(bpmn_data.get("gateways", [])) + 2
            ),
            "flows_count": len(bpmn_data.get("sequenceFlows", []))
        }

    except Exception as e:
        logger.error(f"Error validating BPMN: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"BPMN validation failed: {str(e)}"
        )


@router.get("/{bpmn_id}")
async def get_bpmn(bpmn_id: str):
    """
    Retrieve a previously generated BPMN.

    Args:
        bpmn_id: ID of the BPMN to retrieve

    Returns:
        Stored BPMN data
    """
    logger.info(f"Retrieving BPMN: {bpmn_id}")

    # TODO: Implement database retrieval
    raise HTTPException(
        status_code=501,
        detail="Database storage not yet implemented"
    )


@router.put("/{bpmn_id}")
async def update_bpmn(bpmn_id: str, bpmn_json: dict):
    """
    Update BPMN with manual corrections or refinements.

    Args:
        bpmn_id: ID of the BPMN to update
        bpmn_json: Updated BPMN structure

    Returns:
        Updated BPMN data
    """
    logger.info(f"Updating BPMN: {bpmn_id}")

    # TODO: Implement database update
    raise HTTPException(
        status_code=501,
        detail="Database storage not yet implemented"
    )


@router.post("/import")
async def import_bpmn_xml(bpmn_xml: str):
    """
    Import existing BPMN XML and convert to JSON format.

    Args:
        bpmn_xml: BPMN 2.0 XML string

    Returns:
        BPMN JSON representation
    """
    logger.info("BPMN XML import requested")

    if not bpmn_xml:
        raise HTTPException(
            status_code=400,
            detail="BPMN XML is required"
        )

    # TODO: Implement XML to JSON conversion
    raise HTTPException(
        status_code=501,
        detail="BPMN XML import not yet implemented"
    )
