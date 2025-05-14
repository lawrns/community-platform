"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import NotificationDropdown from '@/components/notifications/NotificationDropdown';
import MobileNav from './MobileNav';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Plus, LayoutDashboard, Search, Wrench, MessagesSquare, Hash, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const { user, signOut } = useAuth();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Animation variants for menu items
  const itemVariants = {
    hidden: { opacity: 0, y: -5 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.header 
      className="w-full border-b sticky top-0 z-40 bg-background/95 backdrop-blur-sm"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="group flex items-center gap-2 relative">
            <div className="absolute -inset-2 rounded-lg bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <motion.div
              className="relative z-10 flex items-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                type: 'spring',
                stiffness: 500,
                damping: 30,
                delay: 0.1
              }}
            >
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                Community.io
              </span>
            </motion.div>
          </Link>
          
          <nav className="hidden md:flex items-center gap-1">
            {/* Tools Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="px-3 text-sm font-medium flex items-center gap-1 h-9"
                  onMouseEnter={() => setHoveredItem('tools')}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <Wrench className="h-4 w-4 mr-1" />
                  Tools
                  <motion.span
                    animate={hoveredItem === 'tools' ? { rotate: 180 } : { rotate: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </motion.span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/tools" className="flex items-center cursor-pointer">
                    <Wrench className="mr-2 h-4 w-4" />
                    <span>All Tools</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/tools?category=generative-ai" className="flex items-center cursor-pointer">
                    <span>Generative AI</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/tools?category=productivity" className="flex items-center cursor-pointer">
                    <span>Productivity</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/tools/submit" className="flex items-center cursor-pointer">
                    <Plus className="mr-2 h-4 w-4" />
                    <span>Submit a Tool</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Q&A Menu Item with Animation */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            >
              <Button 
                variant="ghost" 
                className="px-3 text-sm font-medium h-9"
                asChild
              >
                <Link href="/q-and-a" className="flex items-center gap-1">
                  <MessagesSquare className="h-4 w-4 mr-1" />
                  Q&A
                </Link>
              </Button>
            </motion.div>
            
            {/* Topics Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="px-3 text-sm font-medium flex items-center gap-1 h-9"
                  onMouseEnter={() => setHoveredItem('topics')}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <Hash className="h-4 w-4 mr-1" />
                  Topics
                  <motion.span
                    animate={hoveredItem === 'topics' ? { rotate: 180 } : { rotate: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </motion.span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/topics" className="flex items-center cursor-pointer">
                    <Hash className="mr-2 h-4 w-4" />
                    <span>All Topics</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/topics/trending" className="flex items-center cursor-pointer">
                    <span>Trending Topics</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/topics/ai-ethics" className="flex items-center cursor-pointer">
                    <span>AI Ethics</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/topics/machine-learning" className="flex items-center cursor-pointer">
                    <span>Machine Learning</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Search Button with Animation */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            >
              <Button 
                variant="ghost" 
                className="px-3 text-sm font-medium h-9"
                asChild
              >
                <Link href="/search" className="flex items-center gap-1">
                  <Search className="h-4 w-4 mr-1" />
                  Search
                </Link>
              </Button>
            </motion.div>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: 30 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          >
            <ThemeToggle />
          </motion.div>
          
          {user ? (
            <>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center gap-1 bg-primary/5 hover:bg-primary/10"
                  asChild
                >
                  <Link href="/create">
                    <Plus className="h-4 w-4 mr-1" />
                    Create
                  </Link>
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="flex items-center gap-1"
                  asChild
                >
                  <Link href="/dashboard">
                    <LayoutDashboard className="h-4 w-4 mr-1" />
                    Dashboard
                  </Link>
                </Button>
              </motion.div>
              
              {/* Notification Dropdown with Animation */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                <NotificationDropdown />
              </motion.div>
              
              {/* Profile Menu Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.button
                    className="relative ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 ring-offset-background transition-colors hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  >
                    <User className="h-4 w-4 text-primary" />
                    <span className="sr-only">User menu</span>
                  </motion.button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex flex-col space-y-0.5">
                      <p className="text-sm font-medium">{user.email}</p>
                      <p className="text-xs text-muted-foreground">Community Member</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer">
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => signOut()}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            /* Auth Buttons - Only show when not logged in */
            <div className="hidden md:flex items-center gap-2">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                  asChild
                >
                  <Link href="/signin">Sign In</Link>
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                <Button 
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-white"
                  asChild
                >
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </motion.div>
            </div>
          )}
          
          {/* Mobile Navigation Menu */}
          <div className="md:hidden">
            <MobileNav />
          </div>
        </div>
      </div>
    </motion.header>
  );
}