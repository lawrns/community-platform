/**
 * API Client
 * Frontend API client for communicating with the backend API
 * Includes WebAuthn authentication and Quadratic Voting endpoints
 */
import { AuthTokenStorage } from './auth';

/**
 * Base fetch function with error handling and authentication
 */
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const url = `${baseUrl}/api${endpoint}`;
  
  // Add auth token to headers if available
  const token = AuthTokenStorage.getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle authentication errors
  if (response.status === 401) {
    // Clear token on authentication failure
    AuthTokenStorage.removeToken();
    throw new Error('Authentication required. Please login again.');
  }

  if (!response.ok) {
    let errorMessage = 'An error occurred while fetching data';
    
    try {
      const error = await response.json();
      errorMessage = error.message || errorMessage;
    } catch (e) {
      // If parsing fails, use status text
      errorMessage = response.statusText || errorMessage;
    }
    
    throw new Error(errorMessage);
  }

  return await response.json();
}

/**
 * API client for interacting with the backend
 */
export const api = {
  // Generic methods
  get: async <T>(endpoint: string): Promise<T> => {
    return fetchAPI<T>(endpoint);
  },

  // Reputation endpoints
  reputation: {
    getReputation: async (userId: string) => {
      return fetchAPI<{
        points: number;
        tier: string;
        next_tier: string | null;
        points_to_next_tier: number | null;
      }>(`/users/${userId}/reputation`);
    },
    getBadges: async (userId: string) => {
      return fetchAPI<{ badges: any[] }>(`/users/${userId}/badges`);
    },
    getHistory: async (userId: string, params: { limit?: number } = {}) => {
      const query = params.limit ? `?limit=${params.limit}` : '';
      return fetchAPI<{ history: any[] }>(`/users/${userId}/reputation/history${query}`);
    },
    getPrivileges: async (userId: string) => {
      const res = await fetchAPI<{
        privileges: string[];
        thresholds: Record<string, number>;
      }>(`/users/${userId}/privileges`);
      return {
        privileges: res.privileges.map(priv => ({
          id: priv,
          name: priv.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          required_reputation: res.thresholds[priv]
        }))
      };
    },
  },
  
  post: async <T>(endpoint: string, data?: any): Promise<T> => {
    return fetchAPI<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    });
  },
  
  put: async <T>(endpoint: string, data?: any): Promise<T> => {
    return fetchAPI<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    });
  },
  
  delete: async <T>(endpoint: string): Promise<T> => {
    return fetchAPI<T>(endpoint, {
      method: 'DELETE'
    });
  },
  // Auth endpoints
  auth: {
    login: async (credentials: { email: string; password: string }) => {
      return fetchAPI<{ token: string; user: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
    },
    
    register: async (userData: { 
      email: string; 
      password: string;
      username: string;
      displayName?: string;
    }) => {
      return fetchAPI<{ token: string; user: any }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
    },
    
    verifyEmail: async (token: string) => {
      return fetchAPI<{ success: boolean }>(`/auth/verify-email/${token}`);
    },
    
    resetPassword: async (email: string) => {
      return fetchAPI<{ success: boolean }>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    },
    
    // WebAuthn endpoints
    getWebAuthnRegistrationOptions: async () => {
      return fetchAPI<{ success: boolean; options: any }>('/auth/webauthn/register-options', {
        method: 'POST'
      });
    },
    
    verifyWebAuthnRegistration: async (data: { response: any; credentialName?: string }) => {
      return fetchAPI<{ success: boolean; verified: boolean }>('/auth/webauthn/register-verification', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    
    getWebAuthnLoginOptions: async (data?: { username?: string }) => {
      return fetchAPI<{ success: boolean; options: any }>('/auth/webauthn/login-options', {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined
      });
    },
    
    verifyWebAuthnLogin: async (data: { response: any; username?: string }) => {
      return fetchAPI<{ success: boolean; verified: boolean; user: any; token: string }>('/auth/webauthn/login-verification', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    
    getWebAuthnCredentials: async () => {
      return fetchAPI<{ success: boolean; credentials: any[] }>('/auth/webauthn/credentials');
    },
    
    deleteWebAuthnCredential: async (credentialId: string) => {
      return fetchAPI<{ success: boolean; message: string }>(`/auth/webauthn/credentials/${credentialId}`, {
        method: 'DELETE'
      });
    },
    
    renameWebAuthnCredential: async (credentialId: string, name: string) => {
      return fetchAPI<{ success: boolean; message: string }>(`/auth/webauthn/credentials/${credentialId}`, {
        method: 'PUT',
        body: JSON.stringify({ name })
      });
    },
  },
  
  // User endpoints
  users: {
    getProfile: async (id: string) => {
      return fetchAPI<any>(`/users/${id}`);
    },
    
    updateProfile: async (id: string, data: any) => {
      return fetchAPI<any>(`/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
  },
  
  // Content endpoints
  content: {
    getContent: async (id: string) => {
      return fetchAPI<any>(`/content/${id}`);
    },
    
    createContent: async (data: any) => {
      return fetchAPI<any>('/content', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    
    updateContent: async (id: string, data: any) => {
      return fetchAPI<any>(`/content/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    
    listContent: async (params: { 
      page?: number;
      limit?: number;
      type?: string;
      tag?: string;
      search?: string;
    } = {}) => {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.type) queryParams.append('type', params.type);
      if (params.tag) queryParams.append('tag', params.tag);
      if (params.search) queryParams.append('search', params.search);
      
      const query = queryParams.toString();
      return fetchAPI<{ data: any[]; total: number; page: number; pageCount: number }>(`/content?${query}`);
    },
    
    getVersionHistory: async (id: string) => {
      return fetchAPI<{versions: {id: string, created_at: string, user_id: string, user_name: string}[]}>(`/content/${id}/history`);
    },
    
    getVersion: async (contentId: string, versionId: string) => {
      return fetchAPI<any>(`/content/${contentId}/history/${versionId}`);
    },
    
    restoreVersion: async (contentId: string, versionId: string) => {
      return fetchAPI<any>(`/content/${contentId}/history/${versionId}/restore`, {
        method: 'POST'
      });
    },
    
    uploadImage: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const url = `${baseUrl}/api/content/uploads`;
      
      // Add auth token to headers if available
      const token = AuthTokenStorage.getToken();
      const headers: HeadersInit = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }
      
      return response.json();
    },
    
    upvote: async (id: string) => {
      return fetchAPI<{success: boolean}>(`/content/${id}/upvote`, {
        method: 'POST'
      });
    },
    
    removeUpvote: async (id: string) => {
      return fetchAPI<{success: boolean}>(`/content/${id}/upvote`, {
        method: 'DELETE'
      });
    },
    
    acceptAnswer: async (questionId: string, answerId: string) => {
      return fetchAPI<{success: boolean}>(`/content/${questionId}/accept/${answerId}`, {
        method: 'POST'
      });
    },
  },
  
  // Tool directory endpoints
  tools: {
    getTool: async (id: string) => {
      return fetchAPI<any>(`/tools/${id}`);
    },
    
    listTools: async (params: {
      page?: number;
      limit?: number;
      category?: string;
      search?: string;
      sort?: string;
      recommended?: boolean;
      pricing?: string;
      min_rating?: number;
    } = {}) => {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.category) queryParams.append('category', params.category);
      if (params.search) queryParams.append('search', params.search);
      if (params.sort) queryParams.append('sort', params.sort);
      if (params.recommended) queryParams.append('recommended', 'true');
      if (params.pricing) queryParams.append('pricing', params.pricing);
      if (params.min_rating) queryParams.append('min_rating', params.min_rating.toString());
      
      const query = queryParams.toString();
      return fetchAPI<{ tools: any[]; total: number; page: number; pageCount: number }>(`/tools?${query}`);
    },
    
    createReview: async (toolId: string, data: any) => {
      return fetchAPI<any>(`/tools/${toolId}/reviews`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    
    getReviews: async (toolId: string, params: { page?: number; limit?: number; sort?: string; } = {}) => {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.sort) queryParams.append('sort', params.sort);
      
      const query = queryParams.toString();
      return fetchAPI<{ reviews: any[]; total: number; page: number; pageCount: number }>(`/tools/${toolId}/reviews?${query}`);
    },
    
    upvoteTool: async (toolId: string) => {
      return fetchAPI<{success: boolean}>(`/tools/${toolId}/upvote`, {
        method: 'POST'
      });
    },
    
    removeUpvote: async (toolId: string) => {
      return fetchAPI<{success: boolean}>(`/tools/${toolId}/upvote`, {
        method: 'DELETE'
      });
    },
    
    claimListing: async (toolId: string, data: any) => {
      return fetchAPI<{success: boolean, claim_id: string}>(`/tools/${toolId}/claim`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    
    getToolCategories: async () => {
      return fetchAPI<{categories: string[]}>('/tools/categories');
    }
  },
  
  // Quadratic Voting endpoints
  votes: {
    castVote: async (targetType: string, targetId: string, voteWeight: number, voteType: 1 | -1) => {
      return fetchAPI<any>(`/votes/${targetType}/${targetId}`, {
        method: 'POST',
        body: JSON.stringify({ voteWeight, voteType })
      });
    },
    
    removeVote: async (targetType: string, targetId: string) => {
      return fetchAPI<any>(`/votes/${targetType}/${targetId}`, {
        method: 'DELETE'
      });
    },
    
    getVote: async (targetType: string, targetId: string) => {
      return fetchAPI<any>(`/votes/${targetType}/${targetId}`);
    },
    
    getCredits: async () => {
      return fetchAPI<any>('/votes/credits');
    },
    
    getCreditHistory: async (params: { page?: number; limit?: number; } = {}) => {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      
      const query = queryParams.toString();
      return fetchAPI<any>(`/votes/credits/history${query ? `?${query}` : ''}`);
    },
    
    getUserVotes: async (params: { type?: string; page?: number; limit?: number; } = {}) => {
      const queryParams = new URLSearchParams();
      
      if (params.type) queryParams.append('type', params.type);
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      
      const query = queryParams.toString();
      return fetchAPI<any>(`/votes${query ? `?${query}` : ''}`);
    }
  },
  
  // Search endpoints
  search: {
    search: async (params: {
      query: string;
      page?: number;
      limit?: number;
      type?: string;
      tags?: string[];
      sort?: 'relevance' | 'date' | 'popularity';
      date_range?: string;
    }) => {
      const queryParams = new URLSearchParams();
      
      queryParams.append('q', params.query);
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.type) queryParams.append('type', params.type);
      if (params.tags) params.tags.forEach(tag => queryParams.append('tag', tag));
      if (params.sort) queryParams.append('sort', params.sort);
      if (params.date_range) queryParams.append('date_range', params.date_range);
      
      const query = queryParams.toString();
      return fetchAPI<{ 
        results: any[]; 
        total: number; 
        page: number; 
        pageCount: number;
        search_type: 'vector' | 'lexical' | 'hybrid';
      }>(`/search?${query}`);
    },
    
    getSuggestions: async (query: string) => {
      return fetchAPI<{suggestions: string[]}>(`/search/suggestions?q=${query}`);
    }
  },
  
  // Tag endpoints
  tags: {
    listTags: async () => {
      return fetchAPI<any[]>('/tags');
    },
    
    getSuggestions: async (partial: string) => {
      return fetchAPI<any[]>(`/tags/suggest?q=${partial}`);
    },
  },
  
  // Topic endpoints
  topics: {
    listTopics: async () => {
      return fetchAPI<any[]>('/topics');
    },
    
    getTopic: async (id: string) => {
      return fetchAPI<any>(`/topics/${id}`);
    },
    
    getPopular: async (limit: number = 5) => {
      return fetchAPI<{ topics: any[] }>(`/topics/popular?limit=${limit}`);
    },
    
    getHierarchy: async () => {
      return fetchAPI<{ hierarchy: any[] }>('/topics/hierarchy');
    },
    
    followTopic: async (id: string) => {
      return fetchAPI<{ success: boolean }>(`/topics/${id}/follow`, {
        method: 'POST'
      });
    },
    
    unfollowTopic: async (id: string) => {
      return fetchAPI<{ success: boolean }>(`/topics/${id}/follow`, {
        method: 'DELETE'
      });
    }
  },
  
  // Notification endpoints
  notifications: {
    getNotifications: async (params: { 
      unread_only?: boolean;
      page?: number;
      limit?: number;
      type?: string;
    } = {}) => {
      const queryParams = new URLSearchParams();
      
      if (params.unread_only) queryParams.append('unread_only', 'true');
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.type) queryParams.append('type', params.type);
      
      const query = queryParams.toString();
      return fetchAPI<{ 
        notifications: any[]; 
        total: number; 
        unread_count: number;
      }>(`/users/notifications?${query}`);
    },
    
    markAsRead: async (id: string) => {
      return fetchAPI<{ success: boolean }>(`/users/notifications/${id}/read`, {
        method: 'POST'
      });
    },
    
    markAllAsRead: async () => {
      return fetchAPI<{ success: boolean }>('/users/notifications/read-all', {
        method: 'POST'
      });
    },
    
    getPreferences: async () => {
      return fetchAPI<{ preferences: any }>('/users/notifications/preferences');
    },
    
    updatePreferences: async (preferences: any) => {
      return fetchAPI<{ success: boolean }>('/users/notifications/preferences', {
        method: 'PUT',
        body: JSON.stringify(preferences)
      });
    },
    
    recordView: async (contentId: string) => {
      return fetchAPI<{ success: boolean }>(`/feed/view/${contentId}`, {
        method: 'POST'
      });
    }
  },
  
  // Reputation and badges
  reputation: {
    getReputation: async (userId: string) => {
      return fetchAPI<{ 
        points: number;
        tier: string;
        next_tier: string | null;
        points_to_next_tier: number | null;
      }>(`/users/${userId}/reputation`);
    },
    
    getHistory: async (userId: string, params: { 
      page?: number;
      limit?: number;
    } = {}) => {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      
      const query = queryParams.toString();
      return fetchAPI<{ 
        history: any[];
        total: number;
      }>(`/users/${userId}/reputation/history?${query}`);
    },
    
    getBadges: async (userId: string) => {
      return fetchAPI<{ badges: any[] }>(`/users/${userId}/badges`);
    },
    
    getPrivileges: async () => {
      return fetchAPI<{ privileges: any[] }>('/users/privileges');
    }
  },
  
  // Feed endpoints
  feed: {
    getPersonalized: async (params: { limit?: number; offset?: number } = {}) => {
      const queryParams = new URLSearchParams();
      
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.offset) queryParams.append('offset', params.offset.toString());
      
      const query = queryParams.toString();
      return fetchAPI<{ 
        success: boolean;
        recommendations: any[];
      }>(`/feed?${query}`);
    },
    
    getTrending: async (params: { limit?: number; offset?: number } = {}) => {
      const queryParams = new URLSearchParams();
      
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.offset) queryParams.append('offset', params.offset.toString());
      
      const query = queryParams.toString();
      return fetchAPI<{ 
        success: boolean;
        content: any[];
      }>(`/feed/trending?${query}`);
    },
    
    getFollowing: async (params: { limit?: number; offset?: number } = {}) => {
      const queryParams = new URLSearchParams();
      
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.offset) queryParams.append('offset', params.offset.toString());
      
      const query = queryParams.toString();
      return fetchAPI<{ 
        success: boolean;
        content: any[];
      }>(`/feed/following?${query}`);
    },
    
    getUserInterests: async (userId: string) => {
      return fetchAPI<{ interests: string[] }>(`/users/${userId}/interests`);
    },
    
    updateUserInterests: async (userId: string, interests: string[]) => {
      return fetchAPI<{ success: boolean }>(`/users/${userId}/interests`, {
        method: 'PUT',
        body: JSON.stringify({ interests })
      });
    }
  },
  
  // Daily Briefs endpoints
  briefs: {
    getLatest: async () => {
      return fetchAPI<{
        success: boolean;
        brief: any;
        items: any[];
      }>('/briefs/latest');
    },
    
    getBrief: async (briefId: string) => {
      return fetchAPI<{
        success: boolean;
        brief: any;
        items: any[];
      }>(`/briefs/${briefId}`);
    },
    
    generateBrief: async () => {
      return fetchAPI<{
        success: boolean;
        brief: any;
        message: string;
      }>('/briefs/generate', {
        method: 'POST'
      });
    },
    
    markAsRead: async (briefId: string) => {
      return fetchAPI<{
        success: boolean;
        message: string;
      }>(`/briefs/${briefId}/read`, {
        method: 'POST'
      });
    },
    
    recordItemInteraction: async (itemId: string, interaction: 'click' | 'save' | 'share' | 'dismiss') => {
      return fetchAPI<{
        success: boolean;
        message: string;
      }>(`/briefs/items/${itemId}/interact`, {
        method: 'POST',
        body: JSON.stringify({ interaction })
      });
    },
    
    getPreferences: async () => {
      return fetchAPI<{
        success: boolean;
        preferences: any;
      }>('/briefs/preferences');
    },
    
    updatePreferences: async (preferences: any) => {
      return fetchAPI<{
        success: boolean;
        preferences: any;
        message: string;
      }>('/briefs/preferences', {
        method: 'PUT',
        body: JSON.stringify(preferences)
      });
    },
    
    getHistory: async (params: { 
      limit?: number; 
      offset?: number; 
      includeExpired?: boolean 
    } = {}) => {
      const queryParams = new URLSearchParams();
      
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.offset) queryParams.append('offset', params.offset.toString());
      if (params.includeExpired) queryParams.append('includeExpired', params.includeExpired.toString());
      
      const query = queryParams.toString();
      return fetchAPI<{
        success: boolean;
        briefs: any[];
        meta: {
          count: number;
          limit: number;
          offset: number;
        }
      }>(`/briefs/history?${query}`);
    }
  },
};