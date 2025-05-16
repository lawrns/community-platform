"use client"

import React, { useRef, useState, useEffect } from 'react'
import { motion, useAnimation, useMotionValue, useTransform, useScroll } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Magnetic } from '@/components/ui/cursor-effects'

interface AnimatedHero3DProps {
  className?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  primaryCta?: {
    text: string
    href: string
  }
  secondaryCta?: {
    text: string
    href: string
  }
}

/**
 * AnimatedHero3D - A vibrant, animated hero section with 3D parallax effects
 * 
 * Features:
 * - 3D perspective card that tracks mouse movement
 * - Animated gradient background with blur effects
 * - Floating elements with parallax scrolling
 * - Text reveal animations with sequenced timing
 * - Magnetic CTA buttons for interactive feel
 */
export const AnimatedHero3D: React.FC<AnimatedHero3DProps> = ({
  className,
  title = "Build, Share, and Discover AI Tools Together ✨",
  subtitle = "Join the world's most vibrant AI community platform where creators and enthusiasts collaborate to build the future.",
  primaryCta = {
    text: "Get Started",
    href: "/signup"
  },
  secondaryCta = {
    text: "Explore Tools",
    href: "/tools"
  }
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  
  // Transform mouse position to rotation values
  const rotateX = useTransform(mouseY, [0, 500], [10, -10])
  const rotateY = useTransform(mouseX, [0, 500], [-10, 10])
  
  // Scroll progress for parallax effect
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  })
  
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100])
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -200])
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -300])
  
  // Hover animation for the card
  const [isHovered, setIsHovered] = useState(false)
  
  // Handle mouse movement for 3D effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    mouseX.set(x)
    mouseY.set(y)
  }
  
  // Reset position when mouse leaves
  const handleMouseLeave = () => {
    mouseX.set(rect.width / 2)
    mouseY.set(rect.height / 2)
    setIsHovered(false)
  }
  
  // Set initial position
  const rect = containerRef.current?.getBoundingClientRect() || { width: 0, height: 0 }
  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      mouseX.set(rect.width / 2)
      mouseY.set(rect.height / 2)
    }
  }, [mouseX, mouseY])
  
  // Staggered content animations
  const titleControls = useAnimation()
  const subtitleControls = useAnimation()
  const ctaControls = useAnimation()
  
  useEffect(() => {
    const sequence = async () => {
      await titleControls.start({ opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } })
      await subtitleControls.start({ opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } })
      await ctaControls.start({ opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } })
    }
    
    sequence()
  }, [titleControls, subtitleControls, ctaControls])
  
  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative overflow-hidden min-h-[90vh] md:min-h-[80vh] flex items-center justify-center",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => setIsHovered(true)}
    >
      {/* Animated background with gradient */}
      <div className="absolute inset-0 bg-gradient-primary animated-gradient overflow-hidden">
        {/* Background blur elements */}
        <motion.div
          className="absolute top-[20%] left-[20%] w-[40vw] h-[40vw] rounded-full bg-purple-600 opacity-20 blur-[120px]"
          animate={{
            x: isHovered ? -10 : 10,
            y: isHovered ? -10 : 10,
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
          style={{ y: y1 }}
        />
        
        <motion.div
          className="absolute bottom-[30%] right-[10%] w-[25vw] h-[25vw] rounded-full bg-blue-500 opacity-20 blur-[100px]"
          animate={{
            x: isHovered ? 10 : -10,
            y: isHovered ? 10 : -10,
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
            delay: 0.3
          }}
          style={{ y: y2 }}
        />
        
        <motion.div
          className="absolute top-[50%] right-[30%] w-[30vw] h-[30vw] rounded-full bg-pink-500 opacity-20 blur-[150px]"
          animate={{
            x: isHovered ? -15 : 15,
            y: isHovered ? 15 : -15,
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
            delay: 0.5
          }}
          style={{ y: y3 }}
        />
      </div>
      
      {/* 3D Card Container */}
      <div className="relative z-10 container mx-auto px-6 py-16 flex flex-col items-center">
        <motion.div
          className="relative bg-surface-1/10 backdrop-blur-sm p-10 md:p-16 rounded-3xl border border-white/10 shadow-2xl max-w-4xl"
          style={{
            rotateX: rotateX,
            rotateY: rotateY,
            transformPerspective: 1000,
          }}
          whileHover={{
            scale: 1.02,
            transition: { duration: 0.3 }
          }}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Decorative 3D elements */}
          <div className="absolute -top-8 -left-8 w-16 h-16 md:w-24 md:h-24 bg-purple-500/30 backdrop-blur-md rounded-2xl transform rotate-12 animate-float" />
          <div className="absolute -bottom-6 -right-6 w-12 h-12 md:w-20 md:h-20 bg-blue-500/30 backdrop-blur-md rounded-full transform rotate-45 animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 -right-4 w-8 h-8 md:w-12 md:h-12 bg-pink-500/30 backdrop-blur-md rounded-lg transform rotate-12 animate-float" style={{ animationDelay: '0.5s' }} />
          
          {/* Content */}
          <div className="relative text-center space-y-8">
            <motion.h1 
              className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-gradient mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={titleControls}
            >
              {typeof title === 'string' ? (
                <span className="inline bg-gradient-primary-text text-transparent bg-clip-text">
                  {title}
                </span>
              ) : title}
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-content-secondary max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={subtitleControls}
            >
              {subtitle}
            </motion.p>
            
            <motion.div 
              className="flex flex-col md:flex-row gap-4 justify-center pt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={ctaControls}
            >
              <Magnetic strength={15}>
                <Button 
                  size="lg" 
                  className="bg-gradient-primary hover:shadow-glow-primary text-white text-lg px-10 rounded-xl py-6"
                  asChild
                >
                  <a href={primaryCta.href}>
                    {primaryCta.text} <span className="ml-1">→</span>
                  </a>
                </Button>
              </Magnetic>
              
              <Magnetic strength={10}>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white/20 hover:border-white/40 backdrop-blur-sm text-white text-lg px-8 rounded-xl py-6 hover:bg-white/10"
                  asChild
                >
                  <a href={secondaryCta.href}>
                    {secondaryCta.text}
                  </a>
                </Button>
              </Magnetic>
            </motion.div>
          </div>
        </motion.div>
        
        {/* Floating emoji decorations */}
        <div className="absolute top-[10%] left-[15%] text-4xl animate-float">✨</div>
        <div className="absolute bottom-[20%] right-[15%] text-4xl animate-float" style={{ animationDelay: '0.8s' }}>🚀</div>
        <div className="absolute top-[20%] right-[20%] text-4xl animate-float" style={{ animationDelay: '1.5s' }}>🤖</div>
        <div className="absolute bottom-[15%] left-[20%] text-4xl animate-float" style={{ animationDelay: '0.3s' }}>💡</div>
      </div>
    </div>
  )
}

export default AnimatedHero3D