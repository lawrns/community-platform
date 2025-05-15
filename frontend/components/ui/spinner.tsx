"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type SpinnerSize = "xs" | "sm" | "md" | "lg" | "xl";
type SpinnerVariant = "circle" | "dots" | "pulse";

interface SpinnerProps {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  className?: string;
  color?: string;
  text?: string;
  textPosition?: "left" | "right" | "top" | "bottom";
}

const sizeMap = {
  xs: { size: "h-4 w-4", text: "text-xs" },
  sm: { size: "h-6 w-6", text: "text-sm" },
  md: { size: "h-8 w-8", text: "text-base" },
  lg: { size: "h-12 w-12", text: "text-lg" },
  xl: { size: "h-16 w-16", text: "text-xl" },
};

/**
 * Loading spinner component with various styles and sizes
 * 
 * @example
 * <Spinner size="md" variant="circle" text="Loading..." />
 */
export function Spinner({
  size = "md",
  variant = "circle",
  className = "",
  color = "currentColor",
  text,
  textPosition = "right",
}: SpinnerProps) {
  const sizeStyle = sizeMap[size];
  
  const renderSpinner = () => {
    switch (variant) {
      case "dots":
        return <DotSpinner size={size} color={color} />;
      case "pulse":
        return <PulseSpinner size={size} color={color} />;
      case "circle":
      default:
        return <CircleSpinner size={size} color={color} />;
    }
  };
  
  const spinner = renderSpinner();
  
  if (!text) return (
    <div className={cn("flex items-center justify-center", className)}>
      {spinner}
    </div>
  );
  
  return (
    <div className={cn(
      "flex gap-2",
      textPosition === "left" || textPosition === "right" ? "items-center" : "flex-col items-center",
      textPosition === "right" && "flex-row",
      textPosition === "left" && "flex-row-reverse",
      textPosition === "top" && "flex-col-reverse",
      textPosition === "bottom" && "flex-col",
      className
    )}>
      {spinner}
      <span className={cn("text-content-secondary", sizeStyle.text)}>{text}</span>
    </div>
  );
}

// Circle spinner variant
function CircleSpinner({ size, color }: { size: SpinnerSize; color: string }) {
  const sizeStyle = sizeMap[size];
  
  return (
    <motion.div
      className={cn("rounded-full border-t-2 border-r-2 border-transparent", sizeStyle.size)}
      style={{ 
        borderTopColor: color,
        borderRightColor: color,
      }}
      animate={{ rotate: 360 }}
      transition={{
        duration: 0.8,
        ease: "linear",
        repeat: Infinity,
      }}
    />
  );
}

// Dot spinner variant
function DotSpinner({ size, color }: { size: SpinnerSize; color: string }) {
  const dotSize = {
    xs: "h-1 w-1",
    sm: "h-1.5 w-1.5",
    md: "h-2 w-2",
    lg: "h-3 w-3",
    xl: "h-4 w-4",
  }[size];
  
  const containerSize = sizeMap[size].size;
  
  const dotVariants = {
    initial: { scale: 0.5, opacity: 0.3 },
    animate: { scale: 1, opacity: 1 },
  };
  
  return (
    <div className={cn("flex items-center justify-center gap-1", containerSize)}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={cn("rounded-full", dotSize)}
          style={{ backgroundColor: color }}
          variants={dotVariants}
          initial="initial"
          animate="animate"
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatType: "reverse",
            delay: i * 0.15,
          }}
        />
      ))}
    </div>
  );
}

// Pulse spinner variant
function PulseSpinner({ size, color }: { size: SpinnerSize; color: string }) {
  const sizeStyle = sizeMap[size];
  
  return (
    <motion.div
      className={cn("rounded-full", sizeStyle.size)}
      style={{ backgroundColor: color }}
      animate={{ 
        scale: [1, 1.2, 1],
        opacity: [0.5, 0.8, 0.5],
      }}
      transition={{
        duration: 1.5,
        ease: "easeInOut",
        repeat: Infinity,
      }}
    />
  );
}

export default Spinner;