/**
 * Centralized z-index scale for the application.
 * 
 * This ensures consistent layering across all components.
 * Always import from here instead of using arbitrary z-index values.
 * 
 * Scale:
 * - Base content: 0-10
 * - Map overlays (above Leaflet controls ~800-1000): 1000-1050
 * - Fixed navigation: 1100-1150
 * - Mobile nav: 1200
 * - Dropdowns/Popovers: 1300-1350
 * - Modals/Dialogs: 1400-1450
 * - Toast notifications: 1500
 * - Dev tools: 9000+
 */

export const Z_INDEX = {
  // Base layers (0-10)
  base: 0,
  mapTiles: 1,
  mapMarkers: 5,
  
  // Map floating elements (above Leaflet's ~800-1000)
  mapControls: 1010,
  mapFilters: 1020,
  mapEditors: 1030,
  floatingPanel: 1040,
  
  // Fixed navigation
  mobileDrawer: 1100,
  sidebar: 1110,
  topbar: 1120,
  
  // Mobile bottom nav
  mobileNav: 1200,
  
  // Dropdowns and popovers
  dropdown: 1300,
  popover: 1310,
  tooltip: 1320,
  
  // Modal layers
  modalBackdrop: 1400,
  modal: 1410,
  sheetBackdrop: 1400,
  sheet: 1410,
  
  // Notifications
  toast: 1500,
  
  // Dev tools (highest priority)
  devTools: 9000,
} as const;

// Tailwind class helpers - use these in className
export const zClass = {
  base: "z-0",
  mapTiles: "z-[1]",
  mapMarkers: "z-[5]",
  
  mapControls: "z-[1010]",
  mapFilters: "z-[1020]",
  mapEditors: "z-[1030]",
  floatingPanel: "z-[1040]",
  
  mobileDrawer: "z-[1100]",
  sidebar: "z-[1110]",
  topbar: "z-[1120]",
  
  mobileNav: "z-[1200]",
  
  dropdown: "z-[1300]",
  popover: "z-[1310]",
  tooltip: "z-[1320]",
  
  modalBackdrop: "z-[1400]",
  modal: "z-[1410]",
  sheetBackdrop: "z-[1400]",
  sheet: "z-[1410]",
  
  toast: "z-[1500]",
  
  devTools: "z-[9000]",
} as const;

export type ZIndexKey = keyof typeof Z_INDEX;

