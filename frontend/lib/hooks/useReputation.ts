import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Badge, ReputationActivity, UserBadge } from '@/lib/types';
import { useAuth } from '@/components/auth/AuthContext';

interface UseReputationResult {
  reputationStats: any;
  reputationHistory: ReputationActivity[];
  userBadges: UserBadge[];
  privileges: any[];
  loading: boolean;
  error: string | null;
  refreshReputation: () => Promise<void>;
}

export function useReputation(userId?: string): UseReputationResult {
  const [reputationStats, setReputationStats] = useState<any>(null);
  const [reputationHistory, setReputationHistory] = useState<ReputationActivity[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [privileges, setPrivileges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  
  // Get the proper user ID
  const targetUserId = userId || (user?.id || '');
  
  // Fetch reputation data
  const fetchReputationData = async () => {
    if (!targetUserId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Fetch basic reputation stats
      const statsResponse = await api.reputation.getReputation(targetUserId);
      setReputationStats(statsResponse);
      
      // Initial load of reputation history
      const historyResponse = await api.reputation.getHistory(targetUserId, {
        page: 1,
        limit: 10
      });
      setReputationHistory(historyResponse.history || []);
      
      // Fetch user badges
      const badgesResponse = await api.reputation.getBadges(targetUserId);
      setUserBadges(badgesResponse.badges || []);
      
      // Fetch privileges
      const privilegesResponse = await api.reputation.getPrivileges();
      setPrivileges(privilegesResponse.privileges || []);
    } catch (error) {
      console.error('Error fetching reputation data:', error);
      setError('Failed to load reputation data');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchReputationData();
  }, [targetUserId]);
  
  return {
    reputationStats,
    reputationHistory,
    userBadges,
    privileges,
    loading,
    error,
    refreshReputation: fetchReputationData
  };
}