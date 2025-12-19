'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Sparkles, Trophy, Rocket, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';

export default function SubscriptionSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { fetchUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Refresh user data to get updated subscription status
    const refreshUserData = async () => {
      try {
        await fetchUser();
      } catch (error) {
        console.error('Error refreshing user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (sessionId) {
      // Wait a bit for webhook to process
      setTimeout(refreshUserData, 2000);
    } else {
      setIsLoading(false);
    }
  }, [sessionId, fetchUser]);

  // Auto-redirect countdown
  useEffect(() => {
    if (!isLoading && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      router.push('/courses');
    }
  }, [isLoading, countdown, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFF9E6] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#A66CFF] mx-auto mb-4" />
          <p className="text-lg text-gray-600">Processing your subscription...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF9E6] overflow-hidden">
      {/* Floating decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 text-4xl animate-float opacity-20">🎉</div>
        <div className="absolute top-40 right-20 text-3xl animate-float opacity-20" style={{ animationDelay: '1s' }}>⭐</div>
        <div className="absolute bottom-40 left-20 text-3xl animate-float opacity-20" style={{ animationDelay: '2s' }}>🏆</div>
        <div className="absolute top-60 right-40 text-2xl animate-float opacity-20" style={{ animationDelay: '0.5s' }}>💎</div>
      </div>

      {/* Success Section */}
      <section className="py-16 md:py-24 relative">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            {/* Success Card */}
            <div className="bg-white rounded-[30px] border-4 border-[#6BCB77] p-8 md:p-12 shadow-[8px_8px_0_#2D2D2D] text-center relative overflow-hidden">
              {/* Gradient background */}
              <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-[#6BCB77] to-[#4ECDC4] rounded-t-[26px]" />

              {/* Animated checkmark */}
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-[#6BCB77] to-[#4ECDC4] border-4 border-[#2D2D2D] shadow-[4px_4px_0_#2D2D2D] mb-6 animate-bounce-in">
                <CheckCircle className="h-12 w-12 text-white" />
              </div>

              {/* Success message */}
              <h1 className="text-4xl font-bold text-[#2D2D2D] sm:text-5xl mb-4" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                Welcome, Hero!
                <span className="inline-block ml-2 animate-wiggle">🦸</span>
              </h1>

              <p className="text-xl text-gray-700 mb-8">
                Your subscription is now <span className="font-bold text-[#6BCB77]">active</span>! You've unlocked all the legendary features.
              </p>

              {/* Features unlocked */}
              <div className="bg-gradient-to-r from-[#6BCB77]/10 to-[#4ECDC4]/10 rounded-2xl border-2 border-[#6BCB77]/30 p-6 mb-8">
                <h2 className="text-xl font-bold text-[#2D2D2D] mb-4 flex items-center justify-center gap-2">
                  <Trophy className="h-6 w-6 text-[#FFD93D]" />
                  <span>Powers Unlocked</span>
                  <Sparkles className="h-6 w-6 text-[#A66CFF]" />
                </h2>
                <div className="grid sm:grid-cols-2 gap-3 text-left">
                  {[
                    'Access to ALL premium quests',
                    'Advanced boss battles (quizzes)',
                    'Skill certificates',
                    'Priority support',
                    'Recruiter visibility',
                    'Legendary badges',
                  ].map((feature) => (
                    <div key={feature} className="flex items-center gap-2">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#6BCB77]/20 flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-[#6BCB77]" />
                      </div>
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Session info */}
              {sessionId && (
                <div className="mb-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-xs text-gray-500">
                    Order ID: <code className="font-mono text-gray-700">{sessionId.slice(0, 20)}...</code>
                  </p>
                </div>
              )}

              {/* Auto-redirect notice */}
              <div className="mb-6 p-4 bg-[#A66CFF]/10 rounded-xl border border-[#A66CFF]/30">
                <p className="text-sm text-gray-700">
                  Redirecting to courses in <span className="font-bold text-[#A66CFF] text-lg">{countdown}</span> seconds...
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/courses">
                  <Button size="xl" className="group">
                    <Rocket className="mr-2 h-5 w-5 group-hover:animate-wiggle" />
                    Start Learning Now
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button size="xl" variant="secondary" className="group">
                    <Trophy className="mr-2 h-5 w-5" />
                    Go to Dashboard
                  </Button>
                </Link>
              </div>

              {/* Additional info */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  📧 A confirmation email has been sent to your inbox.
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  You can manage your subscription from your{' '}
                  <Link href="/dashboard" className="text-[#A66CFF] hover:underline font-bold">
                    dashboard
                  </Link>
                  .
                </p>
              </div>
            </div>

            {/* Next Steps */}
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                {
                  emoji: '📚',
                  title: 'Explore Courses',
                  description: 'Browse all premium courses',
                  href: '/courses',
                },
                {
                  emoji: '🎯',
                  title: 'Take a Quiz',
                  description: 'Test your skills',
                  href: '/courses',
                },
                {
                  emoji: '🏆',
                  title: 'View Leaderboard',
                  description: 'See your ranking',
                  href: '/dashboard',
                },
              ].map((item, index) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="bg-white rounded-2xl border-3 border-[#2D2D2D] p-5 shadow-[4px_4px_0_#2D2D2D] hover:shadow-[6px_6px_0_#2D2D2D] hover:-translate-y-1 transition-all group"
                >
                  <span className="text-4xl block animate-float mb-2" style={{ animationDelay: `${index * 0.2}s` }}>
                    {item.emoji}
                  </span>
                  <h3 className="font-bold text-[#2D2D2D] mb-1 group-hover:text-[#A66CFF] transition-colors" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-600">{item.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
