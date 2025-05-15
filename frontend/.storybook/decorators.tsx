import React from 'react';
import { ThemeProvider } from '../components/ui/theme-provider';
import { Decorator } from '@storybook/react';
import { useGlobals } from '@storybook/preview-api';

// ThemeProvider decorator
export const withTheme: Decorator = (Story, context) => {
  const [{ theme = 'light' }] = useGlobals();
  
  return (
    <ThemeProvider attribute="class" defaultTheme={theme} storybookMode={true}>
      <div className={`${theme} p-6 transition-colors`}>
        <Story />
      </div>
    </ThemeProvider>
  );
};