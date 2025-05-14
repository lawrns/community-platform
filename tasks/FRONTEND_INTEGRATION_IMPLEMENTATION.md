# Frontend Integration Implementation Guide

This document provides detailed implementation guidance for completing the remaining frontend integration tasks.

## 1. Content Creation & Editing

### Autosave Implementation

Update the `Editor.tsx` component to properly implement the autosave functionality:

```typescript
// In Editor.tsx

// Update the autosave useEffect
useEffect(() => {
  if (!autoSave || !isAuthenticated || !savedContentId) return;
  
  const interval = setInterval(() => {
    if (content !== lastSavedContent) {
      // Only autosave if content has changed since last save
      handleSave();
      setLastSavedContent(content);
    }
  }, 20000); // Auto-save every 20 seconds per requirements
  
  return () => clearInterval(interval);
}, [autoSave, handleSave, content, lastSavedContent, isAuthenticated, savedContentId]);
```

Add a state variable to track the last saved content:

```typescript
const [lastSavedContent, setLastSavedContent] = useState(initialContent);
```

### Version History Diffing

Enhance the `VersionHistory.tsx` component to add version comparison:

```typescript
// In VersionHistory.tsx

import { diffLines } from 'diff';

// Add a state for the selected versions to compare
const [compareVersions, setCompareVersions] = useState<{
  older: { id: string; content: string } | null;
  newer: { id: string; content: string } | null;
}>({ older: null, newer: null });

// Implement diff view
const renderDiff = () => {
  if (!compareVersions.older || !compareVersions.newer) return null;
  
  const differences = diffLines(compareVersions.older.content, compareVersions.newer.content);
  
  return (
    <div className="p-4 border rounded-lg mt-4 overflow-auto max-h-96">
      {differences.map((part, index) => (
        <div 
          key={index}
          className={`${part.added ? 'bg-green-50 text-green-800' : part.removed ? 'bg-red-50 text-red-800' : ''}`}
        >
          <pre className="text-sm whitespace-pre-wrap">
            {part.value}
          </pre>
        </div>
      ))}
    </div>
  );
};
```

### Code Block Enhancement

Add proper code block support in the rich text editor:

```typescript
// In RichTextEditor.tsx

// Add syntax highlighting support
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Update the editor configuration to handle code blocks
const modules = {
  toolbar: [
    // Existing toolbar options
    // ...
    ['code-block']
  ],
  syntax: {
    highlight: (text: string) => {
      return SyntaxHighlighter.highlight(text, tomorrow);
    }
  }
};
```

### Offline Editing Support

Add local storage fallback for offline editing:

```typescript
// In Editor.tsx

// Add state to track offline status
const [isOffline, setIsOffline] = useState(false);

// Monitor online/offline status
useEffect(() => {
  const handleOnline = () => setIsOffline(false);
  const handleOffline = () => setIsOffline(true);
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}, []);

// Implement local storage backup during offline mode
useEffect(() => {
  if (isOffline && content) {
    localStorage.setItem(`draft_${savedContentId || 'new'}`, content);
  }
}, [isOffline, content, savedContentId]);

// Restore from local storage if available
useEffect(() => {
  const draft = localStorage.getItem(`draft_${savedContentId || 'new'}`);
  if (draft && isOffline) {
    // Show prompt to restore
    if (confirm('Restore unsaved draft from offline editing?')) {
      setContent(draft);
    }
  }
}, [savedContentId]);
```

## 2. Search Functionality

### Connect Tag Filters to API

Update the tag filtering in `SearchResults.tsx`:

```typescript
// In SearchResults.tsx

// Add state for available tags
const [availableTags, setAvailableTags] = useState<string[]>([]);

// Fetch available tags on component mount
useEffect(() => {
  const fetchTags = async () => {
    try {
      const response = await api.tags.listTags();
      if (response) {
        setAvailableTags(response.map(tag => tag.name));
      }
    } catch (err) {
      console.error('Error fetching tags:', err);
    }
  };
  
  fetchTags();
}, []);
```

### Implement Search Term Highlighting

Add highlighting of matching terms in search results:

