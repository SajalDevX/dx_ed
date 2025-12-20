import apiClient from './client';
import type { ApiResponse, Course, Enrollment } from '@/types';

export interface DashboardData {
  user: {
    firstName: string;
    lastName: string;
    avatar?: string;
    points: number;
    level: number;
    badges: number;
    streak: {
      current: number;
      longest: number;
      lastActivityDate?: Date;
    };
  };
  stats: {
    xpProgress: {
      current: number;
      nextLevel: number;
      percentage: number;
    };
    enrolledCourses: number;
    completedCourses: number;
    activeCourses: number;
    totalBadges: number;
    currentStreak: number;
    longestStreak: number;
    weeklyStats: {
      timeSpent: number;
      lessonsCompleted: number;
      quizzesAttempted: number;
      avgQuizScore: number;
    };
  };
  enrolledCourses: Array<{
    course: Course;
    progress: {
      percentage: number;
      currentLesson?: string;
      completedLessons: number;
      timeSpent: number;
    };
    lastAccessedAt?: Date;
    enrolledAt: Date;
    estimatedTimeToComplete: number;
  }>;
  recentAchievements: Array<{
    badge: any;
    earnedAt: Date;
    isNew: boolean;
  }>;
  learningStreak: {
    current: number;
    isActiveToday: boolean;
    nextMilestone: number;
  };
}

export const usersApi = {
  getDashboard: async (): Promise<ApiResponse<DashboardData>> => {
    const response = await apiClient.get('/users/dashboard');
    return response.data;
  },

  getEnrollments: async (status?: string): Promise<ApiResponse<{ enrollments: Enrollment[] }>> => {
    const response = await apiClient.get('/users/enrollments', {
      params: { status }
    });
    return response.data;
  },

  getProfile: async (): Promise<ApiResponse<{ user: any }>> => {
    const response = await apiClient.get('/users/profile');
    return response.data;
  },

  updateProfile: async (data: any): Promise<ApiResponse<{ user: any }>> => {
    const response = await apiClient.patch('/users/profile', data);
    return response.data;
  },

  getProgressOverview: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.get('/users/progress');
    return response.data;
  },

  getCertificates: async (): Promise<ApiResponse<{ certificates: any[] }>> => {
    const response = await apiClient.get('/users/certificates');
    return response.data;
  },

  getBadges: async (): Promise<ApiResponse<{ badges: any[] }>> => {
    const response = await apiClient.get('/users/badges');
    return response.data;
  },
};

export default usersApi;
