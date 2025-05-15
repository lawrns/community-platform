"use client";

import { useRef, useEffect, RefObject } from "react";

type FocusTrapOptions = {
  enabled?: boolean;
  autoFocus?: boolean;
  returnFocusOnUnmount?: boolean;
  escapeDeactivates?: boolean;
  clickOutsideDeactivates?: boolean;
  onDeactivate?: () => void;
};

/**
 * Hook to trap focus within a container element for better accessibility
 * 
 * @example
 * const { containerRef, activate, deactivate } = useFocusTrap({
 *   autoFocus: true,
 *   returnFocusOnUnmount: true,
 *   onDeactivate: () => setIsOpen(false),
 * });
 * 
 * return (
 *   <div ref={containerRef} tabIndex={-1}>
 *     <button>Focusable Button</button>
 *     <input type="text" />
 *     <button onClick={deactivate}>Close</button>
 *   </div>
 * );
 */
export function useFocusTrap({
  enabled = true,
  autoFocus = true,
  returnFocusOnUnmount = true,
  escapeDeactivates = true,
  clickOutsideDeactivates = false,
  onDeactivate,
}: FocusTrapOptions = {}) {
  const containerRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const isActiveRef = useRef(enabled);
  
  // Method to get all focusable elements within the container
  const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
    const selector = [
      'a[href]:not([tabindex="-1"])',
      'button:not([disabled]):not([tabindex="-1"])',
      'input:not([disabled]):not([tabindex="-1"])',
      'select:not([disabled]):not([tabindex="-1"])',
      'textarea:not([disabled]):not([tabindex="-1"])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]:not([tabindex="-1"])',
    ].join(',');
    
    return Array.from(container.querySelectorAll(selector)) as HTMLElement[];
  };
  
  // Method to focus the first focusable element
  const focusFirstElement = () => {
    if (!containerRef.current) return;
    
    const focusableElements = getFocusableElements(containerRef.current);
    
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    } else {
      // If no focusable elements, focus on the container itself
      containerRef.current.focus();
    }
  };
  
  // Method to handle tab key presses within the trap
  const handleTabKey = (e: KeyboardEvent) => {
    if (!containerRef.current || !isActiveRef.current) return;
    
    const focusableElements = getFocusableElements(containerRef.current);
    
    if (focusableElements.length === 0) return;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    // Shift+Tab from first element should focus the last element
    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    } 
    // Tab from last element should focus the first element
    else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
  };
  
  // Method to handle escape key
  const handleEscapeKey = (e: KeyboardEvent) => {
    if (escapeDeactivates && e.key === 'Escape' && isActiveRef.current) {
      deactivate();
    }
  };
  
  // Method to handle clicks outside the container
  const handleOutsideClick = (e: MouseEvent) => {
    if (
      clickOutsideDeactivates &&
      containerRef.current &&
      !containerRef.current.contains(e.target as Node) &&
      isActiveRef.current
    ) {
      deactivate();
    }
  };
  
  // Method to activate the focus trap
  const activate = () => {
    if (!containerRef.current) return;
    
    // Store current active element to restore focus later
    previousFocusRef.current = document.activeElement as HTMLElement;
    
    // Set as active
    isActiveRef.current = true;
    
    // Auto focus first element if enabled
    if (autoFocus) {
      focusFirstElement();
    }
  };
  
  // Method to deactivate the focus trap
  const deactivate = () => {
    isActiveRef.current = false;
    
    // Return focus to previous element if enabled
    if (returnFocusOnUnmount && previousFocusRef.current) {
      previousFocusRef.current.focus();
    }
    
    // Call deactivation callback if provided
    if (onDeactivate) {
      onDeactivate();
    }
  };
  
  // Set up event listeners when the trap is enabled
  useEffect(() => {
    const currentContainer = containerRef.current;
    
    if (!currentContainer) return;
    
    if (enabled) {
      // Make the container focusable
      if (currentContainer.tabIndex === -1 || !currentContainer.hasAttribute('tabindex')) {
        currentContainer.tabIndex = -1;
      }
      
      // Activate the focus trap
      activate();
      
      // Set up event listeners
      document.addEventListener('keydown', handleTabKey);
      document.addEventListener('keydown', handleEscapeKey);
      
      if (clickOutsideDeactivates) {
        document.addEventListener('mousedown', handleOutsideClick);
      }
    }
    
    // Clean up event listeners on unmount
    return () => {
      document.removeEventListener('keydown', handleTabKey);
      document.removeEventListener('keydown', handleEscapeKey);
      
      if (clickOutsideDeactivates) {
        document.removeEventListener('mousedown', handleOutsideClick);
      }
      
      if (enabled && returnFocusOnUnmount) {
        deactivate();
      }
    };
  }, [enabled, autoFocus, returnFocusOnUnmount, escapeDeactivates, clickOutsideDeactivates]);
  
  return {
    containerRef,
    activate,
    deactivate,
    focusFirstElement,
  };
}

export default useFocusTrap;