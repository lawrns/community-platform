// Type declarations for UI components
declare module '@/components/ui/card' {
  export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>>;
  export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>>;
  export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>>;
}

declare module '@/components/ui/avatar' {
  export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
    src?: string;
    alt?: string;
  }
  export const Avatar: React.FC<AvatarProps>;
  export const AvatarImage: React.FC<React.ImgHTMLAttributes<HTMLImageElement>>;
  export const AvatarFallback: React.FC<React.HTMLAttributes<HTMLDivElement>>;
}

declare module '@/components/ui/badge' {
  export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  }
  export const Badge: React.FC<BadgeProps>;
}

declare module '@/components/ui/skeleton' {
  export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>>;
}

declare module '@/components/ui/progress' {
  export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
    value?: number;
    max?: number;
  }
  export const Progress: React.FC<ProgressProps>;
}

declare module '@/components/ui/tabs' {
  export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
    defaultValue?: string;
    value?: string;
    onValueChange?: (value: string) => void;
  }
  export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
    value: string;
  }
  export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    value: string;
  }
  export const Tabs: React.FC<TabsProps>;
  export const TabsList: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  export const TabsTrigger: React.FC<TabsTriggerProps>;
  export const TabsContent: React.FC<TabsContentProps>;
}

declare module 'react-intersection-observer' {
  export interface InViewHookResponse {
    ref: React.RefObject<any>;
    inView: boolean;
    entry?: IntersectionObserverEntry;
  }

  export interface InViewProps {
    as?: React.ElementType;
    children?: React.ReactNode;
    threshold?: number | number[];
    root?: Element | null;
    rootMargin?: string;
    triggerOnce?: boolean;
    skip?: boolean;
    trackVisibility?: boolean;
    delay?: number;
    initialInView?: boolean;
    onChange?: (inView: boolean, entry: IntersectionObserverEntry) => void;
  }

  export function useInView(options?: InViewProps): InViewHookResponse;
  export const InView: React.FC<InViewProps>;
}

declare module '@/components/ui/use-toast' {
  export interface ToastProps {
    title?: string;
    description?: string;
    action?: React.ReactNode;
    variant?: 'default' | 'destructive' | 'success';
    duration?: number;
  }

  export interface ToastActionElement extends React.ReactElement {}

  export const toast: {
    (props: ToastProps): void;
    dismiss: (toastId?: string) => void;
    error: (message: string, options?: Omit<ToastProps, 'title' | 'description' | 'variant'>) => void;
    success: (message: string, options?: Omit<ToastProps, 'title' | 'description' | 'variant'>) => void;
  };

  export function useToast(): {
    toast: typeof toast;
    dismiss: (toastId?: string) => void;
    toasts: ToastProps[];
  };
}

declare module '@/lib/hooks' {
  export function useNotifications(): {
    notifications: any[];
    unreadCount: number;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    fetchNotifications: () => Promise<void>;
    isLoading?: boolean;
  };
  
  export function useOnClickOutside<T extends HTMLElement = HTMLElement>(
    ref: React.RefObject<T>,
    handler: (event: MouseEvent | TouchEvent) => void
  ): void;
}

declare module '@/components/ui/select' {
  export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    defaultValue?: string;
    value?: string;
    onValueChange?: (value: string) => void;
  }
  
  export const Select: React.FC<SelectProps>;
  export const SelectGroup: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  export interface SelectValueProps extends React.HTMLAttributes<HTMLSpanElement> {
    placeholder?: string;
  }
  export const SelectValue: React.FC<SelectValueProps>;
  export const SelectTrigger: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>>;
  export const SelectContent: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  export const SelectLabel: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>>;
  export const SelectItem: React.FC<React.HTMLAttributes<HTMLDivElement> & { value: string }>;
  export const SelectSeparator: React.FC<React.HTMLAttributes<HTMLDivElement>>;
}
