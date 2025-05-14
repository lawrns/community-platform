"use client";

import { useEffect, useState } from 'react';
import { Award } from 'lucide-react';
import { api } from '@/lib/api';
import Link from 'next/link';

interface ReputationBadgeProps {
  userId: string;
  showBadges?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function ReputationBadge({ 
  userId, 
  showBadges = true, 
  size = 'md',
  className = ''
}: ReputationBadgeProps) {
  const [reputation, setReputation] = useState<number | null>(null);
  const [badgeCount, setBadgeCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  
  // Size classes
  const sizeClasses = {
    sm: {
      container: 'h-5 text-xs',
      badge: 'h-3 w-3',
      badgeCount: 'text-xs'
    },
    md: {
      container: 'h-6 text-sm',
      badge: 'h-4 w-4',
      badgeCount: 'text-xs'
    },
    lg: {
      container: 'h-8 text-base',
      badge: 'h-5 w-5',
      badgeCount: 'text-sm'
    }
  };
  
  useEffect(() => {
    const fetchReputationData = async () => {
      if (!userId) return;
      
      try {
        setLoading(true);
        
        // Fetch reputation
        const response = await api.reputation.getReputation(userId);
        
        if (response && response.data) {
          setReputation(response.data.total_reputation || 0);
        }
        
        // Fetch badges if needed
        if (showBadges) {
          const badgesResponse = await api.reputation.getBadges(userId);
          setBadgeCount(badgesResponse.data?.length || 0);
        }
      } catch (error) {
        console.error('Error fetching reputation:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReputationData();
  }, [userId, showBadges]);
  
  if (loading) {
    return (
      <div className={`${sizeClasses[size].container} px-2 bg-gray-100 dark:bg-gray-800 rounded-full animate-pulse ${className}`}>
        <div className="w-10 h-full bg-gray-200 dark:bg-gray-700 rounded-full"></div>
      </div>
    );
  }
  
  return (
    <Link href={`/profile/${userId}?tab=reputation`} className={`flex items-center gap-1 ${className}`}>
      <div className={`${sizeClasses[size].container} px-2 bg-primary/10 text-primary rounded-full flex items-center`}>
        <span>{reputation?.toLocaleString() || 0}</span>
      </div>
      
      {showBadges && badgeCount > 0 && (
        <div className={`flex items-center bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 rounded-full px-2 ${sizeClasses[size].container}`}>
          <Award className={`${sizeClasses[size].badge} mr-1`} />
          <span className={sizeClasses[size].badgeCount}>{badgeCount}</span>
        </div>
      )}
    </Link>
  );
}