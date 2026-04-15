"""Export routes for various document formats."""
import logging
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel
from typing import Optional
import io
from datetime import datetime

from ..services.export_service import get_export_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/export", tags=["export"])


class ExportRequest(BaseModel):
    """Request model for export."""
    dpt: dict
    bpmn_json: Optional[dict] = None
    bpmn_xml: Optional[str] = None
    kpis: Optional[list] = None
    process_name: Optional[str] = None


@router.post("/docx")
async def export_docx(request: ExportRequest):
    """
    Export process analysis to Word document (.docx).

    Includes:
    - Process metadata and context
    - Business objectives and constraints
    - Process flow steps
    - Actors and responsibilities
    - Systems involved
    - KPI indicators (if available)

    Args:
        request: ExportRequest with process data

    Returns:
        DOCX file as download
    """
    logger.info("DOCX export requested")

    if not request.dpt:
        raise HTTPException(
            status_code=400,
            detail="DPT data is required"
        )

    try:
        export_service = get_export_service()

        # Generate DOCX
        docx_buffer = export_service.export_to_docx(
            dpt=request.dpt,
            bpmn_json=request.bpmn_json,
            kpis=request.kpis,
            filename=f"{request.process_name or 'ceproc'}_analysis.docx"
        )

        filename = export_service.generate_export_filename(
            "docx",
            request.process_name or "ceproc"
        )

        return StreamingResponse(
            iter([docx_buffer.getvalue()]),
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )

    except Exception as e:
        logger.error(f"Error exporting to DOCX: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"DOCX export failed: {str(e)}"
        )


@router.post("/xlsx")
async def export_xlsx(request: ExportRequest):
    """
    Export KPI indicators to Excel spreadsheet (.xlsx).

    16-column structure:
    - Indicador, Objetivo, Processo, Cliente, Metadados
    - Fonte de Extração, Fórmula de Cálculo, Unidade, Filtro
    - Meta, Periodicidade, Polaridade, Responsável
    - Criticidade, Justificativa

    Args:
        request: ExportRequest with KPI data

    Returns:
        XLSX file as download
    """
    logger.info("XLSX export requested")

    if not request.kpis:
        raise HTTPException(
            status_code=400,
            detail="KPI data is required"
        )

    try:
        export_service = get_export_service()

        # Generate XLSX
        xlsx_buffer = export_service.export_to_xlsx(
            kpis=request.kpis,
            filename=f"{request.process_name or 'ceproc'}_kpis.xlsx"
        )

        filename = export_service.generate_export_filename(
            "xlsx",
            f"{request.process_name or 'ceproc'}_kpis"
        )

        return StreamingResponse(
            iter([xlsx_buffer.getvalue()]),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )

    except Exception as e:
        logger.error(f"Error exporting to XLSX: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"XLSX export failed: {str(e)}"
        )


@router.post("/bpmn")
async def export_bpmn(request: ExportRequest):
    """
    Export BPMN as XML file (.bpmn).

    BPMN 2.0 standard format with:
    - Process definition with pools and lanes
    - All activities, gateways, and events
    - Sequence flows with waypoints
    - DI (diagram interchange) for visualization

    Args:
        request: ExportRequest with BPMN data

    Returns:
        BPMN XML file as download
    """
    logger.info("BPMN export requested")

    if not request.bpmn_json and not request.bpmn_xml:
        raise HTTPException(
            status_code=400,
            detail="BPMN data (JSON or XML) is required"
        )

    try:
        export_service = get_export_service()

        # Generate BPMN XML if needed
        bpmn_xml = request.bpmn_xml
        if not bpmn_xml and request.bpmn_json:
            bpmn_buffer = export_service.export_to_bpmn_xml(request.bpmn_json)
            bpmn_xml = bpmn_buffer.getvalue().decode('utf-8')

        filename = export_service.generate_export_filename(
            "bpmn",
            request.process_name or "process"
        )

        return StreamingResponse(
            iter([bpmn_xml.encode('utf-8')]),
            media_type="application/xml",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )

    except Exception as e:
        logger.error(f"Error exporting BPMN: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"BPMN export failed: {str(e)}"
        )


@router.post("/zip")
async def export_all_formats(request: ExportRequest):
    """
    Export all data as comprehensive ZIP archive.

    Contains:
    - dpt.json: Complete DPT structure
    - bpmn.json: BPMN JSON representation
    - process.bpmn: BPMN 2.0 XML
    - kpis.json: KPI indicators as JSON
    - kpis.xlsx: KPI indicators as spreadsheet
    - relatorio.docx: Comprehensive analysis report

    Args:
        request: ExportRequest with all available data

    Returns:
        ZIP file as download
    """
    logger.info("ZIP export requested")

    if not request.dpt:
        raise HTTPException(
            status_code=400,
            detail="DPT data is required"
        )

    try:
        export_service = get_export_service()

        # Generate BPMN XML if we have JSON
        bpmn_xml = request.bpmn_xml
        if not bpmn_xml and request.bpmn_json:
            try:
                bpmn_buffer = export_service.export_to_bpmn_xml(request.bpmn_json)
                bpmn_xml = bpmn_buffer.getvalue().decode('utf-8')
            except Exception as e:
                logger.warning(f"Could not generate BPMN XML: {str(e)}")

        # Generate ZIP
        zip_buffer = export_service.export_to_zip(
            dpt=request.dpt,
            bpmn_json=request.bpmn_json,
            bpmn_xml=bpmn_xml,
            kpis=request.kpis
        )

        filename = export_service.generate_export_filename(
            "zip",
            request.process_name or "ceproc"
        )

        return StreamingResponse(
            iter([zip_buffer.getvalue()]),
            media_type="application/zip",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )

    except Exception as e:
        logger.error(f"Error exporting ZIP: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"ZIP export failed: {str(e)}"
        )


@router.get("/formats")
async def list_export_formats():
    """
    List available export formats.

    Returns:
        Available formats with descriptions
    """
    return {
        "status": "success",
        "formats": [
            {
                "format": "docx",
                "name": "Word Document",
                "description": "Complete analysis report with metadata, flow, actors, systems, and KPIs",
                "includes": ["DPT", "BPMN diagram description", "KPIs", "Business context"],
                "best_for": "Executive report, stakeholder documentation"
            },
            {
                "format": "xlsx",
                "name": "Excel Spreadsheet",
                "description": "KPI indicators in 16-column structure for analysis and tracking",
                "includes": ["All KPI fields", "Formulas", "Targets", "Criticality"],
                "best_for": "KPI management, metrics tracking"
            },
            {
                "format": "bpmn",
                "name": "BPMN 2.0 XML",
                "description": "Standard BPMN format for process modeling tools",
                "includes": ["Process flow", "Pools and lanes", "All elements", "Coordinates"],
                "best_for": "Process visualization, tool integration"
            },
            {
                "format": "zip",
                "name": "Complete Archive",
                "description": "All formats in one ZIP file",
                "includes": ["DPT JSON", "BPMN JSON", "BPMN XML", "KPIs JSON", "KPIs XLSX", "Report DOCX"],
                "best_for": "Complete backup, sharing, archival"
            }
        ]
    }
