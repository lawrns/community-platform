import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
import { Button } from './button';

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'A versatile card component for displaying content in a contained format.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Simple: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card Description</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card Content</p>
      </CardContent>
    </Card>
  ),
};

export const WithFooter: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card Description</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card Content</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Cancel</Button>
        <Button>Submit</Button>
      </CardFooter>
    </Card>
  ),
};

export const Hover: Story = {
  render: () => (
    <Card className="w-[350px] card-hover">
      <CardHeader>
        <CardTitle>Hover Effect</CardTitle>
        <CardDescription>This card has a hover effect</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Hover over this card to see the effect.</p>
      </CardContent>
    </Card>
  ),
};

export const WithImage: Story = {
  render: () => (
    <Card className="w-[350px] overflow-hidden">
      <div className="h-40 bg-muted"></div>
      <CardHeader>
        <CardTitle>Card with Image</CardTitle>
        <CardDescription>Cards can include images or other media</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card content goes here.</p>
      </CardContent>
    </Card>
  ),
};

export const Alternative: Story = {
  render: () => (
    <Card className="w-[350px] bg-surface-2">
      <CardHeader>
        <CardTitle>Alternative Style</CardTitle>
        <CardDescription>Using a different background color</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This card uses a different background color.</p>
      </CardContent>
    </Card>
  ),
};

export const Bordered: Story = {
  render: () => (
    <Card className="w-[350px] border-2 border-primary">
      <CardHeader>
        <CardTitle>Bordered Card</CardTitle>
        <CardDescription>With custom border styling</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This card has a custom border style.</p>
      </CardContent>
    </Card>
  ),
};

export const CardGrid: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardHeader>
            <CardTitle>Card {i}</CardTitle>
            <CardDescription>Card in a responsive grid</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Card content goes here.</p>
          </CardContent>
        </Card>
      ))}
    </div>
  ),
};