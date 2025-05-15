// Type definitions for frontend components and API responses

// Auth types
export interface User {
  id: string;
  email: string;
  username: string;
  displayName?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  bio?: string;
  location?: string;
  website?: string;
  reputation_points?: number;
  role?: 'user' | 'moderator' | 'admin';
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

// Content types
export interface Content {
  id: string;
  title: string;
  content: string;
  type: 'article' | 'question' | 'answer' | 'tool';
  created_at: string;
  updated_at: string;
  user_id: string;
  user_name?: string;
  user_avatar?: string;
  tags?: string[];
  upvotes?: number;
  views?: number;
  status?: 'draft' | 'published' | 'hidden';
}

export interface ContentVersion {
  id: string;
  content_id: string;
  content: string;
  version: number;
  created_at: string;
  updated_by: string;
}

// Tool types
export interface Tool {
  id: string;
  name: string;
  slug: string;
  description: string;
  website_url?: string;
  logo_url?: string;
  pricing_info?: {
    type?: 'Free' | 'Freemium' | 'Paid' | 'Subscription';
    plans?: Array<{
      name: string;
      price: string;
      features: string[];
      is_popular?: boolean;
    }>;
  };
  features?: {
    key_features?: string[];
    use_cases?: string[];
    platform?: string[];
    integrations?: string[];
  };
  is_verified: boolean;
  vendor_id?: string;
  vendor_name?: string;
  upvotes: number;
  rating?: number;
  reviews_count?: number;
  status: 'active' | 'pending' | 'hidden' | 'deleted';
  created_at: string;
  updated_at: string;
  tags?: string[];
  primary_tag?: string;
}

export interface ToolReview {
  id: string;
  tool_id: string;
  user_id: string;
  user_name?: string;
  rating: number;
  title?: string;
  content: string;
  upvotes?: number;
  status?: 'published' | 'hidden' | 'flagged';
  created_at?: string;
  updated_at?: string;
}

export interface ToolClaim {
  id: string;
  tool_id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected';
  proof?: string;
  created_at: string;
  updated_at: string;
}

// Search types
export interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'question' | 'answer' | 'tool' | 'user' | 'topic';
  url: string;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    name: string;
    avatar?: string;
  };
  tags?: string[];
  score?: number;
}

export interface SearchParams {
  query: string;
  type?: string;
  tags?: string[];
  sort?: 'relevance' | 'newest' | 'popular';
  dateRange?: 'all' | 'day' | 'week' | 'month' | 'year';
  page?: number;
  limit?: number;
}

// Notification types
export interface Notification {
  id: string;
  type: 'mention' | 'comment' | 'upvote' | 'answer' | 'follow' | 'system' | 'badge';
  content: string;
  link?: string;
  timestamp: string;
  read: boolean;
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
}

// Reputation types
export interface ReputationActivity {
  id: string;
  user_id: string;
  action: 'question' | 'answer' | 'comment' | 'upvote_received' | 'downvote_received' | 'accepted_answer' | 'bounty';
  points: number;
  content_id?: string;
  content_type?: string;
  created_at: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  category: 'bronze' | 'silver' | 'gold';
  icon_url?: string;
  requirements?: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  badge?: Badge;
}

// Tag types
export interface Tag {
  id: string;
  name: string;
  description?: string;
  count?: number;
  created_at?: string;
  updated_at?: string;
}

// Topic types
export interface Topic {
  id: string;
  name: string;
  description?: string;
  parent_id?: string;
  icon_url?: string;
  level: number;
  count?: number;
  children?: Topic[];
}

// Pagination and API response types
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  meta?: any;
}