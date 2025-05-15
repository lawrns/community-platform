"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download } from "lucide-react";

type ImageItem = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  blurDataURL?: string;
};

type GalleryLayout = "grid" | "masonry" | "carousel";

interface ImageGalleryProps {
  images: ImageItem[];
  layout?: GalleryLayout;
  className?: string;
  gap?: "xs" | "sm" | "md" | "lg";
  rounded?: "none" | "sm" | "md" | "lg";
  aspectRatio?: "square" | "video" | "portrait" | "wide" | string;
  lightbox?: boolean;
  columns?: 1 | 2 | 3 | 4;
}

/**
 * Responsive image gallery component with various layouts and lightbox support
 * 
 * @example
 * <ImageGallery
 *   images={[
 *     { src: "/image1.jpg", alt: "Image 1" },
 *     { src: "/image2.jpg", alt: "Image 2" },
 *   ]}
 *   layout="grid"
 *   lightbox
 * />
 */
export function ImageGallery({
  images,
  layout = "grid",
  className,
  gap = "md",
  rounded = "md",
  aspectRatio = layout === "masonry" ? undefined : "square",
  lightbox = true,
  columns = 3,
}: ImageGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [scale, setScale] = useState(1);

  const gapMap = {
    xs: "gap-1",
    sm: "gap-2",
    md: "gap-4",
    lg: "gap-6",
  };

  const columnsMap = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
  };

  const handleImageClick = (index: number) => {
    if (lightbox) {
      setActiveIndex(index);
      setLightboxOpen(true);
      setScale(1); // Reset zoom when opening new image
    }
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const navigateImage = (direction: "next" | "prev") => {
    if (direction === "next") {
      setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    } else {
      setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    }
    setScale(1); // Reset zoom when changing images
  };

  const handleZoom = (action: "in" | "out") => {
    if (action === "in" && scale < 3) {
      setScale((prev) => prev + 0.5);
    } else if (action === "out" && scale > 1) {
      setScale((prev) => prev - 0.5);
    }
  };

  const downloadImage = () => {
    const link = document.createElement('a');
    link.href = images[activeIndex].src;
    link.download = images[activeIndex].alt || 'image';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Function to render the gallery based on layout type
  const renderGallery = () => {
    switch (layout) {
      case "masonry":
        return (
          <div 
            className={cn(
              "columns-1 sm:columns-2 lg:columns-3 xl:columns-4",
              gapMap[gap],
              className
            )}
          >
            {images.map((image, index) => (
              <div 
                key={`${image.src}-${index}`}
                className="mb-4 break-inside-avoid"
                onClick={() => handleImageClick(index)}
              >
                <OptimizedImage
                  src={image.src}
                  alt={image.alt}
                  width={image.width || 500}
                  height={image.height || 500}
                  rounded={rounded}
                  className={cn(
                    "w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                  )}
                />
              </div>
            ))}
          </div>
        );
        
      case "carousel":
        return (
          <div className={cn("relative overflow-hidden", className)}>
            <div className="flex overflow-x-auto hide-scrollbar snap-x snap-mandatory py-2">
              {images.map((image, index) => (
                <div 
                  key={`${image.src}-${index}`}
                  className={cn(
                    "flex-shrink-0 w-full sm:w-1/2 lg:w-1/3 px-2 snap-center",
                    index === 0 && "pl-0",
                    index === images.length - 1 && "pr-0"
                  )}
                  onClick={() => handleImageClick(index)}
                >
                  <OptimizedImage
                    src={image.src}
                    alt={image.alt}
                    width={image.width || 400}
                    height={image.height || 400}
                    aspectRatio={aspectRatio}
                    rounded={rounded}
                    className="cursor-pointer hover:opacity-90 transition-opacity"
                  />
                </div>
              ))}
            </div>
            {images.length > 1 && (
              <>
                <Button 
                  className="absolute left-1 top-1/2 -translate-y-1/2 rounded-full p-2 h-auto z-10 bg-surface-1/80 backdrop-blur-sm hover:bg-surface-1"
                  size="icon"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateImage("prev");
                  }}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button 
                  className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full p-2 h-auto z-10 bg-surface-1/80 backdrop-blur-sm hover:bg-surface-1"
                  size="icon"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateImage("next");
                  }}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </>
            )}
          </div>
        );
        
      case "grid":
      default:
        return (
          <div 
            className={cn(
              "grid",
              columnsMap[columns],
              gapMap[gap],
              className
            )}
          >
            {images.map((image, index) => (
              <div 
                key={`${image.src}-${index}`}
                onClick={() => handleImageClick(index)}
              >
                <OptimizedImage
                  src={image.src}
                  alt={image.alt}
                  width={image.width || 400}
                  height={image.height || 400}
                  aspectRatio={aspectRatio}
                  rounded={rounded}
                  className="cursor-pointer hover:opacity-90 transition-opacity w-full h-auto"
                />
              </div>
            ))}
          </div>
        );
    }
  };

  return (
    <>
      {renderGallery()}

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
            onClick={closeLightbox}
          >
            <div 
              className="absolute inset-0 flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="relative max-w-[90vw] max-h-[80vh] overflow-hidden"
              >
                <div className="relative">
                  <img
                    src={images[activeIndex].src}
                    alt={images[activeIndex].alt}
                    className="object-contain max-w-full max-h-[80vh]"
                    style={{ transform: `scale(${scale})` }}
                  />
                </div>
              </motion.div>
            </div>

            {/* Navigation and controls */}
            <div className="absolute top-4 right-4 flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="rounded-full bg-surface-1/20 backdrop-blur-sm hover:bg-surface-1/40"
                onClick={(e) => {
                  e.stopPropagation();
                  handleZoom("in");
                }}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="rounded-full bg-surface-1/20 backdrop-blur-sm hover:bg-surface-1/40"
                onClick={(e) => {
                  e.stopPropagation();
                  handleZoom("out");
                }}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="rounded-full bg-surface-1/20 backdrop-blur-sm hover:bg-surface-1/40"
                onClick={(e) => {
                  e.stopPropagation();
                  downloadImage();
                }}
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="rounded-full bg-surface-1/20 backdrop-blur-sm hover:bg-surface-1/40"
                onClick={closeLightbox}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {images.length > 1 && (
              <>
                <Button
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-surface-1/20 backdrop-blur-sm hover:bg-surface-1/40"
                  size="icon"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateImage("prev");
                  }}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-surface-1/20 backdrop-blur-sm hover:bg-surface-1/40"
                  size="icon"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateImage("next");
                  }}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}

            {/* Caption */}
            <div className="absolute bottom-4 left-0 right-0 text-center">
              <p className="text-white text-sm bg-black/30 inline-block px-4 py-2 rounded-full">
                {images[activeIndex].alt} ({activeIndex + 1}/{images.length})
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default ImageGallery;