import Link from 'next/link';
import { Sparkles, Target, Users, Trophy, Heart, Zap, Rocket, Star, ArrowRight, Shield, Gamepad2, Crown } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const values = [
  {
    icon: Target,
    emoji: '🎯',
    title: 'Learning by Doing',
    description: 'Master skills through epic quests and real-world challenges, not boring lectures.',
    color: 'from-[#FF6B6B] to-[#FF9EAA]',
  },
  {
    icon: Trophy,
    emoji: '🏆',
    title: 'Recognition Matters',
    description: 'Every achievement deserves celebration. Earn badges and climb the leaderboards!',
    color: 'from-[#FFD93D] to-[#FFC107]',
  },
  {
    icon: Users,
    emoji: '🤝',
    title: 'Guild Power',
    description: 'Join a supportive community of fellow heroes on the same adventure.',
    color: 'from-[#4ECDC4] to-[#6BCB77]',
  },
  {
    icon: Zap,
    emoji: '⚡',
    title: 'Level Up Fast',
    description: 'Our gamified system keeps you motivated and accelerates your learning journey.',
    color: 'from-[#A66CFF] to-[#FF6B6B]',
  },
];

const stats = [
  { value: '10K+', label: 'Heroes Trained', emoji: '🦸', color: 'text-[#FF6B6B]' },
  { value: '50+', label: 'Epic Quests', emoji: '🗡️', color: 'text-[#FFD93D]' },
  { value: '200+', label: 'Guild Partners', emoji: '🏰', color: 'text-[#4ECDC4]' },
  { value: '95%', label: 'Quest Success', emoji: '⭐', color: 'text-[#A66CFF]' },
];

const team = [
  { name: 'Alex the Founder', role: 'Guild Master', emoji: '👑', specialty: 'Vision & Strategy' },
  { name: 'Sam the Builder', role: 'Tech Wizard', emoji: '🧙', specialty: 'Platform Magic' },
  { name: 'Jordan the Guide', role: 'Quest Designer', emoji: '📜', specialty: 'Learning Paths' },
  { name: 'Riley the Connector', role: 'Community Lead', emoji: '🎯', specialty: 'Hero Support' },
];

