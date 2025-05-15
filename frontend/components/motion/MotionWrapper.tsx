"use client";

import React, { ReactNode } from "react";
import { motion, Variants, HTMLMotionProps } from "framer-motion";
import * as animations from "@/lib/animations";

type MotionVariant = keyof typeof animations;

type MotionWrapperProps = {
  children: ReactNode;
  variant?: MotionVariant;
  custom?: any;
  delay?: number;
  duration?: number;
  className?: string;
  hover?: MotionVariant | Variants;
  tap?: MotionVariant | Variants;
  direction?: "up" | "down" | "left" | "right";
  as?: keyof JSX.IntrinsicElements;
} & HTMLMotionProps<"div">;

/**
 * A wrapper component that adds motion/animation to its children
 * 
 * @example
 * // Basic usage with predefined animation
 * <MotionWrapper variant="fadeIn">
 *   <YourComponent />
 * </MotionWrapper>
 * 
 * // With hover and tap effects
 * <MotionWrapper variant="fadeIn" hover="hoverScale" tap="buttonTap">
 *   <Button>Animated Button</Button>
 * </MotionWrapper>
 * 
 * // With custom timing
 * <MotionWrapper variant="slideUp" delay={0.2} duration={0.5}>
 *   <Card />
 * </MotionWrapper>
 */
export function MotionWrapper({
  children,
  variant,
  custom,
  delay = 0,
  duration = 0.3,
  className = "",
  hover,
  tap,
  direction = "up",
  as = "div",
  ...props
}: MotionWrapperProps) {
  // Support legacy direction prop
  let selectedVariant = variant;
  if (!selectedVariant) {
    switch (direction) {
      case "up": selectedVariant = "slideUp"; break;
      case "down": selectedVariant = "slideDown"; break;
      case "left": selectedVariant = "slideInLeft"; break;
      case "right": selectedVariant = "slideInRight"; break;
      default: selectedVariant = "fadeIn";
    }
  }
  
  // Get the base animation variant
  const baseVariant = selectedVariant ? (animations[selectedVariant] as Variants) : undefined;
  
  if (!baseVariant) {
    // Fall back to simple animation if variant not found
    return (
      <motion.div
        initial={{ opacity: 0, y: direction === "up" ? 20 : direction === "down" ? -20 : 0, x: direction === "left" ? 20 : direction === "right" ? -20 : 0 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
  
  // Apply custom timing if provided
  const customizedVariant = {
    ...baseVariant,
    visible: {
      ...baseVariant.visible,
      transition: {
        ...baseVariant.visible?.transition,
        delay,
        duration
      }
    }
  };
  
  // Get hover animation if provided
  const hoverAnimation = hover 
    ? (typeof hover === 'string' ? animations[hover] : hover) 
    : undefined;
  
  // Get tap animation if provided
  const tapAnimation = tap 
    ? (typeof tap === 'string' ? animations[tap] : tap) 
    : undefined;
  
  const Component = motion[as as keyof typeof motion];
  
  return (
    <Component
      className={className}
      variants={customizedVariant}
      initial="hidden"
      animate="visible"
      exit={baseVariant.exit ? "exit" : undefined}
      whileHover={hoverAnimation}
      whileTap={tapAnimation}
      custom={custom}
      {...props}
    >
      {children}
    </Component>
  );
}

export default MotionWrapper;