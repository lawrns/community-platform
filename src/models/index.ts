/**
 * Database Models
 * Type definitions for database entities
 */

// WebAuthn credential model
export interface WebAuthnCredential {
  id?: number;
  user_id: number;
  credential_id: string;
  public_key: string;
  counter: number;
  credential_device_type: string;
  credential_backed_up: boolean;
  transports?: string[];
  name?: string;
  created_at: Date;
  last_used_at?: Date;
}

// Moderation related enums
export enum FlagReason {
  SPAM = 'spam',
  HARASSMENT = 'harassment',
  VIOLENCE = 'violence',
  HATE_SPEECH = 'hate_speech',
  MISINFORMATION = 'misinformation',
  COPYRIGHT = 'copyright',
  ADULT_CONTENT = 'adult_content',
  OTHER = 'other'
}

export enum FlagStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  APPEALED = 'appealed'
}

export enum FlagType {
  CONTENT = 'content',
  TOOL = 'tool',
  REVIEW = 'review',
  COMMENT = 'comment',
  USER = 'user'
}

export enum ModerationActionType {
  HIDE = 'hide',
  UNHIDE = 'unhide',
  DELETE = 'delete',
  UNDELETE = 'undelete',
  WARN = 'warn',
  SUSPEND = 'suspend',
  UNSUSPEND = 'unsuspend'
}

export enum ModerationActionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  REVERTED = 'reverted'
}

export enum AppealStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

// Flag model (for user reports)
export interface Flag {
  id: number;
  type: FlagType;
  reason: FlagReason;
  description?: string;
  content_id?: number;
  tool_id?: number;
  review_id?: number;
  comment_id?: number;
  user_id?: number;
  reporter_id: number;
  status: FlagStatus;
  created_at: Date;
  updated_at: Date;
}

// Moderation action model
export interface ModerationAction {
  id: number;
  action_type: ModerationActionType;
  moderator_id: number;
  content_id?: number;
  tool_id?: number;
  review_id?: number;
  comment_id?: number;
  user_id?: number;
  flag_id?: number;
  reason?: string;
  status: ModerationActionStatus;
  ai_detected: boolean;
  ai_score?: number;
  ai_reason?: string;
  metadata?: any;
  created_at: Date;
  updated_at: Date;
  reverted_at?: Date;
  reverted_by_id?: number;
}

// Appeal model
export interface Appeal {
  id: number;
  moderation_action_id: number;
  user_id: number;
  reason: string;
  status: AppealStatus;
  moderator_id?: number;
  moderator_notes?: string;
  created_at: Date;
  updated_at: Date;
  resolved_at?: Date;
}

// User model
export interface User {
  id: number;
  email: string;
  username: string;
  name: string;
  avatar_url?: string;
  bio?: string;
  reputation: number;
  email_verified: boolean;
  auth_provider?: string;
  auth_provider_id?: string;
  password_hash?: string;
  webauthn_enabled?: boolean;
  created_at: Date;
  updated_at: Date;
  // Virtual properties for admin status
  isAdmin?: boolean;
  isModerator?: boolean;
}

// Topic model (hierarchical categories)
export interface Topic {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parent_id?: number;
  parent?: Topic;
  children?: Topic[];
  created_at: Date;
  updated_at: Date;
}

// Tag model (user-defined tags)
export interface Tag {
  id: number;
  name: string;
  slug: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

// Content type enum
export enum ContentType {
  QUESTION = 'question',
  ANSWER = 'answer',
  POST = 'post',
  COMMENT = 'comment',
  TUTORIAL = 'tutorial',
}

// Content status enum
export enum ContentStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  DELETED = 'deleted',
  HIDDEN = 'hidden',
}

// Content model
export interface Content {
  id: number;
  type: ContentType;
  title?: string;
  body: string;
  body_html: string;
  body_vector?: any; // Vector type for pgvector
  author_id: number;
  author?: User;
  parent_id?: number;
  parent?: Content;
  is_accepted: boolean;
  upvotes: number;
  downvotes: number;
  views: number;
  status: ContentStatus;
  tags?: Tag[];
  topics?: Topic[];
  created_at: Date;
  updated_at: Date;
}

