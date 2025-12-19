/**
 * Utility Functions for the Design System
 * 
 * Install dependencies:
 * npm install clsx tailwind-merge
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names with Tailwind merge support.
 * Handles conditional classes and deduplicates conflicting Tailwind utilities.
 * 
 * @example
 * cn("p-4", condition && "p-6", className)
 * // If condition is true, outputs "p-6" (not "p-4 p-6")
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}












