"use client";

import { useCallback, useState, useRef, useEffect } from "react";
import { useId } from "react";

type AriaOptions = {
  id?: string;
  defaultExpanded?: boolean;
  defaultSelected?: boolean;
  defaultChecked?: boolean;
  onChange?: (state: boolean) => void;
  onSelect?: (state: boolean) => void;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  multiple?: boolean;
  maxSelection?: number;
};

/**
 * Hook to manage ARIA attributes and state for interactive components
 * 
 * @example
 * // For a dropdown menu
 * const {
 *   buttonProps,
 *   contentProps,
 *   isExpanded,
 *   toggle,
 * } = useAriaControls({ defaultExpanded: false });
 * 
 * return (
 *   <>
 *     <button {...buttonProps} onClick={toggle}>
 *       Toggle Menu
 *     </button>
 *     {isExpanded && (
 *       <div {...contentProps}>
 *         Menu content
 *       </div>
 *     )}
 *   </>
 * );
 */
export function useAriaControls({
  id,
  defaultExpanded = false,
  defaultSelected = false,
  defaultChecked = false,
  onChange,
  onSelect,
  disabled = false,
  readOnly = false,
  required = false,
  multiple = false,
  maxSelection,
}: AriaOptions = {}) {
  // Generate random ids for accessiblity relations
  const generatedId = useId();
  const componentId = id || `aria-component-${generatedId}`;
  const triggerId = `${componentId}-trigger`;
  const contentId = `${componentId}-content`;
  
  // State for expanded, selected, and checked status
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isSelected, setIsSelected] = useState(defaultSelected);
  const [isChecked, setIsChecked] = useState(defaultChecked);
  
  // Track multiple selections 
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
  // Manage initial state when defaults change
  useEffect(() => {
    setIsExpanded(defaultExpanded);
  }, [defaultExpanded]);
  
  useEffect(() => {
    setIsSelected(defaultSelected);
  }, [defaultSelected]);
  
  useEffect(() => {
    setIsChecked(defaultChecked);
  }, [defaultChecked]);
  
  // Toggle expanded state
  const toggle = useCallback(() => {
    if (disabled || readOnly) return;
    
    setIsExpanded((prev) => {
      const next = !prev;
      if (onChange) onChange(next);
      return next;
    });
  }, [disabled, readOnly, onChange]);
  
  // Set expanded state directly
  const setExpanded = useCallback((expanded: boolean) => {
    if (disabled || readOnly) return;
    
    setIsExpanded(expanded);
    if (onChange) onChange(expanded);
  }, [disabled, readOnly, onChange]);
  
  // Toggle selected state
  const toggleSelected = useCallback(() => {
    if (disabled || readOnly) return;
    
    setIsSelected((prev) => {
      const next = !prev;
      if (onSelect) onSelect(next);
      return next;
    });
  }, [disabled, readOnly, onSelect]);
  
  // Set selected state directly
  const setSelected = useCallback((selected: boolean) => {
    if (disabled || readOnly) return;
    
    setIsSelected(selected);
    if (onSelect) onSelect(selected);
  }, [disabled, readOnly, onSelect]);
  
  // Toggle checked state
  const toggleChecked = useCallback(() => {
    if (disabled || readOnly) return;
    
    setIsChecked((prev) => {
      const next = !prev;
      if (onChange) onChange(next);
      return next;
    });
  }, [disabled, readOnly, onChange]);
  
  // Set checked state directly
  const setChecked = useCallback((checked: boolean) => {
    if (disabled || readOnly) return;
    
    setIsChecked(checked);
    if (onChange) onChange(checked);
  }, [disabled, readOnly, onChange]);
  
  // Handle multiple selection
  const toggleItemSelected = useCallback((itemId: string) => {
    if (disabled || readOnly) return;
    
    setSelectedItems((prev) => {
      const isItemSelected = prev.includes(itemId);
      
      // If item is already selected, remove it
      if (isItemSelected) {
        const newItems = prev.filter(id => id !== itemId);
        return newItems;
      } 
      // Otherwise add it, respecting maxSelection if set
      else {
        if (maxSelection && prev.length >= maxSelection) {
          // If max reached, remove the first item and add the new one
          const newItems = [...prev.slice(1), itemId];
          return newItems;
        } else {
          return [...prev, itemId];
        }
      }
    });
  }, [disabled, readOnly, maxSelection]);
  
  // Clear all selections
  const clearSelections = useCallback(() => {
    setSelectedItems([]);
  }, []);
  
  // Props for the trigger/button element
  const buttonProps = {
    id: triggerId,
    "aria-expanded": isExpanded,
    "aria-haspopup": true,
    "aria-controls": contentId,
    "aria-disabled": disabled,
    "aria-pressed": isSelected,
    "aria-checked": multiple ? undefined : isChecked,
    disabled,
    role: isChecked !== undefined ? "checkbox" : undefined,
    tabIndex: disabled ? -1 : 0,
  };
  
  // Props for the controlled content
  const contentProps = {
    id: contentId,
    "aria-labelledby": triggerId,
    role: "region",
    tabIndex: -1,
  };
  
  // Props for items in a selectable list
  const getItemProps = useCallback((itemId: string) => {
    const isItemSelected = selectedItems.includes(itemId);
    
    return {
      id: `${componentId}-item-${itemId}`,
      role: multiple ? "option" : "menuitem",
      "aria-selected": isItemSelected,
      tabIndex: disabled ? -1 : 0,
    };
  }, [componentId, selectedItems, multiple, disabled]);
  
  return {
    // Ids
    componentId,
    triggerId,
    contentId,
    
    // Props
    buttonProps,
    contentProps,
    getItemProps,
    
    // State
    isExpanded,
    isSelected,
    isChecked,
    selectedItems,
    
    // Actions
    toggle,
    setExpanded,
    toggleSelected,
    setSelected,
    toggleChecked,
    setChecked,
    toggleItemSelected,
    clearSelections,
    
    // Options
    disabled,
    readOnly,
    required,
    multiple,
  };
}

export default useAriaControls;