"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

// Utility function to merge class names
const cn = (...classes: (string | undefined)[]) => {
  return classes.filter(Boolean).join(" ");
};

// Glass component variants
const glassVariants = cva(
  "relative backdrop-blur-md bg-glass border border-solid transition-all duration-200",
  {
    variants: {
      variant: {
        // Default style - medium opacity, subtle border
        default: "bg-[var(--c-surface-glass)] border-[var(--c-border-subtle)]",
        // Dark style - higher opacity, more visible in light environments
        dark: "bg-[rgba(14,18,23,0.75)] border-[rgba(255,255,255,0.06)]",
        // Light style - higher opacity white, more visible in dark environments
        light: "bg-[rgba(255,255,255,0.75)] border-[rgba(0,0,0,0.06)]",
        // Colored style with accent color
        accent: "bg-[rgba(10,233,233,0.15)] border-[rgba(10,233,233,0.2)]",
      },
      blur: {
        // Blur amount variants
        sm: "backdrop-blur-sm", // 4px blur
        md: "backdrop-blur-md", // 12px blur
        lg: "backdrop-blur-lg", // 16px blur
        xl: "backdrop-blur-xl", // 24px blur
      },
      rounded: {
        // Border radius variants
        none: "rounded-none",
        sm: "rounded-sm",
        md: "rounded-md",
        lg: "rounded-lg",
        xl: "rounded-xl",
        full: "rounded-full",
      },
      border: {
        // Border styles
        none: "border-none",
        subtle: "border-[var(--c-border-subtle)]",
        accent: "border-[var(--c-accent)] border-opacity-20",
        light: "border-white border-opacity-10",
        dark: "border-black border-opacity-10",
      },
      shadow: {
        // Shadow effects
        none: "",
        sm: "shadow-sm",
        md: "shadow-md",
        glow: "shadow-[var(--shadow-glow-sm)]",
      },
      interactive: {
        // Interactive states for hover effects
        none: "",
        hover: "hover:bg-opacity-80 hover:backdrop-blur-lg transition-all",
        active: "hover:bg-opacity-80 active:scale-[0.99] transition-all",
      },
    },
    defaultVariants: {
      variant: "default",
      blur: "md",
      rounded: "lg",
      border: "subtle",
      shadow: "none",
      interactive: "none",
    },
  }
);

// Glass component props
export interface GlassProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassVariants> {
  as?: React.ElementType;
}

// Glass component
const Glass = React.forwardRef<HTMLDivElement, GlassProps>(
  (
    {
      className,
      variant,
      blur,
      rounded,
      border,
      shadow,
      interactive,
      as: Component = "div",
      ...props
    },
    ref
  ) => {
    return (
      <Component
        ref={ref}
        className={cn(
          glassVariants({
            variant,
            blur,
            rounded,
            border,
            shadow,
            interactive,
            className,
          })
        )}
        {...props}
      />
    );
  }
);
Glass.displayName = "Glass";

// GlassCard component with padding and card-like styling
interface GlassCardProps extends GlassProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      children,
      title,
      description,
      footer,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <Glass
        ref={ref}
        className={cn("overflow-hidden", className)}
        shadow="md"
        {...props}
      >
        {/* Card Header - if title or description is provided */}
        {(title || description) && (
          <div className="p-4 border-b border-[var(--c-border-subtle)]">
            {title && (
              <div className="text-[var(--c-text-primary)] font-semibold mb-1">
                {title}
              </div>
            )}
            {description && (
              <div className="text-[var(--c-text-secondary)] text-sm">
                {description}
              </div>
            )}
          </div>
        )}
        
        {/* Card Content */}
        <div className="p-4">
          {children}
        </div>
        
        {/* Card Footer - if provided */}
        {footer && (
          <div className="p-4 border-t border-[var(--c-border-subtle)] bg-[rgba(0,0,0,0.03)]">
            {footer}
          </div>
        )}
      </Glass>
    );
  }
);
GlassCard.displayName = "GlassCard";

// GlassPanel component - full width/height container with glass effect
interface GlassPanelProps extends GlassProps {
  fullScreen?: boolean;
}

const GlassPanel = React.forwardRef<HTMLDivElement, GlassPanelProps>(
  (
    {
      children,
      fullScreen = false,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <Glass
        ref={ref}
        className={cn(
          "w-full",
          fullScreen && "fixed inset-0 z-50",
          className
        )}
        {...props}
      >
        {children}
      </Glass>
    );
  }
);
GlassPanel.displayName = "GlassPanel";

export { Glass, GlassCard, GlassPanel, glassVariants };