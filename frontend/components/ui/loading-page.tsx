"use client";

import React from "react";
import { motion } from "framer-motion";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

interface LoadingPageProps {
  fullscreen?: boolean;
  text?: string;
  variant?: "spinner" | "dots" | "progress";
  className?: string;
}

/**
 * Full page loading component for route transitions
 * 
 * @example
 * <LoadingPage text="Loading your profile..." />
 */
export function LoadingPage({
  fullscreen = true,
  text = "Loading...",
  variant = "spinner",
  className,
}: LoadingPageProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 gap-4",
        fullscreen && "fixed inset-0 z-50 min-h-screen w-full bg-surface-1/90 backdrop-blur-sm",
        !fullscreen && "w-full py-20",
        className
      )}
    >
      {variant === "spinner" && (
        <Spinner 
          size="lg" 
          variant="circle" 
          text={text} 
          textPosition="bottom"
          color="hsl(var(--brand-primary))"
        />
      )}
      
      {variant === "dots" && (
        <Spinner 
          size="lg" 
          variant="dots" 
          text={text} 
          textPosition="bottom"
          color="hsl(var(--brand-primary))"
        />
      )}
      
      {variant === "progress" && <ProgressBar text={text} />}
    </div>
  );
}

interface ProgressBarProps {
  text?: string;
  duration?: number;
}

function ProgressBar({ text, duration = 3 }: ProgressBarProps) {
  return (
    <div className="w-full max-w-md flex flex-col items-center gap-2">
      <div className="w-full h-2 bg-surface-2 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-brand-primary"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{
            duration,
            ease: [0.4, 0.0, 0.2, 1],
          }}
        />
      </div>
      {text && (
        <p className="text-sm text-content-secondary">{text}</p>
      )}
    </div>
  );
}

export default LoadingPage;