"use client";

import React, { HTMLAttributes, forwardRef } from "react";

/**
 * A component that visually hides content but keeps it accessible to screen readers
 * This technique maintains the content in the accessibility tree but removes it visually
 * It's better than display: none, which removes content from the accessibility tree
 * 
 * @example
 * <VisuallyHidden>
 *   This text is only visible to screen readers
 * </VisuallyHidden>
 * 
 * <Button>
 *   <IconAdd />
 *   <VisuallyHidden>Add item</VisuallyHidden>
 * </Button>
 */
export const VisuallyHidden = forwardRef<
  HTMLSpanElement,
  HTMLAttributes<HTMLSpanElement>
>(({ children, ...props }, ref) => {
  return (
    <span
      ref={ref}
      className="sr-only" // Tailwind utility class
      {...props}
    >
      {children}
    </span>
  );
});

VisuallyHidden.displayName = "VisuallyHidden";

export default VisuallyHidden;