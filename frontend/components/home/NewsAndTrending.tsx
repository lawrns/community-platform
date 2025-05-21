"use client";

import { Newspaper, TrendingUp } from 'lucide-react';
import { AINewsFeed } from './AINewsFeed';
import { TrendingContent } from './TrendingContent';

export function NewsAndTrending() {
  return (
    <section className="py-16 bg-surface-2/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10 space-y-3">
          <div className="inline-block p-2 rounded-full bg-brand-secondary/10 text-brand-secondary">
            <TrendingUp className="h-5 w-5" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold">Stay Informed</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            AI moves fast. Keep up with industry news and trending community contributions.
          </p>
        </div>
        
        {/* Desktop: Two-column layout */}
        <div className="hidden lg:grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="bg-surface-1/50 rounded-xl p-6 shadow-sm">
            <AINewsFeed />
          </div>
          <div className="bg-surface-1/50 rounded-xl p-6 shadow-sm">
            <TrendingContent />
          </div>
        </div>
        
        {/* Mobile: Single column layout */}
        <div className="lg:hidden space-y-10">
          <div className="bg-surface-1/50 rounded-xl p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <Newspaper className="h-4 w-4 mr-2" />
              <h3 className="font-medium">AI News</h3>
            </div>
            <AINewsFeed />
          </div>
          <div className="bg-surface-1/50 rounded-xl p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <TrendingUp className="h-4 w-4 mr-2" />
              <h3 className="font-medium">Trending</h3>
            </div>
            <TrendingContent />
          </div>
        </div>
      </div>
    </section>
  );
}