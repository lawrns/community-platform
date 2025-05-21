/**
 * Standardized animation variants for consistent motion across the app
 */
import { Variants } from 'framer-motion';

// Fade in from bottom
export const fadeUp: Variants = {
  initial: { 
    y: 32, 
    opacity: 0 
  },
  animate: { 
    y: 0, 
    opacity: 1, 
    transition: { 
      duration: 0.24, 
      ease: [0.22, 1, 0.36, 1] // cubic-bezier(0.22, 1, 0.36, 1)
    } 
  }
};

// Fade in from top
export const fadeDown: Variants = {
  initial: { 
    y: -32, 
    opacity: 0 
  },
  animate: { 
    y: 0, 
    opacity: 1, 
    transition: { 
      duration: 0.24, 
      ease: [0.22, 1, 0.36, 1]
    } 
  }
};

// Simple fade in
export const fadeIn: Variants = {
  initial: { 
    opacity: 0 
  },
  animate: { 
    opacity: 1, 
    transition: { 
      duration: 0.24, 
      ease: [0.22, 1, 0.36, 1]
    } 
  }
};

// Scale animation with shadow for cards
export const popLift: Variants = {
  initial: {},
  whileHover: { 
    y: -4, 
    scale: 1.02,
    boxShadow: 'var(--shadow-xl)',
    transition: { 
      duration: 0.2, 
      ease: [0.22, 1, 0.36, 1]
    }
  },
  whileTap: { 
    scale: 0.96,
    transition: { 
      duration: 0.1, 
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

// Animate children in sequence (staggered)
export const staggerChildren: Variants = {
  initial: {},
  animate: { 
    transition: { 
      staggerChildren: 0.06 
    } 
  }
};

// Staggered container with longer delay
export const staggerContainer: Variants = {
  initial: {},
  animate: { 
    transition: { 
      delayChildren: 0.2,
      staggerChildren: 0.08
    } 
  }
};

// Button press animation
export const buttonPress: Variants = {
  initial: {},
  whileTap: { 
    scale: 0.96,
    transition: { 
      duration: 0.02 // Ultra fast 20ms for touch feedback
    }
  }
};

// Section entrance animation
export const sectionEntrance: Variants = {
  initial: { 
    y: 40, 
    opacity: 0 
  },
  animate: { 
    y: 0, 
    opacity: 1, 
    transition: { 
      duration: 0.24, 
      ease: [0.22, 1, 0.36, 1] 
    } 
  }
};

// List item animation for use with staggerChildren
export const listItem: Variants = {
  initial: { 
    y: 20, 
    opacity: 0 
  },
  animate: { 
    y: 0, 
    opacity: 1, 
    transition: { 
      duration: 0.24, 
      ease: [0.22, 1, 0.36, 1]
    } 
  }
};

// For reduced motion preferences
export const reducedMotionVariants = {
  initial: {},
  animate: {},
  whileHover: {},
  whileTap: {}
};