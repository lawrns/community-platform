/**
 * Recommended Tools Component
 * Shows personalized tool recommendations or popular tools for users
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, Star, Tool, Trending, TrendingUp, Wrench } from 'lucide-react';
import { api } from '@/lib/api';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

// Tool Card Component
const ToolCard = ({ tool }) => {
  const { id, name, description, icon_url, tags, avg_rating, upvotes } = tool;
  
  // Format description as excerpt
  const excerpt = description ? 
    (description.length > 85 ? description.substring(0, 85) + '...' : description) : 
    'No description available';
    
  return (
    <div className="flex space-x-3 mb-4 pb-4 border-b last:border-b-0">
      <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0 flex items-center justify-center">
        {icon_url ? (
          <img src={icon_url} alt={name} className="w-full h-full object-cover" />
        ) : (
          <Wrench className="h-5 w-5 text-muted-foreground" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <div>
            <Link href={`/tools/${id}`} className="hover:underline">
              <h4 className="text-sm font-medium">{name}</h4>
            </Link>
            <p className="text-xs text-muted-foreground mt-1">{excerpt}</p>
            <div className="flex items-center mt-2 space-x-2">
              {avg_rating && (
                <span className="flex items-center text-xs text-amber-500">
                  <Star className="h-3 w-3 mr-0.5 fill-amber-500" />
                  {parseFloat(avg_rating).toFixed(1)}
                </span>
              )}
              {upvotes > 0 && (
                <span className="flex items-center text-xs text-muted-foreground">
                  <ArrowUpRight className="h-3 w-3 mr-0.5" />
                  {upvotes}
                </span>
              )}
              {tags && tags.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {tags[0]}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const RecommendedTools = () => {
  const { user, isAuthenticated } = useAuth();
  const [tools, setTools] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchTools = async () => {
      setIsLoading(true);
      try {
        // Different endpoint logic based on authentication status
        let endpoint = '/tools';
        let params = { limit: 5, sort: 'popular' };
        
        // If user is authenticated, adjust for personalized recommendations
        if (isAuthenticated && user?.id) {
          params.user_id = user.id;
          // Use recommendation query parameter to get personalized tool recommendations
          params.recommended = true;
        }
        
        const response = await api.get(endpoint, { params });
        
        if (response.data.success) {
          setTools(response.data.tools);
        }
      } catch (error) {
        console.error('Error fetching tools:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTools();
  }, [user, isAuthenticated]);
  
  // Show loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recommended Tools</CardTitle>
          <CardDescription>
            {isAuthenticated ? 'Tools you might find useful' : 'Popular tools in the community'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="flex space-x-3 mb-4">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="flex-1">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-full mb-2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }
  
  // Show authentication required state
  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recommended Tools</CardTitle>
          <CardDescription>Discover tools tailored to your interests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-1">Popular Tools</h4>
            {tools.length > 0 ? (
              tools.map(tool => <ToolCard key={tool.id} tool={tool} />)
            ) : (
              <p className="text-sm text-muted-foreground">No tools available</p>
            )}
          </div>
          <div className="text-center py-2">
            <p className="text-sm text-muted-foreground mb-3">
              Sign in to get personalized tool recommendations
            </p>
            <Link href="/signin" passHref>
              <Button variant="outline">Sign In</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Show empty state
  if (tools.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recommended Tools</CardTitle>
          <CardDescription>Tools you might find useful</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-6">
          <div className="mx-auto rounded-full bg-muted w-12 h-12 flex items-center justify-center mb-3">
            <Tool className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground mb-4">
            We're still learning your preferences. Check back soon for tool recommendations!
          </p>
          <Link href="/tools" passHref>
            <Button>Explore Tools</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }
  
  // Show tools
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommended Tools</CardTitle>
        <CardDescription>Tools you might find useful</CardDescription>
      </CardHeader>
      <CardContent>
        {tools.map(tool => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </CardContent>
      <CardFooter className="pt-0 pb-3">
        <div className="w-full text-center">
          <Link href="/tools" passHref>
            <Button variant="link" size="sm">View All Tools</Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
};

export default RecommendedTools;