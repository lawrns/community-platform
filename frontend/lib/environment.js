/**
 * Utility functions for safely handling browser vs server environments
 */

// Check if code is running in a browser environment
export const isBrowser = () => typeof window !== 'undefined';

// Safely access window object
export const safeWindow = () => (isBrowser() ? window : undefined);

// Safely access document object
export const safeDocument = () => (isBrowser() ? document : undefined);

// Run a function only in browser environment
export const onlyInBrowser = (fn) => {
  if (isBrowser()) {
    return fn();
  }
  return undefined;
};