```typescript
// In SearchResults.tsx

// Helper function to highlight matches
const highlightMatches = (text: string, query: string) => {
  if (!query) return text;
  
  // Split the query into words
  const words = query.split(/\s+/).filter(Boolean).map(word => 
    word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  );
  
  if (words.length === 0) return text;
  
  // Create a regex pattern for all words
  const pattern = new RegExp(`(${words.join('|')})`, 'gi');
  
  // Replace matches with highlighted spans
  return text.replace(pattern, '<span class="bg-yellow-100 dark:bg-yellow-900">$1</span>');
};

// Update the result rendering
<p 
  className="text-sm text-muted-foreground" 
  dangerouslySetInnerHTML={{ __html: highlightMatches(result.excerpt, query) }}
/>
```

### Add Search Analytics

Implement analytics tracking for search terms:

```typescript
// In SearchResults.tsx

// Add analytics tracking
const trackSearch = useCallback((searchTerm: string, resultsCount: number) => {
  // This would connect to your analytics service
  try {
    // Example with a simple API call
    fetch('/api/analytics/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        term: searchTerm,
        results: resultsCount,
        timestamp: new Date().toISOString()
      })
    });
  } catch (err) {
    console.error('Error tracking search:', err);
  }
}, []);

// Update useEffect to track searches
useEffect(() => {
  if (query && !isLoading && results.length >= 0) {
    trackSearch(query, totalResults);
  }
}, [query, isLoading, totalResults, results.length, trackSearch]);
```

## 3. Notification Engine

### WebSocket Testing

Update the `NotificationProvider.tsx` to better handle WebSocket connection:

```typescript
// In NotificationProvider.tsx

// Add connection status state
const [wsConnected, setWsConnected] = useState(false);

// Update WebSocket connection with status tracking
useEffect(() => {
  if (!isAuthenticated) {
    setWsConnected(false);
    return;
  }
  
  // Add connection status handlers
  const handleConnect = () => {
    setWsConnected(true);
    console.log('WebSocket connected successfully');
  };
  
  const handleDisconnect = () => {
    setWsConnected(false);
    console.log('WebSocket disconnected');
  };
  
  // Register handlers
  notificationService.onConnect = handleConnect;
  notificationService.onDisconnect = handleDisconnect;
  
  // Connect to WebSocket
  notificationService.connect();
  
  // Add notification handler
  notificationService.addNotificationHandler(handleNewNotification);
  
  // Fetch initial notifications
  fetchNotifications();
  
  // Cleanup on unmount
  return () => {
    notificationService.removeNotificationHandler(handleNewNotification);
    notificationService.onConnect = null;
    notificationService.onDisconnect = null;
  };
}, [isAuthenticated, user?.id, fetchNotifications]);
```

### Notification Settings Page

Create a new component for notification settings:

```typescript
// Create file: frontend/app/settings/notifications/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

export default function NotificationSettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    email_digest: true,
    email_direct_message: true,
    email_mentions: true,
    email_comments: false,
    email_upvotes: false,
    push_direct_message: true,
    push_mentions: true,
    push_comments: true,
    push_upvotes: false,
    push_system: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const response = await api.notifications.getPreferences();
        if (response.preferences) {
          setSettings(response.preferences);
        }
      } catch (err) {
        console.error('Error fetching notification preferences:', err);
        toast({
          title: 'Error',
          description: 'Failed to load notification preferences',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSettings();
  }, [toast]);
  
  const handleSave = async () => {
    try {
      setIsSaving(true);
      await api.notifications.updatePreferences(settings);
      toast({
        title: 'Success',
        description: 'Notification preferences saved'
      });
    } catch (err) {
      console.error('Error saving notification preferences:', err);
      toast({
        title: 'Error',
        description: 'Failed to save notification preferences',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-3xl font-bold mb-6">Notification Settings</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
          <CardDescription>Configure what emails you receive</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Daily Digest</p>
              <p className="text-sm text-muted-foreground">Receive a daily summary of activity</p>
            </div>
            <Switch 
              checked={settings.email_digest}
              onCheckedChange={(checked) => setSettings({...settings, email_digest: checked})}
              disabled={isLoading}
            />
          </div>
          
          {/* Additional email settings */}
          {/* ... */}
        </CardContent>
      </Card>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Push Notifications</CardTitle>
          <CardDescription>Configure in-app notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Push notification settings */}
          {/* ... */}
        </CardContent>
      </Card>
      
      <div className="flex justify-end mt-6">
        <Button onClick={handleSave} disabled={isSaving || isLoading}>
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}
```

