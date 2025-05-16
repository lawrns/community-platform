"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

type CursorEffect = 'default' | 'glow' | 'trail' | 'magnetic' | 'spotlight' | 'emoji' | 'none'

type CursorEffectsProps = {
  effect?: CursorEffect
  color?: string
  size?: number
  trailCount?: number
  trailDelay?: number
  spotlightSize?: number
  emoji?: string
  className?: string
  children?: React.ReactNode
}

/*
 * CursorEffects - Adds playful interactive cursor effects to the website
 * 
 * Available effects:
 * - default: A simple circle follower with smooth motion
 * - glow: A glowing orb that follows the cursor
 * - trail: Multiple circles that follow in a trail behind the cursor
 * - magnetic: Elements with this effect attract the cursor when nearby
 * - spotlight: Creates a spotlight effect that follows the cursor
 * - emoji: Displays a custom emoji that follows the cursor
 */
export const CursorEffects: React.FC<CursorEffectsProps> = ({
  effect = 'default',
  color = 'rgba(138, 43, 226, 0.8)', // Default to a purple color
  size = 20,
  trailCount = 5,
  trailDelay = 80,
  spotlightSize = 300,
  emoji = '✨',
  className,
  children
}) => {
  const [position, setPosition] = useState({ x: -100, y: -100 })
  const [visible, setVisible] = useState(false)
  const [trailPositions, setTrailPositions] = useState<{ x: number, y: number }[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const isTouch = useRef(false)

  // Update cursor position when mouse moves
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isTouch.current) return
    
    const { clientX, clientY } = e
    setPosition({ x: clientX, y: clientY })
    setVisible(true)
    
    // For trail effect, store previous positions
    if (effect === 'trail') {
      setTrailPositions(prev => {
        const newPositions = [...prev, { x: clientX, y: clientY }]
        return newPositions.slice(-trailCount)
      })
    }
  }, [effect, trailCount])
  
  // Hide cursor when mouse leaves the window
  const handleMouseLeave = useCallback(() => {
    setVisible(false)
  }, [])
  
  // Handle touch detection
  const handleTouchStart = useCallback(() => {
    isTouch.current = true
    setVisible(false)
  }, [])

  useEffect(() => {
    if (effect === 'none') return
    
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseleave', handleMouseLeave)
    window.addEventListener('touchstart', handleTouchStart)
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
      window.removeEventListener('touchstart', handleTouchStart)
    }
  }, [effect, handleMouseMove, handleMouseLeave, handleTouchStart])

  // Return early if on touch device or effect is none
  if (isTouch.current || effect === 'none') {
    return <>{children}</>
  }

  return (
    <div ref={containerRef} className="cursor-effects-container">
      {children}
      
      {/* Render appropriate cursor effect */}
      <AnimatePresence>
        {visible && (
          <>
            {/* Default cursor */}
            {effect === 'default' && (
              <motion.div
                className={cn("fixed rounded-full pointer-events-none z-50", className)}
                style={{
                  left: position.x - size / 2,
                  top: position.y - size / 2,
                  width: size,
                  height: size,
                  backgroundColor: color,
                  mixBlendMode: 'difference',
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              />
            )}
            
            {/* Glow cursor */}
            {effect === 'glow' && (
              <motion.div
                className={cn("fixed rounded-full pointer-events-none z-50 blur-sm", className)}
                style={{
                  left: position.x - size,
                  top: position.y - size,
                  width: size * 2,
                  height: size * 2,
                  background: `radial-gradient(circle, ${color} 0%, rgba(255, 255, 255, 0) 70%)`,
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.8 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              />
            )}
            
            {/* Trail cursor */}
            {effect === 'trail' && (
              <>
                {trailPositions.map((pos, i) => (
                  <motion.div
                    key={i}
                    className={cn("absolute rounded-full pointer-events-none z-50", className)}
                    style={{
                      left: pos.x - (size - i * (size / trailCount)) / 2,
                      top: pos.y - (size - i * (size / trailCount)) / 2,
                      width: size - i * (size / trailCount / 2),
                      height: size - i * (size / trailCount / 2),
                      backgroundColor: color,
                      opacity: 1 - (i / trailCount),
                    }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2, delay: i * 0.02 }}
                  />
                ))}
              </>
            )}
            
            {/* Spotlight cursor */}
            {effect === 'spotlight' && (
              <motion.div
                className={cn("fixed pointer-events-none z-50", className)}
                style={{
                  left: position.x - spotlightSize / 2,
                  top: position.y - spotlightSize / 2,
                  width: spotlightSize,
                  height: spotlightSize,
                  background: `radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 70%)`,
                  mixBlendMode: 'overlay',
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            )}
            
            {/* Emoji cursor */}
            {effect === 'emoji' && (
              <motion.div
                className={cn("fixed pointer-events-none z-50 flex items-center justify-center", className)}
                style={{
                  left: position.x - size,
                  top: position.y - size,
                  width: size * 2,
                  height: size * 2,
                  fontSize: size,
                }}
                initial={{ scale: 0, opacity: 0, rotate: -30 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0, opacity: 0, rotate: 30 }}
                transition={{ duration: 0.2, ease: 'backOut' }}
              >
                {emoji}
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

type MagneticProps = {
  children: React.ReactNode
  strength?: number
  radius?: number
  className?: string
}

/**
 * Magnetic - Creates elements that attract the cursor when nearby
 */
export const Magnetic: React.FC<MagneticProps> = ({
  children,
  strength = 30,
  radius = 100,
  className,
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const isTouch = useRef(false)

  const handlePointerEnter = useCallback(() => {
    if (isTouch.current) return
  }, [])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (isTouch.current || !ref.current) return
    
    const element = ref.current
    const rect = element.getBoundingClientRect()
    
    // Calculate the center of the element
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    // Calculate distance from mouse to center
    const distanceX = e.clientX - centerX
    const distanceY = e.clientY - centerY
    
    // Calculate total distance
    const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2)
    
    // If cursor is within the radius, apply the magnetic effect
    if (distance < radius) {
      // Calculate the pull strength based on distance
      const pull = (radius - distance) / radius * strength
      
      // Apply the attraction effect (closer = stronger)
      setPosition({
        x: (distanceX / distance) * pull,
        y: (distanceY / distance) * pull,
      })
    } else {
      // Reset position when cursor is outside radius
      setPosition({ x: 0, y: 0 })
    }
  }, [radius, strength])

  const handlePointerLeave = useCallback(() => {
    if (isTouch.current) return
    setPosition({ x: 0, y: 0 })
  }, [])

  const handleTouchStart = useCallback(() => {
    isTouch.current = true
  }, [])

  useEffect(() => {
    window.addEventListener('touchstart', handleTouchStart)
    return () => {
      window.removeEventListener('touchstart', handleTouchStart)
    }
  }, [handleTouchStart])

  return (
    <motion.div
      ref={ref}
      className={cn(className)}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      animate={{
        x: position.x,
        y: position.y,
      }}
      transition={{
        type: "spring",
        stiffness: 150,
        damping: 15,
        mass: 0.1,
      }}
    >
      {children}
    </motion.div>
  )
}

/**
 * CursorHighlight - Illuminates elements as the cursor passes over a container
 */
export const CursorHighlight: React.FC<{
  children: React.ReactNode
  className?: string
  radius?: number
  color?: string
  strength?: number
}> = ({
  children,
  className,
  radius = 200,
  color = 'rgba(255, 255, 255, 0.05)',
  strength = 0.15,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  const isTouch = useRef(false)
  
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isTouch.current || !containerRef.current) return
    
    const rect = containerRef.current.getBoundingClientRect()
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
    setIsHovering(true)
  }, [])
  
  const handleMouseLeave = useCallback(() => {
    setIsHovering(false)
  }, [])
  
  const handleTouchStart = useCallback(() => {
    isTouch.current = true
  }, [])
  
  useEffect(() => {
    window.addEventListener('touchstart', handleTouchStart)
    return () => {
      window.removeEventListener('touchstart', handleTouchStart)
    }
  }, [handleTouchStart])
  
  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden", className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      
      {/* Spotlight effect layer */}
      {isHovering && !isTouch.current && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: strength }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            background: `radial-gradient(circle ${radius}px at ${position.x}px ${position.y}px, ${color}, transparent)`,
          }}
        />
      )}
    </div>
  )
}

export default CursorEffects