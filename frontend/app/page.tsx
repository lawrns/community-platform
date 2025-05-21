"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowRight, Sparkles, BookOpen, Code, Database, Search, Zap, Wrench, MessagesSquare, Hash } from 'lucide-react';
import { 
  HeroSection, 
  JoinCommunity, 
  StatsDisplay,
} from '@/components/commredesign';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NewsAndTrending } from '@/components/home/NewsAndTrending';
import { FeatureCard } from '@/components/ui/motion-card';
import ModernHeader from '@/components/layout/ModernHeader';

export default function Home() {
  const stats = [
    { value: '15K+', label: 'Community Members', gradientType: 'purple-blue' },
    { value: '8K+', label: 'Weekly Active Users', gradientType: 'blue-teal' },
    { value: '25K+', label: 'Knowledge Posts', gradientType: 'teal-purple' },
    { value: '500+', label: 'AI Projects', gradientType: 'purple-blue' }
  ];

  const features = [
    {
      id: 'feature-1',
      icon: <BookOpen className="text-brand-500" size={20} />,
      title: 'Share Knowledge',
      description: 'Exchange ideas and insights with experts and practitioners across various AI disciplines.',
    },
    {
      id: 'feature-2',
      icon: <Code className="text-brand-500" size={20} />,
      title: 'Build Together',
      description: 'Collaborate on innovative AI projects with talent from around the world.',
    },
    {
      id: 'feature-3',
      icon: <Zap className="text-brand-500" size={20} />,
      title: 'Grow Skills',
      description: 'Access curated resources and mentorship opportunities to accelerate your learning.',
    },
    {
      id: 'feature-4',
      icon: <Wrench className="text-brand-500" size={20} />,
      title: 'AI Tool Directory',
      description: 'Discover, compare, and evaluate AI tools with detailed reviews and real user insights.',
    },
    {
      id: 'feature-5',
      icon: <Search className="text-brand-500" size={20} />,
      title: 'Find Collaborators',
      description: 'Connect with other professionals based on skills, interests, and project goals.',
    },
    {
      id: 'feature-6',
      icon: <MessagesSquare className="text-brand-500" size={20} />,
      title: 'Expert Q&A',
      description: 'Get precise answers from leading AI experts with reputation-based quality contributions.',
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-bg-1">
      {/* Header */}
      <ModernHeader />
      
      {/* Hero Section */}
      <HeroSection
        title="Unite, Learn, and Build with AI"
        subtitle="Join a global network of builders, share breakthroughs and ship projects faster."
        tagline="The Future of AI Collaboration"
        primaryButtonText="Join Community"
        secondaryButtonText="Explore Content"
        stats={stats}
      />

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-brand-600 dark:text-brand-400 mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-neutral-600 dark:text-neutral-300 text-lg max-w-2xl mx-auto">
              Our platform provides all the tools and resources you need to collaborate, learn, and build amazing AI projects.
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={{
              initial: {},
              animate: {
                transition: {
                  staggerChildren: 0.08
                }
              }
            }}
          >
            {features.map(feature => (
              <motion.div 
                key={feature.id}
                variants={{
                  initial: { opacity: 0, y: 20 },
                  animate: { 
                    opacity: 1, 
                    y: 0,
                    transition: { 
                      duration: 0.24, 
                      ease: [0.22, 1, 0.36, 1]
                    }
                  }
                }}
              >
                <FeatureCard
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                />
              </motion.div>
            ))}
          </motion.div>

          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Button 
              variant="default" 
              size="lg"
              className="bg-brand-500 hover:bg-brand-600 text-white gap-2"
            >
              Explore All Features
              <ArrowRight size={16} />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* News & Trending Section */}
      <NewsAndTrending />

      {/* Join Community Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-brand-600/10 -z-10"></div>
        
        <div className="container mx-auto">
          <motion.div 
            className="max-w-4xl mx-auto p-8 rounded-l border border-brand-500/20 bg-white/50 dark:bg-bg-1/50 backdrop-blur-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-brand-600 dark:text-brand-400 mb-4">
                Join the leading community of AI enthusiasts
              </h2>
              <p className="text-neutral-600 dark:text-neutral-300 text-lg mx-auto">
                Connect with like-minded individuals, share your knowledge, and accelerate your AI journey.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[
                {
                  id: 'join-1',
                  title: 'Share Knowledge',
                  description: 'Exchange ideas and insights with experts and practitioners across various AI disciplines.',
                },
                {
                  id: 'join-2',
                  title: 'Build Together',
                  description: 'Collaborate on innovative AI projects with talent from around the world.',
                },
                {
                  id: 'join-3',
                  title: 'Grow Skills',
                  description: 'Access curated resources and mentorship opportunities to accelerate your learning.',
                },
              ].map(item => (
                <div key={item.id} className="flex flex-col">
                  <div className="flex items-start mb-2">
                    <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-2 mt-0.5">
                      <Check className="text-green-600 dark:text-green-400" size={14} />
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-neutral-600 dark:text-neutral-300 text-sm">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Button 
                variant="default" 
                size="lg"
                className="bg-brand-500 hover:bg-brand-600 text-white"
              >
                Join Now
              </Button>
              <Button 
                variant="outline" 
                size="lg"
              >
                Learn More
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}