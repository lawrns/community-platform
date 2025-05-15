"use client";

import React, { useState, ReactNode } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type HoverCardProps = {
  className?: string;
  cardClassName?: string;
  contentClassName?: string;
  children: ReactNode;
  title?: string;
  description?: string;
  footer?: ReactNode;
  hoverScale?: number;
  hoverRotate?: number;
  hoverElevation?: boolean;
  hoverGlow?: boolean;
  glowColor?: string;
  as?: React.ElementType;
  onClick?: () => void;
};

/**
 * An enhanced card component with hover animations
 * 
 * @example
 * <HoverCard 
 *   title="My Card" 
 *   description="A basic hover card" 
 *   hoverScale={1.02} 
 *   hoverGlow
 * >
 *   <p>Card content</p>
 * </HoverCard>
 */
export default function HoverCard({
  className = "",
  cardClassName = "",
  contentClassName = "",
  children,
  title,
  description,
  footer,
  hoverScale = 1.02,
  hoverRotate = 0,
  hoverElevation = true,
  hoverGlow = false,
  glowColor = "rgba(var(--brand-primary), 0.15)",
  as,
  onClick,
}: HoverCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const CardComponent = as || Card;
  
  return (
    <motion.div
      className={cn("relative", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ 
        scale: hoverScale, 
        rotateZ: hoverRotate,
        z: 10,
        transition: { 
          type: "spring", 
          stiffness: 400, 
          damping: 10 
        }
      }}
      onClick={onClick}
    >
      {/* Glow effect */}
      {hoverGlow && (
        <motion.div
          className="absolute inset-0 -z-10 rounded-lg opacity-0"
          style={{ 
            boxShadow: `0 0 20px 10px ${glowColor}`,
            background: "transparent" 
          }}
          animate={{
            opacity: isHovered ? 1 : 0
          }}
          transition={{
            duration: 0.3
          }}
        />
      )}

      <CardComponent 
        className={cn(
          "overflow-hidden",
          hoverElevation && "transition-shadow duration-300",
          isHovered && hoverElevation && "shadow-xl",
          cardClassName
        )}
      >
        {(title || description) && (
          <CardHeader>
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}
        
        <CardContent className={contentClassName}>{children}</CardContent>
        
        {footer && <CardFooter>{footer}</CardFooter>}
      </CardComponent>
    </motion.div>
  );
}