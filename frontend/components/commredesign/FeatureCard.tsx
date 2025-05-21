import React from 'react';
import { cn } from '../../lib/utils';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../ui/card-upgraded';
import Tilt from 'react-parallax-tilt';
import { motion } from 'framer-motion';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
  iconClassName?: string;
  glass?: boolean;
  gradient?: boolean;
  hoverEffect?: boolean;
  tiltEffect?: boolean;
  tiltMaxAngleX?: number;
  tiltMaxAngleY?: number;
  glareEnable?: boolean;
  glareMaxOpacity?: number;
  glareColor?: string;
  glarePosition?: 'all' | 'bottom' | 'top';
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  className,
  iconClassName,
  glass = false,
  gradient = true,
  hoverEffect = true,
  tiltEffect = true,
  tiltMaxAngleX = 10,
  tiltMaxAngleY = 10,
  glareEnable = true,
  glareMaxOpacity = 0.15,
  glareColor = "#ffffff",
  glarePosition = "all",
}) => {
  const cardContent = (
    <Card 
      className={cn(
        "p-6 h-full", 
        hoverEffect && "card-hoverable", 
        glass && "backdrop-blur-md bg-surface-1/30 border-surface-1/20",
        className
      )}
      glass={glass}
      hoverable={hoverEffect}
    >
      <motion.div 
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
        className={cn(
          "w-16 h-16 rounded-xl flex items-center justify-center mb-6",
          "bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20",
          "border border-brand-primary/10",
          "shadow-lg shadow-brand-primary/5",
          iconClassName
        )}
      >
        {icon}
      </motion.div>
      
      <CardTitle 
        gradient={gradient} 
        className="text-xl font-semibold mb-3"
        gradientType={gradient ? 'purple-blue' : undefined}
      >
        {title}
      </CardTitle>
      
      <CardDescription className="text-content-secondary text-base">
        {description}
      </CardDescription>
    </Card>
  );

  return tiltEffect ? (
    <Tilt
      className="h-full"
      tiltMaxAngleX={tiltMaxAngleX}
      tiltMaxAngleY={tiltMaxAngleY}
      perspective={1000}
      transitionSpeed={1000}
      scale={1.02}
      glareEnable={glareEnable}
      glareMaxOpacity={glareMaxOpacity}
      glareColor={glareColor}
      glarePosition={glarePosition}
      glareBorderRadius="12px"
    >
      {cardContent}
    </Tilt>
  ) : cardContent;
};

export default FeatureCard;

export const FeatureGrid: React.FC<{
  features: Array<Omit<FeatureCardProps, 'className'> & { id: string }>;
  columns?: 1 | 2 | 3 | 4;
  glass?: boolean;
  gradient?: boolean;
  tiltEffect?: boolean;
  className?: string;
}> = ({
  features,
  columns = 3,
  glass = true,
  gradient = true,
  tiltEffect = true,
  className,
}) => {
  const columnsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn(
      'grid gap-6',
      columnsClass[columns],
      className
    )}>
      {features.map((feature, index) => (
        <motion.div
          key={feature.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.5, 
            delay: index * 0.1,
            ease: [0.175, 0.885, 0.32, 1.1] 
          }}
          className="h-full"
        >
          <FeatureCard
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
            iconClassName={feature.iconClassName}
            glass={glass || feature.glass}
            gradient={gradient || feature.gradient}
            tiltEffect={tiltEffect}
            hoverEffect={feature.hoverEffect !== undefined ? feature.hoverEffect : true}
          />
        </motion.div>
      ))}
    </div>
  );
};