"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import MotionWrapper from '@/components/motion/MotionWrapper';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Users, Zap } from 'lucide-react';

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden py-20 md:py-32 lg:py-40 xl:py-48">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background">
          <motion.div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, rgba(var(--primary-rgb), 0.2) 0%, transparent 50%),
                              radial-gradient(circle at 75% 75%, rgba(var(--primary-rgb), 0.1) 0%, transparent 50%)`
            }}
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'linear',
            }}
          />
          
          {/* Floating decorative elements */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-primary/10"
              style={{
                width: Math.random() * 100 + 50,
                height: Math.random() * 100 + 50,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [Math.random() * 20 - 10, Math.random() * 20 - 10],
                x: [Math.random() * 20 - 10, Math.random() * 20 - 10],
                opacity: [0.1, 0.3],
              }}
              transition={{
                duration: 5 + Math.random() * 5,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
        
        <div className="container relative z-10 px-4 md:px-6">
          <div className="flex flex-col items-center space-y-8 text-center">
            {/* Staggered text animations */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              }}
              className="space-y-6"
            >
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
                }}
                className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary"
              >
                <Sparkles className="mr-1 h-3.5 w-3.5" />
                <span>The Future of AI Community</span>
              </motion.div>
              
              <motion.h1 
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
                }}
                className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70"
              >
                Where AI Innovators <br className="hidden md:inline" />
                Connect & Collaborate
              </motion.h1>
              
              <motion.p 
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
                }}
                className="mx-auto max-w-[800px] text-lg text-muted-foreground md:text-xl lg:text-2xl"
              >
                Community.io transforms how AI practitioners, researchers, and enthusiasts discover tools,
                share knowledge, and build connections in one intelligent, unified platform.
              </motion.p>
            </motion.div>
            
            {/* Enhanced CTA buttons with animations */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 sm:gap-6"
            >
              <Button size="lg" className="group relative overflow-hidden px-8 py-6 text-lg" asChild>
                <Link href="/signup">
                  <span className="relative z-10">Join Our Community</span>
                  <motion.span 
                    className="absolute inset-0 bg-primary/90"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  />
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="group px-8 py-6 text-lg border-primary/20 hover:bg-primary/5" asChild>
                <Link href="/tools">
                  <span>Explore AI Tools</span>
                  <motion.span 
                    className="ml-2 inline-block"
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    →
                  </motion.span>
                </Link>
              </Button>
            </motion.div>
            
            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="mt-8 flex items-center justify-center space-x-4 text-sm text-muted-foreground"
            >
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-8 w-8 rounded-full bg-primary/20 ring-2 ring-background" />
                ))}
              </div>
              <div className="flex items-center">
                <Users className="mr-1 h-4 w-4" />
                <span><strong>100,000+</strong> AI enthusiasts have joined</span>
              </div>
              <div className="hidden md:flex items-center">
                <Zap className="mr-1 h-4 w-4" />
                <span><strong>4.9/5</strong> average rating</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="relative w-full py-20 md:py-32 lg:py-40 overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-muted/30 dark:bg-muted/10">
          <svg
            className="absolute inset-0 h-full w-full opacity-20"
            xmlns="http://www.w3.org/2000/svg"
            width="100%"
            height="100%"
          >
            <defs>
              <pattern
                id="grid-pattern"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  strokeOpacity="0.1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-pattern)" />
          </svg>
        </div>
        
        <div className="container relative z-10 px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="space-y-2"
            >
              <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Powerful Features</h2>
              <p className="mx-auto max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                Everything you need to connect, collaborate, and thrive in the rapidly evolving AI ecosystem.
              </p>
            </motion.div>
          </div>
          
          {/* Feature cards with enhanced visuals and animations */}
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3 lg:gap-16">
            {/* Tool Directory Feature */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="group relative overflow-hidden rounded-2xl border border-primary/10 bg-background p-6 shadow-lg transition-all hover:shadow-xl dark:bg-muted/5 dark:hover:border-primary/30"
            >
              <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/10 transition-all group-hover:bg-primary/20" />
              
              <div className="relative z-10 flex flex-col items-start space-y-4">
                <div className="rounded-xl bg-primary/10 p-3 text-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <path d="M6.5 15H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-1.5" />
                    <path d="M12 22v-8" />
                    <path d="M5 9h14" />
                    <path d="M5.45 14.5 3 16l2.55 1.5" />
                    <path d="M18.5 14.5 21 16l-2.55 1.5" />
                  </svg>
                </div>
                <div className="space-y-2 text-left">
                  <h3 className="text-xl font-bold">Comprehensive Tool Directory</h3>
                  <p className="text-muted-foreground">
                    Discover, compare, and evaluate AI tools with detailed reviews, ratings, and real user experiences. 
                    Never miss the next game-changing AI solution.
                  </p>
                </div>
                <div className="pt-2">
                  <Link 
                    href="/tools" 
                    className="inline-flex items-center text-sm font-medium text-primary hover:underline"
                  >
                    Explore Tools
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
            
            {/* Q&A Platform Feature */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="group relative overflow-hidden rounded-2xl border border-primary/10 bg-background p-6 shadow-lg transition-all hover:shadow-xl dark:bg-muted/5 dark:hover:border-primary/30"
            >
              <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/10 transition-all group-hover:bg-primary/20" />
              
              <div className="relative z-10 flex flex-col items-start space-y-4">
                <div className="rounded-xl bg-primary/10 p-3 text-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="m16 10-4 4-2-2" />
                  </svg>
                </div>
                <div className="space-y-2 text-left">
                  <h3 className="text-xl font-bold">Expert Q&A Platform</h3>
                  <p className="text-muted-foreground">
                    Get precise answers from leading AI experts with our reputation-based system that 
                    rewards quality contributions and verified expertise.
                  </p>
                </div>
                <div className="pt-2">
                  <Link 
                    href="/q-and-a" 
                    className="inline-flex items-center text-sm font-medium text-primary hover:underline"
                  >
                    Ask a Question
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
            
            {/* Personalized Feed Feature */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="group relative overflow-hidden rounded-2xl border border-primary/10 bg-background p-6 shadow-lg transition-all hover:shadow-xl dark:bg-muted/5 dark:hover:border-primary/30"
            >
              <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/10 transition-all group-hover:bg-primary/20" />
              
              <div className="relative z-10 flex flex-col items-start space-y-4">
                <div className="rounded-xl bg-primary/10 p-3 text-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <path d="M5.5 20H8" />
                    <path d="M17 9h.01" />
                    <rect width="12" height="12" x="6" y="4" rx="2" />
                    <path d="M17 3v4" />
                    <path d="M16 20h-3" />
                    <path d="M18 12h.01" />
                    <path d="M6 12h.01" />
                    <path d="M12 3v4" />
                    <path d="M12 20v-4" />
                    <path d="M7 19a2 2 0 0 1-2-2" />
                    <path d="M17 19a2 2 0 0 0 2-2" />
                    <path d="M12 12v.01" />
                  </svg>
                </div>
                <div className="space-y-2 text-left">
                  <h3 className="text-xl font-bold">AI-Powered Content Feed</h3>
                  <p className="text-muted-foreground">
                    Experience a personalized content stream that adapts to your interests, expertise level, 
                    and learning goals with our advanced recommendation engine.
                  </p>
                </div>
                <div className="pt-2">
                  <Link 
                    href="/dashboard" 
                    className="inline-flex items-center text-sm font-medium text-primary hover:underline"
                  >
                    View Your Feed
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Additional features showcase */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-20 text-center"
          >
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-6 py-2 text-sm font-medium text-primary">
              <span>And many more features to explore</span>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="relative w-full py-24 md:py-32 lg:py-40 overflow-hidden">
        {/* Background gradient effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background">
          <motion.div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `radial-gradient(circle at 30% 70%, rgba(var(--primary-rgb), 0.2) 0%, transparent 50%),
                              radial-gradient(circle at 70% 30%, rgba(var(--primary-rgb), 0.15) 0%, transparent 50%)`
            }}
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'linear',
            }}
          />
        </div>
        
        {/* Animated shapes */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-primary/10"
              style={{
                width: 300 + i * 100,
                height: 300 + i * 100,
                left: `${20 + i * 25}%`,
                top: `${60 - i * 20}%`,
                opacity: 0.1 + i * 0.05,
              }}
              animate={{
                y: [0, -20, 0],
                x: [0, 10, 0],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 8 + i * 2,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
        
        <div className="container relative z-10 px-4 md:px-6">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-2xl border border-primary/20 bg-background/80 backdrop-blur-sm p-8 md:p-12 shadow-xl">
              <div className="flex flex-col items-center justify-center space-y-8 text-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                      Join Our Thriving AI Community
                    </h2>
                    <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed">
                      Connect with over 100,000 AI practitioners, researchers, and enthusiasts. Share knowledge, 
                      discover opportunities, and stay at the forefront of AI innovation.
                    </p>
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="w-full max-w-md space-y-4"
                >
                  <div className="grid gap-4">
                    <Button 
                      size="lg" 
                      className="group relative overflow-hidden px-8 py-6 text-lg font-medium transition-all hover:shadow-lg" 
                      asChild
                    >
                      <Link href="/signup">
                        <motion.span 
                          className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80"
                          initial={{ x: '-100%' }}
                          whileHover={{ x: 0 }}
                          transition={{ duration: 0.4 }}
                        />
                        <span className="relative z-10 flex items-center justify-center">
                          Create Your Account
                          <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </span>
                      </Link>
                    </Button>
                    
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-muted"></div>
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or</span>
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="border-primary/20 hover:bg-primary/5 text-lg py-6" 
                      asChild
                    >
                      <Link href="/signin">
                        Sign In to Your Account
                      </Link>
                    </Button>
                  </div>
                  
                  <p className="text-sm text-muted-foreground text-center">
                    By signing up, you agree to our <Link href="#" className="underline underline-offset-2 hover:text-primary">Terms of Service</Link> and <Link href="#" className="underline underline-offset-2 hover:text-primary">Privacy Policy</Link>.
                  </p>
                </motion.div>
                
                {/* Testimonial preview */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="mt-8 border-t border-muted pt-8 text-center"
                >
                  <div className="flex flex-col items-center space-y-2">
                    <div className="flex -space-x-2">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-8 w-8 rounded-full bg-primary/20 ring-2 ring-background" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">"Community.io has transformed how I stay updated with AI developments."</span> - and thousands more
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}