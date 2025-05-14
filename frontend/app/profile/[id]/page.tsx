"use client";

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ReputationProfile from '@/components/reputation/ReputationProfile';
import ReputationBadge from '@/components/reputation/ReputationBadge';
import { api } from '@/lib/api';
import { User } from '@/lib/types';
import { Loader2, MapPin, Link as LinkIcon, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function UserProfilePage({ params }: { params: { id: string } }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'profile';
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await api.users.getProfile(params.id);
        setUser(response.data || null);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setError('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [params.id]);
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 flex justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          <p className="text-lg">Loading user profile...</p>
        </div>
      </div>
    );
  }
  
  if (error || !user) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">User Not Found</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {error || "Sorry, the user you're looking for doesn't exist or has been removed."}
        </p>
        <Link href="/" className="text-primary hover:underline">
          Back to Home
        </Link>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Profile Header */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6 md:p-8 mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <Avatar className="w-24 h-24 border-4 border-primary/10">
            <AvatarImage src={user.avatar_url} alt={user.displayName || user.username} />
            <AvatarFallback>
              {user.displayName?.[0] || user.username?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
              <h1 className="text-2xl font-bold">{user.displayName || user.username}</h1>
              <ReputationBadge userId={user.id} size="md" />
            </div>
            
            <div className="text-gray-500 mb-4">@{user.username}</div>
            
            {user.bio && (
              <p className="text-gray-600 dark:text-gray-400 mb-4">{user.bio}</p>
            )}
            
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              {user.location && (
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin size={16} className="mr-1" />
                  {user.location}
                </div>
              )}
              
              {user.website && (
                <a 
                  href={user.website.startsWith('http') ? user.website : `https://${user.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-sm text-primary hover:underline"
                >
                  <LinkIcon size={16} className="mr-1" />
                  Website
                </a>
              )}
              
              {user.created_at && (
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar size={16} className="mr-1" />
                  Joined {format(new Date(user.created_at), 'MMMM yyyy')}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="reputation">Reputation & Badges</TabsTrigger>
          <TabsTrigger value="content">User Content</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="focus-visible:outline-none">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-6 border-b pb-4">About {user.displayName || user.username}</h2>
            
            {user.bio ? (
              <div className="mb-8">
                <h3 className="text-lg font-medium mb-2">Bio</h3>
                <p className="text-gray-600 dark:text-gray-400">{user.bio}</p>
              </div>
            ) : (
              <p className="text-gray-500 mb-8">This user hasn't added a bio yet.</p>
            )}
            
            {/* Additional profile info could go here */}
          </div>
        </TabsContent>
        
        <TabsContent value="reputation" className="focus-visible:outline-none">
          <ReputationProfile userId={user.id} />
        </TabsContent>
        
        <TabsContent value="content" className="focus-visible:outline-none">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-6 border-b pb-4">{user.displayName || user.username}'s Content</h2>
            <p className="text-gray-500">Content display features coming soon.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}