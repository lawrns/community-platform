import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export interface Notification {
  id: string;
  user_id: string;
  content: string;
  type: string;
  read: boolean;
  created_at: string;
  source_id?: string;
  source_type?: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await api.get<Notification[]>('/api/users/notifications');
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch notifications'));
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await api.put(`/api/users/notifications/${notificationId}/read`);
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to mark notification as read'));
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/api/users/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to mark all notifications as read'));
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // Setup WebSocket connection for real-time notifications only in browser environment
    if (typeof window !== 'undefined') {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${wsProtocol}//${window.location.host}/ws/notifications`;
      
      let socket: WebSocket;
      try {
        socket = new WebSocket(wsUrl);
        
        socket.onopen = () => {
          console.log('WebSocket connection established for notifications');
        };
        
        socket.onmessage = (event) => {
          const notification = JSON.parse(event.data) as Notification;
          setNotifications(prev => [notification, ...prev]);
          setUnreadCount(prev => prev + 1);
        };
        
        socket.onerror = (error) => {
          console.error('WebSocket error:', error);
        };
        
        return () => {
          socket.close();
        };
      } catch (err) {
        console.error('Failed to establish WebSocket connection:', err);
      }
    }
    
    // Return empty cleanup function if not in browser environment
    return () => {};
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
}