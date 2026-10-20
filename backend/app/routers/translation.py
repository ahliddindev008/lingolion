import asyncio

from fastapi import APIRouter, Depends, File, HTTPException, Query, Request, UploadFile

from app.models import User
from app.rate_limit import limiter
from app.schemas import SpeechRecognitionResponse, TranslationRequest, TranslationResponse
from app.security import get_current_user
from app.translation_service import (
    SpeechNotRecognizedError,
    SpeechRecognitionError,
    TranslationRateLimitError,
    TranslationServiceError,
    recognize_speech,
    translate_text,
)

router = APIRouter(prefix="/api/translation", tags=["translation"])
MAX_SPEECH_AUDIO_BYTES = 4 * 1024 * 1024
WAV_CONTENT_TYPES = {"audio/wav", "audio/x-wav", "audio/wave", "audio/vnd.wave"}


@router.post("/text", response_model=TranslationResponse)
@limiter.limit("30/minute")
def translate(
    payload: TranslationRequest,
    request: Request,
    current_user: User = Depends(get_current_user),
):
    text = payload.text.strip()
    if not text:
        raise HTTPException(status_code=422, detail="Enter text to translate.")

    try:
        translated_text = translate_text(text, payload.source_language, payload.target_language)
    except TranslationRateLimitError as error:
        raise HTTPException(status_code=429, detail="google_translate_rate_limited") from error
    except TranslationServiceError as error:
        raise HTTPException(status_code=502, detail="google_translate_unavailable") from error

    return TranslationResponse(translated_text=translated_text)


@router.post("/speech", response_model=SpeechRecognitionResponse)
@limiter.limit("8/minute")
async def transcribe_speech(
    request: Request,
    file: UploadFile = File(...),
    language: str = Query(pattern="^[a-zA-Z]{2,3}(?:-[A-Za-z0-9]{2,8})*$"),
    current_user: User = Depends(get_current_user),
):
    audio_data = await file.read(MAX_SPEECH_AUDIO_BYTES + 1)
    await file.close()
    if len(audio_data) > MAX_SPEECH_AUDIO_BYTES:
        raise HTTPException(status_code=413, detail="speech_audio_too_large")
    if (
        file.content_type not in WAV_CONTENT_TYPES
        or len(audio_data) < 12
        or audio_data[:4] != b"RIFF"
        or audio_data[8:12] != b"WAVE"
    ):
        raise HTTPException(status_code=415, detail="unsupported_speech_audio")

    try:
        text = await asyncio.to_thread(recognize_speech, audio_data, language)
    except SpeechNotRecognizedError as error:
        raise HTTPException(status_code=422, detail="speech_not_recognized") from error
    except SpeechRecognitionError as error:
        raise HTTPException(status_code=502, detail="speech_recognition_unavailable") from error

    return SpeechRecognitionResponse(text=text)