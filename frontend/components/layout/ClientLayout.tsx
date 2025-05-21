"use client";

import React from 'react';
import ModernHeader from '@/components/layout/ModernHeader';
import Footer from '@/components/layout/Footer';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { AuthProvider } from '@/components/auth/AuthContext';
import { LoadingProvider } from '@/lib/loading-context';
import { MicroMotion } from '@/components/ui/lumen-motion';
import { SkipLink } from '@/components/a11y/SkipLink';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <AuthProvider>
        <LoadingProvider>
          <div className="min-h-screen flex flex-col bg-white dark:bg-bg-1 text-neutral-900 dark:text-neutral-100">
            <SkipLink href="#main-content">Skip to main content</SkipLink>
            {/* We don't render the header in layout because home has customized header */}
            <main id="main-content" className="flex-1" tabIndex={-1}>
              <MicroMotion variant="fade" duration={0.2}>
                {children}
              </MicroMotion>
            </main>
            <Footer />
          </div>
        </LoadingProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
