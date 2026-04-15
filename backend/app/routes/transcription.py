"""Transcription routes for audio processing."""
import logging
from fastapi import APIRouter, File, UploadFile, HTTPException
from typing import Optional
import io

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/transcribe", tags=["transcription"])


@router.post("")
async def transcribe_audio(
    file: UploadFile = File(...),
    language: str = "pt-BR"
):
    """
    Transcribe audio file to text using Azure Speech Services.

    Args:
        file: Audio file (MP3, WAV, M4A, etc.)
        language: Language code (default: pt-BR for Brazilian Portuguese)

    Returns:
        Transcribed text and metadata
    """
    logger.info(f"Transcription request received: {file.filename}")

    try:
        # Validate file type
        allowed_types = {
            "audio/mpeg",
            "audio/wav",
            "audio/mp4",
            "audio/m4a",
            "audio/ogg",
            "audio/x-wav",
            "audio/mp3"
        }

        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type: {file.content_type}. Allowed: {allowed_types}"
            )

        # Read file content
        content = await file.read()

        if not content:
            raise HTTPException(
                status_code=400,
                detail="Empty file"
            )

        if len(content) > 100 * 1024 * 1024:  # 100MB limit
            raise HTTPException(
                status_code=413,
                detail="File too large (max 100MB)"
            )

        # TODO: Implement Azure Speech Services integration
        # For now, return placeholder response with instructions
        logger.info(f"Audio file received: {file.filename} ({len(content)} bytes)")

        return {
            "status": "pending",
            "message": "Transcription service not yet implemented",
            "filename": file.filename,
            "file_size": len(content),
            "language": language,
            "implementation_note": "Azure Speech Services integration needed in backend"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in transcription: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Transcription failed: {str(e)}"
        )


@router.post("/text")
async def transcribe_from_text(
    text: str,
    context: Optional[dict] = None
):
    """
    Process text input directly (alternative to audio transcription).

    Args:
        text: Raw text from interview/meeting notes
        context: Optional metadata about the text

    Returns:
        Acknowledgment that text is ready for DPT extraction
    """
    logger.info("Text input received for processing")

    if not text or not text.strip():
        raise HTTPException(
            status_code=400,
            detail="Text content is required"
        )

    if len(text) > 1000000:  # 1MB of text
        raise HTTPException(
            status_code=413,
            detail="Text too large (max 1MB)"
        )

    return {
        "status": "success",
        "message": "Text received and ready for DPT extraction",
        "text_length": len(text),
        "context": context or {}
    }
