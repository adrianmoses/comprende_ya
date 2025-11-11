from prefect import flow, task
import os
import json

from db import get_session, get_db_session
from models.database import Question, Video
from models.schemas import TimestampedQuestion
from repositories import VideoRepository
from services.segments import SegmentService
from services.youtube import youtube_service
from services.questions import question_service
from services.transcription import transcription_service
from services.h5p import h5p_service

@task(name="Download YouTube Audio", retries=2)
def download_audio(video_url: str):
    """Descarga un archivo de audio"""
    audio_path, metadata = youtube_service.download_audio(video_url)
    return audio_path, metadata


@task(name="Transcribe Audio con Timestamps", retries=1)
def transcribe_with_timestamps(audio_path: str):
    """Transcribe audio con Whisper"""
    detailed_transcript = transcription_service.transcribe_with_timestamps(audio_path)
    return detailed_transcript

@task(name="Generar Timestamped Questions", retries=2)
def generate_timestamped_questions(detailed_transcript: str):
    """Genera preguntas con Claude"""
    questions = question_service.generate_timestamped_questions(detailed_transcript)
    return questions


@task(name="Crear Interactive H5P Video")
def create_interactive_video(questions, video_url: str, title: str):
    """Crear H5P Interactivo Video"""
    h5p_content = h5p_service.create_interactive_video(questions, video_url, title)
    return h5p_content

@task(name="Cleanup Temporary Files")
def cleanup(audio_path: str):
    """Elimina archivo temporales"""
    if os.path.exists(audio_path):
        os.remove(audio_path)


@task(name="Save to Database")
def save_to_database(video_data: dict, force: bool = False):
    """Guardar video procesando en la base de datos"""

    with get_db_session() as db:
        video_repository = VideoRepository(db)
        existing = video_repository.get_by_youtube_id(video_data['video_id'])
        if existing and force:
            # Actualizar influyendo h5p_content
            print(f"⚠️  Video {video_data['video_id']} ya existe en DB")

            existing.title = video_data['title']
            existing.duration = video_data['duration']
            existing.transcript = video_data['transcript']
            existing.url = video_data['url']
            existing.h5p_content = video_data['h5p_content']
            existing.full_transcript_data = json.dumps(video_data.get('full_transcript_data'))

            for q in existing.questions:
                db.delete(q)

            for q_data in video_data['questions']:
                question = Question(
                    video_id=existing.id,
                    timestamp=q_data['timestamp'],
                    question=q_data['question'],
                    answers=q_data['answers'],
                    correct_answer=q_data['correct_answer'],
                    explanation=q_data.get('explanation')
                )
                db.add(question)

            db.add(existing)
            db.commit()

            print(f"✅ Video actualizado en DB con ID: {existing.id}")
            return existing.id
        elif existing and not force:
            print(f"⚠️  Video {video_data['video_id']} ya existe en DB")
            return existing.id
        else:

            # Crear nuevo
            video = video_repository.create(
                youtube_id=video_data['video_id'],
                youtube_url=video_data['url'],
                title=video_data['title'],
                duration=video_data['duration'],
                transcript=video_data['transcript'],
                questions=[TimestampedQuestion(**q) for q in video_data['questions']],
                h5p_content=video_data['h5p_content'],
                full_transcript_data=video_data.get('full_transcript_data')
            )

            print(f"✅ Video guardado en DB con ID: {video.id}")
            return video.id

@task(name="Guardar Timestamp Segments", retries=2)
def save_video_segments(video_id: str):
    """Guardar video segmentos"""

    with get_db_session() as db:
        video = db.get(Video, video_id)
        segment_service = SegmentService()
        segments = segment_service.extract_and_save_segments(video, db)
        print(f"Creados {len(segments)} segmentos para el video")


@flow(name="Process Video", log_prints=True)
def process_video_flow(video_url: str, force: bool = False):
    """
    Flow principal para procesar videos de YouTube
    :param video_url:
    :return:
    """

    print(f"🎬 Iniciando procesamiento: {video_url}{' (FORZADO)' if force else ''}")

    # 1. Descargar
    audio_path, metadata = download_audio(video_url)
    print(f"✅ Audio descargado: {metadata['title']}")

    # 2. Transcribe con timestamps
    detailed_transcript = transcribe_with_timestamps(audio_path)
    print(f"✅ Transcripción completa: {len(detailed_transcript.segments)} caracteres")

    # 3. Generar preguntas
    questions = generate_timestamped_questions(detailed_transcript)
    print(f"✅ {len(questions)} preguntas generadas con timestamps")
    for q in questions:
        print(f'    - {q.timestamp:.1f}s: {q.question[:50]}...')

    # 4. Crear H5P
    h5p_content = create_interactive_video(questions, video_url, metadata['title'])
    print(f"✅ H5P Interactive Video creado")

    # 5. Guardar en DB
    video_data = {
        "video_id": metadata['video_id'],
        "title": metadata['title'],
        "duration": metadata['duration'],
        "url": video_url,
        "transcript": detailed_transcript.full_text,
        "questions": [q.dict() for q in questions],
        "h5p_content": h5p_content,
        "full_transcript_data": detailed_transcript.dict()
    }
    db_id = save_to_database(video_data, force)

    # Guardar Video Segmentos
    save_video_segments(db_id)

    # 6. Cleanup
    cleanup(audio_path)
    print(f"🧹 Archivos temporales eliminados")

    return {
        "id": db_id,
        "video_id": metadata['video_id'],
        "title": metadata['title'],
        "duration": metadata['duration'],
        "url": video_url,
        "transcript": detailed_transcript.full_text,
        "questions": [q.dict() for q in questions],
        "h5p_content": h5p_content
    }

