import { apiClient } from './client';

export interface DailyUsageResponse {
  used: number;
  limit: number;
  remaining: number;
  resetsAt: string;
}

export interface GenerateContentResponse {
  content: string;
  usage: {
    used: number;
    limit: number;
    remaining: number;
  };
  generatedAt: string;
}

export interface GenerationHistoryItem {
  prompt: string;
  content: string;
  createdAt: string;
  date: string;
}

export interface GenerationHistoryResponse {
  history: GenerationHistoryItem[];
  total: number;
}

export const aiApi = {
  // Get daily usage for a course
  getDailyUsage: async (courseId: string) => {
    const response = await apiClient.get<{ data: DailyUsageResponse }>(
      `/ai/student/daily-usage/${courseId}`
    );
    return response.data;
  },

  // Generate content for a course
  generateContent: async (courseId: string, prompt: string) => {
    const response = await apiClient.post<{ data: GenerateContentResponse }>(
      `/ai/student/generate`,
      { courseId, prompt }
    );
    return response.data;
  },

  // Get generation history for a course
  getHistory: async (courseId: string) => {
    const response = await apiClient.get<{ data: GenerationHistoryResponse }>(
      `/ai/student/history/${courseId}`
    );
    return response.data;
  },
};
