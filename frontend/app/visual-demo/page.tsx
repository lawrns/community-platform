"use client"

import React, { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AnimatedHero3D } from "@/components/hero/AnimatedHero3D"
import { ThemeToggleAnimated, ThemeToggleWithLabel } from "@/components/ui/theme-toggle-animated"
import { CursorEffects, Magnetic, CursorHighlight } from "@/components/ui/cursor-effects"
import { StaggeredPageContent } from "@/components/motion/enhanced-page-transition"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function VisualDemoPage() {
  const [cursorEffect, setCursorEffect] = useState<'default' | 'glow' | 'trail' | 'spotlight' | 'emoji' | 'none'>('none')
  
  return (
    <CursorEffects effect={cursorEffect} emoji="✨">
      <div className="min-h-screen overflow-x-hidden">
        {/* Hero Section */}
        <AnimatedHero3D
          title={<>
            Welcome to the <span className="text-gradient">Visual Demo</span> ✨
          </>}
          subtitle="Explore the vibrant new design system with animations, gradients, micro-interactions and more!"
          primaryCta={{
            text: "Get Started",
            href: "#features"
          }}
          secondaryCta={{
            text: "View Components",
            href: "/design-system"
          }}
        />
        
        {/* Features Section */}
        <section id="features" className="relative py-24 px-6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-surface-1 animated-gradient"></div>
          <div className="absolute inset-0 bg-gradient-surface-1 animated-gradient"></div>
          
          {/* Decorative background elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
            <motion.div
              className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[120px]"
              animate={{
                x: [0, 30, 0],
                y: [0, -30, 0],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute bottom-[20%] right-[5%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[100px]"
              animate={{
                x: [0, -20, 0],
                y: [0, 20, 0],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
            />
          </div>
          
          <div className="container mx-auto relative z-10">
            <StaggeredPageContent>
              <div className="text-center mb-16">
                <motion.h2 
                  className="text-4xl md:text-5xl font-bold mb-4 text-gradient"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6 }}
                >
                  Stunning Visual Features ✨
                </motion.h2>
                <motion.p 
                  className="text-xl text-content-secondary max-w-2xl mx-auto"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  Transform your user experience with these beautifully designed components and effects
                </motion.p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Magnetic>
                  <Card className="card-3d border-white/10 bg-surface-1/80 backdrop-blur-sm hover:border-primary/30 transition-all duration-300">
                    <CardHeader>
                      <CardTitle className="text-xl flex items-center">
                        <span className="text-gradient">Color System</span>
                        <span className="ml-2">🎨</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-content-secondary">
                        Vibrant gradient system with semantic tokens for consistent, beautiful interfaces
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-primary"></div>
                        <div className="w-8 h-8 rounded-full bg-gradient-secondary"></div>
                        <div className="w-8 h-8 rounded-full bg-gradient-success"></div>
                        <div className="w-8 h-8 rounded-full bg-gradient-warning"></div>
                        <div className="w-8 h-8 rounded-full bg-gradient-error"></div>
                      </div>
                    </CardContent>
                  </Card>
                </Magnetic>
                
                <Magnetic>
                  <Card className="card-3d border-white/10 bg-surface-1/80 backdrop-blur-sm hover:border-primary/30 transition-all duration-300">
                    <CardHeader>
                      <CardTitle className="text-xl flex items-center">
                        <span className="text-gradient">Animations</span>
                        <span className="ml-2">✨</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-content-secondary">
                        Thoughtful animations and transitions that bring the interface to life
                      </p>
                      <div className="mt-4 flex gap-2">
                        <div className="w-8 h-8 rounded-full bg-purple-500 animate-pulse"></div>
                        <div className="w-8 h-8 rounded-full bg-blue-500 animate-float" style={{ animationDelay: "0.2s" }}></div>
                        <div className="w-8 h-8 rounded-full bg-pink-500 animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                        <div className="w-8 h-8 rounded-full bg-indigo-500 animate-spin" style={{ animationDuration: "3s" }}></div>
                      </div>
                    </CardContent>
                  </Card>
                </Magnetic>
                
                <Magnetic>
                  <Card className="card-3d border-white/10 bg-surface-1/80 backdrop-blur-sm hover:border-primary/30 transition-all duration-300">
                    <CardHeader>
                      <CardTitle className="text-xl flex items-center">
                        <span className="text-gradient">3D Effects</span>
                        <span className="ml-2">🪄</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-content-secondary">
                        Depth and dimension with subtle 3D transforms and perspective effects
                      </p>
                      <div className="mt-4 perspective">
                        <motion.div 
                          className="h-16 w-full bg-gradient-primary rounded-lg"
                          animate={{ 
                            rotateX: [0, 10, 0],
                            rotateY: [0, 15, 0]
                          }}
                          transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </Magnetic>
                
                <Magnetic>
                  <Card className="card-3d border-white/10 bg-surface-1/80 backdrop-blur-sm hover:border-primary/30 transition-all duration-300">
                    <CardHeader>
                      <CardTitle className="text-xl flex items-center">
                        <span className="text-gradient">Cursor Effects</span>
                        <span className="ml-2">👆</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-content-secondary">
                        Interactive cursor effects that respond to user movement and interactions
                      </p>
                      <div className="mt-4">
                        <select 
                          className="w-full p-2 rounded-md border border-white/10 bg-surface-2/50 text-content-primary"
                          value={cursorEffect}
                          onChange={(e) => setCursorEffect(e.target.value as any)}
                        >
                          <option value="none">No Effect (Default)</option>
                          <option value="default">Simple Follower</option>
                          <option value="glow">Glow Effect</option>
                          <option value="trail">Trail Effect</option>
                          <option value="spotlight">Spotlight</option>
                          <option value="emoji">Emoji Follower</option>
                        </select>
                      </div>
                    </CardContent>
                  </Card>
                </Magnetic>
                
                <Magnetic>
                  <Card className="card-3d border-white/10 bg-surface-1/80 backdrop-blur-sm hover:border-primary/30 transition-all duration-300">
                    <CardHeader>
                      <CardTitle className="text-xl flex items-center">
                        <span className="text-gradient">Theme Toggle</span>
                        <span className="ml-2">🌓</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-content-secondary">
                        Beautiful animated theme toggle with light and dark mode support
                      </p>
                      <div className="mt-4 flex justify-center">
                        <ThemeToggleWithLabel />
                      </div>
                    </CardContent>
                  </Card>
                </Magnetic>
                
                <Magnetic>
                  <Card className="card-3d border-white/10 bg-surface-1/80 backdrop-blur-sm hover:border-primary/30 transition-all duration-300">
                    <CardHeader>
                      <CardTitle className="text-xl flex items-center">
                        <span className="text-gradient">Micro-interactions</span>
                        <span className="ml-2">👇</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-content-secondary">
                        Delightful micro-interactions that respond to user actions
                      </p>
                      <div className="mt-4 flex justify-center gap-2">
                        <Button className="animate-jello">Jello</Button>
                        <Button variant="outline" className="hover-bounce">Bounce</Button>
                      </div>
                    </CardContent>
                  </Card>
                </Magnetic>
              </div>
            </StaggeredPageContent>
          </div>
        </section>
        
        {/* Demo Section */}
        <section className="py-24 px-6 bg-gradient-secondary animated-gradient">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
                Interactive Demos <span className="text-yellow-300">🎮</span>
              </h2>
              <p className="text-xl text-white/80 max-w-2xl mx-auto">
                Explore our interactive demos showcasing various visual enhancements
              </p>
            </div>
            
            <Tabs defaultValue="cursor" className="w-full">
              <TabsList className="grid grid-cols-3 max-w-xl mx-auto mb-8">
                <TabsTrigger value="cursor">Cursor Effects</TabsTrigger>
                <TabsTrigger value="hover">Hover Effects</TabsTrigger>
                <TabsTrigger value="dark">Dark Mode</TabsTrigger>
              </TabsList>
              
              <TabsContent value="cursor">
                <CursorHighlight className="p-8 rounded-2xl bg-surface-1/80 border border-white/10 backdrop-blur-sm max-w-4xl mx-auto">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold mb-4">Cursor Highlight Demo</h3>
                    <p className="text-content-secondary mb-6">
                      Move your cursor around this box to see the highlight effect.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {["Primary", "Secondary", "Accent"].map((text, i) => (
                        <Magnetic key={i} strength={20}>
                          <Button className="w-full py-8 text-lg">
                            {text} Button
                          </Button>
                        </Magnetic>
                      ))}
                    </div>
                    
                    <div className="mt-8">
                      <p className="text-lg font-medium mb-2">Try different cursor effects:</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {['none', 'default', 'glow', 'trail', 'spotlight', 'emoji'].map((effect) => (
                          <Button
                            key={effect}
                            variant={cursorEffect === effect ? "default" : "outline"}
                            onClick={() => setCursorEffect(effect as any)}
                            className="capitalize"
                          >
                            {effect}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </CursorHighlight>
              </TabsContent>
              
              <TabsContent value="hover">
                <div className="p-8 rounded-2xl bg-surface-1/80 border border-white/10 backdrop-blur-sm max-w-4xl mx-auto">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold mb-4">Hover Effects</h3>
                    <p className="text-content-secondary mb-8">
                      Hover over these elements to see the various hover animations.
                    </p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Card className="hover-scale bg-gradient-surface-1 border-white/10">
                        <CardContent className="p-6 text-center">
                          <p className="font-medium">Scale</p>
                        </CardContent>
                      </Card>
                      
                      <Card className="hover-lift bg-gradient-surface-1 border-white/10">
                        <CardContent className="p-6 text-center">
                          <p className="font-medium">Lift</p>
                        </CardContent>
                      </Card>
                      
                      <Card className="hover-glow bg-gradient-surface-1 border-white/10">
                        <CardContent className="p-6 text-center">
                          <p className="font-medium">Glow</p>
                        </CardContent>
                      </Card>
                      
                      <Card className="hover-rotate bg-gradient-surface-1 border-white/10">
                        <CardContent className="p-6 text-center">
                          <p className="font-medium">Rotate</p>
                        </CardContent>
                      </Card>
                      
                      <Card className="hover-sheen bg-gradient-surface-1 border-white/10">
                        <CardContent className="p-6 text-center">
                          <p className="font-medium">Sheen</p>
                        </CardContent>
                      </Card>
                      
                      <Card className="hover-bounce bg-gradient-surface-1 border-white/10">
                        <CardContent className="p-6 text-center">
                          <p className="font-medium">Bounce</p>
                        </CardContent>
                      </Card>
                      
                      <Card className="hover-jello bg-gradient-surface-1 border-white/10">
                        <CardContent className="p-6 text-center">
                          <p className="font-medium">Jello</p>
                        </CardContent>
                      </Card>
                      
                      <Card className="hover-wobble bg-gradient-surface-1 border-white/10">
                        <CardContent className="p-6 text-center">
                          <p className="font-medium">Wobble</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="dark">
                <div className="p-8 rounded-2xl bg-surface-1/80 border border-white/10 backdrop-blur-sm max-w-4xl mx-auto">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold mb-4">Theme Toggle</h3>
                    <p className="text-content-secondary mb-8">
                      Test the different theme toggle styles and animations.
                    </p>
                    
                    <div className="flex flex-col items-center gap-8">
                      <div className="flex flex-col items-center gap-2">
                        <p className="font-medium">Standard Toggle</p>
                        <ThemeToggleAnimated />
                      </div>
                      
                      <div className="flex flex-col items-center gap-2">
                        <p className="font-medium">With Label</p>
                        <ThemeToggleWithLabel />
                      </div>
                      
                      <div className="flex flex-col items-center gap-2">
                        <p className="font-medium">Size Variants</p>
                        <div className="flex items-center gap-4">
                          <ThemeToggleAnimated size="sm" />
                          <ThemeToggleAnimated size="md" />
                          <ThemeToggleAnimated size="lg" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
        
        {/* Navigation Links */}
        <section className="py-16 text-center">
          <h2 className="text-3xl font-bold mb-8">Explore More</h2>
          <div className="flex flex-wrap gap-4 justify-center">
            <Magnetic>
              <Button size="lg" className="bg-gradient-primary hover:shadow-glow-primary" asChild>
                <Link href="/design-system">
                  Design System
                </Link>
              </Button>
            </Magnetic>
            <Magnetic>
              <Button size="lg" variant="outline" className="border-white/20" asChild>
                <Link href="/">
                  Home Page
                </Link>
              </Button>
            </Magnetic>
          </div>
        </section>
      </div>
    </CursorEffects>
  )
}