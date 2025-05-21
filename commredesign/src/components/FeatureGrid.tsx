import React, { useRef } from 'react';
import TiltCard from './ui/TiltCard';
import { motion, useInView } from 'framer-motion';
import { Sparkles, Wrench, MessagesSquare, Hash, Users, Brain, ShieldCheck, ArrowRight } from 'lucide-react';

interface FeatureProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
  iconGradient: string;
  link: string;
  linkText: string;
  delay: number;
}

const Feature: React.FC<FeatureProps> = ({ 
  title, 
  description, 
  icon, 
  iconBg, 
  iconGradient, 
  link, 
  linkText, 
  delay 
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, delay: delay * 0.1 }}
    >
      <TiltCard 
        className="h-full tilt-card-override glow-effect"
        glareColor="rgba(100, 200, 255, 0.15)"
      >
        <div className="flex flex-col h-full">
          <div className={`w-12 h-12 rounded-xl ${iconGradient} flex items-center justify-center shadow-lg mb-5`}>
            {icon}
          </div>
          <h3 className="text-xl font-semibold mb-3 text-white">{title}</h3>
          <p className="text-gray-300 flex-grow text-sm mb-4">{description}</p>
          <motion.div 
            className="mt-auto"
            whileHover={{ x: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <a href={link} className="inline-flex items-center text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors">
              {linkText} <ArrowRight className="ml-1 h-4 w-4" />
            </a>
          </motion.div>
        </div>
      </TiltCard>
    </motion.div>
  );
};

const features = [
  {
    title: "Comprehensive Tool Directory",
    description: "Discover, compare, and evaluate AI tools with detailed reviews and real user insights.",
    icon: <Wrench className="h-6 w-6 text-white" />,
    iconBg: "bg-teal-100",
    iconGradient: "bg-gradient-to-br from-emerald-500 to-teal-600",
    link: "#tools",
    linkText: "Explore Tools",
    delay: 0
  },
  {
    title: "Expert Q&A Platform",
    description: "Get precise answers from AI experts, with reputation-based rewards for quality contributions.",
    icon: <MessagesSquare className="h-6 w-6 text-white" />,
    iconBg: "bg-amber-100",
    iconGradient: "bg-gradient-to-br from-amber-500 to-orange-600",
    link: "#q-and-a",
    linkText: "Ask a Question",
    delay: 1
  },
  {
    title: "Personalized Content Feed",
    description: "Stay informed with a feed tailored to your interests—articles, posts, and updates you care about.",
    icon: <Hash className="h-6 w-6 text-white" />,
    iconBg: "bg-blue-100",
    iconGradient: "bg-gradient-to-br from-sky-500 to-blue-600",
    link: "#feed",
    linkText: "View Your Feed",
    delay: 2
  },
  {
    title: "AI Learning Path",
    description: "Structured learning resources to help you master AI concepts and develop practical skills.",
    icon: <Brain className="h-6 w-6 text-white" />,
    iconBg: "bg-indigo-100",
    iconGradient: "bg-gradient-to-br from-fuchsia-500 to-purple-600",
    link: "#learning",
    linkText: "Start Learning",
    delay: 3
  },
  {
    title: "Inclusive Community",
    description: "Connect with AI enthusiasts of all skill levels for mentoring, networking, and knowledge sharing.",
    icon: <Users className="h-6 w-6 text-white" />,
    iconBg: "bg-purple-100", 
    iconGradient: "bg-gradient-to-br from-blue-500 to-indigo-600",
    link: "#community",
    linkText: "Join Discussions",
    delay: 4
  },
  {
    title: "Security & Privacy",
    description: "Your data is protected with state-of-the-art security and privacy-first design principles.",
    icon: <ShieldCheck className="h-6 w-6 text-white" />,
    iconBg: "bg-rose-100",
    iconGradient: "bg-gradient-to-br from-rose-500 to-red-600",
    link: "#security",
    linkText: "Learn More",
    delay: 5
  }
];

const FeatureGrid: React.FC = () => {
  // Animation variants for container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      }
    }
  };

  return (
    <section id="features" className="py-20 bg-gradient-to-b from-gray-900 to-gray-950 relative">
      {/* Add noise texture overlay */}
      <div className="absolute inset-0 noise-bg"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 space-y-4">
          <motion.div 
            className="inline-block p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Sparkles className="h-5 w-5 text-white" />
          </motion.div>
          <motion.h2 
            className="text-3xl sm:text-4xl font-bold text-white"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Powerful Features for a <span className="gradient-text">Thriving Community</span>
          </motion.h2>
          <motion.p 
            className="text-gray-300 max-w-2xl mx-auto text-lg"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Our platform combines cutting-edge technology with thoughtful design to create the perfect environment for community growth.
          </motion.p>
        </div>
        
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feature, index) => (
            <Feature key={index} {...feature} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeatureGrid;