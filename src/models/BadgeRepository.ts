import { Database } from '../config/database';
import { supabase } from '../config/supabase';
import { Badge, BadgeLevel, UserBadge } from './index';
import { Repository } from './Repository';

/**
 * Repository for managing badges and user badges
 */
export class BadgeRepository extends Repository {
  /**
   * Create a new badge
   */
  async createBadge(badge: Omit<Badge, 'id' | 'created_at'>): Promise<Badge> {
    try {
      if (this.useSupabase) {
        const { data, error } = await supabase
          .from('badges')
          .insert(badge)
          .select('*')
          .single();

        if (error) throw error;
        return data as Badge;
      } else {
        const result = await this.db.query(
          `INSERT INTO badges (name, description, icon_url, level)
           VALUES ($1, $2, $3, $4)
           RETURNING *`,
          [badge.name, badge.description, badge.icon_url, badge.level]
        );
        return result.rows[0];
      }
    } catch (error) {
      this.handleError('Error creating badge', error);
    }
  }

  /**
   * Get all badges
   */
  async getAllBadges(): Promise<Badge[]> {
    try {
      if (this.useSupabase) {
        const { data, error } = await supabase
          .from('badges')
          .select('*')
          .order('level', { ascending: false });

        if (error) throw error;
        return data as Badge[];
      } else {
        const result = await this.db.query(
          `SELECT * FROM badges ORDER BY 
          CASE 
            WHEN level = 'GOLD' THEN 1
            WHEN level = 'SILVER' THEN 2
            WHEN level = 'BRONZE' THEN 3
            ELSE 4
          END`
        );
        return result.rows;
      }
    } catch (error) {
      this.handleError('Error getting badges', error);
    }
  }

  /**
   * Get a badge by ID
   */
  async getBadgeById(badgeId: number): Promise<Badge | null> {
    try {
      if (this.useSupabase) {
        const { data, error } = await supabase
          .from('badges')
          .select('*')
          .eq('id', badgeId)
          .single();

        if (error) throw error;
        return data as Badge;
      } else {
        const result = await this.db.query(
          'SELECT * FROM badges WHERE id = $1',
          [badgeId]
        );
        return result.rows.length ? result.rows[0] : null;
      }
    } catch (error) {
      this.handleError('Error getting badge by ID', error);
    }
  }

  /**
   * Award a badge to a user
   */
  async awardBadge(userId: number, badgeId: number): Promise<UserBadge> {
    try {
      // Check if user already has this badge
      const existingBadge = await this.getUserBadge(userId, badgeId);
      if (existingBadge) {
        return existingBadge;
      }

      if (this.useSupabase) {
        const { data, error } = await supabase
          .from('user_badges')
          .insert({
            user_id: userId,
            badge_id: badgeId,
          })
          .select('*')
          .single();

        if (error) throw error;
        return data as UserBadge;
      } else {
        const result = await this.db.query(
          `INSERT INTO user_badges (user_id, badge_id)
           VALUES ($1, $2)
           RETURNING *`,
          [userId, badgeId]
        );
        return result.rows[0];
      }
    } catch (error) {
      this.handleError('Error awarding badge', error);
    }
  }

  /**
   * Get a specific user badge
   */
  async getUserBadge(userId: number, badgeId: number): Promise<UserBadge | null> {
    try {
      if (this.useSupabase) {
        const { data, error } = await supabase
          .from('user_badges')
          .select('*')
          .eq('user_id', userId)
          .eq('badge_id', badgeId)
          .single();

        if (error && error.code !== 'PGRST116') throw error; // Ignore not found error
        return data as UserBadge || null;
      } else {
        const result = await this.db.query(
          'SELECT * FROM user_badges WHERE user_id = $1 AND badge_id = $2',
          [userId, badgeId]
        );
        return result.rows.length ? result.rows[0] : null;
      }
    } catch (error) {
      this.handleError('Error getting user badge', error);
    }
  }

  /**
   * Get all badges for a user
   */
  async getUserBadges(userId: number): Promise<(Badge & { awarded_at: string })[]> {
    try {
      if (this.useSupabase) {
        const { data, error } = await supabase
          .from('user_badges')
          .select(`
            badge_id,
            awarded_at,
            badges (*)
          `)
          .eq('user_id', userId);

        if (error) throw error;
        
        return data.map(item => ({
          ...item.badges,
          awarded_at: item.awarded_at
        }));
      } else {
        const result = await this.db.query(
          `SELECT b.*, ub.awarded_at 
           FROM badges b
           JOIN user_badges ub ON b.id = ub.badge_id
           WHERE ub.user_id = $1
           ORDER BY ub.awarded_at DESC`,
          [userId]
        );
        return result.rows;
      }
    } catch (error) {
      this.handleError('Error getting user badges', error);
    }
  }

