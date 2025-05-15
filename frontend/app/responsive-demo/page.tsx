"use client"

import { ResponsiveContainer } from "@/components/ui/responsive-container"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function ResponsiveDemoPage() {
  return (
    <div className="py-10">
      <ResponsiveContainer maxWidth="4xl" background="primary" shadow="md" rounded="lg" verticalPadding="md">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">Responsive Container Demo</h1>
            <p className="text-content-secondary max-w-3xl mx-auto">
              This page demonstrates the various features and configuration options of the enhanced ResponsiveContainer component.
            </p>
          </div>

          {/* Basic Max Width Examples */}
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold">Max Width Variants</h2>
            <p className="text-content-secondary">
              The ResponsiveContainer supports different maximum width constraints.
            </p>
            
            <div className="space-y-4">
              {["xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl", "7xl"].map((width) => (
                <ResponsiveContainer
                  key={width}
                  maxWidth={width as any}
                  border="default"
                  className="py-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">max-width: {width}</span>
                    <Badge>{width}</Badge>
                  </div>
                </ResponsiveContainer>
              ))}
            </div>
          </section>

          {/* Padding Examples */}
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold">Padding Variants</h2>
            <p className="text-content-secondary">
              Various padding options that adapt to different screen sizes.
            </p>
            
            <div className="space-y-4">
              {["none", "xs", "sm", "md", "lg", "xl", "responsive"].map((pad) => (
                <ResponsiveContainer
                  key={pad}
                  padding={pad as any}
                  maxWidth="5xl"
                  border="default"
                  className="py-3 bg-surface-2"
                >
                  <div className="bg-surface-3 p-4 rounded">
                    <span className="font-medium">padding: {pad}</span>
                  </div>
                </ResponsiveContainer>
              ))}
            </div>
          </section>

          {/* Vertical Padding Examples */}
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold">Vertical Padding Variants</h2>
            <p className="text-content-secondary">
              Control the vertical spacing independently.
            </p>
            
            <div className="space-y-4">
              {["none", "xs", "sm", "md", "lg", "xl"].map((pad) => (
                <ResponsiveContainer
                  key={pad}
                  verticalPadding={pad as any}
                  maxWidth="5xl"
                  border="default"
                  className="bg-surface-2"
                >
                  <div className="bg-surface-3 p-4 rounded">
                    <span className="font-medium">verticalPadding: {pad}</span>
                  </div>
                </ResponsiveContainer>
              ))}
            </div>
          </section>

          {/* Background and Visual Options */}
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold">Visual Variants</h2>
            <p className="text-content-secondary">
              Different background, border, shadow, and rounded corner combinations.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ResponsiveContainer background="primary" padding="md" rounded="md" shadow="sm">
                <div className="p-4">
                  <h3 className="font-medium mb-2">Background: primary, Shadow: sm</h3>
                  <p className="text-content-secondary text-sm">With rounded-md corners</p>
                </div>
              </ResponsiveContainer>
              
              <ResponsiveContainer background="secondary" padding="md" rounded="lg" shadow="md">
                <div className="p-4">
                  <h3 className="font-medium mb-2">Background: secondary, Shadow: md</h3>
                  <p className="text-content-secondary text-sm">With rounded-lg corners</p>
                </div>
              </ResponsiveContainer>
              
              <ResponsiveContainer background="tertiary" padding="md" rounded="xl" shadow="lg">
                <div className="p-4">
                  <h3 className="font-medium mb-2">Background: tertiary, Shadow: lg</h3>
                  <p className="text-content-secondary text-sm">With rounded-xl corners</p>
                </div>
              </ResponsiveContainer>
              
              <ResponsiveContainer background="accent" padding="md" rounded="2xl" shadow="xl">
                <div className="p-4">
                  <h3 className="font-medium mb-2">Background: accent, Shadow: xl</h3>
                  <p className="text-content-secondary text-sm">With rounded-2xl corners</p>
                </div>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Border Options */}
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold">Border Variants</h2>
            <p className="text-content-secondary">
              Different border options for visual separation.
            </p>
            
            <div className="space-y-4">
              {["none", "default", "top", "bottom", "x", "y"].map((borderType) => (
                <ResponsiveContainer
                  key={borderType}
                  border={borderType as any}
                  padding="md"
                  maxWidth="5xl"
                  className="py-3 bg-surface-2"
                >
                  <div className="p-4">
                    <span className="font-medium">border: {borderType}</span>
                  </div>
                </ResponsiveContainer>
              ))}
            </div>
          </section>

          {/* Nested Containers */}
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold">Nested Containers</h2>
            <p className="text-content-secondary">
              Demonstrate how containers can be nested with innerWrapper and outerWrapper options.
            </p>
            
            <ResponsiveContainer background="primary" padding="md" rounded="lg" shadow="md">
              <div className="p-6 space-y-4">
                <h3 className="font-medium">Parent Container</h3>
                
                <ResponsiveContainer 
                  background="secondary" 
                  padding="sm" 
                  rounded="md" 
                  maxWidth="3xl"
                  innerWrapper
                  contentClassName="p-4 bg-surface-3 rounded"
                >
                  <h4 className="font-medium mb-2">Child Container with innerWrapper</h4>
                  <p className="text-content-secondary">
                    This container has an inner wrapper with custom styling through contentClassName.
                  </p>
                </ResponsiveContainer>
                
                <ResponsiveContainer 
                  background="tertiary" 
                  padding="sm" 
                  rounded="md" 
                  maxWidth="3xl"
                  outerWrapper
                  contentClassName="p-1 bg-accent-purple/10 rounded-lg"
                >
                  <div className="p-4">
                    <h4 className="font-medium mb-2">Child Container with outerWrapper</h4>
                    <p className="text-content-secondary">
                      This container has an outer wrapper with custom styling through contentClassName.
                    </p>
                  </div>
                </ResponsiveContainer>
              </div>
            </ResponsiveContainer>
          </section>

          {/* Custom HTML Element */}
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold">Semantic HTML Elements</h2>
            <p className="text-content-secondary">
              ResponsiveContainer can render as any HTML element using the 'as' prop.
            </p>
            
            <div className="space-y-4">
              <ResponsiveContainer
                as="section"
                background="secondary"
                padding="md"
                rounded="lg"
                shadow="sm"
              >
                <div className="p-4">
                  <h3 className="font-medium mb-2">Rendered as &lt;section&gt;</h3>
                  <p className="text-content-secondary">This container is a semantic section element.</p>
                </div>
              </ResponsiveContainer>
              
              <ResponsiveContainer
                as="article"
                background="tertiary"
                padding="md"
                rounded="lg"
                shadow="sm"
              >
                <div className="p-4">
                  <h3 className="font-medium mb-2">Rendered as &lt;article&gt;</h3>
                  <p className="text-content-secondary">This container is a semantic article element.</p>
                </div>
              </ResponsiveContainer>
              
              <ResponsiveContainer
                as="aside"
                background="accent"
                padding="md"
                rounded="lg"
                shadow="sm"
              >
                <div className="p-4">
                  <h3 className="font-medium mb-2">Rendered as &lt;aside&gt;</h3>
                  <p className="text-content-secondary">This container is a semantic aside element.</p>
                </div>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Constrained and Gutter Examples */}
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold">Special Layout Options</h2>
            <p className="text-content-secondary">
              Special layout options like constrained viewport width and gutters.
            </p>
            
            <div className="space-y-4">
              <ResponsiveContainer
                constrained
                background="secondary"
                padding="md"
                rounded="lg"
                shadow="sm"
              >
                <div className="p-4">
                  <h3 className="font-medium mb-2">Constrained Container</h3>
                  <p className="text-content-secondary">This container is constrained to percentage of viewport width.</p>
                </div>
              </ResponsiveContainer>
              
              <ResponsiveContainer
                gutter
                background="tertiary"
                padding="md"
                rounded="lg"
                shadow="sm"
              >
                <div className="p-4">
                  <h3 className="font-medium mb-2">Container with Gutters</h3>
                  <p className="text-content-secondary">This container has additional gutters on the sides, useful for layouts with sidebars.</p>
                </div>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Example use cases */}
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold">Practical Examples</h2>
            <p className="text-content-secondary">
              Real-world examples of ResponsiveContainer in common layouts.
            </p>
            
            {/* Hero section */}
            <ResponsiveContainer
              maxWidth="6xl"
              verticalPadding="lg"
              padding="responsive"
              background="primary"
              rounded="xl"
              shadow="lg"
              className="text-center"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Hero Section</h2>
              <p className="text-content-secondary max-w-3xl mx-auto mb-6">
                A typical hero section with responsive padding that gets larger on bigger screens.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button>Get Started</Button>
                <Button variant="outline">Learn More</Button>
              </div>
            </ResponsiveContainer>

            {/* Card Grid */}
            <ResponsiveContainer maxWidth="7xl" padding="responsive">
              <h3 className="text-xl font-semibold mb-6">Card Grid Layout</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((item) => (
                  <Card key={item} className="overflow-hidden">
                    <div className="h-40 bg-surface-3"></div>
                    <div className="p-6">
                      <h4 className="font-medium mb-2">Card Title {item}</h4>
                      <p className="text-content-secondary text-sm">
                        Card content with responsive sizing inside a responsive container grid.
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </ResponsiveContainer>

            {/* Content Section */}
            <ResponsiveContainer 
              maxWidth="prose" 
              padding="responsive"
              verticalPadding="md"
              background="secondary"
              rounded="lg"
              shadow="sm"
            >
              <h3 className="text-xl font-semibold mb-4">Content Section</h3>
              <p className="mb-4">
                This is an example of a content section with the "prose" max-width setting, which is
                ideal for readable text content. The container ensures that line length stays optimal
                for readability across device sizes.
              </p>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus 
                hendrerit arcu sed erat molestie vehicula. Sed auctor neque eu tellus rhoncus ut 
                eleifend nibh porttitor. Ut in nulla enim. Phasellus molestie magna non est bibendum 
                non venenatis nisl tempor.
              </p>
            </ResponsiveContainer>
          </section>
          
          <div className="text-center pt-8">
            <Button asChild>
              <a href="/design-system">Back to Design System</a>
            </Button>
          </div>
        </div>
      </ResponsiveContainer>
    </div>
  )
}