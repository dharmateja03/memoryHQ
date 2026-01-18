'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Brain, Zap, Target, Puzzle, RefreshCw, ArrowRight, Sparkles, CheckCircle2, X, Check, Star, Users, Award } from 'lucide-react';
import { Button } from '@/components/ui';

const features = [
  {
    icon: Brain,
    title: 'Memory',
    description: 'Strengthen working memory and recall',
    color: '#8B5CF6',
  },
  {
    icon: Target,
    title: 'Attention',
    description: 'Improve focus and concentration',
    color: '#EC4899',
  },
  {
    icon: Zap,
    title: 'Speed',
    description: 'Boost processing speed',
    color: '#F97316',
  },
  {
    icon: Puzzle,
    title: 'Problem Solving',
    description: 'Enhance logical reasoning',
    color: '#06B6D4',
  },
  {
    icon: RefreshCw,
    title: 'Flexibility',
    description: 'Increase mental adaptability',
    color: '#84CC16',
  },
];

const benefits = [
  'Personalized training based on your cognitive profile',
  '30 scientifically-designed brain games',
  'Adaptive difficulty that grows with you',
  'Track your progress over time',
  'Daily training plans tailored to your needs',
];

const competitors = [
  {
    name: 'MindForge',
    highlight: true,
    price: 'Free',
    games: '30+',
    domains: 5,
    personalization: true,
    offlineMode: true,
    noAds: true,
    progressTracking: true,
    scienceBased: true,
  },
  {
    name: 'Lumosity',
    highlight: false,
    price: '$11.99/mo',
    games: '40+',
    domains: 5,
    personalization: true,
    offlineMode: false,
    noAds: false,
    progressTracking: true,
    scienceBased: true,
  },
  {
    name: 'Elevate',
    highlight: false,
    price: '$14.99/mo',
    games: '35+',
    domains: 4,
    personalization: true,
    offlineMode: false,
    noAds: true,
    progressTracking: true,
    scienceBased: true,
  },
  {
    name: 'Peak',
    highlight: false,
    price: '$4.99/mo',
    games: '45+',
    domains: 5,
    personalization: false,
    offlineMode: false,
    noAds: false,
    progressTracking: true,
    scienceBased: false,
  },
];

