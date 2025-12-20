'use client';

import React from 'react';

interface DashboardHeaderProps {
  firstName: string;
  lastName: string;
  currentStreak: number;
  isActiveToday: boolean;
}

export default function DashboardHeader({
  firstName,
  lastName,
  currentStreak,
  isActiveToday
}: DashboardHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-2xl p-8 text-white shadow-xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Welcome back, {firstName}! 👋
          </h1>
          <p className="text-purple-100 text-lg">
            Ready to continue your learning journey?
          </p>
        </div>

        <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-4 border border-white/30">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🔥</span>
            <div>
              <p className="text-sm text-purple-100">Learning Streak</p>
              <p className="text-2xl font-bold">{currentStreak} {currentStreak === 1 ? 'day' : 'days'}</p>
            </div>
          </div>
          {isActiveToday && (
            <p className="text-xs text-purple-100 mt-2">Active today! Keep it up!</p>
          )}
        </div>
      </div>
    </div>
  );
}
