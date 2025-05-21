"use client"

import Link from 'next/link';
import { StaggerContainer, MicroMotion } from '@/components/ui/lumen-motion';
import { Glass } from '@/components/ui/lumen-glass';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-bg-1 border-t border-neutral-200 dark:border-neutral-800">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="space-y-4 col-span-2 md:col-span-1">
            <h3 className="text-lg font-semibold text-brand-500">
              Community.io
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              The premier platform for AI practitioners, researchers, and enthusiasts to exchange knowledge,
              review tools, and collaborate.
            </p>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Platform</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-brand-500 dark:hover:text-brand-400 transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/tools" className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-brand-500 dark:hover:text-brand-400 transition-colors">
                  Tool Directory
                </Link>
              </li>
              <li>
                <Link href="/q-and-a" className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-brand-500 dark:hover:text-brand-400 transition-colors">
                  Q&A
                </Link>
              </li>
              <li>
                <Link href="/topics" className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-brand-500 dark:hover:text-brand-400 transition-colors">
                  Topics
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/blog" className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-brand-500 dark:hover:text-brand-400 transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/documentation" className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-brand-500 dark:hover:text-brand-400 transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/tutorials" className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-brand-500 dark:hover:text-brand-400 transition-colors">
                  Tutorials
                </Link>
              </li>
              <li>
                <Link href="/guides" className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-brand-500 dark:hover:text-brand-400 transition-colors">
                  Guides
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-brand-500 dark:hover:text-brand-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-brand-500 dark:hover:text-brand-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-brand-500 dark:hover:text-brand-400 transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/design-system" className="text-sm text-brand-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  ✨ Design System
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 border-t border-neutral-200 dark:border-neutral-800 pt-8 text-center">
          <p className="text-sm text-neutral-500 dark:text-neutral-500">
            &copy; {currentYear} Community.io. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}