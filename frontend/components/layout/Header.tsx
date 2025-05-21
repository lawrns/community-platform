"use client";

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Image as ImageIcon, Wrench, Plus, MessagesSquare, Hash, ChevronDown, Search, Paintbrush, Columns, Layout, Accessibility, LayoutDashboard, User } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { Button, ButtonWithIcon, IconButton } from '@/components/ui/lumen-button';
import { LumenThemeToggle } from '@/components/ui/lumen-theme-toggle';
import NotificationDropdown from '@/components/notifications/NotificationDropdown';
import MobileNav from './MobileNav';
import { motion, AnimatePresence } from 'framer-motion';
import { MicroMotion, StaggerContainer } from '@/components/ui/lumen-motion';
import { Glass } from '@/components/ui/lumen-glass';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const { user, logout } = useAuth();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <Glass
      variant={isHomePage ? 'accent' : 'light'}
      blur={isHomePage ? 'lg' : 'md'}
      border={isHomePage ? 'none' : 'subtle'}
      shadow={isHomePage ? 'none' : 'sm'}
      interactive={isHomePage ? 'hover' : 'none'}
      className="w-full sticky top-0 z-40 transition-all"
    >
      <div className={`container mx-auto flex items-center justify-between px-4 ${isHomePage ? 'py-6' : 'h-16'}`}> 
        <div className="flex items-center gap-6">
          <Link href="/" className="group flex items-center gap-2 relative">
            <div className="absolute -inset-2 rounded-lg bg-[var(--c-accent)]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <MicroMotion
              variant="scale"
              className="relative z-10 flex items-center"
            >
              <span className="text-2xl font-bold text-[var(--c-accent)]">
                Community.io
              </span>
            </MicroMotion>
          </Link>
          
          <nav className="hidden md:flex items-center gap-1">
            {/* Tools Dropdown */}
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                animated
                className="px-3 text-sm font-medium flex items-center gap-1 h-9"
                onMouseEnter={() => setHoveredItem('tools')}
                onMouseLeave={() => setHoveredItem(null)}
              >
                  <Wrench className="h-4 w-4 mr-1" />
                  Tools
                  <motion.span
                    animate={hoveredItem === 'tools' ? { rotate: 180 } : { rotate: 0 }}
                    transition={{ duration: 0.12 }}
                  >
                    <ChevronDown className="h-4 w-4 opacity-60" />
                  </motion.span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 bg-[var(--c-surface-2)]">
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
            <Button 
              variant="ghost" 
              className="px-3 text-sm font-medium h-9"
              asChild
              animated
            >
              <Link href="/q-and-a" className="flex items-center gap-1">
                <MessagesSquare className="h-4 w-4 mr-1" />
                Q&A
              </Link>
            </Button>
            
            {/* Topics Dropdown */}
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  animated
                  className="px-3 text-sm font-medium flex items-center gap-1 h-9"
                  onMouseEnter={() => setHoveredItem('topics')}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <Hash className="h-4 w-4 mr-1" />
                  Topics
                  <motion.span
                    animate={hoveredItem === 'topics' ? { rotate: 180 } : { rotate: 0 }}
                    transition={{ duration: 0.12 }}
                  >
                    <ChevronDown className="h-4 w-4 opacity-60" />
                  </motion.span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 bg-[var(--c-surface-2)]">
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
            <Button 
              variant="ghost" 
              className="px-3 text-sm font-medium h-9"
              asChild
              animated
            >
              <Link href="/search" className="flex items-center gap-1">
                <Search className="h-4 w-4 mr-1" />
                Search
              </Link>
            </Button>
            
            {/* Design System Dropdown */}
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  animated
                  className="px-3 text-sm font-medium flex items-center gap-1 h-9"
                  onMouseEnter={() => setHoveredItem('design')}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <Paintbrush className="h-4 w-4 mr-1" />
                  Design System
                  <motion.span
                    animate={hoveredItem === 'design' ? { rotate: 180 } : { rotate: 0 }}
                    transition={{ duration: 0.12 }}
                  >
                    <ChevronDown className="h-4 w-4 opacity-60" />
                  </motion.span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 bg-[var(--c-surface-2)]">
                <DropdownMenuItem asChild>
                  <Link href="/design-system" className="flex items-center cursor-pointer">
                    <Paintbrush className="mr-2 h-4 w-4" />
                    <span>Design System Overview</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/lumen-demo" className="flex items-center cursor-pointer">
                    <span className="mr-2 text-[var(--c-accent)]">✨</span>
                    <span>LUMEN Design System</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/refined-demo" className="flex items-center cursor-pointer">
                    <span className="mr-2">✨</span>
                    <span>Refined UI Demo</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/icon-demo" className="flex items-center cursor-pointer">
                    <span className="mr-2 text-xs">📦</span>
                    <span>Icon System</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/visual-demo" className="flex items-center cursor-pointer">
                    <span className="mr-2 text-xs">🎨</span>
                    <span>Visual Demo</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/responsive-demo" className="flex items-center cursor-pointer">
                    <Columns className="mr-2 h-4 w-4" />
                    <span>Responsive Container</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/responsive-layout-demo" className="flex items-center cursor-pointer">
                    <Layout className="mr-2 h-4 w-4" />
                    <span>Responsive Layout</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/loading-demo" className="flex items-center cursor-pointer">
                    <span className="flex h-3 w-3 mr-2 items-center justify-center">
                      <span className="animate-spin h-3 w-3 rounded-full border-2 border-[var(--c-text-secondary)] border-t-transparent"></span>
                    </span>
                    <span>Loading States</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/image-demo" className="flex items-center cursor-pointer">
                    <ImageIcon className="mr-2 h-4 w-4" />
                    <span>Image Optimization</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/accessibility" className="flex items-center cursor-pointer">
                    <Accessibility className="mr-2 h-4 w-4" />
                    <span>Accessibility</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <ButtonWithIcon
                variant="primary"
                icon={<Plus className="h-4 w-4" />}
                size="sm"
                glow="subtle"
                animated
                asChild
              >
                <Link href="/create">Create</Link>
              </ButtonWithIcon>
              
              <Button 
                variant="ghost" 
                size="sm"
                className="flex items-center gap-1"
                asChild
                animated
              >
                <Link href="/dashboard">
                  <LayoutDashboard className="h-4 w-4 mr-1" />
                  Dashboard
                </Link>
              </Button>
              
              {/* Notification Dropdown with Animation */}
              <MicroMotion variant="scale">
                <NotificationDropdown />
              </MicroMotion>
              
              {/* Profile Menu Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.button
                    className="relative ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--c-accent)]/10 ring-offset-background transition-colors hover:bg-[var(--c-accent)]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17, duration: 0.12 }}
                  >
                    <User className="h-4 w-4 text-[var(--c-accent)]" />
                    <span className="sr-only">User menu</span>
                  </motion.button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-[var(--c-surface-2)]">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--c-accent)]/10">
                      <User className="h-5 w-5 text-[var(--c-accent)]" />
                    </div>
                    <div className="flex flex-col space-y-0.5">
                      <p className="text-sm font-medium">{user.email}</p>
                      <p className="text-xs text-[var(--c-text-secondary)]">Community Member</p>
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
                    onClick={() => logout()}
                    className="cursor-pointer text-[var(--c-danger)] focus:text-[var(--c-danger)]"
                  >
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            /* Auth Buttons - Only show when not logged in */
            <div className="hidden md:flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-[var(--c-text-secondary)] hover:text-[var(--c-text-primary)]"
                asChild
                animated
              >
                <Link href="/signin">Sign In</Link>
              </Button>
              
              <Button 
                variant="primary"
                size="sm"
                glow="medium"
                animated
                asChild
              >
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          )}
          
          {/* Mobile Navigation Menu */}
          <div className="md:hidden">
            <MobileNav />
          </div>
        </div>
      </div>
    </Glass>
  );
}