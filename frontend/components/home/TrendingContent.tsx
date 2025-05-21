"use client";

import { useState, useEffect } from 'react';
import { MessageCircle, ThumbsUp, Eye, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Types for trending content
interface TrendingItem {
  id: string;
  type: 'question' | 'post' | 'tool-review';
  title: string;
  excerpt: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  metrics: {
    views: number;
    likes: number;
    comments: number;
  };
  tags: string[];
  createdAt: string;
  url: string;
}

// Sample data - would come from API
const SAMPLE_TRENDING_ITEMS: TrendingItem[] = [
  {
    id: '1',
    type: 'question',
    title: 'How to effectively fine-tune LLMs for domain-specific tasks?',
    excerpt: 'I\'m working on adapting a large language model to medical text analysis and looking for best practices...',
    author: {
      id: 'user1',
      name: 'Dr. Emily Chen',
      avatar: 'https://placehold.co/100?text=EC',
    },
    metrics: {
      views: 4328,
      likes: 287,
      comments: 42,
    },
    tags: ['llm', 'fine-tuning', 'healthcare-ai'],
    createdAt: '2025-05-15T10:30:00Z',
    url: '/q-and-a/how-to-effectively-fine-tune-llms',
  },
  {
    id: '2',
    type: 'post',
    title: 'Implementing RLHF: A Practical Guide with Lessons Learned',
    excerpt: 'After implementing RLHF at scale, here are the key challenges we encountered and how we solved them...',
    author: {
      id: 'user2',
      name: 'Marco Vasquez',
      avatar: 'https://placehold.co/100?text=MV',
    },
    metrics: {
      views: 7212,
      likes: 631,
      comments: 89,
    },
    tags: ['rlhf', 'reinforcement-learning', 'tutorial'],
    createdAt: '2025-05-14T15:45:00Z',
    url: '/posts/implementing-rlhf-practical-guide',
  },
  {
    id: '3',
    type: 'tool-review',
    title: 'Comprehensive Review: VectorDB Pro vs OpenVector',
    excerpt: 'A detailed performance comparison of the two leading vector databases for RAG applications...',
    author: {
      id: 'user3',
      name: 'Sarah Johnson',
      avatar: 'https://placehold.co/100?text=SJ',
    },
    metrics: {
      views: 3982,
      likes: 342,
      comments: 57,
    },
    tags: ['vector-database', 'rag', 'performance'],
    createdAt: '2025-05-13T09:15:00Z',
    url: '/tools/reviews/vectordb-pro-vs-openvector',
  },
  {
    id: '4',
    type: 'post',
    title: 'The Current State of Multimodal AI: Capabilities and Limitations',
    excerpt: 'An analysis of recent breakthroughs in multimodal systems and where the technology still falls short...',
    author: {
      id: 'user4',
      name: 'Alex Thompson',
      avatar: 'https://placehold.co/100?text=AT',
    },
    metrics: {
      views: 5128,
      likes: 489,
      comments: 63,
    },
    tags: ['multimodal', 'vision-language', 'research'],
    createdAt: '2025-05-12T12:50:00Z',
    url: '/posts/state-of-multimodal-ai',
  },
];

// Format large numbers
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

// Content type badge renderer
const ContentTypeBadge = ({ type }: { type: TrendingItem['type'] }) => {
  switch (type) {
    case 'question':
      return <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200 text-xs">Question</span>;
    case 'post':
      return <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-600 border border-green-200 text-xs">Article</span>;
    case 'tool-review':
      return <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 border border-purple-200 text-xs">Tool Review</span>;
    default:
      return null;
  }
};

export function TrendingContent() {
  const [trendingItems, setTrendingItems] = useState<TrendingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This would be replaced with an actual API call
    const fetchTrendingItems = async () => {
      setLoading(true);
      try {
        // Mock API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        setTrendingItems(SAMPLE_TRENDING_ITEMS);
      } catch (error) {
        console.error('Error fetching trending items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingItems();
  }, []);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric'
      }).format(date);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Trending Contributions</h2>
        <Button variant="ghost" size="sm" asChild className="text-brand-primary">
          <a href="/trending" className="flex items-center">
            View All <ChevronRight className="ml-1 h-4 w-4" />
          </a>
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 animate-pulse bg-muted rounded-lg">
              <div className="flex justify-between items-start mb-3">
                <div className="h-5 w-2/3 bg-muted-foreground/30 rounded"></div>
                <div className="h-5 w-16 bg-muted-foreground/20 rounded"></div>
              </div>
              <div className="h-4 w-full bg-muted-foreground/20 rounded mb-4"></div>
              <div className="flex justify-between">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-muted-foreground/30 mr-2"></div>
                  <div className="h-4 w-24 bg-muted-foreground/30 rounded"></div>
                </div>
                <div className="flex space-x-3">
                  <div className="h-4 w-12 bg-muted-foreground/20 rounded"></div>
                  <div className="h-4 w-12 bg-muted-foreground/20 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {trendingItems.map((item) => (
            <a 
              key={item.id} 
              href={item.url} 
              className="group"
            >
              <div className="p-4 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg hover:shadow-md transition duration-200"
              >
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-md font-semibold group-hover:text-brand-primary transition-colors line-clamp-1 mr-2">
                    {item.title}
                  </h3>
                  <ContentTypeBadge type={item.type} />
                </div>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
                  {item.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-6 w-6 mr-2 bg-gray-200 rounded-full flex items-center justify-center text-[0.65rem]">
                      {item.author.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="text-xs text-muted-foreground">{item.author.name}</span>
                    <span className="mx-2 text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</span>
                  </div>
                  <div className="flex space-x-3 text-xs text-muted-foreground">
                    <span className="flex items-center">
                      <ThumbsUp className="h-3 w-3 mr-1" />
                      {formatNumber(item.metrics.likes)}
                    </span>
                    <span className="flex items-center">
                      <MessageCircle className="h-3 w-3 mr-1" />
                      {formatNumber(item.metrics.comments)}
                    </span>
                    <span className="flex items-center">
                      <Eye className="h-3 w-3 mr-1" />
                      {formatNumber(item.metrics.views)}
                    </span>
                  </div>
                </div>
                
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.tags.slice(0, 3).map((tag) => (
                    <span 
                      key={tag} 
                      className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}