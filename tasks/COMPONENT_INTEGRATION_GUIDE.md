# Component Integration Guide

This guide provides detailed instructions for connecting frontend components to backend APIs in the Community Platform project.

## Table of Contents

1. [Common Integration Patterns](#common-integration-patterns)
2. [API Service Layer](#api-service-layer)
3. [Component Integration Examples](#component-integration-examples)
4. [Error Handling](#error-handling)
5. [Authentication](#authentication)
6. [WebSocket Integration](#websocket-integration)
7. [Testing Integration](#testing-integration)

## Common Integration Patterns

When integrating frontend components with backend APIs, follow these common patterns:

### Loading State Pattern

```tsx
const MyComponent = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await api.getData();
        setData(response.data);
      } catch (err) {
        setError(err.message || 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorMessage message={error} />;
  if (!data || data.length === 0) return <EmptyState />;

  return (
    <div>
      {/* Render data */}
    </div>
  );
};
```

### Form Submission Pattern

```tsx
const FormComponent = () => {
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError(null);
      await api.submitData(formData);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </Button>
      {error && <ErrorMessage message={error} />}
      {success && <SuccessMessage />}
    </form>
  );
};
```

### Pagination Pattern

```tsx
const PaginatedList = () => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const loadMore = async () => {
    if (isLoading || !hasMore) return;
    
    try {
      setIsLoading(true);
      const response = await api.getItems({ page, limit: 10 });
      
      if (response.data.length < 10) {
        setHasMore(false);
      }
      
      setItems(prev => [...prev, ...response.data]);
      setPage(prev => prev + 1);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="items-container">
        {items.map(item => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
      
      {hasMore && (
        <Button onClick={loadMore} disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Load More'}
        </Button>
      )}
    </div>
  );
};
```

## API Service Layer

All API calls should go through the service layer in `/frontend/lib/api.ts` to ensure consistent error handling and authentication.

### Example API Service Function

```typescript
// /frontend/lib/api.ts

// Create a base axios instance with common configuration
const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add authentication interceptor
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for common error handling
apiClient.interceptors.response.use(
  response => response,
  error => {
    // Handle common errors (401, 403, 500, etc.)
    if (error.response?.status === 401) {
      // Handle unauthorized
    }
    return Promise.reject(error);
  }
);

// Example service function
export const getContentById = async (id) => {
  try {
    const response = await apiClient.get(`/content/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching content ${id}:`, error);
    throw error;
  }
};
```

## Component Integration Examples

### Content Editor Integration

```tsx
// components/editor/Editor.tsx

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { api } from '@/lib/api';

const Editor = ({ contentId }) => {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Load content if editing existing content
  useEffect(() => {
    if (!contentId) return;

    const loadContent = async () => {
      try {
        setIsLoading(true);
        const data = await api.getContentById(contentId);
        setContent(data.content);
      } catch (err) {
        setError('Failed to load content');
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, [contentId]);

  // Handle content save
  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);

      if (contentId) {
        await api.updateContent(contentId, { content });
      } else {
        const result = await api.createContent({ content });
        router.push(`/view/${result.id}`);
      }
    } catch (err) {
      setError('Failed to save content');
    } finally {
      setIsSaving(false);
    }
  };

  // Setup autosave
  useEffect(() => {
    let autosaveTimer;
    
    if (contentId && content) {
      autosaveTimer = setInterval(() => {
        api.updateContent(contentId, { content })
          .catch(err => console.error('Autosave failed:', err));
      }, 20000); // Autosave every 20 seconds
    }
    
    return () => {
      if (autosaveTimer) clearInterval(autosaveTimer);
    };
  }, [contentId, content]);

  // ... rest of component
};
```

### Search Integration

```tsx
// components/search/SearchResults.tsx

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { api } from '@/lib/api';

const SearchResults = () => {
  const router = useRouter();
  const { q, type, tag } = router.query;
  
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (!q) return;
    
    const fetchResults = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await api.searchContent({
          query: q,
          filters: {
            type: type || undefined,
            tag: tag || undefined
          }
        });
        
        setResults(response.data);
      } catch (err) {
        setError('Search failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchResults();
  }, [q, type, tag]);
  
  // ... render results
};
```

## Error Handling

Implement consistent error handling across all components:

```tsx
// components/common/ErrorBoundary.tsx

import { Component } from 'react';

class ErrorBoundary extends Component {
  state = {
    hasError: false,
    error: null
  };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Component error:', error, errorInfo);
    // Optional: log to error tracking service
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <h2>Something went wrong</h2>
          <p>Please try again or contact support if the problem persists.</p>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}

// Usage
const SafeComponent = () => (
  <ErrorBoundary>
    <MyComponent />
  </ErrorBoundary>
);
```

## Authentication

Ensure all authenticated API calls include proper authentication:

```tsx
// components/auth/AuthContext.tsx

import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/lib/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          setUser(null);
          return;
        }
        
        const response = await api.getCurrentUser();
        setUser(response.data);
      } catch (err) {
        // Handle auth error, possibly clear token
        localStorage.removeItem('auth_token');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  const login = async (credentials) => {
    const response = await api.login(credentials);
    localStorage.setItem('auth_token', response.data.token);
    setUser(response.data.user);
    return response.data.user;
  };
  
  const logout = async () => {
    await api.logout();
    localStorage.removeItem('auth_token');
    setUser(null);
  };
  
  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

## WebSocket Integration

For real-time features like notifications:

```tsx
// components/notifications/NotificationProvider.tsx

import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '@/components/auth/AuthContext';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Connect to WebSocket when user is authenticated
  useEffect(() => {
    if (!user) return;
    
    const token = localStorage.getItem('auth_token');
    const newSocket = io('/notifications', {
      auth: {
        token
      }
    });
    
    newSocket.on('connect', () => {
      console.log('WebSocket connected');
    });
    
    newSocket.on('notification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });
    
    setSocket(newSocket);
    
    return () => {
      newSocket.disconnect();
    };
  }, [user]);
  
  // Load initial notifications
  useEffect(() => {
    if (!user) return;
    
    const fetchNotifications = async () => {
      try {
        const response = await api.getNotifications({ limit: 10 });
        setNotifications(response.data.notifications);
        setUnreadCount(response.data.unreadCount);
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      }
    };
    
    fetchNotifications();
  }, [user]);
  
  const markAsRead = async (notificationId) => {
    try {
      await api.markNotificationAsRead(notificationId);
      
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };
  
  const markAllAsRead = async () => {
    try {
      await api.markAllNotificationsAsRead();
      
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
      
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };
  
  return (
    <NotificationContext.Provider 
      value={{ 
        notifications, 
        unreadCount, 
        markAsRead, 
        markAllAsRead 
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
```

## Testing Integration

Examples of testing API integration:

```javascript
// __tests__/components/Editor.test.jsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Editor from '@/components/editor/Editor';
import { api } from '@/lib/api';

// Mock the API
jest.mock('@/lib/api', () => ({
  getContentById: jest.fn(),
  updateContent: jest.fn(),
  createContent: jest.fn()
}));

describe('Editor Component Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('loads content when editing existing content', async () => {
    api.getContentById.mockResolvedValue({
      id: '123',
      content: 'Test content'
    });
    
    render(<Editor contentId="123" />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(api.getContentById).toHaveBeenCalledWith('123');
      expect(screen.getByText('Test content')).toBeInTheDocument();
    });
  });
  
  test('saves content when save button is clicked', async () => {
    api.createContent.mockResolvedValue({ id: '456' });
    
    render(<Editor />);
    
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'New content' }
    });
    
    fireEvent.click(screen.getByText('Save'));
    
    expect(screen.getByText('Saving...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(api.createContent).toHaveBeenCalledWith({
        content: 'New content'
      });
    });
  });
  
  test('shows error message when save fails', async () => {
    api.createContent.mockRejectedValue(new Error('Save failed'));
    
    render(<Editor />);
    
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Content that will fail' }
    });
    
    fireEvent.click(screen.getByText('Save'));
    
    await waitFor(() => {
      expect(screen.getByText('Failed to save content')).toBeInTheDocument();
    });
  });
});
```