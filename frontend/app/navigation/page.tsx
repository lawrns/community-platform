"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MotionWrapper } from "@/components/motion/MotionWrapper";
import {
  NavigationMenu,
  MobileNavigation,
  BreadcrumbNav,
  NavItem
} from "@/components/navigation";
import { Home, Search, User, Settings, Wrench, MessagesSquare, Hash, PanelLeft, Paintbrush, Image, Accessibility, LogOut } from "lucide-react";

// Sample navigation items for demo
const navItems: NavItem[] = [
  {
    label: "Home",
    href: "/",
    icon: <Home className="h-4 w-4" />,
  },
  {
    label: "Tools",
    href: "/tools",
    icon: <Wrench className="h-4 w-4" />,
    children: [
      {
        label: "All Tools",
        href: "/tools",
        description: "Browse all community tools"
      },
      {
        label: "Generative AI",
        href: "/tools?category=generative-ai",
        description: "Tools for generating content"
      },
      {
        label: "Productivity",
        href: "/tools?category=productivity",
        description: "Tools to boost your workflow"
      },
      {
        label: "Submit Tool",
        href: "/tools/submit",
        description: "Add your tool to the platform"
      }
    ]
  },
  {
    label: "Q&A",
    href: "/q-and-a",
    icon: <MessagesSquare className="h-4 w-4" />,
  },
  {
    label: "Topics",
    href: "/topics",
    icon: <Hash className="h-4 w-4" />,
    children: [
      {
        label: "All Topics",
        href: "/topics",
        description: "Browse all discussion topics"
      },
      {
        label: "Trending Topics",
        href: "/topics/trending",
        description: "See what's popular right now"
      },
      {
        label: "AI Ethics",
        href: "/topics/ai-ethics",
        description: "Discussions on responsible AI"
      },
      {
        label: "Machine Learning",
        href: "/topics/machine-learning",
        description: "ML concepts and applications"
      }
    ]
  },
  {
    label: "Search",
    href: "/search",
    icon: <Search className="h-4 w-4" />,
  },
];

// Extended navigation items including demo pages
const extendedNavItems: NavItem[] = [
  ...navItems,
  {
    label: "Demos",
    href: "#",
    icon: <Paintbrush className="h-4 w-4" />,
    children: [
      {
        label: "Design System",
        href: "/design-system",
        icon: <Paintbrush className="h-4 w-4" />,
        description: "Design token documentation"
      },
      {
        label: "Loading States",
        href: "/loading-demo",
        icon: <PanelLeft className="h-4 w-4" />,
        description: "Loading components and animations"
      },
      {
        label: "Image Optimization",
        href: "/image-demo",
        icon: <Image className="h-4 w-4" />,
        description: "Image handling components"
      },
      {
        label: "Accessibility",
        href: "/accessibility",
        icon: <Accessibility className="h-4 w-4" />,
        description: "Accessibility features and tools"
      },
      {
        label: "Navigation",
        href: "/navigation",
        icon: <PanelLeft className="h-4 w-4" />,
        description: "Navigation components"
      }
    ]
  },
];

// User navigation items
const userNavItems: NavItem[] = [
  {
    label: "Profile",
    href: "/profile",
    icon: <User className="h-4 w-4" />,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: <Settings className="h-4 w-4" />,
    children: [
      {
        label: "Account",
        href: "/settings",
        description: "Manage your account"
      },
      {
        label: "Notifications",
        href: "/settings/notifications",
        description: "Configure notifications"
      },
      {
        label: "Privacy",
        href: "/settings/privacy",
        description: "Privacy settings"
      },
      {
        label: "Security",
        href: "/settings/security",
        description: "Security settings"
      }
    ]
  },
  {
    label: "Sign Out",
    href: "/signout",
    icon: <LogOut className="h-4 w-4" />,
  },
];