export default function AboutPage() {
  return (
    <div className="bg-[#FFF9E6] min-h-screen overflow-hidden">
      {/* Floating decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 text-4xl animate-float opacity-20">⭐</div>
        <div className="absolute top-40 right-20 text-3xl animate-float opacity-20" style={{ animationDelay: '1s' }}>🎮</div>
        <div className="absolute bottom-40 left-20 text-3xl animate-float opacity-20" style={{ animationDelay: '2s' }}>🏆</div>
        <div className="absolute top-60 right-40 text-2xl animate-float opacity-20" style={{ animationDelay: '0.5s' }}>💎</div>
        <div className="absolute bottom-20 right-10 text-3xl animate-float opacity-20" style={{ animationDelay: '1.5s' }}>🚀</div>
      </div>

      {/* Hero Section */}
      <section className="py-16 md:py-24 relative">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#A66CFF] to-[#FF6B6B] border-3 border-[#2D2D2D] px-6 py-3 text-sm font-bold text-white shadow-[4px_4px_0_#2D2D2D] mb-8 animate-bounce-in">
              <Sparkles className="h-5 w-5 animate-sparkle" />
              <span>Our Story</span>
              <Heart className="h-5 w-5" />
            </div>

            <h1 className="text-4xl font-bold text-[#2D2D2D] sm:text-5xl md:text-6xl" style={{ fontFamily: "'Fredoka', sans-serif" }}>
              We're Building the{' '}
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-[#FF6B6B] via-[#FFD93D] to-[#4ECDC4] bg-clip-text text-transparent">
                  Future of Learning
                </span>
              </span>
              <span className="inline-block ml-2 animate-wiggle">🎮</span>
            </h1>

            <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              DXTalent is on an epic quest to transform how people learn digital skills.
              We believe in <span className="font-bold text-[#FF6B6B]">learning by doing</span>,
              <span className="font-bold text-[#FFD93D]"> gamification</span>, and
              <span className="font-bold text-[#4ECDC4]"> celebrating every achievement</span>.
            </p>

            {/* Hero illustration */}
            <div className="mt-12 flex justify-center gap-4">
              {['🎮', '📚', '🏆', '🚀', '💎'].map((emoji, i) => (
                <div
                  key={i}
                  className="w-16 h-16 bg-white rounded-2xl border-3 border-[#2D2D2D] shadow-[4px_4px_0_#2D2D2D] flex items-center justify-center text-3xl animate-float hover:scale-110 transition-transform"
                  style={{ animationDelay: `${i * 0.2}s` }}
                >
                  {emoji}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 relative">
        <div className="absolute inset-0 dots-pattern opacity-20" />

        <div className="container mx-auto px-4 relative">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#FFD93D]/20 px-4 py-2 text-sm font-bold text-[#2D2D2D] mb-4">
              <Shield className="h-4 w-4" />
              <span>Our Code</span>
            </div>
            <h2 className="text-3xl font-bold text-[#2D2D2D] sm:text-4xl" style={{ fontFamily: "'Fredoka', sans-serif" }}>
              The Values We{' '}
              <span className="bg-gradient-to-r from-[#FFD93D] to-[#FF6B6B] bg-clip-text text-transparent">
                Live By
              </span>
              <span className="inline-block ml-2">⚔️</span>
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {values.map((value, index) => (
              <div
                key={value.title}
                className="group relative"
              >
                <div className="bg-white rounded-[25px] border-4 border-[#2D2D2D] p-6 shadow-[6px_6px_0_#2D2D2D] hover:shadow-[8px_8px_0_#2D2D2D] hover:-translate-y-2 transition-all h-full">
                  {/* Colored top bar */}
                  <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${value.color} rounded-t-[21px]`} />

                  {/* Emoji */}
                  <span className="text-5xl block animate-float mt-2" style={{ animationDelay: `${index * 0.15}s` }}>
                    {value.emoji}
                  </span>

                  {/* Icon badge */}
                  <div className={`mt-4 w-12 h-12 rounded-xl bg-gradient-to-br ${value.color} flex items-center justify-center border-2 border-[#2D2D2D] shadow-[2px_2px_0_#2D2D2D]`}>
                    <value.icon className="h-6 w-6 text-white" />
                  </div>

                  <h3 className="mt-4 text-xl font-bold text-[#2D2D2D]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                    {value.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">{value.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="relative bg-gradient-to-br from-[#2D2D2D] to-[#1a1a1a] rounded-[30px] border-4 border-[#FFD93D] p-8 md:p-12 shadow-[8px_8px_0_#FFD93D] overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-4 left-4 text-4xl animate-float opacity-30">⭐</div>
            <div className="absolute bottom-4 right-4 text-4xl animate-float opacity-30" style={{ animationDelay: '1s' }}>🏆</div>

            {/* Section Header */}
            <div className="text-center mb-10 relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#FFD93D] border-2 border-white px-5 py-2 text-sm font-bold text-[#2D2D2D] mb-4">
                <Trophy className="h-4 w-4" />
                <span>Our Impact</span>
              </div>
              <h2 className="text-3xl font-bold text-white sm:text-4xl" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                The Numbers Speak
                <span className="inline-block ml-2 animate-wiggle">📊</span>
              </h2>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4 relative z-10">
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className="bg-white/10 backdrop-blur rounded-2xl border border-white/20 p-6 text-center hover:bg-white/20 transition-colors group"
                >
                  <span className="text-4xl block animate-float" style={{ animationDelay: `${index * 0.15}s` }}>
                    {stat.emoji}
                  </span>
                  <p className={`mt-3 text-4xl font-bold ${stat.color}`} style={{ fontFamily: "'Fredoka', sans-serif" }}>
                    {stat.value}
                  </p>
                  <p className="mt-1 text-sm text-gray-300">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 relative">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-[30px] border-4 border-[#2D2D2D] p-8 md:p-12 shadow-[8px_8px_0_#2D2D2D] relative overflow-hidden">
              {/* Gradient background */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#FF6B6B] via-[#FFD93D] to-[#4ECDC4]" />

              <div className="text-center">
                {/* Mission badge */}
                <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#4ECDC4] to-[#6BCB77] border-2 border-[#2D2D2D] px-5 py-2 text-sm font-bold text-white shadow-[3px_3px_0_#2D2D2D] mb-6">
                  <Rocket className="h-4 w-4" />
                  <span>Our Mission</span>
                </div>

                <h2 className="text-3xl font-bold text-[#2D2D2D] sm:text-4xl" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                  Democratizing Digital Skills
                  <span className="inline-block ml-2 animate-wiggle">🌍</span>
                </h2>

                <p className="mt-6 text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
                  We're on a quest to create a world where <span className="font-bold text-[#FF6B6B]">skills matter more than credentials</span>.
                  Where every learner can prove their abilities through <span className="font-bold text-[#FFD93D]">real challenges</span> and
                  get discovered by <span className="font-bold text-[#4ECDC4]">forward-thinking companies</span>.
                </p>

                {/* Mission pillars */}
                <div className="mt-10 grid gap-4 sm:grid-cols-3">
                  {[
                    { emoji: '🎓', title: 'Learn', desc: 'Interactive quests' },
                    { emoji: '🏆', title: 'Prove', desc: 'Earn recognition' },
                    { emoji: '🚀', title: 'Connect', desc: 'Get discovered' },
                  ].map((pillar, index) => (
                    <div
                      key={pillar.title}
                      className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-gray-200 p-4 hover:border-[#FFD93D] transition-colors"
                    >
                      <span className="text-3xl block animate-float" style={{ animationDelay: `${index * 0.2}s` }}>{pillar.emoji}</span>
                      <h3 className="mt-2 font-bold text-[#2D2D2D]">{pillar.title}</h3>
                      <p className="text-xs text-gray-500">{pillar.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#A66CFF]/20 px-4 py-2 text-sm font-bold text-[#A66CFF] mb-4">
              <Crown className="h-4 w-4" />
              <span>The Heroes</span>
            </div>
            <h2 className="text-3xl font-bold text-[#2D2D2D] sm:text-4xl" style={{ fontFamily: "'Fredoka', sans-serif" }}>
              Meet Our{' '}
              <span className="bg-gradient-to-r from-[#A66CFF] to-[#FF6B6B] bg-clip-text text-transparent">
                Dream Team
              </span>
              <span className="inline-block ml-2">👥</span>
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
            {team.map((member, index) => (
              <div
                key={member.name}
                className="group"
              >
                <div className="bg-white rounded-[25px] border-4 border-[#2D2D2D] p-6 shadow-[6px_6px_0_#2D2D2D] hover:shadow-[8px_8px_0_#2D2D2D] hover:-translate-y-2 transition-all text-center">
                  {/* Avatar */}
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#FFD93D] to-[#FF6B6B] rounded-full border-4 border-[#2D2D2D] flex items-center justify-center text-4xl shadow-[3px_3px_0_#2D2D2D] group-hover:scale-110 transition-transform">
                    {member.emoji}
                  </div>

                  <h3 className="mt-4 text-lg font-bold text-[#2D2D2D]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                    {member.name}
                  </h3>

                  <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#A66CFF]/20 px-3 py-1 text-xs font-semibold text-[#A66CFF]">
                    {member.role}
                  </div>

                  <p className="mt-3 text-sm text-gray-500">{member.specialty}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="relative max-w-4xl mx-auto overflow-hidden rounded-[30px] border-4 border-[#2D2D2D] bg-gradient-to-br from-[#4ECDC4] via-[#6BCB77] to-[#FFD93D] p-8 md:p-12 shadow-[8px_8px_0_#2D2D2D]">
            {/* Floating decorations */}
            <div className="absolute top-4 left-4 text-3xl animate-float opacity-40">✨</div>
            <div className="absolute bottom-4 right-4 text-3xl animate-float opacity-40" style={{ animationDelay: '1s' }}>🎮</div>
            <div className="absolute top-1/2 right-8 text-2xl animate-float opacity-30" style={{ animationDelay: '0.5s' }}>🚀</div>

            <div className="text-center relative z-10">
              <h2 className="text-3xl font-bold text-white md:text-4xl drop-shadow-lg" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                Ready to Join Our Quest?
                <span className="inline-block ml-2 animate-wiggle">⚔️</span>
              </h2>
              <p className="mt-4 text-white/90 text-lg max-w-xl mx-auto">
                Become a hero and start your learning adventure today. It's free to begin!
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/auth?mode=signup">
                  <Button size="xl" className="bg-white text-[#2D2D2D] hover:bg-[#FFD93D] group">
                    <Gamepad2 className="mr-2 h-5 w-5 group-hover:animate-wiggle" />
                    Start Your Journey
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/courses">
                  <Button size="xl" variant="secondary" className="border-white/30 text-white hover:bg-white/20">
                    <Star className="mr-2 h-5 w-5" />
                    Explore Quests
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
