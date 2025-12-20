import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Course } from '../models/Course.js';
import { Enrollment } from '../models/Enrollment.js';
import { ApiError } from '../utils/ApiError.js';
import {
  createCourseSchema,
  updateCourseSchema,
  courseQuerySchema,
  createModuleSchema,
  createLessonSchema,
} from '../validators/course.js';

// Get all published courses (public)
export const getCourses = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const query = courseQuerySchema.parse(req.query);
    const { page, limit, category, level, pricing, search, sort } = query;

    // Build filter
    const filter: Record<string, unknown> = { status: 'published' };

    if (category && mongoose.Types.ObjectId.isValid(category)) {
      filter.category = new mongoose.Types.ObjectId(category);
    }

    if (level) {
      filter.level = level;
    }

    if (pricing) {
      filter['pricing.type'] = pricing === 'free' ? 'free' : { $in: ['paid', 'subscription'] };
    }

    if (search) {
      filter.$text = { $search: search };
    }

    // Build sort
    let sortOption: Record<string, 1 | -1> = { publishedAt: -1 };
    switch (sort) {
      case 'popular':
        sortOption = { 'stats.enrollments': -1 };
        break;
      case 'rating':
        sortOption = { 'stats.averageRating': -1 };
        break;
      case 'price-low':
        sortOption = { 'pricing.price': 1 };
        break;
      case 'price-high':
        sortOption = { 'pricing.price': -1 };
        break;
    }

    // Execute query
    const skip = (page - 1) * limit;

    const [courses, total] = await Promise.all([
      Course.find(filter)
        .populate('instructor', 'profile.firstName profile.lastName profile.avatar')
        .populate('category', 'name slug')
        .select('-content.modules.lessons.content')
        .sort(sortOption)
        .skip(skip)
        .limit(limit),
      Course.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        courses,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasMore: page * limit < total,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get single course by slug (public)
export const getCourseBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { slug } = req.params;

    const course = await Course.findOne({ slug, status: 'published' })
      .populate('instructor', 'profile.firstName profile.lastName profile.avatar profile.bio')
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug');

    if (!course) {
      throw ApiError.notFound('Course not found');
    }

    // Check if user is enrolled (if authenticated)
    let isEnrolled = false;
    let enrollment = null;

    if (req.userId) {
      enrollment = await Enrollment.findOne({
        user: req.userId,
        course: course._id,
      });
      isEnrolled = !!enrollment;
    }

    // Filter lesson content for non-enrolled users
    const courseData = course.toObject();

    if (!isEnrolled) {
      (courseData.content.modules as any[]) = courseData.content.modules.map((module) => ({
        ...module,
        lessons: module.lessons.map((lesson) => ({
          ...lesson,
          content: lesson.isPreview ? lesson.content : undefined,
        })),
      }));
    }

    res.json({
      success: true,
      data: {
        course: courseData,
        isEnrolled,
        enrollment,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get course curriculum (for enrolled users)
export const getCourseCurriculum = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { slug } = req.params;

    const course = await Course.findOne({ slug });

    if (!course) {
      throw ApiError.notFound('Course not found');
    }

    // Check enrollment
    const enrollment = await Enrollment.findOne({
      user: req.userId,
      course: course._id,
    });

    if (!enrollment && course.pricing.type !== 'free') {
      throw ApiError.forbidden('You are not enrolled in this course');
    }

    res.json({
      success: true,
      data: {
        modules: course.content.modules,
        progress: enrollment?.progress,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Enroll in course
export const enrollInCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { slug } = req.params;

    const course = await Course.findOne({ slug, status: 'published' });

    if (!course) {
      throw ApiError.notFound('Course not found');
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      user: req.userId,
      course: course._id,
    });

    if (existingEnrollment) {
      throw ApiError.conflict('Already enrolled in this course');
    }

    // For free courses, create enrollment directly
    if (course.pricing.type === 'free') {
      const enrollment = await Enrollment.create({
        user: req.userId,
        course: course._id,
        payment: {
          amount: 0,
          method: 'free',
        },
      });

      // Update course stats
      course.stats.enrollments += 1;
      await course.save();

      res.status(201).json({
        success: true,
        data: { enrollment },
        message: 'Successfully enrolled in course',
      });
      return;
    }

    // For paid courses, return checkout info
    // This will be handled by payment routes
    res.json({
      success: true,
      data: {
        requiresPayment: true,
        price: course.pricing.price,
        currency: course.pricing.currency,
        courseId: course._id,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Mark lesson complete
export const markLessonComplete = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { slug, lessonId } = req.params;

    const course = await Course.findOne({ slug });

    if (!course) {
      throw ApiError.notFound('Course not found');
    }

    const enrollment = await Enrollment.findOne({
      user: req.userId,
      course: course._id,
    });

    if (!enrollment) {
      throw ApiError.forbidden('Not enrolled in this course');
    }

    // Check if lesson exists
    let lessonExists = false;
    for (const module of course.content.modules) {
      if (module.lessons.some((l) => l._id.toString() === lessonId)) {
        lessonExists = true;
        break;
      }
    }

    if (!lessonExists) {
      throw ApiError.notFound('Lesson not found');
    }

    // Add to completed lessons if not already
    const lessonObjectId = new mongoose.Types.ObjectId(lessonId);
    if (!enrollment.progress.completedLessons.includes(lessonObjectId)) {
      enrollment.progress.completedLessons.push(lessonObjectId);
    }

    // Update progress percentage
    const totalLessons = course.content.totalLessons;
    enrollment.progress.percentage = Math.round(
      (enrollment.progress.completedLessons.length / totalLessons) * 100
    );
    enrollment.progress.lastAccessedAt = new Date();

    // Check if course completed
    if (enrollment.progress.percentage === 100 && !enrollment.completedAt) {
      enrollment.completedAt = new Date();
      enrollment.status = 'completed';
      course.stats.completions += 1;
      await course.save();
    }

    await enrollment.save();

    res.json({
      success: true,
      data: {
        progress: enrollment.progress,
        completed: enrollment.status === 'completed',
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get course recommendations for user
export const getRecommendations = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 8;

    // Get user's enrollments to understand their interests
    const userEnrollments = await Enrollment.find({
      user: req.userId
    })
      .populate({
        path: 'course',
        select: 'category subcategory tags level'
      })
      .lean();

    const enrolledCourseIds = userEnrollments.map(e => (e.course as any)._id);

    // Extract user's learning patterns
    const userCategories = new Set<string>();
    const userSubcategories = new Set<string>();
    const userTags = new Set<string>();
    const userLevels = new Map<string, number>();

    userEnrollments.forEach((enrollment: any) => {
      if (enrollment.course?.category) {
        userCategories.add(enrollment.course.category.toString());
      }
      if (enrollment.course?.subcategory) {
        userSubcategories.add(enrollment.course.subcategory.toString());
      }
      if (enrollment.course?.tags) {
        enrollment.course.tags.forEach((tag: string) => userTags.add(tag));
      }
      if (enrollment.course?.level) {
        const level = enrollment.course.level;
        userLevels.set(level, (userLevels.get(level) || 0) + 1);
      }
    });

    // Determine user's appropriate difficulty level
    const completedCourses = userEnrollments.filter((e: any) => e.status === 'completed');
    let recommendedLevels: string[] = ['beginner'];

    if (completedCourses.length === 0) {
      recommendedLevels = ['beginner'];
    } else if (completedCourses.length < 3) {
      recommendedLevels = ['beginner', 'intermediate'];
    } else {
      const hasAdvanced = completedCourses.some((e: any) => e.course?.level === 'advanced');
      const hasIntermediate = completedCourses.some((e: any) => e.course?.level === 'intermediate');

      if (hasAdvanced) {
        recommendedLevels = ['intermediate', 'advanced'];
      } else if (hasIntermediate) {
        recommendedLevels = ['intermediate', 'advanced'];
      } else {
        recommendedLevels = ['intermediate'];
      }
    }

    // Build recommendation query
    const recommendationFilter: any = {
      _id: { $nin: enrolledCourseIds },
      status: 'published'
    };

    // Find courses matching user's interests
    const potentialCourses = await Course.find(recommendationFilter)
      .populate('instructor', 'profile.firstName profile.lastName profile.avatar')
      .populate('category', 'name slug')
      .select('-content.modules.lessons.content')
      .limit(limit * 3) // Get more than needed for scoring
      .lean();

    // Score each course based on multiple factors
    interface ScoredCourse {
      course: any;
      score: number;
      matchReasons: string[];
    }

    const scoredCourses: ScoredCourse[] = potentialCourses.map(course => {
      let score = 0;
      const matchReasons: string[] = [];

      // Category match (30 points)
      if (userCategories.has(course.category?._id?.toString() || '')) {
        score += 30;
        matchReasons.push('Same category as your courses');
      }

      // Subcategory match (15 points)
      if (course.subcategory && userSubcategories.has(course.subcategory.toString())) {
        score += 15;
        matchReasons.push('Related subcategory');
      }

      // Tag overlap (25 points max, 5 per tag)
      const courseTags = new Set(course.tags || []);
      let tagMatches = 0;
      courseTags.forEach(tag => {
        if (userTags.has(tag)) {
          tagMatches++;
        }
      });
      const tagScore = Math.min(tagMatches * 5, 25);
      score += tagScore;
      if (tagMatches > 0) {
        matchReasons.push(`${tagMatches} matching topics`);
      }

      // Level appropriateness (15 points)
      if (recommendedLevels.includes(course.level)) {
        score += 15;
        matchReasons.push(`${course.level.charAt(0).toUpperCase() + course.level.slice(1)} level`);
      }

      // Popularity (10 points)
      const enrollmentScore = Math.min((course.stats?.enrollments || 0) / 100, 10);
      score += enrollmentScore;
      if (enrollmentScore > 5) {
        matchReasons.push('Popular course');
      }

      // Rating (5 points)
      const ratingScore = ((course.stats?.averageRating || 0) / 5) * 5;
      score += ratingScore;
      if (ratingScore > 3) {
        matchReasons.push('Highly rated');
      }

      // Recently added (5 points)
      if (course.publishedAt) {
        const daysSincePublish = (Date.now() - new Date(course.publishedAt).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSincePublish < 30) {
          score += 5;
          matchReasons.push('Recently added');
        }
      }

      // Free courses bonus (5 points) - good for new users
      if (course.pricing?.type === 'free') {
        score += 5;
      }

      return {
        course,
        score,
        matchReasons
      };
    });

    // Sort by score and take top courses
    scoredCourses.sort((a, b) => b.score - a.score);
    const topRecommendations = scoredCourses.slice(0, limit);

    // Format response
    const recommendations = topRecommendations.map(({ course, score, matchReasons }) => ({
      ...course,
      recommendationScore: Math.round(score),
      matchPercentage: Math.min(Math.round(score), 100),
      matchReasons: matchReasons.slice(0, 2) // Top 2 reasons
    }));

    res.json({
      success: true,
      data: {
        recommendations,
        total: recommendations.length
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create course (instructor)
export const createCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = createCourseSchema.parse(req.body);

    const course = await Course.create({
      ...data,
      instructor: req.userId,
      category: new mongoose.Types.ObjectId(data.category),
      subcategory: data.subcategory
        ? new mongoose.Types.ObjectId(data.subcategory)
        : undefined,
    });

    res.status(201).json({
      success: true,
      data: { course },
    });
  } catch (error) {
    next(error);
  }
};

// Update course (instructor)
export const updateCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const data = updateCourseSchema.parse(req.body);

    const course = await Course.findOne({
      _id: id,
      instructor: req.userId,
    });

    if (!course) {
      throw ApiError.notFound('Course not found');
    }

    Object.assign(course, data);
    await course.save();

    res.json({
      success: true,
      data: { course },
    });
  } catch (error) {
    next(error);
  }
};

// Add module to course
export const addModule = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const data = createModuleSchema.parse(req.body);

    const course = await Course.findOne({
      _id: id,
      instructor: req.userId,
    });

    if (!course) {
      throw ApiError.notFound('Course not found');
    }

    const newModule = {
      _id: new mongoose.Types.ObjectId(),
      title: data.title,
      description: data.description,
      order: course.content.modules.length,
      lessons: [],
    };

    course.content.modules.push(newModule);
    await course.save();

    res.status(201).json({
      success: true,
      data: { module: newModule },
    });
  } catch (error) {
    next(error);
  }
};

// Add lesson to module
export const addLesson = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id, moduleId } = req.params;
    const data = createLessonSchema.parse(req.body);

    const course = await Course.findOne({
      _id: id,
      instructor: req.userId,
    });

    if (!course) {
      throw ApiError.notFound('Course not found');
    }

    const moduleIndex = course.content.modules.findIndex(
      (m) => m._id.toString() === moduleId
    );

    if (moduleIndex === -1) {
      throw ApiError.notFound('Module not found');
    }

    const newLesson = {
      _id: new mongoose.Types.ObjectId(),
      title: data.title,
      slug: data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      type: data.type,
      duration: data.duration,
      content: data.content || {},
      isPreview: data.isPreview,
      order: course.content.modules[moduleIndex].lessons.length,
    };

    course.content.modules[moduleIndex].lessons.push(newLesson);

    // Update stats
    course.content.totalLessons += 1;
    course.content.totalDuration += data.duration;
    if (data.type === 'quiz') {
      course.content.totalQuizzes += 1;
    }

    await course.save();

    res.status(201).json({
      success: true,
      data: { lesson: newLesson },
    });
  } catch (error) {
    next(error);
  }
};

// Publish course
export const publishCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const course = await Course.findOne({
      _id: id,
      instructor: req.userId,
    });

    if (!course) {
      throw ApiError.notFound('Course not found');
    }

    // Validate course has content
    if (course.content.totalLessons === 0) {
      throw ApiError.badRequest('Course must have at least one lesson');
    }

    course.status = 'published';
    course.publishedAt = new Date();
    await course.save();

    res.json({
      success: true,
      data: { course },
      message: 'Course published successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Get instructor's courses
export const getInstructorCourses = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const courses = await Course.find({ instructor: req.userId })
      .populate('category', 'name slug')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { courses },
    });
  } catch (error) {
    next(error);
  }
};
