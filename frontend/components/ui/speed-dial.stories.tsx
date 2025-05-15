import type { Meta, StoryObj } from '@storybook/react';
import { SpeedDial } from './speed-dial';
import { Plus, Edit, Heart, Share2, MessageSquare, Bookmark, Settings, User } from 'lucide-react';

const meta: Meta<typeof SpeedDial> = {
  title: 'UI/SpeedDial',
  component: SpeedDial,
  tags: ['autodocs'],
  argTypes: {
    position: {
      control: 'select',
      options: ['bottom-right', 'bottom-left', 'bottom-center', 'top-right', 'top-left'],
      description: 'The position of the speed dial',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'The size of the buttons',
    },
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'accent', 'destructive', 'success', 'outline'],
      description: 'The visual style of the main button',
    },
    direction: {
      control: 'select',
      options: ['up', 'down', 'left', 'right'],
      description: 'The direction in which actions appear',
    },
    backdrop: {
      control: 'boolean',
      description: 'Whether to show a backdrop overlay when open',
    },
    labels: {
      control: 'boolean',
      description: 'Whether to show labels for actions',
    },
  },
  args: {
    position: 'bottom-right',
    size: 'lg',
    variant: 'primary',
    direction: 'up',
    backdrop: false,
    labels: true,
    icon: <Plus />,
    closeIcon: undefined,
    actions: [
      { icon: <Edit />, label: 'Edit', onClick: () => console.log('Edit clicked') },
      { icon: <Heart />, label: 'Like', onClick: () => console.log('Like clicked') },
      { icon: <Share2 />, label: 'Share', onClick: () => console.log('Share clicked') },
    ],
  },
  parameters: {
    docs: {
      description: {
        component: 'A speed dial component that shows multiple actions when opened.',
      },
    },
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof SpeedDial>;

export const Default: Story = {};

export const WithBackdrop: Story = {
  args: {
    backdrop: true,
  },
};

export const DirectionDown: Story = {
  args: {
    direction: 'down',
    position: 'top-right',
  },
};

export const DirectionLeft: Story = {
  args: {
    direction: 'left',
  },
};

export const DirectionRight: Story = {
  args: {
    direction: 'right',
    position: 'bottom-left',
  },
};

export const WithoutLabels: Story = {
  args: {
    labels: false,
  },
};

export const ManyActions: Story = {
  args: {
    actions: [
      { icon: <Edit />, label: 'Edit', onClick: () => {} },
      { icon: <Heart />, label: 'Like', onClick: () => {} },
      { icon: <Share2 />, label: 'Share', onClick: () => {} },
      { icon: <MessageSquare />, label: 'Comment', onClick: () => {} },
      { icon: <Bookmark />, label: 'Save', onClick: () => {} },
    ],
  },
};

export const CustomMainButton: Story = {
  args: {
    icon: <Settings />,
    closeIcon: <User />,
    mainLabel: 'Actions',
  },
};

export const ColoredActions: Story = {
  args: {
    actions: [
      { icon: <Edit />, label: 'Edit', onClick: () => {}, variant: 'secondary' },
      { icon: <Heart />, label: 'Like', onClick: () => {}, variant: 'accent' },
      { icon: <Share2 />, label: 'Share', onClick: () => {}, variant: 'success' },
      { icon: <MessageSquare />, label: 'Comment', onClick: () => {}, variant: 'primary' },
      { icon: <Bookmark />, label: 'Save', onClick: () => {}, variant: 'outline' },
    ],
  },
};