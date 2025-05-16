"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";

// Utility function to merge class names
const cn = (...classes: (string | undefined)[]) => {
  return classes.filter(Boolean).join(" ");
};

// Button variants using the LUMEN design system
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-body font-medium transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // Primary action button with teal glow on hover
        primary: 
          "bg-[var(--c-accent)] text-black hover:shadow-[var(--shadow-glow-sm)] active:scale-[0.98] focus-visible:ring-[var(--c-accent)]",
        
        // Secondary action button with subtle effects
        secondary:
          "bg-[var(--c-surface-2)] text-[var(--c-text-primary)] hover:bg-[var(--c-surface-3)] active:scale-[0.98]", 
        
        // Subtle ghost button for less emphasis
        ghost: 
          "bg-transparent text-[var(--c-text-primary)] hover:bg-[var(--c-surface-2)]",
        
        // Outline button with border
        outline:
          "bg-transparent border border-[var(--c-border-strong)] text-[var(--c-text-primary)] hover:bg-[var(--c-surface-2)] hover:border-[var(--c-accent)]",
        
        // Destructive action button
        destructive:
          "bg-[var(--c-danger)] text-white hover:bg-opacity-90 active:scale-[0.98]",
        
        // Link style button
        link: 
          "bg-transparent text-[var(--c-accent)] hover:underline p-0 h-auto",
      },
      size: {
        // Follow 8pt grid system
        sm: "h-8 px-3 text-sm rounded-md",  // 32px height
        md: "h-10 px-4 py-2",               // 40px height
        lg: "h-12 px-6 text-base",          // 48px height
        xl: "h-14 px-8 text-lg",            // 56px height
        icon: "h-10 w-10 p-0 flex items-center justify-center",
      },
      glow: {
        // No glow effect
        none: "",
        // Subtle glow
        subtle: "hover:shadow-[var(--shadow-glow-sm)]",
        // Medium glow
        medium: "hover:shadow-[var(--shadow-glow-md)]",
        // Strong glow
        strong: "hover:shadow-[var(--shadow-glow-lg)]",
      },
      motion: {
        // No motion
        none: "",
        // Scale down slightly on click
        scale: "active:scale-[0.98]",
        // Pulse animation
        pulse: "animate-pulse",
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      glow: "none",
      motion: "scale",
    },
  }
);

// Spring animation variants for micro-delight effects
const springVariants = {
  tap: {
    scale: 0.98,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 20,
    },
  },
  hover: {
    scale: 1.02,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10,
    },
  }
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  // If animated is true, uses Framer Motion for micro-delight animations
  animated?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    glow,
    motion: motionType,
    asChild = false, 
    animated = false,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    // If animated flag is set, use motion.button for micro-delight animations
    if (animated) {
      return (
        <motion.button
          className={cn(buttonVariants({ variant, size, glow, className }))}
          ref={ref}
          whileTap="tap"
          whileHover="hover"
          variants={springVariants}
          {...props}
        />
      );
    }
    
    // Otherwise use standard button
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, glow, motion: motionType, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

// Button with Icon Component
interface ButtonWithIconProps extends ButtonProps {
  icon: React.ReactNode;
  iconPosition?: "left" | "right";
}

const ButtonWithIcon = React.forwardRef<HTMLButtonElement, ButtonWithIconProps>(
  ({ 
    icon, 
    iconPosition = "left", 
    children,
    ...props 
  }, ref) => {
    return (
      <Button {...props} ref={ref}>
        {iconPosition === "left" && (
          <span className="mr-2">{icon}</span>
        )}
        {children}
        {iconPosition === "right" && (
          <span className="ml-2">{icon}</span>
        )}
      </Button>
    );
  }
);
ButtonWithIcon.displayName = "ButtonWithIcon";

// Icon Button Component
interface IconButtonProps extends ButtonProps {
  icon: React.ReactNode;
  label: string; // Accessible name for the button (for screen readers)
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, label, ...props }, ref) => {
    return (
      <Button 
        {...props} 
        ref={ref} 
        size="icon" 
        aria-label={label}
      >
        {icon}
      </Button>
    );
  }
);
IconButton.displayName = "IconButton";

export { Button, ButtonWithIcon, IconButton, buttonVariants };