from __future__ import annotations

import os
import tempfile
import threading
from pathlib import Path

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.concurrency import run_in_threadpool
from fastapi.middleware.cors import CORSMiddleware
from faster_whisper import WhisperModel

MODEL_NAME = os.getenv("WHISPER_MODEL", "small")
DEVICE = os.getenv("WHISPER_DEVICE", "cpu")
COMPUTE_TYPE = os.getenv("WHISPER_COMPUTE_TYPE", "int8")
MAX_BYTES = int(os.getenv("MAX_AUDIO_BYTES", str(50 * 1024 * 1024)))

app = FastAPI(title="WhatsApp Voice Transcriber", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://web.whatsapp.com"],
    allow_origin_regex=r"chrome-extension://.*",
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

_model: WhisperModel | None = None
_model_lock = threading.Lock()
_transcription_lock = threading.Lock()


def get_model() -> WhisperModel:
    global _model
    if _model is None:
        with _model_lock:
            if _model is None:
                _model = WhisperModel(MODEL_NAME, device=DEVICE, compute_type=COMPUTE_TYPE)
    return _model


@app.get("/health")
def health() -> dict[str, object]:
    return {
        "ok": True,
        "model": MODEL_NAME,
        "device": DEVICE,
        "loaded": _model is not None,
    }


@app.post("/transcribe")
async def transcribe(
    audio: UploadFile = File(...),
    language: str | None = Form(default=None),
) -> dict[str, object]:
    data = await audio.read(MAX_BYTES + 1)
    if not data:
        raise HTTPException(status_code=400, detail="File audio vuoto")
    if len(data) > MAX_BYTES:
        raise HTTPException(status_code=413, detail="Il file supera il limite di 50 MB")

    suffix = Path(audio.filename or "voice-note.ogg").suffix or ".ogg"
    path: str | None = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp:
            temp.write(data)
            path = temp.name
        try:
            return await run_in_threadpool(transcribe_file, path, language)
        except RuntimeError as error:
            message = str(error)
            if "cublas" in message.lower() or "cuda" in message.lower():
                raise HTTPException(
                    status_code=500,
                    detail=(
                        "Whisper ha provato a usare CUDA/GPU ma le librerie NVIDIA non sono disponibili. "
                        "Avvia con WHISPER_DEVICE=cpu oppure lascia il default aggiornato su CPU."
                    ),
                ) from error
            raise
    finally:
        if path:
            Path(path).unlink(missing_ok=True)


def transcribe_file(path: str, language: str | None) -> dict[str, object]:
    with _transcription_lock:
        segments, info = get_model().transcribe(
            path,
            language=language or None,
            beam_size=5,
            vad_filter=True,
            condition_on_previous_text=False,
        )
        segment_list = [
            {"start": round(item.start, 2), "end": round(item.end, 2), "text": item.text.strip()}
            for item in segments
            if item.text.strip()
        ]

    return {
        "text": " ".join(item["text"] for item in segment_list).strip(),
        "language": info.language,
        "languageProbability": round(info.language_probability, 4),
        "duration": round(info.duration, 2),
        "segments": segment_list,
    }