### Browser Notifications

Add browser notification support:

```typescript
// In NotificationProvider.tsx

// Add state for browser notification permission
const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | null>(null);

// Check notification permission on mount
useEffect(() => {
  if ('Notification' in window) {
    setNotificationPermission(Notification.permission);
  }
}, []);

// Request permission for browser notifications
const requestNotificationPermission = async () => {
  if ('Notification' in window && Notification.permission !== 'granted') {
    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
  }
};

// Show browser notification
const showBrowserNotification = (notification: NotificationEvent) => {
  if (notificationPermission === 'granted' && 'Notification' in window) {
    const title = getNotificationTitle(notification);
    const options = {
      body: notification.content,
      icon: '/favicon.ico',
      data: { url: notification.link }
    };
    
    const browserNotification = new Notification(title, options);
    
    // Handle click on notification
    browserNotification.onclick = function() {
      window.focus();
      if (notification.link) {
        window.location.href = notification.link;
        
        // Mark as read when clicked
        markAsRead(notification.id);
      }
    };
  }
};

// Update handleNewNotification to show browser notification
const handleNewNotification = (notification: NotificationEvent) => {
  // Update notifications list with new notification at the beginning
  setNotifications(prev => [notification, ...prev]);
  
  // Increment unread count
  setUnreadCount(prev => prev + 1);
  
  // Show browser notification if permitted
  if (document.hidden) {
    showBrowserNotification(notification);
  }
  
  // Show toast notification
  toast({
    title: getNotificationTitle(notification),
    description: notification.content,
    action: notification.link ? (
      <a 
        href={notification.link} 
        className="bg-primary text-white px-3 py-1.5 text-xs rounded-md hover:bg-primary/80"
        onClick={() => markAsRead(notification.id)}
      >
        View
      </a>
    ) : undefined
  });
};
```

## 4. Tool Directory

### Replace Mock Data with API Integration

Update the `ToolsPage.tsx` component to use real data:

```typescript
// In frontend/app/tools/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

// Remove the mock data and add state for tools
const [tools, setTools] = useState([]);
const [categories, setCategories] = useState([]);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState(null);

// Fetch tools and categories on mount
useEffect(() => {
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch tool categories
      const categoriesResponse = await api.tools.getToolCategories();
      if (categoriesResponse.categories) {
        setCategories(['All Categories', ...categoriesResponse.categories]);
      }
      
      // Fetch tools with initial filters
      const response = await api.tools.listTools({
        page: 1,
        limit: 12,
        sort: 'popular',
      });
      
      if (response.tools) {
        setTools(response.tools);
      }
    } catch (err) {
      console.error('Error fetching tools:', err);
      setError('Failed to load tools. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  fetchData();
}, []);

// Update the filtering logic to use the API
useEffect(() => {
  const fetchFilteredTools = async () => {
    if (!isLoading) {
      try {
        setIsLoading(true);
        
        const response = await api.tools.listTools({
          page: 1,
          limit: 12,
          category: selectedCategory === 'All Categories' ? undefined : selectedCategory,
          search: searchQuery || undefined,
          sort: priceFilter === 'All' ? undefined : priceFilter.toLowerCase(),
        });
        
        if (response.tools) {
          // Apply client-side rating filter (assuming rating is in the response)
          const filteredByRating = response.tools.filter(tool => 
            tool.rating >= ratingFilter
          );
          setTools(filteredByRating);
        }
      } catch (err) {
        console.error('Error filtering tools:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  fetchFilteredTools();
}, [searchQuery, selectedCategory, priceFilter, ratingFilter]);
```

### Create Tool Detail Page

Implement the tool detail page with real data:

