"use client"

import { useState, forwardRef, HTMLAttributes, ReactNode } from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import { motion, AnimatePresence } from "framer-motion"
import { X, Plus } from "lucide-react"
import { FloatingActionButton } from "./floating-action-button"

export interface SpeedDialAction {
  icon: ReactNode
  label: string
  onClick: () => void
  variant?: "primary" | "secondary" | "accent" | "destructive" | "success" | "outline"
}

export interface SpeedDialProps 
  extends HTMLAttributes<HTMLDivElement> {
  actions: SpeedDialAction[]
  position?: "bottom-right" | "bottom-left" | "bottom-center" | "top-right" | "top-left"
  size?: "sm" | "md" | "lg"
  variant?: "primary" | "secondary" | "accent" | "destructive" | "success" | "outline"
  icon?: ReactNode
  closeIcon?: ReactNode
  direction?: "up" | "down" | "left" | "right"
  backdrop?: boolean
  labels?: boolean
  mainLabel?: string
}

/**
 * SpeedDial - A floating action button that expands to reveal multiple actions
 * 
 * Features:
 * - Multiple configurable actions
 * - Customizable position and appearance
 * - Animation effects
 * - Direction control (up, down, left, right)
 * - Optional backdrop overlay
 * - Support for action labels
 */
export function SpeedDial({ 
  actions, 
  position = "bottom-right", 
  size = "lg", 
  variant = "primary",
  icon,
  closeIcon,
  direction = "up",
  backdrop = false,
  labels = false,
  mainLabel,
  className,
  ...props 
}: SpeedDialProps) {
  const [open, setOpen] = useState(false)
  
  // Calculate the positioning and animation properties based on direction
  const getItemDirection = () => {
    switch(direction) {
      case "up":
        return { initial: { y: 0, opacity: 0 }, animate: { y: -16, opacity: 1 } }
      case "down":
        return { initial: { y: 0, opacity: 0 }, animate: { y: 16, opacity: 1 } }
      case "left":
        return { initial: { x: 0, opacity: 0 }, animate: { x: -16, opacity: 1 } }
      case "right":
        return { initial: { x: 0, opacity: 0 }, animate: { x: 16, opacity: 1 } }
    }
  }
  
  // Calculate the position of each action item
  const getActionPosition = (index: number) => {
    const multiplier = (index + 1) * 16
    const distance = size === "sm" ? multiplier * 3 : size === "md" ? multiplier * 3.5 : multiplier * 4
    
    switch(direction) {
      case "up":
        return `${-distance}px`
      case "down":
        return `${distance}px`
      case "left":
        return `${-distance}px`
      case "right":
        return `${distance}px`
    }
  }
  
  // Handle backdrop click to close the speed dial
  const handleBackdropClick = () => {
    if (open) {
      setOpen(false)
    }
  }
  
  return (
    <>
      {/* Optional backdrop overlay when speed dial is open */}
      {backdrop && open && (
        <motion.div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackdropClick}
        />
      )}
      
      <div className={cn("fixed z-50", className)} {...props}>
        {/* Main floating action button */}
        <FloatingActionButton
          position={position}
          size={size}
          variant={variant}
          icon={open ? (closeIcon || <X />) : (icon || <Plus />)}
          onClick={() => setOpen(!open)}
          animate={true}
          extended={!!mainLabel}
          label={open ? "" : mainLabel}
          aria-expanded={open}
          aria-label={open ? "Close actions menu" : "Open actions menu"}
        />
        
        {/* Action items that appear when the speed dial is open */}
        <AnimatePresence>
          {open && (
            <>
              {actions.map((action, index) => {
                const directionStyles = getItemDirection()
                const offsetPosition = getActionPosition(index)
                
                // Set position style based on direction
                const positionStyle = {
                  [direction === "up" || direction === "down" ? "bottom" : "right"]: direction === "up" || direction === "left" ? "0" : "auto",
                  [direction === "up" || direction === "down" ? "top" : "left"]: direction === "down" || direction === "right" ? "0" : "auto",
                  [direction === "up" || direction === "down" ? "transform" : "transform"]: "none",
                  [direction === "up" ? "marginBottom" : 
                   direction === "down" ? "marginTop" : 
                   direction === "left" ? "marginRight" : "marginLeft"]: offsetPosition,
                }
                
                return (
                  <motion.div
                    key={index}
                    className="absolute"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ 
                      delay: 0.03 * index,
                      type: "spring", 
                      stiffness: 400, 
                      damping: 17 
                    }}
                    style={positionStyle}
                  >
                    <div className="relative flex items-center">
                      {/* Show label if enabled and direction is horizontal */}
                      {labels && (direction === "left" || direction === "right") && (
                        <motion.div
                          initial={{ opacity: 0, x: direction === "left" ? 20 : -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0 }}
                          className={cn(
                            "absolute whitespace-nowrap px-2 py-1 text-sm rounded bg-surface-2 shadow-md",
                            direction === "left" ? "right-full mr-2" : "left-full ml-2"
                          )}
                        >
                          {action.label}
                        </motion.div>
                      )}
                      
                      {/* The action button */}
                      <FloatingActionButton
                        size={size === "lg" ? "md" : size === "md" ? "sm" : "sm"}
                        variant={action.variant || variant}
                        icon={action.icon}
                        onClick={() => {
                          action.onClick()
                          setOpen(false)
                        }}
                        animate={false}
                        aria-label={action.label}
                      />
                      
                      {/* Show label if enabled and direction is vertical */}
                      {labels && (direction === "up" || direction === "down") && (
                        <motion.div
                          initial={{ opacity: 0, y: direction === "up" ? 20 : -20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className={cn(
                            "absolute px-2 py-1 text-sm rounded bg-surface-2 shadow-md",
                            direction === "up" ? "bottom-0 mb-12" : "top-0 mt-12",
                            "left-1/2 transform -translate-x-1/2 whitespace-nowrap"
                          )}
                        >
                          {action.label}
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}