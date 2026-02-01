// lib/api.ts
import axios from 'axios';
import {FlowStatus, VideoRequest, VideoResponse, VideosResponse, VideoProgress, SearchResponse} from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const processVideo = async (url: string): Promise<VideoResponse> => {
  const response = await apiClient.post<VideoResponse>('/api/videos/process', {
    url,
  });
  return response.data;
};

export const processVideoAsync = async (url: string, force: boolean): Promise<FlowStatus> => {
    const response = await apiClient.post<FlowStatus>(`/api/videos/process-async?force=${force}`, {
        url,
    });
    return response.data;
};

export const getFlowStatus = async (flowRunId: string | null): Promise<FlowStatus> => {
    const response = await apiClient.get<FlowStatus>(`/api/videos/status/${flowRunId}`);
    return response.data;
}

export const checkHealth = async () => {
  const response = await apiClient.get('/health');
  return response.data;
};

export const fetchVideo = async (videoId: string): Promise<VideoResponse> => {
    const response = await apiClient.get<VideoResponse>(`/api/videos/${videoId}`);
    return response.data
}

export const listVideos = async (): Promise<VideosResponse> => {
    const response = await apiClient.get<VideosResponse>(`/api/videos/`);
    return response.data;
}

// Progress tracking API

export const saveProgress = async (
    videoId: string,
    questionId: number,
    userAnswer: number
): Promise<{ question_id: number; user_answer: number; is_correct: boolean; answered_at: string }> => {
    const response = await apiClient.post(`/api/videos/${videoId}/progress`, null, {
        params: {
            question_id: questionId,
            user_answer: userAnswer
        }
    });
    return response.data;
};

export const getProgress = async (videoId: string): Promise<VideoProgress> => {
    const response = await apiClient.get<VideoProgress>(`/api/videos/${videoId}/progress`);
    return response.data;
};

export const resetProgress = async (videoId: string): Promise<{ video_id: string; deleted_count: number; message: string }> => {
    const response = await apiClient.delete(`/api/videos/${videoId}/progress`);
    return response.data;
};

// YouTube Search API
export const searchYouTubeVideos = async (
    query: string,
    maxResults: number = 10
): Promise<SearchResponse> => {
    const response = await apiClient.get<SearchResponse>('/api/videos/search', {
        params: {
            query,
            max_results: maxResults
        }
    });
    return response.data;
};

export const classifyVideo = async (videoId: string) => {
    const response = await apiClient.get(`/api/videos/search/classify/${videoId}`);
    return response.data;
};