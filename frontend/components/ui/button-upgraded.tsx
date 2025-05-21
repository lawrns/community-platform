import React from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    children, 
    variant = 'primary', 
    size = 'md', 
    isLoading = false, 
    leftIcon, 
    rightIcon, 
    fullWidth = false, 
    className = '',
    ...props 
  }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
    
    const variantClasses = {
      primary: 'bg-brand-primary text-content-onPrimary hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-brand-primary',
      secondary: 'bg-brand-secondary text-content-onPrimary hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-brand-secondary',
      outline: 'border border-border bg-transparent hover:bg-content-primary/5 active:bg-content-primary/10 text-content-primary focus-visible:ring-content-primary',
      ghost: 'bg-transparent hover:bg-content-primary/5 active:bg-content-primary/10 text-content-primary focus-visible:ring-content-primary',
      glass: 'bg-surface-1/10 backdrop-blur-sm border border-surface-1/20 text-content-primary hover:bg-surface-1/20 active:bg-surface-1/30 focus-visible:ring-brand-primary',
      gradient: 'bg-gradient-purple-blue text-content-onPrimary hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-brand-primary',
    };
    
    const sizeClasses = {
      sm: 'text-xs h-8 px-3',
      md: 'text-sm h-10 px-4',
      lg: 'text-base h-12 px-6',
    };
    
    const widthClass = fullWidth ? 'w-full' : '';
    
    return (
      <button
        ref={ref}
        className={cn(
          baseClasses, 
          variantClasses[variant], 
          sizeClasses[size], 
          widthClass,
          className
        )}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        
        {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };