from typing import List
import json
from sqlmodel import Session, select
from models.database import Video, VideoSegment


class SegmentService:

    def extract_and_save_segments(self, video: Video, session: Session) -> List[VideoSegment]:
        """
        Extrae segmentos del full_transcript_data y los guarda en la base de datos
        """
        if not video.full_transcript_data:
            raise ValueError("No hay datos de transcripción detallada")

        # Parsear el JSON
        transcript_data = json.loads(video.full_transcript_data)
        segments_data = transcript_data.get("segments", [])

        # Borrar segmentos existentes si los hay
        existing_segments = session.exec(
            select(VideoSegment).where(VideoSegment.video_id == video.id)
        ).all()
        for seg in existing_segments:
            session.delete(seg)

        # Crear nuevos segmentos
        new_segments = []
        for idx, segment in enumerate(segments_data, start=1):
            video_segment = VideoSegment(
                video_id=video.id,
                segment_number=idx,
                transcript_text=segment["text"].strip(),
                start_time=segment["start"],
                end_time=segment["end"]
            )
            session.add(video_segment)
            new_segments.append(video_segment)

        session.commit()
        return new_segments

