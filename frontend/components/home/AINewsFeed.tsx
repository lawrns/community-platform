"use client";

import { useState, useEffect } from 'react';
import { ExternalLink, Calendar, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Types for our news items
interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  sourceUrl: string;
  publishedAt: string;
  imageUrl?: string;
}

// Sample data - would be replaced with API integration
const SAMPLE_NEWS_ITEMS: NewsItem[] = [
  {
    id: '1',
    title: 'Google DeepMind Announces Breakthrough in AI-Powered Scientific Research',
    summary: 'New model accelerates discovery in quantum physics, offering potential applications in materials science.',
    source: 'AI Monthly',
    sourceUrl: 'https://example.com/ai-monthly',
    publishedAt: '2025-05-16T14:30:00Z',
    imageUrl: 'https://placehold.co/600x400/e4e7eb/a3aab8?text=AI+Research',
  },
  {
    id: '2',
    title: 'EU Finalizes Comprehensive AI Regulation Framework',
    summary: 'New legislative package establishes standards for transparency, accountability and safety in AI systems.',
    source: 'Tech Policy Today',
    sourceUrl: 'https://example.com/tech-policy',
    publishedAt: '2025-05-15T09:15:00Z',
    imageUrl: 'https://placehold.co/600x400/e4e7eb/a3aab8?text=AI+Policy',
  },
  {
    id: '3',
    title: 'Open Source LLM Surpasses Commercial Models on Key Benchmarks',
    summary: 'Collaborative effort demonstrates competitive performance with significantly fewer parameters.',
    source: 'AI Research Weekly',
    sourceUrl: 'https://example.com/ai-research',
    publishedAt: '2025-05-14T16:45:00Z',
    imageUrl: 'https://placehold.co/600x400/e4e7eb/a3aab8?text=LLM+Research',
  },
  {
    id: '4',
    title: 'New AI Assistant Specializes in Scientific Literature Review',
    summary: 'Tool helps researchers digest papers and connect insights across different scientific fields.',
    source: 'Science Tech Review',
    sourceUrl: 'https://example.com/science-tech',
    publishedAt: '2025-05-13T11:20:00Z',
    imageUrl: 'https://placehold.co/600x400/e4e7eb/a3aab8?text=AI+Science+Tools',
  }
];

export function AINewsFeed() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This would be replaced with an actual API call
    const fetchNewsItems = async () => {
      setLoading(true);
      try {
        // Mock API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        setNewsItems(SAMPLE_NEWS_ITEMS);
      } catch (error) {
        console.error('Error fetching news items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNewsItems();
  }, []);
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">AI News & Updates</h2>
        <Button variant="ghost" size="sm" asChild className="text-brand-primary">
          <a href="/news" className="flex items-center">
            View All <ChevronRight className="ml-1 h-4 w-4" />
          </a>
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-4 h-40 animate-pulse bg-muted">
              <div className="h-5 w-3/4 bg-muted-foreground/30 rounded mb-2"></div>
              <div className="h-4 w-full bg-muted-foreground/20 rounded mb-1"></div>
              <div className="h-4 w-2/3 bg-muted-foreground/20 rounded mb-4"></div>
              <div className="h-3 w-24 bg-muted-foreground/30 rounded"></div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {newsItems.map((item) => (
            <a 
              key={item.id} 
              href={item.sourceUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="group"
            >
              <div className="p-4 h-full bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg hover:shadow-md transition duration-200"
              >
                <div className="flex flex-col h-full">
                  <h3 className="text-md font-semibold group-hover:text-brand-primary transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 mb-2 flex-grow line-clamp-2">
                    {item.summary}
                  </p>
                  <div className="flex items-center justify-between mt-auto pt-2 text-xs text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(item.publishedAt)}
                    </div>
                    <div className="flex items-center">
                      {item.source}
                      <ExternalLink className="h-3 w-3 ml-1 opacity-70" />
                    </div>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}