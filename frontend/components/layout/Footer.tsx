"use client"

import Link from 'next/link';
import { StaggerContainer, MicroMotion } from '@/components/ui/lumen-motion';
import { Glass } from '@/components/ui/lumen-glass';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <Glass
      variant="dark"
      blur="md" 
      className="w-full border-t border-[var(--c-border-subtle)]"
    >
      <div className="container mx-auto px-4 py-8">
        <StaggerContainer staggerDelay={0.05} className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--c-accent)]">
              Community.io
            </h3>
            <p className="text-sm text-[var(--c-text-secondary)]">
              The premier platform for AI practitioners, researchers, and enthusiasts to exchange knowledge,
              review tools, and collaborate.
            </p>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-[var(--c-text-primary)]">Platform</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm text-[var(--c-text-secondary)] hover:text-[var(--c-accent)] transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/tools" className="text-sm text-[var(--c-text-secondary)] hover:text-[var(--c-accent)] transition-colors">
                  Tool Directory
                </Link>
              </li>
              <li>
                <Link href="/q-and-a" className="text-sm text-[var(--c-text-secondary)] hover:text-[var(--c-accent)] transition-colors">
                  Q&A
                </Link>
              </li>
              <li>
                <Link href="/topics" className="text-sm text-[var(--c-text-secondary)] hover:text-[var(--c-accent)] transition-colors">
                  Topics
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-[var(--c-text-primary)]">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/blog" className="text-sm text-[var(--c-text-secondary)] hover:text-[var(--c-accent)] transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/documentation" className="text-sm text-[var(--c-text-secondary)] hover:text-[var(--c-accent)] transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/tutorials" className="text-sm text-[var(--c-text-secondary)] hover:text-[var(--c-accent)] transition-colors">
                  Tutorials
                </Link>
              </li>
              <li>
                <Link href="/guides" className="text-sm text-[var(--c-text-secondary)] hover:text-[var(--c-accent)] transition-colors">
                  Guides
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-[var(--c-text-primary)]">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-sm text-[var(--c-text-secondary)] hover:text-[var(--c-accent)] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-[var(--c-text-secondary)] hover:text-[var(--c-accent)] transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-[var(--c-text-secondary)] hover:text-[var(--c-accent)] transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/lumen-demo" className="text-sm text-[var(--c-accent)] hover:text-[var(--c-accent)]/80 transition-colors">
                  ✨ LUMEN Design System
                </Link>
              </li>
            </ul>
          </div>
        </StaggerContainer>
        
        <MicroMotion variant="fade" delay={0.3}>
          <div className="mt-8 border-t border-[var(--c-border-subtle)] pt-8 text-center">
            <p className="text-sm text-[var(--c-text-tertiary)]">
              &copy; {currentYear} Community.io. All rights reserved.
            </p>
            <p className="text-xs text-[var(--c-text-tertiary)] mt-1">
              Built with the LUMEN Design System — Dark-mode first, Electric-teal focused
            </p>
          </div>
        </MicroMotion>
      </div>
    </Glass>
  );
}