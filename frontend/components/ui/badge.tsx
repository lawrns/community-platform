import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-caption font-semibold transition-colors duration-normal ease-in-out focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-brand-primary text-content-onPrimary hover:bg-brand-primary/80",
        secondary:
          "border-transparent bg-brand-secondary text-content-primary hover:bg-brand-secondary/80",
        destructive:
          "border-transparent bg-semantic-error text-content-onDestructive hover:bg-semantic-error/80",
        outline: "text-content-primary",
        success: "border-transparent bg-semantic-success text-content-inverse hover:bg-semantic-success/80",
        warning: "border-transparent bg-semantic-warning text-content-inverse hover:bg-semantic-warning/80",
        info: "border-transparent bg-semantic-info text-content-inverse hover:bg-semantic-info/80",
        accent: "border-transparent bg-surface-accent text-content-primary hover:bg-surface-accent/80",
      },
      size: {
        default: "px-2.5 py-0.5 text-caption",
        sm: "px-2 py-0.5 text-caption",
        lg: "px-3 py-1 text-body-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  )
}

export { Badge, badgeVariants }