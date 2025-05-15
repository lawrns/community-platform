"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { AnimatedButton } from "@/components/motion/AnimatedButton";
import { MotionWrapper } from "@/components/motion/MotionWrapper";

import { SkipLink } from "@/components/a11y/SkipLink";
import { VisuallyHidden } from "@/components/a11y/VisuallyHidden";
import { LiveRegion } from "@/components/a11y/LiveRegion";
import { FocusTrap } from "@/components/a11y/FocusTrap";
import { useKeyboardNavigation, useAriaControls, useAnnouncer } from "@/components/a11y";

export default function AccessibilityDemo() {
  const [activeTab, setActiveTab] = useState("intro");
  
  return (
    <div className="container mx-auto px-4 py-16">
      <SkipLink href="#main-content" />
      
      <div className="mb-16 text-center">
        <h1 className="text-display-2xl font-bold text-content-primary mb-4">
          Accessibility Features
        </h1>
        <p className="text-body-lg text-content-secondary max-w-3xl mx-auto">
          This page showcases accessibility features and components designed to make the platform more inclusive.
        </p>
      </div>
      
      <Tabs 
        defaultValue="intro" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-1 md:grid-cols-5 mb-8">
          <TabsTrigger value="intro">Introduction</TabsTrigger>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="keyboard">Keyboard Navigation</TabsTrigger>
          <TabsTrigger value="aria">ARIA Controls</TabsTrigger>
          <TabsTrigger value="focus">Focus Management</TabsTrigger>
        </TabsList>
        
        <div id="main-content" tabIndex={-1} className="outline-none">
          <TabsContent value="intro">
            <IntroTab />
          </TabsContent>
          
          <TabsContent value="components">
            <ComponentsTab />
          </TabsContent>
          
          <TabsContent value="keyboard">
            <KeyboardNavigationTab />
          </TabsContent>
          
          <TabsContent value="aria">
            <AriaControlsTab />
          </TabsContent>
          
          <TabsContent value="focus">
            <FocusManagementTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

function IntroTab() {
  return (
    <MotionWrapper variant="fadeIn">
      <Card>
        <CardHeader>
          <CardTitle>Accessibility Introduction</CardTitle>
          <CardDescription>
            Building for everyone with inclusive design principles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-content-secondary">
            This platform has been designed with accessibility as a core principle, not an afterthought. We've implemented comprehensive accessibility features to ensure that all users, regardless of ability, can use our platform effectively.
          </p>
          
          <h3 className="text-display-sm font-medium text-content-primary mt-8">Key Accessibility Features</h3>
          <ul className="space-y-4 list-disc pl-6">
            <li className="text-content-secondary">
              <span className="font-medium text-content-primary">Semantic HTML</span>: We use proper semantic elements throughout the platform to ensure that content is correctly conveyed to assistive technologies.
            </li>
            <li className="text-content-secondary">
              <span className="font-medium text-content-primary">Keyboard Navigation</span>: All interactive elements are fully navigable and operable using only a keyboard.
            </li>
            <li className="text-content-secondary">
              <span className="font-medium text-content-primary">Screen Reader Support</span>: Content is properly labeled and announced to screen reader users through ARIA attributes and live regions.
            </li>
            <li className="text-content-secondary">
              <span className="font-medium text-content-primary">Focus Management</span>: Focus is properly managed to ensure users always know where they are in the interface.
            </li>
            <li className="text-content-secondary">
              <span className="font-medium text-content-primary">Color Contrast</span>: All text meets WCAG 2.1 AA standards for color contrast, ensuring readability for users with visual impairments.
            </li>
            <li className="text-content-secondary">
              <span className="font-medium text-content-primary">Responsive Design</span>: The platform is fully usable at various screen sizes and zoom levels to accommodate different needs.
            </li>
          </ul>
          
          <div className="bg-surface-2 p-6 rounded-lg border mt-8">
            <h3 className="text-display-sm font-medium text-content-primary mb-4">Standards We Follow</h3>
            <ul className="space-y-2 list-disc pl-6">
              <li className="text-content-secondary">WCAG 2.1 AA compliance</li>
              <li className="text-content-secondary">WAI-ARIA 1.1 practices</li>
              <li className="text-content-secondary">Keyboard accessibility guidelines</li>
              <li className="text-content-secondary">Mobile accessibility guidelines</li>
            </ul>
          </div>
          
          <p className="text-content-secondary mt-6">
            The demos on this page showcase many of our accessibility features, but they represent only a portion of our ongoing commitment to inclusive design.
          </p>
        </CardContent>
      </Card>
    </MotionWrapper>
  );
}

function ComponentsTab() {
  const [announcement, setAnnouncement] = useState("");
  const { announce, announcePolite, announceAssertive } = useAnnouncer();
  
  const handleAnnounce = (message: string, type: string) => {
    setAnnouncement(message);
    
    if (type === "polite") {
      announcePolite(message);
    } else if (type === "assertive") {
      announceAssertive(message);
    } else {
      announce(message, type as "polite" | "assertive");
    }
  };
  
  return (
    <MotionWrapper variant="fadeIn">
      <Card>
        <CardHeader>
          <CardTitle>Accessibility Components</CardTitle>
          <CardDescription>
            Specialized components that enhance accessibility
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-display-sm font-medium mb-4">VisuallyHidden Component</h3>
              <p className="text-content-secondary mb-4">
                This component visually hides content but keeps it accessible to screen readers.
              </p>
              <div className="flex flex-col space-y-4 mt-6">
                <Button className="w-fit">
                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 4v16m8-8H4" />
                  </svg>
                  Add Item
                </Button>
                
                <Button className="w-fit">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 4v16m8-8H4" />
                  </svg>
                  <VisuallyHidden>Add Item</VisuallyHidden>
                </Button>
                
                <p className="text-xs text-content-tertiary italic">
                  The second button uses VisuallyHidden to provide text for screen readers while maintaining the icon-only visual appearance.
                </p>
              </div>
            </div>
            
            <div>
              <h3 className="text-display-sm font-medium mb-4">Skip Link</h3>
              <p className="text-content-secondary mb-4">
                Skip links allow keyboard users to bypass navigation menus and jump directly to the main content.
              </p>
              <div className="flex flex-col space-y-4 mt-6">
                <p className="text-content-secondary">
                  This page includes a skip link that is visible when focused. Try tabbing from the beginning of the page to see it.
                </p>
                <div className="border p-4 rounded-md">
                  <p className="text-sm text-content-tertiary">Implementation example:</p>
                  <pre className="bg-surface-2 p-3 rounded-md text-xs mt-2 overflow-x-auto">
                    {`<SkipLink href="#main-content">Skip to main content</SkipLink>`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <div>
              <h3 className="text-display-sm font-medium mb-4">Live Regions</h3>
              <p className="text-content-secondary mb-4">
                Live regions announce dynamic content changes to screen reader users.
              </p>
              <div className="flex flex-col space-y-4 mt-6">
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="secondary" 
                    onClick={() => handleAnnounce("Your settings have been saved.", "polite")}
                  >
                    Polite Announcement
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => handleAnnounce("Error: Connection lost!", "assertive")}
                  >
                    Assertive Announcement
                  </Button>
                </div>
                
                {announcement && (
                  <div className="border p-4 rounded-md mt-4 bg-surface-2">
                    <p className="font-medium">Last announcement:</p>
                    <p className="text-content-secondary">{announcement}</p>
                  </div>
                )}
                
                <LiveRegion>
                  {announcement}
                </LiveRegion>
              </div>
            </div>
            
            <div>
              <h3 className="text-display-sm font-medium mb-4">Focus Trap</h3>
              <p className="text-content-secondary mb-4">
                Focus trap keeps keyboard focus within a component, useful for modals and dialogs.
              </p>
              <div className="flex flex-col space-y-4 mt-6">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>Open Accessible Dialog</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <FocusTrap>
                      <DialogHeader>
                        <DialogTitle>Accessible Dialog</DialogTitle>
                        <DialogDescription>
                          This dialog uses FocusTrap to keep focus within it when open. Try tabbing around - you won't be able to tab outside the dialog.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        <Input placeholder="Focus will stay within the dialog" />
                      </div>
                      <DialogFooter>
                        <Button type="submit">Save changes</Button>
                      </DialogFooter>
                    </FocusTrap>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </MotionWrapper>
  );
}

function KeyboardNavigationTab() {
  const [focusedItem, setFocusedItem] = useState<number>(-1);
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const listRef = useRef<HTMLUListElement>(null);
  
  const items = [
    "Home", "About", "Products", "Services", "Contact"
  ];
  
  const { keyDownHandler } = useKeyboardNavigation({
    container: listRef,
    onArrowUp: () => setFocusedItem(prev => Math.max(prev - 1, 0)),
    onArrowDown: () => setFocusedItem(prev => Math.min(prev + 1, items.length - 1)),
    onEnter: () => focusedItem >= 0 && setSelectedItem(focusedItem),
    onHome: () => setFocusedItem(0),
    onEnd: () => setFocusedItem(items.length - 1),
  });
  
  // Set initial focused item if none is set
  React.useEffect(() => {
    if (focusedItem === -1) {
      setFocusedItem(0);
    }
  }, [focusedItem]);
  
  return (
    <MotionWrapper variant="fadeIn">
      <Card>
        <CardHeader>
          <CardTitle>Keyboard Navigation</CardTitle>
          <CardDescription>
            Enhanced keyboard navigation for improved accessibility
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <p className="text-content-secondary">
            Our platform is fully navigable using only a keyboard. Below is a demo of keyboard-navigable components using our custom useKeyboardNavigation hook.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-display-sm font-medium mb-4">Navigable List</h3>
              <p className="text-content-secondary mb-4">
                This list can be navigated using arrow keys, and items can be selected with Enter.
              </p>
              
              <div 
                className="border rounded-md p-4 mt-4"
                tabIndex={0}
                onKeyDown={keyDownHandler}
                role="listbox"
                aria-activedescendant={focusedItem >= 0 ? `item-${focusedItem}` : undefined}
              >
                <ul ref={listRef} className="space-y-2">
                  {items.map((item, index) => (
                    <li
                      key={index}
                      id={`item-${index}`}
                      className={`px-4 py-2 rounded-md cursor-pointer ${
                        focusedItem === index ? "bg-surface-2 outline outline-2 outline-brand-primary" : ""
                      } ${selectedItem === index ? "bg-brand-primary text-content-onPrimary" : ""}`}
                      role="option"
                      aria-selected={selectedItem === index}
                      onClick={() => {
                        setFocusedItem(index);
                        setSelectedItem(index);
                      }}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="mt-4 text-sm text-content-tertiary">
                <p>Navigation keys:</p>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                  <li>↑/↓: Move focus</li>
                  <li>Enter: Select item</li>
                  <li>Home: Jump to first item</li>
                  <li>End: Jump to last item</li>
                </ul>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-display-sm font-medium mb-4">Key Navigation Guidelines</h3>
                <ul className="space-y-2 list-disc pl-6">
                  <li className="text-content-secondary">
                    All interactive elements should be reachable using Tab key
                  </li>
                  <li className="text-content-secondary">
                    Arrow keys should navigate within component groups
                  </li>
                  <li className="text-content-secondary">
                    Enter/Space should activate the focused element
                  </li>
                  <li className="text-content-secondary">
                    Escape should close dialogs and menus
                  </li>
                  <li className="text-content-secondary">
                    Home/End should jump to first/last items in lists
                  </li>
                </ul>
              </div>
              
              <div className="p-4 border rounded-md bg-surface-2 mt-4">
                <h4 className="font-medium mb-2">Why Keyboard Navigation Matters</h4>
                <p className="text-content-secondary text-sm">
                  Many users navigate the web exclusively with keyboards due to motor disabilities, visual impairments, or personal preference. Good keyboard navigation is essential for these users to access your content.
                </p>
              </div>
            </div>
          </div>
          
          <div className="rounded-md border p-6 bg-surface-2 mt-6">
            <h3 className="text-display-sm font-medium mb-4">Implementation with useKeyboardNavigation</h3>
            <pre className="bg-surface-3 p-3 rounded-md text-xs overflow-x-auto">
{`// Hook setup
const { keyDownHandler } = useKeyboardNavigation({
  onArrowUp: () => setFocusedItem(prev => Math.max(prev - 1, 0)),
  onArrowDown: () => setFocusedItem(prev => Math.min(prev + 1, items.length - 1)),
  onEnter: () => focusedItem >= 0 && setSelectedItem(focusedItem),
  onHome: () => setFocusedItem(0),
  onEnd: () => setFocusedItem(items.length - 1),
});

// Component JSX
<div 
  tabIndex={0}
  onKeyDown={keyDownHandler}
  role="listbox"
  aria-activedescendant={\`item-\${focusedItem}\`}
>
  <ul>
    {items.map((item, index) => (
      <li
        key={index}
        id={\`item-\${index}\`}
        role="option"
        aria-selected={selectedItem === index}
      >
        {item}
      </li>
    ))}
  </ul>
</div>`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </MotionWrapper>
  );
}

function AriaControlsTab() {
  const {
    buttonProps,
    contentProps,
    isExpanded,
    toggle,
  } = useAriaControls({
    defaultExpanded: false,
  });
  
  const {
    buttonProps: tabTriggerProps,
    getItemProps,
    toggleItemSelected,
    selectedItems,
  } = useAriaControls({
    multiple: true,
  });
  
  return (
    <MotionWrapper variant="fadeIn">
      <Card>
        <CardHeader>
          <CardTitle>ARIA Controls</CardTitle>
          <CardDescription>
            Managing accessible interactive components with ARIA
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <p className="text-content-secondary">
            ARIA attributes help make complex interactive components accessible to assistive technologies. Our useAriaControls hook simplifies applying the correct ARIA attributes.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-display-sm font-medium mb-4">Disclosure Component</h3>
              <p className="text-content-secondary mb-4">
                An accessible disclosure component (expandable section) with proper ARIA attributes.
              </p>
              
              <div className="border rounded-md overflow-hidden">
                <button
                  className="w-full px-4 py-3 bg-surface-2 text-left font-medium flex justify-between items-center"
                  {...buttonProps}
                  onClick={toggle}
                >
                  <span>Accessibility Information</span>
                  <svg 
                    className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isExpanded && (
                  <div {...contentProps} className="p-4">
                    <p className="text-content-secondary">
                      This disclosure component uses proper ARIA attributes to ensure it's accessible to screen readers. 
                      The button is automatically linked to its content through aria-controls, and the expanded state 
                      is communicated through aria-expanded.
                    </p>
                  </div>
                )}
              </div>
              
              <div className="mt-4 text-sm text-content-tertiary">
                <p>Applied ARIA attributes:</p>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                  <li>aria-expanded: {isExpanded ? "true" : "false"}</li>
                  <li>aria-controls: {contentProps.id}</li>
                  <li>aria-labelledby: {buttonProps.id}</li>
                </ul>
              </div>
            </div>
            
            <div>
              <h3 className="text-display-sm font-medium mb-4">Selectable List</h3>
              <p className="text-content-secondary mb-4">
                A multi-selectable list with proper ARIA roles and states.
              </p>
              
              <div className="border rounded-md p-4" {...tabTriggerProps} role="listbox" aria-multiselectable="true">
                <ul className="space-y-2">
                  {["Option 1", "Option 2", "Option 3", "Option 4"].map((option, index) => {
                    const itemId = `option-${index}`;
                    const isSelected = selectedItems.includes(itemId);
                    
                    return (
                      <li
                        key={index}
                        {...getItemProps(itemId)}
                        className={`px-4 py-2 rounded-md cursor-pointer flex items-center ${
                          isSelected ? "bg-brand-primary text-content-onPrimary" : "bg-surface-2"
                        }`}
                        onClick={() => toggleItemSelected(itemId)}
                      >
                        <div className={`w-4 h-4 border rounded mr-2 flex items-center justify-center ${
                          isSelected ? "bg-content-onPrimary border-content-onPrimary" : "border-content-secondary"
                        }`}>
                          {isSelected && (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        {option}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
          
          <div className="rounded-md border p-6 bg-surface-2 mt-6">
            <h3 className="text-display-sm font-medium mb-4">Implementation with useAriaControls</h3>
            <pre className="bg-surface-3 p-3 rounded-md text-xs overflow-x-auto">
{`// For disclosure component
const {
  buttonProps,
  contentProps,
  isExpanded,
  toggle,
} = useAriaControls({
  defaultExpanded: false,
});

// Apply to components
<button {...buttonProps} onClick={toggle}>
  Toggle Content
</button>

{isExpanded && (
  <div {...contentProps}>
    Content here
  </div>
)}

// For selectable list
const {
  getItemProps,
  toggleItemSelected,
  selectedItems,
} = useAriaControls({
  multiple: true,
});

// Apply to list items
<li
  {...getItemProps(itemId)}
  onClick={() => toggleItemSelected(itemId)}
>
  {option}
</li>`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </MotionWrapper>
  );
}

function FocusManagementTab() {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeFocusArea, setActiveFocusArea] = useState<number>(0);
  const focusAreaRefs = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
  ];
  
  const focusArea = (index: number) => {
    setActiveFocusArea(index);
    focusAreaRefs[index]?.current?.focus();
  };
  
  return (
    <MotionWrapper variant="fadeIn">
      <Card>
        <CardHeader>
          <CardTitle>Focus Management</CardTitle>
          <CardDescription>
            Ensuring users always know where they are in the interface
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <p className="text-content-secondary">
            Proper focus management is crucial for keyboard users to navigate your application effectively. We implement several techniques to ensure focus is always properly managed.
          </p>
          
          <div className="space-y-6">
            <h3 className="text-display-sm font-medium mb-4">Focus Indicators</h3>
            <p className="text-content-secondary mb-4">
              All interactive elements have visible focus indicators that meet WCAG 2.1 requirements for focus visibility.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Button>Default Focus Style</Button>
              <AnimatedButton variant="secondary">Animated Button</AnimatedButton>
              <Input placeholder="Input Focus Style" className="max-w-xs" />
            </div>
            
            <p className="text-sm text-content-tertiary mt-4">
              Try tabbing through these elements to see the consistent focus indicators. Each element has a clearly visible outline when focused.
            </p>
          </div>
          
          <div className="space-y-6">
            <h3 className="text-display-sm font-medium mb-4">Focus Management in Page Sections</h3>
            <p className="text-content-secondary mb-4">
              In complex interfaces, you should guide focus to the appropriate section when users perform actions.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[0, 1, 2].map((index) => (
                <div
                  key={index}
                  ref={focusAreaRefs[index]}
                  className={`border rounded-lg p-4 ${
                    activeFocusArea === index ? "ring-2 ring-brand-primary" : ""
                  }`}
                  tabIndex={-1}
                >
                  <h4 className="font-medium mb-3">Content Section {index + 1}</h4>
                  <p className="text-sm text-content-secondary mb-4">
                    This is an example content section that can receive focus.
                  </p>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => focusArea((index + 1) % 3)}
                  >
                    Focus Next Section
                  </Button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-6 mt-8">
            <h3 className="text-display-sm font-medium mb-4">Focus Containment</h3>
            <p className="text-content-secondary mb-4">
              When modal dialogs are open, focus should be trapped within them to prevent keyboard users from accidentally interacting with content that's visually hidden.
            </p>
            
            <Button onClick={() => setModalOpen(true)}>
              Open Modal with Focus Trap
            </Button>
            
            {modalOpen && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <FocusTrap onDeactivate={() => setModalOpen(false)}>
                  <div className="bg-surface-1 rounded-lg shadow-xl max-w-md w-full p-6">
                    <h2 className="text-display font-semibold mb-4">Focus Trapped Modal</h2>
                    <p className="text-content-secondary mb-6">
                      Focus is trapped within this modal. Try tabbing around - you'll notice that focus cycles through elements in this modal and doesn't escape to the page content underneath.
                    </p>
                    <div className="space-y-4">
                      <Input placeholder="Tab to me" />
                      <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setModalOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={() => setModalOpen(false)}>
                          Accept
                        </Button>
                      </div>
                    </div>
                  </div>
                </FocusTrap>
              </div>
            )}
          </div>
          
          <div className="border-t pt-6 mt-6">
            <h3 className="text-display-sm font-medium mb-4">Focus Management Best Practices</h3>
            <ul className="space-y-2 list-disc pl-6">
              <li className="text-content-secondary">
                Always maintain visible focus indicators for all interactive elements
              </li>
              <li className="text-content-secondary">
                Return focus to a logical element when a modal is closed
              </li>
              <li className="text-content-secondary">
                Set initial focus to the most logical element when a new section appears
              </li>
              <li className="text-content-secondary">
                Ensure all keyboard shortcuts can be disabled for users who use speech recognition
              </li>
              <li className="text-content-secondary">
                Avoid focus traps except in modal contexts like dialogs
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </MotionWrapper>
  );
}