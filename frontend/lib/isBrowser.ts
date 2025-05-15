/**
 * Utility to safely check if code is running in a browser environment
 * This helps prevent "window is not defined" errors during server-side rendering
 */

export const isBrowser = (): boolean => {
  return typeof window !== 'undefined';
};

/**
 * Safely access window object
 * @returns The window object if in browser, or null if in server environment
 */
export const safeWindow = (): Window | null => {
  return isBrowser() ? window : null;
};

/**
 * Safely access document object
 * @returns The document object if in browser, or null if in server environment
 */
export const safeDocument = (): Document | null => {
  return isBrowser() ? document : null;
};

/**
 * Execute a function only in browser environment
 * @param fn Function to execute in browser environment
 */
export const onlyBrowser = (fn: () => void): void => {
  if (isBrowser()) {
    fn();
  }
};
