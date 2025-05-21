import React from 'react';
import ContrastExample from '../../components/ui/example-contrast';

export default function ContrastTestPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-surface-1 p-4 shadow-md">
        <div className="container mx-auto">
          <h1 className="text-foreground text-2xl font-bold">Contrast Test Page</h1>
          <p className="text-content-secondary">Testing improved contrast and readability</p>
        </div>
      </header>
      
      <main className="container mx-auto py-8">
        <ContrastExample />
        
        <div className="mt-16 p-6 bg-surface-1 rounded-lg shadow-md">
          <h2 className="text-foreground text-2xl font-semibold mb-6">Typography and Contrast Demonstration</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Text Color Variations</h3>
              <div className="space-y-4">
                <p className="text-foreground">Primary Text: Highest contrast for important content</p>
                <p className="text-content-secondary">Secondary Text: Good contrast for supporting content</p>
                <p className="text-content-tertiary">Tertiary Text: Still readable for less critical information</p>
                <p className="text-high-contrast font-medium">High Contrast Text: Maximum readability</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4">Background Contrast</h3>
              <div className="space-y-4">
                <div className="p-3 bg-background border border-border rounded">
                  <p className="text-foreground">Text on page background</p>
                </div>
                <div className="p-3 bg-surface-1 rounded">
                  <p className="text-foreground">Text on surface 1</p>
                </div>
                <div className="p-3 bg-surface-2 rounded">
                  <p className="text-foreground">Text on surface 2</p>
                </div>
                <div className="p-3 bg-surface-3 rounded">
                  <p className="text-foreground">Text on surface 3</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-12">
            <h3 className="text-xl font-semibold mb-4">Line Height Comparison</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="prose">
                <h4>Improved Line Height</h4>
                <p>
                  This paragraph demonstrates the improved line height and letter spacing settings.
                  The text should be noticeably more readable with better spacing between lines,
                  making it easier to track from one line to the next without eye strain or confusion.
                  Longer paragraphs especially benefit from these improvements as the eye can more
                  easily follow the flow of text.
                </p>
              </div>
              
              <div>
                <h4 className="text-xl font-semibold mb-2">Button Contrast</h4>
                <div className="space-y-4">
                  <button className="px-4 py-2 bg-primary text-primary-foreground rounded">
                    Primary Button
                  </button>
                  <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded ml-4">
                    Secondary Button
                  </button>
                  <div className="mt-4">
                    <button className="px-4 py-2 bg-surface-2 text-content-primary rounded border border-border">
                      Subtle Button
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}