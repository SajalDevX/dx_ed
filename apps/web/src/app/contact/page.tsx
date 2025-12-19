'use client';

import { useState } from 'react';
import { Mail, Building2, Users, Send, MessageSquare, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    teamSize: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast.success('Message sent! We\'ll get back to you within 24 hours.');
    setFormData({ name: '', email: '', company: '', teamSize: '', message: '' });
    setIsSubmitting(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="bg-[#FFF9E6] min-h-screen overflow-hidden">
      {/* Floating decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 text-4xl animate-float opacity-20">💬</div>
        <div className="absolute top-40 right-20 text-3xl animate-float opacity-20" style={{ animationDelay: '1s' }}>🏰</div>
        <div className="absolute bottom-40 left-20 text-3xl animate-float opacity-20" style={{ animationDelay: '2s' }}>✨</div>
      </div>

      {/* Hero Section */}
      <section className="py-16 md:py-24 relative">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#A66CFF] to-[#FF6B6B] border-3 border-[#2D2D2D] px-6 py-3 text-sm font-bold text-white shadow-[4px_4px_0_#2D2D2D] mb-8 animate-bounce-in">
              <Building2 className="h-5 w-5" />
              <span>Guild Inquiries</span>
              <Users className="h-5 w-5" />
            </div>

            <h1 className="text-4xl font-bold text-[#2D2D2D] sm:text-5xl md:text-6xl" style={{ fontFamily: "'Fredoka', sans-serif" }}>
              Contact Our{' '}
              <span className="bg-gradient-to-r from-[#A66CFF] to-[#FF6B6B] bg-clip-text text-transparent">
                Sales Team
              </span>
              <span className="inline-block ml-2 animate-wiggle">🏰</span>
            </h1>

            <p className="mt-6 text-lg text-gray-600 max-w-xl mx-auto">
              Interested in the Guild plan for your team or organization? Let's discuss how we can help level up your entire squad!
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 lg:grid-cols-2 max-w-6xl mx-auto">
            {/* Form */}
            <div className="bg-white rounded-[30px] border-4 border-[#2D2D2D] p-8 shadow-[6px_6px_0_#2D2D2D]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#A66CFF] to-[#FF6B6B] flex items-center justify-center border-2 border-[#2D2D2D]">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-[#2D2D2D]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                  Send us a message
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-[#2D2D2D] mb-2">Your Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border-3 border-[#2D2D2D] focus:border-[#A66CFF] focus:outline-none transition-colors"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#2D2D2D] mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border-3 border-[#2D2D2D] focus:border-[#A66CFF] focus:outline-none transition-colors"
                    placeholder="you@company.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#2D2D2D] mb-2">Company Name</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border-3 border-[#2D2D2D] focus:border-[#A66CFF] focus:outline-none transition-colors"
                    placeholder="Your company"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#2D2D2D] mb-2">Team Size</label>
                  <select
                    name="teamSize"
                    value={formData.teamSize}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border-3 border-[#2D2D2D] focus:border-[#A66CFF] focus:outline-none transition-colors bg-white"
                  >
                    <option value="">Select team size</option>
                    <option value="1-10">1-10 members</option>
                    <option value="11-50">11-50 members</option>
                    <option value="51-200">51-200 members</option>
                    <option value="200+">200+ members</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#2D2D2D] mb-2">Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border-3 border-[#2D2D2D] focus:border-[#A66CFF] focus:outline-none transition-colors resize-none"
                    placeholder="Tell us about your team's learning goals..."
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    'Sending...'
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              {/* Guild Benefits */}
              <div className="bg-gradient-to-br from-[#A66CFF] to-[#FF6B6B] rounded-[30px] border-4 border-[#2D2D2D] p-8 shadow-[6px_6px_0_#2D2D2D] text-white">
                <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                  Guild Plan Benefits 🏰
                </h3>
                <ul className="space-y-3">
                  {[
                    'Unlimited team members',
                    'Custom learning paths',
                    'Analytics dashboard',
                    'Priority support',
                    'API access',
                    'Custom branding',
                  ].map((benefit) => (
                    <li key={benefit} className="flex items-center gap-2">
                      <span className="text-lg">✅</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contact Methods */}
              <div className="bg-white rounded-[30px] border-4 border-[#2D2D2D] p-8 shadow-[6px_6px_0_#2D2D2D]">
                <h3 className="text-xl font-bold text-[#2D2D2D] mb-4" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                  Other Ways to Reach Us
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#4ECDC4]/20 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-[#4ECDC4]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-bold text-[#2D2D2D]">sales@dxtalent.com</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#FFD93D]/20 flex items-center justify-center">
                      <Phone className="h-5 w-5 text-[#FFD93D]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-bold text-[#2D2D2D]">+1 (555) 123-4567</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#A66CFF]/20 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-[#A66CFF]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-bold text-[#2D2D2D]">San Francisco, CA</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
