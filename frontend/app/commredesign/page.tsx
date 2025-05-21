'use client';

import React from 'react';
import { Check, ArrowRight, UserPlus, Sparkles, BookOpen, Code, Database, Search, Zap } from 'lucide-react';
import { 
  HeroSection, 
  JoinCommunity, 
  StatsDisplay,
  FeatureGrid,
  Button
} from '@/components/commredesign';

const CommRedesignPage = () => {
  const stats = [
    { value: '15K+', label: 'Community Members', gradientType: 'purple-blue' },
    { value: '8K+', label: 'Weekly Active Users', gradientType: 'blue-teal' },
    { value: '25K+', label: 'Knowledge Posts', gradientType: 'teal-purple' },
    { value: '500+', label: 'AI Projects', gradientType: 'purple-blue' }
  ];

  const features = [
    {
      id: 'feature-1',
      icon: <BookOpen className="text-brand-primary" size={20} />,
      title: 'Share Knowledge',
      description: 'Exchange ideas and insights with experts and practitioners across various AI disciplines.',
    },
    {
      id: 'feature-2',
      icon: <Code className="text-brand-secondary" size={20} />,
      title: 'Build Together',
      description: 'Collaborate on innovative AI projects with talent from around the world.',
    },
    {
      id: 'feature-3',
      icon: <Zap className="text-brand-primary" size={20} />,
      title: 'Grow Skills',
      description: 'Access curated resources and mentorship opportunities to accelerate your learning.',
    },
    {
      id: 'feature-4',
      icon: <Database className="text-brand-secondary" size={20} />,
      title: 'Access Resources',
      description: 'Get access to exclusive datasets, models, and tools for your AI research and applications.',
    },
    {
      id: 'feature-5',
      icon: <Search className="text-brand-primary" size={20} />,
      title: 'Find Collaborators',
      description: 'Connect with other professionals based on skills, interests, and project goals.',
    },
    {
      id: 'feature-6',
      icon: <Sparkles className="text-brand-secondary" size={20} />,
      title: 'Showcase Work',
      description: 'Build your reputation by sharing your projects, insights, and expertise with the community.',
    }
  ];

  return (
    <div className="min-h-screen bg-surface-1">
      {/* Hero Section */}
      <HeroSection
        title="The most vibrant AI community on the planet"
        subtitle="Join thousands of AI enthusiasts, researchers, and professionals sharing knowledge, collaborating on projects, and pushing the boundaries of what's possible."
        tagline="The Future of AI Collaboration"
        primaryButtonText="Join Community"
        secondaryButtonText="Explore Content"
        stats={stats}
      />

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold gradient-text-purple-blue mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-content-secondary text-lg max-w-2xl mx-auto">
              Our platform provides all the tools and resources you need to collaborate, learn, and build amazing AI projects.
            </p>
          </div>

          <FeatureGrid
            features={features}
            columns={3}
            className="mb-12"
          />

          <div className="text-center">
            <Button 
              variant="primary" 
              size="lg"
              rightIcon={<ArrowRight size={18} />}
            >
              Explore All Features
            </Button>
          </div>
        </div>
      </section>

      {/* Join Community Section */}
      <JoinCommunity
        title="Join the leading community of AI enthusiasts"
        subtitle="Connect with like-minded individuals, share your knowledge, and accelerate your AI journey."
        features={[
          {
            id: 'join-1',
            icon: <Check className="text-green-400" size={20} />,
            title: 'Share Knowledge',
            description: 'Exchange ideas and insights with experts and practitioners across various AI disciplines.',
          },
          {
            id: 'join-2',
            icon: <Check className="text-green-400" size={20} />,
            title: 'Build Together',
            description: 'Collaborate on innovative AI projects with talent from around the world.',
          },
          {
            id: 'join-3',
            icon: <Check className="text-green-400" size={20} />,
            title: 'Grow Skills',
            description: 'Access curated resources and mentorship opportunities to accelerate your learning.',
          },
        ]}
        primaryButtonText="Join Now"
        secondaryButtonText="Learn More"
      />
    </div>
  );
};

export default CommRedesignPage;