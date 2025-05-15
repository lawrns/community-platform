import type { Meta, StoryObj } from '@storybook/react';
import { ResponsiveContainer } from './responsive-container';

const meta: Meta<typeof ResponsiveContainer> = {
  title: 'UI/ResponsiveContainer',
  component: ResponsiveContainer,
  tags: ['autodocs'],
  argTypes: {
    maxWidth: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', 'prose', 'full', 'screen', 'none'],
      description: 'Maximum width constraint',
    },
    padding: {
      control: 'select',
      options: ['none', 'xs', 'sm', 'md', 'lg', 'xl', 'responsive', 'y'],
      description: 'Horizontal padding that increases at larger breakpoints',
    },
    verticalPadding: {
      control: 'select',
      options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Vertical padding that increases at larger breakpoints',
    },
    centered: {
      control: 'boolean',
      description: 'Center container horizontally',
    },
    constrained: {
      control: 'boolean',
      description: 'Limit width relative to viewport',
    },
    gutter: {
      control: 'boolean',
      description: 'Add responsive horizontal gutters',
    },
    border: {
      control: 'select',
      options: ['none', 'default', 'top', 'bottom', 'x', 'y'],
      description: 'Border style',
    },
    rounded: {
      control: 'select',
      options: ['none', 'default', 'sm', 'md', 'lg', 'xl', '2xl', 'full'],
      description: 'Border radius',
    },
    shadow: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg', 'xl'],
      description: 'Box shadow',
    },
    background: {
      control: 'select',
      options: ['none', 'primary', 'secondary', 'tertiary', 'accent'],
      description: 'Background color using design system surface colors',
    },
    as: {
      control: 'text',
      description: 'HTML element to render',
    },
    innerWrapper: {
      control: 'boolean',
      description: 'Add inner wrapper div',
    },
    outerWrapper: {
      control: 'boolean',
      description: 'Add outer wrapper div',
    },
  },
  args: {
    children: <div className="p-4 border border-dashed border-content-tertiary text-center">Container Content</div>,
    maxWidth: '3xl',
    padding: 'responsive',
    verticalPadding: 'none',
    centered: true,
    constrained: false,
    gutter: false,
    border: 'none',
    rounded: 'none',
    shadow: 'none',
    background: 'none',
    innerWrapper: false,
    outerWrapper: false,
  },
  parameters: {
    docs: {
      description: {
        component: 'A versatile responsive container component that adapts to different screen sizes with appropriate padding and maximum widths.',
      },
    },
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof ResponsiveContainer>;

export const Default: Story = {};

export const WithBackground: Story = {
  args: {
    background: 'primary',
    padding: 'md',
  },
};

export const WithBorder: Story = {
  args: {
    border: 'default',
    rounded: 'md',
  },
};

export const WithShadow: Story = {
  args: {
    shadow: 'md',
    rounded: 'lg',
  },
};

export const WithPadding: Story = {
  args: {
    padding: 'lg',
    verticalPadding: 'md',
    background: 'secondary',
  },
};

export const FullFeatured: Story = {
  args: {
    maxWidth: '4xl',
    padding: 'md',
    verticalPadding: 'sm',
    background: 'secondary',
    border: 'default',
    rounded: 'lg',
    shadow: 'md',
  },
};

export const AsSection: Story = {
  args: {
    as: 'section',
    maxWidth: '5xl',
    padding: 'responsive',
    verticalPadding: 'md',
    background: 'tertiary',
    children: (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Section Heading</h2>
        <p>This container is rendered as a semantic &lt;section&gt; element.</p>
      </div>
    ),
  },
};

export const WithInnerWrapper: Story = {
  args: {
    innerWrapper: true,
    background: 'secondary',
    padding: 'md',
    contentClassName: 'bg-surface-3 p-4 rounded',
    children: <p>Content with an inner wrapper that has custom styling</p>,
  },
};

export const WithOuterWrapper: Story = {
  args: {
    outerWrapper: true,
    background: 'accent',
    padding: 'md',
    contentClassName: 'p-1 bg-accent-purple/10 rounded-lg',
    children: <p>Content with an outer wrapper that has custom styling</p>,
  },
};

export const MaxWidthVariants: Story = {
  render: () => (
    <div className="space-y-4">
      {['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl'].map((width) => (
        <ResponsiveContainer
          key={width}
          maxWidth={width as any}
          border="default"
          className="py-3"
        >
          <div className="flex items-center justify-between">
            <span className="font-medium">max-width: {width}</span>
            <span className="text-sm bg-surface-2 px-2 py-1 rounded">{width}</span>
          </div>
        </ResponsiveContainer>
      ))}
    </div>
  ),
};