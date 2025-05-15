import type { Meta, StoryObj } from '@storybook/react';
import { FloatingActionButton } from './floating-action-button';
import { Plus, Edit, Heart, Settings, Share2 } from 'lucide-react';

const meta: Meta<typeof FloatingActionButton> = {
  title: 'UI/FloatingActionButton',
  component: FloatingActionButton,
  tags: ['autodocs'],
  argTypes: {
    position: {
      control: 'select',
      options: ['bottom-right', 'bottom-left', 'bottom-center', 'top-right', 'top-left'],
      description: 'The position of the button',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'The size of the button',
    },
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'accent', 'destructive', 'success', 'outline'],
      description: 'The visual style of the button',
    },
    extended: {
      control: 'boolean',
      description: 'Whether the button is extended with a label',
    },
    animate: {
      control: 'boolean',
      description: 'Whether the button has animation effects',
    },
    onClick: { action: 'clicked' },
  },
  args: {
    position: 'bottom-right',
    size: 'lg',
    variant: 'primary',
    extended: false,
    animate: true,
  },
  parameters: {
    docs: {
      description: {
        component: 'A floating action button component typically used in mobile interfaces for primary actions.',
      },
    },
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof FloatingActionButton>;

export const Default: Story = {
  args: {
    icon: <Plus />,
  },
};

export const SecondaryVariant: Story = {
  args: {
    icon: <Plus />,
    variant: 'secondary',
  },
};

export const AccentVariant: Story = {
  args: {
    icon: <Heart />,
    variant: 'accent',
  },
};

export const DestructiveVariant: Story = {
  args: {
    icon: <Share2 />,
    variant: 'destructive',
  },
};

export const SuccessVariant: Story = {
  args: {
    icon: <Edit />,
    variant: 'success',
  },
};

export const OutlineVariant: Story = {
  args: {
    icon: <Settings />,
    variant: 'outline',
  },
};

export const SmallSize: Story = {
  args: {
    icon: <Plus />,
    size: 'sm',
  },
};

export const MediumSize: Story = {
  args: {
    icon: <Plus />,
    size: 'md',
  },
};

export const ExtendedFAB: Story = {
  args: {
    icon: <Plus />,
    extended: true,
    label: 'Create',
  },
};

export const NoAnimation: Story = {
  args: {
    icon: <Plus />,
    animate: false,
  },
};

export const AllPositions: Story = {
  render: () => (
    <div className="relative w-full h-[400px] border rounded-md p-4 flex items-center justify-center">
      <span className="text-content-secondary">FAB positions</span>
      
      <div className="absolute bottom-4 right-4">
        <FloatingActionButton 
          position="bottom-right" 
          size="md"
          variant="primary" 
          icon={<Plus />} 
          onClick={() => {}}
          extended={false}
          animate={false}
        />
      </div>
      
      <div className="absolute bottom-4 left-4">
        <FloatingActionButton 
          position="bottom-left" 
          size="md"
          variant="secondary" 
          icon={<Edit />} 
          onClick={() => {}}
          extended={false}
          animate={false}
        />
      </div>
      
      <div className="absolute top-4 right-4">
        <FloatingActionButton 
          position="top-right" 
          size="md"
          variant="accent" 
          icon={<Heart />} 
          onClick={() => {}}
          extended={false}
          animate={false}
        />
      </div>
      
      <div className="absolute top-4 left-4">
        <FloatingActionButton 
          position="top-left" 
          size="md"
          variant="destructive" 
          icon={<Share2 />} 
          onClick={() => {}}
          extended={false}
          animate={false}
        />
      </div>
    </div>
  ),
};

export const ExtendedVariants: Story = {
  render: () => (
    <div className="space-y-4">
      <FloatingActionButton 
        position="bottom-right" 
        variant="primary" 
        icon={<Plus />} 
        extended
        label="Create"
        onClick={() => {}}
      />
      
      <FloatingActionButton 
        position="bottom-right" 
        variant="secondary" 
        icon={<Edit />} 
        extended
        label="Edit"
        onClick={() => {}}
      />
      
      <FloatingActionButton 
        position="bottom-right" 
        variant="accent" 
        icon={<Heart />} 
        extended
        label="Like"
        onClick={() => {}}
      />
      
      <FloatingActionButton 
        position="bottom-right" 
        variant="success" 
        icon={<Share2 />} 
        extended
        label="Share"
        onClick={() => {}}
      />
    </div>
  ),
};