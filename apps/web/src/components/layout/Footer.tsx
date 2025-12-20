import Link from 'next/link';
import { Github, Twitter, Linkedin, Youtube, Sparkles, Gamepad2, BookOpen, Building2, Shield, Heart, Zap, Trophy } from 'lucide-react';

const footerLinks = {
  platform: {
    emoji: '🎮',
    title: 'Platform',
    color: 'from-[#FF6B6B] to-[#FF9EAA]',
    links: [
      { label: 'Browse Quests', href: '/courses', emoji: '🗺️' },
      { label: 'Free Quests', href: '/courses?pricing=free', emoji: '🎁' },
      { label: 'Pricing', href: '/pricing', emoji: '💎' },
      { label: 'For Recruiters', href: '#', emoji: '🏰' },
    ],
  },
  resources: {
    emoji: '📚',
    title: 'Resources',
    color: 'from-[#FFD93D] to-[#FFC107]',
    links: [
      { label: 'Blog', href: '#', emoji: '📖' },
      { label: 'Help Center', href: '#', emoji: '🆘' },
      { label: 'Community', href: '#', emoji: '👥' },
      { label: 'Become an Instructor', href: '#', emoji: '🧙' },
    ],
  },
  company: {
    emoji: '🏢',
    title: 'Company',
    color: 'from-[#4ECDC4] to-[#6BCB77]',
    links: [
      { label: 'About Us', href: '/about', emoji: '⭐' },
      { label: 'Careers', href: '#', emoji: '🚀' },
      { label: 'Contact', href: '/contact', emoji: '💌' },
      { label: 'Press', href: '#', emoji: '📰' },
    ],
  },
  legal: {
    emoji: '⚖️',
    title: 'Legal',
    color: 'from-[#A66CFF] to-[#FF6B6B]',
    links: [
      { label: 'Terms of Service', href: '#', emoji: '📜' },
      { label: 'Privacy Policy', href: '#', emoji: '🔒' },
      { label: 'Cookie Policy', href: '#', emoji: '🍪' },
    ],
  },
};

const socialLinks = [
  { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
  { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
  { icon: Youtube, href: 'https://youtube.com', label: 'YouTube' },
  { icon: Github, href: 'https://github.com', label: 'GitHub' },
];

export function Footer() {
  return (
    <footer className="bg-[#FFF9E6] border-t-4 border-[#2D2D2D] relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-10 right-10 text-4xl opacity-10 animate-float">⭐</div>
      <div className="absolute bottom-10 left-10 text-3xl opacity-10 animate-float" style={{ animationDelay: '1s' }}>🎮</div>
      <div className="absolute top-1/2 left-1/4 text-2xl opacity-10 animate-float" style={{ animationDelay: '0.5s' }}>🏆</div>

      <div className="container mx-auto px-4 py-12 relative">
        {/* Top Section with Stats */}
        <div className="mb-12 grid grid-cols-2 gap-4 sm:grid-cols-4 max-w-4xl mx-auto">
          {[
            { emoji: '🦸', label: 'Heroes', value: '10K+', color: 'from-[#FF6B6B] to-[#FF9EAA]' },
            { emoji: '🎯', label: 'Quests', value: '50+', color: 'from-[#FFD93D] to-[#FFC107]' },
            { emoji: '🏆', label: 'Badges', value: '100+', color: 'from-[#4ECDC4] to-[#6BCB77]' },
            { emoji: '💼', label: 'Partners', value: '200+', color: 'from-[#A66CFF] to-[#FF6B6B]' },
          ].map((stat, index) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl border-3 border-[#2D2D2D] p-4 text-center shadow-[4px_4px_0_#2D2D2D] hover:shadow-[6px_6px_0_#2D2D2D] hover:-translate-y-1 transition-all"
            >
              <span className="text-3xl block animate-float" style={{ animationDelay: `${index * 0.15}s` }}>{stat.emoji}</span>
              <p className={`mt-2 text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`} style={{ fontFamily: "'Fredoka', sans-serif" }}>
                {stat.value}
              </p>
              <p className="text-xs text-gray-500 font-semibold">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-8 md:grid-cols-6">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="inline-flex items-center space-x-1 group">
              <Sparkles className="h-7 w-7 text-[#FFD93D] group-hover:animate-spin" />
              <span className="text-2xl font-bold text-[#2D2D2D]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                DXTalent
              </span>
              <Sparkles className="h-5 w-5 text-[#FFD93D]" />
            </Link>

            {/* Mission Badge */}
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FFD93D] to-[#FF6B6B] border-2 border-[#2D2D2D] px-4 py-2 text-xs font-bold text-[#2D2D2D] shadow-[3px_3px_0_#2D2D2D]">
              <Gamepad2 className="h-3 w-3" />
              <span>Leveling Up Skills Since 2024</span>
            </div>

            <p className="mt-4 text-sm text-gray-600 leading-relaxed max-w-xs">
              🎮 Level up your digital skills through epic quests. Earn badges, get recognized, and land your dream job! 🚀
            </p>

            {/* Social Links */}
            <div className="mt-6 flex space-x-3">
              {socialLinks.map((social, index) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex h-10 w-10 items-center justify-center rounded-xl border-3 border-[#2D2D2D] bg-white text-[#2D2D2D] transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0_#2D2D2D] hover:bg-[#FFD93D]"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                </a>
              ))}
            </div>
          </div>

          {/* Dynamic Link Sections */}
          {Object.entries(footerLinks).map(([key, section]) => (
            <div key={key}>
              {/* Section Header with emoji and gradient */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">{section.emoji}</span>
                <h3 className={`font-bold bg-gradient-to-r ${section.color} bg-clip-text text-transparent`} style={{ fontFamily: "'Fredoka', sans-serif" }}>
                  {section.title}
                </h3>
              </div>

              <ul className="space-y-2.5">
                {section.links.map((link, linkIndex) => (
                  <li key={`${key}-${linkIndex}`}>
                    <Link
                      href={link.href}
                      className="group flex items-center gap-2 text-sm text-gray-600 hover:text-[#2D2D2D] transition-all"
                    >
                      <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">{link.emoji}</span>
                      <span className="group-hover:translate-x-1 transition-transform">{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section - Fun & Gamified */}
        <div className="mt-12 pt-8 border-t-3 border-[#2D2D2D]">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            {/* Copyright */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 rounded-full bg-white border-2 border-[#2D2D2D] px-4 py-2 shadow-[2px_2px_0_#2D2D2D]">
                <Shield className="h-4 w-4 text-[#6BCB77]" />
                <p className="text-xs font-bold text-[#2D2D2D]">
                  &copy; {new Date().getFullYear()} DXTalent
                </p>
              </div>
            </div>

            {/* Fun Message */}
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FF6B6B] to-[#FFD93D] border-2 border-[#2D2D2D] px-5 py-2 shadow-[3px_3px_0_#2D2D2D]">
                <Heart className="h-4 w-4 text-white animate-pulse" />
                <p className="text-xs font-bold text-white">
                  Made with love for heroes worldwide
                </p>
                <Trophy className="h-4 w-4 text-white" />
              </div>
            </div>

            {/* Achievement Badge */}
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#A66CFF] border-2 border-[#2D2D2D] px-4 py-2 shadow-[2px_2px_0_#2D2D2D]">
                <Zap className="h-4 w-4 text-white" />
                <p className="text-xs font-bold text-white">
                  All rights reserved
                </p>
              </div>
            </div>
          </div>

          {/* Extra fun tagline */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              🎯 Keep learning, keep leveling up! ⚡
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
