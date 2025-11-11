// types/index.ts
export interface Question {
  question: string;
  answers: string[];
  correct_answer: number;
  explanation?: string;
}

export interface TimestampedQuestion extends Question {
    timestamp: number;
}

export interface VideoResponse {
  video_id: string;
  title: string;
  duration: number;
  transcript: string;
  questions: TimestampedQuestion[];
  h5p_content: any;
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
