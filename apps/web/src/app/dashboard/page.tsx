'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import {
  BookOpen,
  Clock,
  Award,
  TrendingUp,
  PlayCircle,
  Loader2,
  ChevronRight,
  Flame,
  Trophy,
  Zap,
  Target,
  Star,
  Sparkles,
  Rocket,
  Crown,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';
import apiClient from '@/lib/api/client';
import type { Enrollment } from '@/types';

interface EnrollmentsResponse {
  enrollments: Enrollment[];
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth?redirect=/dashboard');
    }
  }, [isAuthenticated, router]);

  const { data, isLoading } = useQuery({
    queryKey: ['enrollments'],
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; data: EnrollmentsResponse }>('/users/enrollments');
      return response.data;
    },
    enabled: isAuthenticated,
  });

  const enrollments = data?.data?.enrollments || [];

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFF9E6]">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="w-24 h-24 bg-gradient-to-br from-[#FFD93D] to-[#FF6B6B] rounded-full flex items-center justify-center border-4 border-[#2D2D2D] shadow-[6px_6px_0_#2D2D2D] animate-bounce">
              <Loader2 className="h-12 w-12 text-[#2D2D2D] animate-spin" />
            </div>
          </div>
          <p className="mt-6 text-xl font-bold text-[#2D2D2D]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
            Loading your quest log...
          </p>
          <p className="text-gray-500">Preparing your adventure 🗡️</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const inProgressCourses = enrollments.filter((e) => e.status === 'active');
  const completedCourses = enrollments.filter((e) => e.status === 'completed');
  const totalXP = user?.gamification?.points || 0;
  const currentStreak = user?.gamification?.streak?.current || 0;
  const userLevel = Math.floor(totalXP / 1000) + 1;
  const xpToNextLevel = 1000 - (totalXP % 1000);
  const xpProgress = ((totalXP % 1000) / 1000) * 100;

  return (
    <div className="min-h-screen bg-[#FFF9E6] overflow-hidden">
      {/* Floating decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 text-4xl animate-float opacity-20">⭐</div>
        <div className="absolute top-40 right-20 text-3xl animate-float opacity-20" style={{ animationDelay: '1s' }}>🎮</div>
        <div className="absolute bottom-40 left-20 text-3xl animate-float opacity-20" style={{ animationDelay: '2s' }}>🏆</div>
        <div className="absolute bottom-20 right-40 text-2xl animate-float opacity-20" style={{ animationDelay: '0.5s' }}>💎</div>
      </div>

      <div className="container mx-auto px-4 py-8 relative">
        {/* Header Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-[#A66CFF] via-[#FF6B6B] to-[#FFD93D] rounded-[30px] border-4 border-[#2D2D2D] p-6 md:p-8 shadow-[8px_8px_0_#2D2D2D] relative overflow-hidden">
            {/* Decorations */}
            <div className="absolute top-4 right-4 text-4xl animate-float opacity-40">✨</div>
            <div className="absolute bottom-4 left-4 text-3xl animate-float opacity-40" style={{ animationDelay: '1s' }}>🎮</div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
              {/* Welcome Message */}
              <div className="text-white">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur px-4 py-2 text-sm font-bold mb-4">
                  <Crown className="h-4 w-4" />
                  <span>Level {userLevel} Hero</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold drop-shadow-lg" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                  Welcome back, {user?.profile?.firstName || 'Hero'}!
                  <span className="inline-block ml-2 animate-wiggle">👋</span>
                </h1>
                <p className="mt-2 text-white/90 text-lg">
                  Ready to continue your epic quest?
                </p>
              </div>

              {/* XP Progress */}
              <div className="bg-white/20 backdrop-blur rounded-2xl p-4 min-w-[280px]">
                <div className="flex items-center justify-between text-white text-sm font-bold mb-2">
                  <span className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Level {userLevel}
                  </span>
                  <span>Level {userLevel + 1}</span>
                </div>
                <div className="h-4 bg-white/30 rounded-full overflow-hidden border-2 border-white/50">
                  <div
                    className="h-full bg-gradient-to-r from-[#FFD93D] to-[#6BCB77] rounded-full transition-all relative"
                    style={{ width: `${xpProgress}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                  </div>
                </div>
                <p className="mt-2 text-white/80 text-xs text-center">
                  {xpToNextLevel} XP to next level • Total: {totalXP} XP
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: BookOpen,
              value: enrollments.length,
              label: 'Active Quests',
              emoji: '📚',
              color: 'from-[#4ECDC4] to-[#6BCB77]',
              iconBg: 'bg-[#4ECDC4]',
            },
            {
              icon: Trophy,
              value: completedCourses.length,
              label: 'Quests Completed',
              emoji: '🏆',
              color: 'from-[#FFD93D] to-[#FFC107]',
              iconBg: 'bg-[#FFD93D]',
            },
            {
              icon: Zap,
              value: totalXP,
              label: 'Total XP',
              emoji: '⚡',
              color: 'from-[#A66CFF] to-[#FF6B6B]',
              iconBg: 'bg-[#A66CFF]',
            },
            {
              icon: Flame,
              value: currentStreak,
              label: 'Day Streak',
              emoji: '🔥',
              color: 'from-[#FF6B6B] to-[#FF9EAA]',
              iconBg: 'bg-[#FF6B6B]',
            },
          ].map((stat, index) => (
            <div
              key={stat.label}
              className="group bg-white rounded-[20px] border-4 border-[#2D2D2D] p-5 shadow-[5px_5px_0_#2D2D2D] hover:shadow-[7px_7px_0_#2D2D2D] hover:-translate-y-1 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-xl ${stat.iconBg} border-2 border-[#2D2D2D] shadow-[2px_2px_0_#2D2D2D] flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <stat.icon className="h-7 w-7 text-white" />
                </div>
                <div>
                  <p className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`} style={{ fontFamily: "'Fredoka', sans-serif" }}>
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-500 font-semibold">{stat.label}</p>
                </div>
              </div>
              <span className="absolute top-3 right-3 text-2xl opacity-0 group-hover:opacity-100 transition-opacity animate-float">
                {stat.emoji}
              </span>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <Link href="/courses" className="group">
            <div className="bg-gradient-to-br from-[#4ECDC4] to-[#6BCB77] rounded-2xl border-3 border-[#2D2D2D] p-5 shadow-[4px_4px_0_#2D2D2D] hover:shadow-[6px_6px_0_#2D2D2D] hover:-translate-y-1 transition-all flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div className="text-white">
                <p className="font-bold" style={{ fontFamily: "'Fredoka', sans-serif" }}>Find New Quests</p>
                <p className="text-sm text-white/80">Explore courses</p>
              </div>
              <ChevronRight className="h-5 w-5 text-white ml-auto group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link href="#badges" className="group">
            <div className="bg-gradient-to-br from-[#FFD93D] to-[#FFC107] rounded-2xl border-3 border-[#2D2D2D] p-5 shadow-[4px_4px_0_#2D2D2D] hover:shadow-[6px_6px_0_#2D2D2D] hover:-translate-y-1 transition-all flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Award className="h-6 w-6 text-[#2D2D2D]" />
              </div>
              <div className="text-[#2D2D2D]">
                <p className="font-bold" style={{ fontFamily: "'Fredoka', sans-serif" }}>My Badges</p>
                <p className="text-sm text-[#2D2D2D]/70">{user?.gamification?.badges?.length || 0} earned</p>
              </div>
              <ChevronRight className="h-5 w-5 text-[#2D2D2D] ml-auto group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link href="#leaderboard" className="group">
            <div className="bg-gradient-to-br from-[#A66CFF] to-[#FF6B6B] rounded-2xl border-3 border-[#2D2D2D] p-5 shadow-[4px_4px_0_#2D2D2D] hover:shadow-[6px_6px_0_#2D2D2D] hover:-translate-y-1 transition-all flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="text-white">
                <p className="font-bold" style={{ fontFamily: "'Fredoka', sans-serif" }}>Leaderboard</p>
                <p className="text-sm text-white/80">See rankings</p>
              </div>
              <ChevronRight className="h-5 w-5 text-white ml-auto group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        {/* In Progress Courses */}
        <section className="mb-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#FF6B6B] to-[#FF9EAA] rounded-xl border-2 border-[#2D2D2D] shadow-[2px_2px_0_#2D2D2D] flex items-center justify-center">
                <Rocket className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-[#2D2D2D]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                Continue Your Quest
                <span className="inline-block ml-2">🗡️</span>
              </h2>
            </div>
            {inProgressCourses.length > 3 && (
              <Link href="/dashboard/courses" className="text-sm font-bold text-[#A66CFF] hover:text-[#FF6B6B] transition-colors flex items-center gap-1">
                View all
                <ChevronRight className="h-4 w-4" />
              </Link>
            )}
          </div>

          {inProgressCourses.length === 0 ? (
            <div className="bg-white rounded-[25px] border-4 border-dashed border-[#2D2D2D]/30 p-12 text-center">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-[#FFD93D]/30 to-[#FF6B6B]/30 rounded-full flex items-center justify-center border-4 border-dashed border-[#2D2D2D]/20">
                <BookOpen className="h-12 w-12 text-[#2D2D2D]/40" />
              </div>
              <h3 className="mt-6 text-2xl font-bold text-[#2D2D2D]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                No Active Quests
              </h3>
              <p className="mt-2 text-gray-500">Begin your adventure by starting a new quest!</p>
              <Link href="/courses">
                <Button className="mt-6 group" size="lg">
                  <Sparkles className="mr-2 h-5 w-5 group-hover:animate-sparkle" />
                  Browse Quests
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {inProgressCourses.slice(0, 3).map((enrollment, index) => (
                <div
                  key={enrollment._id}
                  className="group bg-white rounded-[25px] border-4 border-[#2D2D2D] overflow-hidden shadow-[6px_6px_0_#2D2D2D] hover:shadow-[8px_8px_0_#2D2D2D] hover:-translate-y-2 transition-all"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                    {enrollment.course.thumbnail ? (
                      <Image
                        src={enrollment.course.thumbnail}
                        alt={enrollment.course.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                        priority
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <BookOpen className="h-16 w-16 text-[#2D2D2D]/20" />
                      </div>
                    )}

                    {/* XP Badge */}
                    <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-[#2D2D2D] px-3 py-1 text-xs font-bold text-[#FFD93D]">
                      <Zap className="h-3 w-3" />
                      +{Math.floor((enrollment.course.content?.totalLessons || 5) * 10)} XP
                    </div>

                    {/* Progress overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                      <div className="flex items-center justify-between text-white text-xs font-bold mb-1">
                        <span>{enrollment.progress.percentage}% Complete</span>
                        <span>{enrollment.progress.completedLessons.length}/{enrollment.course.content?.totalLessons || 0}</span>
                      </div>
                      <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#4ECDC4] to-[#6BCB77] rounded-full transition-all"
                          style={{ width: `${enrollment.progress.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-bold text-[#2D2D2D] text-lg line-clamp-2 group-hover:text-[#FF6B6B] transition-colors" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                      {enrollment.course.title}
                    </h3>

                    <Link href={`/courses/${enrollment.course.slug}/learn`}>
                      <Button className="mt-4 w-full group/btn" size="lg">
                        <PlayCircle className="mr-2 h-5 w-5 group-hover/btn:animate-pulse" />
                        Continue Quest
                        <ChevronRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Completed Courses */}
        {completedCourses.length > 0 && (
          <section className="mb-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#FFD93D] to-[#FFC107] rounded-xl border-2 border-[#2D2D2D] shadow-[2px_2px_0_#2D2D2D] flex items-center justify-center">
                <Trophy className="h-5 w-5 text-[#2D2D2D]" />
              </div>
              <h2 className="text-2xl font-bold text-[#2D2D2D]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                Conquered Quests
                <span className="inline-block ml-2">🏆</span>
              </h2>
            </div>

            <div className="space-y-4">
              {completedCourses.map((enrollment) => (
                <div
                  key={enrollment._id}
                  className="group bg-white rounded-2xl border-3 border-[#2D2D2D] p-4 shadow-[4px_4px_0_#2D2D2D] hover:shadow-[6px_6px_0_#2D2D2D] hover:-translate-y-1 transition-all flex items-center gap-4"
                >
                  {/* Thumbnail */}
                  <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border-2 border-[#2D2D2D]">
                    {enrollment.course.thumbnail ? (
                      <Image
                        src={enrollment.course.thumbnail}
                        alt={enrollment.course.title}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#FFD93D]/20 to-[#FF6B6B]/20">
                        <BookOpen className="h-6 w-6 text-[#2D2D2D]/30" />
                      </div>
                    )}
                    {/* Completed checkmark */}
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#6BCB77] rounded-full border-2 border-[#2D2D2D] flex items-center justify-center">
                      <Star className="h-3 w-3 text-white fill-white" />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[#2D2D2D] truncate" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                      {enrollment.course.title}
                    </h3>
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <span>🎉 Completed {new Date(enrollment.completedAt!).toLocaleDateString()}</span>
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {enrollment.certificate?.issued && (
                      <Button variant="secondary" size="sm" className="rounded-xl border-2 border-[#2D2D2D] shadow-[2px_2px_0_#2D2D2D]">
                        <Award className="mr-2 h-4 w-4 text-[#FFD93D]" />
                        Certificate
                      </Button>
                    )}
                    <Link href={`/courses/${enrollment.course.slug}`}>
                      <Button variant="secondary" size="sm" className="rounded-xl border-2 border-[#2D2D2D] shadow-[2px_2px_0_#2D2D2D]">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Achievements Preview */}
        <section id="badges" className="mb-8">
          <div className="bg-white rounded-[25px] border-4 border-[#2D2D2D] p-6 shadow-[6px_6px_0_#2D2D2D]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#A66CFF] to-[#FF6B6B] rounded-xl border-2 border-[#2D2D2D] shadow-[2px_2px_0_#2D2D2D] flex items-center justify-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-[#2D2D2D]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                  Your Badges
                  <span className="inline-block ml-2">🛡️</span>
                </h2>
              </div>
              <span className="text-sm font-bold text-gray-500">
                {user?.gamification?.badges?.length || 0} / 20 Unlocked
              </span>
            </div>

            {/* Badge Grid */}
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-3">
              {/* Show earned badges or placeholders */}
              {[...Array(10)].map((_, i) => {
                const isEarned = i < (user?.gamification?.badges?.length || 0);
                return (
                  <div
                    key={i}
                    className={`aspect-square rounded-xl border-2 flex items-center justify-center text-2xl transition-all ${
                      isEarned
                        ? 'bg-gradient-to-br from-[#FFD93D] to-[#FF6B6B] border-[#2D2D2D] shadow-[2px_2px_0_#2D2D2D] hover:scale-110'
                        : 'bg-gray-100 border-dashed border-gray-300'
                    }`}
                  >
                    {isEarned ? ['🏆', '⭐', '🎯', '🚀', '💎', '🔥', '👑', '⚡', '🎮', '🏅'][i] : '?'}
                  </div>
                );
              })}
            </div>

            <p className="mt-4 text-center text-sm text-gray-500">
              Complete more quests to unlock legendary badges! 🎖️
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
