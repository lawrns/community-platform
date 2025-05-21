import React from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

interface StatItemProps {
  value: string;
  label: string;
  gradientType?: 'purple-blue' | 'blue-teal' | 'teal-purple' | 'purple-blue-teal';
  className?: string;
  index?: number;
  glass?: boolean;
}

const StatItem: React.FC<StatItemProps> = ({ 
  value, 
  label, 
  gradientType = 'purple-blue',
  className,
  index = 0,
  glass = false
}) => {
  const gradientClasses = {
    'purple-blue': 'bg-gradient-to-r from-purple-600 to-blue-600',
    'blue-teal': 'bg-gradient-to-r from-blue-600 to-teal-500',
    'teal-purple': 'bg-gradient-to-r from-teal-500 to-purple-600',
    'purple-blue-teal': 'bg-gradient-to-r from-purple-600 via-blue-600 to-teal-500',
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        ease: [0.175, 0.885, 0.32, 1.1]
      }}
      whileHover={{ scale: 1.05 }}
      className={cn(
        "text-center p-4 rounded-xl", 
        glass && "backdrop-blur-md bg-white/5 border border-white/10 shadow-lg",
        className
      )}
    >
      <motion.p 
        className={cn(
          "text-4xl font-bold text-transparent bg-clip-text",
          gradientClasses[gradientType]
        )}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          duration: 0.6, 
          delay: index * 0.15 + 0.2,
          ease: [0.175, 0.885, 0.32, 1.1]
        }}
      >
        {value}
      </motion.p>
      <motion.p 
        className="text-content-tertiary text-sm mt-2 font-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ 
          duration: 0.5, 
          delay: index * 0.15 + 0.3 
        }}
      >
        {label}
      </motion.p>
    </motion.div>
  );
};

interface StatsDisplayProps {
  stats: StatItemProps[];
  className?: string;
  layout?: 'row' | 'grid';
  columns?: 2 | 3 | 4;
  glass?: boolean;
  animate?: boolean;
}

const StatsDisplay: React.FC<StatsDisplayProps> = ({
  stats,
  className,
  layout = 'row',
  columns = 4,
  glass = true,
  animate = true
}) => {
  if (layout === 'row') {
    return (
      <div className={cn(
        "flex flex-wrap justify-center gap-8",
        className
      )}>
        {stats.map((stat, index) => (
          <StatItem
            key={index}
            value={stat.value}
            label={stat.label}
            gradientType={stat.gradientType}
            index={index}
            glass={glass}
          />
        ))}
      </div>
    );
  }

  const columnsClass = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4',
  };

  return (
    <div className={cn(
      "grid gap-6",
      columnsClass[columns],
      className
    )}>
      {stats.map((stat, index) => (
        <StatItem
          key={index}
          value={stat.value}
          label={stat.label}
          gradientType={stat.gradientType}
          className="flex flex-col items-center"
          index={index}
          glass={glass}
        />
      ))}
    </div>
  );
};

export default StatsDisplay;