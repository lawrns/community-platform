"use client";

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProfileForm from '@/components/auth/ProfileForm';
import ReputationProfile from '@/components/reputation/ReputationProfile';
import { useAuth } from '@/components/auth/AuthContext';
import { useSearchParams } from 'next/navigation';

export default function ProfilePage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'profile';
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  return (
    <div className="container max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="profile">Profile Settings</TabsTrigger>
          <TabsTrigger value="reputation">Reputation & Badges</TabsTrigger>
          <TabsTrigger value="content">Your Content</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="focus-visible:outline-none">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-6 border-b pb-4">Profile Settings</h2>
            <ProfileForm />
          </div>
        </TabsContent>
        
        <TabsContent value="reputation" className="focus-visible:outline-none">
          {user && <ReputationProfile userId={user.id} />}
        </TabsContent>
        
        <TabsContent value="content" className="focus-visible:outline-none">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-6 border-b pb-4">Your Content</h2>
            <p className="text-gray-500">Content management features coming soon.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}