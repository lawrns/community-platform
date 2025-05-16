/**
 * Repository Exports
 * Centralized exports for all repository classes
 */

import UserRepository from './UserRepository';
import ContentRepository from './ContentRepository';
import ToolRepository from './ToolRepository';
import TagRepository from './TagRepository';
import TopicRepository from './TopicRepository';
import { BadgeRepository } from './BadgeRepository';
import { ReputationRepository } from './ReputationRepository';
import { ModerationRepository, FlagRepository, AppealRepository } from './moderation';

// Create singleton instances of repositories
const userRepository = new UserRepository();
const contentRepository = new ContentRepository();
const toolRepository = new ToolRepository();
const tagRepository = new TagRepository();
const topicRepository = new TopicRepository();
const badgeRepository = new BadgeRepository();
const reputationRepository = new ReputationRepository();
const moderationRepository = new ModerationRepository();
const flagRepository = new FlagRepository();
const appealRepository = new AppealRepository();

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
  moderationRepository,
  flagRepository,
  appealRepository
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
  ModerationRepository,
  FlagRepository,
  AppealRepository
};