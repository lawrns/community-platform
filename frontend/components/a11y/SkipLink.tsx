"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SkipLinkProps {
  href?: string;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Skip link component that allows keyboard users to bypass navigation
 * and jump directly to the main content
 * 
 * @example
 * <SkipLink href="#main-content">Skip to main content</SkipLink>
 */
export function SkipLink({
  href = "#main-content",
  className,
  children = "Skip to main content",
}: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50",
        "bg-surface-1 text-content-primary py-2 px-4 rounded-md",
        "focus:outline-none focus:ring-2 focus:ring-ring",
        className
      )}
    >
      {children}
    </a>
  );
}

export default SkipLink;