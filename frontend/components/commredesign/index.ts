/**
 * CommRedesign Component Library
 * 
 * This file exports all components from the new commredesign design system.
 * These components incorporate the purple/blue gradient styling, modern UI effects,
 * and enhanced interaction patterns from the commredesign prototype.
 */

// Layouts and Sections
export { default as HeroSection } from './HeroSection';
export { default as JoinCommunity } from './JoinCommunity';
export { default as StatsDisplay } from './StatsDisplay';
export { default as FeatureCard, FeatureGrid } from './FeatureCard';

// Re-export the enhanced UI components
export { Button } from '../ui/button-upgraded';
export { 
  Card, 
  CardHeader, 
  CardContent, 
  CardFooter, 
  CardImage,
  CardTitle,
  CardDescription 
} from '../ui/card-upgraded';

/**
 * Usage example:
 * 
 * ```tsx
 * import { 
 *   HeroSection, 
 *   FeatureGrid, 
 *   JoinCommunity, 
 *   StatsDisplay,
 *   Button,
 *   Card
 * } from '@/components/commredesign';
 * 
 * // Then use these components in your page
 * ```
 */