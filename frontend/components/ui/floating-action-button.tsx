"use client"

import { forwardRef, HTMLAttributes, ReactNode } from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import { motion } from "framer-motion"
import { Plus } from "lucide-react"

const fabVariants = cva(
  "fixed shadow-lg rounded-full flex items-center justify-center z-50 transition-all duration-300", 
  {
    variants: {
      position: {
        "bottom-right": "bottom-4 right-4 sm:bottom-6 sm:right-6",
        "bottom-left": "bottom-4 left-4 sm:bottom-6 sm:left-6", 
        "bottom-center": "bottom-4 left-1/2 transform -translate-x-1/2 sm:bottom-6",
        "top-right": "top-4 right-4 sm:top-6 sm:right-6",
        "top-left": "top-4 left-4 sm:top-6 sm:left-6",
      },
      size: {
        sm: "h-10 w-10",
        md: "h-12 w-12",
        lg: "h-14 w-14 sm:h-16 sm:w-16",
      },
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
        accent: "bg-accent-blue text-white hover:bg-accent-blue/90",
        destructive: "bg-semantic-error text-white hover:bg-semantic-error/90",
        success: "bg-semantic-success text-white hover:bg-semantic-success/90",
        outline: "bg-background border border-input hover:bg-accent hover:text-accent-foreground",
      },
    },
    defaultVariants: {
      position: "bottom-right",
      size: "lg",
      variant: "primary",
    },
  }
)

export interface FloatingActionButtonProps 
  extends HTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof fabVariants> {
  children?: ReactNode
  icon?: ReactNode
  onClick?: () => void
  animate?: boolean
  extended?: boolean
  label?: string
}

/**
 * FloatingActionButton - A mobile-focused action button that floats above content
 * 
 * Features:
 * - Customizable position (bottom-right, bottom-left, etc.)
 * - Different size variants (sm, md, lg)
 * - Color variants (primary, secondary, accent, etc.)
 * - Optional label for extended FAB
 * - Animation options
 * - Custom icon support
 */
const FloatingActionButton = forwardRef<HTMLButtonElement, FloatingActionButtonProps>(
  ({ 
    className, 
    children, 
    position, 
    size, 
    variant, 
    icon, 
    onClick, 
    animate = true,
    extended = false,
    label,
    ...props 
  }, ref) => {
    // Use provided icon or default to Plus
    const buttonIcon = icon || <Plus className={cn("h-6 w-6", size === "sm" ? "h-4 w-4" : size === "md" ? "h-5 w-5" : "h-6 w-6")} />
    
    const baseButton = (
      <button
        className={cn(
          fabVariants({ position, size, variant }), 
          extended && "px-4",
          className
        )}
        onClick={onClick}
        ref={ref}
        {...props}
      >
        {buttonIcon}
        {extended && label && (
          <span className="ml-2 font-medium">{label}</span>
        )}
        {children}
      </button>
    )
    
    // If animate is true, wrap with motion
    if (animate) {
      return (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ 
            type: "spring", 
            stiffness: 400, 
            damping: 17 
          }}
        >
          {baseButton}
        </motion.div>
      )
    }
    
    return baseButton
  }
)

FloatingActionButton.displayName = "FloatingActionButton"

export { FloatingActionButton, fabVariants }