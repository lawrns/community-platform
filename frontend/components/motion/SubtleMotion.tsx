"use client";

import React, { ReactNode } from 'react';
import { motion, MotionProps, Variants } from 'framer-motion';

// Animation variants with subtle transitions
export const subtleAnimationVariants = {
  // Fade in animation - very gentle
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  },
  
  // Slide up animation - small distance, gentle timing
  slideUp: {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1], // Custom ease curve for a subtle, professional feel
      }
    }
  },
  
  // Scale animation - very subtle, barely noticeable but adds polish
  subtleScale: {
    hidden: { opacity: 0, scale: 0.97 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.4,
        ease: [0.34, 1.56, 0.64, 1], // Slight overshoot for subtle bounce
      }
    }
  },
  
  // Card entrance animation - subtle lift with shadow
  cardEntrance: {
    hidden: { 
      opacity: 0, 
      y: 15, 
      boxShadow: "0 0 0 rgba(0, 0, 0, 0)" 
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      boxShadow: "var(--shadow-md)",
      transition: { 
        duration: 0.5,
        ease: "easeOut"
      }
    }
  },
  
  // Staggered children entrance - for lists of items
  staggeredParent: {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.07,
        delayChildren: 0.1
      }
    }
  },
  
  // Staggered child animation
  staggeredChild: {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" }
    }
  }
};

type SubtleMotionProps = {
  children: ReactNode;
  variant?: keyof typeof subtleAnimationVariants;
  delay?: number;
  className?: string;
  once?: boolean;
  viewport?: boolean;
} & Omit<MotionProps, 'variants' | 'initial' | 'animate' | 'exit'>;

/**
 * SubtleMotion component - Wraps children in subtle animations
 * Designed for professional interfaces where animations should enhance, not distract
 */
export function SubtleMotion({ 
  children, 
  variant = 'fadeIn', 
  delay = 0, 
  className = '',
  once = true, 
  viewport = false,
  ...props 
}: SubtleMotionProps) {
  // Get the selected animation variant
  const selectedVariant = subtleAnimationVariants[variant];

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={selectedVariant}
      transition={{ 
        ...selectedVariant.visible.transition,
        delay
      }}
      viewport={viewport ? { once, margin: '0px 0px -100px 0px' } : undefined}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * StaggeredList component - Animates children with a staggered effect
 * Ideal for lists of items that should reveal sequentially
 */
export function StaggeredList({ 
  children, 
  className = '',
  ...props
}: Omit<SubtleMotionProps, 'variant'>) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={subtleAnimationVariants.staggeredParent}
      {...props}
    >
      {React.Children.map(children, child => (
        <motion.div variants={subtleAnimationVariants.staggeredChild}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

/**
 * CardMotion component - Specifically designed for card animations
 */
export function CardMotion({ 
  children, 
  className = '',
  ...props
}: Omit<SubtleMotionProps, 'variant'>) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={subtleAnimationVariants.cardEntrance}
      {...props}
    >
      {children}
    </motion.div>
  );
}