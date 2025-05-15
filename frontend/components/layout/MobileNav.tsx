"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Wrench, MessagesSquare, Hash, Search, User, Plus, LayoutDashboard, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/components/auth/AuthContext';

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
      <motion.button
        className="flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
        onClick={() => setIsOpen(true)}
        whileTap={{ scale: 0.9 }}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </motion.button>
      
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
              initial="closed"
              animate="open"
              exit="closed"
              variants={backdropVariants}
              onClick={() => setIsOpen(false)}
            />
            
            {/* Menu panel */}
            <motion.div 
              className="fixed inset-y-0 right-0 z-50 w-3/4 max-w-sm border-l bg-background p-6 shadow-xl"
              initial="closed"
              animate="open"
              exit="closed"
              variants={menuVariants}
            >
              <div className="flex justify-between items-center mb-8">
                <motion.span 
                  className="text-lg font-semibold"
                  variants={itemVariants}
                >
                  Menu
                </motion.span>
                <motion.button
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                  onClick={() => setIsOpen(false)}
                  whileTap={{ scale: 0.9 }}
                  variants={itemVariants}
                >
                  <X className="h-5 w-5" />
                  <span className="sr-only">Close menu</span>
                </motion.button>
              </div>
              
              <div className="flex flex-col gap-6">
                {/* Navigation links */}
                <nav className="flex flex-col gap-2">
                  <motion.div variants={itemVariants}>
                    <Link 
                      href="/tools" 
                      className="flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <Wrench className="h-5 w-5 text-muted-foreground" />
                      Tools
                    </Link>
                  </motion.div>
                  
                  <motion.div variants={itemVariants}>
                    <Link 
                      href="/q-and-a" 
                      className="flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <MessagesSquare className="h-5 w-5 text-muted-foreground" />
                      Q&A
                    </Link>
                  </motion.div>
                  
                  <motion.div variants={itemVariants}>
                    <Link 
                      href="/topics" 
                      className="flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <Hash className="h-5 w-5 text-muted-foreground" />
                      Topics
                    </Link>
                  </motion.div>
                  
                  <motion.div variants={itemVariants}>
                    <Link 
                      href="/search" 
                      className="flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <Search className="h-5 w-5 text-muted-foreground" />
                      Search
                    </Link>
                  </motion.div>
                </nav>
                
                {/* User-specific actions */}
                {user ? (
                  <div className="flex flex-col gap-2">
                    <motion.div 
                      className="pt-2 pb-1"
                      variants={itemVariants}
                    >
                      <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Account
                      </div>
                      <div className="flex items-center gap-3 rounded-md px-3 py-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="text-sm font-medium">{user.email}</div>
                          <div className="text-xs text-muted-foreground">Community Member</div>
                        </div>
                      </div>
                    </motion.div>
                    
                    <motion.div variants={itemVariants}>
                      <Link 
                        href="/dashboard" 
                        className="flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        <LayoutDashboard className="h-5 w-5 text-muted-foreground" />
                        Dashboard
                      </Link>
                    </motion.div>
                    
                    <motion.div variants={itemVariants}>
                      <Link 
                        href="/create" 
                        className="flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        <Plus className="h-5 w-5 text-muted-foreground" />
                        Create
                      </Link>
                    </motion.div>
                    
                    <motion.div variants={itemVariants}>
                      <Link 
                        href="/profile" 
                        className="flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        <User className="h-5 w-5 text-muted-foreground" />
                        Profile
                      </Link>
                    </motion.div>
                    
                    <motion.div variants={itemVariants}>
                      <Link 
                        href="/settings" 
                        className="flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        <Settings className="h-5 w-5 text-muted-foreground" />
                        Settings
                      </Link>
                    </motion.div>
                    
                    <motion.div 
                      className="mt-2 pt-2 border-t"
                      variants={itemVariants}
                    >
                      <button 
                        className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-base font-medium text-destructive hover:bg-destructive/10 transition-colors"
                        onClick={() => {
                          logout();
                          setIsOpen(false);
                        }}
                      >
                        <LogOut className="h-5 w-5" />
                        Sign Out
                      </button>
                    </motion.div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 pt-4 border-t">
                    <motion.div variants={itemVariants}>
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
                    </motion.div>
                    
                    <motion.div variants={itemVariants}>
                      <Button 
                        className="w-full justify-center bg-primary hover:bg-primary/90"
                        asChild
                      >
                        <Link 
                          href="/signup"
                          onClick={() => setIsOpen(false)}
                        >
                          Sign Up
                        </Link>
                      </Button>
                    </motion.div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}