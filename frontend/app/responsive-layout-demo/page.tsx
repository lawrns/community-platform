"use client"

import { ResponsiveLayout } from "@/components/layout/ResponsiveLayout"
import { ResponsiveContainer } from "@/components/ui/responsive-container"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function ResponsiveLayoutDemo() {
  return (
    <ResponsiveLayout
      sections={[
        // Hero section - full width with container inside
        {
          id: "hero",
          fullWidth: true,
          background: "primary",
          paddingY: "xl",
          containerProps: {
            maxWidth: "4xl",
            className: "text-center"
          },
          children: (
            <>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">Responsive Layout System</h1>
              <p className="text-xl text-content-secondary max-w-3xl mx-auto mb-8">
                A flexible, powerful layout system for building consistent page structures with minimal effort.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button size="lg">Get Started</Button>
                <Button size="lg" variant="outline">Learn More</Button>
              </div>
            </>
          )
        },
        
        // Features section
        {
          id: "features",
          background: "secondary", 
          paddingY: "lg",
          containerProps: {
            maxWidth: "6xl"
          },
          children: (
            <>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Key Features</h2>
                <p className="text-content-secondary max-w-2xl mx-auto">
                  The ResponsiveLayout component provides a consistent way to structure pages
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    title: "Consistent Spacing",
                    description: "Standardized spacing between sections for visual harmony across the application."
                  },
                  {
                    title: "Flexible Containers",
                    description: "Control maximum widths, padding, and alignment with semantic props."
                  },
                  {
                    title: "Background Variations",
                    description: "Apply different background styles to create visual hierarchy."
                  },
                  {
                    title: "Full-Width Sections",
                    description: "Create edge-to-edge sections with contained content for visual impact."
                  },
                  {
                    title: "Responsive Padding",
                    description: "Spacing that adapts to viewport size for optimal presentation at all breakpoints."
                  },
                  {
                    title: "Semantic HTML",
                    description: "Use appropriate HTML elements for better accessibility and SEO."
                  }
                ].map((feature, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle>{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-content-secondary">{feature.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )
        },
        
        // Alternating content sections
        {
          id: "content-1",
          background: "none",
          paddingY: "lg",
          containerProps: {
            maxWidth: "5xl"
          },
          children: (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="mb-4">Section Type 1</Badge>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Content with Side-by-Side Layout</h2>
                <p className="text-content-secondary mb-6">
                  This section demonstrates a responsive layout that stacks on mobile and displays
                  side-by-side on larger screens. Perfect for content with supporting visuals.
                </p>
                <Button>Learn More</Button>
              </div>
              <div className="bg-surface-2 rounded-xl h-80 flex items-center justify-center">
                <span className="text-content-secondary">Image or Content Area</span>
              </div>
            </div>
          )
        },
        
        {
          id: "content-2",
          background: "tertiary",
          paddingY: "lg",
          containerProps: {
            maxWidth: "5xl"
          },
          children: (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1 bg-surface-2 rounded-xl h-80 flex items-center justify-center">
                <span className="text-content-secondary">Image or Content Area</span>
              </div>
              <div className="order-1 md:order-2">
                <Badge className="mb-4">Section Type 2</Badge>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Reversed Layout on Desktop</h2>
                <p className="text-content-secondary mb-6">
                  This section shows how easily you can reverse the order of content on different devices.
                  Content first on mobile, visual first on desktop.
                </p>
                <Button>Learn More</Button>
              </div>
            </div>
          )
        },
        
        // Full width banner
        {
          id: "banner",
          fullWidth: true,
          background: "accent",
          paddingY: "md",
          className: "text-center",
          children: (
            <ResponsiveContainer maxWidth="4xl">
              <h2 className="text-2xl font-bold mb-4">Full-Width Banner Section</h2>
              <p className="text-content-secondary mb-6 max-w-2xl mx-auto">
                This section spans the full width of the viewport for maximum impact,
                while still containing text content for readability.
              </p>
              <Button>Call to Action</Button>
            </ResponsiveContainer>
          )
        },
        
        // Cards grid
        {
          id: "cards",
          background: "none",
          paddingY: "lg",
          containerProps: {
            maxWidth: "6xl"
          },
          children: (
            <>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Card Grid Layout</h2>
                <p className="text-content-secondary max-w-2xl mx-auto">
                  A responsive grid that adapts to different screen sizes
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <Card key={item} className="overflow-hidden card-hover">
                    <div className="h-40 bg-surface-3"></div>
                    <CardHeader>
                      <CardTitle>Card {item}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-content-secondary">
                        This card is part of a responsive grid that changes columns based on screen size.
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )
        },
        
        // CTA section
        {
          id: "cta",
          background: "primary",
          paddingY: "lg",
          containerProps: {
            maxWidth: "4xl",
            rounded: "xl",
            shadow: "lg",
            padding: "lg",
            background: "accent",
            className: "text-center"
          },
          children: (
            <>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-content-secondary mb-8 max-w-2xl mx-auto">
                Use ResponsiveLayout component to create beautiful, consistent layouts with minimal effort.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button size="lg">View Documentation</Button>
                <Button size="lg" variant="outline">See More Examples</Button>
              </div>
            </>
          )
        },
        
        // Footer with navigation to other demos
        {
          id: "footer",
          background: "secondary",
          paddingY: "md",
          children: (
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <p className="text-content-secondary">
                ResponsiveLayout Demo - Part of the Community Platform Design System
              </p>
              <div className="flex gap-4">
                <Button variant="ghost" asChild>
                  <a href="/responsive-demo">Container Demo</a>
                </Button>
                <Button variant="ghost" asChild>
                  <a href="/design-system">Design System</a>
                </Button>
              </div>
            </div>
          )
        }
      ]}
    />
  )
}