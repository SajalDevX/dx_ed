'use client';

import Link from 'next/link';
import { Star, Clock, Users, BookOpen, Zap, Trophy, Unlock, Lock } from 'lucide-react';
import { formatPrice, formatDuration } from '@/lib/utils';
import type { Course } from '@/types';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';

interface CourseCardProps {
  course: Course;
}

const levelEmojis = {
  beginner: '🌱',
  intermediate: '🚀',
  advanced: '⚡',
};

const levelColors = {
  beginner: 'from-green-400 to-emerald-500',
  intermediate: 'from-yellow-400 to-orange-500',
  advanced: 'from-red-400 to-pink-500',
};

export function CourseCard({ course }: CourseCardProps) {
  const { user } = useAuthStore();
  const isSubscribed = user?.subscription?.plan && user.subscription.plan !== 'free';

  const discountedPrice = course.pricing.discount
    ? course.pricing.price * (1 - course.pricing.discount.percentage / 100)
    : null;

  const level = course.level || 'beginner';

  return (
    <Link href={`/courses/${course.slug}`}>
      <div className="game-card group overflow-hidden bg-white">
        {/* Top Color Bar */}
        <div className={`h-2 bg-gradient-to-r ${levelColors[level as keyof typeof levelColors]}`} />

        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="h-full w-full object-cover transition-all duration-300 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#FFD93D]/20 to-[#FF6B6B]/20">
              <BookOpen className="h-16 w-16 text-[#2D2D2D]/30" />
            </div>
          )}

          {/* Level Badge */}
          <div
            className={`badge-level ${level} absolute left-3 top-3 flex items-center gap-1`}
          >
            <span>{levelEmojis[level as keyof typeof levelEmojis]}</span>
            <span>{level.charAt(0).toUpperCase() + level.slice(1)}</span>
          </div>

          {/* Free/Price Badge */}
          {course.pricing.type === 'free' ? (
            <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 px-3 py-1 text-xs font-bold text-white border-2 border-[#2D2D2D] shadow-[2px_2px_0_#2D2D2D]">
              <Zap className="h-3 w-3" />
              FREE
            </div>
          ) : course.pricing.discount && (
            <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-gradient-to-r from-red-500 to-pink-500 px-3 py-1 text-xs font-bold text-white border-2 border-[#2D2D2D] shadow-[2px_2px_0_#2D2D2D] animate-pulse">
              🔥 {course.pricing.discount.percentage}% OFF
            </div>
          )}

          {/* XP Indicator */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-[#2D2D2D] px-2 py-1 text-xs font-bold text-[#FFD93D]">
            <Trophy className="h-3 w-3" />
            +{Math.floor((course.content?.totalLessons || 5) * 10)} XP
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Category Tag */}
          <div className="inline-flex items-center gap-1 rounded-full bg-[#4ECDC4]/20 px-3 py-1 text-xs font-bold text-[#2D9A93]">
            📚 {course.category?.name || 'Course'}
          </div>

          {/* Title */}
          <h3 className="mt-3 line-clamp-2 text-lg font-bold text-[#2D2D2D] transition-colors group-hover:text-[#FF6B6B]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
            {course.title}
          </h3>

          {/* Instructor */}
          <p className="mt-2 flex items-center gap-2 text-sm text-gray-600">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#A66CFF] to-[#FF6B6B] text-xs text-white font-bold">
              {course.instructor?.profile?.firstName?.charAt(0) || '?'}
            </span>
            {course.instructor?.profile?.firstName} {course.instructor?.profile?.lastName}
          </p>

          {/* Stats Row */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Rating */}
              <div className="flex items-center gap-1 rounded-full bg-[#FFD93D]/30 px-2 py-1">
                <Star className="h-4 w-4 fill-[#FFD93D] text-[#FFD93D]" />
                <span className="text-sm font-bold text-[#2D2D2D]">
                  {course.stats?.averageRating?.toFixed(1) || '5.0'}
                </span>
              </div>

              {/* Students */}
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                <span className="font-semibold">{course.stats?.enrollments || 0}</span>
              </div>
            </div>
          </div>

          {/* Progress-like bar (lessons) */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                {course.content?.totalLessons || 0} Lessons
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDuration(course.content?.totalDuration || 0)}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#4ECDC4] to-[#6BCB77]"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* Price Section */}
          <div className="mt-4 flex items-center justify-between border-t-2 border-dashed border-gray-200 pt-4">
            {course.pricing.type === 'free' ? (
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-[#6BCB77]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                  Free
                </span>
                <span className="text-xl">🎉</span>
              </div>
            ) : isSubscribed ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#6BCB77] to-[#4ECDC4] px-4 py-2 border-2 border-[#2D2D2D] shadow-[2px_2px_0_#2D2D2D]">
                  <Unlock className="h-5 w-5 text-white" />
                  <span className="text-sm font-bold text-white" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                    Unlocked
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-[#2D2D2D]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                  {formatPrice(discountedPrice || course.pricing.price, course.pricing.currency)}
                </span>
                {discountedPrice && (
                  <span className="text-sm text-gray-400 line-through">
                    {formatPrice(course.pricing.price, course.pricing.currency)}
                  </span>
                )}
              </div>
            )}

            {/* Enroll Button Preview */}
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFD93D] border-2 border-[#2D2D2D] text-[#2D2D2D] transition-all group-hover:scale-110 group-hover:shadow-[3px_3px_0_#2D2D2D]">
              →
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default CourseCard;
