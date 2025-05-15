"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ChevronRight, Home } from "lucide-react";
import { VisuallyHidden } from "@/components/a11y/VisuallyHidden";

type BreadcrumbItem = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

interface BreadcrumbNavProps {
  items?: BreadcrumbItem[];
  homeHref?: string;
  homeLabel?: string;
  className?: string;
  separator?: React.ReactNode;
  showHomeIcon?: boolean;
  dynamicItems?: Record<string, string>;
  maxItems?: number;
  /**
   * Show in mobile view
   */
  responsive?: boolean;
}

/**
 * A breadcrumb navigation component that can either use provided items
 * or automatically generate breadcrumbs from the current URL path
 */
export function BreadcrumbNav({
  items: providedItems,
  homeHref = "/",
  homeLabel = "Home",
  className,
  separator = <ChevronRight className="h-3 w-3 mx-2 shrink-0 opacity-50" />,
  showHomeIcon = true,
  dynamicItems,
  maxItems = 4,
  responsive = true,
}: BreadcrumbNavProps) {
  const pathname = usePathname();
  
  // Function to generate breadcrumb items from pathname
  const generateBreadcrumbItems = () => {
    if (providedItems) return providedItems;
    
    const pathSegments = pathname.split("/").filter(segment => segment);
    
    // Start with home 
    const generatedItems: BreadcrumbItem[] = [
      { label: homeLabel, href: homeHref, icon: showHomeIcon ? <Home className="h-4 w-4" /> : undefined }
    ];
    
    // Build up breadcrumb items from path segments
    let currentPath = "";
    
    pathSegments.forEach((segment) => {
      currentPath += `/${segment}`;
      
      // Check if this segment is dynamic and we have a label for it
      let label = segment;
      if (segment.startsWith("[") && segment.endsWith("]")) {
        const paramName = segment.slice(1, -1);
        if (dynamicItems && dynamicItems[paramName]) {
          label = dynamicItems[paramName];
        }
      } else {
        // Format normal segments as title case
        label = segment
          .split("-")
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
      }
      
      generatedItems.push({
        label,
        href: currentPath,
      });
    });
    
    return generatedItems;
  };
  
  // Get final breadcrumb items
  const items = generateBreadcrumbItems();
  
  // Limit the number of items shown if needed
  const limitedItems = items.length > maxItems
    ? [
        items[0],
        { label: "...", href: "#", icon: undefined },
        ...items.slice(-2)
      ]
    : items;
  
  if (items.length <= 1) return null;
  
  return (
    <nav 
      aria-label="Breadcrumb"
      className={cn(
        "flex items-center text-sm text-content-secondary",
        !responsive && "hidden sm:flex",
        className
      )}
    >
      <ol className="flex items-center flex-wrap">
        {limitedItems.map((item, index) => {
          const isLast = index === limitedItems.length - 1;
          
          return (
            <li 
              key={item.href}
              className={cn(
                "flex items-center",
                isLast ? "text-content-primary font-medium" : "text-content-secondary"
              )}
              aria-current={isLast ? "page" : undefined}
            >
              {index > 0 && (
                <span className="flex items-center" aria-hidden="true">
                  {separator}
                </span>
              )}
              
              {isLast ? (
                <span className="flex items-center">
                  {item.icon && (
                    <span className="mr-1">{item.icon}</span>
                  )}
                  <span>{item.label}</span>
                </span>
              ) : (
                <Link 
                  href={item.href}
                  className="flex items-center hover:text-content-primary hover:underline underline-offset-2"
                >
                  {item.icon && (
                    <span className="mr-1">{item.icon}</span>
                  )}
                  {item.label === "..." ? (
                    <span aria-hidden="true">{item.label}</span>
                  ) : (
                    <span>{item.label}</span>
                  )}
                  {item.label === "..." && (
                    <VisuallyHidden>More pages</VisuallyHidden>
                  )}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default BreadcrumbNav;