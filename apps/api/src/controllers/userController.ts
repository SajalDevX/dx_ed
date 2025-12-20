import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User.js';
import { Enrollment } from '../models/Enrollment.js';
import { ApiError } from '../utils/ApiError.js';

// Get user profile
export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          profile: user.profile,
          role: user.role,
          subscription: user.subscription,
          gamification: user.gamification,
          preferences: user.preferences,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update profile
export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const allowedUpdates = ['firstName', 'lastName', 'bio', 'avatar', 'timezone', 'language'];
    const updates: Record<string, unknown> = {};

    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[`profile.${key}`] = req.body[key];
      }
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          profile: user.profile,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update preferences
export const updatePreferences = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const allowedUpdates = ['emailNotifications', 'pushNotifications', 'darkMode'];
    const updates: Record<string, unknown> = {};

    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[`preferences.${key}`] = req.body[key];
      }
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updates },
      { new: true }
    );

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    res.json({
      success: true,
      data: { preferences: user.preferences },
    });
  } catch (error) {
    next(error);
  }
};

// Get user enrollments
export const getEnrollments = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status } = req.query;

    const filter: Record<string, unknown> = { user: req.userId };
    if (status) {
      filter.status = status;
    }

    const enrollments = await Enrollment.find(filter)
      .populate({
        path: 'course',
        select: 'title slug thumbnail shortDescription content.totalLessons content.totalDuration instructor',
        populate: {
          path: 'instructor',
          select: 'profile.firstName profile.lastName profile.avatar',
        },
      })
      .sort({ enrolledAt: -1 });

    res.json({
      success: true,
      data: { enrollments },
    });
  } catch (error) {
    next(error);
  }
};

// Get user progress overview
export const getProgressOverview = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const enrollments = await Enrollment.find({ user: req.userId });

    const stats = {
      totalCourses: enrollments.length,
      completedCourses: enrollments.filter((e) => e.status === 'completed').length,
      inProgressCourses: enrollments.filter((e) => e.status === 'active').length,
      totalLearningTime: enrollments.reduce((acc, e) => acc + e.progress.timeSpent, 0),
      averageProgress: enrollments.length
        ? Math.round(
            enrollments.reduce((acc, e) => acc + e.progress.percentage, 0) /
              enrollments.length
          )
        : 0,
      totalQuizzesPassed: enrollments.reduce(
        (acc, e) =>
          acc +
          e.quizAttempts.filter((a) => a.score / a.maxScore >= 0.7).length,
        0
      ),
      certificatesEarned: enrollments.filter((e) => e.certificate.issued).length,
    };

    res.json({
      success: true,
      data: {
        gamification: user.gamification,
        stats,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get user certificates
export const getCertificates = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const enrollments = await Enrollment.find({
      user: req.userId,
      'certificate.issued': true,
    }).populate('course', 'title slug thumbnail instructor');

    const certificates = enrollments.map((e) => ({
      ...e.certificate,
      course: e.course,
      completedAt: e.completedAt,
    }));

    res.json({
      success: true,
      data: { certificates },
    });
  } catch (error) {
    next(error);
  }
};

// Get user badges
export const getBadges = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.userId).populate(
      'gamification.badges.badgeId'
    );

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    res.json({
      success: true,
      data: { badges: user.gamification.badges },
    });
  } catch (error) {
    next(error);
  }
};