```typescript
// Update frontend/app/tools/[id]/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ThumbsUp, 
  ExternalLink, 
  Flag, 
  Star, 
  MessageSquare,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';

export default function ToolDetailPage() {
  const params = useParams();
  const { id } = params;
  
  const [tool, setTool] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch tool details
        const toolData = await api.tools.getTool(id as string);
        setTool(toolData);
        
        // Fetch reviews
        const reviewsData = await api.tools.getReviews(id as string, {
          page: 1,
          limit: 10
        });
        setReviews(reviewsData.reviews || []);
      } catch (err: any) {
        console.error('Error fetching tool details:', err);
        setError(err.message || 'Failed to load tool details');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) {
      fetchData();
    }
  }, [id]);
  
  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="h-64 bg-gray-200 rounded mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="p-6 text-center border rounded-lg bg-red-50">
          <p className="text-red-600 mb-4">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }
  
  if (!tool) return null;
  
  return (
    <div className="container mx-auto py-12 px-4">
      {/* Tool header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-4xl font-bold">{tool.name}</h1>
          <Badge>{tool.category}</Badge>
        </div>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
          {tool.description}
        </p>
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${
                  i < Math.floor(tool.average_rating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
            <span className="ml-2 font-medium">{tool.average_rating.toFixed(1)}</span>
            <span className="ml-1 text-gray-500">({tool.reviews_count} reviews)</span>
          </div>
          <span className="text-gray-500">{tool.pricing_type}</span>
        </div>
      </div>
      
      {/* Tool content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="use-cases">Use Cases</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              {/* Tool overview content */}
              {/* ... */}
            </TabsContent>
            
            <TabsContent value="reviews" className="space-y-6">
              {/* Reviews list */}
              <div className="space-y-4">
                {reviews.map(review => (
                  <Card key={review.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center mb-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <h3 className="font-medium">{review.title}</h3>
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {format(new Date(review.created_at), 'MMM d, yyyy')}
                        </div>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-3">
                        {review.content}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <div className="font-medium">{review.user_name}</div>
                        <div className="flex items-center gap-4">
                          <button className="flex items-center gap-1 text-gray-500 hover:text-gray-700">
                            <ThumbsUp className="h-4 w-4" />
                            {review.helpful_count}
                          </button>
                          <button className="flex items-center gap-1 text-gray-500 hover:text-gray-700">
                            <Flag className="h-4 w-4" />
                            Report
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {reviews.length === 0 && (
                  <div className="text-center py-12 border rounded-lg">
                    <p className="text-gray-500">No reviews yet. Be the first to review!</p>
                  </div>
                )}
              </div>
              
              {/* Submit review button */}
              <div className="text-center mt-6">
                <Button size="lg">Write a Review</Button>
              </div>
            </TabsContent>
            
            <TabsContent value="use-cases" className="space-y-6">
              {/* Use cases content */}
              {/* ... */}
            </TabsContent>
          </Tabs>
        </div>
        
        <div>
          {/* Sidebar with pricing and actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Pricing */}
                <div>
                  <h3 className="font-medium mb-2">Pricing</h3>
                  <div className="space-y-2">
                    {tool.pricing_details && tool.pricing_details.map((tier, i) => (
                      <div key={i} className="flex justify-between">
                        <span>{tier.name}</span>
                        <span className="font-medium">{tier.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Actions */}
                <div className="pt-4 space-y-3">
                  <Button className="w-full" asChild>
                    <a href={tool.url} target="_blank" rel="noopener noreferrer">
                      Visit Website
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                  
                  <Button variant="outline" className="w-full">
                    <ThumbsUp className="mr-2 h-4 w-4" />
                    Upvote Tool
                  </Button>
                  
                  {tool.can_claim && (
                    <Button variant="secondary" className="w-full">
                      Claim This Listing
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
```

## 5. Reputation System

### Reputation Display Component

Create a new reputation display component:

```typescript
// Create file: frontend/components/profile/ReputationDisplay.tsx

'use client';

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
          api.reputation.getPrivileges()
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
          <CardTitle className="animate-pulse bg-gray-200 h-7 w-1/3 rounded"></CardTitle>
          <CardDescription className="animate-pulse bg-gray-200 h-5 w-1/2 rounded mt-2"></CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
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
        
        {/* Tab content */}
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
```

### Voting UI Components

Create a reusable voting component:

