# CommRedesign Integration Guide

This guide explains how to integrate the components and styles from the CommRedesign prototype into the main CommUnity application.

## Overview

The CommRedesign components introduce a new purple/blue gradient-based aesthetic with modern UI effects like:
- Gradient text headings
- Frosted glass effect cards 
- Subtle animations and hover effects
- Decorative blob elements
- Modern button variants

## Component Library

The components are available through the `@/components/commredesign` import path:

```tsx
import { 
  HeroSection, 
  JoinCommunity, 
  StatsDisplay,
  FeatureGrid,
  Button,
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription
} from '@/components/commredesign';
```

## Color Scheme

The color scheme is defined in the globals.css file and introduces a purple/blue/teal gradient system:

- **Purple**: `hsl(var(--brand-primary))` - The primary brand color
- **Blue**: `hsl(var(--brand-secondary))` - The secondary brand color
- **Teal**: `hsl(var(--brand-tertiary))` - The accent/tertiary brand color

### Gradient Text

To apply gradient text (a key feature of the new design):

```tsx
<h1 className="gradient-text-purple-blue-teal">
  Gradient Text Heading
</h1>
```

Available gradient classes:
- `gradient-text-purple-blue`
- `gradient-text-blue-teal`
- `gradient-text-teal-purple`
- `gradient-text-purple-blue-teal`

## Components

### Button Component

The new button component includes additional variants and hover effects:

```tsx
<Button variant="primary">Primary Button</Button>
<Button variant="secondary">Secondary Button</Button>
<Button variant="outline">Outline Button</Button>
<Button variant="ghost">Ghost Button</Button>
<Button variant="glass">Glass Button</Button>
<Button variant="gradient">Gradient Button</Button>
```

### Card Component

The card component has been enhanced with options for hover effects and glass styling:

```tsx
<Card hoverable={true}>
  <CardHeader>
    <CardTitle gradient={true}>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>Card content goes here</CardContent>
  <CardFooter>Card footer</CardFooter>
</Card>

{/* Glass effect card */}
<Card glass={true}>
  <CardContent>Glass card content</CardContent>
</Card>
```

### FeatureCard and FeatureGrid

Use these components to display feature listings:

```tsx
<FeatureGrid
  features={[
    {
      id: "feature-1",
      icon: <Icon />,
      title: "Feature Title",
      description: "Feature description",
      gradient: true, // Optional: Apply gradient to title
      glass: true,    // Optional: Apply glass effect to card
    }
    // More features...
  ]}
  columns={3}
/>
```

### StatsDisplay

Display stats with gradient text:

```tsx
<StatsDisplay
  stats={[
    { 
      value: "15K+", 
      label: "Community Members", 
      gradientType: "purple-blue" 
    },
    // More stats...
  ]}
/>
```

### Hero and JoinCommunity Sections

These are high-level components for common page sections:

```tsx
<HeroSection
  title="Main Heading"
  subtitle="Subtitle text goes here"
  tagline="Optional Tagline"
  primaryButtonText="Primary CTA"
  secondaryButtonText="Secondary CTA"
  stats={[
    // Stats array...
  ]}
/>

<JoinCommunity
  title="Section Title"
  subtitle="Section subtitle"
  features={[
    // Feature array...
  ]}
/>
```

## Decorative Elements

Add decorative blobs to create the signature look:

```tsx
<div className="relative">
  {/* Your content */}
  
  {/* Decorative elements */}
  <div className="decorative-blob decorative-blob-purple w-64 h-64 -bottom-12 -left-12"></div>
  <div className="decorative-blob decorative-blob-blue w-64 h-64 -top-12 -right-12"></div>
</div>
```

## Demo Page

A demo page showcasing all components is available at `/commredesign`. View this page to see how all components work together.

## Tailwind Configuration

The new components use custom CSS variables and classes defined in:
- `frontend/app/globals.css`
- `frontend/styles/commredesign-components.css`

## Migration Strategy

1. Start with high-impact pages like the homepage and dashboard
2. Replace basic UI components (buttons, cards) with the new variants
3. Add gradient text styling to headings
4. Incorporate the decorative blob elements for visual interest

## Accessibility Considerations

All components maintain WCAG 2.1 AA compliance:
- Color contrast ratios meet requirements
- Interactive elements have proper focus states
- Decorative elements do not interfere with screen readers
- Dark mode compatibility is preserved