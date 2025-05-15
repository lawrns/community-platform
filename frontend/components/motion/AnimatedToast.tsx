"use client";

import React, { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Info, AlertTriangle, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "default" | "success" | "error" | "warning" | "info";

type AnimatedToastProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant?: ToastVariant;
  title?: string;
  description?: string;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
  duration?: number;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center" | "bottom-center";
};

/**
 * An animated toast notification component
 * 
 * @example
 * <AnimatedToast
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   variant="success"
 *   title="Success"
 *   description="Your action was completed successfully"
 * />
 */
export default function AnimatedToast({
  open,
  onOpenChange,
  variant = "default",
  title,
  description,
  children,
  action,
  className,
  duration = 5000,
  position = "bottom-right",
}: AnimatedToastProps) {
  const [isVisible, setIsVisible] = React.useState(open);
  
  React.useEffect(() => {
    setIsVisible(open);
    
    if (open && duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onOpenChange(false);
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [open, duration, onOpenChange]);
  
  const variantStyles = {
    default: "bg-surface-1 text-content-primary border-brand-secondary",
    success: "bg-semantic-success/10 text-semantic-success border-semantic-success",
    error: "bg-semantic-error/10 text-semantic-error border-semantic-error",
    warning: "bg-semantic-warning/10 text-semantic-warning border-semantic-warning",
    info: "bg-semantic-info/10 text-semantic-info border-semantic-info",
  };
  
  const positionStyles = {
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "top-center": "top-4 left-1/2 -translate-x-1/2",
    "bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
  };
  
  const getIcon = () => {
    switch (variant) {
      case "success": return <Check className="h-4 w-4" />;
      case "error": return <AlertCircle className="h-4 w-4" />;
      case "warning": return <AlertTriangle className="h-4 w-4" />;
      case "info": return <Info className="h-4 w-4" />;
      default: return null;
    }
  };
  
  // Animation variants based on position
  const getAnimationVariants = () => {
    if (position.includes("top")) {
      return {
        hidden: { opacity: 0, y: -20 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 }
      };
    } else {
      return {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 20 }
      };
    }
  };
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={cn(
            "fixed z-50 flex items-center justify-between p-4 rounded-lg shadow-lg border max-w-xs w-full",
            variantStyles[variant],
            positionStyles[position],
            className
          )}
          variants={getAnimationVariants()}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ 
            type: "spring", 
            stiffness: 400, 
            damping: 25 
          }}
        >
          <div className="flex items-start gap-3">
            {variant !== "default" && (
              <div className="mt-0.5">
                {getIcon()}
              </div>
            )}
            
            <div className="space-y-1">
              {title && (
                <h4 className="text-sm font-medium">{title}</h4>
              )}
              {description && (
                <p className="text-xs opacity-90">{description}</p>
              )}
              {children}
            </div>
          </div>
          
          <div className="flex gap-2 items-center ml-4">
            {action}
            <motion.button
              className="rounded-full p-1 opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10"
              onClick={() => {
                setIsVisible(false);
                onOpenChange(false);
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Close</span>
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}