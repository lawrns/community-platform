'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button-upgraded';
import { Badge } from '../ui/badge';
import { ChevronRight, UserPlus, Sparkles } from 'lucide-react';
import { motion, useAnimation, useReducedMotion } from 'framer-motion';

interface HeroSectionProps {
  title: string;
  subtitle: string;
  tagline?: string;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
  stats?: Array<{ value: string; label: string; gradientType?: string }>;
}

// Animation components
const AuroraBackground = () => {
  const prefersReducedMotion = useReducedMotion();
  
  // Don't animate if reduced motion is preferred
  const shouldAnimate = !prefersReducedMotion;
  
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Dark gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-purple-900 to-gray-950 opacity-90 z-0"></div>
      
      {/* Animated SVG noise overlays */}
      {shouldAnimate && (
        <>
          <motion.div 
            className="absolute inset-0 opacity-40 mix-blend-soft-light"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
            animate={{ 
              translateZ: [0, 5, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              duration: 60, 
              ease: "linear", 
              repeat: Infinity,
              repeatType: "mirror"
            }}
          />
          <motion.div 
            className="absolute inset-0 opacity-30 mix-blend-overlay"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.4' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
            animate={{ 
              translateZ: [5, 0, 5],
              scale: [1.05, 1, 1.05]
            }}
            transition={{ 
              duration: 45, 
              ease: "linear", 
              repeat: Infinity,
              repeatType: "mirror"
            }}
          />
          <motion.div 
            className="absolute inset-0 opacity-20 mix-blend-color-dodge"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 800 800' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.2' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
            animate={{ 
              translateZ: [5, 10, 5],
              scale: [1.02, 1, 1.02]
            }}
            transition={{ 
              duration: 75, 
              ease: "linear", 
              repeat: Infinity,
              repeatType: "mirror"
            }}
          />
        </>
      )}

      {/* Cosmic dots effect */}
      {shouldAnimate && (
        <div className="absolute inset-0 z-1">
          {Array.from({ length: 50 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5 + 0.2,
              }}
              animate={{
                opacity: [0.2, 0.8, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 5,
              }}
            />
          ))}
        </div>
      )}
      
      {/* Vignette overlay for depth */}
      <div className="absolute inset-0 z-1" 
        style={{ 
          maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,.85), rgba(0,0,0,0) 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,.85), rgba(0,0,0,0) 80%)',
          backgroundColor: 'rgba(0,0,0,0.25)'
        }}>
      </div>
    </div>
  );
};

// Kinetic text animation for title
const KineticText = ({ children, delay = 0 }: { children: string, delay?: number }) => {
  const controls = useAnimation();
  const prefersReducedMotion = useReducedMotion();
  
  useEffect(() => {
    controls.start(prefersReducedMotion ? "visible" : "animate");
  }, [prefersReducedMotion, controls]);
  
  return (
    <motion.span
      initial={prefersReducedMotion ? "visible" : "hidden"}
      animate={controls}
      variants={{
        hidden: { clipPath: "inset(0 100% 0 0)" },
        visible: { clipPath: "inset(0 0 0 0)" },
        animate: { 
          clipPath: "inset(0 0 0 0)",
          transition: { 
            duration: 0.24, 
            ease: [0.22, 1, 0.36, 1], // easeOutExpo
            delay: delay
          }
        }
      }}
      className="inline-block"
    >
      {children}
    </motion.span>
  );
};

// Live counter animation
const LiveCounter = () => {
  const [count, setCount] = useState(127);
  const prefersReducedMotion = useReducedMotion();
  
  useEffect(() => {
    if (prefersReducedMotion) return;
    
    // Simulate live updates
    const interval = setInterval(() => {
      setCount(prev => prev + Math.floor(Math.random() * 3));
    }, 5000);
    
    return () => clearInterval(interval);
  }, [prefersReducedMotion]);
  
  return (
    <motion.div 
      className="flex items-center bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm text-gray-300"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.6, duration: 0.5 }}
    >
      <div className="relative mr-2">
        <div className="absolute w-2 h-2 rounded-full bg-green-500 animate-ping opacity-75"></div>
        <div className="relative w-2 h-2 rounded-full bg-green-500"></div>
      </div>
      <span>{count} questions answered in the last 24h</span>
    </motion.div>
  );
};

