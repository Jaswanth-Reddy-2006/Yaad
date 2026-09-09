from typing import List, Optional, Dict
import logging
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
import httpx
from app.core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/companion", tags=["Companion & LLM"])

class ConversationHistoryItem(BaseModel):
    role: str = Field(..., description="user or assistant")
    content: str

class CompanionAskRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=1000, description="The user's query")
    patient_name: Optional[str] = None
    caregiver_name: Optional[str] = None
    conversation_history: Optional[List[ConversationHistoryItem]] = None

class CompanionAskResponse(BaseModel):
    success: bool
    answer: str
    source: str = "groq"
    model: Optional[str] = None

SYSTEM_PROMPT_TEMPLATE = (
    "You are Mitra, a gentle, warm, and comforting companion for an elderly person with memory challenges or dementia. "
    "Your role is to provide compassionate companionship, memory care guidance, cognitive exercises, and general dementia-care education. "
    "\n\nSAFETY AND MEDICAL BOUNDARIES:"
    "\n1. You must NEVER diagnose a patient with any illness or medical condition."
    "\n2. You must NEVER prescribe medication or recommend changing medication dosages."
    "\n3. You must NEVER claim certainty about medical emergencies. For acute symptoms, chest pain, sudden confusion, or physical injuries, calmly advise contacting emergency services or the caregiver immediately."
    "\n4. You must NEVER invent patient facts, medical history, or pretend to know information not provided."
    "\n5. Clearly distinguish general educational information from patient-specific medical advice. Always recommend consulting a qualified healthcare professional or doctor for medical decisions."
    "\n\nSTYLE RULES:"
    "\n- Answer in 1 or 2 short, simple, easy-to-understand sentences."
    "\n- Be gentle, positive, and reassuring."
    "\n- Do not use markdown headers, bullet lists, or technical jargon."
    "\n- Never say 'As an AI' or break character."
)

@router.post("/ask", response_model=CompanionAskResponse)
async def ask_companion_groq(req: CompanionAskRequest):
    api_key = settings.GROQ_API_KEY.strip().strip("\"'") if settings.GROQ_API_KEY else ""
    if not api_key:
        logger.warning("[LLM] GROQ_API_KEY is not configured on the backend server.")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Groq LLM service is not configured on this server."
        )

    system_prompt = SYSTEM_PROMPT_TEMPLATE
    if req.patient_name:
        system_prompt += f" The person's name is {req.patient_name}."
    if req.caregiver_name:
        system_prompt += f" Their caregiver's name is {req.caregiver_name}."

    messages = [{"role": "system", "content": system_prompt}]

    if req.conversation_history:
        for item in req.conversation_history[-2:]:
            if item.role in ["user", "assistant"] and item.content.strip():
                messages.append({"role": item.role, "content": item.content.strip()})

    messages.append({"role": "user", "content": req.query.strip()})

    raw_model = (settings.GROQ_MODEL or "openai/gpt-oss-120b").strip().strip("\"'")
    groq_model = raw_model if raw_model else "openai/gpt-oss-120b"

    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            res = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": groq_model,
                    "messages": messages,
                    "max_tokens": 150,
                    "temperature": 0.6,
                },
            )

        if res.status_code != 200:
            error_data = res.json() if res.headers.get("content-type", "").startswith("application/json") else {}
            err_msg = error_data.get("error", {}).get("message", res.text[:200])
            logger.error(f"[LLM] Groq request failed: HTTP {res.status_code} - {err_msg}")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Groq API returned an upstream error: {err_msg}"
            )

        data = res.json()
        content = data.get("choices", [{}])[0].get("message", {}).get("content", "").strip()

        if not content:
            logger.warning("[LLM] Groq API returned empty content")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Groq API returned empty response."
            )

        logger.info(f"[LLM] Groq request successful (model: {groq_model})")
        return CompanionAskResponse(
            success=True,
            answer=content,
            source="groq",
            model=groq_model
        )

    except httpx.TimeoutException:
        logger.warning("[LLM] Groq API request timed out after 8.0s")
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="Groq API request timed out."
        )
    except httpx.RequestError as exc:
        logger.error(f"[LLM] Groq network connection error: {type(exc).__name__}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Network error while contacting Groq API."
        )