  /**
   * Check if a user qualifies for a badge and award it if they do
   * @returns boolean indicating if badge was awarded
   */
  async checkAndAwardBadge(userId: number, badgeKey: string): Promise<boolean> {
    try {
      // Map badge keys to their IDs and requirements
      const badgeMap = {
        'welcome': {
          id: 1,
          check: async () => {
            // Check if user has completed their profile
            const query = `
              SELECT * FROM users 
              WHERE id = $1 AND avatar_url IS NOT NULL AND bio IS NOT NULL AND name IS NOT NULL
            `;
            const result = await this.db.query(query, [userId]);
            return result.rows.length > 0;
          }
        },
        'first_post': {
          id: 2,
          check: async () => {
            // Check if user has at least one post
            const query = `
              SELECT COUNT(*) FROM content 
              WHERE author_id = $1 AND type = 'post'
            `;
            const result = await this.db.query(query, [userId]);
            return parseInt(result.rows[0].count) > 0;
          }
        },
        'first_answer': {
          id: 3,
          check: async () => {
            // Check if user has at least one answer
            const query = `
              SELECT COUNT(*) FROM content 
              WHERE author_id = $1 AND type = 'answer'
            `;
            const result = await this.db.query(query, [userId]);
            return parseInt(result.rows[0].count) > 0;
          }
        },
        'first_question': {
          id: 4,
          check: async () => {
            // Check if user has at least one question
            const query = `
              SELECT COUNT(*) FROM content 
              WHERE author_id = $1 AND type = 'question'
            `;
            const result = await this.db.query(query, [userId]);
            return parseInt(result.rows[0].count) > 0;
          }
        },
        'helpful': {
          id: 5,
          check: async () => {
            // Check if user has at least one accepted answer
            const query = `
              SELECT COUNT(*) FROM content 
              WHERE author_id = $1 AND type = 'answer' AND is_accepted = true
            `;
            const result = await this.db.query(query, [userId]);
            return parseInt(result.rows[0].count) > 0;
          }
        },
        'popular_post': {
          id: 6,
          check: async () => {
            // Check if user has a post with at least 10 upvotes
            const query = `
              SELECT COUNT(*) FROM content 
              WHERE author_id = $1 AND (type = 'post' OR type = 'question') AND upvotes >= 10
            `;
            const result = await this.db.query(query, [userId]);
            return parseInt(result.rows[0].count) > 0;
          }
        },
        'valuable_answer': {
          id: 7,
          check: async () => {
            // Check if user has an answer with at least 10 upvotes
            const query = `
              SELECT COUNT(*) FROM content 
              WHERE author_id = $1 AND type = 'answer' AND upvotes >= 10
            `;
            const result = await this.db.query(query, [userId]);
            return parseInt(result.rows[0].count) > 0;
          }
        },
        'expert': {
          id: 8,
          check: async () => {
            // Check if user has an answer with at least 25 upvotes
            const query = `
              SELECT COUNT(*) FROM content 
              WHERE author_id = $1 AND type = 'answer' AND upvotes >= 25
            `;
            const result = await this.db.query(query, [userId]);
            return parseInt(result.rows[0].count) > 0;
          }
        },
        'great_question': {
          id: 9,
          check: async () => {
            // Check if user has a question with at least 25 upvotes
            const query = `
              SELECT COUNT(*) FROM content 
              WHERE author_id = $1 AND type = 'question' AND upvotes >= 25
            `;
            const result = await this.db.query(query, [userId]);
            return parseInt(result.rows[0].count) > 0;
          }
        },
        'reviewer': {
          id: 10,
          check: async () => {
            // Check if user has at least 5 tool reviews
            const query = `
              SELECT COUNT(*) FROM tool_reviews
              WHERE user_id = $1
            `;
            const result = await this.db.query(query, [userId]);
            return parseInt(result.rows[0].count) >= 5;
          }
        }
      };

      const badgeConfig = badgeMap[badgeKey];
      if (!badgeConfig) {
        throw new Error(`Unknown badge key: ${badgeKey}`);
      }

      // Check if user already has this badge
      const existingBadge = await this.getUserBadge(userId, badgeConfig.id);
      if (existingBadge) {
        return false; // User already has this badge
      }

      // Check if user qualifies for the badge
      const qualifies = await badgeConfig.check();
      if (qualifies) {
        // Award the badge
        await this.awardBadge(userId, badgeConfig.id);
        return true;
      }

      return false;
    } catch (error) {
      this.handleError('Error checking and awarding badge', error);
    }
  }

  /**
   * Check all available badges for a user and award any they qualify for
   * @returns Array of badge IDs that were awarded
   */
  async checkAllBadges(userId: number): Promise<number[]> {
    try {
      const awardedBadges: number[] = [];
      const badgeKeys = [
        'welcome',
        'first_post',
        'first_answer',
        'first_question',
        'helpful',
        'popular_post',
        'valuable_answer',
        'expert',
        'great_question',
        'reviewer'
      ];

      for (const key of badgeKeys) {
        const awarded = await this.checkAndAwardBadge(userId, key);
        if (awarded) {
          const badgeConfig = {
            'welcome': 1,
            'first_post': 2,
            'first_answer': 3,
            'first_question': 4,
            'helpful': 5,
            'popular_post': 6,
            'valuable_answer': 7,
            'expert': 8,
            'great_question': 9,
            'reviewer': 10
          };
          awardedBadges.push(badgeConfig[key]);
        }
      }

      return awardedBadges;
    } catch (error) {
      this.handleError('Error checking all badges', error);
    }
  }
}

// Create and export an instance of the BadgeRepository
export const badgeRepository = new BadgeRepository(Database.getInstance());