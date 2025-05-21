import React, { ReactNode } from 'react';
import Tilt from 'react-parallax-tilt';
import { motion } from 'framer-motion';

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
  iconBg?: string;
  glareColor?: string;
}

const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className = '',
  icon,
  iconBg = 'bg-purple-100',
  glareColor = 'rgba(100,200,255,0.3)'
}) => {
  return (
    <Tilt
      className={`bg-gray-800 rounded-xl shadow-lg border border-gray-700 overflow-hidden backdrop-blur-md ${className}`}
      tiltMaxAngleX={8}
      tiltMaxAngleY={8}
      glareEnable={true}
      glareMaxOpacity={0.2}
      glareColor={glareColor}
      glarePosition="all"
      glareBorderRadius="12px"
      scale={1.03}
      transitionSpeed={1500}
      tiltReverse={false}
    >
      <motion.div 
        className="p-6 h-full flex flex-col"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true, margin: "-50px" }}
      >
        {icon && (
          <div className={`inline-flex items-center justify-center p-3 ${iconBg} rounded-lg mb-4 w-12 h-12`}>
            {icon}
          </div>
        )}
        {children}
      </motion.div>
    </Tilt>
  );
};

export default TiltCard;