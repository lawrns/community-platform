import { useEffect, useState } from 'react';
import { useGlobals } from '@storybook/preview-api';

export const ThemeToggle = () => {
  const [{ theme }, updateGlobals] = useGlobals();
  const [currentTheme, setCurrentTheme] = useState(theme || 'light');

  // Apply theme to the document
  useEffect(() => {
    const htmlElement = document.documentElement;
    const prevTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    htmlElement.classList.remove(prevTheme);
    htmlElement.classList.add(currentTheme);
  }, [currentTheme]);

  // Update global theme when local state changes
  useEffect(() => {
    updateGlobals({ theme: currentTheme });
  }, [currentTheme, updateGlobals]);

  const toggleTheme = () => {
    setCurrentTheme(currentTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="storybook-theme-toggle">
      <button
        onClick={toggleTheme}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '4px',
          padding: '8px 12px',
          fontSize: '13px',
          fontWeight: 'bold',
          cursor: 'pointer',
          border: 'none',
          background: currentTheme === 'light' ? '#333' : '#fff',
          color: currentTheme === 'light' ? '#fff' : '#333',
        }}
      >
        {currentTheme === 'light' ? 'Dark Mode' : 'Light Mode'}
      </button>
    </div>
  );
};