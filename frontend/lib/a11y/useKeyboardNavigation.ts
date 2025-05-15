"use client";

import { useRef, useEffect, useState, KeyboardEvent, RefObject } from "react";

type KeyMap = Record<string, () => void>;

type KeyboardNavigationOptions = {
  container?: RefObject<HTMLElement>;
  enabled?: boolean;
  preventDefaultKeys?: string[];
  stopPropagationKeys?: string[];
  includeGlobalHandlers?: boolean;
  keyMap?: KeyMap;
  onEscape?: () => void;
  onEnter?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onTab?: () => void;
  onShiftTab?: () => void;
  onHome?: () => void;
  onEnd?: () => void;
  onPageUp?: () => void;
  onPageDown?: () => void;
  onSpace?: () => void;
};

/**
 * Hook to handle keyboard navigation within components
 * 
 * @example
 * const { keyDownHandler } = useKeyboardNavigation({
 *   onArrowDown: () => setFocusedIndex(prev => Math.min(prev + 1, items.length - 1)),
 *   onArrowUp: () => setFocusedIndex(prev => Math.max(prev - 1, 0)),
 *   onEnter: () => selectItem(focusedIndex),
 *   onEscape: () => closeDropdown(),
 * });
 * 
 * return <div onKeyDown={keyDownHandler}>...</div>;
 */
export function useKeyboardNavigation({
  container,
  enabled = true,
  preventDefaultKeys = ["ArrowUp", "ArrowDown", "Home", "End", "PageUp", "PageDown", "Space"],
  stopPropagationKeys = ["Escape", "Enter", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"],
  includeGlobalHandlers = false,
  keyMap = {},
  onEscape,
  onEnter,
  onArrowUp,
  onArrowDown,
  onArrowLeft,
  onArrowRight,
  onTab,
  onShiftTab,
  onHome,
  onEnd,
  onPageUp,
  onPageDown,
  onSpace,
}: KeyboardNavigationOptions = {}) {
  const [isActive, setIsActive] = useState(enabled);
  
  // Combine all key handlers into a single map
  const combinedKeyMap = useRef<KeyMap>({
    ...keyMap,
    ...(onEscape && { Escape: onEscape }),
    ...(onEnter && { Enter: onEnter }),
    ...(onArrowUp && { ArrowUp: onArrowUp }),
    ...(onArrowDown && { ArrowDown: onArrowDown }),
    ...(onArrowLeft && { ArrowLeft: onArrowLeft }),
    ...(onArrowRight && { ArrowRight: onArrowRight }),
    ...(onTab && { Tab: onTab }),
    ...(onShiftTab && { ShiftTab: onShiftTab }),
    ...(onHome && { Home: onHome }),
    ...(onEnd && { End: onEnd }),
    ...(onPageUp && { PageUp: onPageUp }),
    ...(onPageDown && { PageDown: onPageDown }),
    ...(onSpace && { " ": onSpace }),
  });
  
  // Update the key map when handlers change
  useEffect(() => {
    combinedKeyMap.current = {
      ...keyMap,
      ...(onEscape && { Escape: onEscape }),
      ...(onEnter && { Enter: onEnter }),
      ...(onArrowUp && { ArrowUp: onArrowUp }),
      ...(onArrowDown && { ArrowDown: onArrowDown }),
      ...(onArrowLeft && { ArrowLeft: onArrowLeft }),
      ...(onArrowRight && { ArrowRight: onArrowRight }),
      ...(onTab && { Tab: onTab }),
      ...(onShiftTab && { ShiftTab: onShiftTab }),
      ...(onHome && { Home: onHome }),
      ...(onEnd && { End: onEnd }),
      ...(onPageUp && { PageUp: onPageUp }),
      ...(onPageDown && { PageDown: onPageDown }),
      ...(onSpace && { " ": onSpace }),
    };
  }, [
    keyMap,
    onEscape,
    onEnter,
    onArrowUp,
    onArrowDown,
    onArrowLeft,
    onArrowRight,
    onTab,
    onShiftTab,
    onHome,
    onEnd,
    onPageUp,
    onPageDown,
    onSpace,
  ]);

  // Update active state when enabled prop changes
  useEffect(() => {
    setIsActive(enabled);
  }, [enabled]);

  // Handler for keydown events
  const keyDownHandler = (event: KeyboardEvent<HTMLElement>) => {
    if (!isActive) return;

    const { key, shiftKey } = event;
    let keyPressed = key;

    // Handle combined keys like Shift+Tab
    if (key === "Tab" && shiftKey) {
      keyPressed = "ShiftTab";
    }

    // Check if there's a handler for this key
    const handler = combinedKeyMap.current[keyPressed];
    
    if (handler) {
      // Handle preventDefault for certain keys
      if (preventDefaultKeys.includes(keyPressed) || (keyPressed === " " && preventDefaultKeys.includes("Space"))) {
        event.preventDefault();
      }
      
      // Handle stopPropagation for certain keys
      if (stopPropagationKeys.includes(keyPressed) || (keyPressed === " " && stopPropagationKeys.includes("Space"))) {
        event.stopPropagation();
      }
      
      // Execute the handler
      handler();
    }
  };

  // Set up global event handlers if needed
  useEffect(() => {
    if (!includeGlobalHandlers || !isActive || !container?.current) return;
    
    const currentContainer = container.current;
    
    // Method to handle raw keyboard events
    const handleGlobalKeyDown = (e: globalThis.KeyboardEvent) => {
      if (!isActive) return;
      
      const { key, shiftKey } = e;
      let keyPressed = key;
      
      // Handle combined keys
      if (key === "Tab" && shiftKey) {
        keyPressed = "ShiftTab";
      }
      
      const handler = combinedKeyMap.current[keyPressed];
      
      if (handler) {
        // Check if the event should be prevented
        if (preventDefaultKeys.includes(keyPressed) || (keyPressed === " " && preventDefaultKeys.includes("Space"))) {
          e.preventDefault();
        }
        
        // Check if propagation should be stopped
        if (stopPropagationKeys.includes(keyPressed) || (keyPressed === " " && stopPropagationKeys.includes("Space"))) {
          e.stopPropagation();
        }
        
        // Execute the handler
        handler();
      }
    };
    
    // Attach global event listener
    currentContainer.addEventListener("keydown", handleGlobalKeyDown);
    
    // Clean up event listener on unmount
    return () => {
      currentContainer.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [isActive, includeGlobalHandlers, container, preventDefaultKeys, stopPropagationKeys]);

  return {
    keyDownHandler,
    isActive,
    setIsActive,
  };
}

export default useKeyboardNavigation;