// Content version for tracking edit history
export interface ContentVersion {
  id: number;
  content_id: number;
  version: number;
  title?: string;
  body: string;
  body_html: string;
  editor_id: number;
  editor?: User;
  edit_comment?: string;
  created_at: Date;
}

// Tool status enum
export enum ToolStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  HIDDEN = 'hidden',
  DELETED = 'deleted',
}

// Tool model
export interface Tool {
  id: number;
  name: string;
  slug: string;
  description: string;
  description_vector?: any; // Vector type for pgvector
  website_url?: string;
  logo_url?: string;
  pricing_info: any; // JSON object
  features: any; // JSON object
  is_verified: boolean;
  vendor_id?: number;
  vendor?: User;
  upvotes: number;
  status: ToolStatus;
  tags?: Tag[];
  reviews?: ToolReview[];
  created_at: Date;
  updated_at: Date;
}

// Tool review status enum
export enum ReviewStatus {
  PUBLISHED = 'published',
  HIDDEN = 'hidden',
  FLAGGED = 'flagged',
}

// Tool review model
export interface ToolReview {
  id: number;
  tool_id: number;
  tool?: Tool;
  user_id: number;
  user?: User;
  rating: number;
  title?: string;
  content: string;
  upvotes: number;
  status: ReviewStatus;
  created_at: Date;
  updated_at: Date;
}

// Badge level enum
export enum BadgeLevel {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
}

// Badge model
export interface Badge {
  id: number;
  name: string;
  description: string;
  icon_url?: string;
  level: BadgeLevel;
  created_at: Date;
}

// User badge junction model
export interface UserBadge {
  user_id: number;
  user?: User;
  badge_id: number;
  badge?: Badge;
  awarded_at: Date;
}

// Notification model
export interface Notification {
  id: number;
  user_id: number;
  user?: User;
  type: string;
  content: any; // JSON object
  is_read: boolean;
  created_at: Date;
}

// User settings model
export interface UserSettings {
  user_id: number;
  user?: User;
  notification_preferences: any; // JSON object
  ui_preferences: any; // JSON object
  created_at: Date;
  updated_at: Date;
}

// Vote type enum
export enum VoteType {
  UPVOTE = 1,
  DOWNVOTE = -1,
}

// User vote model
export interface UserVote {
  user_id: number;
  user?: User;
  content_id?: number;
  content?: Content;
  tool_id?: number;
  tool?: Tool;
  review_id?: number;
  review?: ToolReview;
  vote_type: VoteType;
  vote_weight: number;
  credits_spent: number;
  created_at: Date;
  updated_at: Date;
}

// Vote credits model
export interface VoteCredits {
  user_id: number;
  available_credits: number;
  total_earned_credits: number;
  last_credit_refresh: Date;
  created_at: Date;
  updated_at: Date;
}

// Vote credit transaction model
export interface VoteCreditTransaction {
  id: number;
  user_id: number;
  credits_change: number;
  reason: string;
  content_id?: number;
  tool_id?: number;
  review_id?: number;
  created_at: Date;
}

// Reputation history model
export interface ReputationHistory {
  id: number;
  user_id: number;
  user?: User;
  change: number;
  reason: string;
  content_id?: number;
  content?: Content;
  created_at: Date;
}

// Daily Brief Types
export interface DailyBrief {
  id: string;
  user_id: string;
  title: string;
  summary: string;
  generated_at: Date;
  read_at?: Date;
  expired_at: Date;
  metadata?: Record<string, any>;
}

export interface BriefItem {
  id: string;
  brief_id: string;
  content_type: string;
  content_id: string;
  title: string;
  summary: string;
  relevance_score: number;
  position: number;
  metadata?: Record<string, any>;
}

export interface BriefInteraction {
  id: string;
  brief_id: string;
  item_id?: string;
  user_id: string;
  interaction_type: 'view' | 'click' | 'save' | 'share' | 'dismiss';
  created_at: Date;
  metadata?: Record<string, any>;
}

export interface UserBriefPreferences {
  user_id: string;
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  content_types: string[];
  preferred_time: string;
  preferred_timezone: string;
  max_items: number;
  email_delivery: boolean;
  last_updated: Date;
}