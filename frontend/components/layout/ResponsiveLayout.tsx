"use client"

import { forwardRef, HTMLAttributes, ReactNode } from "react"
import { cn } from "@/lib/utils"
import { ResponsiveContainer } from "@/components/ui/responsive-container"

export interface LayoutSection {
  id?: string
  children: ReactNode
  className?: string
  containerProps?: React.ComponentProps<typeof ResponsiveContainer>
  fullWidth?: boolean
  fullHeight?: boolean
  as?: React.ElementType
  background?: "primary" | "secondary" | "tertiary" | "accent" | "none"
  paddingY?: "none" | "sm" | "md" | "lg" | "xl"
}

export interface ResponsiveLayoutProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode | ReactNode[]
  className?: string
  sections?: LayoutSection[]
  gap?: "none" | "sm" | "md" | "lg" | "xl"
  mainContainer?: React.ComponentProps<typeof ResponsiveContainer>
}

/**
 * ResponsiveLayout - A high-level layout component for structuring pages
 * 
 * Features:
 * - Layout sections with consistent spacing
 * - Full-width or contained sections
 * - Configurable backgrounds and padding
 * - Semantic HTML elements via 'as' prop
 * - Container props forwarding for fine-grained control
 * - Gap controls between sections
 */
const ResponsiveLayout = forwardRef<HTMLDivElement, ResponsiveLayoutProps>(
  ({ children, className, sections = [], gap = "lg", mainContainer, ...props }, ref) => {
    // Map gap values to Tailwind classes
    const gapClasses = {
      none: "space-y-0",
      sm: "space-y-4 md:space-y-6",
      md: "space-y-6 md:space-y-10 lg:space-y-12",
      lg: "space-y-8 md:space-y-12 lg:space-y-16",
      xl: "space-y-12 md:space-y-16 lg:space-y-24",
    }

    const renderChildren = () => {
      if (sections && sections.length > 0) {
        return sections.map((section, index) => {
          const { 
            id, 
            children, 
            className, 
            containerProps, 
            fullWidth = false, 
            fullHeight = false,
            as: Component = "section",
            background = "none",
            paddingY = "none" 
          } = section

          // Map background values to Tailwind classes
          const backgroundClasses = {
            none: "",
            primary: "bg-surface-1",
            secondary: "bg-surface-2",
            tertiary: "bg-surface-3",
            accent: "bg-surface-accent",
          }

          // Set vertical padding classes
          const paddingYClasses = {
            none: "",
            sm: "py-4 md:py-6",
            md: "py-6 md:py-10 lg:py-12",
            lg: "py-8 md:py-12 lg:py-16",
            xl: "py-12 md:py-16 lg:py-24",
          }

          // If fullWidth is true, the section takes the full width
          // but the content can still be wrapped in a container
          if (fullWidth) {
            return (
              <Component
                key={id || index}
                id={id}
                className={cn(
                  backgroundClasses[background],
                  paddingYClasses[paddingY],
                  fullHeight && "min-h-screen",
                  className
                )}
              >
                {containerProps ? (
                  <ResponsiveContainer {...containerProps}>
                    {children}
                  </ResponsiveContainer>
                ) : (
                  children
                )}
              </Component>
            )
          }

          // If not fullWidth, the whole section is contained
          return (
            <Component
              key={id || index}
              id={id}
              className={cn(
                backgroundClasses[background],
                paddingYClasses[paddingY],
                fullHeight && "min-h-screen",
                className
              )}
            >
              <ResponsiveContainer {...containerProps}>
                {children}
              </ResponsiveContainer>
            </Component>
          )
        })
      }

      // If sections aren't provided, just render the children
      return children
    }

    if (mainContainer) {
      return (
        <ResponsiveContainer 
          ref={ref} 
          className={cn(gapClasses[gap], className)} 
          {...mainContainer} 
          {...props}
        >
          {renderChildren()}
        </ResponsiveContainer>
      )
    }

    return (
      <div 
        ref={ref} 
        className={cn(gapClasses[gap], className)} 
        {...props}
      >
        {renderChildren()}
      </div>
    )
  }
)

ResponsiveLayout.displayName = "ResponsiveLayout"

export { ResponsiveLayout }