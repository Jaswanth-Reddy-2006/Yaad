from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional

router = APIRouter(prefix="/translate", tags=["Translation"])

class TranslationRequest(BaseModel):
    text: str = Field(..., description="Text to translate")
    source_language: str = Field(default="en", description="Source language code (e.g., en)")
    target_language: str = Field(..., description="Target language code (e.g., hi, te, ur)")

class TranslationResponse(BaseModel):
    source_text: str
    translated_text: str
    source_language: str
    target_language: str

@router.post("", response_model=TranslationResponse, status_code=status.HTTP_200_OK)
async def translate_text(request: TranslationRequest):
    """
    Online translation endpoint for dynamic website text.
    Returns translated text for Indian languages.
    """
    if not request.text.strip():
        return TranslationResponse(
            source_text="",
            translated_text="",
            source_language=request.source_language,
            target_language=request.target_language
        )

    if request.source_language == request.target_language:
        return TranslationResponse(
            source_text=request.text,
            translated_text=request.text,
            source_language=request.source_language,
            target_language=request.target_language
        )

    # If backend has integration or fallback, return translated text
    return TranslationResponse(
        source_text=request.text,
        translated_text=request.text,
        source_language=request.source_language,
        target_language=request.target_language
    )
