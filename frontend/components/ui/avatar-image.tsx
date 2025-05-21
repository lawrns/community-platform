"use client";

import React, { useState } from "react";
import { AvatarWithInitials, AvatarFallback } from "@/components/ui/avatar";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { cn } from "@/lib/utils";

type AvatarImageSize = "xs" | "sm" | "md" | "lg" | "xl" | number;

interface AvatarImageProps {
  src?: string;
  alt: string;
  size?: AvatarImageSize;
  fallback?: string;
  className?: string;
  // If online status is shown
  status?: "online" | "offline" | "away" | "busy" | "invisible" | null;
  statusPosition?: "top-right" | "bottom-right" | "bottom-left" | "top-left";
  // If border
  border?: boolean;
  borderColor?: string;
  onClick?: () => void;
}

/**
 * Enhanced avatar component with image optimization, fallback initials, and status
 * 
 * @example
 * <AvatarImage
 *   src="/user-avatar.jpg"
 *   alt="John Doe"
 *   fallback="JD"
 *   size="md"
 *   status="online"
 * />
 */
export function AvatarImage({
  src,
  alt,
  size = "md",
  fallback,
  className,
  status = null,
  statusPosition = "bottom-right",
  border = false,
  borderColor,
  onClick,
}: AvatarImageProps) {
  const [imageError, setImageError] = useState(false);
  
  // Get fallback text (initials) from name if not provided
  const getFallbackText = () => {
    if (fallback) return fallback;
    
    // Generate initials from alt text (which is usually the user's name)
    return alt
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };
  
  // Get size in pixels
  const getSize = () => {
    if (typeof size === 'number') return size;
    
    const sizeMap = {
      xs: 24,
      sm: 32,
      md: 40,
      lg: 56,
      xl: 80,
    };
    
    return sizeMap[size];
  };
  
  // Size in pixels
  const pixelSize = getSize();
  
  // Status colors
  const statusColors = {
    online: "bg-semantic-success",
    offline: "bg-content-tertiary",
    away: "bg-semantic-warning",
    busy: "bg-semantic-error",
    invisible: "bg-content-tertiary/50",
  };
  
  // Status position classes
  const statusPositions = {
    "top-right": "top-0 right-0",
    "bottom-right": "bottom-0 right-0",
    "bottom-left": "bottom-0 left-0",
    "top-left": "top-0 left-0",
  };
  
  return (
    <AvatarWithInitials 
      className={cn(
        "relative",
        border && "ring-2 ring-offset-2 ring-offset-surface-1",
        border && borderColor ? borderColor : "ring-surface-3",
        onClick && "cursor-pointer",
        {
          "h-6 w-6": size === "xs",
          "h-8 w-8": size === "sm",
          "h-10 w-10": size === "md",
          "h-14 w-14": size === "lg",
          "h-20 w-20": size === "xl",
        },
        className
      )}
      onClick={onClick}
      initials={getFallbackText()}
    >
      {src && !imageError ? (
        <OptimizedImage
          src={src}
          alt={alt}
          fill
          sizes={`${pixelSize}px`}
          blurEffect={false}
          showLoadingAnimation={false}
          rounded="full"
          onError={() => setImageError(true)}
          className="object-cover"
        />
      ) : null}
      
      {/* Status indicator */}
      {status && (
        <span
          className={cn(
            "absolute block rounded-full ring-2 ring-surface-1",
            statusColors[status],
            statusPositions[statusPosition],
            {
              "h-2 w-2": size === "xs" || size === "sm",
              "h-3 w-3": size === "md",
              "h-4 w-4": size === "lg" || size === "xl",
            }
          )}
        />
      )}
    </AvatarWithInitials>
  );
}

export default AvatarImage;