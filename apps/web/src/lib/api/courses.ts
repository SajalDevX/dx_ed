import apiClient from './client';
import type { Course, Enrollment, ApiResponse } from '@/types';

interface CoursesResponse {
  courses: Course[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasMore: boolean;
  };
}

interface CourseQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  pricing?: 'free' | 'paid';
  search?: string;
  sort?: 'newest' | 'popular' | 'rating' | 'price-low' | 'price-high';
}

export const coursesApi = {
  getCourses: async (params?: CourseQueryParams): Promise<ApiResponse<CoursesResponse>> => {
    const response = await apiClient.get('/courses', { params });
    return response.data;
  },

  getCourseBySlug: async (
    slug: string
  ): Promise<ApiResponse<{ course: Course; isEnrolled: boolean; enrollment: Enrollment | null }>> => {
    const response = await apiClient.get(`/courses/${slug}`);
    return response.data;
  },

  getCourseCurriculum: async (
    slug: string
  ): Promise<ApiResponse<{ modules: Course['content']['modules']; progress: Enrollment['progress'] | null }>> => {
    const response = await apiClient.get(`/courses/${slug}/curriculum`);
    return response.data;
  },

  enrollInCourse: async (
    slug: string
  ): Promise<ApiResponse<{ enrollment?: Enrollment; requiresPayment?: boolean; price?: number }>> => {
    const response = await apiClient.post(`/courses/${slug}/enroll`);
    return response.data;
  },

  markLessonComplete: async (
    slug: string,
    lessonId: string
  ): Promise<ApiResponse<{ progress: Enrollment['progress']; completed: boolean }>> => {
    const response = await apiClient.patch(`/courses/${slug}/lessons/${lessonId}/complete`);
    return response.data;
  },

  getRecommendations: async (limit?: number): Promise<ApiResponse<{ recommendations: Course[]; total: number }>> => {
    const response = await apiClient.get('/courses/recommendations/for-you', {
      params: { limit }
    });
    return response.data;
  },

  // Instructor routes
  getInstructorCourses: async (): Promise<ApiResponse<{ courses: Course[] }>> => {
    const response = await apiClient.get('/courses/instructor/my-courses');
    return response.data;
  },

  createCourse: async (data: Partial<Course>): Promise<ApiResponse<{ course: Course }>> => {
    const response = await apiClient.post('/courses', data);
    return response.data;
  },

  updateCourse: async (id: string, data: Partial<Course>): Promise<ApiResponse<{ course: Course }>> => {
    const response = await apiClient.patch(`/courses/${id}`, data);
    return response.data;
  },

  publishCourse: async (id: string): Promise<ApiResponse<{ course: Course }>> => {
    const response = await apiClient.post(`/courses/${id}/publish`);
    return response.data;
  },
};

export default coursesApi;
