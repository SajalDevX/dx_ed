'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Course } from '@/types';

interface EnrolledCourse {
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
}

interface EnrolledCoursesSectionProps {
  courses: EnrolledCourse[];
}

export default function EnrolledCoursesSection({ courses }: EnrolledCoursesSectionProps) {
  if (courses.length === 0) {
    return (
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          🚀 Continue Your Journey
        </h2>
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-12 text-center border-2 border-dashed border-purple-200">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No active courses yet</h3>
          <p className="text-gray-600 mb-6">Start your learning journey by enrolling in a course!</p>
          <Link
            href="/courses"
            className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
          >
            Browse Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          🚀 Continue Your Journey
        </h2>
        <Link
          href="/dashboard"
          className="text-purple-600 hover:text-purple-700 text-sm font-medium"
        >
          View All →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((enrollment) => (
          <EnrolledCourseCard key={enrollment.course._id} enrollment={enrollment} />
        ))}
      </div>
    </div>
  );
}

function EnrolledCourseCard({ enrollment }: { enrollment: EnrolledCourse }) {
  const { course, progress } = enrollment;
  const isStale = enrollment.lastAccessedAt
    ? (Date.now() - new Date(enrollment.lastAccessedAt).getTime()) / (1000 * 60 * 60 * 24) > 7
    : false;

  return (
    <Link href={`/courses/${course.slug}`}>
      <div className="bg-white rounded-2xl overflow-hidden border-2 border-gray-100 hover:border-purple-300 hover:shadow-xl transition-all duration-300 group">
        {/* Thumbnail */}
        <div className="relative h-48 bg-gradient-to-br from-purple-100 to-pink-100 overflow-hidden">
          {course.thumbnail ? (
            <Image
              src={course.thumbnail}
              alt={course.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">
              📚
            </div>
          )}

          {/* Progress Badge */}
          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-bold text-purple-600 shadow-lg">
            {progress.percentage}% ⚡
          </div>

          {/* Stale Indicator */}
          {isStale && (
            <div className="absolute top-4 left-4 bg-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
              ⏰ Resume
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
            {course.title}
          </h3>

          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <span className="px-2 py-1 bg-purple-100 text-purple-600 rounded-md font-medium capitalize">
              {course.level}
            </span>
            <span>•</span>
            <span>{progress.timeSpent} min</span>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-600 font-medium">Progress</span>
              <span className="text-xs text-purple-600 font-bold">{progress.percentage}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
          </div>

          {/* Lessons Progress */}
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">
              {progress.completedLessons}/{course.content?.totalLessons || 0} lessons
            </span>
            {enrollment.estimatedTimeToComplete > 0 && (
              <span className="text-gray-500 text-xs">
                ~{enrollment.estimatedTimeToComplete} min left
              </span>
            )}
          </div>

          {/* Continue Button */}
          <button className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 group-hover:from-purple-700 group-hover:to-pink-700">
            Continue Learning →
          </button>
        </div>
      </div>
    </Link>
  );
}
