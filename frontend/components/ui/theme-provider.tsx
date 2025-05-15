"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

interface ExtendedThemeProviderProps extends ThemeProviderProps {
  storybookMode?: boolean;
}

export function ThemeProvider({ children, storybookMode = false, ...props }: ExtendedThemeProviderProps) {
  // In storybook mode, we only do simple class toggling without next-themes
  if (storybookMode) {
    return <>{children}</>
  }
  
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}