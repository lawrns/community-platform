"use client"

import { ReactNode } from "react"
import { motion } from "framer-motion"

interface MotionWrapperProps {
  children: ReactNode
  delay?: number
  direction?: "up" | "down" | "left" | "right"
  className?: string
}

export default function MotionWrapper({ 
  children, 
  delay = 0, 
  direction = "up",
  className = ""
}: MotionWrapperProps) {
  const getDirectionOffset = () => {
    switch (direction) {
      case "up": return { y: 20 }
      case "down": return { y: -20 }
      case "left": return { x: 20 }
      case "right": return { x: -20 }
      default: return { y: 20 }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, ...getDirectionOffset() }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: delay,
        ease: [0.22, 1, 0.36, 1]
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}