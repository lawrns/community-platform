/**
 * Utility functions for safely handling browser-specific code
 * This prevents "window is not defined" errors during server-side rendering
 */

// Check if code is running in browser environment
export const isBrowser = () => typeof window !== 'undefined';

// Dynamic import for components that use browser APIs
export function dynamicImport(modulePath: string) {
  if (isBrowser()) {
    return import(modulePath);
  }
  return Promise.resolve(null);
}

// Safe wrapper for browser-only code
export function withBrowser<T>(fn: () => T, fallback: T): T {
  if (isBrowser()) {
    return fn();
  }
  return fallback;
}
