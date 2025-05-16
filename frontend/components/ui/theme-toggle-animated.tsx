"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface ThemeToggleAnimatedProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

/**
 * Animated Theme Toggle - A stylish animated switch between light and dark mode
 * 
 * Features:
 * - Smooth animations when toggling between modes
 * - Custom animation for sun/moon icons
 * - Stars appear in dark mode with twinkling effect
 * - Visual depth with shadows and gradients
 */
export function ThemeToggleAnimated({ className, size = "md" }: ThemeToggleAnimatedProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  
  // Handle hydration
  useEffect(() => {
    setMounted(true)
  }, [])
  
  if (!mounted) {
    return null
  }
  
  const isDark = theme === "dark"
  
  // Calculate size values based on size prop
  const sizeValues = {
    sm: {
      button: "w-12 h-6",
      toggleSize: "w-5 h-5",
      iconSize: "w-3 h-3",
      starSize: "w-0.5 h-0.5"
    },
    md: {
      button: "w-16 h-8",
      toggleSize: "w-6 h-6",
      iconSize: "w-4 h-4",
      starSize: "w-1 h-1"
    },
    lg: {
      button: "w-20 h-10",
      toggleSize: "w-8 h-8",
      iconSize: "w-5 h-5",
      starSize: "w-1.5 h-1.5"
    }
  }
  
  // Random positions for stars
  const starPositions = [
    { top: "20%", right: "20%" },
    { top: "30%", right: "35%" },
    { top: "50%", right: "15%" },
    { top: "70%", right: "25%" },
    { top: "15%", right: "60%" },
    { top: "45%", right: "70%" },
    { top: "75%", right: "65%" },
    { top: "60%", right: "85%" },
  ]
  
  return (
    <motion.button
      className={cn(
        "relative rounded-full p-1 flex items-center",
        isDark 
          ? "bg-gradient-to-br from-slate-900 to-indigo-950 border border-indigo-500/20" 
          : "bg-gradient-to-br from-sky-100 to-blue-50 border border-sky-200",
        sizeValues[size].button,
        className
      )}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      whileTap={{ scale: 0.9 }}
      transition={{ duration: 0.2 }}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {/* Background elements */}
      <div className="absolute inset-0 rounded-full overflow-hidden">
        {isDark && (
          <>
            {/* Twinkling stars */}
            {starPositions.map((pos, i) => (
              <motion.div
                key={i}
                className={cn(
                  "absolute rounded-full bg-white",
                  sizeValues[size].starSize
                )}
                style={pos}
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: [0.2, 1, 0.2], 
                  scale: [0.8, 1.2, 0.8] 
                }}
                transition={{ 
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 3 
                }}
              />
            ))}
          </>
        )}
      </div>
      
      {/* Toggle circle */}
      <motion.div
        className={cn(
          "rounded-full flex items-center justify-center z-10",
          isDark
            ? "bg-gradient-to-br from-indigo-500 to-purple-700 shadow-[inset_0_0_10px_rgba(255,255,255,0.2)]"
            : "bg-gradient-to-br from-amber-300 to-yellow-500 shadow-[0_0_10px_rgba(251,191,36,0.5)]",
          sizeValues[size].toggleSize
        )}
        layout
        animate={{ 
          x: isDark ? "100%" : "0%",
          rotate: isDark ? 180 : 0
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 30
        }}
      >
        {isDark ? (
          <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn("text-indigo-50", sizeValues[size].iconSize)}
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              delay: 0.2,
              type: "spring",
              stiffness: 500,
              damping: 15
            }}
          >
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
          </motion.svg>
        ) : (
          <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn("text-yellow-50", sizeValues[size].iconSize)}
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              delay: 0.2,
              type: "spring",
              stiffness: 500,
              damping: 15
            }}
          >
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
          </motion.svg>
        )}
      </motion.div>
    </motion.button>
  )
}

/**
 * ThemeToggleWithLabel - A theme toggle with animated text label
 */
export function ThemeToggleWithLabel({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  if (!mounted) {
    return null
  }
  
  const isDark = theme === "dark"
  
  // Prepare animations for text
  const textVariants = {
    light: { y: 0, opacity: 1 },
    dark: { y: 30, opacity: 0 }
  }
  
  const darkTextVariants = {
    light: { y: -30, opacity: 0 },
    dark: { y: 0, opacity: 1 }
  }
  
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <ThemeToggleAnimated />
      
      <div className="relative h-6 overflow-hidden">
        <motion.span
          className="absolute text-sm font-medium"
          initial="light"
          animate={isDark ? "dark" : "light"}
          variants={textVariants}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          Light Mode
        </motion.span>
        
        <motion.span
          className="absolute text-sm font-medium text-indigo-300"
          initial="light"
          animate={isDark ? "light" : "dark"}
          variants={darkTextVariants}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          Dark Mode
        </motion.span>
      </div>
    </div>
  )
}

export default ThemeToggleAnimated