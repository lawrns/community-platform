"use client";

import React, { ReactNode } from "react";
import { motion } from "framer-motion";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AnimatedButtonProps = ButtonProps & {
  children: ReactNode;
  withRipple?: boolean;
  withScale?: boolean;
  withSlide?: boolean;
  scaleAmount?: number;
  slideOffset?: number;
  rippleColor?: string;
  rippleDuration?: number;
  hoverElevation?: boolean;
};

/**
 * An enhanced button component with micro-interactions
 * 
 * @example
 * <AnimatedButton 
 *   withRipple 
 *   withScale 
 *   variant="default"
 * >
 *   Click Me
 * </AnimatedButton>
 */
export default function AnimatedButton({
  children,
  className,
  withRipple = false,
  withScale = true,
  withSlide = false,
  scaleAmount = 0.95,
  slideOffset = 3,
  rippleColor = "rgba(255, 255, 255, 0.7)",
  rippleDuration = 0.8,
  hoverElevation = false,
  ...props
}: AnimatedButtonProps) {
  const [rippleEffect, setRippleEffect] = React.useState<{
    x: number;
    y: number;
    visible: boolean;
  } | null>(null);

  const handleRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setRippleEffect({
      x,
      y,
      visible: true,
    });

    setTimeout(() => {
      setRippleEffect(null);
    }, rippleDuration * 1000);
  };

  return (
    <motion.div
      className={cn(
        "relative inline-block",
        hoverElevation && "transition-shadow duration-300",
        {
          "shadow-md hover:shadow-lg": hoverElevation,
        }
      )}
      whileHover={
        withSlide
          ? { y: -slideOffset, transition: { type: "spring", stiffness: 400, damping: 8 } }
          : undefined
      }
      whileTap={
        withScale
          ? { scale: scaleAmount, transition: { type: "spring", stiffness: 400, damping: 17 } }
          : undefined
      }
    >
      <Button
        className={cn("relative overflow-hidden", className)}
        onClick={withRipple ? handleRipple : undefined}
        {...props}
      >
        {children}
        
        {/* Ripple effect */}
        {withRipple && rippleEffect && (
          <motion.span
            className="absolute rounded-full"
            style={{
              top: rippleEffect.y,
              left: rippleEffect.x,
              backgroundColor: rippleColor,
              pointerEvents: "none",
              transformOrigin: "center",
            }}
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{
              scale: 5,
              opacity: 0,
              transition: { duration: rippleDuration },
            }}
          />
        )}
      </Button>
    </motion.div>
  );
}