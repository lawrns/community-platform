"use client";

/**
 * User Activity Component
 * Shows recent user activity and engagement on the platform
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Clock, Edit, Heart, MessageSquare, Star } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { api } from '@/lib/api';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import ClientSideOnly from '@/components/ClientSideOnly';
import { isBrowser } from '@/lib/environment';

interface ActivityItemProps {
  activity: {
    type: string;
    target_id?: string;
    target_title?: string;
    created_at: string;
    badge_name?: string;
  };
}

const ActivityItem = ({ activity }: ActivityItemProps) => {
  const { type, target_id, target_title, created_at } = activity;
  
  const getActivityIcon = () => {
    switch(type) {
      case 'post_created':
        return <Edit className="h-4 w-4 text-blue-500" />;
      case 'comment_added':
        return <MessageSquare className="h-4 w-4 text-green-500" />;
      case 'upvote_given':
        return <Heart className="h-4 w-4 text-red-500" />;
      case 'badge_earned':
        return <Star className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };
  
  const getActivityText = () => {
    switch(type) {
      case 'post_created':
        return 'You created a post';
      case 'comment_added':
        return 'You commented on';
      case 'upvote_given':
        return 'You upvoted';
      case 'badge_earned':
        return 'You earned a badge';
      default:
        return 'You interacted with';
    }
  };
  
  return (
    <div className="flex items-start space-x-3 mb-4 pb-4 border-b last:border-b-0">
      <div className="p-2 rounded-full bg-muted flex-shrink-0">
        {getActivityIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium">
              {getActivityText()}{' '}
              {target_id && target_title && (
                <Link 
                  href={`/view/${target_id}`}
                  className="text-primary hover:underline"
                >
                  {target_title}
                </Link>
              )}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatDistanceToNow(new Date(created_at), { addSuffix: true })}
            </p>
          </div>
          {type === 'badge_earned' && (
            <Badge variant="outline" className="ml-2">
              {activity.badge_name}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

const UserActivity = () => {
  const { user, isAuthenticated } = useAuth();
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchUserActivity = async () => {
      if (!isAuthenticated || !user?.id) return;
      
      setIsLoading(true);
      try {
        // Fetch user's content history
        const contentResponse = await api.content.listContent({
          limit: 3
        });
        
        // Fetch user's reputation history (includes upvotes, comments)
        const reputationResponse = await api.reputation.getHistory(user.id, {
          limit: 5
        });
        
        // Fetch user's badges
        const badgesResponse = await api.reputation.getBadges(user.id);
        
        // Combine and format all activities
        let allActivities: any[] = [];
        
        // Add content creation activities
        if (contentResponse && Array.isArray(contentResponse)) {
          const contentActivities = contentResponse.map(item => ({
            type: 'post_created',
            target_id: item.id,
            target_title: item.title,
            created_at: item.created_at
          }));
          allActivities = [...allActivities, ...contentActivities];
        }
        
        // Add reputation activities (comments, upvotes)
        if (reputationResponse && reputationResponse.history) {
          const repActivities = reputationResponse.history.map(item => {
            let activityType = 'interaction';
            if (item.reason === 'comment_added') activityType = 'comment_added';
            if (item.reason === 'upvote_given') activityType = 'upvote_given';
            
            return {
              type: activityType,
              target_id: item.content_id,
              target_title: item.content_title,
              created_at: item.created_at
            };
          });
          allActivities = [...allActivities, ...repActivities];
        }
        
        // Add badge activities
        if (badgesResponse && Array.isArray(badgesResponse)) {
          const badgeActivities = badgesResponse
            .filter(badge => badge.awarded_at) // Only include awarded badges
            .map(badge => ({
              type: 'badge_earned',
              badge_name: badge.name,
              created_at: badge.awarded_at
            }));
          allActivities = [...allActivities, ...badgeActivities];
        }
        
        // Sort activities by date (newest first)
        allActivities.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        
        // Take the 5 most recent activities
        setActivities(allActivities.slice(0, 5));
      } catch (error) {
        console.error('Error fetching user activity:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserActivity();
  }, [user, isAuthenticated]);
  
  // Show loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Activity</CardTitle>
          <CardDescription>Your recent interactions on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="flex items-start space-x-3 mb-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
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
          <CardTitle>Your Activity</CardTitle>
          <CardDescription>Track your interactions on the platform</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-6">
          <p className="text-muted-foreground mb-4">Sign in to view your activity</p>
          <Link href="/signin" passHref>
            <Button variant="outline">Sign In</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }
  
  // Show empty state
  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Activity</CardTitle>
          <CardDescription>Your recent interactions on the platform</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-6">
          <p className="text-muted-foreground mb-2">No activity yet</p>
          <p className="text-sm text-muted-foreground mb-4">
            Start creating content or interacting with others to see your activity here
          </p>
          <Link href="/create" passHref>
            <Button>Create Content</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }
  
  // Show activities
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Activity</CardTitle>
        <CardDescription>Your recent interactions on the platform</CardDescription>
      </CardHeader>
      <CardContent>
        {activities.map((activity, index) => (
          <ActivityItem key={index} activity={activity} />
        ))}
        <div className="mt-2 text-center">
          <Link href="/profile" passHref>
            <Button variant="link" size="sm">View All Activity</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

// Wrap the component with ClientSideOnly to prevent "window is not defined" errors during SSR
const SafeUserActivity = () => {
  // Show a skeleton loader during server-side rendering
  const fallback = (
    <Card>
      <CardHeader>
        <CardTitle>Your Activity</CardTitle>
        <CardDescription>Your recent interactions on the platform</CardDescription>
      </CardHeader>
      <CardContent>
        {Array(3).fill(0).map((_, i) => (
          <div key={i} className="flex items-start space-x-3 mb-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  return (
    <ClientSideOnly fallback={fallback}>
      <UserActivity />
    </ClientSideOnly>
  );
};

export default SafeUserActivity;