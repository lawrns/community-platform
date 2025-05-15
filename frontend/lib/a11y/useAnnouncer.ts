"use client";

import { useRef, useEffect, useCallback } from "react";

type AnnouncerOptions = {
  ariaLive?: "polite" | "assertive" | "off";
  ariaAtomic?: boolean;
  politeLiveRegion?: HTMLElement | null;
  assertiveLiveRegion?: HTMLElement | null;
  clearOnUnmount?: boolean;
};

/**
 * Hook to manage announcements to screen readers through ARIA live regions
 * 
 * @example
 * const { announce, announcePolite, announceAssertive, clearAnnouncements } = useAnnouncer();
 * 
 * // For non-urgent messages
 * announcePolite("Your file has been saved.");
 * 
 * // For urgent/important messages
 * announceAssertive("Error: Unable to save your file.");
 * 
 * // Specify which region to use (polite by default)
 * announce("Your settings have been updated.", "polite");
 */
export function useAnnouncer({
  ariaLive = "polite",
  ariaAtomic = true,
  politeLiveRegion = null,
  assertiveLiveRegion = null,
  clearOnUnmount = true,
}: AnnouncerOptions = {}) {
  const internalPoliteLiveRegionRef = useRef<HTMLDivElement | null>(null);
  const internalAssertiveLiveRegionRef = useRef<HTMLDivElement | null>(null);
  
  // Create live regions if not provided
  useEffect(() => {
    // Only create regions if they weren't provided
    if (!politeLiveRegion) {
      // Check if region already exists in the DOM
      let existingPoliteRegion = document.getElementById('announcer-polite') as HTMLDivElement;
      
      if (!existingPoliteRegion) {
        existingPoliteRegion = document.createElement('div');
        existingPoliteRegion.id = 'announcer-polite';
        existingPoliteRegion.className = 'sr-only';
        existingPoliteRegion.setAttribute('aria-live', 'polite');
        existingPoliteRegion.setAttribute('aria-atomic', ariaAtomic ? 'true' : 'false');
        existingPoliteRegion.setAttribute('role', 'status');
        document.body.appendChild(existingPoliteRegion);
      }
      
      internalPoliteLiveRegionRef.current = existingPoliteRegion;
    }
    
    if (!assertiveLiveRegion) {
      // Check if region already exists in the DOM
      let existingAssertiveRegion = document.getElementById('announcer-assertive') as HTMLDivElement;
      
      if (!existingAssertiveRegion) {
        existingAssertiveRegion = document.createElement('div');
        existingAssertiveRegion.id = 'announcer-assertive';
        existingAssertiveRegion.className = 'sr-only';
        existingAssertiveRegion.setAttribute('aria-live', 'assertive');
        existingAssertiveRegion.setAttribute('aria-atomic', ariaAtomic ? 'true' : 'false');
        existingAssertiveRegion.setAttribute('role', 'alert');
        document.body.appendChild(existingAssertiveRegion);
      }
      
      internalAssertiveLiveRegionRef.current = existingAssertiveRegion;
    }
    
    // Clean up on unmount
    return () => {
      if (clearOnUnmount) {
        clearAnnouncements();
      }
    };
  }, [ariaAtomic, politeLiveRegion, assertiveLiveRegion, clearOnUnmount]);
  
  // Method to announce message to screen readers
  const announce = useCallback((
    message: string,
    priority: "polite" | "assertive" = ariaLive,
  ) => {
    // Get the appropriate live region based on priority
    const liveRegion = priority === 'assertive'
      ? assertiveLiveRegion || internalAssertiveLiveRegionRef.current
      : politeLiveRegion || internalPoliteLiveRegionRef.current;
    
    if (!liveRegion) return;
    
    // Clear existing content
    liveRegion.textContent = '';
    
    // Force a DOM reflow - necessary for some screen readers to announce
    // subsequent identical messages
    // eslint-disable-next-line no-void
    void liveRegion.offsetWidth;
    
    // Add the new message
    liveRegion.textContent = message;
  }, [ariaLive, politeLiveRegion, assertiveLiveRegion]);
  
  // Convenience methods for polite and assertive announcements
  const announcePolite = useCallback((message: string) => {
    announce(message, 'polite');
  }, [announce]);
  
  const announceAssertive = useCallback((message: string) => {
    announce(message, 'assertive');
  }, [announce]);
  
  // Method to clear all announcements
  const clearAnnouncements = useCallback(() => {
    if (politeLiveRegion) {
      politeLiveRegion.textContent = '';
    } else if (internalPoliteLiveRegionRef.current) {
      internalPoliteLiveRegionRef.current.textContent = '';
    }
    
    if (assertiveLiveRegion) {
      assertiveLiveRegion.textContent = '';
    } else if (internalAssertiveLiveRegionRef.current) {
      internalAssertiveLiveRegionRef.current.textContent = '';
    }
  }, [politeLiveRegion, assertiveLiveRegion]);
  
  return {
    announce,
    announcePolite,
    announceAssertive,
    clearAnnouncements,
  };
}

export default useAnnouncer;