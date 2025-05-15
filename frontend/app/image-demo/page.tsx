"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { ImageGallery } from "@/components/ui/image-gallery";
import { AvatarImage } from "@/components/ui/avatar-image";
import { MotionWrapper } from "@/components/motion/MotionWrapper";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Sample images for demo
const sampleImages = [
  { src: "https://images.unsplash.com/photo-1529665253569-6d01c0eaf7b6", alt: "Profile picture of a person", width: 800, height: 800 },
  { src: "https://images.unsplash.com/photo-1599566150163-29194dcaad36", alt: "Close-up portrait of a man", width: 800, height: 800 },
  { src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330", alt: "Smiling woman with orange background", width: 800, height: 800 },
  { src: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde", alt: "Man with blue background", width: 800, height: 800 },
];

const landscapeImages = [
  { src: "https://images.unsplash.com/photo-1605379399642-870262d3d051", alt: "Computer setup on desk", width: 1200, height: 800 },
  { src: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f", alt: "Laptop with code", width: 1200, height: 800 },
  { src: "https://images.unsplash.com/photo-1555066931-4365d14bab8c", alt: "Code on a screen", width: 1200, height: 800 },
  { src: "https://images.unsplash.com/photo-1516116216624-53e697fedbea", alt: "Desktop with laptop", width: 1200, height: 800 },
  { src: "https://images.unsplash.com/photo-1498050108023-c5249f4df085", alt: "Coding on laptop", width: 1200, height: 800 },
  { src: "https://images.unsplash.com/photo-1607705703571-c5a8695f18f6", alt: "Workspace with plants", width: 1200, height: 800 },
];

const portraitImages = [
  { src: "https://images.unsplash.com/photo-1618477388954-7852f32655ec", alt: "Phone with app", width: 800, height: 1200 },
  { src: "https://images.unsplash.com/photo-1573804633927-bfcbcd909acd", alt: "Person holding phone", width: 800, height: 1200 },
  { src: "https://images.unsplash.com/photo-1581287053822-fd7bf4f4bfec", alt: "Mobile app on dark background", width: 800, height: 1200 },
  { src: "https://images.unsplash.com/photo-1616348436168-de43ad0db179", alt: "Phone with colorful screen", width: 800, height: 1200 },
];

const galleryImages = [
  ...landscapeImages,
  ...portraitImages,
];

export default function ImageDemo() {
  const [activeTab, setActiveTab] = useState("optimized-images");
  
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-16 text-center">
        <h1 className="text-display-2xl font-bold text-content-primary mb-4">
          Image Optimization Demo
        </h1>
        <p className="text-body-lg text-content-secondary max-w-3xl mx-auto">
          This page showcases various techniques for optimizing images and media assets in the platform.
        </p>
      </div>
      
      <Tabs 
        defaultValue="optimized-images" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-1 md:grid-cols-3 mb-8">
          <TabsTrigger value="optimized-images">Optimized Images</TabsTrigger>
          <TabsTrigger value="avatars">Avatar Images</TabsTrigger>
          <TabsTrigger value="galleries">Image Galleries</TabsTrigger>
        </TabsList>
        
        <TabsContent value="optimized-images">
          <OptimizedImagesDemo />
        </TabsContent>
        
        <TabsContent value="avatars">
          <AvatarImagesDemo />
        </TabsContent>
        
        <TabsContent value="galleries">
          <GalleriesDemo />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function OptimizedImagesDemo() {
  return (
    <MotionWrapper variant="fadeIn">
      <Card>
        <CardHeader>
          <CardTitle>Optimized Images</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-display-sm font-medium">Default Image</h3>
              <p className="text-content-secondary text-sm mb-4">
                Standard image with automatic optimization, lazy loading, and placeholder.
              </p>
              <OptimizedImage 
                src={landscapeImages[0].src}
                alt={landscapeImages[0].alt}
                width={600}
                height={400}
                className="rounded-lg"
              />
            </div>
            
            <div className="space-y-4">
              <h3 className="text-display-sm font-medium">With Aspect Ratio</h3>
              <p className="text-content-secondary text-sm mb-4">
                Images with controlled aspect ratio prevent layout shifts during loading.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <OptimizedImage 
                  src={landscapeImages[1].src}
                  alt={landscapeImages[1].alt}
                  width={300}
                  height={200}
                  aspectRatio="square"
                  rounded="md"
                />
                <OptimizedImage 
                  src={landscapeImages[2].src}
                  alt={landscapeImages[2].alt}
                  width={300}
                  height={200}
                  aspectRatio="video"
                  rounded="md"
                />
                <OptimizedImage 
                  src={portraitImages[0].src}
                  alt={portraitImages[0].alt}
                  width={200}
                  height={300}
                  aspectRatio="portrait"
                  rounded="md"
                />
                <OptimizedImage 
                  src={landscapeImages[3].src}
                  alt={landscapeImages[3].alt}
                  width={400}
                  height={200}
                  aspectRatio="wide"
                  rounded="md"
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-display-sm font-medium">Rounded Variants</h3>
            <p className="text-content-secondary text-sm mb-4">
              Images with different border radius options.
            </p>
            <div className="flex flex-wrap gap-4">
              <OptimizedImage 
                src={sampleImages[0].src}
                alt={sampleImages[0].alt}
                width={150}
                height={150}
                aspectRatio="square"
                rounded="none"
              />
              <OptimizedImage 
                src={sampleImages[1].src}
                alt={sampleImages[1].alt}
                width={150}
                height={150}
                aspectRatio="square"
                rounded="sm"
              />
              <OptimizedImage 
                src={sampleImages[2].src}
                alt={sampleImages[2].alt}
                width={150}
                height={150}
                aspectRatio="square"
                rounded="md"
              />
              <OptimizedImage 
                src={sampleImages[3].src}
                alt={sampleImages[3].alt}
                width={150}
                height={150}
                aspectRatio="square"
                rounded="lg"
              />
              <OptimizedImage 
                src={sampleImages[0].src}
                alt={sampleImages[0].alt}
                width={150}
                height={150}
                aspectRatio="square"
                rounded="full"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-display-sm font-medium">Fallback Demo</h3>
            <p className="text-content-secondary text-sm mb-4">
              Images with error handling and fallback display.
            </p>
            <div className="flex flex-wrap gap-4">
              <OptimizedImage 
                src="https://invalid-image-url.jpg"
                alt="This image will fail to load"
                width={200}
                height={200}
                aspectRatio="square"
                rounded="md"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </MotionWrapper>
  );
}

function AvatarImagesDemo() {
  return (
    <MotionWrapper variant="fadeIn">
      <Card>
        <CardHeader>
          <CardTitle>Avatar Images</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-display-sm font-medium">Sizes</h3>
            <p className="text-content-secondary text-sm mb-4">
              Avatars in different sizes with optimization.
            </p>
            <div className="flex flex-wrap items-end gap-6">
              <div className="flex flex-col items-center gap-2">
                <AvatarImage
                  src={sampleImages[0].src}
                  alt="John Doe"
                  size="xs"
                />
                <span className="text-xs text-content-secondary">XS</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <AvatarImage
                  src={sampleImages[1].src}
                  alt="Jane Smith"
                  size="sm"
                />
                <span className="text-xs text-content-secondary">SM</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <AvatarImage
                  src={sampleImages[2].src}
                  alt="Alex Johnson"
                  size="md"
                />
                <span className="text-xs text-content-secondary">MD</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <AvatarImage
                  src={sampleImages[3].src}
                  alt="Sam Brown"
                  size="lg"
                />
                <span className="text-xs text-content-secondary">LG</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <AvatarImage
                  src={sampleImages[0].src}
                  alt="Chris Green"
                  size="xl"
                />
                <span className="text-xs text-content-secondary">XL</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-display-sm font-medium">Status Indicators</h3>
            <p className="text-content-secondary text-sm mb-4">
              Avatars with different status indicators.
            </p>
            <div className="flex flex-wrap gap-6">
              <div className="flex flex-col items-center gap-2">
                <AvatarImage
                  src={sampleImages[0].src}
                  alt="Online User"
                  status="online"
                />
                <span className="text-xs text-content-secondary">Online</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <AvatarImage
                  src={sampleImages[1].src}
                  alt="Offline User"
                  status="offline"
                />
                <span className="text-xs text-content-secondary">Offline</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <AvatarImage
                  src={sampleImages[2].src}
                  alt="Away User"
                  status="away"
                />
                <span className="text-xs text-content-secondary">Away</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <AvatarImage
                  src={sampleImages[3].src}
                  alt="Busy User"
                  status="busy"
                />
                <span className="text-xs text-content-secondary">Busy</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <AvatarImage
                  src={sampleImages[0].src}
                  alt="Invisible User"
                  status="invisible"
                />
                <span className="text-xs text-content-secondary">Invisible</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-display-sm font-medium">With Border</h3>
              <p className="text-content-secondary text-sm mb-4">
                Avatars with decorative borders.
              </p>
              <div className="flex flex-wrap gap-4">
                <AvatarImage
                  src={sampleImages[0].src}
                  alt="User with Border"
                  size="lg"
                  border
                />
                <AvatarImage
                  src={sampleImages[1].src}
                  alt="User with Border"
                  size="lg"
                  border
                  borderColor="ring-brand-primary"
                />
                <AvatarImage
                  src={sampleImages[2].src}
                  alt="User with Border"
                  size="lg"
                  border
                  borderColor="ring-semantic-success"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-display-sm font-medium">Fallbacks</h3>
              <p className="text-content-secondary text-sm mb-4">
                Avatars that display initials when image fails to load.
              </p>
              <div className="flex flex-wrap gap-4">
                <AvatarImage
                  alt="John Doe"
                  size="lg"
                  fallback="JD"
                />
                <AvatarImage
                  src="https://invalid-image-url.jpg"
                  alt="Sam Smith"
                  size="lg"
                />
                <AvatarImage
                  alt="Alex Johnson"
                  size="lg"
                  fallback="AJ"
                  border
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </MotionWrapper>
  );
}

function GalleriesDemo() {
  const [layout, setLayout] = useState<"grid" | "masonry" | "carousel">("grid");
  
  return (
    <MotionWrapper variant="fadeIn">
      <Card>
        <CardHeader>
          <CardTitle>Image Galleries</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start mb-4">
            <Button 
              variant={layout === "grid" ? "default" : "outline"}
              onClick={() => setLayout("grid")}
            >
              Grid Layout
            </Button>
            <Button 
              variant={layout === "masonry" ? "default" : "outline"}
              onClick={() => setLayout("masonry")}
            >
              Masonry Layout
            </Button>
            <Button 
              variant={layout === "carousel" ? "default" : "outline"}
              onClick={() => setLayout("carousel")}
            >
              Carousel Layout
            </Button>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-display-sm font-medium">
              {layout.charAt(0).toUpperCase() + layout.slice(1)} Gallery
            </h3>
            <p className="text-content-secondary text-sm mb-4">
              A responsive image gallery with {layout} layout and lightbox support. Click on any image to view it in the lightbox.
            </p>
            
            <ImageGallery 
              images={galleryImages}
              layout={layout}
              lightbox
              columns={3}
              gap="md"
              rounded="md"
            />
          </div>
        </CardContent>
      </Card>
    </MotionWrapper>
  );
}