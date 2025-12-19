'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, Sparkles, Zap, Crown, Rocket, Shield, Star, Trophy, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';
import { paymentsApi } from '@/lib/api/payments';
import toast from 'react-hot-toast';

const plans = [
  {
    name: 'Starter',
    emoji: '🌱',
    price: '0',
    description: 'Perfect for beginners',
    color: 'from-[#6BCB77] to-[#4ECDC4]',
    borderColor: 'border-[#6BCB77]',
    features: [
      { text: 'Access to free quests', included: true },
      { text: 'Basic challenges & quizzes', included: true },
      { text: 'Community guild access', included: true },
      { text: 'Progress tracking', included: true },
      { text: 'Starter badges (5)', included: true },
      { text: 'Premium courses', included: false },
      { text: 'Skill certificates', included: false },
    ],
    cta: 'Start Free',
    plan: 'starter',
    popular: false,
  },
  {
    name: 'Hero',
    emoji: '🦸',
    price: '19',
    description: 'For serious adventurers',
    color: 'from-[#FFD93D] to-[#FF6B6B]',
    borderColor: 'border-[#FFD93D]',
    features: [
      { text: 'All Starter features', included: true },
      { text: 'Access to ALL quests', included: true },
      { text: 'Advanced boss battles', included: true },
      { text: 'Skill certificates', included: true },
      { text: 'Priority support', included: true },
      { text: 'Recruiter visibility', included: true },
      { text: 'Legendary badges (50+)', included: true },
    ],
    cta: 'Become a Hero',
    plan: 'hero',
    popular: true,
  },
  {
    name: 'Guild',
    emoji: '🏰',
    price: '49',
    description: 'For teams & organizations',
    color: 'from-[#A66CFF] to-[#FF6B6B]',
    borderColor: 'border-[#A66CFF]',
    features: [
      { text: 'All Hero features', included: true },
      { text: 'Team management', included: true },
      { text: 'Custom learning paths', included: true },
      { text: 'Analytics dashboard', included: true },
      { text: 'API access', included: true },
      { text: 'Dedicated support', included: true },
      { text: 'Custom guild branding', included: true },
    ],
    cta: 'Contact Sales',
    plan: 'guild',
    popular: false,
  },
];

const faqs = [
  {
    emoji: '🔄',
    q: 'Can I switch plans anytime?',
    a: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we\'ll prorate your billing.',
  },
  {
    emoji: '🎮',
    q: 'Is there a free trial for Hero?',
    a: 'Yes! We offer a 7-day free trial for the Hero plan. No credit card required to start your adventure.',
  },
  {
    emoji: '💳',
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit cards, PayPal, and bank transfers for Guild plans. All payments are secure and encrypted.',
  },
  {
    emoji: '💰',
    q: 'Can I get a refund?',
    a: 'We offer a 30-day money-back guarantee. If you\'re not satisfied with your quest, contact us for a full refund.',
  },
];