// Get dashboard data
export const getDashboard = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Fetch user data
    const user = await User.findById(req.userId).populate({
      path: 'gamification.badges.badgeId',
      options: { limit: 5, sort: { 'gamification.badges.earnedAt': -1 } }
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    // Fetch enrollments with populated course data
    const enrollments = await Enrollment.find({
      user: req.userId,
      status: 'active'
    })
      .populate({
        path: 'course',
        select: 'title slug thumbnail shortDescription level category tags pricing content.totalDuration content.totalLessons instructor',
        populate: {
          path: 'instructor',
          select: 'profile.firstName profile.lastName profile.avatar'
        }
      })
      .sort({ 'progress.lastAccessedAt': -1 })
      .limit(6)
      .lean();

    // Get completed enrollments count
    const completedCount = await Enrollment.countDocuments({
      user: req.userId,
      status: 'completed'
    });

    // Calculate weekly stats (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const recentEnrollments = await Enrollment.find({
      user: req.userId,
      'progress.lastAccessedAt': { $gte: oneWeekAgo }
    }).lean();

    const weeklyStats = {
      timeSpent: Math.round(
        recentEnrollments.reduce((acc, e) => acc + (e.progress?.timeSpent || 0), 0) / 60
      ), // Convert to minutes
      lessonsCompleted: recentEnrollments.reduce(
        (acc, e) => acc + (e.progress?.completedLessons?.length || 0),
        0
      ),
      quizzesAttempted: recentEnrollments.reduce(
        (acc, e) => acc + (e.quizAttempts?.length || 0),
        0
      ),
      avgQuizScore: 0
    };

    // Calculate average quiz score
    const allQuizAttempts = recentEnrollments.flatMap(e => e.quizAttempts || []);
    if (allQuizAttempts.length > 0) {
      weeklyStats.avgQuizScore = Math.round(
        allQuizAttempts.reduce((acc, attempt) => {
          const score = (attempt.score / attempt.maxScore) * 100;
          return acc + score;
        }, 0) / allQuizAttempts.length
      );
    }

    // Calculate XP progress
    const currentLevel = user.gamification.level;
    const currentXP = user.gamification.points;
    const xpForNextLevel = currentLevel * 1000;
    const xpProgress = {
      current: currentXP,
      nextLevel: xpForNextLevel,
      percentage: Math.round((currentXP / xpForNextLevel) * 100)
    };

    // Get recent achievements (last 5 badges)
    const recentBadges = user.gamification.badges
      .sort((a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime())
      .slice(0, 5);

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const recentAchievements = recentBadges.map((badge: any) => ({
      badge: badge.badgeId,
      earnedAt: badge.earnedAt,
      isNew: new Date(badge.earnedAt) > sevenDaysAgo
    }));

    // Format enrolled courses data
    const formattedEnrollments = enrollments.map((enrollment: any) => {
      const totalLessons = enrollment.course?.content?.totalLessons || 1;
      const completedLessons = enrollment.progress?.completedLessons?.length || 0;
      const estimatedTimeToComplete = enrollment.course?.content?.totalDuration
        ? Math.round((enrollment.course.content.totalDuration * (100 - enrollment.progress.percentage)) / 100)
        : 0;

      return {
        course: enrollment.course,
        progress: {
          percentage: enrollment.progress?.percentage || 0,
          currentLesson: enrollment.progress?.currentLesson,
          completedLessons: completedLessons,
          timeSpent: Math.round((enrollment.progress?.timeSpent || 0) / 60), // Convert to minutes
        },
        lastAccessedAt: enrollment.progress?.lastAccessedAt,
        enrolledAt: enrollment.enrolledAt,
        estimatedTimeToComplete
      };
    });

    // Prepare response
    const dashboardData = {
      user: {
        firstName: user.profile.firstName,
        lastName: user.profile.lastName,
        avatar: user.profile.avatar,
        points: user.gamification.points,
        level: user.gamification.level,
        badges: user.gamification.badges.length,
        streak: user.gamification.streak
      },
      stats: {
        xpProgress,
        enrolledCourses: enrollments.length,
        completedCourses: completedCount,
        activeCourses: enrollments.length,
        totalBadges: user.gamification.badges.length,
        currentStreak: user.gamification.streak.current,
        longestStreak: user.gamification.streak.longest,
        weeklyStats
      },
      enrolledCourses: formattedEnrollments,
      recentAchievements,
      learningStreak: {
        current: user.gamification.streak.current,
        isActiveToday: user.gamification.streak.lastActivityDate
          ? new Date(user.gamification.streak.lastActivityDate).toDateString() === new Date().toDateString()
          : false,
        nextMilestone: user.gamification.streak.current < 7 ? 7 :
                       user.gamification.streak.current < 14 ? 14 :
                       user.gamification.streak.current < 30 ? 30 :
                       user.gamification.streak.current < 100 ? 100 :
                       user.gamification.streak.current + 50
      }
    };

    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    next(error);
  }
};

// Delete account
export const deleteAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { password } = req.body;

    const user = await User.findById(req.userId).select('+password');

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    // Verify password
    if (user.password) {
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        throw ApiError.badRequest('Incorrect password');
      }
    }

    // Soft delete
    user.isActive = false;
    user.email = `deleted_${user._id}@deleted.com`;
    await user.save();

    res.clearCookie('refreshToken');
    res.clearCookie('accessToken');

    res.json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
