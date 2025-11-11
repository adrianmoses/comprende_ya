import os
import re
import uuid
from typing import List
from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends, Query
from sqlmodel import Session, select

from db import get_session
from models.database import Video, VideoSegment
from models.schemas import VideoRequest, VideoResponse
from flows.video_processing import process_video_flow
from repositories import VideoRepository
from services.h5p import h5p_service
from services.questions import question_service
from services.segments import SegmentService
from services.transcription import transcription_service
from services.youtube import youtube_service

router = APIRouter()


flow_runs = {}

async def run_flow_background(flow_run_id: str, video_url: str, force: bool = False):
    """Ejecuta el flow en background"""
    try:
        flow_runs[flow_run_id] = {
            "status": "RUNNING",
            "url": video_url
        }

        # Ejecutar flow (en v3 se ejecuta directamente)
        result = process_video_flow(video_url, force=force)

        flow_runs[flow_run_id] = {
            "status": "COMPLETED",
            "url": video_url,
            "result": result
        }

    except Exception as e:
        flow_runs[flow_run_id] = {
            "status": "FAILED",
            "url": video_url,
            "error": str(e)
        }

@router.post("/process-async")
async def process_video_async(
        request: VideoRequest,
        background_tasks: BackgroundTasks,
        force: bool = Query(False, description="Forzar reprocesamiento aunque el video ya exista"),
        db: Session = Depends(get_session)
):
    """
    Inicia procesamiento asynchronico con Prefect
    :param request:
    :return:
    """

    # Extraer YouTube video ID de la URL
    match = re.search(r'(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)', str(request.url))
    if not match:
        raise HTTPException(status_code=400, detail="URL de YouTube inválida")

    youtube_video_id = match.group(1)

    # Verificar si ya existe
    if not force:
        repo = VideoRepository(db)
        existing_video = repo.get_by_youtube_id(youtube_video_id)

        if existing_video:
            print(f"✅ Video {youtube_video_id} ya existe en DB (ID: {existing_video.id})")
            # Devolver el video existente
            return {
                "flow_run_id": None,
                "status": "EXISTS",
                "message": "Video ya procesado",
                "result": {
                    "id": existing_video.id,
                    "video_id": existing_video.youtube_id,
                    "title": existing_video.title,
                    "duration": existing_video.duration,
                    "transcript": existing_video.transcript,
                    "questions": [q.model_dump() for q in existing_video.questions],
                    "h5p_content": existing_video.h5p_content,
                    "created_at": existing_video.created_at.isoformat()
                }
            }

    flow_run_id = str(uuid.uuid4())

    # Inicializer estado
    flow_runs[flow_run_id] = {
        "status": "PENDING",
        "url": str(request.url)
    }

    # Ejecutar flow en background
    background_tasks.add_task(run_flow_background, flow_run_id, str(request.url), force)

    return {
        "flow_run_id": flow_run_id,
        "status": "PENDING",
        "message": f"Video en procesamiento{' (forzado)' if force else ''}"
    }


@router.get("/status/{flow_run_id}")
async def get_flow_status(flow_run_id: str):
    """
    Obtiene el estado del flow
    :param flow_run_id:
    :return:
    """
    if flow_run_id not in flow_runs:
        raise HTTPException(status_code=404, detail="Flow encontrado")

    flow_status = flow_runs[flow_run_id].copy()
    flow_status["flow_run_id"] = flow_run_id
    return flow_status


@router.get("/flows")
async def get_flows():
    """
    Lista todos los flows
    :return:
    """
    return {
        "flows": [
            {
                "flow_run_id": fid,
                "status": data.get("status"),
                "url": data.get("url")
            }
            for fid, data in flow_runs.items()
        ]
    }


@router.get("/{video_id}")
async def get_video(video_id: str, db: Session = Depends(get_session)):
    """
    Obtener video procesando por ID (permalink)
    :param video_id:
    :param db:
    :return:
    """

    repo = VideoRepository(db)
    video = repo.get_by_id(video_id)

    if not video:
        raise HTTPException(status_code=404, detail="Video encontrado")

    return {
        "id": video.id,
        "video_id": video.youtube_id,
        "url": video.url,
        "title": video.title,
        "duration": video.duration,
        "transcript": video.transcript,
        "h5p_content": video.h5p_content,
        "questions": [
            {
                "timestamp": q.timestamp,
                "question": q.question,
                "answers": q.answers,
                "correct_answer": q.correct_answer,
                "explanation": q.explanation,
            } for q in video.questions
        ],
        "created_at": video.created_at.isoformat(),
    }

@router.get("/")
async def list_videos(skip: int = 0, limit: int = 20, db: Session = Depends(get_session)):
    """
    Lista todos los videos
    :param skip:
    :param limit:
    :param db:
    :return:
    """
    repo = VideoRepository(db)

    videos = repo.list(skip, limit)

    return {
        "videos": [
            {
                "id": v.id,
                "video_id": v.video_id,
                "title": v.title,
                "duration": v.duration,
                "created_at": v.created_at.isoformat(),
            } for v in videos
        ]
    }


@router.get("/videos/{video_id}/segments")
async def get_video_segments(
        video_id: int,
        session: Session = Depends(get_session)
) -> List[dict]:
    """Obtiene los segmentos de transcripción de un video"""

    # Verificar que el video existe
    video = session.get(Video, video_id)
    if not video:
        raise HTTPException(status_code=404, detail="Video no encontrado")

    # Obtener segmentos
    segments = session.exec(
        select(VideoSegment)
        .where(VideoSegment.video_id == video_id)
        .order_by(VideoSegment.segment_number)
    ).all()

    segment_service = SegmentService()
    # Si no hay segmentos, intentar extraerlos
    if not segments and video.full_transcript_data:
        segments = segment_service.extract_and_save_segments(video, session)

    return [
        {
            "segment_number": seg.segment_number,
            "transcript": seg.transcript_text,
            "start_time": seg.start_time,
            "end_time": seg.end_time,
        }
        for seg in segments
    ]

@router.post("/process",
             response_model=VideoResponse,
             responses={
                 400: {"description": "Video inválido o muy largo"},
                 500: {"description": "Error procesando video"}
             })
async def process_video(request: VideoRequest):
    """
    Procesa un video de YouTube: descarga, transcribe, genera preguntas
    :param request:
    :return:
    """

    try:
        # 1. Descarga audio a temp path
        print("Descargando")
        audio_path, metadata = youtube_service.download_audio(str(request.url))

        # 2. Transcribir
        print("Transcribando")
        transcript = transcription_service.transcribe(audio_path)

        # 3. Generar pregruntas
        print("Generando preguntas")
        questions = question_service.generate_question(transcript)

        # 4. Crear H5P
        print("Creando visualizacion")
        h5p_content = h5p_service.create_quiz(questions, metadata["title"])

        # 5. Limpiar archivo temporal
        print("Limpiando archivo")
        os.remove(audio_path)

        print("yt metadata")
        print(metadata)

        return VideoResponse(
            video_id=metadata["video_id"],
            title=metadata["title"],
            duration=metadata["duration"],
            transcript=transcript,
            questions=questions,
            h5p_content=h5p_content
        )
    except HTTPException:
        # Re-lanzar HTTPException tal cual
        raise
    except ValueError as e:
        return HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        return HTTPException(status_code=500, detail=f"Error procesando video: {str(e)}")



