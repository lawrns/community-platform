"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"
import { IconButton } from "./lumen-button"
import { MicroMotion } from "./lumen-motion"

export function LumenThemeToggle() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Animation variants for the transition
  const sunVariants = {
    initial: { scale: 0.6, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.6, opacity: 0 },
    transition: { type: "spring", stiffness: 500, damping: 30, duration: 0.12 }
  }

  const moonVariants = {
    initial: { scale: 0.6, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.6, opacity: 0 },
    transition: { type: "spring", stiffness: 500, damping: 30, duration: 0.12 }
  }

  // Handle component mounting
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-full bg-[var(--c-surface-2)] flex items-center justify-center">
        <div className="w-5 h-5"></div>
      </div>
    )
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" || theme === "system" ? "light" : "dark")
  }

  return (
    <IconButton
      icon={
        <div className="relative w-5 h-5 flex items-center justify-center overflow-hidden">
          {/* Sun Icon */}
          <MicroMotion animate={theme !== "dark"}>
            <motion.svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="absolute inset-0"
              variants={sunVariants}
            >
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </motion.svg>
          </MicroMotion>

          {/* Moon Icon */}
          <MicroMotion animate={theme === "dark"}>
            <motion.svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="absolute inset-0"
              variants={moonVariants}
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </motion.svg>
          </MicroMotion>
        </div>
      }
      variant="ghost"
      size="icon"
      glow="medium"
      className="text-[var(--c-text-primary)] hover:text-[var(--c-accent)] transition-colors"
      aria-label="Toggle theme"
      onClick={toggleTheme}
    />
  )
}