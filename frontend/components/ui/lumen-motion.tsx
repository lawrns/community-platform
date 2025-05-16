"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, Variant, Variants } from "framer-motion";
import { useReducedMotion } from "framer-motion";

// Predefined animation variants that follow the 120ms micro-delight guideline
export const microDelightVariants = {
  // Fade effect
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.12 } },
    exit: { opacity: 0, transition: { duration: 0.12 } }
  },
  
  // Slide up entrance
  slideUp: {
    initial: { opacity: 0, y: 10 },
    animate: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        type: "spring", 
        stiffness: 500, 
        damping: 30, 
        duration: 0.12,
      } 
    },
    exit: { 
      opacity: 0, 
      y: 10, 
      transition: { duration: 0.12 } 
    }
  },
  
  // Slide down (for dropdowns)
  slideDown: {
    initial: { opacity: 0, y: -10 },
    animate: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        type: "spring", 
        stiffness: 500, 
        damping: 30, 
        duration: 0.12,
      } 
    },
    exit: { 
      opacity: 0, 
      y: -10, 
      transition: { duration: 0.12 } 
    }
  },
  
  // Scale effect (for buttons, cards)
  scale: {
    initial: { opacity: 0, scale: 0.96 },
    animate: { 
      opacity: 1, 
      scale: 1, 
      transition: { 
        type: "spring", 
        stiffness: 500, 
        damping: 30, 
        duration: 0.12,
      } 
    },
    exit: { 
      opacity: 0, 
      scale: 0.96, 
      transition: { duration: 0.12 } 
    }
  },
  
  // Scale with bounce (more playful)
  scaleBounce: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { 
      opacity: 1, 
      scale: 1, 
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 10, 
        duration: 0.12,
      } 
    },
    exit: { 
      opacity: 0, 
      scale: 0.9, 
      transition: { duration: 0.12 } 
    }
  },
  
  // For staggered children animations
  container: {
    initial: {}, 
    animate: { 
      transition: { 
        staggerChildren: 0.05,
        delayChildren: 0.03,
      } 
    },
    exit: { transition: { staggerChildren: 0.05 } }
  },
  
  // Item for staggered children
  item: {
    initial: { opacity: 0, y: 10 },
    animate: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.12 } 
    },
    exit: { 
      opacity: 0, 
      y: 10, 
      transition: { duration: 0.12 } 
    }
  }
};

// Interaction variants for hover/tap effects
export const interactionVariants = {
  // Button press effect
  buttonTap: {
    tap: { scale: 0.98, transition: { duration: 0.12 } }
  },
  
  // Card hover effect
  cardHover: {
    hover: { 
      y: -4, 
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
      transition: { duration: 0.12 } 
    }
  },
  
  // Gentle glow on hover
  glowHover: {
    hover: { 
      boxShadow: "0 0 15px rgba(10, 233, 233, 0.4)",
      transition: { duration: 0.12 } 
    }
  }
};

