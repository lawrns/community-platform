/**
 * Repository Exports
 * Centralized exports for all repository classes
 */

import UserRepository from './UserRepository';
import ContentRepository from './ContentRepository';
import ToolRepository from './ToolRepository';
import TagRepository from './TagRepository';
import TopicRepository from './TopicRepository';
import WebAuthnCredentialRepository from './WebAuthnCredentialRepository';
import VoteRepository from './VoteRepository';
import { BadgeRepository } from './BadgeRepository';
import { ReputationRepository } from './ReputationRepository';
import { ModerationRepository, FlagRepository, AppealRepository } from './moderation';
import { DailyBriefRepository } from './DailyBriefRepository';

// Create singleton instances of repositories
const userRepository = new UserRepository();
const contentRepository = new ContentRepository();
const toolRepository = new ToolRepository();
const tagRepository = new TagRepository();
const topicRepository = new TopicRepository();
const badgeRepository = new BadgeRepository();
const reputationRepository = new ReputationRepository();
const webAuthnCredentialRepository = new WebAuthnCredentialRepository();
const voteRepository = new VoteRepository();
const moderationRepository = new ModerationRepository();
const flagRepository = new FlagRepository();
const appealRepository = new AppealRepository();
const dailyBriefRepository = new DailyBriefRepository();

// Update circular dependencies
// This is needed after repositories are initialized
setTimeout(() => {
  // Set up badgeRepository in ReputationRepository when needed
}, 0);

// Export repositories
export {
  userRepository,
  contentRepository,
  toolRepository,
  tagRepository,
  topicRepository,
  badgeRepository,
  reputationRepository,
  webAuthnCredentialRepository,
  voteRepository,
  moderationRepository,
  flagRepository,
  appealRepository,
  dailyBriefRepository
};

// Export repository classes for direct instantiation if needed
export {
  UserRepository,
  ContentRepository,
  ToolRepository,
  TagRepository,
  TopicRepository,
  BadgeRepository,
  ReputationRepository,
  WebAuthnCredentialRepository,
  VoteRepository,
  ModerationRepository,
  FlagRepository,
  AppealRepository,
  DailyBriefRepository
};