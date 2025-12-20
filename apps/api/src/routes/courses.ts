import { Router } from 'express';
import {
  getCourses,
  getCourseBySlug,
  getCourseCurriculum,
  enrollInCourse,
  markLessonComplete,
  getRecommendations,
  createCourse,
  updateCourse,
  addModule,
  addLesson,
  publishCourse,
  getInstructorCourses,
} from '../controllers/courseController.js';
import { authenticate, optionalAuth, authorize } from '../middleware/auth.js';

const router = Router();

// Public routes
router.get('/', optionalAuth, getCourses);
router.get('/:slug', optionalAuth, getCourseBySlug);

// Authenticated routes
router.get('/recommendations/for-you', authenticate, getRecommendations);
router.get('/:slug/curriculum', authenticate, getCourseCurriculum);
router.post('/:slug/enroll', authenticate, enrollInCourse);
router.patch('/:slug/lessons/:lessonId/complete', authenticate, markLessonComplete);

// Instructor routes
router.get('/instructor/my-courses', authenticate, authorize('instructor', 'admin', 'superadmin'), getInstructorCourses);
router.post('/', authenticate, authorize('instructor', 'admin', 'superadmin'), createCourse);
router.patch('/:id', authenticate, authorize('instructor', 'admin', 'superadmin'), updateCourse);
router.post('/:id/modules', authenticate, authorize('instructor', 'admin', 'superadmin'), addModule);
router.post('/:id/modules/:moduleId/lessons', authenticate, authorize('instructor', 'admin', 'superadmin'), addLesson);
router.post('/:id/publish', authenticate, authorize('instructor', 'admin', 'superadmin'), publishCourse);

export default router;
