"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Wrench, MessagesSquare, Hash, Search, User, Plus, LayoutDashboard, Settings, LogOut } from 'lucide-react';
import { Button, IconButton } from '@/components/ui/lumen-button';
import { Glass } from '@/components/ui/lumen-glass';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/components/auth/AuthContext';
import { MicroMotion, StaggerContainer } from '@/components/ui/lumen-motion';

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  
  // Animation variants
  const menuVariants = {
    closed: {
      opacity: 0,
      x: '100%',
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
        staggerChildren: 0.05,
        staggerDirection: -1,
        when: 'afterChildren'
      }
    },
    open: {
      opacity: 1,
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
        staggerChildren: 0.1,
        delayChildren: 0.2,
        when: 'beforeChildren'
      }
    }
  };
  
  const itemVariants = {
    closed: { opacity: 0, x: 20 },
    open: { opacity: 1, x: 0 }
  };
  
  const backdropVariants = {
    closed: { opacity: 0 },
    open: { opacity: 1 }
  };
  
  return (
    <div className="flex md:hidden">
      <IconButton
        icon={<Menu className="h-5 w-5" />}
        variant="ghost"
        size="sm"
        glow="subtle"
        label="Toggle menu"
        onClick={() => setIsOpen(true)}
      />
      
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              className="fixed inset-0 z-50 bg-[var(--c-bg)]/80 backdrop-blur-sm"
              initial="closed"
              animate="open"
              exit="closed"
              variants={backdropVariants}
              onClick={() => setIsOpen(false)}
            />
            
            {/* Menu panel */}
            <Glass 
              as={motion.div}
              variant="dark"
              blur="lg"
              shadow="md"
              className="fixed inset-y-0 right-0 z-50 w-3/4 max-w-sm border-l p-6"
              initial="closed"
              animate="open"
              exit="closed"
              variants={menuVariants}
            >
              <div className="flex justify-between items-center mb-8">
                <motion.span 
                  className="text-lg font-semibold text-[var(--c-accent)]"
                  variants={itemVariants}
                >
                  Menu
                </motion.span>
                <IconButton
                  icon={<X className="h-5 w-5" />}
                  variant="ghost"
                  size="sm"
                  glow="subtle"
                  label="Close menu"
                  onClick={() => setIsOpen(false)}
                />
              </div>
              
              <div className="flex flex-col gap-6">
                {/* Navigation links */}
                <StaggerContainer className="flex flex-col gap-2">
                  <Link 
                    href="/tools" 
                    className="flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium hover:bg-[var(--c-surface-2)] hover:text-[var(--c-accent)] transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <Wrench className="h-5 w-5 text-[var(--c-text-secondary)]" />
                    Tools
                  </Link>
                  
                  <Link 
                    href="/q-and-a" 
                    className="flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium hover:bg-[var(--c-surface-2)] hover:text-[var(--c-accent)] transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <MessagesSquare className="h-5 w-5 text-[var(--c-text-secondary)]" />
                    Q&A
                  </Link>
                  
                  <Link 
                    href="/topics" 
                    className="flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium hover:bg-[var(--c-surface-2)] hover:text-[var(--c-accent)] transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <Hash className="h-5 w-5 text-[var(--c-text-secondary)]" />
                    Topics
                  </Link>
                  
                  <Link 
                    href="/search" 
                    className="flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium hover:bg-[var(--c-surface-2)] hover:text-[var(--c-accent)] transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <Search className="h-5 w-5 text-[var(--c-text-secondary)]" />
                    Search
                  </Link>
                  
                  <Link 
                    href="/lumen-demo" 
                    className="flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium text-[var(--c-accent)] hover:bg-[var(--c-surface-2)] hover:text-[var(--c-accent)] transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="h-5 w-5 flex items-center justify-center text-[var(--c-accent)]">✨</span>
                    LUMEN Design
                  </Link>
                </StaggerContainer>
                
                {/* User-specific actions */}
                {user ? (
                  <StaggerContainer className="flex flex-col gap-2">
                    <div className="pt-2 pb-1">
                      <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--c-text-secondary)]">
                        Account
                      </div>
                      <div className="flex items-center gap-3 rounded-md px-3 py-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--c-accent)]/10">
                          <User className="h-5 w-5 text-[var(--c-accent)]" />
                        </div>
                        <div>
                          <div className="text-sm font-medium">{user.email}</div>
                          <div className="text-xs text-[var(--c-text-secondary)]">Community Member</div>
                        </div>
                      </div>
                    </div>
                    
                    <Link 
                      href="/dashboard" 
                      className="flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium hover:bg-[var(--c-surface-2)] hover:text-[var(--c-accent)] transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <LayoutDashboard className="h-5 w-5 text-[var(--c-text-secondary)]" />
                      Dashboard
                    </Link>
                    
                    <Link 
                      href="/create" 
                      className="flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium hover:bg-[var(--c-surface-2)] hover:text-[var(--c-accent)] transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <Plus className="h-5 w-5 text-[var(--c-text-secondary)]" />
                      Create
                    </Link>
                    
                    <Link 
                      href="/profile" 
                      className="flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium hover:bg-[var(--c-surface-2)] hover:text-[var(--c-accent)] transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <User className="h-5 w-5 text-[var(--c-text-secondary)]" />
                      Profile
                    </Link>
                    
                    <Link 
                      href="/settings" 
                      className="flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium hover:bg-[var(--c-surface-2)] hover:text-[var(--c-accent)] transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <Settings className="h-5 w-5 text-[var(--c-text-secondary)]" />
                      Settings
                    </Link>
                    
                    <div className="mt-2 pt-2 border-t border-[var(--c-border-subtle)]">
                      <button 
                        className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-base font-medium text-[var(--c-danger)] hover:bg-[var(--c-danger)]/10 transition-colors"
                        onClick={() => {
                          logout();
                          setIsOpen(false);
                        }}
                      >
                        <LogOut className="h-5 w-5" />
                        Sign Out
                      </button>
                    </div>
                  </StaggerContainer>
                ) : (
                  <div className="flex flex-col gap-3 pt-4 border-t border-[var(--c-border-subtle)]">
                    <Button 
                      variant="outline" 
                      className="w-full justify-center"
                      asChild
                    >
                      <Link 
                        href="/signin"
                        onClick={() => setIsOpen(false)}
                      >
                        Sign In
                      </Link>
                    </Button>
                    
                    <Button 
                      variant="primary"
                      glow="medium"
                      className="w-full justify-center"
                      asChild
                    >
                      <Link 
                        href="/signup"
                        onClick={() => setIsOpen(false)}
                      >
                        Sign Up
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </Glass>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}