'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import {
  Clock,
  Users,
  Star,
  BookOpen,
  FileText,
  CheckCircle,
  Award,
  Globe,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Lock,
  Loader2,
  HelpCircle,
  Unlock,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { coursesApi } from '@/lib/api/courses';
import { useAuthStore } from '@/stores/authStore';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const slug = params.slug as string;
  const { isAuthenticated, user } = useAuthStore();
  const isSubscribed = user?.subscription?.plan && user.subscription.plan !== 'free';
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set([0]));
  const [enrollError, setEnrollError] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['course', slug],
    queryFn: () => coursesApi.getCourseBySlug(slug),
    enabled: !!slug,
  });

  const enrollMutation = useMutation({
    mutationFn: () => coursesApi.enrollInCourse(slug),
    onSuccess: (response) => {
      if (response.data?.requiresPayment) {
        // Handle paid course - redirect to checkout
        alert('This course requires payment. Checkout coming soon!');
      } else {
        // Free course - enrollment successful
        queryClient.invalidateQueries({ queryKey: ['course', slug] });
        router.push(`/courses/${slug}/learn`);
      }
    },
    onError: (error: Error & { response?: { data?: { error?: { message?: string } } } }) => {
      setEnrollError(error.response?.data?.error?.message || 'Failed to enroll. Please try again.');
    },
  });

  const handleEnroll = () => {
    if (!isAuthenticated) {
      router.push(`/auth?redirect=/courses/${slug}`);
      return;
    }
    setEnrollError(null);
    enrollMutation.mutate();
  };

  const course = data?.data?.course;
  const isEnrolled = data?.data?.isEnrolled;

  const toggleModule = (index: number) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedModules(newExpanded);
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-900">Course not found</h1>
        <p className="mt-2 text-gray-600">The course you're looking for doesn't exist.</p>
        <Link href="/courses">
          <Button className="mt-4">Browse Courses</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="mb-4 flex items-center gap-2 text-sm text-gray-300">
                <Link href="/courses" className="hover:text-white">
                  Courses
                </Link>
                <span>/</span>
                <span>{course.title}</span>
              </div>

              <h1 className="text-3xl font-bold md:text-4xl">{course.title}</h1>

              <p className="mt-4 text-lg text-gray-300">{course.shortDescription}</p>

              <div className="mt-6 flex flex-wrap items-center gap-4 text-sm">
                {course.stats.averageRating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{course.stats.averageRating.toFixed(1)}</span>
                    <span className="text-gray-400">({course.stats.totalReviews} reviews)</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Users className="h-5 w-5" />
                  <span>{course.stats.enrollments} students</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-5 w-5" />
                  <span>{formatDuration(course.content.totalDuration)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="h-5 w-5" />
                  <span>{course.content.totalLessons} lessons</span>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <span className="rounded-full bg-blue-600 px-3 py-1 text-sm font-medium">
                  {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                </span>
                <span className="flex items-center gap-1 rounded-full bg-gray-700 px-3 py-1 text-sm">
                  <Globe className="h-4 w-4" />
                  {course.language.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Course Card */}
            <div className="lg:row-span-2">
              <div className="sticky top-20 rounded-lg bg-white p-6 shadow-xl">
                {course.thumbnail && (
                  <div className="relative mb-4 aspect-video overflow-hidden rounded-lg">
                    <Image
                      src={course.thumbnail}
                      alt={course.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                <div className="mb-4">
                  {course.pricing.type === 'free' ? (
                    <p className="text-3xl font-bold text-gray-900">Free</p>
                  ) : isSubscribed ? (
                    <div className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-3">
                      <Unlock className="h-6 w-6 text-white" />
                      <span className="text-xl font-bold text-white">Unlocked with Subscription</span>
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold text-gray-900">
                        ${course.pricing.price}
                      </p>
                      {course.pricing.discount && (
                        <p className="text-lg text-gray-500 line-through">
                          ${Math.round(course.pricing.price / (1 - course.pricing.discount.percentage / 100))}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {isEnrolled ? (
                  <div className="space-y-3">
                    <Link href={`/courses/${slug}/learn`}>
                      <Button className="w-full" size="lg">
                        Continue Learning
                      </Button>
                    </Link>
                    {isSubscribed && (
                      <Link href={`/courses/${slug}/generate`}>
                        <Button className="w-full bg-gradient-to-r from-[#A66CFF] to-[#FF6B6B] hover:from-[#FF6B6B] hover:to-[#A66CFF] text-white border-2" size="lg">
                          <Sparkles className="mr-2 h-5 w-5" />
                          AI Content Generator
                        </Button>
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {course.pricing.type === 'free' ? (
                      <Button
                        className="w-full"
                        size="lg"
                        onClick={handleEnroll}
                        disabled={enrollMutation.isPending}
                      >
                        {enrollMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Enrolling...
                          </>
                        ) : (
                          'Enroll for Free'
                        )}
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        size="lg"
                        onClick={handleEnroll}
                        disabled={enrollMutation.isPending}
                      >
                        {enrollMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          `Buy Now - $${course.pricing.price}`
                        )}
                      </Button>
                    )}
                    {enrollError && (
                      <p className="text-center text-sm text-red-500">{enrollError}</p>
                    )}
                    {!isAuthenticated && (
                      <p className="text-center text-sm text-gray-500">
                        <Link href="/auth" className="text-blue-600 hover:underline">
                          Log in
                        </Link>{' '}
                        to enroll
                      </p>
                    )}
                  </div>
                )}

                <div className="mt-6 space-y-3 border-t pt-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    <span>{course.content.totalLessons} lessons</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    <span>{formatDuration(course.content.totalDuration)} total</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>{course.level} level</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    <span>Certificate of completion</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900">About this course</h2>
              <div className="mt-4 prose prose-gray max-w-none">
                <p className="whitespace-pre-line text-gray-600">{course.description}</p>
              </div>
            </section>

            {/* What you'll learn */}
            {course.outcomes && course.outcomes.length > 0 && (
              <section className="rounded-lg border bg-white p-6">
                <h2 className="text-xl font-bold text-gray-900">What you'll learn</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {course.outcomes.map((outcome, index) => (
                    <div key={index} className="flex gap-2">
                      <CheckCircle className="h-5 w-5 shrink-0 text-green-500" />
                      <span className="text-gray-600">{outcome}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Requirements */}
            {course.requirements && course.requirements.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-gray-900">Requirements</h2>
                <ul className="mt-4 space-y-2">
                  {course.requirements.map((req, index) => (
                    <li key={index} className="flex gap-2 text-gray-600">
                      <span className="text-gray-400">•</span>
                      {req}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Curriculum */}
            <section>
              <h2 className="text-xl font-bold text-gray-900">Course Curriculum</h2>
              <p className="mt-2 text-gray-600">
                {course.content.modules.length} modules • {course.content.totalLessons} lessons •{' '}
                {formatDuration(course.content.totalDuration)} total
              </p>

              <div className="mt-4 space-y-2">
                {course.content.modules.map((module, moduleIndex) => (
                  <div key={moduleIndex} className="rounded-lg border bg-white overflow-hidden">
                    <button
                      onClick={() => toggleModule(moduleIndex)}
                      className="flex w-full items-center justify-between p-4 text-left hover:bg-gray-50"
                    >
                      <div>
                        <h3 className="font-semibold text-gray-900">{module.title}</h3>
                        <p className="text-sm text-gray-500">
                          {module.lessons.length} lessons
                        </p>
                      </div>
                      {expandedModules.has(moduleIndex) ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </button>

                    {expandedModules.has(moduleIndex) && (
                      <div className="border-t bg-gray-50">
                        {module.lessons.map((lesson, lessonIndex) => (
                          <div
                            key={lessonIndex}
                            className="flex items-center gap-3 border-b last:border-0 px-4 py-3"
                          >
                            {lesson.isPreview || isEnrolled ? (
                              lesson.type === 'quiz' ? (
                                <HelpCircle className="h-5 w-5 text-purple-600" />
                              ) : (
                                <FileText className="h-5 w-5 text-blue-600" />
                              )
                            ) : (
                              <Lock className="h-5 w-5 text-gray-400" />
                            )}
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {lesson.title}
                              </p>
                              <p className="text-xs text-gray-500">
                                {lesson.type} • {formatDuration(lesson.duration)}
                              </p>
                            </div>
                            {lesson.isPreview && !isEnrolled && (
                              <span className="text-xs text-blue-600">Preview</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Target Audience */}
            {course.targetAudience && course.targetAudience.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-gray-900">Who this course is for</h2>
                <ul className="mt-4 space-y-2">
                  {course.targetAudience.map((audience, index) => (
                    <li key={index} className="flex gap-2 text-gray-600">
                      <span className="text-gray-400">•</span>
                      {audience}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Tags */}
            {course.tags && course.tags.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-gray-900">Tags</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {course.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
