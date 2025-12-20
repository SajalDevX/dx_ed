'use client';

import React from 'react';
import Link from 'next/link';

export default function QuickActions() {
  const actions = [
    {
      icon: '📚',
      label: 'Browse Courses',
      description: 'Explore new courses',
      href: '/courses',
      color: 'from-blue-500 to-cyan-500',
      hoverColor: 'hover:from-blue-600 hover:to-cyan-600'
    },
    {
      icon: '🎯',
      label: 'My Courses',
      description: 'Continue learning',
      href: '/dashboard',
      color: 'from-purple-500 to-pink-500',
      hoverColor: 'hover:from-purple-600 hover:to-pink-600'
    },
    {
      icon: '🏆',
      label: 'My Badges',
      description: 'View achievements',
      href: '/dashboard',
      color: 'from-yellow-500 to-orange-500',
      hoverColor: 'hover:from-yellow-600 hover:to-orange-600'
    },
    {
      icon: '📜',
      label: 'Certificates',
      description: 'View earned certificates',
      href: '/dashboard',
      color: 'from-green-500 to-emerald-500',
      hoverColor: 'hover:from-green-600 hover:to-emerald-600'
    },
    {
      icon: '📊',
      label: 'Leaderboard',
      description: 'Compare your progress',
      href: '/leaderboard',
      color: 'from-red-500 to-pink-500',
      hoverColor: 'hover:from-red-600 hover:to-pink-600'
    },
    {
      icon: '⚙️',
      label: 'Settings',
      description: 'Manage your account',
      href: '/settings',
      color: 'from-gray-500 to-slate-500',
      hoverColor: 'hover:from-gray-600 hover:to-slate-600'
    }
  ];

  return (
    <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        ⚡ Quick Actions
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {actions.map((action, index) => (
          <Link
            key={index}
            href={action.href}
            className="group"
          >
            <div className={`bg-gradient-to-br ${action.color} ${action.hoverColor} p-4 rounded-xl text-white transition-all duration-300 hover:shadow-lg hover:scale-105`}>
              <div className="text-3xl mb-2">{action.icon}</div>
              <h4 className="text-sm font-bold mb-1">{action.label}</h4>
              <p className="text-xs opacity-90">{action.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
