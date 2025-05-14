"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface ResponsiveContainerProps {
  children: ReactNode
  className?: string
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "full" | "prose"
  padding?: "none" | "sm" | "md" | "lg"
  centered?: boolean
}

/**
 * A responsive container component that handles different screen sizes
 * with appropriate padding and maximum widths
 */
export default function ResponsiveContainer({
  children,
  className,
  maxWidth = "xl",
  padding = "md",
  centered = true,
}: ResponsiveContainerProps) {
  // Map maxWidth values to Tailwind classes
  const maxWidthClasses = {
    xs: "max-w-xs",
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    full: "max-w-full",
    prose: "max-w-prose",
  }
  
  // Map padding values to Tailwind classes
  const paddingClasses = {
    none: "px-0",
    sm: "px-3 sm:px-4",
    md: "px-4 sm:px-6 md:px-8",
    lg: "px-6 sm:px-8 md:px-12",
  }
  
  // Center if centered is true
  const centeringClasses = centered ? "mx-auto" : ""
  
  return (
    <div 
      className={cn(
        maxWidthClasses[maxWidth],
        paddingClasses[padding],
        centeringClasses,
        "w-full",
        className
      )}
    >
      {children}
    </div>
  )
}