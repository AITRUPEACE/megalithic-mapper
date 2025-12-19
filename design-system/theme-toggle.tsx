/**
 * Theme Toggle Component
 * 
 * A ready-to-use button that toggles between light and dark themes.
 * 
 * Dependencies:
 * - next-themes
 * - lucide-react (for icons)
 * - The cn utility function
 * 
 * Usage:
 * <ThemeToggle />
 * <ThemeToggle className="custom-styles" />
 */

"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "./utils";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className={cn(
          "touch-target inline-flex items-center justify-center rounded-lg p-2",
          "transition-colors hover:bg-muted",
          className
        )}
        disabled
      >
        <span className="h-5 w-5" />
        <span className="sr-only">Toggle theme</span>
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={cn(
        "touch-target relative inline-flex items-center justify-center rounded-lg p-2",
        "transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
    >
      <Sun
        className={cn(
          "h-5 w-5 transition-all",
          theme === "dark" ? "rotate-90 scale-0" : "rotate-0 scale-100"
        )}
      />
      <Moon
        className={cn(
          "absolute h-5 w-5 transition-all",
          theme === "dark" ? "rotate-0 scale-100" : "-rotate-90 scale-0"
        )}
      />
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}

/**
 * Theme Toggle Dropdown
 * 
 * An extended version with explicit light/dark/system options.
 * Requires shadcn/ui DropdownMenu component.
 */
export function ThemeToggleDropdown({ className }: ThemeToggleProps) {
  const { setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className={cn("relative", className)}>
      {/* This is a simplified version - integrate with your dropdown component */}
      <div className="flex gap-1 rounded-lg bg-muted p-1">
        <button
          onClick={() => setTheme("light")}
          className="rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-background"
        >
          <Sun className="h-4 w-4" />
        </button>
        <button
          onClick={() => setTheme("dark")}
          className="rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-background"
        >
          <Moon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}