const testimonials = [
  {
    name: 'Sarah M.',
    role: 'Software Engineer',
    content: 'After 3 months of daily training, I noticed significant improvements in my focus at work. The N-Back game alone has been a game-changer for my working memory.',
    rating: 5,
  },
  {
    name: 'James K.',
    role: 'Medical Student',
    content: 'As a med student, I need to retain massive amounts of information. MindForge has genuinely helped me study more efficiently. And it is free!',
    rating: 5,
  },
  {
    name: 'Linda R.',
    role: 'Retired Teacher',
    content: 'I was worried about cognitive decline at 65. Six months later, my memory feels sharper than it did years ago. The personalized training really works.',
    rating: 5,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-navy-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-electric-500/10 via-transparent to-memory/10" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-electric-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-memory/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <nav className="flex items-center justify-between mb-20">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-electric-500/10 rounded-xl">
                <Brain className="w-8 h-8 text-electric-500" />
              </div>
              <span className="text-2xl font-bold text-white">MindForge</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <Link href="/games" className="text-gray-300 hover:text-white transition-colors">
                Games
              </Link>
              <Link href="/blog" className="text-gray-300 hover:text-white transition-colors">
                Blog
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost">Log In</Button>
              </Link>
              <Link href="/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </nav>

          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-electric-500/10 rounded-full text-electric-400 text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                <span>Personalized Brain Training</span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                Sharpen Your Mind,
                <br />
                <span className="bg-gradient-to-r from-electric-400 to-memory bg-clip-text text-transparent">
                  Unlock Your Potential
                </span>
              </h1>

              <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
                Train your brain with 30 scientifically-designed games across 5 cognitive domains.
                Get a personalized training plan based on your unique cognitive profile.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/signup">
                  <Button size="xl" icon={<ArrowRight className="w-5 h-5" />}>
                    Start Free Assessment
                  </Button>
                </Link>
                <Link href="/games">
                  <Button size="xl" variant="secondary">
                    Explore Games
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Cognitive Domains */}
      <section className="py-20 bg-navy-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Train All 5 Cognitive Domains
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Our comprehensive training covers every aspect of cognitive function
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-navy-700/50 rounded-2xl p-6 border border-navy-600 hover:border-electric-500/50 transition-all group"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: `${feature.color}20` }}
                >
                  <feature.icon className="w-6 h-6" style={{ color: feature.color }} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Why Train with MindForge?
              </h2>
              <p className="text-gray-400 text-lg mb-8">
                Our platform adapts to your unique cognitive strengths and weaknesses,
                ensuring every training session is optimized for your growth.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5 text-success-500 flex-shrink-0" />
                    <span className="text-gray-300">{benefit}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-navy-800 rounded-3xl p-8 border border-navy-600">
                <div className="text-center mb-6">
                  <div className="text-6xl font-bold text-white mb-2">30</div>
                  <div className="text-gray-400">Brain Games</div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-electric-400">5</div>
                    <div className="text-xs text-gray-500">Domains</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-success-400">10</div>
                    <div className="text-xs text-gray-500">Levels Each</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-warning-400">100%</div>
                    <div className="text-xs text-gray-500">Personalized</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-20 bg-navy-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                How We Compare
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                See why thousands choose MindForge over expensive alternatives
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="overflow-x-auto"
          >
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-navy-600">
                  <th className="text-left py-4 px-4 text-gray-400 font-medium">Feature</th>
                  {competitors.map((c) => (
                    <th
                      key={c.name}
                      className={`py-4 px-4 text-center ${
                        c.highlight ? 'text-electric-400' : 'text-gray-400'
                      } font-medium`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span className={c.highlight ? 'text-lg font-bold' : ''}>{c.name}</span>
                        {c.highlight && (
                          <span className="text-xs bg-electric-500/20 text-electric-400 px-2 py-0.5 rounded-full">
                            Best Value
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-navy-700">
                  <td className="py-4 px-4 text-gray-300">Price</td>
                  {competitors.map((c) => (
                    <td
                      key={c.name}
                      className={`py-4 px-4 text-center font-semibold ${
                        c.highlight ? 'text-success-400 text-lg' : 'text-gray-400'
                      }`}
                    >
                      {c.price}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-navy-700">
                  <td className="py-4 px-4 text-gray-300">Brain Games</td>
                  {competitors.map((c) => (
                    <td key={c.name} className={`py-4 px-4 text-center ${c.highlight ? 'text-white' : 'text-gray-400'}`}>
                      {c.games}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-navy-700">
                  <td className="py-4 px-4 text-gray-300">Cognitive Domains</td>
                  {competitors.map((c) => (
                    <td key={c.name} className={`py-4 px-4 text-center ${c.highlight ? 'text-white' : 'text-gray-400'}`}>
                      {c.domains}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-navy-700">
                  <td className="py-4 px-4 text-gray-300">Personalized Training</td>
                  {competitors.map((c) => (
                    <td key={c.name} className="py-4 px-4 text-center">
                      {c.personalization ? (
                        <Check className={`w-5 h-5 mx-auto ${c.highlight ? 'text-success-400' : 'text-gray-500'}`} />
                      ) : (
                        <X className="w-5 h-5 mx-auto text-gray-600" />
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-navy-700">
                  <td className="py-4 px-4 text-gray-300">Works Offline</td>
                  {competitors.map((c) => (
                    <td key={c.name} className="py-4 px-4 text-center">
                      {c.offlineMode ? (
                        <Check className={`w-5 h-5 mx-auto ${c.highlight ? 'text-success-400' : 'text-gray-500'}`} />
                      ) : (
                        <X className="w-5 h-5 mx-auto text-gray-600" />
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-navy-700">
                  <td className="py-4 px-4 text-gray-300">No Ads</td>
                  {competitors.map((c) => (
                    <td key={c.name} className="py-4 px-4 text-center">
                      {c.noAds ? (
                        <Check className={`w-5 h-5 mx-auto ${c.highlight ? 'text-success-400' : 'text-gray-500'}`} />
                      ) : (
                        <X className="w-5 h-5 mx-auto text-gray-600" />
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-navy-700">
                  <td className="py-4 px-4 text-gray-300">Science-Based</td>
                  {competitors.map((c) => (
                    <td key={c.name} className="py-4 px-4 text-center">
                      {c.scienceBased ? (
                        <Check className={`w-5 h-5 mx-auto ${c.highlight ? 'text-success-400' : 'text-gray-500'}`} />
                      ) : (
                        <X className="w-5 h-5 mx-auto text-gray-600" />
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-center text-gray-500 text-sm mt-6"
          >
            * Competitor pricing and features based on publicly available information as of 2024
          </motion.p>
        </div>
      </section>

      {/* Social Proof Stats */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <Users className="w-8 h-8 text-electric-500 mx-auto mb-2" />
              <div className="text-3xl font-bold text-white">10K+</div>
              <div className="text-gray-400 text-sm">Active Users</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <Brain className="w-8 h-8 text-memory mx-auto mb-2" />
              <div className="text-3xl font-bold text-white">500K+</div>
              <div className="text-gray-400 text-sm">Games Played</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <Star className="w-8 h-8 text-warning-500 mx-auto mb-2" />
              <div className="text-3xl font-bold text-white">4.8/5</div>
              <div className="text-gray-400 text-sm">User Rating</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <Award className="w-8 h-8 text-success-500 mx-auto mb-2" />
              <div className="text-3xl font-bold text-white">92%</div>
              <div className="text-gray-400 text-sm">Report Improvement</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                What Our Users Say
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Join thousands who have improved their cognitive abilities with MindForge
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-navy-800 rounded-2xl p-6 border border-navy-600"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-warning-500 fill-warning-500" />
                  ))}
                </div>
                <p className="text-gray-300 mb-6">&ldquo;{testimonial.content}&rdquo;</p>
                <div>
                  <div className="font-semibold text-white">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-electric-500/10 to-memory/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Start Training Your Brain Today
          </h2>
          <p className="text-gray-400 text-lg mb-4">
            Join 10,000+ users improving their cognitive abilities for free.
          </p>
          <p className="text-electric-400 font-semibold mb-8">
            No credit card required. No ads. No catch.
          </p>
          <Link href="/signup">
            <Button size="xl" icon={<ArrowRight className="w-5 h-5" />}>
              Start Free Training
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-navy-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-electric-500" />
              <span className="text-lg font-semibold text-white">MindForge</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/games" className="text-gray-400 hover:text-white text-sm transition-colors">
                Games
              </Link>
              <Link href="/blog" className="text-gray-400 hover:text-white text-sm transition-colors">
                Blog
              </Link>
              <Link href="/dashboard" className="text-gray-400 hover:text-white text-sm transition-colors">
                Dashboard
              </Link>
            </div>
            <p className="text-gray-500 text-sm">
              {new Date().getFullYear()} MindForge. Train smarter.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
