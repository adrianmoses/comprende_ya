# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ComprendeYa Web is the frontend application for ComprendeYa, a Spanish language comprehension tool. This React/TypeScript application provides the user interface for processing YouTube videos and interacting with comprehension exercises.

**Stack:** TanStack Start (React/TypeScript) with Vite

## Development Commands

```bash
# Install dependencies
npm install

# Run development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

## Environment Configuration

Create `.env.local` with:

```
VITE_API_URL=http://localhost:8000
```

The `VITE_API_URL` points to the ComprendeYa API backend.

## Architecture

### File-Based Routing

Routes are defined in `src/routes/` using TanStack Router:

- `__root.tsx` - Root layout with providers
- `index.tsx` - Home page (video list)
- `add-video.tsx` - Add new video form
- `videos.tsx` - Videos listing
- `video.$videoId.tsx` - Single video detail page

### Components

Located in `src/components/`:

- `VideoInput.tsx` - YouTube URL input form
- `YouTubeSearch.tsx` - YouTube video search
- `VideoWithQuestions.tsx` - Video player with questions
- `QuestionsList.tsx` - Multiple choice questions display
- `TimestampedQuestionsList.tsx` - Questions with video timestamps
- `FillInBlankExercise.tsx` / `FillInBlankExercisesList.tsx` - Fill-in-blank exercises
- `ProcessingStatus.tsx` / `FlowStatusDisplay.tsx` - Video processing status
- `ui/` - shadcn/ui components (button, input, form, label)

### API Client

The API client (`src/lib/api.ts`) uses axios with base URL from `VITE_API_URL`:

- `processVideo(url)` - Process a YouTube video synchronously
- `processVideoAsync(url, force)` - Process video asynchronously
- `getFlowStatus(flowRunId)` - Check async processing status
- `fetchVideo(videoId)` - Get video details
- `listVideos()` - List all processed videos
- `saveProgress(videoId, questionId, userAnswer)` - Save user progress
- `getProgress(videoId)` - Get user progress for a video
- `resetProgress(videoId)` - Reset progress
- `searchYouTubeVideos(query)` - Search YouTube
- `classifyVideo(videoId)` - Classify video content

### Hooks

- `useFlowStatus.ts` - Hook for polling async video processing status

### Types

TypeScript types are defined in `src/types/index.ts`.

## Key Technical Details

- Uses TanStack Query for data fetching and caching
- shadcn/ui component library with Tailwind CSS
- Vite for development and build
- React 19 with TypeScript
