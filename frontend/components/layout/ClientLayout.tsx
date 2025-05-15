"use client";

import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { AuthProvider } from '@/components/auth/AuthContext';
import { LoadingProvider } from '@/lib/loading-context';
import { EnhancedPageTransition } from '@/components/motion';
import { CursorEffects } from '@/components/ui/cursor-effects';
import { SkipLink } from '@/components/a11y/SkipLink';
import { MobileActionButton } from '@/components/ui/mobile-action-button';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <AuthProvider>
        <LoadingProvider>
          <div className="flex min-h-screen flex-col">
            <SkipLink href="#main-content">Skip to main content</SkipLink>
            <Header />
            <main id="main-content" className="flex-1" tabIndex={-1}>
              <EnhancedPageTransition effect="creative" showOverlay={true}>
                <CursorEffects effect="none">
                  {children}
                </CursorEffects>
              </EnhancedPageTransition>
            </main>
            <Footer />
            <MobileActionButton />
          </div>
        </LoadingProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
