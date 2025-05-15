/**
 * Utility functions for handling client-side only code
 */

// Check if code is running in a browser environment
export const isBrowser = () => typeof window !== 'undefined';

// Safe wrapper for accessing window
export const safeWindow = () => (isBrowser() ? window : undefined);

// Safe wrapper for accessing document
export const safeDocument = () => (isBrowser() ? document : undefined);

// Dynamic import helper
export const dynamicImport = (path) => {
  if (isBrowser()) {
    return import(path);
  }
  return Promise.resolve(null);
};