const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  subtitle,
  tagline = "The Future of AI Collaboration",
  primaryButtonText = "Join Community",
  secondaryButtonText = "Explore Content",
  onPrimaryClick,
  onSecondaryClick,
  stats,
}) => {
  const prefersReducedMotion = useReducedMotion();
  
  // Split title into words for kinetic animation
  const titleWords = title.split(' ');
  
  return (
    <motion.section 
      className="relative overflow-hidden min-h-[85vh] flex items-center pt-32"
      initial="initial"
      animate="animate"
      variants={{
        initial: {},
        animate: {}
      }}
    >
      {/* Background with grain effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-bg-0 to-bg-1 overflow-hidden">
        <div className="absolute inset-0 bg-grain animate-grain opacity-20"></div>
        <div className="absolute left-1/3 top-1/4 w-[500px] h-[500px] rounded-full bg-brand-500/10 filter blur-[120px]"></div>
        <div className="absolute right-1/3 bottom-1/4 w-[400px] h-[400px] rounded-full bg-brand-300/5 filter blur-[100px]"></div>
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="mx-auto max-w-6xl text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="mb-6 inline-block"
          >
            <Badge variant="secondary" className="backdrop-blur">
              <Sparkles size={14} className="mr-2 text-brand-500" />
              {tagline}
            </Badge>
          </motion.div>
          
          {/* Title with balanced text */}
          <motion.h1 
            className="text-balance font-extrabold leading-tight tracking-tight text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            {prefersReducedMotion ? (
              <>
                {title.replace('AI', '')}
                <span className="text-brand-500">AI</span>
              </>
            ) : (
              <>
                {titleWords.map((word, index) => (
                  <React.Fragment key={index}>
                    {word === 'AI' ? (
                      <span className="text-brand-500">
                        <KineticText delay={index * 0.1}>{word}</KineticText>
                      </span>
                    ) : (
                      <KineticText delay={index * 0.1}>{word}</KineticText>
                    )}
                    {index < titleWords.length - 1 && " "}
                  </React.Fragment>
                ))}
              </>
            )}
          </motion.h1>
          
          {/* Subtitle */}
          <motion.p 
            className="mx-auto mt-4 max-w-2xl text-neutral-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            {subtitle}
          </motion.p>
          
          {/* Action buttons */}
          <motion.div 
            className="mt-8 flex flex-wrap justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              whileHover={{ scale: prefersReducedMotion ? 1 : 1.05 }}
              whileTap={{ scale: prefersReducedMotion ? 1 : 0.96 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <Button 
                variant="primary" 
                size="lg" 
                onClick={onPrimaryClick}
                className="relative overflow-hidden group bg-brand-500 hover:bg-brand-600 text-white"
              >
                <span className="relative z-10">✨ {primaryButtonText}</span>
                {!prefersReducedMotion && (
                  <motion.span 
                    className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10"
                    animate={{ 
                      scale: [1, 1.5],
                      opacity: [0.1, 0],
                    }}
                    transition={{ 
                      duration: 1.5,
                      repeat: Infinity,
                      repeatType: "loop"
                    }}
                  />
                )}
              </Button>
            </motion.div>
            
            <Button 
              variant="ghost" 
              size="lg"
              onClick={onSecondaryClick}
              className="text-neutral-300 hover:text-white"
            >
              {secondaryButtonText} →
            </Button>
          </motion.div>
          
          {/* Stats */}
          {stats && stats.length > 0 && (
            <motion.div 
              className="mt-16 flex flex-wrap justify-center gap-8 md:gap-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            >
              {stats.map((stat, index) => (
                <motion.div 
                  key={index} 
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + (index * 0.08), duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                >
                  <p className="text-3xl font-bold text-brand-500">
                    {stat.value}
                  </p>
                  <p className="text-neutral-400 text-sm mt-1">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          )}
          
          {/* Live activity counter */}
          <motion.div 
            className="mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            <LiveCounter />
          </motion.div>
          
          {/* Animated Down Arrow */}
          {!prefersReducedMotion && (
            <motion.div 
              className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
              animate={{ y: [0, 8, 0] }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "loop",
                ease: "easeInOut"
              }}
            >
              <motion.svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "loop"
                }}
              >
                <path 
                  d="M12 5L12 19M12 19L19 12M12 19L5 12" 
                  stroke="white" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </motion.svg>
            </motion.div>
          )}
        </div>
      </div>
    </motion.section>
  );
};

export default HeroSection;