import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  glass?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ 
    children, 
    className = '',
    hoverable = false,
    glass = false,
    ...props
  }, ref) => {
    return (
      <div 
        ref={ref}
        className={cn(
          'bg-surface-1 rounded-xl border border-content-tertiary/10 overflow-hidden',
          glass && 'bg-surface-1/10 backdrop-blur-sm border-surface-1/20',
          hoverable && 'transition-all duration-300 hover:shadow-lg hover:-translate-y-1', 
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ 
    children, 
    className = '',
    ...props
  }, ref) => {
    return (
      <div 
        ref={ref}
        className={cn('p-5', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardHeader.displayName = "CardHeader";

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ 
    children, 
    className = '',
    ...props
  }, ref) => {
    return (
      <div 
        ref={ref}
        className={cn('px-5 py-3', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardContent.displayName = "CardContent";

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ 
    children, 
    className = '',
    ...props
  }, ref) => {
    return (
      <div 
        ref={ref}
        className={cn('p-5 pt-0', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = "CardFooter";

interface CardImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: 'video' | 'square' | 'auto';
}

export const CardImage = React.forwardRef<HTMLDivElement, CardImageProps>(
  ({ 
    src, 
    alt,
    className = '',
    aspectRatio = 'auto',
    ...props
  }, ref) => {
    const aspectRatioClasses = {
      video: 'aspect-video',
      square: 'aspect-square',
      auto: '',
    };

    return (
      <div 
        ref={ref}
        className={cn('w-full overflow-hidden', aspectRatioClasses[aspectRatio])}
        {...props}
      >
        <img 
          src={src} 
          alt={alt} 
          className={cn('w-full h-full object-cover', className)}
        />
      </div>
    );
  }
);

CardImage.displayName = "CardImage";

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
  gradient?: boolean;
  gradientType?: 'purple-blue' | 'blue-teal' | 'teal-purple' | 'purple-blue-teal';
}

export const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ 
    children, 
    className = '',
    gradient = false,
    gradientType = 'purple-blue',
    ...props
  }, ref) => {
    const gradientClasses = {
      'purple-blue': 'gradient-text-purple-blue',
      'blue-teal': 'gradient-text-blue-teal',
      'teal-purple': 'gradient-text-teal-purple',
      'purple-blue-teal': 'gradient-text-purple-blue-teal',
    };

    return (
      <h3 
        ref={ref}
        className={cn(
          'text-xl font-semibold',
          gradient && 'text-transparent bg-clip-text',
          gradient && gradientClasses[gradientType],
          className
        )}
        {...props}
      >
        {children}
      </h3>
    );
  }
);

CardTitle.displayName = "CardTitle";

interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ 
    children, 
    className = '',
    ...props
  }, ref) => {
    return (
      <p 
        ref={ref}
        className={cn('text-content-secondary text-sm', className)}
        {...props}
      >
        {children}
      </p>
    );
  }
);

CardDescription.displayName = "CardDescription";