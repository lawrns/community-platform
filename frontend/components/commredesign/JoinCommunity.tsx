import React from 'react';
import { Button } from '../ui/button-upgraded';
import { Check, ChevronRight, Users } from 'lucide-react';
import { cn } from '../../lib/utils';
import { FeatureGrid } from './FeatureCard';
import { motion } from 'framer-motion';

interface FeatureItem {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface JoinCommunityProps {
  title: string;
  subtitle: string;
  features: FeatureItem[];
  primaryButtonText?: string;
  secondaryButtonText?: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
  className?: string;
}

const JoinCommunity: React.FC<JoinCommunityProps> = ({
  title,
  subtitle,
  features,
  primaryButtonText = "Join Now",
  secondaryButtonText = "Learn More",
  onPrimaryClick,
  onSecondaryClick,
  className,
}) => {
  // Transform features for the FeatureGrid
  const gridFeatures = features.map(feature => ({
    ...feature,
    iconClassName: "bg-green-500/20 border border-green-500/30",
    gradient: true,
    glass: true,
    tiltEffect: true,
  }));

  return (
    <section className={cn(
      "py-20 relative overflow-hidden",
      className
    )}>
      {/* Background Elements with Animation */}
      <div className="absolute inset-0 bg-gradient-purple-blue-diagonal opacity-95 z-0"></div>
      
      {/* Animated background elements */}
      <motion.div 
        className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuNSIgbnVtT2N0YXZlcz0iNSIgc3RpdGNoVGlsZXM9InN0aXRjaCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSI1MDAiIGhlaWdodD0iNTAwIiBmaWx0ZXI9InVybCgjbm9pc2UpIiBvcGFjaXR5PSIwLjE1Ii8+PC9zdmc+')] opacity-20 z-0"
        animate={{ 
          scale: [1, 1.05, 1],
          opacity: [0.1, 0.15, 0.1] 
        }}
        transition={{ 
          duration: 8, 
          repeat: Infinity,
          repeatType: "mirror" 
        }}
      />
      
      <motion.div 
        className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-white rounded-full opacity-10 filter blur-3xl"
        animate={{ 
          scale: [1, 1.2, 1],
          x: ['-50%', '-40%', '-50%'],
          opacity: [0.1, 0.15, 0.1]  
        }}
        transition={{ 
          duration: 15, 
          repeat: Infinity,
          repeatType: "mirror" 
        }}
      />
      
      <motion.div 
        className="absolute bottom-0 right-0 transform translate-y-1/2 translate-x-1/2 w-96 h-96 bg-white rounded-full opacity-10 filter blur-3xl"
        animate={{ 
          scale: [1, 1.3, 1],
          x: ['50%', '60%', '50%'],
          opacity: [0.1, 0.2, 0.1] 
        }}
        transition={{ 
          duration: 12, 
          repeat: Infinity,
          repeatType: "mirror",
          delay: 2 
        }}
      />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.175, 0.885, 0.32, 1.1] }}
        >
          <div className="inline-flex items-center justify-center mb-6 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
            <Users size={16} className="text-white mr-2" />
            <span className="text-white text-sm font-medium">Join 15,000+ Members</span>
          </div>
          
          <motion.h2 
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.175, 0.885, 0.32, 1.1] }}
          >
            {title}
          </motion.h2>
          
          <motion.p 
            className="mt-6 text-lg md:text-xl text-white/90 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.175, 0.885, 0.32, 1.1] }}
          >
            {subtitle}
          </motion.p>
          
          <motion.div 
            className="mt-12 md:mt-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.175, 0.885, 0.32, 1.1] }}
          >
            <FeatureGrid 
              features={gridFeatures}
              columns={3}
              glass={true}
              gradient={true}
              tiltEffect={true}
              className="text-left"
            />
          </motion.div>
          
          <motion.div 
            className="mt-12 md:mt-16 flex flex-col md:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: [0.175, 0.885, 0.32, 1.1] }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Button 
                variant="primary"
                size="lg" 
                onClick={onPrimaryClick}
                className="bg-white text-brand-primary hover:bg-gray-100 shadow-lg transition-all duration-300 hover:shadow-xl"
              >
                {primaryButtonText}
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Button 
                variant="outline" 
                size="lg"
                onClick={onSecondaryClick}
                className="border-white text-white hover:bg-white/20 backdrop-blur-sm transition-all duration-300"
                rightIcon={<ChevronRight size={18} />}
              >
                {secondaryButtonText}
              </Button>
            </motion.div>
          </motion.div>
          
          {/* Social proof */}
          <motion.div 
            className="mt-16 pt-8 border-t border-white/10 flex flex-wrap justify-center gap-4 text-white/70 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 border-2 border-white/20"></div>
                ))}
              </div>
              <span>Joined this week</span>
            </div>
            <div className="flex items-center gap-2">
              <Check size={16} className="text-green-400" />
              <span>Average response in 5 mins</span>
            </div>
            <div className="flex items-center gap-2">
              <Check size={16} className="text-green-400" />
              <span>24/7 community support</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default JoinCommunity;