export default function NavigationDemoPage() {
  const [activeTab, setActiveTab] = useState("main");
  
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-16 text-center">
        <h1 className="text-display-2xl font-bold text-content-primary mb-4">
          Navigation Components
        </h1>
        <p className="text-body-lg text-content-secondary max-w-3xl mx-auto">
          Accessible and responsive navigation components for improved user experience.
        </p>
      </div>
      
      <Tabs 
        defaultValue="main" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-1 md:grid-cols-4 mb-8">
          <TabsTrigger value="main">Main Navigation</TabsTrigger>
          <TabsTrigger value="mobile">Mobile Navigation</TabsTrigger>
          <TabsTrigger value="breadcrumbs">Breadcrumbs</TabsTrigger>
          <TabsTrigger value="patterns">Navigation Patterns</TabsTrigger>
        </TabsList>
        
        <div id="main-content" tabIndex={-1} className="outline-none">
          <TabsContent value="main">
            <MainNavigationTab />
          </TabsContent>
          
          <TabsContent value="mobile">
            <MobileNavigationTab />
          </TabsContent>
          
          <TabsContent value="breadcrumbs">
            <BreadcrumbsTab />
          </TabsContent>
          
          <TabsContent value="patterns">
            <PatternsTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

function MainNavigationTab() {
  const [variant, setVariant] = useState<"horizontal" | "vertical">("horizontal");

  return (
    <MotionWrapper variant="fadeIn">
      <Card>
        <CardHeader>
          <CardTitle>Main Navigation Menu</CardTitle>
          <CardDescription>
            Accessible navigation menu with dropdown support and keyboard navigation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="flex flex-wrap gap-4 mb-6">
            <Button 
              variant={variant === "horizontal" ? "default" : "outline"}
              onClick={() => setVariant("horizontal")}
            >
              Horizontal Layout
            </Button>
            <Button 
              variant={variant === "vertical" ? "default" : "outline"}
              onClick={() => setVariant("vertical")}
            >
              Vertical Layout
            </Button>
          </div>
          
          <div className={variant === "horizontal" ? "border-b pb-4" : "border-r w-64 pr-4 pb-4"}>
            <NavigationMenu 
              items={extendedNavItems}
              variant={variant}
              showIcons={true}
              logoComponent={
                variant === "horizontal" ? (
                  <div className="font-bold text-display-sm text-brand-primary">Community.io</div>
                ) : null
              }
            />
          </div>
          
          <div className="bg-surface-2 rounded-lg p-6">
            <h3 className="text-display-sm font-medium mb-4">Features</h3>
            <ul className="space-y-2 list-disc pl-6">
              <li className="text-content-secondary">
                Keyboard navigation (use arrow keys, Enter, and Escape)
              </li>
              <li className="text-content-secondary">
                ARIA attributes for screen reader support
              </li>
              <li className="text-content-secondary">
                Dropdown support with animation
              </li>
              <li className="text-content-secondary">
                Flexible layouts (horizontal or vertical)
              </li>
              <li className="text-content-secondary">
                Active state highlighting
              </li>
            </ul>
          </div>
          
          <div className="rounded-md border p-6 bg-surface-2">
            <h3 className="text-display-sm font-medium mb-4">Implementation Example</h3>
            <pre className="bg-surface-3 p-3 rounded-md text-xs overflow-x-auto">
{`<NavigationMenu 
  items={[
    {
      label: "Home",
      href: "/",
      icon: <Home className="h-4 w-4" />,
    },
    {
      label: "Tools",
      href: "/tools",
      icon: <Wrench className="h-4 w-4" />,
      children: [
        {
          label: "All Tools",
          href: "/tools",
          description: "Browse all tools"
        },
        // More children...
      ]
    },
    // More items...
  ]}
  variant="horizontal"
  showIcons={true}
/>`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </MotionWrapper>
  );
}

function MobileNavigationTab() {
  return (
    <MotionWrapper variant="fadeIn">
      <Card>
        <CardHeader>
          <CardTitle>Mobile Navigation</CardTitle>
          <CardDescription>
            Slide-out mobile drawer navigation with nested menus
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <p className="text-content-secondary">
            Click the menu button below to see the mobile navigation drawer in action. It supports nested menus and is fully keyboard accessible.
          </p>
          
          <div className="flex justify-center">
            <MobileNavigation 
              items={extendedNavItems}
              showIcons={true}
              logoComponent={
                <div className="font-bold text-display-sm text-brand-primary">Community.io</div>
              }
            />
          </div>
          
          <div className="bg-surface-2 rounded-lg p-6 mt-8">
            <h3 className="text-display-sm font-medium mb-4">Features</h3>
            <ul className="space-y-2 list-disc pl-6">
              <li className="text-content-secondary">
                Animated slide-out drawer
              </li>
              <li className="text-content-secondary">
                Nested menu support with back navigation
              </li>
              <li className="text-content-secondary">
                Focus management with focus trap
              </li>
              <li className="text-content-secondary">
                Proper ARIA attributes for accessibility
              </li>
              <li className="text-content-secondary">
                Click outside to close
              </li>
            </ul>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div>
              <h3 className="text-display-sm font-medium mb-4">Integration</h3>
              <p className="text-content-secondary mb-4">
                The MobileNavigation component is typically conditionally rendered for smaller screens, while the main NavigationMenu is shown for larger screens.
              </p>
              <pre className="bg-surface-3 p-3 rounded-md text-xs overflow-x-auto">
{`// In your header component:

// For larger screens
<div className="hidden md:block">
  <NavigationMenu items={navItems} />
</div>

// For mobile
<div className="md:hidden">
  <MobileNavigation items={navItems} />
</div>`}
              </pre>
            </div>
            
            <div>
              <h3 className="text-display-sm font-medium mb-4">Accessibility</h3>
              <p className="text-content-secondary mb-4">
                The mobile navigation includes these accessibility features:
              </p>
              <ul className="space-y-2 list-disc pl-6">
                <li className="text-content-secondary">
                  Focus trap to keep keyboard focus within the drawer
                </li>
                <li className="text-content-secondary">
                  ARIA roles (dialog, navigation)
                </li>
                <li className="text-content-secondary">
                  aria-expanded, aria-controls, aria-label
                </li>
                <li className="text-content-secondary">
                  Visual indicators for active states
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </MotionWrapper>
  );
}

function BreadcrumbsTab() {
  const [useProvided, setUseProvided] = useState(false);
  
  // Example breadcrumb items
  const providedItems = [
    { label: "Home", href: "/", icon: <Home className="h-4 w-4" /> },
    { label: "Products", href: "/products" },
    { label: "Electronics", href: "/products/electronics" },
    { label: "Laptops", href: "/products/electronics/laptops" },
    { label: "MacBook Pro", href: "/products/electronics/laptops/macbook-pro" },
  ];
  
  return (
    <MotionWrapper variant="fadeIn">
      <Card>
        <CardHeader>
          <CardTitle>Breadcrumb Navigation</CardTitle>
          <CardDescription>
            Breadcrumb trail for hierarchical navigation and orientation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="flex flex-wrap gap-4 mb-6">
            <Button 
              variant={!useProvided ? "default" : "outline"}
              onClick={() => setUseProvided(false)}
            >
              Auto-generated
            </Button>
            <Button 
              variant={useProvided ? "default" : "outline"}
              onClick={() => setUseProvided(true)}
            >
              Provided Items
            </Button>
          </div>
          
          <div className="border p-4 rounded-lg">
            <p className="text-sm text-content-tertiary mb-4">
              {useProvided 
                ? "Breadcrumbs with explicitly provided items:" 
                : "Breadcrumbs automatically generated from the current URL path:"}
            </p>
            <BreadcrumbNav 
              items={useProvided ? providedItems : undefined}
              responsive={true}
              maxItems={5}
            />
          </div>
          
          <div className="space-y-6 mt-8">
            <h3 className="text-display-sm font-medium mb-4">Truncated Breadcrumbs</h3>
            <p className="text-content-secondary mb-4">
              For deep hierarchies, breadcrumbs can be truncated to show only the most relevant parts:
            </p>
            <div className="border p-4 rounded-lg">
              <BreadcrumbNav 
                items={providedItems} 
                maxItems={3}
              />
            </div>
          </div>
          
          <div className="bg-surface-2 rounded-lg p-6 mt-8">
            <h3 className="text-display-sm font-medium mb-4">When to Use Breadcrumbs</h3>
            <ul className="space-y-2 list-disc pl-6">
              <li className="text-content-secondary">
                For websites with hierarchical navigation structures
              </li>
              <li className="text-content-secondary">
                When users need to understand their current location
              </li>
              <li className="text-content-secondary">
                To provide easy access to parent categories
              </li>
              <li className="text-content-secondary">
                When the site has many levels of navigation depth
              </li>
            </ul>
          </div>
          
          <div className="rounded-md border p-6 bg-surface-2">
            <h3 className="text-display-sm font-medium mb-4">Implementation Example</h3>
            <pre className="bg-surface-3 p-3 rounded-md text-xs overflow-x-auto">
{`// Auto-generated from current URL path:
<BreadcrumbNav 
  homeHref="/"
  homeLabel="Home"
  showHomeIcon={true}
  maxItems={4}
/>

// With provided items:
<BreadcrumbNav 
  items={[
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
    { label: "Electronics", href: "/products/electronics" }
  ]}
/>`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </MotionWrapper>
  );
}

function PatternsTab() {
  return (
    <MotionWrapper variant="fadeIn">
      <Card>
        <CardHeader>
          <CardTitle>Navigation Patterns</CardTitle>
          <CardDescription>
            Common navigation patterns and implementation guidelines
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-display-sm font-medium">Main + User Navigation</h3>
              <p className="text-content-secondary mb-4">
                A common pattern is to separate main navigation from user-specific navigation:
              </p>
              
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-center border-b pb-4 mb-4">
                  <div className="font-bold text-display-sm">Brand</div>
                  
                  <div className="hidden md:flex items-center">
                    <NavigationMenu 
                      items={navItems.slice(0, 5)}
                      variant="horizontal"
                      showIcons={false}
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <NavigationMenu 
                      items={userNavItems}
                      variant="horizontal"
                      showIcons={true}
                    />
                    
                    <div className="md:hidden">
                      <MobileNavigation items={navItems} buttonClassName="ml-2" />
                    </div>
                  </div>
                </div>
                
                <div className="text-sm text-content-tertiary">
                  Main content area
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-display-sm font-medium">Sidebar + Header</h3>
              <p className="text-content-secondary mb-4">
                Another common pattern is to use a sidebar for main navigation with a simplified header:
              </p>
              
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-center border-b pb-4 mb-4">
                  <div className="font-bold text-display-sm">Brand</div>
                  
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" className="p-2">
                      <Search className="h-4 w-4" />
                    </Button>
                    
                    <NavigationMenu 
                      items={userNavItems.slice(0, 2)}
                      variant="horizontal"
                      showIcons={true}
                    />
                    
                    <div className="md:hidden">
                      <MobileNavigation items={navItems} buttonClassName="ml-2" />
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="hidden md:block w-48 border-r pr-4">
                    <NavigationMenu 
                      items={navItems}
                      variant="vertical"
                      showIcons={true}
                    />
                  </div>
                  
                  <div className="flex-1 text-sm text-content-tertiary">
                    Main content area
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-surface-2 rounded-lg p-6 mt-8">
            <h3 className="text-display-sm font-medium mb-4">Navigation Best Practices</h3>
            <ul className="space-y-4 list-disc pl-6">
              <li className="text-content-secondary">
                <span className="font-medium text-content-primary">Consistency:</span> Maintain consistent navigation patterns across all pages
              </li>
              <li className="text-content-secondary">
                <span className="font-medium text-content-primary">Hierarchy:</span> Organize navigation items by importance and frequency of use
              </li>
              <li className="text-content-secondary">
                <span className="font-medium text-content-primary">Feedback:</span> Clearly indicate the current location in the navigation
              </li>
              <li className="text-content-secondary">
                <span className="font-medium text-content-primary">Progressive disclosure:</span> Use dropdowns to hide complexity until needed
              </li>
              <li className="text-content-secondary">
                <span className="font-medium text-content-primary">Accessibility:</span> Ensure navigation is usable with keyboard only and provides proper ARIA attributes
              </li>
              <li className="text-content-secondary">
                <span className="font-medium text-content-primary">Responsiveness:</span> Adapt navigation patterns for different screen sizes
              </li>
            </ul>
          </div>
          
          <div className="rounded-md border p-6 bg-surface-2 mt-6">
            <h3 className="text-display-sm font-medium mb-4">Implementing Responsive Navigation</h3>
            <pre className="bg-surface-3 p-3 rounded-md text-xs overflow-x-auto">
{`// Example responsive navigation pattern

export default function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto flex items-center justify-between px-4 h-16">
        {/* Logo */}
        <Link href="/" className="font-bold text-xl">Brand</Link>
        
        {/* Main navigation - hidden on mobile */}
        <div className="hidden md:block">
          <NavigationMenu items={mainNavItems} />
        </div>
        
        {/* User navigation - always visible */}
        <div className="flex items-center gap-2">
          <NavigationMenu items={userNavItems} />
          
          {/* Mobile menu button - only on mobile */}
          <div className="md:hidden">
            <MobileNavigation items={allNavItems} />
          </div>
        </div>
      </div>
    </header>
  );
}`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </MotionWrapper>
  );
}