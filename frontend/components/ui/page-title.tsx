"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface PageTitleProps {
  title: string
  description?: string
  actions?: React.ReactNode
  className?: string
}

export function PageTitle({ title, description, actions, className }: PageTitleProps) {
  return (
    <div className={cn("flex flex-col md:flex-row md:items-center justify-between gap-4", className)}>
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex-shrink-0">{actions}</div>}
    </div>
  )
}