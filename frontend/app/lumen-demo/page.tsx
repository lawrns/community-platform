"use client";

import React from 'react';
import { Button, ButtonWithIcon } from '@/components/ui/lumen-button';
import { Glass, GlassCard } from '@/components/ui/lumen-glass';
import { MicroMotion, StaggerContainer, Interactive, Attention } from '@/components/ui/lumen-motion';

export default function LumenDemo() {
  return (
    <div className="lumen-container py-6">
      <MicroMotion variant="slideUp">
        <section className="mb-8">
          <h1 className="display-1 mb-4">LUMEN Design System</h1>
          <p className="body-lg mb-6 text-secondary">A dark-mode first, electric-teal focused design system for Community.io</p>
          
          <div className="flex flex-wrap gap-4">
            <Button variant="primary" glow="medium">Electric Teal Focus</Button>
            <Button variant="secondary">Secondary Action</Button>
            <Button variant="outline">Outline Button</Button>
            <Button variant="ghost">Ghost Button</Button>
          </div>
        </section>
      </MicroMotion>
      
      <section className="mb-10">
        <h2 className="display-2 mb-4">Color System</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-surface-2 rounded-lg">
            <h3 className="display-3 mb-3">Dark Mode (Default)</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-md" style={{ backgroundColor: 'var(--c-bg)' }}>
                <span className="text-primary">Background</span>
              </div>
              <div className="p-3 rounded-md" style={{ backgroundColor: 'var(--c-surface-1)' }}>
                <span className="text-primary">Surface 1</span>
              </div>
              <div className="p-3 rounded-md" style={{ backgroundColor: 'var(--c-surface-2)' }}>
                <span className="text-primary">Surface 2</span>
              </div>
              <div className="p-3 rounded-md" style={{ backgroundColor: 'var(--c-surface-3)' }}>
                <span className="text-primary">Surface 3</span>
              </div>
              <div className="p-3 rounded-md bg-glass">
                <span className="text-primary">Glass Surface</span>
              </div>
              <div className="p-3 rounded-md" style={{ backgroundColor: 'var(--c-accent)' }}>
                <span className="text-black">Accent</span>
              </div>
            </div>
            
            <h4 className="body-lg font-bold mt-4 mb-2">Text Colors</h4>
            <div className="space-y-2">
              <div className="text-primary">Primary Text</div>
              <div className="text-secondary">Secondary Text</div>
              <div className="text-tertiary">Tertiary Text</div>
              <div className="text-accent">Accent Text</div>
            </div>
          </div>
          
          <div className="p-4 bg-white rounded-lg">
            <h3 className="display-3 mb-3" style={{ color: '#1F2937' }}>Light Mode</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-md" style={{ backgroundColor: '#F9FAFB', color: '#1F2937' }}>
                <span>Background</span>
              </div>
              <div className="p-3 rounded-md" style={{ backgroundColor: '#FFFFFF', color: '#1F2937' }}>
                <span>Surface 1</span>
              </div>
              <div className="p-3 rounded-md" style={{ backgroundColor: '#F3F4F6', color: '#1F2937' }}>
                <span>Surface 2</span>
              </div>
              <div className="p-3 rounded-md" style={{ backgroundColor: '#E5E7EB', color: '#1F2937' }}>
                <span>Surface 3</span>
              </div>
              <div className="p-3 rounded-md" style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.6)', 
                backdropFilter: 'blur(10px)', 
                color: '#1F2937' 
              }}>
                <span>Glass Surface</span>
              </div>
              <div className="p-3 rounded-md" style={{ backgroundColor: '#0891B2', color: 'white' }}>
                <span>Accent</span>
              </div>
            </div>
            
            <h4 className="body-lg font-bold mt-4 mb-2" style={{ color: '#1F2937' }}>Text Colors</h4>
            <div className="space-y-2">
              <div style={{ color: '#1F2937' }}>Primary Text</div>
              <div style={{ color: '#4B5563' }}>Secondary Text</div>
              <div style={{ color: '#6B7280' }}>Tertiary Text</div>
              <div style={{ color: '#0891B2' }}>Accent Text</div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="display-2 mb-4">Typography</h2>
        <StaggerContainer className="space-y-4">
          <div className="p-4 bg-surface-1 rounded-lg">
            <h1 className="display-1 mb-2">Display 1 (64/72px)</h1>
            <div className="text-tertiary">Satoshi Bold</div>
          </div>
          
          <div className="p-4 bg-surface-1 rounded-lg">
            <h1 className="display-2 mb-2">Display 2 (40/48px)</h1>
            <div className="text-tertiary">Satoshi Bold</div>
          </div>
          
          <div className="p-4 bg-surface-1 rounded-lg">
            <h1 className="display-3 mb-2">Display 3 (32/40px)</h1>
            <div className="text-tertiary">Satoshi Semibold</div>
          </div>
          
          <div className="p-4 bg-surface-1 rounded-lg">
            <p className="body-lg mb-2">Body Large (18/28px)</p>
            <div className="text-tertiary">Inter Regular</div>
          </div>
          
          <div className="p-4 bg-surface-1 rounded-lg">
            <p className="body mb-2">Body Medium (16/24px)</p>
            <div className="text-tertiary">Inter Regular</div>
          </div>
          
          <div className="p-4 bg-surface-1 rounded-lg">
            <p className="body-sm mb-2">Body Small (14/20px)</p>
            <div className="text-tertiary">Inter Regular</div>
          </div>
          
          <div className="p-4 bg-surface-1 rounded-lg">
            <code className="mono mb-2">Monospace (16/24px)</code>
            <div className="text-tertiary">JetBrains Mono</div>
          </div>
        </StaggerContainer>
      </section>
      
      <section className="mb-10">
        <h2 className="display-2 mb-4">Buttons & Interactions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="display-3 mb-3">Button Variants</h3>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
            </div>
            
            <h3 className="display-3 mb-3 mt-6">Button Sizes</h3>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary" size="sm">Small</Button>
              <Button variant="primary" size="md">Medium</Button>
              <Button variant="primary" size="lg">Large</Button>
              <Button variant="primary" size="xl">Extra Large</Button>
            </div>
            
            <h3 className="display-3 mb-3 mt-6">Button with Icon</h3>
            <div className="flex flex-wrap gap-3">
              <ButtonWithIcon 
                variant="primary" 
                icon={<span>🔍</span>}
              >
                Search
              </ButtonWithIcon>
              
              <ButtonWithIcon 
                variant="outline" 
                icon={<span>📝</span>}
                iconPosition="right"
              >
                Edit
              </ButtonWithIcon>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="display-3 mb-3">Micro-Delight Animations</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="primary" animated>Spring Animation</Button>
              
              <Interactive className="p-3 bg-surface-2 rounded-lg text-center">
                Hover & Tap
              </Interactive>
              
              <Attention 
                className="p-3 bg-surface-2 rounded-lg text-center"
                effect="pulse"
              >
                Pulse Animation
              </Attention>
              
              <Button 
                variant="primary"
                glow="strong"
              >
                Electric Glow
              </Button>
            </div>
            
            <h3 className="display-3 mb-3 mt-6">8pt Grid System</h3>
            <div className="grid grid-cols-4 gap-1">
              <div className="h-1 bg-accent"></div>
              <div className="h-2 bg-accent"></div>
              <div className="h-3 bg-accent"></div>
              <div className="h-4 bg-accent"></div>
              <div className="text-center text-xs mt-1">4px</div>
              <div className="text-center text-xs mt-1">8px</div>
              <div className="text-center text-xs mt-1">16px</div>
              <div className="text-center text-xs mt-1">32px</div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="display-2 mb-6">Glass Surfaces</h2>
        
        <div className="relative h-[400px] rounded-xl overflow-hidden">
          {/* Background gradient */}
          <div 
            className="absolute inset-0 animate-wave"
            style={{
              background: 'radial-gradient(circle at 30% 30%, rgba(10, 233, 233, 0.4) 0%, rgba(8, 145, 178, 0.1) 50%, rgba(0, 0, 0, 0) 70%)'
            }}
          ></div>
          
          <div className="absolute inset-0 grid grid-cols-3 gap-4 p-6">
            <GlassCard
              variant="default"
              blur="md"
              title="Default Glass"
              description="Standard glass effect with blur"
              footer={<div className="text-right"><Button variant="ghost" size="sm">Action</Button></div>}
            >
              <p>Glass surfaces provide depth while maintaining visibility of background elements.</p>
            </GlassCard>
            
            <Glass
              variant="accent"
              blur="lg"
              className="p-4 flex items-center justify-center"
              interactive="hover"
            >
              <div className="text-center">
                <h3 className="font-semibold mb-2">Accent Glass</h3>
                <p className="text-sm">Hover to see the interactive effect</p>
              </div>
            </Glass>
            
            <Glass
              variant="dark"
              blur="lg"
              shadow="glow"
              className="p-4 flex items-center justify-center text-white"
            >
              <div className="text-center">
                <h3 className="font-semibold mb-2">Dark Glass with Glow</h3>
                <p className="text-sm">Used for more prominent elements</p>
              </div>
            </Glass>
          </div>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="display-2 mb-4">Accessibility</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-surface-1 rounded-lg">
            <h3 className="display-3 mb-3">Focus Indicators</h3>
            <div className="space-y-3">
              <div>
                <Button variant="primary">Tab to Me</Button>
                <p className="mt-2 text-tertiary">Focus state with teal outline and glow</p>
              </div>
              
              <div>
                <Button variant="primary" className="focus-error">Tab to Me</Button>
                <p className="mt-2 text-tertiary">Error focus state</p>
              </div>
              
              <div className="text-center p-4 bg-surface-3 rounded-lg mt-4">
                <p>Press <code>Tab</code> to see focus styles</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-surface-1 rounded-lg">
            <h3 className="display-3 mb-3">Reduced Motion</h3>
            <p className="mb-4">All animations respect the <code>prefers-reduced-motion</code> media query.</p>
            
            <div className="p-4 bg-surface-2 rounded-lg">
              <h4 className="font-semibold mb-2">Reduced Motion Preference</h4>
              <p>When enabled, all animations will be disabled or significantly reduced.</p>
            </div>
            
            <h3 className="display-3 mb-3 mt-6">Color Contrast</h3>
            <p>All text meets WCAG AA standards with a minimum contrast ratio of 4.5:1.</p>
          </div>
        </div>
      </section>
      
      <footer className="mt-10 pt-6 border-t border-border-subtle text-center text-tertiary">
        <p>LUMEN Design System for Community.io</p>
        <p>Dark-mode first • Focus-through-glow • Accessible by design</p>
      </footer>
    </div>
  );
}