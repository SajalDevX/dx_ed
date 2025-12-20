'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  Bell,
  User,
  BookOpen,
  LogOut,
  Settings,
  LayoutDashboard,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';
import { getInitials } from '@/lib/utils';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();

  // Only show these links when user is authenticated
  const navLinks = isAuthenticated
    ? [{ href: '/courses', label: 'Courses' }]
    : [];

  const handleLogout = async () => {
    await logout();
    setIsProfileOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#FAF8F5]">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-1">
            <Sparkles className="h-6 w-6 text-[#F5C94C]" />
            <span className="text-xl font-bold text-[#1a1a1a]" style={{ fontFamily: "'Comic Neue', cursive" }}>
              DXTalent
            </span>
            <Sparkles className="h-4 w-4 text-[#F5C94C]" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-bold transition-colors hover:text-[#F5C94C] ${
                  pathname === link.href ? 'text-[#F5C94C]' : 'text-[#1a1a1a]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden md:flex md:items-center md:space-x-3">

            {isAuthenticated && user ? (
              <>
                <button className="relative rounded-full border-2 border-[#1a1a1a] bg-white p-2 text-[#1a1a1a] hover:bg-gray-50">
                  <Bell className="h-5 w-5" />
                  <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
                </button>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 rounded-full border-2 border-[#1a1a1a] bg-white px-3 py-1.5 hover:bg-gray-50"
                  >
                    {user.profile.avatar ? (
                      <img
                        src={user.profile.avatar}
                        alt={user.profile.firstName}
                        className="h-7 w-7 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F5C94C] text-sm font-bold text-[#1a1a1a]">
                        {getInitials(user.profile.firstName, user.profile.lastName)}
                      </div>
                    )}
                    <ChevronDown className="h-4 w-4 text-[#1a1a1a]" />
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl border-2 border-[#1a1a1a] bg-white py-2 shadow-[4px_4px_0_#1a1a1a]">
                      <div className="border-b border-gray-200 px-4 py-2">
                        <p className="font-bold text-[#1a1a1a]">
                          {user.profile.firstName} {user.profile.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      <Link
                        href="/dashboard"
                        className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-[#1a1a1a] hover:bg-[#F5C94C]/20"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                      <Link
                        href="/my-courses"
                        className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-[#1a1a1a] hover:bg-[#F5C94C]/20"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <BookOpen className="h-4 w-4" />
                        <span>My Courses</span>
                      </Link>
                      <Link
                        href="/settings"
                        className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-[#1a1a1a] hover:bg-[#F5C94C]/20"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                      <hr className="my-2" />
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center space-x-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/login">
                  <Button variant="secondary">Login / Sign Up</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="border-t py-4 md:hidden">
            <div className="space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block rounded-lg px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {!isAuthenticated && (
                <>
                  <hr className="my-2" />
                  <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      Log in
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full">Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
