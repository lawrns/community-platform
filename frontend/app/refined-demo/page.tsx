"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function RefinedDemo() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 text-gradient-primary">Refined UI Demo</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          A showcase of our professional blue-focused design system with subtle borders and shadows
        </p>
      </div>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Card Variations</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle>Elevated Card</CardTitle>
              <CardDescription>Uses shadow instead of border</CardDescription>
            </CardHeader>
            <CardContent>
              <p>This card uses elevation (shadow) instead of a prominent border. The shadow provides visual hierarchy without the distraction of bold borders.</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">Interact</Button>
            </CardFooter>
          </Card>

          <Card className="card-subtle">
            <CardHeader>
              <CardTitle>Subtle Card</CardTitle>
              <CardDescription>Combines subtle border with light shadow</CardDescription>
            </CardHeader>
            <CardContent>
              <p>This card combines a very subtle border with a light shadow, striking a balance between definition and minimalism.</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">Interact</Button>
            </CardFooter>
          </Card>

          <Card className="card-flat">
            <CardHeader>
              <CardTitle>Flat Card</CardTitle>
              <CardDescription>Uses only a subtle border</CardDescription>
            </CardHeader>
            <CardContent>
              <p>This card uses only a subtle border without shadows, for a completely flat appearance that still maintains structure.</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">Interact</Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Card Interactions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="card-elevated card-hoverable">
            <CardHeader>
              <CardTitle>Hover Effect</CardTitle>
              <CardDescription>Hover over me</CardDescription>
            </CardHeader>
            <CardContent>
              <p>This card has a subtle hover effect that adds depth and interactivity without being distracting.</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">Interact</Button>
            </CardFooter>
          </Card>

          <Card className="card-subtle card-hoverable">
            <CardHeader>
              <CardTitle>Subtle Hover</CardTitle>
              <CardDescription>Hover over me</CardDescription>
            </CardHeader>
            <CardContent>
              <p>This card uses a subtle border with a hover effect that increases the shadow and slightly lifts the card.</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">Interact</Button>
            </CardFooter>
          </Card>

          <Card className="card-divided">
            <CardHeader>
              <CardTitle>Divided Card</CardTitle>
              <CardDescription>With subtle section dividers</CardDescription>
            </CardHeader>
            <CardContent>
              <p>This card uses subtle dividers between card sections to create visual separation without harsh lines.</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">Interact</Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Button Variations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="card-subtle">
            <CardHeader>
              <CardTitle>Primary Buttons</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <Button size="sm">Small</Button>
                <Button>Default</Button>
                <Button size="lg">Large</Button>
              </div>
              <div className="flex flex-wrap gap-4">
                <Button variant="secondary" size="sm">Small</Button>
                <Button variant="secondary">Default</Button>
                <Button variant="secondary" size="lg">Large</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="card-subtle">
            <CardHeader>
              <CardTitle>Subtle Buttons</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <Button variant="outline" size="sm">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
              </div>
              <div className="flex flex-wrap gap-4">
                <Button variant="accent" size="sm">Accent</Button>
                <Button variant="destructive">Destructive</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Badge Variations</h2>
        <Card className="card-subtle">
          <CardHeader>
            <CardTitle>Professional Badges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="info">Info</Badge>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Color System</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="card-subtle">
            <CardHeader>
              <CardTitle>Brand Colors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2">
                <div className="h-12 rounded bg-brand-blue-50 flex items-end justify-center p-1 text-xs">50</div>
                <div className="h-12 rounded bg-brand-blue-100 flex items-end justify-center p-1 text-xs">100</div>
                <div className="h-12 rounded bg-brand-blue-200 flex items-end justify-center p-1 text-xs">200</div>
                <div className="h-12 rounded bg-brand-blue-300 flex items-end justify-center p-1 text-xs">300</div>
                <div className="h-12 rounded bg-brand-blue-400 flex items-end justify-center p-1 text-xs text-white">400</div>
                <div className="h-12 rounded bg-brand-blue-500 flex items-end justify-center p-1 text-xs text-white">500</div>
                <div className="h-12 rounded bg-brand-blue-600 flex items-end justify-center p-1 text-xs text-white">600</div>
                <div className="h-12 rounded bg-brand-blue-700 flex items-end justify-center p-1 text-xs text-white">700</div>
                <div className="h-12 rounded bg-brand-blue-800 flex items-end justify-center p-1 text-xs text-white">800</div>
                <div className="h-12 rounded bg-brand-blue-900 flex items-end justify-center p-1 text-xs text-white">900</div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-subtle">
            <CardHeader>
              <CardTitle>Accent Colors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <div className="h-12 rounded bg-deep-blue-500 flex items-end justify-center p-1 text-xs text-white">Deep Blue</div>
                <div className="h-12 rounded bg-teal-500 flex items-end justify-center p-1 text-xs text-white">Teal</div>
                <div className="h-12 rounded bg-success-500 flex items-end justify-center p-1 text-xs text-white">Success</div>
                <div className="h-12 rounded bg-warning-500 flex items-end justify-center p-1 text-xs text-white">Warning</div>
                <div className="h-12 rounded bg-error-500 flex items-end justify-center p-1 text-xs text-white">Error</div>
                <div className="h-12 rounded bg-info-500 flex items-end justify-center p-1 text-xs text-white">Info</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Gradient Examples</h2>
        <Card className="card-subtle">
          <CardHeader>
            <CardTitle>Professional Gradients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="h-24 rounded bg-gradient-primary flex items-center justify-center text-white font-semibold">Primary Gradient</div>
              <div className="h-24 rounded bg-gradient-subtle flex items-center justify-center font-semibold">Subtle Gradient</div>
              <div className="h-24 rounded dark:bg-gradient-dark flex items-center justify-center font-semibold">Dark Mode Gradient</div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}