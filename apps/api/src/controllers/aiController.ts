import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { z } from 'zod';
import { aiService, AIProvider } from '../services/aiService.js';
import { Course } from '../models/Course.js';
import { Quiz } from '../models/Quiz.js';
import AIGeneration from '../models/AIGeneration.js';
import { Enrollment } from '../models/Enrollment.js';
import { ApiError } from '../utils/ApiError.js';

// Provider schema for optional provider selection
const providerSchema = z.enum(['openai', 'gemini']).optional();

// Validation schemas
const generateArticleSchema = z.object({
  courseId: z.string().min(1),
  moduleId: z.string().min(1),
  lessonTitle: z.string().min(1).max(200),
  provider: providerSchema,
});

const generateQuizQuestionsSchema = z.object({
  courseId: z.string().min(1),
  moduleId: z.string().min(1),
  lessonId: z.string().optional(),
  numberOfQuestions: z.number().int().min(5).max(50).default(20),
  difficulty: z.enum(['easy', 'medium', 'hard', 'mixed']).default('mixed'),
  provider: providerSchema,
});

const generateCourseOutlineSchema = z.object({
  topic: z.string().min(1).max(200),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  targetAudience: z.string().min(1).max(500),
  numberOfModules: z.number().int().min(2).max(10).default(5),
  lessonsPerModule: z.number().int().min(3).max(10).default(5),
  provider: providerSchema,
});

const improveArticleSchema = z.object({
  courseId: z.string().min(1),
  moduleId: z.string().min(1),
  lessonId: z.string().min(1),
  instructions: z.string().min(10).max(1000),
  provider: providerSchema,
});

const addQuestionsToPoolSchema = z.object({
  courseId: z.string().min(1),
  moduleId: z.string().min(1),
  topics: z.array(z.string()).min(1),
  numberOfQuestions: z.number().int().min(5).max(30).default(15),
  provider: providerSchema,
});

/**
 * Get available AI providers
 * GET /api/v1/ai/providers
 */
