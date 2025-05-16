"use client";

import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { AuthProvider } from '@/components/auth/AuthContext';
import { LoadingProvider } from '@/lib/loading-context';
import { MicroMotion } from '@/components/ui/lumen-motion';
import { Glass } from '@/components/ui/lumen-glass';
import { CursorEffects } from '@/components/ui/cursor-effects';
import { SkipLink } from '@/components/a11y/SkipLink';
import { MobileActionButton } from '@/components/ui/mobile-action-button';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <AuthProvider>
        <LoadingProvider>
          <div className="lumen-fullpage">
            <SkipLink href="#main-content">Skip to main content</SkipLink>
            <Header />
            <main id="main-content" className="flex-1" tabIndex={-1}>
              <MicroMotion variant="fade" duration={0.2}>
                <CursorEffects effect="none">
                  {children}
                </CursorEffects>
              </MicroMotion>
            </main>
            <Footer />
            <MobileActionButton />
          </div>
        </LoadingProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
