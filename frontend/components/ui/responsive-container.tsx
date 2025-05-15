"use client"

import { forwardRef, HTMLAttributes, ReactNode } from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const containerVariants = cva(
  "w-full", // Base styles
  {
    variants: {
      maxWidth: {
        xs: "max-w-xs", // 20rem / 320px
        sm: "max-w-sm", // 24rem / 384px
        md: "max-w-md", // 28rem / 448px
        lg: "max-w-lg", // 32rem / 512px
        xl: "max-w-xl", // 36rem / 576px
        "2xl": "max-w-2xl", // 42rem / 672px
        "3xl": "max-w-3xl", // 48rem / 768px
        "4xl": "max-w-4xl", // 56rem / 896px
        "5xl": "max-w-5xl", // 64rem / 1024px
        "6xl": "max-w-6xl", // 72rem / 1152px
        "7xl": "max-w-7xl", // 80rem / 1280px
        prose: "max-w-prose", // 65ch
        full: "max-w-full", // 100%
        screen: "max-w-screen",
        none: "" // No max-width
      },
      padding: {
        none: "px-0",
        xs: "px-2 sm:px-3",
        sm: "px-3 sm:px-4 md:px-5",
        md: "px-4 sm:px-6 md:px-8 lg:px-10",
        lg: "px-6 sm:px-8 md:px-12 lg:px-16",
        xl: "px-8 sm:px-10 md:px-14 lg:px-20",
        responsive: "px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16", // Fluid responsive padding
        y: "py-6 sm:py-8 md:py-10 lg:py-12" // Vertical padding
      },
      verticalPadding: {
        none: "py-0",
        xs: "py-2 sm:py-3",
        sm: "py-3 sm:py-4 md:py-5",
        md: "py-4 sm:py-6 md:py-8 lg:py-10",
        lg: "py-6 sm:py-8 md:py-12 lg:py-16",
        xl: "py-8 sm:py-10 md:py-14 lg:py-20"
      },
      centered: {
        true: "mx-auto",
        false: ""
      },
      constrained: {
        // Only allow container to grow to a percentage of the viewport
        true: "max-w-[95vw] sm:max-w-[90vw] md:max-w-[90vw] lg:max-w-[90vw]",
        false: ""
      },
      gutter: {
        // Adds gutter to sides, useful for layouts with sidebars
        true: "mx-4 sm:mx-6 md:mx-8 lg:mx-10",
        false: ""
      },
      border: {
        none: "",
        default: "border border-border",
        top: "border-t border-t-border",
        bottom: "border-b border-b-border",
        x: "border-x border-x-border",
        y: "border-y border-y-border"
      },
      rounded: {
        none: "",
        default: "rounded-md",
        sm: "rounded-sm",
        md: "rounded-md",
        lg: "rounded-lg",
        xl: "rounded-xl",
        "2xl": "rounded-2xl",
        full: "rounded-full"
      },
      shadow: {
        none: "",
        sm: "shadow-sm",
        md: "shadow-md",
        lg: "shadow-lg",
        xl: "shadow-xl"
      },
      background: {
        none: "",
        primary: "bg-surface-1",
        secondary: "bg-surface-2",
        tertiary: "bg-surface-3",
        accent: "bg-surface-accent"
      }
    },
    defaultVariants: {
      maxWidth: "7xl",
      padding: "responsive",
      verticalPadding: "none",
      centered: true,
      constrained: false,
      gutter: false,
      border: "none",
      rounded: "none",
      shadow: "none",
      background: "none"
    },
  }
)

export interface ResponsiveContainerProps 
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerVariants> {
  children: ReactNode
  as?: React.ElementType
  contentClassName?: string
  innerWrapper?: boolean
  outerWrapper?: boolean
}

/**
 * ResponsiveContainer - A versatile container component that adapts to different screen sizes
 * 
 * Features:
 * - Configurable max-width to control container size
 * - Responsive padding that adjusts with viewport
 * - Optional vertical padding control
 * - Optional centering (mx-auto)
 * - Constrained mode to limit width relative to viewport
 * - Optional gutters for layout with sidebars
 * - Border options for visual separation
 * - Border radius options
 * - Shadow options
 * - Background options using design system surface colors
 * - Can act as semantic HTML element via 'as' prop
 * - Nested container structure with innerWrapper/outerWrapper options
 */
const ResponsiveContainer = forwardRef<HTMLDivElement, ResponsiveContainerProps>(
  ({ 
    children, 
    className, 
    maxWidth, 
    padding,
    verticalPadding,
    centered,
    constrained,
    gutter,
    border,
    rounded,
    shadow,
    background,
    as: Component = "div",
    contentClassName,
    innerWrapper = false,
    outerWrapper = false,
    ...props 
  }, ref) => {
    const containerClasses = cn(containerVariants({ 
      maxWidth, 
      padding, 
      verticalPadding,
      centered, 
      constrained,
      gutter,
      border,
      rounded,
      shadow,
      background,
      className: className 
    }))

    // If innerWrapper is true, wrap content in another div with content class
    if (innerWrapper) {
      return (
        <Component className={containerClasses} ref={ref} {...props}>
          <div className={cn("w-full", contentClassName)}>
            {children}
          </div>
        </Component>
      )
    }
    
    // If outerWrapper is true, wrap the container in another div
    if (outerWrapper) {
      return (
        <div className={cn("w-full", contentClassName)} {...props}>
          <Component className={containerClasses} ref={ref}>
            {children}
          </Component>
        </div>
      )
    }

    // Default rendering
    return (
      <Component 
        className={containerClasses}
        ref={ref}
        {...props}
      >
        {children}
      </Component>
    )
  }
)

ResponsiveContainer.displayName = "ResponsiveContainer"

export { ResponsiveContainer, containerVariants }