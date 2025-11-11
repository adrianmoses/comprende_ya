# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ComprendeYa is a Spanish language comprehension tool that processes YouTube videos to generate comprehension exercises. It downloads audio from YouTube, transcribes it using OpenAI's Whisper, generates comprehension questions using Claude, and outputs H5P-compatible quiz content.

**Architecture:** Monorepo with FastAPI backend (Python) and TanStack Start frontend (React/TypeScript)

## Development Commands

### Backend (Python/FastAPI)

The backend uses `uv` for package management (modern Python package manager).

```bash
# Navigate to backend
cd backend

# Install dependencies (uv handles virtualenv automatically)
uv sync

# Run development server
uv run fastapi dev src/main.py

# The API will be available at http://localhost:8000
# API docs at http://localhost:8000/docs
```

### Frontend (React/TanStack Start)

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Environment Setup

The backend requires two API keys configured in `backend/.env`:

```
ANTHROPIC_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
```

Copy `backend/.env.example` to `backend/.env` and add your keys. The application will fail to start if these are not configured (see backend/src/config.py:11-14).

## Core Architecture

### Backend Service Flow

The main processing pipeline (`backend/src/api/routes/videos.py:14-49`):

1. **YouTube Download** (`services/youtube.py`) - Downloads audio from YouTube URL using yt-dlp, validates duration (max 1 hour), returns MP3 + metadata
2. **Transcription** (`services/transcription.py`) - Uses OpenAI Whisper API to transcribe Spanish audio
3. **Question Generation** (`services/questions.py`) - Uses Claude (claude-4-sonnet-20250514) to generate 5 multiple-choice comprehension questions from transcript
4. **H5P Formatting** (`services/h5p.py`) - Converts questions to H5P MultiChoice format for LMS compatibility
5. **Cleanup** - Removes temporary audio file

Each service is instantiated as a singleton (e.g., `youtube_service`, `transcription_service`) for use throughout the app.

### Data Flow

- **Input:** `VideoRequest` with YouTube URL (backend/src/models/schemas.py:4-5)
- **Output:** `VideoResponse` with video metadata, transcript, questions, and H5P content (backend/src/models/schemas.py:15-21)
- **Question Schema:** Each question has text, 4 answers, correct answer index (0-3), and explanation (backend/src/models/schemas.py:8-12)

### Frontend

Currently a TanStack Start starter template with file-based routing. The main route (`frontend/src/routes/index.tsx`) is a counter example that will need replacement with the ComprendeYa UI for video processing.

## Key Technical Details

- **Temporary files** stored in `backend/temp/` directory (created automatically via config.py:25)
- **CORS** configured for `http://localhost:3000` (backend/src/main.py:20)
- **Claude prompt** for questions uses JSON output format with structured schema (backend/src/services/questions.py:19-42)
- **Video duration limit** is 3600 seconds (1 hour) enforced in youtube.py:33
- **Language** hardcoded to Spanish ("es") in transcription.py:20

## Import Paths

Backend uses relative imports from `src/` directory. All imports are relative:
- Config: `from config import settings`
- Services: `from services.youtube import youtube_service`
- Models: `from models.schemas import Question`
- Routes in main.py: `from api.routes import videos`

## Known Issues

- `backend/src/services/youtube.py:33` references `settings.MAX_DURATION` but config.py defines it as `MAX_VIDEO_DURATION` (will cause AttributeError)
- `backend/src/api/routes/videos.py:47-48` creates HTTPException but should `raise` it (currently returns exception object instead of raising)
- Missing error handling for Claude API failures or malformed JSON responses
- No tests configured yet
