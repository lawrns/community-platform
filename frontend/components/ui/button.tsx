import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-body font-medium ring-offset-background transition-colors duration-normal ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-brand-primary text-content-onPrimary hover:bg-brand-primary/90",
        destructive:
          "bg-semantic-error text-content-onDestructive hover:bg-semantic-error/90",
        outline:
          "border border-input bg-surface-1 hover:bg-surface-2 hover:text-content-primary",
        secondary:
          "bg-brand-secondary text-content-primary hover:bg-brand-secondary/80",
        accent:
          "bg-surface-accent text-content-primary hover:bg-surface-accent/80",
        ghost: "hover:bg-surface-2 hover:text-content-primary",
        link: "text-brand-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-sm px-3 text-body-sm",
        md: "h-10 rounded-md px-4 py-2",
        lg: "h-11 rounded-md px-8 text-body-lg",
        xl: "h-12 rounded-lg px-10 text-body-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };