// types/index.ts
export interface Question {
  question: string;
  answers: string[];
  correct_answer: number;
  explanation?: string;
}

export interface TimestampedQuestion extends Question {
    id?: number;  // Database ID (optional for backward compatibility)
    timestamp: number;
}


export interface FillInBlankExercise {
  id?: number;
  original_text: string;
  exercise_text: string;  // Text with "___" blanks
  answers: Record<string, string>;  // { "blank_0": "correct_word", ... }
  hints: Record<string, string>;  // { "blank_0": "verbo - subjuntivo", ... }
  start_time: number;
  end_time: number;
  difficulty: 'facil' | 'medio' | 'dificil';
}

export interface VideoResponse {
  id: any;
  video_id: string;
  title: string;
  duration: number;
  transcript: string;
  questions: TimestampedQuestion[];
  fill_in_blank_exercises?: FillInBlankExercise[];
}

export interface VideosResponse {
    videos: VideoResponse[]
}

export interface VideoRequest {
  url: string;
}


export interface FlowStatus {
    flow_run_id: string;
    status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'EXISTS';
    url: string;
    message?: string;
    result?: VideoResponse;
    error?: string;
}

export interface QuestionProgress {
    question_id: number;
    user_answer: number;
    is_correct: boolean;
    answered_at: string;
}

export interface ProgressSummary {
    answered: number;
    correct: number;
    incorrect: number;
}

export interface VideoProgress {
    video_id: string;
    summary: ProgressSummary;
    progress: QuestionProgress[];
}

export interface DialectClassification {
    dialect: string;
    confidence: number;
    signals: string[];
    is_sample?: boolean;
}

export interface YouTubeSearchResult {
    video_id: string;
    url: string;
    title: string;
    description: string;
    thumbnail: string;
    channel_title: string;
    published_at: string;
    duration: number;
    duration_formatted: string;
    view_count: number;
    view_count_formatted: string;
    dialect?: DialectClassification | null;
}

export interface SearchResponse {
    results: YouTubeSearchResult[];
}
