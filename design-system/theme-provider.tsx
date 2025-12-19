/**
 * Theme Provider Component
 * 
 * Wraps the application to enable light/dark theme switching.
 * Uses next-themes for automatic theme detection and persistence.
 * 
 * Usage:
 * 1. npm install next-themes
 * 2. Import and wrap your app in layout.tsx:
 * 
 * import { ThemeProvider } from "@/providers/theme-provider";
 * 
 * <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
 *   {children}
 * </ThemeProvider>
 */

"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}












