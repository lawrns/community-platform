"use client"

// A debug component to be added to layout temporarily
// to check if the light mode is being applied correctly

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function LightModeDebugger() {
  const { theme, resolvedTheme, forcedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Only render this component after it's mounted on the client
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) return null;
  
  // Simple debug display
  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white text-black p-3 rounded-md shadow-lg text-xs">
      <div><strong>Theme:</strong> {theme}</div>
      <div><strong>Resolved:</strong> {resolvedTheme}</div>
      <div><strong>Forced:</strong> {forcedTheme || 'none'}</div>
      <div><strong>HTML Class:</strong> {document.documentElement.className}</div>
      <div><strong>Light Class:</strong> {document.documentElement.classList.contains('light') ? 'Yes' : 'No'}</div>
      <div><strong>Dark Class:</strong> {document.documentElement.classList.contains('dark') ? 'Yes' : 'No'}</div>
    </div>
  );
}