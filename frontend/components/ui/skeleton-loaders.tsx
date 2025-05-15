"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * Skeleton loaders for different UI components
 */

// Skeleton for avatar/profile picture
export function SkeletonAvatar({ size = "md", className = "" }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const sizeMap = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  return <Skeleton className={cn("rounded-full", sizeMap[size], className)} />;
}

// Skeleton for a basic text line
export function SkeletonText({ width = "full", height = "md", className = "" }: { width?: "sm" | "md" | "lg" | "full"; height?: "sm" | "md" | "lg"; className?: string }) {
  const widthMap = {
    sm: "w-20",
    md: "w-40",
    lg: "w-60",
    full: "w-full",
  };

  const heightMap = {
    sm: "h-3",
    md: "h-4",
    lg: "h-5",
  };

  return <Skeleton className={cn(widthMap[width], heightMap[height], className)} />;
}

// Skeleton for a paragraph of text
export function SkeletonParagraph({ lines = 3, className = "" }: { lines?: number; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonText 
          key={i} 
          width={i === lines - 1 ? "md" : "full"} 
          height="sm" 
        />
      ))}
    </div>
  );
}

// Skeleton for a card component
export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="p-4">
        <Skeleton className="h-40 w-full rounded-md mb-4" />
        <div className="space-y-3">
          <SkeletonText width="lg" height="md" />
          <SkeletonParagraph lines={2} />
          <div className="flex justify-between pt-2">
            <Skeleton className="h-9 w-20 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
        </div>
      </div>
    </Card>
  );
}

// Skeleton for a product/tool card
export function SkeletonToolCard({ className = "" }: { className?: string }) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="p-4">
        <div className="flex mb-4">
          <Skeleton className="h-12 w-12 rounded-md mr-3" />
          <div className="space-y-2 flex-1">
            <SkeletonText width="lg" height="md" />
            <SkeletonText width="md" height="sm" />
          </div>
        </div>
        <SkeletonParagraph lines={2} className="mb-3" />
        <div className="flex flex-wrap gap-2 mb-4">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-14 rounded-full" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-8 w-20 rounded-md" />
          <div className="flex space-x-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      </div>
    </Card>
  );
}

// Skeleton for a list item
export function SkeletonListItem({ className = "" }: { className?: string }) {
  return (
    <div className={cn("flex items-center space-x-4 py-3", className)}>
      <SkeletonAvatar size="md" />
      <div className="flex-1 space-y-2">
        <SkeletonText width="lg" height="sm" />
        <SkeletonText width="md" height="sm" />
      </div>
      <Skeleton className="h-8 w-20 rounded-md" />
    </div>
  );
}

// Skeleton for a user profile
export function SkeletonProfile({ className = "" }: { className?: string }) {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <SkeletonAvatar size="lg" className="h-24 w-24" />
        <div className="space-y-3 flex-1 text-center sm:text-left">
          <SkeletonText width="lg" height="lg" />
          <SkeletonText width="md" height="sm" />
          <div className="flex justify-center sm:justify-start gap-2 pt-2">
            <Skeleton className="h-8 w-24 rounded-md" />
            <Skeleton className="h-8 w-20 rounded-md" />
          </div>
        </div>
      </div>
      <SkeletonParagraph lines={4} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}

// Skeleton for a feed or timeline
export function SkeletonFeed({ items = 3, className = "" }: { items?: number; className?: string }) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: items }).map((_, i) => (
        <Card key={i} className="overflow-hidden p-4">
          <div className="flex items-center mb-4">
            <SkeletonAvatar size="md" className="mr-3" />
            <div className="space-y-1 flex-1">
              <SkeletonText width="sm" height="sm" />
              <SkeletonText width="xs" height="sm" />
            </div>
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <SkeletonParagraph lines={2} className="mb-3" />
          {Math.random() > 0.5 && (
            <Skeleton className="h-40 w-full rounded-md mb-4" />
          )}
          <div className="flex justify-between pt-2">
            <div className="flex space-x-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <Skeleton className="h-8 w-20 rounded-md" />
          </div>
        </Card>
      ))}
    </div>
  );
}

// Skeleton for form inputs
export function SkeletonForm({ inputs = 3, className = "" }: { inputs?: number; className?: string }) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: inputs }).map((_, i) => (
        <div key={i} className="space-y-2">
          <SkeletonText width="sm" height="sm" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      ))}
      <div className="pt-2">
        <Skeleton className="h-10 w-full sm:w-40 rounded-md" />
      </div>
    </div>
  );
}

// Skeleton for a comment section
export function SkeletonComments({ count = 3, className = "" }: { count?: number; className?: string }) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-3">
        <SkeletonAvatar size="md" />
        <Skeleton className="h-10 flex-1 rounded-full" />
      </div>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-3 ml-0 sm:ml-6">
          <SkeletonAvatar size="sm" />
          <div className="flex-1 space-y-2">
            <div className="flex justify-between">
              <SkeletonText width="sm" height="sm" />
              <SkeletonText width="xs" height="sm" />
            </div>
            <SkeletonParagraph lines={1} />
            <div className="flex gap-3 pt-1">
              <Skeleton className="h-6 w-16 rounded-md" />
              <Skeleton className="h-6 w-16 rounded-md" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Skeleton for a grid of cards
export function SkeletonGrid({ columns = 3, rows = 2, className = "" }: { columns?: number; rows?: number; className?: string }) {
  return (
    <div className={cn(
      "grid gap-4",
      columns === 1 && "grid-cols-1",
      columns === 2 && "grid-cols-1 sm:grid-cols-2",
      columns === 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
      columns === 4 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
      className
    )}>
      {Array.from({ length: columns * rows }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}