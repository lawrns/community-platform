import React, { useState, useEffect } from 'react';
import Button from './ui/Button';
import { ChevronRight, UserPlus, Sparkles } from 'lucide-react';
import { motion, useAnimation, useReducedMotion } from 'framer-motion';

const AuroraBackground = () => {
  // Support for users who prefer reduced motion
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Main gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-purple-900 to-gray-950 opacity-90 z-0"></div>
      
      {/* Three-layer SVG noise gradients that drift slowly */}
      {!prefersReducedMotion && (
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
      
      {/* Glow effect */}
      <div className="absolute inset-0 z-1 bg-gradient-radial from-blue-500/10 via-transparent to-transparent"></div>
      
      {/* Cosmic dots effect */}
      {!prefersReducedMotion && (
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
            duration: 0.8, 
            ease: [0.175, 0.885, 0.32, 1.1], // Overshooting spring
            delay: delay
          }
        }
      }}
      className="block"
    >
      {children}
    </motion.span>
  );
};

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
      <span className="inline-block h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
      <span>{count} questions answered in the last 24h</span>
    </motion.div>
  );
};

const AvatarConstellation = () => {
  const prefersReducedMotion = useReducedMotion();
  
  // Sample avatar URLs (replace with real users when available)
  const avatars = [
    'https://randomuser.me/api/portraits/women/44.jpg',
    'https://randomuser.me/api/portraits/men/86.jpg',
    'https://randomuser.me/api/portraits/women/22.jpg',
    'https://randomuser.me/api/portraits/men/29.jpg',
    'https://randomuser.me/api/portraits/women/56.jpg',
    'https://randomuser.me/api/portraits/men/42.jpg',
    'https://randomuser.me/api/portraits/women/17.jpg',
    'https://randomuser.me/api/portraits/men/4.jpg',
  ];
  
  // Don't show animation if reduced motion is preferred
  if (prefersReducedMotion) {
    return null;
  }
  
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <svg width="100%" height="100%" className="absolute inset-0" aria-hidden="true">
        {/* Subtle connection lines with glow */}
        <g>
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(79, 70, 229, 0.1)" />
              <stop offset="50%" stopColor="rgba(147, 51, 234, 0.2)" />
              <stop offset="100%" stopColor="rgba(79, 70, 229, 0.1)" />
            </linearGradient>
          </defs>
          <g stroke="url(#lineGradient)" strokeWidth="1">
            <line x1="20%" y1="30%" x2="35%" y2="40%" />
            <line x1="35%" y1="40%" x2="40%" y2="20%" />
            <line x1="40%" y1="20%" x2="60%" y2="15%" />
            <line x1="60%" y1="15%" x2="75%" y2="30%" />
            <line x1="75%" y1="30%" x2="65%" y2="55%" />
            <line x1="65%" y1="55%" x2="35%" y2="60%" />
            <line x1="35%" y1="60%" x2="25%" y2="45%" />
            <line x1="25%" y1="45%" x2="35%" y2="40%" />
          </g>
        </g>
        
        {/* Avatar clipPath for circular masking */}
        <defs>
          <clipPath id="avatarMask">
            <circle r="16" cx="16" cy="16" />
          </clipPath>
        </defs>
        
        {/* Positioned avatars */}
        {avatars.map((url, i) => {
          // Position avatars in a scattered pattern
          const positions = [
            { x: "20%", y: "30%" },
            { x: "35%", y: "40%" },
            { x: "40%", y: "20%" },
            { x: "60%", y: "15%" },
            { x: "75%", y: "30%" },
            { x: "65%", y: "55%" },
            { x: "35%", y: "60%" },
            { x: "25%", y: "45%" },
          ];
          const pos = positions[i % positions.length];
          
          return (
            <g key={i}>
              {/* Glow effect around avatar */}
              <motion.circle
                cx={`calc(${pos.x})`}
                cy={`calc(${pos.y})`}
                r="18"
                fill="rgba(79, 70, 229, 0.2)"
                animate={{ 
                  r: [18, 22, 18],
                  opacity: [0.2, 0.4, 0.2] 
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.3
                }}
              />
              
              <motion.image
                href={url}
                x={`calc(${pos.x} - 16px)`}
                y={`calc(${pos.y} - 16px)`}
                height="32"
                width="32"
                clipPath="url(#avatarMask)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.9 }}
                transition={{ delay: i * 0.2, duration: 0.5 }}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
};

const HeroSection: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <section className="relative overflow-hidden min-h-[85vh] flex items-center">
      <AuroraBackground />
      <AvatarConstellation />
      
      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.span 
            className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-purple-900/60 text-purple-200 border border-purple-700/50 backdrop-blur-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Sparkles size={16} className="mr-1 text-purple-300" />
            Empower Your AI Journey
          </motion.span>
          
          <h1 className="mt-8 text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-white">
            <KineticText>Unite.</KineticText> 
            <KineticText delay={0.3}>Learn.</KineticText> 
            <KineticText delay={0.6}>
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
                Build
              </span>
            </KineticText> 
            <KineticText delay={0.9}> with AI.</KineticText>
          </h1>
          
          <motion.p 
            className="mt-6 text-lg md:text-xl text-gray-300 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            Join a thriving community to collaborate, discover tools, and accelerate your AI expertise.
          </motion.p>
          
          <motion.div 
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ 
                type: "spring", 
                stiffness: 400, 
                damping: 15 
              }}
              className="shadow-lg hover:shadow-xl transition-shadow"
            >
              <Button 
                size="lg" 
                leftIcon={<UserPlus size={18} />}
                className="relative overflow-hidden group"
              >
                <span className="relative z-10">Join the Community</span>
                {!prefersReducedMotion && (
                  <motion.span 
                    className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20"
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
              variant="outline" 
              size="lg"
              rightIcon={<ChevronRight size={18} />}
            >
              Explore AI Tools
            </Button>
          </motion.div>
          
          <div className="mt-3">
            <motion.p 
              className="text-sm text-gray-400 mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.9 }}
              transition={{ delay: 1.4, duration: 0.5 }}
            >
              <span className="text-blue-400 font-medium">100,000+</span> members from 182 countries
            </motion.p>
          </div>
          
          <div className="mt-8">
            <LiveCounter />
          </div>
          
          {/* Animated Down Arrow */}
          {!prefersReducedMotion && (
            <motion.div 
              className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
              animate={{ y: [0, 10, 0] }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "loop",
                ease: "easeInOut"
              }}
            >
              <motion.svg 
                width="24" 
                height="24" 
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
    </section>
  );
};

export default HeroSection;