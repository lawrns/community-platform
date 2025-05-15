"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type LiveRegionProps = {
  children?: React.ReactNode;
  className?: string;
  ariaLive?: "polite" | "assertive";
  ariaAtomic?: boolean;
  ariaRelevant?: "additions" | "removals" | "text" | "all";
  clearOnUnmount?: boolean;
  visuallyHidden?: boolean;
  role?: "status" | "alert" | "log" | "marquee" | "timer";
  /**
   * Delay in milliseconds before announcements are made
   * Useful to prevent rapid-fire announcements
   */
  debounceMs?: number;
};

/**
 * LiveRegion component for making dynamic announcements to screen readers
 * 
 * @example
 * const [message, setMessage] = useState("");
 * 
 * return (
 *   <>
 *     <button onClick={() => setMessage("Form submitted successfully")}>
 *       Submit Form
 *     </button>
 *     
 *     <LiveRegion ariaLive="polite">
 *       {message}
 *     </LiveRegion>
 *   </>
 * );
 */
export function LiveRegion({
  children,
  className,
  ariaLive = "polite",
  ariaAtomic = true,
  ariaRelevant = "additions text",
  clearOnUnmount = true,
  visuallyHidden = true,
  role = ariaLive === "assertive" ? "alert" : "status",
  debounceMs = 150,
}: LiveRegionProps) {
  const regionRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [announcement, setAnnouncement] = useState<React.ReactNode>(children);
  
  // Update the live region with new content
  useEffect(() => {
    // Clear any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (!children) {
      setAnnouncement("");
      return;
    }
    
    // For screen readers to recognize content changes in live regions,
    // we need to clear and then set the content with a small delay
    timeoutRef.current = setTimeout(() => {
      setAnnouncement("");
      
      // Force DOM reflow to ensure screen readers detect the change
      if (regionRef.current) {
        // eslint-disable-next-line no-void
        void regionRef.current.offsetWidth;
      }
      
      // Add the new announcement
      setAnnouncement(children);
    }, debounceMs);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [children, debounceMs]);
  
  // Clear announcement on unmount if configured
  useEffect(() => {
    return () => {
      if (clearOnUnmount && regionRef.current) {
        regionRef.current.textContent = "";
      }
    };
  }, [clearOnUnmount]);
  
  return (
    <div
      ref={regionRef}
      className={cn(visuallyHidden && "sr-only", className)}
      aria-live={ariaLive}
      aria-atomic={ariaAtomic}
      aria-relevant={ariaRelevant}
      role={role}
    >
      {announcement}
    </div>
  );
}

export default LiveRegion;