export default function PricingPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handlePlanSelect = async (plan: typeof plans[0]) => {
    // Guild plan always goes to contact
    if (plan.plan === 'guild') {
      router.push('/contact');
      return;
    }

    // Starter plan - go to register or courses
    if (plan.plan === 'starter') {
      if (isAuthenticated) {
        router.push('/courses');
      } else {
        router.push('/register');
      }
      return;
    }

    // Hero plan - needs authentication first
    if (!isAuthenticated) {
      router.push('/register?plan=hero');
      return;
    }

    // Logged in user selecting Hero - go to Stripe checkout
    try {
      setLoadingPlan(plan.plan);
      const response = await paymentsApi.createSubscriptionCheckout('hero');

      if (response.success && response.data?.url) {
        window.location.href = response.data.url;
      } else {
        toast.error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to start checkout. Please try again.');
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="bg-[#FFF9E6] min-h-screen overflow-hidden">
      {/* Floating decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 text-4xl animate-float opacity-20">💎</div>
        <div className="absolute top-40 right-20 text-3xl animate-float opacity-20" style={{ animationDelay: '1s' }}>⭐</div>
        <div className="absolute bottom-40 left-20 text-3xl animate-float opacity-20" style={{ animationDelay: '2s' }}>🏆</div>
        <div className="absolute top-60 right-40 text-2xl animate-float opacity-20" style={{ animationDelay: '0.5s' }}>🎮</div>
      </div>

      {/* Hero Section */}
      <section className="py-16 md:py-24 relative">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FFD93D] to-[#FF6B6B] border-3 border-[#2D2D2D] px-6 py-3 text-sm font-bold text-[#2D2D2D] shadow-[4px_4px_0_#2D2D2D] mb-8 animate-bounce-in">
              <Crown className="h-5 w-5" />
              <span>Choose Your Power Level</span>
              <Sparkles className="h-5 w-5" />
            </div>

            <h1 className="text-4xl font-bold text-[#2D2D2D] sm:text-5xl md:text-6xl" style={{ fontFamily: "'Fredoka', sans-serif" }}>
              Level Up Your{' '}
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-[#FF6B6B] to-[#A66CFF] bg-clip-text text-transparent">
                  Adventure
                </span>
              </span>
              <span className="inline-block ml-2 animate-wiggle">🚀</span>
            </h1>

            <p className="mt-6 text-lg text-gray-600 max-w-xl mx-auto">
              Start free and unlock legendary powers. No hidden fees, cancel your quest anytime!
            </p>

            {/* Trust badges */}
            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-[#6BCB77]" />
                <span>Secure payments</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-[#FFD93D]" />
                <span>30-day guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-16 relative">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <div
                key={plan.name}
                className={`relative group ${plan.popular ? 'md:-mt-4 md:mb-4' : ''}`}
              >
                {/* Popular badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                    <div className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#FF6B6B] to-[#A66CFF] border-2 border-[#2D2D2D] px-4 py-2 text-xs font-bold text-white shadow-[3px_3px_0_#2D2D2D]">
                      <Zap className="h-3 w-3 animate-pulse" />
                      MOST POPULAR
                      <Star className="h-3 w-3" />
                    </div>
                  </div>
                )}

                {/* Card */}
                <div className={`relative bg-white rounded-[30px] border-4 ${plan.popular ? 'border-[#FFD93D]' : 'border-[#2D2D2D]'} p-6 shadow-[6px_6px_0_#2D2D2D] hover:shadow-[8px_8px_0_#2D2D2D] hover:-translate-y-2 transition-all h-full flex flex-col`}>
                  {/* Colored top bar */}
                  <div className={`absolute top-0 left-0 right-0 h-3 bg-gradient-to-r ${plan.color} rounded-t-[26px]`} />

                  {/* Header */}
                  <div className="text-center mt-4">
                    <span className="text-5xl block animate-float" style={{ animationDelay: `${index * 0.2}s` }}>{plan.emoji}</span>
                    <h3 className="mt-4 text-2xl font-bold text-[#2D2D2D]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                      {plan.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">{plan.description}</p>

                    {/* Price */}
                    <div className="mt-6 flex items-end justify-center gap-1">
                      <span className="text-lg text-gray-400">$</span>
                      <span className={`text-5xl font-bold bg-gradient-to-r ${plan.color} bg-clip-text text-transparent`} style={{ fontFamily: "'Fredoka', sans-serif" }}>
                        {plan.price}
                      </span>
                      <span className="text-gray-500 mb-2">/month</span>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="mt-8 space-y-3 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature.text} className="flex items-start gap-3">
                        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${feature.included ? 'bg-[#6BCB77]/20' : 'bg-gray-100'}`}>
                          {feature.included ? (
                            <Check className="h-4 w-4 text-[#6BCB77]" />
                          ) : (
                            <span className="text-gray-300 text-sm">✕</span>
                          )}
                        </div>
                        <span className={`text-sm ${feature.included ? 'text-gray-700' : 'text-gray-400'}`}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <div className="mt-8">
                    <Button
                      onClick={() => handlePlanSelect(plan)}
                      disabled={loadingPlan === plan.plan}
                      className={`w-full h-12 text-base group ${plan.popular ? '' : 'bg-white text-[#2D2D2D] border-3 border-[#2D2D2D] shadow-[3px_3px_0_#2D2D2D] hover:shadow-[4px_4px_0_#2D2D2D] hover:-translate-y-0.5'}`}
                      variant={plan.popular ? 'default' : 'secondary'}
                    >
                      {loadingPlan === plan.plan ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          {plan.popular && <Rocket className="mr-2 h-5 w-5 group-hover:animate-wiggle" />}
                          {plan.cta}
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison note */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto bg-gradient-to-r from-[#4ECDC4]/10 to-[#6BCB77]/10 rounded-2xl border-2 border-[#4ECDC4]/30 p-6 text-center">
            <p className="text-gray-600">
              <span className="font-bold text-[#2D2D2D]">💡 Pro tip:</span> Start with the free plan and upgrade as you level up. You won't lose any progress!
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#A66CFF]/20 px-4 py-2 text-sm font-bold text-[#A66CFF] mb-4">
              <span>❓</span>
              <span>Got Questions?</span>
            </div>
            <h2 className="text-3xl font-bold text-[#2D2D2D] sm:text-4xl" style={{ fontFamily: "'Fredoka', sans-serif" }}>
              Frequently Asked Questions
            </h2>
          </div>

          <div className="mx-auto max-w-3xl grid gap-4 sm:grid-cols-2">
            {faqs.map((faq, index) => (
              <div
                key={faq.q}
                className="bg-white rounded-2xl border-3 border-[#2D2D2D] p-5 shadow-[4px_4px_0_#2D2D2D] hover:shadow-[6px_6px_0_#2D2D2D] hover:-translate-y-1 transition-all"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl animate-float" style={{ animationDelay: `${index * 0.15}s` }}>{faq.emoji}</span>
                  <div>
                    <h3 className="font-bold text-[#2D2D2D]" style={{ fontFamily: "'Fredoka', sans-serif" }}>{faq.q}</h3>
                    <p className="mt-2 text-sm text-gray-600 leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="relative max-w-4xl mx-auto overflow-hidden rounded-[30px] border-4 border-[#2D2D2D] bg-gradient-to-br from-[#A66CFF] via-[#FF6B6B] to-[#FFD93D] p-8 md:p-12 shadow-[8px_8px_0_#2D2D2D]">
            {/* Floating decorations */}
            <div className="absolute top-4 left-4 text-3xl animate-float opacity-40">⭐</div>
            <div className="absolute bottom-4 right-4 text-3xl animate-float opacity-40" style={{ animationDelay: '1s' }}>🎮</div>

            <div className="text-center relative z-10">
              <h2 className="text-3xl font-bold text-white md:text-4xl drop-shadow-lg" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                Ready to Start Your Quest?
                <span className="inline-block ml-2 animate-wiggle">🎯</span>
              </h2>
              <p className="mt-4 text-white/90 text-lg max-w-xl mx-auto">
                Join thousands of heroes already mastering digital skills through our gamified learning platform.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/register">
                  <Button size="xl" className="bg-white text-[#2D2D2D] hover:bg-[#FFD93D] group">
                    <Rocket className="mr-2 h-5 w-5 group-hover:animate-wiggle" />
                    Get Started Free
                    <span className="ml-2">→</span>
                  </Button>
                </Link>
              </div>
              <p className="mt-4 text-white/70 text-sm">
                ✅ No credit card required • ✅ Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
