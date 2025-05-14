import { AuthTokenStorage } from './auth';

export type NotificationEvent = {
  id: string;
  type: string;
  content: string;
  created_at: string;
  read: boolean;
  link?: string;
  actor?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  target?: {
    id: string;
    type: string;
    title?: string;
  };
};

export type WebSocketHandler = (event: NotificationEvent) => void;

/**
 * WebSocket service for real-time notifications
 */
export class WebSocketService {
  private socket: WebSocket | null = null;
  private handlers: WebSocketHandler[] = [];
  private connectionAttempts: number = 0;
  private maxConnectionAttempts: number = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private url: string;
  
  constructor() {
    const baseUrl = process.env.NEXT_PUBLIC_WS_URL || window.location.origin.replace(/^http/, 'ws');
    this.url = `${baseUrl}/api/notifications/ws`;
  }
  
  /**
   * Connect to the WebSocket server
   */
  connect(): void {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }
    
    // Get auth token
    const token = AuthTokenStorage.getToken();
    if (!token) {
      console.error('Cannot connect to WebSocket: No authentication token');
      return;
    }
    
    try {
      // Connect with auth token
      this.socket = new WebSocket(`${this.url}?token=${token}`);
      
      this.socket.onopen = () => {
        console.log('WebSocket connected');
        this.connectionAttempts = 0;
      };
      
      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as NotificationEvent;
          this.handlers.forEach(handler => handler(data));
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };
      
      this.socket.onclose = (event) => {
        console.log(`WebSocket disconnected: ${event.code} ${event.reason}`);
        
        // Try to reconnect if not a normal closure or auth issue
        if (event.code !== 1000 && event.code !== 1008) {
          this.reconnect();
        }
      };
      
      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      this.reconnect();
    }
  }
  
  /**
   * Disconnect from the WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }
  
  /**
   * Attempt to reconnect to the WebSocket server
   */
  private reconnect(): void {
    if (this.connectionAttempts >= this.maxConnectionAttempts) {
      console.error(`Maximum reconnection attempts (${this.maxConnectionAttempts}) reached`);
      return;
    }
    
    this.connectionAttempts++;
    
    const delay = Math.min(1000 * Math.pow(2, this.connectionAttempts), 30000);
    console.log(`Reconnecting to WebSocket in ${delay}ms (attempt ${this.connectionAttempts})`);
    
    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, delay);
  }
  
  /**
   * Add a notification handler
   */
  addNotificationHandler(handler: WebSocketHandler): void {
    this.handlers.push(handler);
  }
  
  /**
   * Remove a notification handler
   */
  removeNotificationHandler(handler: WebSocketHandler): void {
    this.handlers = this.handlers.filter(h => h !== handler);
  }
}

// Singleton instance
export const notificationService = new WebSocketService();