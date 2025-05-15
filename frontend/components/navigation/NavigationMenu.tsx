"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { useKeyboardNavigation } from "@/lib/a11y/useKeyboardNavigation";

// Reusable nav item type
export type NavItem = {
  label: string;
  href: string;
  icon?: React.ReactNode;
  children?: NavItemWithChildren[];
  description?: string;
};

// Type for nav items with children
export type NavItemWithChildren = {
  label: string;
  href: string;
  icon?: React.ReactNode;
  description?: string;
};

interface NavigationMenuProps {
  items: NavItem[];
  className?: string;
  variant?: "horizontal" | "vertical";
  showIcons?: boolean;
  showActiveHighlight?: boolean;
  activeItemClassName?: string;
  inactiveItemClassName?: string;
  logoComponent?: React.ReactNode;
}

/**
 * A flexible navigation menu component supporting horizontal and vertical layouts
 * with dropdown support, keyboard navigation, and accessibility features
 */
export function NavigationMenu({
  items,
  className,
  variant = "horizontal",
  showIcons = true,
  showActiveHighlight = true,
  activeItemClassName = "text-content-primary font-medium",
  inactiveItemClassName = "text-content-secondary hover:text-content-primary",
  logoComponent,
}: NavigationMenuProps) {
  const pathname = usePathname();
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const navRef = useRef<HTMLDivElement>(null);

  // Handle keyboard navigation
  const { keyDownHandler } = useKeyboardNavigation({
    container: navRef,
    onArrowDown: () => {
      if (variant === "vertical") {
        setFocusedIndex(prev => Math.min(prev + 1, items.length - 1));
      } else if (activeItem) {
        // Open dropdown if arrow down pressed on parent
        const index = items.findIndex(item => item.href === activeItem);
        if (index >= 0 && items[index].children?.length) {
          setActiveItem(activeItem);
        }
      }
    },
    onArrowUp: () => {
      if (variant === "vertical") {
        setFocusedIndex(prev => Math.max(prev - 1, 0));
      }
    },
    onArrowRight: () => {
      if (variant === "horizontal") {
        setFocusedIndex(prev => Math.min(prev + 1, items.length - 1));
      }
    },
    onArrowLeft: () => {
      if (variant === "horizontal") {
        setFocusedIndex(prev => Math.max(prev - 1, 0));
      }
    },
    onEscape: () => {
      setActiveItem(null);
    },
    onEnter: () => {
      if (focusedIndex >= 0 && focusedIndex < items.length) {
        if (items[focusedIndex].children?.length) {
          setActiveItem(activeItem === items[focusedIndex].href ? null : items[focusedIndex].href);
        } else {
          // Navigate to the href in real implementation
          // For demo purposes, just toggle the active
          setActiveItem(items[focusedIndex].href);
        }
      }
    },
  });

  // Toggle dropdown visibility
  const toggleDropdown = (href: string) => {
    setActiveItem(activeItem === href ? null : href);
  };

  // Close active dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setActiveItem(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Set focused index to match current path
  useEffect(() => {
    const index = items.findIndex(item => pathname === item.href);
    if (index !== -1) {
      setFocusedIndex(index);
    }
  }, [pathname, items]);

  return (
    <nav
      ref={navRef}
      className={cn(
        "relative",
        variant === "horizontal" ? "flex items-center gap-1" : "flex flex-col gap-1",
        className
      )}
      onKeyDown={keyDownHandler}
      role="navigation"
      aria-label="Main Navigation"
    >
      {logoComponent && (
        <div className="mr-6">{logoComponent}</div>
      )}
      
      {items.map((item, index) => {
        const isActive = pathname === item.href;
        const isFocused = focusedIndex === index;
        const isOpen = activeItem === item.href;
        const hasChildren = !!item.children?.length;

        return (
          <div
            key={item.href}
            className={cn(
              "relative",
              variant === "horizontal" ? "inline-block" : "block w-full"
            )}
          >
            <div
              className={cn(
                isFocused && "outline-2 outline-brand-primary rounded-md",
                variant === "horizontal" ? "inline-block" : "block w-full"
              )}
            >
              {hasChildren ? (
                <Button
                  variant="ghost"
                  className={cn(
                    "flex items-center gap-1 h-9",
                    variant === "horizontal" ? "px-3 text-sm" : "w-full justify-start text-left py-2",
                    isActive && showActiveHighlight ? activeItemClassName : inactiveItemClassName
                  )}
                  aria-expanded={isOpen}
                  aria-haspopup="true"
                  aria-controls={`dropdown-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => toggleDropdown(item.href)}
                  tabIndex={0}
                >
                  {showIcons && item.icon && (
                    <span className="mr-1">{item.icon}</span>
                  )}
                  {item.label}
                  <motion.span
                    animate={isOpen ? { rotate: 180 } : { rotate: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </motion.span>
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  className={cn(
                    "h-9",
                    variant === "horizontal" ? "px-3 text-sm" : "w-full justify-start text-left py-2",
                    isActive && showActiveHighlight ? activeItemClassName : inactiveItemClassName
                  )}
                  asChild
                >
                  <Link href={item.href}>
                    {showIcons && item.icon && (
                      <span className="mr-1">{item.icon}</span>
                    )}
                    {item.label}
                  </Link>
                </Button>
              )}
            </div>

            {/* Dropdown menu */}
            {hasChildren && (
              <motion.div
                id={`dropdown-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                className={cn(
                  "absolute z-10 bg-surface-1 rounded-md shadow-lg border mt-1 overflow-hidden",
                  variant === "horizontal" ? "min-w-[200px] left-0" : "w-full left-full top-0 ml-2"
                )}
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={isOpen ? { 
                  opacity: 1, 
                  y: 0, 
                  height: 'auto',
                  transition: {
                    height: { duration: 0.2 },
                    opacity: { duration: 0.15 }
                  }
                } : { 
                  opacity: 0, 
                  y: -10, 
                  height: 0,
                  transition: {
                    height: { duration: 0.15 },
                    opacity: { duration: 0.1 }
                  }
                }}
                role="menu"
                aria-orientation="vertical"
              >
                <div className="p-2">
                  {item.children?.map((child) => (
                    <Button
                      key={child.href}
                      variant="ghost"
                      className={cn(
                        "w-full justify-start text-left py-2 px-3 text-sm rounded-sm",
                        pathname === child.href && showActiveHighlight
                          ? activeItemClassName
                          : inactiveItemClassName
                      )}
                      asChild
                      role="menuitem"
                    >
                      <Link href={child.href}>
                        {showIcons && child.icon && (
                          <span className="mr-2">{child.icon}</span>
                        )}
                        <div>
                          <div>{child.label}</div>
                          {child.description && (
                            <p className="text-xs text-content-tertiary mt-0.5">{child.description}</p>
                          )}
                        </div>
                      </Link>
                    </Button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        );
      })}
    </nav>
  );
}

export default NavigationMenu;