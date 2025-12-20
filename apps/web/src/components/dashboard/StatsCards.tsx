'use client';

import React from 'react';

interface StatsCardsProps {
  stats: {
    xpProgress: {
      current: number;
      nextLevel: number;
      percentage: number;
    };
    currentStreak: number;
    longestStreak: number;
    totalBadges: number;
    enrolledCourses: number;
    completedCourses: number;
  };
  userLevel: number;
}

export default function StatsCards({ stats, userLevel }: StatsCardsProps) {
  const cards = [
    {
      icon: '⚡',
      label: 'XP Points',
      value: `${stats.xpProgress.current}/${stats.xpProgress.nextLevel}`,
      subtitle: `${stats.xpProgress.percentage}% to Level ${userLevel + 1}`,
      color: 'from-yellow-400 to-orange-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600'
    },
    {
      icon: '🏆',
      label: 'Current Level',
      value: userLevel.toString(),
      subtitle: 'Keep learning to level up!',
      color: 'from-purple-400 to-pink-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      icon: '🎖️',
      label: 'Badges Earned',
      value: stats.totalBadges.toString(),
      subtitle: 'Unlock more achievements',
      color: 'from-blue-400 to-cyan-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      icon: '🔥',
      label: 'Learning Streak',
      value: `${stats.currentStreak} ${stats.currentStreak === 1 ? 'day' : 'days'}`,
      subtitle: `Best: ${stats.longestStreak} days`,
      color: 'from-red-400 to-pink-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`${card.bgColor} rounded-2xl p-6 border-2 border-gray-100 hover:shadow-lg transition-shadow duration-300`}
        >
          <div className="flex items-start justify-between mb-4">
            <div className={`text-4xl p-3 bg-gradient-to-br ${card.color} rounded-xl`}>
              {card.icon}
            </div>
          </div>
          <div>
            <p className="text-gray-600 text-sm font-medium mb-1">{card.label}</p>
            <p className={`text-2xl font-bold ${card.textColor} mb-1`}>{card.value}</p>
            <p className="text-gray-500 text-xs">{card.subtitle}</p>
          </div>

          {/* XP Progress Bar */}
          {index === 0 && (
            <div className="mt-4">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${card.color} transition-all duration-500`}
                  style={{ width: `${stats.xpProgress.percentage}%` }}
                />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
