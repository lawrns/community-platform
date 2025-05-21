import React from 'react';
import { cn } from '@/lib/utils';
import { motion, MotionProps, useReducedMotion } from 'framer-motion';
import { popLift } from '@/lib/motion';

interface MotionCardProps extends React.HTMLAttributes<HTMLDivElement>, MotionProps {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
  glass?: boolean;
  borderGradient?: boolean;
  gradient?: string;
}

export const MotionCard = React.forwardRef<HTMLDivElement, MotionCardProps>(
  ({ 
    children, 
    className = '',
    interactive = false,
    glass = false,
    borderGradient = false,
    gradient = 'from-brand-500/20 to-brand-700/20',
    ...props
  }, ref) => {
    const prefersReducedMotion = useReducedMotion();
    
    const nonMotionProps = { ...props };
    // Extract framer-motion specific props
    const motionSpecificProps = Object.keys(nonMotionProps).filter(
      key => ['initial', 'animate', 'exit', 'transition', 'variants', 'whileHover', 'whileTap', 'whileFocus', 'whileInView'].includes(key)
    );
    motionSpecificProps.forEach(key => {
      delete nonMotionProps[key];
    });

    const hoverAnimations = interactive && !prefersReducedMotion ? {
      whileHover: { y: -4, scale: 1.02, boxShadow: 'var(--shadow-xl)' },
      whileTap: { scale: 0.98 },
      transition: { 
        duration: 0.2, 
        ease: [0.22, 1, 0.36, 1]
      },
    } : {};

    return borderGradient ? (
      <div className="p-[1px] rounded-l bg-gradient-to-br dark:from-brand-600/20 dark:to-brand-800/20 from-brand-500/30 to-brand-700/30 relative">
        <motion.div 
          ref={ref}
          className={cn(
            'relative rounded-[calc(var(--radius-l)-1px)] h-full w-full overflow-hidden',
            glass ? 'bg-white/10 backdrop-blur-lg dark:bg-black/10' : 'bg-bg-surface dark:bg-bg-1',
            className
          )}
          {...hoverAnimations}
          {...props}
        >
          {children}
        </motion.div>
      </div>
    ) : (
      <motion.div 
        ref={ref}
        className={cn(
          'relative rounded-l overflow-hidden border border-neutral-200/50 dark:border-neutral-800/50',
          glass ? 'bg-white/10 backdrop-blur-lg dark:bg-black/10' : 'bg-bg-surface dark:bg-bg-1',
          className
        )}
        {...hoverAnimations}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

MotionCard.displayName = "MotionCard";

interface MotionCardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const MotionCardHeader = React.forwardRef<HTMLDivElement, MotionCardHeaderProps>(
  ({ 
    children, 
    className = '',
    ...props
  }, ref) => {
    return (
      <div 
        ref={ref}
        className={cn('p-6', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

MotionCardHeader.displayName = "MotionCardHeader";

interface MotionCardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const MotionCardContent = React.forwardRef<HTMLDivElement, MotionCardContentProps>(
  ({ 
    children, 
    className = '',
    ...props
  }, ref) => {
    return (
      <div 
        ref={ref}
        className={cn('px-6 py-4', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

MotionCardContent.displayName = "MotionCardContent";

interface MotionCardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const MotionCardFooter = React.forwardRef<HTMLDivElement, MotionCardFooterProps>(
  ({ 
    children, 
    className = '',
    ...props
  }, ref) => {
    return (
      <div 
        ref={ref}
        className={cn('p-6 pt-0 flex items-center', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

MotionCardFooter.displayName = "MotionCardFooter";

interface MotionCardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export const MotionCardTitle = React.forwardRef<HTMLHeadingElement, MotionCardTitleProps>(
  ({ 
    children, 
    className = '',
    ...props
  }, ref) => {
    return (
      <h3 
        ref={ref}
        className={cn('text-xl font-semibold tracking-tight', className)}
        {...props}
      >
        {children}
      </h3>
    );
  }
);

MotionCardTitle.displayName = "MotionCardTitle";

interface MotionCardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export const MotionCardDescription = React.forwardRef<HTMLParagraphElement, MotionCardDescriptionProps>(
  ({ 
    children, 
    className = '',
    ...props
  }, ref) => {
    return (
      <p 
        ref={ref}
        className={cn('text-neutral-500 dark:text-neutral-400 text-sm', className)}
        {...props}
      >
        {children}
      </p>
    );
  }
);

MotionCardDescription.displayName = "MotionCardDescription";

// Export a feature card component using MotionCard
interface FeatureCardProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description: string;
  className?: string;
  iconClassName?: string;
}

export const FeatureCard = React.forwardRef<HTMLDivElement, FeatureCardProps>(
  ({
    icon,
    title,
    description,
    className = '',
    iconClassName = '',
    ...props
  }, ref) => {
    return (
      <MotionCard
        ref={ref}
        className={cn('h-full', className)}
        interactive={true}
        {...props}
      >
        <MotionCardContent className="flex flex-col h-full">
          {icon && (
            <div className={cn(
              'w-14 h-14 rounded-xl flex items-center justify-center mb-6 bg-brand-fade/10 backdrop-blur-lg ring-1 ring-brand-fade border border-brand-fade/10 shadow-lg shadow-brand-500/5',
              iconClassName
            )}>
              {icon}
            </div>
          )}
          <MotionCardTitle className="text-gradient-purple-blue mb-3">
            {title}
          </MotionCardTitle>
          <MotionCardDescription>
            {description}
          </MotionCardDescription>
        </MotionCardContent>
      </MotionCard>
    );
  }
);

FeatureCard.displayName = "FeatureCard";