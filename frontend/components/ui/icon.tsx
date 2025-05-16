"use client";

import React from 'react';
import { LucideProps, User, Settings, Home, Search, Bell, FileText, 
  MessageSquare, Heart, Star, Check, X, ChevronDown, ChevronUp, ChevronLeft, 
  ChevronRight, Plus, Minus, Edit, Trash, Calendar, Clock, Info, AlertTriangle, 
  AlertCircle, Terminal, Github, Twitter, Mail, ExternalLink, Bookmark, Share, 
  MoreHorizontal, Menu, Tool, Hash, UserPlus, TrendingUp, ArrowUpRight, 
  LayoutDashboard, Wrench, BellRing, TreePine, Flame, Users, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

// Map of icon names to Lucide icon components
const iconComponents = {
  // Navigation
  home: Home,
  search: Search, 
  notifications: Bell,
  settings: Settings,
  user: User,
  dashboard: LayoutDashboard,
  menu: Menu,
  externalLink: ExternalLink,
  
  // Content
  document: FileText,
  message: MessageSquare,
  calendar: Calendar,
  clock: Clock,
  bookmark: Bookmark,
  
  // Actions
  like: Heart,
  star: Star,
  check: Check,
  close: X,
  add: Plus,
  remove: Minus,
  edit: Edit,
  delete: Trash,
  share: Share,
  more: MoreHorizontal,
  
  // Directional
  chevronDown: ChevronDown,
  chevronUp: ChevronUp,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  
  // Status
  info: Info,
  warning: AlertTriangle,
  error: AlertCircle,
  
  // Service/Brand
  terminal: Terminal,
  github: Github,
  twitter: Twitter,
  mail: Mail,
  
  // Domain Specific 
  tool: Tool,
  wrench: Wrench,
  package: Package,
  topic: Hash,
  trending: TrendingUp,
  arrowUpRight: ArrowUpRight,
  follow: UserPlus,
  bellRing: BellRing,
  topic: TreePine,
  flame: Flame,
  users: Users
};

export type IconName = keyof typeof iconComponents;

// Icon size presets
const sizeMap = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32
};

export type IconSize = keyof typeof sizeMap | number;

export interface IconProps extends Omit<LucideProps, 'size'> {
  name: IconName;
  size?: IconSize;
  className?: string;
}

/**
 * Icon component - Provides a consistent interface for using icons across the application
 * 
 * @example
 * <Icon name="home" size="md" className="text-primary" />
 */
export const Icon = ({ 
  name, 
  size = "md", 
  className,
  ...props 
}: IconProps) => {
  const IconComponent = iconComponents[name];
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in icon system`);
    return null;
  }
  
  // Determine actual pixel size
  const pixelSize = typeof size === 'string' ? sizeMap[size] : size;
  
  return (
    <IconComponent 
      size={pixelSize}
      className={cn("inline-block", className)}
      {...props}
    />
  );
};

/**
 * IconButton component - Button with just an icon
 * 
 * @example
 * <IconButton 
 *   name="like" 
 *   size="md" 
 *   variant="ghost" 
 *   onClick={() => console.log('Liked!')}
 * />
 */
export interface IconButtonProps extends IconProps {
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  variant?: 'default' | 'ghost' | 'outline' | 'subtle';
  label?: string;
}

export const IconButton = ({
  name,
  size = "md",
  className,
  onClick,
  variant = 'default',
  label,
  ...props
}: IconButtonProps) => {
  // Styles based on variant
  const variantStyles = {
    default: "bg-surface-primary text-white hover:bg-surface-primary-hover",
    ghost: "bg-transparent hover:bg-surface-secondary text-foreground",
    outline: "border border-input bg-background hover:bg-surface-secondary",
    subtle: "bg-surface-secondary hover:bg-surface-secondary-hover text-foreground",
  };
  
  // Sizes for the button
  const buttonSizeMap = {
    xs: "h-6 w-6",
    sm: "h-8 w-8", 
    md: "h-9 w-9",
    lg: "h-10 w-10",
    xl: "h-12 w-12"
  };
  
  // Determine button size class
  const buttonSize = typeof size === 'string' ? buttonSizeMap[size] : `h-[${size+8}px] w-[${size+8}px]`;
  
  return (
    <button
      type="button"
      className={cn(
        "rounded-full flex items-center justify-center",
        variantStyles[variant],
        buttonSize,
        className
      )}
      onClick={onClick}
      aria-label={label || `${name} button`}
    >
      <Icon 
        name={name} 
        size={size}
        {...props} 
      />
    </button>
  );
};