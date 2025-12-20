import { Router } from 'express';
import {
  generateArticle,
  generateQuizQuestions,
  generateCourseOutline,
  improveArticle,
  addQuestionsToPool,
  generateAndSaveArticle,
  getProviders,
  getStudentDailyUsage,
  generateStudentContent,
  getStudentGenerationHistory,
} from '../controllers/aiController.js';
import { authenticate, requirePremium, requireInstructor } from '../middleware/auth.js';

const router = Router();

// ========================================
// STUDENT-FACING AI ROUTES
// Require authentication but NOT instructor role
// ========================================

/**
 * @route   GET /api/v1/ai/student/daily-usage/:courseId
 * @desc    Get student's daily AI generation usage for a course
 * @access  Private (Authenticated + Subscribed)
 */
router.get('/student/daily-usage/:courseId', authenticate, getStudentDailyUsage);

/**
 * @route   POST /api/v1/ai/student/generate
 * @desc    Generate custom content for a student
 * @access  Private (Authenticated + Subscribed)
 */
router.post('/student/generate', authenticate, generateStudentContent);

/**
 * @route   GET /api/v1/ai/student/history/:courseId
 * @desc    Get student's generation history for a course
 * @access  Private (Authenticated + Subscribed)
 */
router.get('/student/history/:courseId', authenticate, getStudentGenerationHistory);

// All AI routes require authentication, premium subscription, and instructor role
router.use(authenticate);
router.use(requirePremium);
router.use(requireInstructor);

/**
 * @route   GET /api/v1/ai/providers
 * @desc    Get available AI providers
 * @access  Private (Premium + Instructor)
 */
router.get('/providers', getProviders);

/**
 * @route   POST /api/v1/ai/generate-article
 * @desc    Generate article content for a lesson
 * @access  Private (Premium + Instructor)
 */
router.post('/generate-article', generateArticle);

/**
 * @route   POST /api/v1/ai/generate-and-save-article
 * @desc    Generate article content and save directly to lesson
 * @access  Private (Premium + Instructor)
 */
router.post('/generate-and-save-article', generateAndSaveArticle);

/**
 * @route   POST /api/v1/ai/generate-questions
 * @desc    Generate quiz questions based on lesson content
 * @access  Private (Premium + Instructor)
 */
router.post('/generate-questions', generateQuizQuestions);

/**
 * @route   POST /api/v1/ai/generate-course-outline
 * @desc    Generate a complete course outline
 * @access  Private (Premium + Instructor)
 */
router.post('/generate-course-outline', generateCourseOutline);

/**
 * @route   POST /api/v1/ai/improve-article
 * @desc    Improve existing article content with AI
 * @access  Private (Premium + Instructor)
 */
router.post('/improve-article', improveArticle);

/**
 * @route   POST /api/v1/ai/add-questions-to-pool
 * @desc    Add AI-generated questions to course question pool
 * @access  Private (Premium + Instructor)
 */
router.post('/add-questions-to-pool', addQuestionsToPool);

export default router;
