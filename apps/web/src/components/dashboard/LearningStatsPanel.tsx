'use client';

import React from 'react';

interface LearningStatsPanelProps {
  weeklyStats: {
    timeSpent: number;
    lessonsCompleted: number;
    quizzesAttempted: number;
    avgQuizScore: number;
  };
}

export default function LearningStatsPanel({ weeklyStats }: LearningStatsPanelProps) {
  const stats = [
    {
      icon: '⏱️',
      label: 'Time This Week',
      value: `${weeklyStats.timeSpent} min`,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: '📚',
      label: 'Lessons Completed',
      value: weeklyStats.lessonsCompleted.toString(),
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      icon: '🎯',
      label: 'Quizzes Attempted',
      value: weeklyStats.quizzesAttempted.toString(),
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      icon: '📊',
      label: 'Avg. Quiz Score',
      value: weeklyStats.avgQuizScore > 0 ? `${weeklyStats.avgQuizScore}%` : 'N/A',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        📈 This Week's Progress
      </h3>

      <div className="space-y-4">
        {stats.map((stat, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`${stat.bgColor} p-2 rounded-lg`}>
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Motivational Message */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-600 text-center">
          {weeklyStats.timeSpent > 60 ? (
            <span className="text-green-600 font-semibold">🎉 Great work this week! Keep it up!</span>
          ) : weeklyStats.timeSpent > 0 ? (
            <span className="text-blue-600 font-semibold">📚 You're making progress!</span>
          ) : (
            <span className="text-gray-500">Start learning to see your stats!</span>
          )}
        </p>
      </div>
    </div>
  );
}
