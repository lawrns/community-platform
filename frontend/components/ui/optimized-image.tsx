"use client";

import React, { useState, useEffect } from "react";
import Image, { ImageProps } from "next/image";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

type OptimizedImageProps = Omit<ImageProps, "onLoadingComplete"> & {
  fallback?: React.ReactNode;
  showLoadingAnimation?: boolean;
  aspectRatio?: "square" | "video" | "portrait" | "wide" | string;
  rounded?: "none" | "sm" | "md" | "lg" | "full";
  containerClassName?: string;
  blurEffect?: boolean;
  priority?: boolean;
};

/**
 * Optimized image component with lazy loading, placeholder, and responsive handling
 * 
 * @example
 * <OptimizedImage
 *   src="/image.jpg"
 *   alt="Description"
 *   aspectRatio="square"
 *   rounded="md"
 *   showLoadingAnimation
 * />
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  sizes,
  quality = 85,
  fallback,
  showLoadingAnimation = true,
  aspectRatio = "square",
  rounded = "md",
  className,
  containerClassName,
  blurEffect = true,
  priority = false,
  loading = priority ? "eager" : "lazy",
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Reset states when src changes
    setIsLoading(true);
    setError(false);
  }, [src]);

  // Default sizes if not provided
  const defaultSizes = sizes || 
    "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw";

  // Get aspect ratio style
  const getAspectRatioStyle = () => {
    if (typeof aspectRatio === 'string') {
      switch (aspectRatio) {
        case 'square': return 'aspect-square';
        case 'video': return 'aspect-video';
        case 'portrait': return 'aspect-[3/4]';
        case 'wide': return 'aspect-[2/1]';
        default: return `aspect-[${aspectRatio}]`;
      }
    }
    return 'aspect-square';
  };

  // Get rounded style
  const getRoundedStyle = () => {
    switch (rounded) {
      case 'none': return '';
      case 'sm': return 'rounded-sm';
      case 'md': return 'rounded-md';
      case 'lg': return 'rounded-lg';
      case 'full': return 'rounded-full';
      default: return 'rounded-md';
    }
  };

  // Handle image load complete
  const handleLoadComplete = () => {
    setIsLoading(false);
  };

  // Handle image load error
  const handleError = () => {
    setIsLoading(false);
    setError(true);
  };

  // Render fallback content if there's an error
  if (error) {
    return (
      <div 
        className={cn(
          "relative overflow-hidden bg-surface-2 flex items-center justify-center",
          !fill && getAspectRatioStyle(),
          getRoundedStyle(),
          containerClassName
        )}
        style={{ width: width ? `${width}px` : 'auto', height: height ? `${height}px` : 'auto' }}
      >
        {fallback || (
          <div className="flex flex-col items-center justify-center p-4 text-center">
            <svg className="w-8 h-8 text-content-tertiary mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-content-secondary text-sm">{alt || "Image failed to load"}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "relative overflow-hidden",
        !fill && getAspectRatioStyle(),
        getRoundedStyle(),
        containerClassName
      )}
      style={{ width: width ? `${width}px` : 'auto', height: height ? `${height}px` : 'auto' }}
    >
      {/* Loading skeleton */}
      {isLoading && showLoadingAnimation && (
        <Skeleton 
          className={cn(
            "absolute inset-0 z-10",
            getRoundedStyle()
          )}
        />
      )}

      {/* Next.js Image */}
      <Image
        src={src}
        alt={alt}
        quality={quality}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        sizes={defaultSizes}
        loading={loading}
        priority={priority}
        onLoad={handleLoadComplete}
        onError={handleError}
        placeholder={blurEffect ? "blur" : undefined}
        blurDataURL={blurEffect ? "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" : undefined}
        className={cn(
          "object-cover",
          isLoading && "opacity-0",
          !isLoading && "opacity-100 transition-opacity duration-300",
          className
        )}
        {...props}
      />
    </div>
  );
}

export default OptimizedImage;