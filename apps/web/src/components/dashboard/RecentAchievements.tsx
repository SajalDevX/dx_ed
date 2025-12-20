'use client';

import React from 'react';

interface Achievement {
  badge: {
    name: string;
    description: string;
    icon: string;
    type: string;
    rarity: string;
  };
  earnedAt: Date;
  isNew: boolean;
}

interface RecentAchievementsProps {
  achievements: Achievement[];
}

export default function RecentAchievements({ achievements }: RecentAchievementsProps) {
  if (achievements.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          🏆 Recent Achievements
        </h3>
        <div className="text-center py-8">
          <div className="text-5xl mb-3">🎯</div>
          <p className="text-gray-500 text-sm">
            Complete courses and quizzes to earn badges!
          </p>
        </div>
      </div>
    );
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'from-yellow-400 to-orange-500';
      case 'epic':
        return 'from-purple-400 to-pink-500';
      case 'rare':
        return 'from-blue-400 to-cyan-500';
      case 'uncommon':
        return 'from-green-400 to-emerald-500';
      default:
        return 'from-gray-400 to-gray-500';
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - new Date(date).getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        🏆 Recent Achievements
      </h3>

      <div className="space-y-3">
        {achievements.map((achievement, index) => (
          <div
            key={index}
            className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors relative"
          >
            {achievement.isNew && (
              <div className="absolute top-2 right-2">
                <span className="inline-block px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
                  NEW
                </span>
              </div>
            )}

            <div className={`flex-shrink-0 w-12 h-12 bg-gradient-to-br ${getRarityColor(achievement.badge.rarity)} rounded-xl flex items-center justify-center text-2xl shadow-lg`}>
              {achievement.badge.icon || '🏆'}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-gray-900 mb-1">
                {achievement.badge.name}
              </h4>
              <p className="text-xs text-gray-600 mb-1 line-clamp-2">
                {achievement.badge.description}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-gray-500">
                  {formatDate(achievement.earnedAt)}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                  achievement.badge.rarity === 'legendary' ? 'bg-yellow-100 text-yellow-700' :
                  achievement.badge.rarity === 'epic' ? 'bg-purple-100 text-purple-700' :
                  achievement.badge.rarity === 'rare' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {achievement.badge.rarity}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {achievements.length >= 5 && (
        <div className="mt-4 pt-4 border-t border-gray-200 text-center">
          <a href="/dashboard" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
            View All Badges →
          </a>
        </div>
      )}
    </div>
  );
}
