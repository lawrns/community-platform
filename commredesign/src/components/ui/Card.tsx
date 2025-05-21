import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '',
  hoverable = false,
}) => {
  return (
    <div 
      className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${hoverable ? 'transition-transform duration-300 hover:shadow-md hover:-translate-y-1' : ''} ${className}`}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ 
  children, 
  className = '',
}) => {
  return (
    <div className={`p-5 ${className}`}>
      {children}
    </div>
  );
};

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ 
  children, 
  className = '',
}) => {
  return (
    <div className={`px-5 py-3 ${className}`}>
      {children}
    </div>
  );
};

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({ 
  children, 
  className = '',
}) => {
  return (
    <div className={`p-5 pt-0 ${className}`}>
      {children}
    </div>
  );
};

interface CardImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: 'video' | 'square' | 'auto';
}

export const CardImage: React.FC<CardImageProps> = ({ 
  src, 
  alt,
  className = '',
  aspectRatio = 'auto',
}) => {
  const aspectRatioClasses = {
    video: 'aspect-video',
    square: 'aspect-square',
    auto: '',
  };

  return (
    <div className={`w-full overflow-hidden ${aspectRatioClasses[aspectRatio]}`}>
      <img 
        src={src} 
        alt={alt} 
        className={`w-full h-full object-cover ${className}`}
      />
    </div>
  );
};