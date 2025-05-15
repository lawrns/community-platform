"use client";

import React, { useEffect, useRef } from "react";
import { useFocusTrap } from "@/lib/a11y/useFocusTrap";

interface FocusTrapProps {
  children: React.ReactNode;
  active?: boolean;
  autoFocus?: boolean;
  returnFocusOnUnmount?: boolean;
  escapeDeactivates?: boolean;
  clickOutsideDeactivates?: boolean;
  onDeactivate?: () => void;
}

/**
 * FocusTrap component traps focus within its children elements
 * Useful for modals, dialogs, and other overlay components
 * 
 * @example
 * <FocusTrap active={isOpen} onDeactivate={() => setIsOpen(false)}>
 *   <div className="modal">
 *     <h2>Modal Title</h2>
 *     <button>Action Button</button>
 *     <button onClick={() => setIsOpen(false)}>Close</button>
 *   </div>
 * </FocusTrap>
 */
export function FocusTrap({
  children,
  active = true,
  autoFocus = true,
  returnFocusOnUnmount = true,
  escapeDeactivates = true,
  clickOutsideDeactivates = false,
  onDeactivate,
}: FocusTrapProps) {
  const { containerRef } = useFocusTrap({
    enabled: active,
    autoFocus,
    returnFocusOnUnmount,
    escapeDeactivates,
    clickOutsideDeactivates,
    onDeactivate,
  });
  
  return (
    <div ref={containerRef} tabIndex={-1}>
      {children}
    </div>
  );
}

export default FocusTrap;