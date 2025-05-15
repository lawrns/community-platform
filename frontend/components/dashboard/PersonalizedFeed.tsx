"use client";

/**
 * Personalized Feed Component
 * Shows recommended content based on user preferences and behavior
 */

import React, { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { CalendarIcon, MessageSquare, ThumbsUp, TrendingUp, Users } from 'lucide-react';
import { format } from 'date-fns';
import { api } from '@/lib/api';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthContext';

// ContentCard component for displaying individual content items
interface ContentCardProps {
  content: {
    id: string;
    title: string;
    body?: string;
    type: string;
    author_id: string;
    author_name?: string;
    username?: string;
    avatar_url?: string;
    created_at: string;
    upvotes: number;
    tags?: string[];
  };
  recordView?: boolean;
}

const ContentCard = ({ content, recordView = true }: ContentCardProps) => {
  const { id, title, body, type, author_id, author_name, username, avatar_url, created_at, upvotes, tags } = content;
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.5,
  });
  
  // Record view when card becomes visible
  useEffect(() => {
    if (inView && recordView) {
      // Since recordView doesn't exist in the API, we'll mock it with a console log
      // In a real implementation, this would call the appropriate API method
      console.log(`Recording view for content ID: ${id}`);
      // Uncomment when the API method exists:
      // api.feed.recordView(id).catch((err: Error) => {
      //   console.error('Error recording view:', err);
      // });
    }
  }, [inView, id, recordView]);

  // Format content body as excerpt
  const excerpt = body ? body.replace(/<[^>]*>?/gm, '').substring(0, 120) + '...' : '';
  
  return (
    <div ref={ref}>
      <Card className="mb-4 hover:shadow-md transition-shadow duration-200">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <Badge variant={type === 'question' ? 'destructive' : type === 'tutorial' ? 'outline' : 'default'}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Badge>
              <div className="text-xs text-muted-foreground">
                <CalendarIcon className="inline h-3 w-3 mr-1" />
                {format(new Date(created_at), 'MMM d, yyyy')}
              </div>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <ThumbsUp className="h-4 w-4 mr-1" />
              {upvotes}
            </div>
          </div>
          <CardTitle className="mt-2 text-lg">
            <Link href={`/view/${id}`} className="hover:text-primary hover:underline">
              {title}
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent className="py-2">
          <p className="text-sm text-muted-foreground">{excerpt}</p>
          <div className="flex flex-wrap gap-1 mt-3">
            {tags && tags.map((tag: string, index: number) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
        <CardFooter className="pt-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={avatar_url} alt={author_name} />
              <AvatarFallback>{author_name?.charAt(0) || username?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <Link href={`/profile/${author_id}`} className="text-sm font-medium hover:underline">
              {author_name || username}
            </Link>
          </div>
          <Link href={`/view/${id}`} passHref>
            <Button variant="outline" size="sm">Read More</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

// Skeleton loader for loading state
const SkeletonCard = () => (
  <div className="mb-4">
    <Skeleton className="h-8 w-full mb-2" />
    <Skeleton className="h-20 w-full mb-2" />
    <Skeleton className="h-8 w-full" />
  </div>
);

// Empty state display
interface EmptyStateProps {
  type: 'recommended' | 'trending' | 'following';
}

const EmptyState = ({ type }: EmptyStateProps) => (
  <div className="py-10 text-center">
    <div className="mx-auto rounded-full bg-muted w-12 h-12 flex items-center justify-center mb-3">
      {type === 'recommended' ? (
        <ThumbsUp className="h-6 w-6 text-muted-foreground" />
      ) : type === 'following' ? (
        <Users className="h-6 w-6 text-muted-foreground" />
      ) : (
        <TrendingUp className="h-6 w-6 text-muted-foreground" />
      )}
    </div>
    <h3 className="text-lg font-medium">No content found</h3>
    <p className="text-muted-foreground mt-1 mb-4">
      {type === 'recommended' ? 
        "We're still learning your preferences. Check back soon!" :
       type === 'following' ? 
        "You're not following anyone or any topics yet." :
        "No trending content is available right now."}
    </p>
    {type === 'following' && (
      <Link href="/topics" passHref>
        <Button>Explore Topics to Follow</Button>
      </Link>
    )}
  </div>
);

// Main feed component
const PersonalizedFeed = () => {
  const { user, isAuthenticated } = useAuth();
  const [recommendedContent, setRecommendedContent] = useState<any[]>([]);
  const [trendingContent, setTrendingContent] = useState<any[]>([]);
  const [followingContent, setFollowingContent] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'recommended' | 'trending' | 'following'>(isAuthenticated ? 'recommended' : 'trending');
  
  // Fetch recommended content
  const fetchRecommendedContent = async () => {
    try {
      const response = await api.feed.getPersonalized({
        limit: 10,
        offset: 0
      });
      
      if (response) {
        // Ensure we're setting an array to the state
        setRecommendedContent(Array.isArray(response) ? response : []);
      }
    } catch (error) {
      console.error('Error fetching recommended content:', error);
    }
  };
  
  // Fetch trending content
  const fetchTrendingContent = async () => {
    try {
      const response = await api.feed.getTrending({
        limit: 10,
        offset: 0
      });
      
      if (response) {
        // Ensure we're setting an array to the state
        setTrendingContent(Array.isArray(response) ? response : []);
      }
    } catch (error) {
      console.error('Error fetching trending content:', error);
    }
  };
  
  // Fetch content from followed users, topics, and tags
  const fetchFollowingContent = async () => {
    try {
      const response = await api.feed.getFollowing({
        limit: 10,
        offset: 0
      });
      
      if (response) {
        // Ensure we're setting an array to the state
        setFollowingContent(Array.isArray(response) ? response : []);
      }
    } catch (error) {
      console.error('Error fetching followed content:', error);
    }
  };
  
  // Load all content types when component mounts
  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true);
      
      try {
        if (isAuthenticated) {
          await Promise.all([
            fetchRecommendedContent(),
            fetchTrendingContent(),
            fetchFollowingContent()
          ]);
        } else {
          await fetchTrendingContent();
        }
      } catch (error) {
        console.error('Error loading feed content:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadContent();
  }, [isAuthenticated]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Tabs 
        defaultValue={activeTab} 
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3">
          {isAuthenticated && (
            <TabsTrigger value="recommended" className="flex items-center gap-1">
              <ThumbsUp className="h-4 w-4" />
              <span className="hidden sm:inline">For You</span>
            </TabsTrigger>
          )}
          <TabsTrigger value="trending" className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Trending</span>
          </TabsTrigger>
          {isAuthenticated && (
            <TabsTrigger value="following" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Following</span>
            </TabsTrigger>
          )}
        </TabsList>
        
        {isAuthenticated && (
          <TabsContent value="recommended">
            {isLoading ? (
              Array(5).fill(0).map((_, i) => <SkeletonCard key={i} />)
            ) : recommendedContent.length > 0 ? (
              recommendedContent.map(content => (
                <ContentCard key={content.id} content={content} />
              ))
            ) : (
              <EmptyState type="recommended" />
            )}
          </TabsContent>
        )}
        
        <TabsContent value="trending">
          {isLoading ? (
            Array(5).fill(0).map((_, i) => <SkeletonCard key={i} />)
          ) : trendingContent.length > 0 ? (
            trendingContent.map(content => (
              <ContentCard key={content.id} content={content} />
            ))
          ) : (
            <EmptyState type="trending" />
          )}
        </TabsContent>
        
        {isAuthenticated && (
          <TabsContent value="following">
            {isLoading ? (
              Array(5).fill(0).map((_, i) => <SkeletonCard key={i} />)
            ) : followingContent.length > 0 ? (
              followingContent.map(content => (
                <ContentCard key={content.id} content={content} />
              ))
            ) : (
              <EmptyState type="following" />
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default PersonalizedFeed;