```typescript
// Create file: frontend/components/content/VoteControls.tsx

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown, Check } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/components/auth/AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface VoteControlsProps {
  contentId: string;
  initialUpvotes: number;
  isQuestion?: boolean;
  isAnswer?: boolean;
  questionId?: string; // Required if isAnswer is true
  isAccepted?: boolean;
  onAccept?: () => void;
  canAccept?: boolean;
}

export default function VoteControls({
  contentId,
  initialUpvotes,
  isQuestion = false,
  isAnswer = false,
  questionId,
  isAccepted = false,
  onAccept,
  canAccept = false
}: VoteControlsProps) {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Check if user has already upvoted
  useEffect(() => {
    const checkVoteStatus = async () => {
      if (!isAuthenticated) return;
      
      try {
        // This endpoint would need to be implemented on the backend
        const response = await fetch(`/api/content/${contentId}/vote-status`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setHasUpvoted(data.has_upvoted);
        }
      } catch (err) {
        console.error('Error checking vote status:', err);
      }
    };
    
    checkVoteStatus();
  }, [contentId, isAuthenticated]);
  
  // Handle upvote
  const handleUpvote = async () => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to vote',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      if (hasUpvoted) {
        // Remove upvote
        await api.content.removeUpvote(contentId);
        setUpvotes(prev => prev - 1);
        setHasUpvoted(false);
      } else {
        // Add upvote
        await api.content.upvote(contentId);
        setUpvotes(prev => prev + 1);
        setHasUpvoted(true);
      }
    } catch (err: any) {
      console.error('Error voting:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to vote. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle accepting answer
  const handleAcceptAnswer = async () => {
    if (!isAuthenticated || !questionId || !isAnswer) return;
    
    try {
      setIsLoading(true);
      await api.content.acceptAnswer(questionId, contentId);
      
      toast({
        title: 'Answer Accepted',
        description: 'This answer has been marked as the accepted solution'
      });
      
      if (onAccept) {
        onAccept();
      }
    } catch (err: any) {
      console.error('Error accepting answer:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to accept answer. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        className={`rounded-full p-0 h-8 w-8 ${
          hasUpvoted ? 'text-primary bg-primary/10' : ''
        }`}
        onClick={handleUpvote}
        disabled={isLoading}
      >
        <ThumbsUp className="h-4 w-4" />
        <span className="sr-only">Upvote</span>
      </Button>
      
      <span className="text-sm font-medium">{upvotes}</span>
      
      {/* Downvote button could be implemented here */}
      
      {isAnswer && canAccept && !isAccepted && (
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full p-0 h-8 w-8 mt-2"
          onClick={handleAcceptAnswer}
          disabled={isLoading}
          title="Accept this answer"
        >
          <Check className="h-4 w-4" />
          <span className="sr-only">Accept answer</span>
        </Button>
      )}
      
      {isAnswer && isAccepted && (
        <div className="rounded-full p-0 h-8 w-8 mt-2 bg-green-100 dark:bg-green-900 flex items-center justify-center">
          <Check className="h-4 w-4 text-green-600 dark:text-green-300" />
        </div>
      )}
    </div>
  );
}
```

## Implementation Checklist

### Content Creation & Editing
- [ ] Update Editor.tsx with proper autosave implementation
- [ ] Enhance VersionHistory.tsx with diffing capabilities
- [ ] Add syntax highlighting for code blocks
- [ ] Implement offline editing with local storage

### Search Functionality
- [ ] Connect tag filters to real data from API
- [ ] Add highlighting of search terms in results
- [ ] Implement analytics tracking for searches
- [ ] Test search performance with various queries

### Notification Engine
- [ ] Update WebSocket implementation with connection tracking
- [ ] Create notification settings page
- [ ] Implement browser notification support
- [ ] Add notification history view

### Tool Directory
- [ ] Replace mock data with real API calls
- [ ] Create tool detail page with full information
- [ ] Implement review submission form
- [ ] Add vendor claiming workflow

### Reputation System
- [ ] Create ReputationDisplay component
- [ ] Implement VoteControls component
- [ ] Add reputation history view
- [ ] Create badge showcase UI

## Conclusion

Following this implementation guide will complete the frontend integration work. The code samples provided can be customized as needed to match the existing project structure and styling conventions.

For any complex integrations, it's recommended to:

1. Start with API service functions to ensure data is properly fetched
2. Implement UI components with proper loading and error states
3. Add optimistic updates for better user experience
4. Test thoroughly with various edge cases

With a focused implementation effort, all remaining integration tasks can be completed within the estimated timeline.