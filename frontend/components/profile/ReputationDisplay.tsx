"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import {
  Award,
  Star,
  Shield,
  ThumbsUp,
  MessageSquare,
  CheckSquare,
  ActivitySquare
} from 'lucide-react';

interface ReputationDisplayProps {
  userId: string;
}

export default function ReputationDisplay({ userId }: ReputationDisplayProps) {
  const [reputation, setReputation] = useState<{
    points: number;
    tier: string;
    next_tier: string | null;
    points_to_next_tier: number | null;
  } | null>(null);
  const [badges, setBadges] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [privileges, setPrivileges] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'badges' | 'history'>('overview');

  useEffect(() => {
    const fetchReputationData = async () => {
      try {
        setIsLoading(true);

        // Fetch reputation data
        const [reputationData, badgesData, historyData, privilegesData] = await Promise.all([
          api.reputation.getReputation(userId),
          api.reputation.getBadges(userId),
          api.reputation.getHistory(userId, { limit: 10 }),
          api.reputation.getPrivileges(userId)
        ]);

        setReputation(reputationData);
        setBadges(badgesData.badges || []);
        setHistory(historyData.history || []);
        setPrivileges(privilegesData.privileges || []);
      } catch (err) {
        console.error('Error fetching reputation data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReputationData();
  }, [userId]);

  // Get badge icon based on badge type
  const getBadgeIcon = (type: string) => {
    switch (type) {
      case 'gold':
        return <Award className="h-5 w-5 text-yellow-500" />;
      case 'silver':
        return <Award className="h-5 w-5 text-gray-400" />;
      case 'bronze':
        return <Award className="h-5 w-5 text-amber-700" />;
      default:
        return <Award className="h-5 w-5" />;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="animate-pulse bg-gray-200 h-7 w-1/3 rounded" />
          <CardDescription className="animate-pulse bg-gray-200 h-5 w-1/2 rounded mt-2" />
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-gray-200 rounded" />
            <div className="h-32 bg-gray-200 rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!reputation) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ActivitySquare className="h-5 w-5 text-primary" />
          Reputation & Badges
        </CardTitle>
        <CardDescription>
          Earn reputation by contributing quality content and helping others
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          <div className="text-4xl font-bold text-primary">{reputation.points}</div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <div className="font-medium">{reputation.tier}</div>
              {reputation.next_tier && (
                <div className="text-sm text-muted-foreground">{reputation.next_tier}</div>
              )}
            </div>
            {reputation.points_to_next_tier && reputation.next_tier && (
              <>
                <Progress value={(reputation.points / (reputation.points + reputation.points_to_next_tier)) * 100} className="h-2" />
                <div className="text-xs text-right mt-1 text-muted-foreground">
                  {reputation.points_to_next_tier} points to next level
                </div>
              </>
            )}
          </div>
        </div>

        {/* Tabs for badges, history, etc. */}
        <div className="border-b mb-4">
          <div className="flex -mb-px">
            <button
              className={`py-2 px-4 text-sm font-medium ${
                activeTab === 'overview'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground'
              }`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`py-2 px-4 text-sm font-medium ${
                activeTab === 'badges'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground'
              }`}
              onClick={() => setActiveTab('badges')}
            >
              Badges ({badges.length})
            </button>
            <button
              className={`py-2 px-4 text-sm font-medium ${
                activeTab === 'history'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground'
              }`}
              onClick={() => setActiveTab('history')}
            >
              History
            </button>
          </div>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Recent badges */}
            <div>
              <h3 className="text-sm font-medium mb-2">Recent Badges</h3>
              <div className="flex flex-wrap gap-2">
                {badges.slice(0, 5).map(badge => (
                  <div 
                    key={badge.id}
                    className="flex items-center gap-1 p-1 rounded-full bg-muted"
                    title={badge.description}
                  >
                    {getBadgeIcon(badge.level)}
                    <span className="text-xs font-medium">{badge.name}</span>
                  </div>
                ))}
                {badges.length === 0 && (
                  <p className="text-sm text-muted-foreground">No badges earned yet</p>
                )}
              </div>
            </div>

            {/* Privileges */}
            <div>
              <h3 className="text-sm font-medium mb-2">Privileges</h3>
              <div className="space-y-2">
                {privileges.map(privilege => {
                  const isUnlocked = reputation.points >= privilege.required_reputation;
                  return (
                    <div 
                      key={privilege.id}
                      className={`p-2 rounded-md flex items-center gap-2 ${
                        isUnlocked ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-800'
                      }`}
                    >
                      {isUnlocked ? (
                        <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <Shield className="h-4 w-4 text-gray-400" />
                      )}
                      <div>
                        <div className="text-sm font-medium">{privilege.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {isUnlocked ? 'Unlocked' : `${privilege.required_reputation} reputation required`}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'badges' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {badges.map(badge => (
              <div key={badge.id} className="border rounded-md p-3">
                <div className="flex items-start">
                  <div className="mr-3">
                    {getBadgeIcon(badge.level)}
                  </div>
                  <div>
                    <div className="font-medium">{badge.name}</div>
                    <div className="text-sm text-muted-foreground">{badge.description}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Earned on {new Date(badge.earned_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {badges.length === 0 && (
              <div className="col-span-2 text-center py-8">
                <Award className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p>No badges earned yet</p>
                <p className="text-sm text-muted-foreground">
                  Badges are awarded for various achievements and contributions
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-3">
            {history.map(item => (
              <div key={item.id} className="border-b pb-3 last:border-0">
                <div className="flex items-start">
                  <div className="mr-3">
                    {item.type === 'upvote' && <ThumbsUp className="h-4 w-4 text-green-600" />}
                    {item.type === 'answer_accepted' && <CheckSquare className="h-4 w-4 text-green-600" />}
                    {item.type === 'badge_earned' && <Award className="h-4 w-4 text-blue-600" />}
                    {item.type === 'comment' && <MessageSquare className="h-4 w-4 text-purple-600" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {item.points >= 0 ? `+${item.points}` : item.points}
                      </span>
                      <span className="text-sm">{item.description}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(item.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {history.length === 0 && (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground">No reputation history yet</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}