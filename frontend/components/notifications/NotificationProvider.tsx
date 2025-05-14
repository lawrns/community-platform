'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/components/auth/AuthContext';
import { notificationService, NotificationEvent } from '@/lib/websocket';
import { useToast } from '@/components/ui/use-toast';

interface NotificationContextType {
  notifications: NotificationEvent[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  isLoading: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<NotificationEvent[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Handle new notification from WebSocket
  const handleNewNotification = (notification: NotificationEvent) => {
    // Update notifications list with new notification at the beginning
    setNotifications(prev => [notification, ...prev]);
    
    // Increment unread count
    setUnreadCount(prev => prev + 1);
    
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

  // Get notification title based on type
  const getNotificationTitle = (notification: NotificationEvent) => {
    switch (notification.type) {
      case 'mention':
        return 'Mention';
      case 'comment':
        return 'New Comment';
      case 'upvote':
        return 'New Upvote';
      case 'follow':
        return 'New Follower';
      case 'badge':
        return 'Badge Earned';
      case 'answer':
        return 'Answer to Your Question';
      case 'system':
        return 'System Notification';
      default:
        return 'Notification';
    }
  };

  // Fetch notifications from API
  const fetchNotifications = async () => {
    if (!isAuthenticated || !user?.id) return;
    
    try {
      setIsLoading(true);
      
      const response = await api.notifications.getNotifications({
        limit: 20,
        page: 1,
      });
      
      if (response.notifications) {
        setNotifications(response.notifications);
        setUnreadCount(response.unread_count || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (id: string) => {
    if (!isAuthenticated) return;
    
    try {
      await api.notifications.markAsRead(id);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, read: true } 
            : notification
        )
      );
      
      // Decrement unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!isAuthenticated) return;
    
    try {
      await api.notifications.markAllAsRead();
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      
      // Reset unread count
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Connect to WebSocket when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    
    // Connect to WebSocket
    notificationService.connect();
    
    // Add notification handler
    notificationService.addNotificationHandler(handleNewNotification);
    
    // Fetch initial notifications
    fetchNotifications();
    
    // Cleanup on unmount
    return () => {
      notificationService.removeNotificationHandler(handleNewNotification);
    };
  }, [isAuthenticated, user?.id]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        fetchNotifications,
        isLoading
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextType {
  const context = useContext(NotificationContext);
  
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  
  return context;
}