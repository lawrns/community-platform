"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface ResponsiveGridProps {
  children: ReactNode
  className?: string
  cols?: {
    default: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
    "2xl"?: number
  }
  gap?: "none" | "xs" | "sm" | "md" | "lg" | "xl"
}

/**
 * A responsive grid component that adapts to different screen sizes
 * with customizable column counts
 */
export default function ResponsiveGrid({
  children,
  className,
  cols = { default: 1, md: 2, lg: 3 },
  gap = "md",
}: ResponsiveGridProps) {
  // Default column settings
  const defaultCols = {
    default: cols.default || 1,
    sm: cols.sm,
    md: cols.md,
    lg: cols.lg,
    xl: cols.xl,
    "2xl": cols["2xl"],
  }
  
  // Build grid-template-columns classes based on provided column counts
  const gridColsClasses = [
    `grid-cols-${defaultCols.default}`,
    defaultCols.sm && `sm:grid-cols-${defaultCols.sm}`,
    defaultCols.md && `md:grid-cols-${defaultCols.md}`,
    defaultCols.lg && `lg:grid-cols-${defaultCols.lg}`,
    defaultCols.xl && `xl:grid-cols-${defaultCols.xl}`,
    defaultCols["2xl"] && `2xl:grid-cols-${defaultCols["2xl"]}`,
  ].filter(Boolean).join(" ")
  
  // Map gap values to Tailwind classes
  const gapClasses = {
    none: "gap-0",
    xs: "gap-2",
    sm: "gap-4",
    md: "gap-6",
    lg: "gap-8",
    xl: "gap-10",
  }
  
  return (
    <div 
      className={cn(
        "grid w-full",
        gridColsClasses,
        gapClasses[gap],
        className
      )}
    >
      {children}
    </div>
  )
}