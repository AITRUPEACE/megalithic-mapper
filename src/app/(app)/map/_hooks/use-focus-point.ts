import { useMemo } from "react";
import type { DrawerSnapPoint } from "@/shared/ui/mobile-drawer";

interface FocusPointResult {
  /** Focus point Y position as percentage from top (0-100) */
  focusY: number;
  /** Focus point Y position in pixels from top */
  focusYPixels: number;
  /** Focus point X position in pixels (always center of screen) */
  focusXPixels: number;
}

/**
 * Calculate the visual focus point based on drawer state.
 * 
 * The focus point is where the user's attention naturally falls on the map.
 * When the drawer is open, it covers part of the screen, so the focus point
 * shifts UP to remain in the center of the visible map area.
 * 
 * @param drawerSnapPercent - Current drawer snap point as percentage of viewport height (e.g., 25, 55, 92)
 * @param viewportHeight - Optional viewport height override (defaults to window.innerHeight)
 * @param viewportWidth - Optional viewport width override (defaults to window.innerWidth)
 * @returns Focus point position in both percentage and pixels
 * 
 * @example
 * // Drawer at PEEK (25%): visible area = 75%, focus at 37.5% from top
 * // Drawer at HALF (55%): visible area = 45%, focus at 22.5% from top
 * // Drawer at FULL (92%): visible area = 8%, focus at 4% from top
 */
export function useFocusPoint(
  drawerSnapPercent: DrawerSnapPoint,
  viewportHeight?: number,
  viewportWidth?: number
): FocusPointResult {
  return useMemo(() => {
    // Get viewport dimensions (handle SSR)
    const vh = viewportHeight ?? (typeof window !== "undefined" ? window.innerHeight : 800);
    const vw = viewportWidth ?? (typeof window !== "undefined" ? window.innerWidth : 400);

    // Calculate visible map area (what's not covered by drawer)
    // Drawer covers drawerSnapPercent% from the bottom
    const visibleAreaPercent = 100 - drawerSnapPercent;

    // Focus point is at the center of the visible area
    // Since visible area starts at top (0%) and ends at (100 - drawerSnapPercent)%,
    // the center is at (100 - drawerSnapPercent) / 2
    const focusY = visibleAreaPercent / 2;

    // Convert to pixels
    const focusYPixels = (focusY / 100) * vh;
    const focusXPixels = vw / 2;

    return {
      focusY,
      focusYPixels,
      focusXPixels,
    };
  }, [drawerSnapPercent, viewportHeight, viewportWidth]);
}

/**
 * Calculate distance between two points in pixels.
 * Used for determining if a marker is "close enough" to the focus point.
 */
export function getPixelDistance(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

/** Default threshold in pixels for showing the tooltip */
export const FOCUS_THRESHOLD_PX = 60;
