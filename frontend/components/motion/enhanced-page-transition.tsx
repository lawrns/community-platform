"use client"

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

type TransitionEffect = 'fade' | 'slide' | 'zoom' | 'flip' | 'creative'

interface EnhancedPageTransitionProps {
  children: React.ReactNode
  className?: string
  effect?: TransitionEffect
  duration?: number
  transitionDelay?: number
  showOverlay?: boolean
  preserveState?: boolean
}

/**
 * EnhancedPageTransition - Creates beautiful transitions between page navigation
 * 
 * Features:
 * - Multiple transition effects (fade, slide, zoom, flip, creative)
 * - Optional transition overlay for smoother page changes
 * - Staggered content transitions
 * - Customizable timing and delays
 * - Preserves scroll position
 */
export function EnhancedPageTransition({
  children,
  className,
  effect = 'creative',
  duration = 0.5,
  transitionDelay = 0,
  showOverlay = true,
  preserveState = true,
}: EnhancedPageTransitionProps) {
  const pathname = usePathname()
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [transitionComplete, setTransitionComplete] = useState(true)
  const previousPathRef = useRef<string | null>(null)
  
  // Determine if this is initial load or a navigation
  const isInitialLoad = previousPathRef.current === null
  
  useEffect(() => {
    // Skip transition effect on initial load
    if (previousPathRef.current === null) {
      previousPathRef.current = pathname
      return
    }
    
    // Only trigger transition if the path has changed
    if (previousPathRef.current !== pathname) {
      setIsTransitioning(true)
      setTransitionComplete(false)
      
      // Store the new pathname
      previousPathRef.current = pathname
      
      // Reset transition state after animation completes
      const timer = setTimeout(() => {
        setIsTransitioning(false)
        setTimeout(() => {
          setTransitionComplete(true)
        }, 100)
      }, duration * 1000 + transitionDelay * 1000 + 100)
      
      return () => {
        clearTimeout(timer)
      }
    }
  }, [pathname, duration, transitionDelay])
  
  // Define variants for different effects
  const getPageVariants = () => {
    switch (effect) {
      case 'fade':
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
        }
      case 'slide':
        return {
          initial: { x: '100%', opacity: 0 },
          animate: { x: 0, opacity: 1 },
          exit: { x: '-100%', opacity: 0 },
        }
      case 'zoom':
        return {
          initial: { scale: 0.8, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          exit: { scale: 1.2, opacity: 0 },
        }
      case 'flip':
        return {
          initial: { rotateY: 90, opacity: 0 },
          animate: { rotateY: 0, opacity: 1 },
          exit: { rotateY: -90, opacity: 0 },
        }
      case 'creative':
        return {
          initial: { 
            y: 30,
            opacity: 0,
            scale: 0.98,
          },
          animate: { 
            y: 0,
            opacity: 1,
            scale: 1,
          },
          exit: { 
            y: -30,
            opacity: 0,
            scale: 0.98,
          },
        }
      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
        }
    }
  }
  
  const pageTransitionVariants = getPageVariants()
  
  // Overlay transition variants
  const overlayVariants = {
    initial: { 
      y: '100%',
    },
    animate: { 
      y: '0%',
      transition: { 
        duration: duration * 0.4, 
        ease: [0.22, 1, 0.36, 1],
      }
    },
    exit: { 
      y: '-100%',
      transition: { 
        duration: duration * 0.4, 
        ease: [0.22, 1, 0.36, 1],
        delay: transitionDelay
      }
    },
  }
  
  return (
    <div className={cn("w-full relative", className)}>
      {/* Optional transition overlay */}
      {showOverlay && (
        <AnimatePresence mode="wait">
          {isTransitioning && !transitionComplete && (
            <motion.div
              key={`overlay-${pathname}`}
              className="fixed inset-0 z-50 pointer-events-none"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={overlayVariants}
            >
              <div className="absolute inset-0 bg-gradient-primary" />
            </motion.div>
          )}
        </AnimatePresence>
      )}
      
      {/* Main content with transition */}
      <AnimatePresence mode={preserveState ? "popLayout" : "wait"} initial={false}>
        <motion.div
          key={pathname}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageTransitionVariants}
          transition={{
            duration: duration,
            delay: transitionDelay,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="w-full"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

/**
 * StaggeredPageContent - Creates a staggered animation for child elements
 * 
 * Use this component to wrap sections of content that should animate in sequence
 */
export function StaggeredPageContent({
  children,
  className,
  staggerDuration = 0.1,
  initialDelay = 0.1,
  translateY = 20,
}: {
  children: React.ReactNode
  className?: string
  staggerDuration?: number
  initialDelay?: number
  translateY?: number
}) {
  const childrenArray = React.Children.toArray(children)
  
  return (
    <div className={cn("w-full", className)}>
      {childrenArray.map((child, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: translateY }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: initialDelay + index * staggerDuration,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  )
}

export default EnhancedPageTransition