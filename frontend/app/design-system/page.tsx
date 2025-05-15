"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function DesignSystemPage() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-16 text-center">
        <h1 className="text-display-2xl font-bold text-content-primary mb-4">
          Community Platform Design System
        </h1>
        <p className="text-body-lg text-content-secondary max-w-3xl mx-auto">
          This page demonstrates the design tokens, components, and patterns used throughout the Community Platform.
        </p>
      </div>

      <div className="flex flex-wrap mb-8 gap-2 justify-center">
        {["overview", "colors", "typography", "components", "patterns", "demos"].map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? "default" : "outline"}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Button>
        ))}
      </div>

      {activeTab === "overview" && <DesignSystemOverview />}
      {activeTab === "colors" && <ColorPalette />}
      {activeTab === "typography" && <TypographyShowcase />}
      {activeTab === "components" && <ComponentShowcase />}
      {activeTab === "patterns" && <PatternShowcase />}
      {activeTab === "demos" && <DemoShowcase />}
    </div>
  );
}

function DesignSystemOverview() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Design Principles</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            <li>
              <h3 className="font-semibold text-content-primary">Systematic</h3>
              <p className="text-content-secondary">
                Use a consistent design language and reusable components for a coherent experience.
              </p>
            </li>
            <li>
              <h3 className="font-semibold text-content-primary">Accessible</h3>
              <p className="text-content-secondary">
                Design for all users, regardless of ability or situation.
              </p>
            </li>
            <li>
              <h3 className="font-semibold text-content-primary">Responsive</h3>
              <p className="text-content-secondary">
                Create interfaces that work across all device sizes and platforms.
              </p>
            </li>
            <li>
              <h3 className="font-semibold text-content-primary">Delightful</h3>
              <p className="text-content-secondary">
                Add thoughtful animations and micro-interactions that enhance the experience.
              </p>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Design Token Structure</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-content-secondary">
            Our design tokens are structured in a semantic way to provide meaning and context:
          </p>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <Badge variant="default">Surface Colors</Badge>
              <span className="text-content-secondary">For backgrounds and containers</span>
            </li>
            <li className="flex items-center gap-2">
              <Badge variant="secondary">Content Colors</Badge>
              <span className="text-content-secondary">For text and icons</span>
            </li>
            <li className="flex items-center gap-2">
              <Badge variant="accent">Brand Colors</Badge>
              <span className="text-content-secondary">For branded elements</span>
            </li>
            <li className="flex items-center gap-2">
              <Badge variant="info">Semantic Colors</Badge>
              <span className="text-content-secondary">For status and feedback</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function ColorPalette() {
  const colorGroups = [
    {
      title: "Surface Colors",
      colors: [
        { name: "surface-1", class: "bg-surface-1", textClass: "text-content-primary" },
        { name: "surface-2", class: "bg-surface-2", textClass: "text-content-primary" },
        { name: "surface-3", class: "bg-surface-3", textClass: "text-content-primary" },
        { name: "surface-accent", class: "bg-surface-accent", textClass: "text-content-primary" },
      ],
    },
    {
      title: "Content Colors",
      colors: [
        { name: "content-primary", class: "bg-content-primary", textClass: "text-content-inverse" },
        { name: "content-secondary", class: "bg-content-secondary", textClass: "text-content-inverse" },
        { name: "content-tertiary", class: "bg-content-tertiary", textClass: "text-content-inverse" },
        { name: "content-inverse", class: "bg-content-inverse", textClass: "text-content-primary" },
      ],
    },
    {
      title: "Brand Colors",
      colors: [
        { name: "brand-primary", class: "bg-brand-primary", textClass: "text-content-onPrimary" },
        { name: "brand-secondary", class: "bg-brand-secondary", textClass: "text-content-primary" },
        { name: "brand-tertiary", class: "bg-brand-tertiary", textClass: "text-content-inverse" },
      ],
    },
    {
      title: "Semantic Colors",
      colors: [
        { name: "semantic-success", class: "bg-semantic-success", textClass: "text-content-inverse" },
        { name: "semantic-warning", class: "bg-semantic-warning", textClass: "text-content-inverse" },
        { name: "semantic-error", class: "bg-semantic-error", textClass: "text-content-onDestructive" },
        { name: "semantic-info", class: "bg-semantic-info", textClass: "text-content-inverse" },
      ],
    },
    {
      title: "Accent Colors",
      colors: [
        { name: "accent-blue", class: "bg-accent-blue", textClass: "text-content-inverse" },
        { name: "accent-purple", class: "bg-accent-purple", textClass: "text-content-inverse" },
        { name: "accent-green", class: "bg-accent-green", textClass: "text-content-inverse" },
        { name: "accent-yellow", class: "bg-accent-yellow", textClass: "text-content-inverse" },
        { name: "accent-red", class: "bg-accent-red", textClass: "text-content-inverse" },
      ],
    },
  ];

  return (
    <div className="space-y-12">
      {colorGroups.map((group) => (
        <div key={group.title}>
          <h2 className="text-display-lg font-semibold mb-6">{group.title}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {group.colors.map((color) => (
              <div key={color.name} className="rounded-lg overflow-hidden border">
                <div className={`h-24 ${color.class}`}></div>
                <div className="p-4 bg-surface-1">
                  <p className="font-medium text-content-primary">{color.name}</p>
                  <code className="text-body-sm text-content-secondary">{color.class}</code>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function TypographyShowcase() {
  const typographySizes = [
    { name: "Display 2XL", class: "text-display-2xl", sample: "Aa Bb Cc 123" },
    { name: "Display XL", class: "text-display-xl", sample: "Aa Bb Cc 123" },
    { name: "Display LG", class: "text-display-lg", sample: "Aa Bb Cc 123" },
    { name: "Display", class: "text-display", sample: "Aa Bb Cc 123" },
    { name: "Display SM", class: "text-display-sm", sample: "Aa Bb Cc 123" },
    { name: "Body LG", class: "text-body-lg", sample: "Aa Bb Cc 123" },
    { name: "Body", class: "text-body", sample: "Aa Bb Cc 123" },
    { name: "Body SM", class: "text-body-sm", sample: "Aa Bb Cc 123" },
    { name: "Caption", class: "text-caption", sample: "Aa Bb Cc 123" },
  ];

  const fontWeights = [
    { name: "Regular", class: "font-regular" },
    { name: "Medium", class: "font-medium" },
    { name: "Semibold", class: "font-semibold" },
    { name: "Bold", class: "font-bold" },
  ];

  const lineHeights = [
    { name: "Tight", class: "leading-tight" },
    { name: "Snug", class: "leading-snug" },
    { name: "Normal", class: "leading-normal" },
    { name: "Relaxed", class: "leading-relaxed" },
    { name: "Loose", class: "leading-loose" },
  ];

  return (
    <div className="space-y-12">
      <section>
        <h2 className="text-display-lg font-semibold mb-6">Type Scale</h2>
        <div className="space-y-6">
          {typographySizes.map((size) => (
            <div key={size.name} className="flex flex-col md:flex-row md:items-center border-b pb-4">
              <div className="w-full md:w-1/4">
                <p className="text-content-secondary">{size.name}</p>
                <code className="text-body-sm text-content-tertiary">{size.class}</code>
              </div>
              <div className="w-full md:w-3/4">
                <p className={`${size.class} text-content-primary`}>{size.sample}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-display-lg font-semibold mb-6">Font Weights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fontWeights.map((weight) => (
            <div key={weight.name} className="border rounded-lg p-6">
              <p className="text-content-secondary mb-2">{weight.name}</p>
              <code className="text-body-sm text-content-tertiary block mb-4">{weight.class}</code>
              <p className={`text-display-sm ${weight.class} text-content-primary`}>
                The quick brown fox jumps over the lazy dog.
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-display-lg font-semibold mb-6">Line Heights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {lineHeights.map((lineHeight) => (
            <div key={lineHeight.name} className="border rounded-lg p-6">
              <p className="text-content-secondary mb-2">{lineHeight.name}</p>
              <code className="text-body-sm text-content-tertiary block mb-4">{lineHeight.class}</code>
              <p className={`text-body ${lineHeight.class} text-content-primary`}>
                The quick brown fox jumps over the lazy dog. The five boxing wizards jump quickly. Pack my box with five dozen liquor jugs.
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function ComponentShowcase() {
  return (
    <div className="space-y-16">
      <section>
        <h2 className="text-display-lg font-semibold mb-6">Buttons</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <h3 className="text-display-sm font-medium">Variants</h3>
                <div className="flex flex-wrap gap-4">
                  <Button variant="default">Default</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="accent">Accent</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="link">Link</Button>
                  <Button variant="destructive">Destructive</Button>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-display-sm font-medium">Sizes</h3>
                <div className="flex flex-wrap gap-4 items-center">
                  <Button size="sm">Small</Button>
                  <Button size="default">Default</Button>
                  <Button size="lg">Large</Button>
                  <Button size="xl">Extra Large</Button>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-display-sm font-medium">States</h3>
                <div className="flex flex-wrap gap-4">
                  <Button>Normal</Button>
                  <Button disabled>Disabled</Button>
                  <Button className="opacity-70">Hover</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="text-display-lg font-semibold mb-6">Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Simple Card</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-content-secondary">
                This is a basic card with just a title and content.
              </p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Hover Card</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-content-secondary">
                This card has a hover effect. Move your cursor over it to see.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-surface-2">
            <CardHeader>
              <CardTitle>Highlighted Card</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-content-secondary">
                This card uses a different background color for emphasis.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section>
        <h2 className="text-display-lg font-semibold mb-6">Badges</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <Badge variant="default">Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="accent">Accent</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="info">Info</Badge>
              <Badge variant="destructive">Destructive</Badge>
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="text-display-lg font-semibold mb-6">Inputs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Input placeholder="Default input" />
            <Input placeholder="Disabled input" disabled />
          </div>
          <div className="space-y-4">
            <Input placeholder="Input with label" className="mt-6" />
            <Input placeholder="Input with error" className="border-semantic-error" />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-display-lg font-semibold mb-6">Avatars</h2>
        <div className="flex flex-wrap gap-6">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          
          <Avatar className="h-16 w-16">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          
          <Avatar>
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          
          <Avatar className="bg-brand-primary">
            <AvatarFallback className="text-content-onPrimary">AI</AvatarFallback>
          </Avatar>
        </div>
      </section>

      <section>
        <h2 className="text-display-lg font-semibold mb-6">Dialog</h2>
        <div className="flex justify-center">
          <Dialog>
            <DialogTrigger asChild>
              <Button>Open Dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Example Dialog</DialogTitle>
                <DialogDescription>
                  This is a dialog example using our new design tokens.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p className="text-content-secondary">
                  Dialogs appear as modal overlays that require user interaction.
                </p>
              </div>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button>Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      <section>
        <h2 className="text-display-lg font-semibold mb-6">Skeletons</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <Skeleton className="h-8 w-[250px]" />
                <Skeleton className="h-4 w-[350px]" />
                <Skeleton className="h-4 w-[300px]" />
                <Skeleton className="h-4 w-[325px]" />
                <div className="flex items-center gap-4 pt-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[120px]" />
                    <Skeleton className="h-4 w-[80px]" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4">
                <div className="flex gap-4 items-center">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[160px]" />
                  </div>
                </div>
                <Skeleton className="h-[200px] rounded-md" />
                <div className="flex gap-4">
                  <Skeleton className="h-10 w-20 rounded-md" />
                  <Skeleton className="h-10 w-20 rounded-md" />
                  <Skeleton className="h-10 w-20 rounded-md" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

function DemoShowcase() {
  return (
    <div className="space-y-12">
      <section>
        <h2 className="text-display-lg font-semibold mb-6">Interactive Demos</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Responsive Container Demo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-content-secondary mb-4">
                Explore our enhanced responsive container with various configuration options, backgrounds, shadows and more.
              </p>
              <Button asChild>
                <a href="/responsive-demo">View Demo</a>
              </Button>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Responsive Layout Demo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-content-secondary mb-4">
                See how to create consistent page layouts with our ResponsiveLayout component.
              </p>
              <Button asChild>
                <a href="/responsive-layout-demo">View Demo</a>
              </Button>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Mobile Action Button Demo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-content-secondary mb-4">
                Explore our mobile floating action buttons and speed dials for improved mobile experience.
              </p>
              <Button asChild>
                <a href="/mobile-action-demo">View Demo</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

function PatternShowcase() {
  return (
    <div className="space-y-12">
      <section>
        <h2 className="text-display-lg font-semibold mb-6">Responsive Patterns</h2>
        <Card>
          <CardHeader>
            <CardTitle>Responsive Grid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="responsive-grid">
              {[1, 2, 3, 4].map((item) => (
                <Card key={item}>
                  <CardContent className="p-4">
                    <p className="text-body font-medium text-content-primary">Item {item}</p>
                    <p className="text-body-sm text-content-secondary">
                      This grid adjusts columns based on screen size.
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-6">
              <p className="text-body-sm text-content-secondary">
                <code>responsive-grid</code> changes from 1 column on mobile to 4 columns on larger screens.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="text-display-lg font-semibold mb-6">Spacing System</h2>
        <Card>
          <CardHeader>
            <CardTitle>Consistent Spacing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-4">
                {['4xs', '3xs', '2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'].map((size) => (
                  <div key={size} className="flex flex-col items-center">
                    <div className={`w-16 h-16 bg-surface-2 flex items-center justify-center p-${size} border`}>
                      <div className="bg-brand-primary w-full h-full"></div>
                    </div>
                    <span className="text-caption text-content-secondary mt-2">p-{size}</span>
                  </div>
                ))}
              </div>
              <p className="text-body-sm text-content-secondary mt-6">
                Our spacing system uses consistent tokens from 4xs (2px) to 4xl (128px).
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="text-display-lg font-semibold mb-6">Animation Patterns</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Transitions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-body text-content-secondary">
                  Hover over these elements to see different transition effects:
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button className="transition-transform duration-normal hover:translate-y-[-4px]">
                    Translate
                  </Button>
                  <Button className="transition-all duration-normal hover:scale-110">
                    Scale
                  </Button>
                  <Button className="transition-colors duration-slow hover:bg-accent-purple">
                    Slow Color
                  </Button>
                  <Button className="transition-all duration-fast ease-bounce hover:translate-y-[-4px]">
                    Bounce
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Keyframe Animations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex flex-wrap gap-4">
                  <div className="animate-fade-in bg-surface-2 p-4 rounded-md">Fade In</div>
                  <div className="animate-slide-up bg-surface-2 p-4 rounded-md">Slide Up</div>
                  <div className="animate-slide-down bg-surface-2 p-4 rounded-md">Slide Down</div>
                  <div className="animate-pulse bg-surface-2 p-4 rounded-md">Pulse</div>
                </div>
                <p className="text-body-sm text-content-secondary">
                  Our animation system includes keyframe animations for common patterns.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}