import React from 'react';
import type { Preview } from '@storybook/react';
import '../app/globals.css';
import { withTheme } from './decorators';
import { ThemeToggle } from './ThemeToggle';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      disable: true,
    },
    layout: 'padded',
    docs: {
      story: {
        inline: true,
      },
    },
  },
  decorators: [withTheme],
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        // Toolbar item renders the ThemeToggle in the toolbar
        icon: 'circlehollow',
        items: ['light', 'dark'],
        showName: true,
        dynamicTitle: true,
      },
    },
  },
};

export default preview;