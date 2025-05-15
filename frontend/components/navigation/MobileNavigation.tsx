"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, X, ChevronRight, ChevronLeft } from "lucide-react";
import { useFocusTrap } from "@/lib/a11y/useFocusTrap";
import { FocusTrap } from "@/components/a11y/FocusTrap";
import { VisuallyHidden } from "@/components/a11y/VisuallyHidden";
import { NavItem, NavItemWithChildren } from "./NavigationMenu";

interface MobileNavigationProps {
  items: NavItem[];
  className?: string;
  showIcons?: boolean;
  logoComponent?: React.ReactNode;
  onNavigate?: () => void;
  buttonClassName?: string;
}

/**
 * Mobile navigation component with slide-out drawer and nested menus
 */
export function MobileNavigation({
  items,
  className,
  showIcons = true,
  logoComponent,
  onNavigate,
  buttonClassName,
}: MobileNavigationProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [submenuItems, setSubmenuItems] = useState<NavItemWithChildren[]>([]);
  const [submenuParent, setSubmenuParent] = useState<string>("");
  
  // Close the menu when the URL changes
  useEffect(() => {
    setIsOpen(false);
    setActiveSubmenu(null);
  }, [pathname]);
  
  // Handle submenu opening
  const openSubmenu = (item: NavItem) => {
    if (item.children?.length) {
      setSubmenuItems(item.children);
      setSubmenuParent(item.label);
      setActiveSubmenu(item.href);
    }
  };
  
  // Handle submenu back button
  const closeSubmenu = () => {
    setActiveSubmenu(null);
  };
  
  // Handle navigation item click
  const handleNavigation = (href: string) => {
    setIsOpen(false);
    if (onNavigate) onNavigate();
  };
  
  // Animation variants
  const menuVariants = {
    closed: {
      x: "-100%",
      opacity: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40,
      }
    },
    open: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40,
      }
    }
  };
  
  const submenuVariants = {
    enter: {
      x: "100%",
      opacity: 0
    },
    center: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40,
      }
    },
    exit: {
      x: "-100%",
      opacity: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40,
      }
    }
  };
  
  const overlayVariants = {
    closed: { opacity: 0 },
    open: { opacity: 1 }
  };
  
  return (
    <div className={className}>
      {/* Menu Toggle Button */}
      <Button
        variant="ghost"
        size="sm"
        className={cn("p-2", buttonClassName)}
        onClick={() => setIsOpen(true)}
        aria-label="Open menu"
        aria-expanded={isOpen}
        aria-controls="mobile-navigation"
      >
        <Menu className="h-5 w-5" />
      </Button>
      
      {/* Overlay Background */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            initial="closed"
            animate="open"
            exit="closed"
            variants={overlayVariants}
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
      
      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isOpen && (
          <FocusTrap active={isOpen} onDeactivate={() => setIsOpen(false)}>
            <motion.div
              id="mobile-navigation"
              className="fixed inset-y-0 left-0 w-[280px] bg-surface-1 z-50 shadow-xl flex flex-col h-screen"
              initial="closed"
              animate="open"
              exit="closed"
              variants={menuVariants}
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation menu"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                {logoComponent ? (
                  <div>{logoComponent}</div>
                ) : (
                  <div className="font-bold text-display">Menu</div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              {/* Main Menu */}
              <div className="flex-1 overflow-y-auto">
                <AnimatePresence mode="wait" initial={false}>
                  {activeSubmenu ? (
                    <motion.div
                      key="submenu"
                      className="h-full"
                      initial="enter"
                      animate="center"
                      exit="exit"
                      variants={submenuVariants}
                    >
                      {/* Submenu Header */}
                      <button
                        className="flex items-center w-full p-4 text-content-primary font-medium border-b"
                        onClick={closeSubmenu}
                      >
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        <span>Back to Menu</span>
                      </button>
                      
                      {/* Submenu Title */}
                      <div className="p-4 pb-2 text-content-secondary text-sm">
                        {submenuParent}
                      </div>
                      
                      {/* Submenu Items */}
                      <div className="p-2">
                        {submenuItems.map((item) => (
                          <Button
                            key={item.href}
                            variant="ghost"
                            className={cn(
                              "w-full justify-start text-left p-3 mb-1",
                              pathname === item.href 
                                ? "bg-surface-2 text-content-primary font-medium" 
                                : "text-content-secondary"
                            )}
                            asChild
                          >
                            <Link href={item.href} onClick={() => handleNavigation(item.href)}>
                              {showIcons && item.icon && (
                                <span className="mr-3">{item.icon}</span>
                              )}
                              <div>
                                <div>{item.label}</div>
                                {item.description && (
                                  <p className="text-xs text-content-tertiary mt-1">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                            </Link>
                          </Button>
                        ))}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="mainmenu"
                      className="h-full"
                      initial="enter"
                      animate="center"
                      exit="exit"
                      variants={submenuVariants}
                    >
                      <div className="p-2">
                        {items.map((item) => {
                          const hasChildren = !!item.children?.length;
                          const isActive = pathname === item.href;
                          
                          return (
                            <Button
                              key={item.href}
                              variant="ghost"
                              className={cn(
                                "w-full justify-start text-left p-3 mb-1",
                                isActive 
                                  ? "bg-surface-2 text-content-primary font-medium" 
                                  : "text-content-secondary"
                              )}
                              onClick={() => {
                                if (hasChildren) {
                                  openSubmenu(item);
                                } else {
                                  handleNavigation(item.href);
                                }
                              }}
                              asChild={!hasChildren}
                            >
                              {hasChildren ? (
                                <div className="flex items-center justify-between w-full">
                                  <div className="flex items-center">
                                    {showIcons && item.icon && (
                                      <span className="mr-3">{item.icon}</span>
                                    )}
                                    <span>{item.label}</span>
                                  </div>
                                  <ChevronRight className="h-4 w-4 opacity-50" />
                                </div>
                              ) : (
                                <Link href={item.href}>
                                  <div className="flex items-center">
                                    {showIcons && item.icon && (
                                      <span className="mr-3">{item.icon}</span>
                                    )}
                                    <span>{item.label}</span>
                                  </div>
                                </Link>
                              )}
                            </Button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </FocusTrap>
        )}
      </AnimatePresence>
    </div>
  );
}

export default MobileNavigation;