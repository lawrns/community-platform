"use client";

import React from 'react';
import { Icon, IconButton, IconName } from '@/components/ui/icon';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SubtleMotion } from '@/components/motion/SubtleMotion';

// Group icons by category
const iconGroups = {
  "Navigation": ['home', 'search', 'notifications', 'settings', 'user', 'dashboard', 'menu', 'externalLink'],
  "Content": ['document', 'message', 'calendar', 'clock', 'bookmark'],
  "Actions": ['like', 'star', 'check', 'close', 'add', 'remove', 'edit', 'delete', 'share', 'more'],
  "Directional": ['chevronDown', 'chevronUp', 'chevronLeft', 'chevronRight'],
  "Status": ['info', 'warning', 'error'],
  "Service/Brand": ['terminal', 'github', 'twitter', 'mail'],
  "Domain Specific": ['tool', 'wrench', 'package', 'topic', 'trending', 'arrowUpRight', 'follow', 'bellRing', 'flame', 'users']
};

export default function IconSystemDemo() {
  return (
    <div className="container mx-auto py-8 px-4">
      <SubtleMotion variant="slideUp">
        <div className="text-center mb-12">
          <h1 className="text-heading-3xl text-gradient-primary mb-4">Icon System</h1>
          <p className="text-body-lg text-secondary max-w-2xl mx-auto">
            A consistent, accessible icon system that maintains visual harmony throughout the interface
          </p>
        </div>
      </SubtleMotion>

      <div className="grid grid-cols-1 gap-8">
        {/* Icon Sizes */}
        <SubtleMotion variant="fadeIn" delay={0.1}>
          <Card className="card-subtle">
            <CardHeader>
              <CardTitle className="text-heading-xl">Icon Sizes</CardTitle>
              <CardDescription>Consistent sizing ensures visual harmony</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-end gap-8">
                <div className="text-center">
                  <Icon name="home" size="xs" className="mb-2" />
                  <p className="text-body-xs text-secondary">xs (14px)</p>
                </div>
                <div className="text-center">
                  <Icon name="home" size="sm" className="mb-2" />
                  <p className="text-body-xs text-secondary">sm (16px)</p>
                </div>
                <div className="text-center">
                  <Icon name="home" size="md" className="mb-2" />
                  <p className="text-body-xs text-secondary">md (20px)</p>
                </div>
                <div className="text-center">
                  <Icon name="home" size="lg" className="mb-2" />
                  <p className="text-body-xs text-secondary">lg (24px)</p>
                </div>
                <div className="text-center">
                  <Icon name="home" size="xl" className="mb-2" />
                  <p className="text-body-xs text-secondary">xl (32px)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </SubtleMotion>
        
        {/* Icon Buttons */}
        <SubtleMotion variant="fadeIn" delay={0.2}>
          <Card className="card-subtle">
            <CardHeader>
              <CardTitle className="text-heading-xl">Icon Buttons</CardTitle>
              <CardDescription>Icon-only buttons with different variants</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <div className="text-center">
                  <IconButton name="like" variant="default" className="mb-2" />
                  <p className="text-body-xs text-secondary">Default</p>
                </div>
                <div className="text-center">
                  <IconButton name="like" variant="ghost" className="mb-2" />
                  <p className="text-body-xs text-secondary">Ghost</p>
                </div>
                <div className="text-center">
                  <IconButton name="like" variant="outline" className="mb-2" />
                  <p className="text-body-xs text-secondary">Outline</p>
                </div>
                <div className="text-center">
                  <IconButton name="like" variant="subtle" className="mb-2" />
                  <p className="text-body-xs text-secondary">Subtle</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </SubtleMotion>
        
        {/* Icon Library */}
        <SubtleMotion variant="fadeIn" delay={0.3}>
          <Card className="card-subtle">
            <CardHeader>
              <CardTitle className="text-heading-xl">Icon Library</CardTitle>
              <CardDescription>All available icons grouped by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {Object.entries(iconGroups).map(([category, icons]) => (
                  <div key={category}>
                    <h3 className="text-heading-lg mb-4">{category}</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                      {icons.map((name) => (
                        <div key={name} className="flex flex-col items-center p-4 bg-surface-card-hover rounded-md">
                          <Icon name={name as IconName} size="md" className="mb-2" />
                          <p className="text-body-xs text-secondary text-center">{name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </SubtleMotion>
        
        {/* Usage Examples */}
        <SubtleMotion variant="fadeIn" delay={0.4}>
          <Card className="card-subtle">
            <CardHeader>
              <CardTitle className="text-heading-xl">Usage Examples</CardTitle>
              <CardDescription>Common patterns for using icons in the interface</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div>
                  <h3 className="text-heading-lg mb-4">Icons with Text</h3>
                  <div className="flex flex-wrap gap-6">
                    <div className="flex items-center">
                      <Icon name="home" size="md" className="mr-2 text-surface-primary" />
                      <span>Home</span>
                    </div>
                    <div className="flex items-center">
                      <Icon name="settings" size="md" className="mr-2 text-surface-primary" />
                      <span>Settings</span>
                    </div>
                    <div className="flex items-center">
                      <Icon name="user" size="md" className="mr-2 text-surface-primary" />
                      <span>Profile</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-heading-lg mb-4">Status Indicators</h3>
                  <div className="flex flex-wrap gap-6">
                    <div className="flex items-center">
                      <Icon name="info" size="md" className="mr-2 text-info-500" />
                      <span>Information message</span>
                    </div>
                    <div className="flex items-center">
                      <Icon name="warning" size="md" className="mr-2 text-warning-500" />
                      <span>Warning message</span>
                    </div>
                    <div className="flex items-center">
                      <Icon name="error" size="md" className="mr-2 text-error-500" />
                      <span>Error message</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-heading-lg mb-4">Action Indicators</h3>
                  <div className="flex flex-wrap gap-6">
                    <div className="flex items-center p-2 bg-surface-card-hover rounded-md">
                      <span className="mr-2">Share Post</span>
                      <Icon name="share" size="sm" className="text-surface-muted-foreground" />
                    </div>
                    <div className="flex items-center p-2 bg-surface-card-hover rounded-md">
                      <span className="mr-2">External Link</span>
                      <Icon name="externalLink" size="sm" className="text-surface-muted-foreground" />
                    </div>
                    <div className="flex items-center p-2 bg-surface-card-hover rounded-md">
                      <span className="mr-2">Add Topic</span>
                      <Icon name="add" size="sm" className="text-surface-muted-foreground" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </SubtleMotion>
      </div>
    </div>
  );
}