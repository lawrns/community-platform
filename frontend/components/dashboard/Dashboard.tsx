/**
 * Dashboard Component
 * Comprehensive dashboard layout that integrates all dashboard widgets
 */

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import PersonalizedFeed from './PersonalizedFeed';
import UserActivity from './UserActivity';
import RecommendedTools from './RecommendedTools';
import FollowedTopics from './FollowedTopics';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRight, BellRing, Book, Clock, LayoutDashboard, Settings, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';

const WelcomeCard = () => {
  const { user, isAuthenticated } = useAuth();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [isNew, setIsNew] = useState(false);
  
  useEffect(() => {
    const checkUserStatus = async () => {
      if (!isAuthenticated || !user?.id) return;
      
      try {
        // Check for unread notifications
        const notifResponse = await api.get(`/users/${user.id}/notifications`, {
          params: { unread_only: true, count_only: true }
        });
        
        if (notifResponse.data.success) {
          setUnreadNotifications(notifResponse.data.count || 0);
        }
        
        // Check user account age
        const accountAge = new Date().getTime() - new Date(user.created_at).getTime();
        const daysSinceCreation = accountAge / (1000 * 60 * 60 * 24);
        
        // Consider user "new" if account is less than 7 days old
        setIsNew(daysSinceCreation < 7);
      } catch (error) {
        console.error('Error fetching user status:', error);
      }
    };
    
    checkUserStatus();
  }, [user, isAuthenticated]);
  
  if (!isAuthenticated) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">Welcome to the Community</h2>
              <p className="text-muted-foreground mt-1">
                Join our platform to discover content, tools, and connect with other users
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/signin" passHref>
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/signup" passHref>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Welcome back, {user.name || user.username}</h2>
            <p className="text-muted-foreground mt-1">
              {isNew ? 'Thanks for joining our community!' : 'Here\'s what\'s happening in your personalized dashboard'}
            </p>
          </div>
          <div className="flex gap-3">
            {unreadNotifications > 0 && (
              <Link href="/notifications" passHref>
                <Button variant="outline">
                  <BellRing className="mr-2 h-4 w-4" />
                  {unreadNotifications} Notification{unreadNotifications !== 1 ? 's' : ''}
                </Button>
              </Link>
            )}
            <Link href="/create" passHref>
              <Button>
                Create Content
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const QuickSetup = () => {
  const { user, isAuthenticated } = useAuth();
  const [completedSteps, setCompletedSteps] = useState({
    profile: false,
    interests: false,
    firstContent: false
  });
  
  useEffect(() => {
    const checkSetupProgress = async () => {
      if (!isAuthenticated || !user?.id) return;
      
      try {
        // Check if user has completed profile
        const profileResponse = await api.get(`/users/${user.id}`);
        if (profileResponse.data.success) {
          const profile = profileResponse.data.user;
          setCompletedSteps(prev => ({
            ...prev,
            profile: !!(profile.bio && profile.avatar_url)
          }));
        }
        
        // Check if user has selected interests
        const interestsResponse = await api.get(`/users/${user.id}/interests`);
        if (interestsResponse.data.success) {
          setCompletedSteps(prev => ({
            ...prev,
            interests: interestsResponse.data.interests.length > 0
          }));
        }
        
        // Check if user has created content
        const contentResponse = await api.get(`/users/${user.id}/content`, {
          params: { limit: 1 }
        });
        if (contentResponse.data.success) {
          setCompletedSteps(prev => ({
            ...prev,
            firstContent: contentResponse.data.content.length > 0
          }));
        }
      } catch (error) {
        console.error('Error fetching setup progress:', error);
      }
    };
    
    checkSetupProgress();
  }, [user, isAuthenticated]);
  
  // Calculate completion percentage
  const completionCount = Object.values(completedSteps).filter(Boolean).length;
  const totalSteps = Object.keys(completedSteps).length;
  const completionPercentage = Math.round((completionCount / totalSteps) * 100);
  
  // Don't show if all steps completed
  if (completionPercentage === 100) return null;
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Complete Your Setup</CardTitle>
        <CardDescription>You're {completionPercentage}% complete with your account setup</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${completedSteps.profile ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                {completedSteps.profile ? '✓' : '1'}
              </div>
              <span className={completedSteps.profile ? 'line-through text-muted-foreground' : ''}>
                Complete your profile
              </span>
            </div>
            {!completedSteps.profile && (
              <Link href="/profile" passHref>
                <Button variant="outline" size="sm">Update Profile</Button>
              </Link>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${completedSteps.interests ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                {completedSteps.interests ? '✓' : '2'}
              </div>
              <span className={completedSteps.interests ? 'line-through text-muted-foreground' : ''}>
                Select your interests
              </span>
            </div>
            {!completedSteps.interests && (
              <Link href="/settings" passHref>
                <Button variant="outline" size="sm">Select Interests</Button>
              </Link>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${completedSteps.firstContent ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                {completedSteps.firstContent ? '✓' : '3'}
              </div>
              <span className={completedSteps.firstContent ? 'line-through text-muted-foreground' : ''}>
                Create your first content
              </span>
            </div>
            {!completedSteps.firstContent && (
              <Link href="/create" passHref>
                <Button variant="outline" size="sm">Create Content</Button>
              </Link>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Main Dashboard Component
const Dashboard = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <WelcomeCard />
      
      {isAuthenticated && (
        <QuickSetup />
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Personalized Feed</h2>
            <PersonalizedFeed />
          </div>
          
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Recommended Tools</h2>
            <RecommendedTools />
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Your Activity</h2>
            <UserActivity />
          </div>
          
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Topics You Follow</h2>
            <FollowedTopics />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;