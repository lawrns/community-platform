"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, ArrowUp, ArrowDown, CheckSquare, MessageSquare, Book, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { api } from '@/lib/api';
import { useAuth } from '@/components/auth/AuthContext';
import { Badge, ReputationActivity, UserBadge } from '@/lib/types';
import { useToast } from '@/components/ui/use-toast';

// Badge colors based on category
const badgeColors = {
  bronze: 'bg-amber-500',
  silver: 'bg-gray-300',
  gold: 'bg-yellow-400'
};

interface ReputationProfileProps {
  userId?: string;
}

export default function ReputationProfile({ userId }: ReputationProfileProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'badges' | 'privileges'>('overview');
  const [reputationStats, setReputationStats] = useState<any>(null);
  const [reputationHistory, setReputationHistory] = useState<ReputationActivity[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [privileges, setPrivileges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  // Get the proper user ID
  const targetUserId = userId || (user?.id || '');
  const isOwnProfile = !userId || userId === user?.id;
  
  // Fetch reputation data
  useEffect(() => {
    const fetchReputationData = async () => {
      if (!targetUserId) return;
      
      try {
        setLoading(true);
        
        // Fetch basic reputation stats
        const statsResponse = await api.reputation.getReputation(targetUserId);
        setReputationStats(statsResponse.data);
        
        // Initial load of reputation history
        const historyResponse = await api.reputation.getHistory(targetUserId, {
          page: 1,
          limit: 10
        });
        setReputationHistory(historyResponse.data || []);
        
        // Fetch user badges
        const badgesResponse = await api.reputation.getBadges(targetUserId);
        setUserBadges(badgesResponse.data || []);
        
        // Fetch privileges
        const privilegesResponse = await api.reputation.getPrivileges();
        setPrivileges(privilegesResponse.data || []);
      } catch (error) {
        console.error('Error fetching reputation data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load reputation data. Please try again.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchReputationData();
  }, [targetUserId, toast]);
  
  // Get icon for reputation activity
  const getActivityIcon = (activity: ReputationActivity) => {
    switch (activity.action) {
      case 'question':
        return <Book className="h-4 w-4 text-blue-500" />;
      case 'answer':
        return <MessageSquare className="h-4 w-4 text-green-500" />;
      case 'upvote_received':
        return <ArrowUp className="h-4 w-4 text-green-500" />;
      case 'downvote_received':
        return <ArrowDown className="h-4 w-4 text-red-500" />;
      case 'accepted_answer':
        return <CheckSquare className="h-4 w-4 text-green-500" />;
      default:
        return <Award className="h-4 w-4 text-purple-500" />;
    }
  };
  
  // Format activity description
  const formatActivityDescription = (activity: ReputationActivity) => {
    switch (activity.action) {
      case 'question':
        return 'Asked a question';
      case 'answer':
        return 'Posted an answer';
      case 'upvote_received':
        return 'Received an upvote';
      case 'downvote_received':
        return 'Received a downvote';
      case 'accepted_answer':
        return 'Answer was accepted';
      case 'bounty':
        return 'Received a bounty';
      default:
        return 'Reputation changed';
    }
  };
  
  // Calculate progress to next privilege level
  const calculateProgress = () => {
    if (!reputationStats || !privileges.length) return { percent: 0, nextPrivilege: null };
    
    const currentRep = reputationStats.total_reputation || 0;
    const nextPrivilege = privileges.find(p => p.required_reputation > currentRep);
    
    if (!nextPrivilege) return { percent: 100, nextPrivilege: null };
    
    // Find current privilege
    const currentPrivilegeIndex = privileges.findIndex(p => p.required_reputation > currentRep) - 1;
    const currentPrivilege = currentPrivilegeIndex >= 0 ? privileges[currentPrivilegeIndex] : { required_reputation: 0 };
    
    // Calculate percentage between current and next privilege
    const startRep = currentPrivilege.required_reputation;
    const endRep = nextPrivilege.required_reputation;
    const percent = Math.min(100, Math.max(0, ((currentRep - startRep) / (endRep - startRep)) * 100));
    
    return { percent, nextPrivilege };
  };
  
  if (loading) {
    return (
      <div className="w-full flex justify-center py-12">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          <p className="text-sm text-gray-500">Loading reputation data...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
      {/* Reputation Overview Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Reputation & Badges</h2>
          {isOwnProfile && (
            <button 
              className="text-sm text-blue-600 hover:underline"
              onClick={() => setActiveTab('privileges')}
            >
              View Privileges
            </button>
          )}
        </div>
        
        <div className="flex items-center mb-4">
          <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mr-4">
            <Award className="h-8 w-8 text-primary" />
          </div>
          <div>
            <div className="flex items-baseline">
              <h3 className="text-3xl font-bold">{reputationStats?.total_reputation || 0}</h3>
              <span className="text-sm text-gray-500 ml-2">reputation points</span>
            </div>
            <p className="text-sm text-gray-500">
              {reputationStats?.rank_percentile 
                ? `Top ${reputationStats.rank_percentile}% of all users` 
                : 'New community member'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Tabs Navigation */}
      <div className="border-b">
        <div className="flex overflow-x-auto">
          {['overview', 'history', 'badges', 'privileges'].map((tab) => (
            <button
              key={tab}
              className={`px-4 py-3 font-medium text-sm capitalize whitespace-nowrap ${
                activeTab === tab
                  ? "border-b-2 border-primary text-primary"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
              onClick={() => setActiveTab(tab as any)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      
      {/* Tab Content */}
      <div className="p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg text-center">
                <div className="font-medium text-gray-500 mb-1">Total Reputation</div>
                <div className="text-2xl font-bold">{reputationStats?.total_reputation || 0}</div>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <div className="font-medium text-gray-500 mb-1">Badges Earned</div>
                <div className="text-2xl font-bold">{userBadges.length}</div>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <div className="font-medium text-gray-500 mb-1">Activity Rank</div>
                <div className="text-2xl font-bold">#{reputationStats?.rank || 'N/A'}</div>
              </div>
            </div>
            
            {/* Progress to next privilege */}
            {isOwnProfile && (
              <div>
                <h3 className="text-lg font-medium mb-3">Progress to Next Privilege</h3>
                {calculateProgress().nextPrivilege ? (
                  <div className="space-y-3">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div 
                        className="bg-primary h-2.5 rounded-full transition-all duration-500" 
                        style={{ width: `${calculateProgress().percent}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Current: {reputationStats?.total_reputation || 0}</span>
                      <span>Next: {calculateProgress().nextPrivilege?.required_reputation}</span>
                    </div>
                    <p className="text-sm">
                      <span className="font-medium">{calculateProgress().nextPrivilege?.name}:</span> {calculateProgress().nextPrivilege?.description}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">You have unlocked all privilege levels!</p>
                )}
              </div>
            )}
            
            {/* Recent badges */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-medium">Recent Badges</h3>
                <button 
                  className="text-sm text-blue-600 hover:underline"
                  onClick={() => setActiveTab('badges')}
                >
                  View All
                </button>
              </div>
              
              {userBadges.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {userBadges.slice(0, 4).map((userBadge) => (
                    <div key={userBadge.id} className="flex items-center p-3 border rounded-lg">
                      <div className={`w-8 h-8 rounded-full ${badgeColors[userBadge.badge?.category || 'bronze']} flex items-center justify-center mr-3`}>
                        <Award className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <div className="font-medium">{userBadge.badge?.name}</div>
                        <div className="text-xs text-gray-500">
                          {userBadge.earned_at ? format(new Date(userBadge.earned_at), 'MMM d, yyyy') : ''}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No badges earned yet.</p>
              )}
            </div>
            
            {/* Recent Activity */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-medium">Recent Activity</h3>
                <button 
                  className="text-sm text-blue-600 hover:underline"
                  onClick={() => setActiveTab('history')}
                >
                  View All
                </button>
              </div>
              
              {reputationHistory.length > 0 ? (
                <div className="space-y-3">
                  {reputationHistory.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center">
                        <div className="mr-3">{getActivityIcon(activity)}</div>
                        <div>
                          <div className="font-medium">{formatActivityDescription(activity)}</div>
                          <div className="text-xs text-gray-500">
                            {activity.created_at ? format(new Date(activity.created_at), 'MMM d, yyyy') : ''}
                          </div>
                        </div>
                      </div>
                      <div className={`font-medium ${activity.points >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {activity.points >= 0 ? `+${activity.points}` : activity.points}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No reputation activity yet.</p>
              )}
            </div>
          </div>
        )}
        
        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium mb-4">Reputation History</h3>
            
            {reputationHistory.length > 0 ? (
              <div className="space-y-3">
                {reputationHistory.map((activity) => (
                  <motion.div 
                    key={activity.id} 
                    className="flex items-center justify-between p-4 border rounded-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center">
                      <div className="mr-3">{getActivityIcon(activity)}</div>
                      <div>
                        <div className="font-medium">{formatActivityDescription(activity)}</div>
                        {activity.content_id && (
                          <div className="text-sm text-blue-600 hover:underline cursor-pointer">
                            View content
                          </div>
                        )}
                        <div className="text-xs text-gray-500">
                          {activity.created_at ? format(new Date(activity.created_at), 'MMM d, yyyy h:mm a') : ''}
                        </div>
                      </div>
                    </div>
                    <div className={`font-medium ${activity.points >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {activity.points >= 0 ? `+${activity.points}` : activity.points}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Award className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <h4 className="text-lg font-medium mb-1">No Reputation Activity Yet</h4>
                <p className="text-gray-500 text-sm">
                  Reputation is earned when you contribute to the community through questions, answers, and quality content.
                </p>
              </div>
            )}
          </div>
        )}
        
        {/* Badges Tab */}
        {activeTab === 'badges' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium mb-4">Badges</h3>
            
            {userBadges.length > 0 ? (
              <>
                {/* Group badges by category */}
                {(['gold', 'silver', 'bronze'] as const).map((category) => {
                  const categoryBadges = userBadges.filter(b => b.badge?.category === category);
                  if (categoryBadges.length === 0) return null;
                  
                  return (
                    <div key={category} className="mb-8">
                      <h4 className="text-md font-medium mb-3 capitalize flex items-center">
                        <div className={`w-5 h-5 rounded-full ${badgeColors[category]} mr-2`}></div>
                        {category} Badges ({categoryBadges.length})
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {categoryBadges.map((userBadge) => (
                          <motion.div 
                            key={userBadge.id} 
                            className="p-4 border rounded-lg"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="flex items-center mb-2">
                              <div className={`w-8 h-8 rounded-full ${badgeColors[category]} flex items-center justify-center mr-3`}>
                                <Award className="h-4 w-4 text-white" />
                              </div>
                              <div className="font-medium">{userBadge.badge?.name}</div>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {userBadge.badge?.description}
                            </p>
                            <div className="text-xs text-gray-500">
                              Earned: {userBadge.earned_at ? format(new Date(userBadge.earned_at), 'MMM d, yyyy') : ''}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </>
            ) : (
              <div className="text-center py-8">
                <Award className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <h4 className="text-lg font-medium mb-1">No Badges Earned Yet</h4>
                <p className="text-gray-500 text-sm">
                  Badges are awarded for various achievements and contributions to the community.
                </p>
              </div>
            )}
          </div>
        )}
        
        {/* Privileges Tab */}
        {activeTab === 'privileges' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium mb-4">Reputation Privileges</h3>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
              <div 
                className="bg-primary h-2.5 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, (reputationStats?.total_reputation / (privileges[privileges.length - 1]?.required_reputation || 1)) * 100)}%` }}
              ></div>
            </div>
            
            <div className="space-y-4">
              {privileges.map((privilege, index) => {
                const isUnlocked = (reputationStats?.total_reputation || 0) >= privilege.required_reputation;
                
                return (
                  <motion.div 
                    key={index}
                    className={`p-4 border rounded-lg ${isUnlocked ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : ''}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium">{privilege.name}</h4>
                      <div className="flex items-center">
                        {isUnlocked ? (
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 rounded-full">
                            Unlocked
                          </span>
                        ) : (
                          <span className="text-xs font-medium">
                            {privilege.required_reputation} rep needed
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {privilege.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}