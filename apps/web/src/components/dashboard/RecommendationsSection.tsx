'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Course } from '@/types';

interface RecommendedCourse extends Course {
  matchPercentage?: number;
  matchReasons?: string[];
}

interface RecommendationsSectionProps {
  recommendations: RecommendedCourse[];
  isLoading?: boolean;
}

export default function RecommendationsSection({ recommendations, isLoading }: RecommendationsSectionProps) {
  if (isLoading) {
    return (
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          💡 Recommended For You
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-100 rounded-2xl h-96 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          💡 Recommended For You
        </h2>
        <Link
          href="/courses"
          className="text-purple-600 hover:text-purple-700 text-sm font-medium"
        >
          Explore All →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {recommendations.slice(0, 4).map((course) => (
          <RecommendedCourseCard key={course._id} course={course} />
        ))}
      </div>
    </div>
  );
}

function RecommendedCourseCard({ course }: { course: RecommendedCourse }) {
  const isFree = course.pricing?.type === 'free';
  const price = course.pricing?.price || 0;

  return (
    <Link href={`/courses/${course.slug}`}>
      <div className="bg-white rounded-2xl overflow-hidden border-2 border-gray-100 hover:border-purple-300 hover:shadow-xl transition-all duration-300 group h-full flex flex-col">
        {/* Thumbnail */}
        <div className="relative h-40 bg-gradient-to-br from-blue-100 to-purple-100 overflow-hidden">
          {course.thumbnail ? (
            <Image
              src={course.thumbnail}
              alt={course.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl">
              🎯
            </div>
          )}

          {/* Match Badge */}
          {course.matchPercentage && course.matchPercentage > 50 && (
            <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              {course.matchPercentage}% Match
            </div>
          )}

          {/* Free Badge */}
          {isFree && (
            <div className="absolute top-3 left-3 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              FREE
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col">
          <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
            {course.title}
          </h3>

          {/* Match Reasons */}
          {course.matchReasons && course.matchReasons.length > 0 && (
            <p className="text-xs text-gray-600 mb-3 line-clamp-2">
              {course.matchReasons[0]}
            </p>
          )}

          <div className="flex items-center gap-2 text-xs text-gray-600 mb-3">
            <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-md font-medium capitalize">
              {course.level}
            </span>
            {course.stats && course.stats.enrollments > 0 && (
              <>
                <span>•</span>
                <span>{course.stats.enrollments} enrolled</span>
              </>
            )}
          </div>

          {/* Rating */}
          {course.stats && course.stats.averageRating > 0 && (
            <div className="flex items-center gap-1 mb-3">
              <span className="text-yellow-500">⭐</span>
              <span className="text-sm font-semibold text-gray-700">
                {course.stats.averageRating.toFixed(1)}
              </span>
              <span className="text-xs text-gray-500">
                ({course.stats.totalReviews})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="mt-auto pt-3 border-t border-gray-100">
            <div className="flex justify-between items-center">
              {isFree ? (
                <span className="text-lg font-bold text-green-600">Free</span>
              ) : (
                <span className="text-lg font-bold text-gray-900">${price}</span>
              )}
              <span className="text-purple-600 text-sm font-medium group-hover:translate-x-1 transition-transform">
                Learn more →
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