export const getProviders = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const providers = aiService.getAvailableProviders();
    res.status(200).json({
      success: true,
      data: {
        providers,
        default: providers.includes('gemini') ? 'gemini' : providers[0] || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate article content for a lesson
 * POST /api/v1/ai/generate-article
 */
export const generateArticle = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { courseId, moduleId, lessonTitle, provider } = generateArticleSchema.parse(req.body);

    // Find the course
    const course = await Course.findById(courseId);
    if (!course) {
      throw ApiError.notFound('Course not found');
    }

    // Verify user owns this course or is admin
    if (
      course.instructor.toString() !== req.userId &&
      !['admin', 'superadmin'].includes(req.user!.role)
    ) {
      throw ApiError.forbidden('You can only generate content for your own courses');
    }

    // Find the module
    const module = course.content.modules.find(
      (m) => m._id.toString() === moduleId
    );
    if (!module) {
      throw ApiError.notFound('Module not found');
    }

    // Get previous lesson titles for context
    const previousLessons = module.lessons
      .filter((l) => l.type === 'article')
      .map((l) => l.title);

    // Generate article content
    const result = await aiService.generateArticle({
      courseTitle: course.title,
      moduleTitle: module.title,
      lessonTitle,
      courseDescription: course.description,
      level: course.level as 'beginner' | 'intermediate' | 'advanced',
      previousLessons,
      provider: provider as AIProvider,
    });

    res.status(200).json({
      success: true,
      data: {
        content: result.content,
        metadata: {
          courseId,
          moduleId,
          lessonTitle,
          provider: result.provider,
          generatedAt: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate quiz questions for a module/course
 * POST /api/v1/ai/generate-questions
 */
export const generateQuizQuestions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { courseId, moduleId, lessonId, numberOfQuestions, difficulty, provider } =
      generateQuizQuestionsSchema.parse(req.body);

    // Find the course
    const course = await Course.findById(courseId);
    if (!course) {
      throw ApiError.notFound('Course not found');
    }

    // Verify user owns this course or is admin
    if (
      course.instructor.toString() !== req.userId &&
      !['admin', 'superadmin'].includes(req.user!.role)
    ) {
      throw ApiError.forbidden('You can only generate content for your own courses');
    }

    // Find the module
    const module = course.content.modules.find(
      (m) => m._id.toString() === moduleId
    );
    if (!module) {
      throw ApiError.notFound('Module not found');
    }

    // Collect article content from the module for context
    let articleContent = '';
    if (lessonId) {
      const lesson = module.lessons.find((l) => l._id.toString() === lessonId);
      if (lesson && lesson.content?.articleContent) {
        articleContent = lesson.content.articleContent;
      }
    } else {
      // Use all article content from the module
      articleContent = module.lessons
        .filter((l) => l.type === 'article' && l.content?.articleContent)
        .map((l) => `## ${l.title}\n${l.content!.articleContent}`)
        .join('\n\n');
    }

    if (!articleContent) {
      throw ApiError.badRequest(
        'No article content found to generate questions from. Please add lesson content first.'
      );
    }

    // Generate questions
    const result = await aiService.generateQuizQuestions({
      courseTitle: course.title,
      moduleTitle: module.title,
      articleContent,
      numberOfQuestions,
      difficulty,
      provider: provider as AIProvider,
    });

    res.status(200).json({
      success: true,
      data: {
        questions: result.questions,
        metadata: {
          courseId,
          moduleId,
          lessonId,
          count: result.questions.length,
          provider: result.provider,
          generatedAt: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate a complete course outline
 * POST /api/v1/ai/generate-course-outline
 */
export const generateCourseOutline = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { provider, ...params } = generateCourseOutlineSchema.parse(req.body);

    const result = await aiService.generateCourseOutline({
      ...params,
      provider: provider as AIProvider,
    });

    res.status(200).json({
      success: true,
      data: {
        outline: result.outline,
        metadata: {
          provider: result.provider,
          generatedAt: new Date().toISOString(),
          generatedBy: req.userId,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Improve existing article content
 * POST /api/v1/ai/improve-article
 */
export const improveArticle = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { courseId, moduleId, lessonId, instructions, provider } =
      improveArticleSchema.parse(req.body);

    // Find the course
    const course = await Course.findById(courseId);
    if (!course) {
      throw ApiError.notFound('Course not found');
    }

    // Verify user owns this course or is admin
    if (
      course.instructor.toString() !== req.userId &&
      !['admin', 'superadmin'].includes(req.user!.role)
    ) {
      throw ApiError.forbidden('You can only modify content for your own courses');
    }

    // Find the module and lesson
    const module = course.content.modules.find(
      (m) => m._id.toString() === moduleId
    );
    if (!module) {
      throw ApiError.notFound('Module not found');
    }

    const lesson = module.lessons.find((l) => l._id.toString() === lessonId);
    if (!lesson) {
      throw ApiError.notFound('Lesson not found');
    }

    if (!lesson.content?.articleContent) {
      throw ApiError.badRequest('Lesson has no article content to improve');
    }

    // Improve the article
    const result = await aiService.improveArticle(
      lesson.content.articleContent,
      instructions,
      provider as AIProvider
    );

    res.status(200).json({
      success: true,
      data: {
        originalContent: lesson.content.articleContent,
        improvedContent: result.content,
        metadata: {
          courseId,
          moduleId,
          lessonId,
          instructions,
          provider: result.provider,
          improvedAt: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add AI-generated questions to course question pool
 * POST /api/v1/ai/add-questions-to-pool
 */
export const addQuestionsToPool = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { courseId, moduleId, topics, numberOfQuestions, provider } =
      addQuestionsToPoolSchema.parse(req.body);

    // Find the course
    const course = await Course.findById(courseId);
    if (!course) {
      throw ApiError.notFound('Course not found');
    }

    // Verify user owns this course or is admin
    if (
      course.instructor.toString() !== req.userId &&
      !['admin', 'superadmin'].includes(req.user!.role)
    ) {
      throw ApiError.forbidden('You can only modify content for your own courses');
    }

    // Find the module
    const module = course.content.modules.find(
      (m) => m._id.toString() === moduleId
    );
    if (!module) {
      throw ApiError.notFound('Module not found');
    }

    // Find existing quiz for this module or create reference
    let quiz = await Quiz.findOne({
      course: new Types.ObjectId(courseId),
      module: new Types.ObjectId(moduleId),
    });

    const existingQuestionsCount = quiz?.questions?.length || 0;

    // Generate new questions
    const result = await aiService.generateQuestionBankQuestions(
      course.title,
      module.title,
      topics,
      existingQuestionsCount,
      numberOfQuestions,
      provider as AIProvider
    );

    // Format questions with ObjectIds
    const formattedQuestions = result.questions.map((q, index) => ({
      _id: new Types.ObjectId(),
      type: q.type,
      question: q.question,
      options: q.options.map((opt) => ({
        _id: new Types.ObjectId(),
        text: opt.text,
        isCorrect: opt.isCorrect,
        media: null,
      })),
      explanation: q.explanation,
      difficulty: q.difficulty,
      points: q.points,
      order: existingQuestionsCount + index + 1,
      questionMedia: null,
      correctAnswer: null,
      tags: topics,
    }));

    if (quiz) {
      // Add questions to existing quiz
      quiz.questions.push(...(formattedQuestions as any[]));
      await quiz.save();
    } else {
      // Create new quiz with the questions
      const quizLesson = module.lessons.find((l) => l.type === 'quiz');

      quiz = await Quiz.create({
        course: new Types.ObjectId(courseId),
        module: new Types.ObjectId(moduleId),
        lesson: quizLesson?._id || null,
        title: `${course.title} - ${module.title} Quiz`,
        description: `Quiz for ${module.title}`,
        type: 'practice',
        settings: {
          timeLimit: 600, // 10 minutes
          passingScore: 70,
          maxAttempts: 3,
          shuffleQuestions: true,
          shuffleAnswers: true,
          showCorrectAnswers: true,
          showExplanations: true,
        },
        questions: formattedQuestions,
        isActive: true,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        quizId: quiz._id,
        addedQuestions: formattedQuestions.length,
        totalQuestions: quiz.questions.length,
        provider: result.provider,
        message: `Added ${formattedQuestions.length} new questions to the question pool`,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate and save article content directly to a lesson
 * POST /api/v1/ai/generate-and-save-article
 */
export const generateAndSaveArticle = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { courseId, moduleId, lessonId, provider } = z.object({
      courseId: z.string().min(1),
      moduleId: z.string().min(1),
      lessonId: z.string().min(1),
      provider: providerSchema,
    }).parse(req.body);

    // Find the course
    const course = await Course.findById(courseId);
    if (!course) {
      throw ApiError.notFound('Course not found');
    }

    // Verify user owns this course or is admin
    if (
      course.instructor.toString() !== req.userId &&
      !['admin', 'superadmin'].includes(req.user!.role)
    ) {
      throw ApiError.forbidden('You can only generate content for your own courses');
    }

    // Find the module and lesson
    const moduleIndex = course.content.modules.findIndex(
      (m) => m._id.toString() === moduleId
    );
    if (moduleIndex === -1) {
      throw ApiError.notFound('Module not found');
    }

    const module = course.content.modules[moduleIndex];
    const lessonIndex = module.lessons.findIndex(
      (l) => l._id.toString() === lessonId
    );
    if (lessonIndex === -1) {
      throw ApiError.notFound('Lesson not found');
    }

    const lesson = module.lessons[lessonIndex];
    if (lesson.type !== 'article') {
      throw ApiError.badRequest('Can only generate content for article lessons');
    }

    // Get previous lesson titles for context
    const previousLessons = module.lessons
      .filter((l, i) => l.type === 'article' && i < lessonIndex)
      .map((l) => l.title);

    // Generate article content
    const result = await aiService.generateArticle({
      courseTitle: course.title,
      moduleTitle: module.title,
      lessonTitle: lesson.title,
      courseDescription: course.description,
      level: course.level as 'beginner' | 'intermediate' | 'advanced',
      previousLessons,
      provider: provider as AIProvider,
    });

    // Update the lesson content
    course.content.modules[moduleIndex].lessons[lessonIndex].content = {
      ...lesson.content,
      articleContent: result.content,
    };

    await course.save();

    res.status(200).json({
      success: true,
      data: {
        lessonId,
        content: result.content,
        provider: result.provider,
        message: 'Article content generated and saved successfully',
      },
    });
  } catch (error) {
    next(error);
  }
};

// ========================================
// STUDENT-FACING AI CONTENT GENERATION
// ========================================

const DAILY_GENERATION_LIMIT = 2;

/**
 * Get student's daily AI generation usage for a course
 * GET /api/v1/ai/student/daily-usage/:courseId
 */
export const getStudentDailyUsage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { courseId } = req.params;
    const userId = req.userId!;

    // Verify user is subscribed
    const user = req.user!;
    if (!user.subscription || user.subscription.plan === 'free') {
      throw ApiError.forbidden('This feature is only available for subscribed users');
    }

    // Verify user is enrolled in the course
    const enrollment = await Enrollment.findOne({
      user: new Types.ObjectId(userId),
      course: new Types.ObjectId(courseId),
    });

    if (!enrollment) {
      throw ApiError.forbidden('You must be enrolled in this course to use this feature');
    }

    // Get today's date (start of day in UTC)
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Find or create today's generation record
    let generationRecord = await AIGeneration.findOne({
      user: new Types.ObjectId(userId),
      course: new Types.ObjectId(courseId),
      date: today,
    });

    const used = generationRecord?.generationsUsed || 0;
    const remaining = Math.max(0, DAILY_GENERATION_LIMIT - used);

    res.status(200).json({
      success: true,
      data: {
        used,
        limit: DAILY_GENERATION_LIMIT,
        remaining,
        resetsAt: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate custom content for a student
 * POST /api/v1/ai/student/generate
 */
export const generateStudentContent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { courseId, prompt } = z.object({
      courseId: z.string().min(1),
      prompt: z.string().min(10).max(1000),
    }).parse(req.body);

    const userId = req.userId!;

    // Verify user is subscribed
    const user = req.user!;
    if (!user.subscription || user.subscription.plan === 'free') {
      throw ApiError.forbidden('This feature is only available for subscribed users');
    }

    // Verify user is enrolled in the course
    const enrollment = await Enrollment.findOne({
      user: new Types.ObjectId(userId),
      course: new Types.ObjectId(courseId),
    });

    if (!enrollment) {
      throw ApiError.forbidden('You must be enrolled in this course to use this feature');
    }

    // Get today's date (start of day in UTC)
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Find or create today's generation record
    let generationRecord = await AIGeneration.findOne({
      user: new Types.ObjectId(userId),
      course: new Types.ObjectId(courseId),
      date: today,
    });

    // Check daily limit
    const used = generationRecord?.generationsUsed || 0;
    if (used >= DAILY_GENERATION_LIMIT) {
      throw ApiError.forbidden(
        `Daily generation limit reached. You can generate ${DAILY_GENERATION_LIMIT} pieces of content per day. Your limit resets at midnight UTC.`
      );
    }

    // Get course details for context
    const course = await Course.findById(courseId);
    if (!course) {
      throw ApiError.notFound('Course not found');
    }

    // Generate content using AI service
    const result = await aiService.generateCustomStudentContent({
      courseTitle: course.title,
      courseDescription: course.description,
      level: course.level as 'beginner' | 'intermediate' | 'advanced',
      studentPrompt: prompt,
    });

    // Save or update generation record
    if (!generationRecord) {
      generationRecord = await AIGeneration.create({
        user: new Types.ObjectId(userId),
        course: new Types.ObjectId(courseId),
        date: today,
        generationsUsed: 1,
        generations: [{
          prompt,
          content: result.content,
          createdAt: new Date(),
        }],
      });
    } else {
      generationRecord.generationsUsed += 1;
      generationRecord.generations.push({
        prompt,
        content: result.content,
        createdAt: new Date(),
      });
      await generationRecord.save();
    }

    const remaining = DAILY_GENERATION_LIMIT - generationRecord.generationsUsed;

    res.status(200).json({
      success: true,
      data: {
        content: result.content,
        usage: {
          used: generationRecord.generationsUsed,
          limit: DAILY_GENERATION_LIMIT,
          remaining,
        },
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get student's generation history for a course
 * GET /api/v1/ai/student/history/:courseId
 */
export const getStudentGenerationHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { courseId } = req.params;
    const userId = req.userId!;

    // Verify user is subscribed
    const user = req.user!;
    if (!user.subscription || user.subscription.plan === 'free') {
      throw ApiError.forbidden('This feature is only available for subscribed users');
    }

    // Get all generation records for this user and course (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const records = await AIGeneration.find({
      user: new Types.ObjectId(userId),
      course: new Types.ObjectId(courseId),
      date: { $gte: thirtyDaysAgo },
    })
      .sort({ date: -1 })
      .limit(30);

    const history = records.flatMap(record =>
      record.generations.map(gen => ({
        prompt: gen.prompt,
        content: gen.content,
        createdAt: gen.createdAt,
        date: record.date,
      }))
    );

    res.status(200).json({
      success: true,
      data: {
        history,
        total: history.length,
      },
    });
  } catch (error) {
    next(error);
  }
};
