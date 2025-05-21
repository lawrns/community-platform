"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Glass } from '@/components/ui/lumen-glass';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Menu, X } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { Button } from '@/components/ui/button';
import CommandMenu from '@/components/ui/command-menu';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export default function ModernHeader() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const initials = user?.email?.charAt(0).toUpperCase() || 'U';

  return (
    <>
      <CommandMenu />
      
      <Glass
        variant={isHomePage ? 'default' : 'light'}
        blur="lg"
        border={isHomePage ? 'subtle' : 'subtle'}
        shadow="glass"
        interactive="none"
        className="w-full sticky top-0 z-40 transition-all"
      >
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <motion.span 
                className="relative text-xl font-bold text-brand-500"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                Community.io
              </motion.span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <Button variant="ghost" asChild className="text-sm">
              <Link href="/tools">Tools</Link>
            </Button>
            <Button variant="ghost" asChild className="text-sm">
              <Link href="/q-and-a">Q&A</Link>
            </Button>
            <Button variant="ghost" asChild className="text-sm">
              <Link href="/topics">Topics</Link>
            </Button>
            
            {/* Command Menu Trigger */}
            <Button 
              variant="outline" 
              size="sm"
              className="ml-4 mr-2 text-sm gap-2 hidden lg:flex"
              onClick={() => document.dispatchEvent(
                new KeyboardEvent('keydown', { key: 'k', metaKey: true })
              )}
            >
              <Search className="h-4 w-4" />
              <span>Search</span>
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-800 px-1.5 font-mono text-[10px] font-medium text-neutral-600 dark:text-neutral-400">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>

            {/* User Account Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.button 
                    className="relative h-8 w-8 rounded-full overflow-hidden border border-neutral-200 dark:border-neutral-800"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Avatar>
                      <AvatarImage src="" alt={user.email} />
                      <AvatarFallback className="bg-brand-500/10 text-brand-600 dark:text-brand-400">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </motion.button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-brand-500/10 text-brand-600 dark:text-brand-400">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-0.5">
                      <p className="text-sm font-medium">{user.email}</p>
                      <p className="text-xs text-neutral-500">Community Member</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer">
                      Dashboard
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
                    className="cursor-pointer text-red-500 focus:text-red-500"
                  >
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  asChild
                >
                  <Link href="/signin">Sign In</Link>
                </Button>
                
                <Button 
                  variant="default"
                  size="sm"
                  className="bg-brand-500 hover:bg-brand-600 text-white"
                  asChild
                >
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="h-9 w-9 p-0"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden p-4 pt-0 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-bg-1">
            <div className="flex flex-col space-y-3">
              <Link 
                href="/tools" 
                className="py-2 px-3 text-sm rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                Tools
              </Link>
              <Link 
                href="/q-and-a" 
                className="py-2 px-3 text-sm rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                Q&A
              </Link>
              <Link 
                href="/topics" 
                className="py-2 px-3 text-sm rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                Topics
              </Link>
              <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800">
                {user ? (
                  <>
                    <div className="flex items-center mb-3">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarFallback className="bg-brand-500/10 text-brand-600 dark:text-brand-400">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{user.email}</p>
                        <p className="text-xs text-neutral-500">Community Member</p>
                      </div>
                    </div>
                    <Link 
                      href="/profile" 
                      className="py-2 px-3 text-sm rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 block"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link 
                      href="/dashboard" 
                      className="py-2 px-3 text-sm rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 block"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link 
                      href="/settings" 
                      className="py-2 px-3 text-sm rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 block"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Settings
                    </Link>
                    <button 
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full text-left py-2 px-3 text-sm rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 mt-2"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col space-y-2">
                    <Button 
                      variant="ghost" 
                      asChild
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Link href="/signin">Sign In</Link>
                    </Button>
                    
                    <Button 
                      variant="default"
                      className="bg-brand-500 hover:bg-brand-600 text-white w-full"
                      asChild
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Link href="/signup">Sign Up</Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Glass>
    </>
  );
}