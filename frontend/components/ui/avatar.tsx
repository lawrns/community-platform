"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full shadow-sm",
      className
    )}
    {...props}
  />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full object-cover", className)}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-surface-2 text-content-secondary",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

// Extended component that accepts initials directly
interface AvatarWithInitialsProps extends React.ComponentPropsWithoutRef<typeof Avatar> {
  initials?: string;
  src?: string;
  alt?: string;
}

const AvatarWithInitials = React.forwardRef<
  React.ElementRef<typeof Avatar>,
  AvatarWithInitialsProps
>(({ className, initials, src, alt, ...props }, ref) => (
  <Avatar ref={ref} className={className} {...props}>
    {src && <AvatarImage src={src} alt={alt || ''} />}
    <AvatarFallback>
      {initials || (alt ? alt.charAt(0).toUpperCase() : 'U')}
    </AvatarFallback>
  </Avatar>
));
AvatarWithInitials.displayName = "AvatarWithInitials";

export { Avatar, AvatarImage, AvatarFallback, AvatarWithInitials }