// Attention-getting animations
export const attentionVariants = {
  // Pulse animation
  pulse: {
    animate: {
      scale: [1, 1.03, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "loop"
      }
    }
  },
  
  // Subtle shake (for errors)
  shake: {
    animate: {
      x: [0, -2, 0, 2, 0],
      transition: {
        duration: 0.4,
        ease: "easeInOut"
      }
    }
  },
  
  // Vote burst animation
  burst: {
    animate: {
      scale: [1, 1.2, 1],
      boxShadow: [
        "0 0 0 0 rgba(10, 233, 233, 0)",
        "0 0 10px 0 rgba(10, 233, 233, 0.3)",
        "0 0 0 0 rgba(10, 233, 233, 0)"
      ],
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  }
};

// Interface for MicroMotion component
interface MicroMotionProps {
  children: React.ReactNode;
  variant?: keyof typeof microDelightVariants;
  custom?: any;
  className?: string;
  delay?: number;
  duration?: number;
  animate?: boolean;
  exit?: boolean;
  tag?: React.ElementType;
}

// Main MicroMotion component for applying micro-delight animations
export const MicroMotion: React.FC<MicroMotionProps> = ({
  children,
  variant = "fade",
  custom,
  className = "",
  delay = 0,
  duration,
  animate = true,
  exit = true,
  tag = "div",
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [hasMounted, setHasMounted] = useState(false);
  
  useEffect(() => {
    setHasMounted(true);
  }, []);
  
  // If user prefers reduced motion, don't animate
  if (prefersReducedMotion) {
    const Component = tag as any;
    return <Component className={className}>{children}</Component>;
  }
  
  // Get the selected animation variant
  const selectedVariant = microDelightVariants[variant];
  
  // Apply custom duration if provided
  const customTransition = duration 
    ? {
        initial: { ...selectedVariant.initial },
        animate: { 
          ...selectedVariant.animate, 
          transition: { 
            ...selectedVariant.animate.transition,
            duration 
          } 
        },
        exit: { 
          ...selectedVariant.exit, 
          transition: { 
            ...selectedVariant.exit.transition,
            duration 
          } 
        }
      }
    : selectedVariant;
  
  // For SSR compatibility
  if (!hasMounted) {
    const Component = tag as any;
    return <Component className={className}>{children}</Component>;
  }
  
  return (
    <AnimatePresence mode="wait">
      {animate && (
        <motion.div
          className={className}
          initial="initial"
          animate="animate"
          exit={exit ? "exit" : undefined}
          variants={customTransition}
          custom={custom}
          transition={{ delay }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Staggered container for child animations
interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  staggerDelay?: number;
  animate?: boolean;
}

export const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  className = "",
  delay = 0,
  staggerDelay = 0.05,
  animate = true,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [hasMounted, setHasMounted] = useState(false);
  
  useEffect(() => {
    setHasMounted(true);
  }, []);
  
  // If user prefers reduced motion, don't animate
  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }
  
  // Custom stagger delay timing
  const staggerVariants = {
    ...microDelightVariants.container,
    animate: {
      ...microDelightVariants.container.animate,
      transition: {
        ...microDelightVariants.container.animate.transition,
        staggerChildren: staggerDelay,
        delayChildren: delay,
      }
    }
  };
  
  // For SSR compatibility
  if (!hasMounted) {
    return <div className={className}>{children}</div>;
  }
  
  return (
    <AnimatePresence mode="wait">
      {animate && (
        <motion.div
          className={className}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={staggerVariants}
        >
          {React.Children.map(children, (child, index) => {
            if (React.isValidElement(child)) {
              return (
                <motion.div 
                  key={index} 
                  variants={microDelightVariants.item}
                >
                  {child}
                </motion.div>
              );
            }
            return child;
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Interactive element with hover/tap effects
interface InteractiveProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: keyof typeof interactionVariants;
  tapEffect?: boolean;
  glowEffect?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  tag?: React.ElementType;
}

export const Interactive: React.FC<InteractiveProps> = ({
  children,
  className = "",
  hoverEffect,
  tapEffect = true,
  glowEffect = false,
  disabled = false,
  onClick,
  tag = "div",
}) => {
  const prefersReducedMotion = useReducedMotion();
  
  // Motion properties
  const motionProps: any = {
    className,
    onClick: disabled ? undefined : onClick,
    style: { cursor: onClick && !disabled ? "pointer" : undefined },
  };
  
  // Add hover effect if specified
  if (hoverEffect && !prefersReducedMotion && !disabled) {
    motionProps.whileHover = interactionVariants[hoverEffect].hover;
  }
  
  // Add tap effect if specified
  if (tapEffect && !prefersReducedMotion && !disabled) {
    motionProps.whileTap = { scale: 0.98 };
  }
  
  // Add glow effect if specified
  if (glowEffect && !prefersReducedMotion && !disabled) {
    motionProps.whileHover = {
      ...motionProps.whileHover,
      ...interactionVariants.glowHover.hover
    };
  }
  
  const Component = tag as any;
  return <motion.div {...motionProps}>{children}</motion.div>;
};

// Attention-getting animation component
interface AttentionProps {
  children: React.ReactNode;
  className?: string;
  effect: keyof typeof attentionVariants;
  trigger?: boolean;
  onComplete?: () => void;
}

export const Attention: React.FC<AttentionProps> = ({
  children,
  className = "",
  effect,
  trigger = true,
  onComplete,
}) => {
  const prefersReducedMotion = useReducedMotion();
  
  // If user prefers reduced motion, don't animate
  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }
  
  // Get appropriate attention variant
  const selectedVariant = attentionVariants[effect];
  
  return (
    <motion.div
      className={className}
      animate={trigger ? "animate" : "initial"}
      variants={selectedVariant}
      onAnimationComplete={onComplete}
    >
      {children}
    </motion.div>
  );
};

export { microDelightVariants, interactionVariants, attentionVariants };