from pydantic import BaseModel, HttpUrl
from typing import Optional, List

class VideoRequest(BaseModel):
    url: HttpUrl


class Question(BaseModel):
    question: str
    answers: List[str]
    correct_answer: int # indice de la respuesta correcta
    explanation: Optional[str] = None

class TimestampedQuestion(BaseModel):
    """Pregunta asociada a un momento del video"""
    timestamp: float # Segundos desde el inicio
    question: str
    answers: List[str]
    correct_answer: int
    explanation: Optional[str] = None

class VideoResponse(BaseModel):
    video_id: str
    title: str
    duration: int
    transcript: str
    questions: List[TimestampedQuestion] # Ahora con timestamps
    h5p_content: dict


class TranscriptSegment(BaseModel):
    """Segmentos de transcripción ocn timestamp"""
    text: str
    start: float
    end: float


class DetailedTranscript(BaseModel):
    """Transcripción completa con segmentos"""
    full_text: str
    segments: List[TranscriptSegment]
    duration: float


