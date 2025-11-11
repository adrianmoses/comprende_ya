// lib/api.ts
import axios from 'axios';
import {FlowStatus, VideoRequest, VideoResponse} from '@/types';

const API_BASE_URL = process.env.API_URL || 'http://localhost:8000';

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