'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Sparkles,
  Zap,
  AlertCircle,
  Loader2,
  ArrowLeft,
  BookOpen,
  Brain,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';
import { coursesApi } from '@/lib/api/courses';
import { aiApi } from '@/lib/api/ai';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function AIContentGeneratorPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const slug = params.slug as string;
  const { user, isAuthenticated } = useAuthStore();
  const isSubscribed = user?.subscription?.plan && user.subscription.plan !== 'free';

  const [prompt, setPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');

  // Redirect if not authenticated or not subscribed
  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/auth?redirect=/courses/${slug}/generate`);
    } else if (!isSubscribed) {
      toast.error('This feature is only available for subscribed users');
      router.push(`/courses/${slug}`);
    }
  }, [isAuthenticated, isSubscribed, router, slug]);

  // Fetch course details
  const { data: courseData, isLoading: courseLoading } = useQuery({
    queryKey: ['course', slug],
    queryFn: () => coursesApi.getCourseBySlug(slug),
    enabled: !!slug && isAuthenticated && !!isSubscribed,
  });

  // Fetch daily usage
  const { data: usageData, isLoading: usageLoading } = useQuery({
    queryKey: ['ai-usage', courseData?.data?.course?._id],
    queryFn: () => aiApi.getDailyUsage(courseData?.data?.course?._id!),
    enabled: !!courseData?.data?.course?._id && isAuthenticated && !!isSubscribed,
  });

  const course = courseData?.data?.course;
  const dailyUsage = usageData?.data || { used: 0, limit: 2, remaining: 2 };

  // Generate content mutation
  const generateMutation = useMutation({
    mutationFn: (data: { courseId: string; prompt: string }) =>
      aiApi.generateContent(data.courseId, data.prompt),
    onSuccess: (response) => {
      setGeneratedContent(response.data.content);
      toast.success('Content generated successfully!');
      // Invalidate usage query to refresh the counter
      queryClient.invalidateQueries({ queryKey: ['ai-usage', course?._id] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Failed to generate content');
    },
  });

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    if (dailyUsage.remaining <= 0) {
      toast.error('You have reached your daily generation limit');
      return;
    }

    if (!course?._id) {
      toast.error('Course not found');
      return;
    }

    setGeneratedContent('');
    generateMutation.mutate({ courseId: course._id, prompt });
  };

  if (!isAuthenticated || !isSubscribed) {
    return null;
  }

  if (courseLoading || usageLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#4ECDC4]" />
      </div>
    );
  }

  const isGenerating = generateMutation.isPending;
  const remainingGenerations = dailyUsage.remaining;

  return (
    <div className="min-h-screen bg-[#FFF9E6] py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Link
            href={`/courses/${slug}`}
            className="inline-flex items-center gap-2 text-[#2D2D2D] hover:text-[#4ECDC4] transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="font-semibold">Back to Course</span>
          </Link>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-[#A66CFF] to-[#FF6B6B] rounded-full flex items-center justify-center border-3 border-[#2D2D2D] shadow-[4px_4px_0_#2D2D2D]">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-[#2D2D2D]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                  AI Content Generator
                </h1>
              </div>
              <p className="text-gray-600">
                Generate additional learning content for: <span className="font-bold">{course?.title}</span>
              </p>
            </div>

            {/* Daily Usage Indicator */}
            <div className="bg-white rounded-2xl border-3 border-[#2D2D2D] px-6 py-3 shadow-[4px_4px_0_#2D2D2D]">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-5 w-5 text-[#FFD93D]" />
                <span className="text-sm font-bold text-gray-500">Daily Limit</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-[#2D2D2D]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                  {remainingGenerations}
                </span>
                <span className="text-gray-500">/ {dailyUsage.limit} left</span>
              </div>
              <div className="mt-2 flex gap-1">
                {Array.from({ length: dailyUsage.limit }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 flex-1 rounded-full ${
                      i < dailyUsage.used ? 'bg-[#4ECDC4]' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid gap-6">
          {/* Input Section */}
          <div className="bg-white rounded-[25px] border-4 border-[#2D2D2D] p-6 shadow-[6px_6px_0_#2D2D2D]">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-[#FFD93D]" />
              <h2 className="text-xl font-bold text-[#2D2D2D]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                What would you like to learn?
              </h2>
            </div>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Example: Explain advanced React hooks with practical examples..."
              className="w-full h-32 px-4 py-3 rounded-xl border-3 border-[#2D2D2D] focus:border-[#4ECDC4] focus:outline-none resize-none shadow-[2px_2px_0_#2D2D2D] focus:shadow-[3px_3px_0_#2D2D2D] transition-all"
              disabled={isGenerating || remainingGenerations === 0}
            />

            <div className="mt-4 flex items-center justify-between gap-4">
              <p className="text-sm text-gray-500">
                {remainingGenerations === 0 ? (
                  <span className="flex items-center gap-1 text-red-500">
                    <XCircle className="h-4 w-4" />
                    Daily limit reached. Try again tomorrow!
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {remainingGenerations} generation{remainingGenerations !== 1 ? 's' : ''} remaining today
                  </span>
                )}
              </p>

              <Button
                onClick={handleGenerate}
                disabled={isGenerating || remainingGenerations === 0 || !prompt.trim()}
                className="group"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-5 w-5 group-hover:animate-wiggle" />
                    Generate Content
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Generated Content Section */}
          {(generatedContent || isGenerating) && (
            <div className="bg-white rounded-[25px] border-4 border-[#2D2D2D] p-6 shadow-[6px_6px_0_#2D2D2D]">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-5 w-5 text-[#4ECDC4]" />
                <h2 className="text-xl font-bold text-[#2D2D2D]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                  Generated Content
                </h2>
              </div>

              <div className="prose prose-gray max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {generatedContent}
                  {isGenerating && (
                    <span className="inline-block w-2 h-4 bg-[#4ECDC4] animate-pulse ml-1" />
                  )}
                </div>
              </div>

              {!isGenerating && generatedContent && (
                <div className="mt-6 pt-6 border-t-2 border-dashed border-gray-200 flex gap-3">
                  <Button variant="secondary" onClick={() => navigator.clipboard.writeText(generatedContent)}>
                    Copy to Clipboard
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setPrompt('');
                      setGeneratedContent('');
                    }}
                  >
                    Generate New Content
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Info Box */}
          <div className="bg-gradient-to-br from-[#FFD93D]/20 to-[#FF6B6B]/20 rounded-2xl border-3 border-[#2D2D2D] p-6 shadow-[4px_4px_0_#2D2D2D]">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-[#FFD93D] rounded-full flex items-center justify-center border-2 border-[#2D2D2D]">
                <AlertCircle className="h-5 w-5 text-[#2D2D2D]" />
              </div>
              <div>
                <h3 className="font-bold text-[#2D2D2D] mb-2" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                  💡 Tips for Better Results
                </h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Be specific about what you want to learn</li>
                  <li>• Ask for practical examples and use cases</li>
                  <li>• Request step-by-step explanations for complex topics</li>
                  <li>• You can generate 2 pieces of content per day</li>
                  <li>• Your daily limit resets at midnight UTC</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
