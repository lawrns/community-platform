import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border badge px-2.5 py-0.5 text-caption font-semibold transition-colors duration-normal ease-in-out focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-1",
  {
    variants: {
      variant: {
        default:
          "badge-primary",
        secondary:
          "badge-secondary",
        destructive:
          "badge-error",
        outline: "badge-outline",
        success: "badge-success",
        warning: "badge-warning",
        info: "badge-info",
        accent: "badge-accent",
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