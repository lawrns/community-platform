/**
 * API Routes
 * Central router for all API endpoints
 */

import { Router } from 'express';
import authRoutes from './auth';
import tagRoutes from './tags';
import topicRoutes from './topics';
import contentRoutes from './content';
import toolRoutes from './tools';
import moderationRoutes from './moderation';
import userRoutes from './users';
import searchRoutes from './search';
import feedRoutes from './feed';
import votesRoutes from './votes';
import briefsRoutes from './briefs';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// Mount route modules
router.use('/auth', authRoutes);
router.use('/tags', tagRoutes);
router.use('/topics', topicRoutes);
router.use('/content', contentRoutes);
router.use('/tools', toolRoutes);
router.use('/moderation', moderationRoutes);

// Additional routes will be added as features are implemented
router.use('/users', userRoutes);
router.use('/search', searchRoutes);
router.use('/feed', feedRoutes);
router.use('/votes', votesRoutes);
router.use('/briefs', briefsRoutes);

export default router;