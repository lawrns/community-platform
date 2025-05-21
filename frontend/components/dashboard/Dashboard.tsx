"use client";

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
import DailyBrief from './DailyBrief';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRight, BellRing, Book, Clock, LayoutDashboard, Settings, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { SubtleMotion, StaggeredList, CardMotion } from '@/components/motion/SubtleMotion';

const WelcomeCard = () => {
  const { user, isAuthenticated } = useAuth();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [isNew, setIsNew] = useState(false);
  
  useEffect(() => {
    const checkUserStatus = async () => {
      if (!isAuthenticated || !user?.id) return;
      
      try {
        // Check for unread notifications
        const notifResponse = await api.notifications.getNotifications({
          unread_only: true
        });
        
        if (notifResponse && notifResponse.unread_count !== undefined) {
          setUnreadNotifications(notifResponse.unread_count || 0);
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
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-heading-2xl text-gradient-primary">Welcome to the Community</h2>
          <p className="text-body text-secondary mt-2">
            Join our platform to discover content, tools, and connect with other users
          </p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
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
    );
  }
  
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
      <div>
        <h2 className="text-heading-2xl text-gradient-primary">Welcome back, {user?.name || user?.username || 'User'}</h2>
        <p className="text-body text-secondary mt-2">
          {isNew ? 'Thanks for joining our community!' : 'Here\'s what\'s happening in your personalized dashboard'}
        </p>
      </div>
      <div className="flex gap-3 mt-4 md:mt-0">
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
        const profileResponse = await api.users.getProfile(user.id);
        if (profileResponse) {
          setCompletedSteps(prev => ({
            ...prev,
            profile: !!(profileResponse.bio && profileResponse.avatar_url)
          }));
        }
        
        // Check if user has selected interests
        const interestsResponse = await api.feed.getUserInterests(user.id);
        if (interestsResponse && Array.isArray(interestsResponse.interests)) {
          setCompletedSteps(prev => ({
            ...prev,
            interests: interestsResponse.interests.length > 0
          }));
        }
        
        // Check if user has created content
        const contentResponse = await api.content.listContent({
          limit: 1
        });
        if (contentResponse && Array.isArray(contentResponse)) {
          setCompletedSteps(prev => ({
            ...prev,
            firstContent: contentResponse.length > 0
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
    <div className="border-t border-border-subtle mt-6 pt-6">
      <h3 className="text-heading-lg mb-2">Complete Your Setup</h3>
      <p className="text-body-sm text-secondary mb-4">
        You're {completionPercentage}% complete with your account setup
      </p>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${completedSteps.profile ? 'bg-success-100 text-success-700' : 'bg-surface-muted text-surface-muted-foreground'}`}>
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
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${completedSteps.interests ? 'bg-success-100 text-success-700' : 'bg-surface-muted text-surface-muted-foreground'}`}>
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
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${completedSteps.firstContent ? 'bg-success-100 text-success-700' : 'bg-surface-muted text-surface-muted-foreground'}`}>
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
    </div>
  );
};

// Main Dashboard Component
const Dashboard = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Section */}
      <SubtleMotion variant="slideUp">
        <div className="card-subtle mb-8">
          <div className="p-6">
            <WelcomeCard />
            
            {isAuthenticated && (
              <div className="mt-6">
                <QuickSetup />
              </div>
            )}
          </div>
        </div>
      </SubtleMotion>
      
      {/* Main Content Area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Content Area (2/3 width on medium+ screens) */}
        <div className="md:col-span-2 space-y-8">
          <StaggeredList>
            <CardMotion>
              <div className="card-elevated">
                <div className="p-6">
                  <SubtleMotion variant="fadeIn" delay={0.1}>
                    <h2 className="text-heading-xl mb-6 text-gradient-primary">Daily Brief</h2>
                    <DailyBrief />
                  </SubtleMotion>
                </div>
              </div>
            </CardMotion>
            
            <CardMotion>
              <div className="card-elevated">
                <div className="p-6">
                  <SubtleMotion variant="fadeIn" delay={0.1}>
                    <h2 className="text-heading-xl mb-6 text-gradient-primary">Personalized Feed</h2>
                    <PersonalizedFeed />
                  </SubtleMotion>
                </div>
              </div>
            </CardMotion>
            
            <CardMotion>
              <div className="card-subtle">
                <div className="p-6">
                  <SubtleMotion variant="fadeIn" delay={0.1}>
                    <h2 className="text-heading-xl mb-6">Recommended Tools</h2>
                    <RecommendedTools />
                  </SubtleMotion>
                </div>
              </div>
            </CardMotion>
          </StaggeredList>
        </div>
        
        {/* Right Sidebar (1/3 width on medium+ screens) */}
        <div className="space-y-8">
          <StaggeredList>
            <CardMotion>
              <div className="card-subtle">
                <div className="p-6">
                  <SubtleMotion variant="fadeIn" delay={0.1}>
                    <h2 className="text-heading-xl mb-6">Your Activity</h2>
                    <UserActivity />
                  </SubtleMotion>
                </div>
              </div>
            </CardMotion>
            
            <CardMotion>
              <div className="card-subtle">
                <div className="p-6">
                  <SubtleMotion variant="fadeIn" delay={0.1}>
                    <h2 className="text-heading-xl mb-6">Topics You Follow</h2>
                    <FollowedTopics />
                  </SubtleMotion>
                </div>
              </div>
            </CardMotion>
          </StaggeredList>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;