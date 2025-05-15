'use client';

import { useState, useEffect } from 'react';

/**
 * ClientSideOnly component
 * 
 * This component ensures its children are only rendered in the browser,
 * preventing "window is not defined" errors during server-side rendering.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to render only on the client
 * @param {React.ReactNode} props.fallback - Optional content to show during server-side rendering
 */
export default function ClientSideOnly({ children, fallback = null }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return fallback;
  }

  return children;
}
