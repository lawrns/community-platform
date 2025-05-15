"use client";

import { useEffect, useState } from 'react';

/**
 * ClientOnly component
 * 
 * This component ensures that its children are only rendered on the client side,
 * preventing "window is not defined" errors during server-side rendering.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to render only on the client
 * @param {React.ReactNode} props.fallback - Optional content to show during server-side rendering
 */
export default function ClientOnly({ children, fallback = null }) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return fallback;
  }

  return children;
}
