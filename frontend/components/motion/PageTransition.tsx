"use client"

import { ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"
import { pageTransition } from "@/lib/animations"

interface PageTransitionProps {
  children: ReactNode;
  variant?: "fade" | "slide" | "scale";
}

export default function PageTransition({ 
  children, 
  variant = "slide" 
}: PageTransitionProps) {
  const pathname = usePathname();
  
  // Create different animation variants for page transitions
  const getVariants = () => {
    switch (variant) {
      case "fade":
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
        };
      case "scale":
        return {
          initial: { opacity: 0, scale: 0.98 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0.98 },
          transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
        };
      default: // slide
        return {
          initial: { opacity: 0, y: 8 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -8 },
          transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
        };
    }
  };
  
  const variants = getVariants();
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={variants.initial}
        animate={variants.animate}
        exit={variants.exit}
        transition={variants.transition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}