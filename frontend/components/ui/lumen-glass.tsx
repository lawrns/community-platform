"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

// Utility function to merge class names
const cn = (...classes: (string | undefined)[]) => {
  return classes.filter(Boolean).join(" ");
};

// Glass component variants
const glassVariants = cva(
  "relative backdrop-blur-md border border-solid transition-all duration-normal",
  {
    variants: {
      variant: {
        // Default style with theme support
        default: "bg-white/70 dark:bg-bg-1/70 border-neutral-200/50 dark:border-neutral-800/50 text-neutral-900 dark:text-neutral-100",
        // Dark style - higher opacity, more visible in light environments
        dark: "bg-bg-1/75 border-white/5 text-white",
        // Light style - higher opacity white, more visible in dark environments
        light: "bg-white/90 border-black/5 text-neutral-800",
        // Colored style with accent color
        accent: "bg-white/80 dark:bg-bg-1/60 border-brand-500/20 text-neutral-900 dark:text-white",
        // Brand colored glass
        brand: "bg-brand-500/10 border-brand-500/20 text-brand-700 dark:text-brand-300",
        // Neutral glass
        neutral: "bg-neutral-500/10 border-neutral-500/20 text-neutral-700 dark:text-neutral-300",
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
        l: "rounded-l",
        xl: "rounded-xl",
        full: "rounded-full",
      },
      border: {
        // Border styles
        none: "border-none",
        subtle: "border-neutral-200/50 dark:border-neutral-800/50",
        accent: "border-brand-500/20",
        light: "border-white/10",
        dark: "border-black/10",
      },
      shadow: {
        // Shadow effects
        none: "",
        sm: "shadow-sm",
        md: "shadow-md",
        lg: "shadow-lg",
        xl: "shadow-xl",
        glass: "shadow-glass",
      },
      interactive: {
        // Interactive states for hover effects
        none: "",
        hover: "hover:bg-opacity-90 hover:backdrop-blur-lg transition-all duration-fast",
        active: "hover:bg-opacity-90 active:scale-[0.98] transition-all duration-ultra-fast",
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
        rounded="l"
        {...props}
      >
        {/* Card Header - if title or description is provided */}
        {(title || description) && (
          <div className="p-6 border-b border-neutral-200/30 dark:border-neutral-800/30">
            {title && (
              <div className="text-neutral-900 dark:text-white font-semibold text-lg mb-1">
                {title}
              </div>
            )}
            {description && (
              <div className="text-neutral-600 dark:text-neutral-300 text-sm">
                {description}
              </div>
            )}
          </div>
        )}
        
        {/* Card Content */}
        <div className="p-6">
          {children}
        </div>
        
        {/* Card Footer - if provided */}
        {footer && (
          <div className="p-6 border-t border-neutral-200/30 dark:border-neutral-800/30 bg-neutral-100/30 dark:bg-neutral-900/30">
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
        variant="default"
        blur="lg"
        shadow="glass"
        {...props}
      >
        {children}
      </Glass>
    );
  }
);
GlassPanel.displayName = "GlassPanel";

export { Glass, GlassCard, GlassPanel, glassVariants };