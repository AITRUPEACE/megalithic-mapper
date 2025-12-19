# PRD: Mobile Drawer & Mobile UX Implementation

> **Purpose**: Comprehensive documentation of the mobile-first drawer system and mobile UX patterns from Megalithic Mapper for implementation in Event Horizon and future projects.

---

## Table of Contents

1. [Overview & Philosophy](#1-overview--philosophy)
2. [Architecture Decision: Vaul vs Framer Motion](#2-architecture-decision-vaul-vs-framer-motion)
3. [Bottom Drawer Implementation](#3-bottom-drawer-implementation)
4. [Mobile Header & Search](#4-mobile-header--search)
5. [Z-Index System](#5-z-index-system)
6. [Mobile Navigation](#6-mobile-navigation)
7. [Content Organization](#7-content-organization)
8. [Safe Area & Touch Targets](#8-safe-area--touch-targets)
9. [Implementation Checklist](#9-implementation-checklist)
10. [File Structure Reference](#10-file-structure-reference)

---

## 1. Overview & Philosophy

### 1.1 Design Principles

| Principle | Implementation |
|-----------|----------------|
| **Thumb-first** | All primary actions within thumb reach (bottom 40% of screen) |
| **Progressive disclosure** | Show essential info first, reveal details on demand |
| **Snap points** | Discrete, predictable states (peek → half → full) |
| **Non-modal** | Drawer doesn't block map interaction when in peek state |
| **Native feel** | Spring physics, haptic feedback, gesture-driven |

### 1.2 Key UX Improvements Over Legacy Implementations

| Legacy Pattern | Modern Pattern | Why It's Better |
|----------------|----------------|-----------------|
| Full-screen modals | Snapping bottom drawer | Maintains context, thumb-friendly |
| Fixed sidebars | Collapsible peek drawer | More map real estate on mobile |
| Top search bars | Floating search with dropdown | Faster access, better autocomplete |
| Page navigation | Tab switching within drawer | No page reloads, maintains state |
| Custom gesture code | Vaul library | Battle-tested, accessible, maintained |

---

## 2. Architecture Decision: Vaul vs Framer Motion

### 2.1 Two Approaches

We have **two drawer implementations** - choose based on your needs:

#### Option A: Vaul (Recommended for Production)

```bash
npm install vaul
```

**Pros:**
- Built-in snap points
- Accessibility baked in
- Handles edge cases (keyboard, screen readers)
- Smaller bundle for drawer-specific use
- Non-modal mode (doesn't trap focus)

**Best for:** Map apps, persistent drawers, production apps

#### Option B: Framer Motion (Custom Implementation)

```bash
npm install framer-motion
```

**Pros:**
- More control over animations
- Can integrate with other Framer Motion animations
- Works well for one-off custom drawers

**Best for:** Complex animations, prototype/experimental features

### 2.2 Recommendation

**Use Vaul for the main mobile drawer** - it handles snap points natively and is specifically designed for this pattern. Reserve Framer Motion for secondary animations or desktop-only drawers.

---

## 3. Bottom Drawer Implementation

### 3.1 Dependencies

```bash
npm install vaul @radix-ui/react-scroll-area
```

### 3.2 Snap Points Configuration

```typescript
// Snap points as percentages of viewport height (from bottom)
const SNAP_POINTS: (string | number)[] = [
  0.28,  // Peek: Header + preview thumbnails visible (~28%)
  0.55,  // Half: Comfortable reading/browsing (~55%)
  0.92,  // Full: Near full-screen for detailed content (~92%)
];
```

**Why these values:**
- `0.28` - Shows ~2 rows of thumbnails while keeping map visible
- `0.55` - Standard "half sheet" pattern from iOS/Android
- `0.92` - Leaves room for status bar, feels less claustrophobic than 100%

### 3.3 Drawer Wrapper Component

```tsx
// src/shared/ui/drawer.tsx
"use client";

import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";
import { cn } from "@/shared/lib/utils";

// Context to control overlay visibility
const DrawerOverlayContext = React.createContext(true);

type DrawerProps = React.ComponentProps<typeof DrawerPrimitive.Root> & {
  showOverlay?: boolean;
};

function Drawer({ showOverlay = true, ...props }: DrawerProps) {
  return (
    <DrawerOverlayContext.Provider value={showOverlay}>
      <DrawerPrimitive.Root data-slot="drawer" {...props} />
    </DrawerOverlayContext.Provider>
  );
}

function DrawerTrigger(props: React.ComponentProps<typeof DrawerPrimitive.Trigger>) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />;
}

function DrawerPortal(props: React.ComponentProps<typeof DrawerPrimitive.Portal>) {
  return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />;
}

function DrawerClose(props: React.ComponentProps<typeof DrawerPrimitive.Close>) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />;
}

function DrawerOverlay({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Overlay>) {
  const showOverlay = React.useContext(DrawerOverlayContext);
  if (!showOverlay) return null;
  
  return (
    <DrawerPrimitive.Overlay
      data-slot="drawer-overlay"
      className={cn(
        "fixed inset-0 z-[1200] bg-black/50",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className
      )}
      {...props}
    />
  );
}

function DrawerContent({ className, children, ...props }: React.ComponentProps<typeof DrawerPrimitive.Content>) {
  return (
    <DrawerPortal>
      <DrawerOverlay {...props} />
      <DrawerPrimitive.Content
        data-slot="drawer-content"
        className={cn(
          "group/drawer-content fixed z-[1201] flex flex-col bg-card shadow-lg",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:duration-300 data-[state=open]:duration-300",
          // Bottom drawer positioning
          "data-[vaul-drawer-direction=bottom]:inset-x-0",
          "data-[vaul-drawer-direction=bottom]:bottom-0",
          "data-[vaul-drawer-direction=bottom]:max-h-[95dvh]",
          "data-[vaul-drawer-direction=bottom]:w-full",
          "data-[vaul-drawer-direction=bottom]:rounded-t-[20px]",
          "data-[vaul-drawer-direction=bottom]:border-t",
          className
        )}
        {...props}
      >
        {/* Drag handle - automatic for bottom drawers */}
        <div className="bg-muted-foreground/40 mx-auto mt-3 mb-2 hidden h-1.5 w-12 shrink-0 rounded-full group-data-[vaul-drawer-direction=bottom]/drawer-content:block" />
        {children}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  );
}

function DrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-header"
      className={cn("flex flex-col gap-0.5 p-4", className)}
      {...props}
    />
  );
}

function DrawerFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  );
}

function DrawerTitle({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Title>) {
  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      className={cn("text-foreground font-semibold", className)}
      {...props}
    />
  );
}

function DrawerDescription({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Description>) {
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};
```

### 3.4 Usage: Non-Modal Persistent Drawer

```tsx
// Key: modal={false} and showOverlay={false} for non-blocking drawer
import { Drawer, DrawerContent, DrawerTitle } from "@/shared/ui/drawer";

const SNAP_POINTS: (string | number)[] = [0.28, 0.55, 0.92];

export function MobileExplorer() {
  const [drawerSnap, setDrawerSnap] = useState<number | string | null>(SNAP_POINTS[0]);
  const [selectedItem, setSelectedItem] = useState(null);

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden">
      {/* Your map or main content */}
      <div className="absolute inset-0">
        <MapComponent />
      </div>

      {/* Non-modal drawer - doesn't block map interaction */}
      <Drawer
        open={true}
        modal={false}              // Critical: allows interaction with content behind
        showOverlay={false}        // No backdrop overlay
        snapPoints={SNAP_POINTS}
        activeSnapPoint={drawerSnap}
        setActiveSnapPoint={setDrawerSnap}
        direction="bottom"
      >
        <DrawerContent className="max-h-[92dvh]">
          {/* Accessible title (can be visually hidden) */}
          <DrawerTitle className="sr-only">
            {selectedItem ? `Details: ${selectedItem.name}` : "Browse Items"}
          </DrawerTitle>

          {/* Custom header with tab switching */}
          <DrawerHeader />

          {/* Scrollable content */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              {/* Your content here */}
            </ScrollArea>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
```

### 3.5 Programmatic Snap Control

```tsx
// Expand drawer when item is selected
const handleSelectItem = useCallback((itemId: string) => {
  setSelectedItem(itemId);
  setDrawerSnap(SNAP_POINTS[1]); // Expand to half
}, []);

// Collapse to peek when item is deselected
const handleCloseDetail = useCallback(() => {
  setSelectedItem(null);
  // Optional: collapse to peek
  // setDrawerSnap(SNAP_POINTS[0]);
}, []);
```

---

## 4. Mobile Header & Search

### 4.1 Floating Search Bar with Dropdown

```tsx
// Top bar with floating controls over map
<div className={cn(
  "absolute top-0 left-0 right-0",
  "pt-safe px-3 pb-2",                              // Safe area padding
  "bg-gradient-to-b from-background/95 via-background/80 to-transparent", // Fade out
  "z-[1010]"                                         // Above map, below drawer
)}>
  <div className="flex items-center gap-2 mt-2">
    {/* View toggle (map/list) */}
    <div className="flex items-center bg-card rounded-full shadow-lg p-1">
      <button
        onClick={() => setViewMode("map")}
        className={cn(
          "p-2 rounded-full transition-all",
          viewMode === "map" 
            ? "bg-primary text-primary-foreground" 
            : "text-muted-foreground"
        )}
      >
        <MapIcon className="h-4 w-4" />
      </button>
      <button
        onClick={() => setViewMode("list")}
        className={cn(
          "p-2 rounded-full transition-all",
          viewMode === "list" 
            ? "bg-primary text-primary-foreground" 
            : "text-muted-foreground"
        )}
      >
        <List className="h-4 w-4" />
      </button>
    </div>

    {/* Search bar */}
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          setShowSearchDropdown(true);
        }}
        onFocus={() => setShowSearchDropdown(true)}
        placeholder="Search..."
        className="h-10 pl-10 pr-10 bg-card shadow-lg rounded-full text-sm border-border/50"
      />
      {searchQuery && (
        <Button
          size="icon"
          variant="ghost"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
          onClick={() => {
            setSearchQuery("");
            setShowSearchDropdown(false);
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      )}

      {/* Search results dropdown */}
      {showSearchDropdown && searchQuery && searchResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card rounded-xl shadow-xl border border-border/50 overflow-hidden z-50 max-h-[60vh] overflow-y-auto">
          {searchResults.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSearchSelect(item)}
              className="w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors flex items-center gap-3 border-b border-border/20 last:border-0"
            >
              <div className="h-9 w-9 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                <ItemIcon className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground truncate">{item.type}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>

    {/* Primary action button */}
    <Button size="icon" className="h-10 w-10 rounded-full bg-primary shadow-lg shrink-0">
      <Plus className="h-5 w-5" />
    </Button>
  </div>
</div>

{/* Tap to dismiss search dropdown */}
{showSearchDropdown && searchQuery && (
  <div 
    className="fixed inset-0 z-40" 
    onClick={() => setShowSearchDropdown(false)} 
  />
)}
```

### 4.2 Search Results with Memoization

```tsx
// Efficient search filtering
const searchResults = useMemo(() => {
  if (!searchQuery.trim()) return [];
  const query = searchQuery.toLowerCase();
  
  return items
    .filter((item) =>
      item.name.toLowerCase().includes(query) ||
      item.type.toLowerCase().includes(query) ||
      item.tags?.some((t) => t.toLowerCase().includes(query))
    )
    .slice(0, 8); // Limit for performance
}, [items, searchQuery]);
```

---

## 5. Z-Index System

### 5.1 Centralized Z-Index Scale

```typescript
// src/shared/lib/z-index.ts

/**
 * Centralized z-index scale for the application.
 * 
 * Scale:
 * - Base content: 0-10
 * - Map overlays (above Leaflet ~800-1000): 1000-1050
 * - Fixed navigation: 1100-1150
 * - Mobile nav: 1200
 * - Dropdowns/Popovers: 1300-1350
 * - Modals/Dialogs: 1400-1450
 * - Toast notifications: 1500
 * - Dev tools: 9000+
 */

export const Z_INDEX = {
  // Base layers
  base: 0,
  mapTiles: 1,
  mapMarkers: 5,
  
  // Map floating elements (above Leaflet)
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
  
  // Notifications
  toast: 1500,
  
  // Dev tools
  devTools: 9000,
} as const;

// Tailwind class helpers
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
  
  toast: "z-[1500]",
  
  devTools: "z-[9000]",
} as const;
```

### 5.2 Usage

```tsx
import { zClass } from "@/shared/lib/z-index";

// In components
<header className={cn("fixed top-0", zClass.topbar)}>
  {/* ... */}
</header>

<nav className={cn("fixed bottom-0", zClass.mobileNav)}>
  {/* ... */}
</nav>
```

---

## 6. Mobile Navigation

### 6.1 Bottom Navigation Bar

```tsx
// src/widgets/navigation/mobile-navbar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, Activity, Plus, MessageSquare, User } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { zClass } from "@/shared/lib/z-index";

const navItems = [
  { href: "/map", label: "Map", icon: Map },
  { href: "/activity", label: "Activity", icon: Activity },
  { href: "/contribute", label: "Add", icon: Plus, isAction: true },
  { href: "/forum", label: "Forum", icon: MessageSquare },
  { href: "/profile", label: "Profile", icon: User },
];

export const MobileNavbar = () => {
  const pathname = usePathname();

  // Hide on map page (has its own nav in drawer)
  if (pathname === "/map" || pathname.startsWith("/map/")) {
    return null;
  }

  return (
    <nav className={cn(
      "fixed bottom-0 left-0 right-0",
      "border-t border-border/40",
      "bg-card/95 backdrop-blur-lg",
      "pb-safe",  // Safe area for notched phones
      "md:hidden", // Mobile only
      zClass.mobileNav
    )}>
      <div className="flex items-center justify-around px-2 py-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

          // Floating action button (center)
          if (item.isAction) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center rounded-full bg-primary p-2.5 -mt-4 shadow-lg"
              >
                <Icon className="h-5 w-5 text-primary-foreground" />
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 py-2 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "fill-primary/20")} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
```

### 6.2 Drawer-Internal Tab Navigation

```tsx
// Tab switcher inside drawer header
<div className="flex items-center gap-1 p-0.5 bg-secondary/30 rounded-lg">
  <button
    onClick={() => setDrawerContent("items")}
    className={cn(
      "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
      drawerContent === "items"
        ? "bg-card text-foreground shadow-sm"
        : "text-muted-foreground"
    )}
  >
    <MapPin className="h-3.5 w-3.5" />
    Items
  </button>
  <button
    onClick={() => setDrawerContent("activity")}
    className={cn(
      "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
      drawerContent === "activity"
        ? "bg-card text-foreground shadow-sm"
        : "text-muted-foreground"
    )}
  >
    <Sparkles className="h-3.5 w-3.5" />
    Activity
  </button>
</div>
```

---

## 7. Content Organization

### 7.1 Swappable Content Pattern

```tsx
// Drawer content changes based on selection state
<div className="flex-1 overflow-hidden">
  {selectedItem ? (
    // Detail view
    <ScrollArea className="h-full">
      <ItemDetailCard 
        item={selectedItem} 
        onClose={handleCloseDetail} 
      />
    </ScrollArea>
  ) : drawerContent === "items" ? (
    // List view
    <ScrollArea className="h-full">
      <ItemGrid items={items} onSelect={handleSelectItem} />
    </ScrollArea>
  ) : (
    // Activity feed
    <ActivityFeed items={items} onFocusItem={handleFocusItem} />
  )}
</div>
```

### 7.2 Thumbnail Grid Component

```tsx
function ItemGrid({ items, onSelect }: { items: Item[]; onSelect: (id: string) => void }) {
  if (items.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No items found</p>
      </div>
    );
  }

  return (
    <div className="p-3 grid grid-cols-2 gap-3">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onSelect(item.id)}
          className="group relative bg-card rounded-xl overflow-hidden border border-border/40 hover:border-primary/40 transition-all text-left"
        >
          {/* Thumbnail */}
          <div className="aspect-[4/3] bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center relative">
            {item.thumbnailUrl ? (
              <img 
                src={item.thumbnailUrl} 
                alt={item.name} 
                className="w-full h-full object-cover" 
                loading="lazy" 
              />
            ) : (
              <MapPin className="h-8 w-8 text-muted-foreground/30" />
            )}
            
            {/* Status badge */}
            {item.verified && (
              <div className="absolute top-2 right-2 bg-primary/90 text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                ✓
              </div>
            )}
            
            {/* Media count */}
            {item.mediaCount > 0 && (
              <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-md flex items-center gap-1">
                <Image className="h-2.5 w-2.5" />
                {item.mediaCount}
              </div>
            )}
          </div>
          
          {/* Info */}
          <div className="p-2.5">
            <p className="font-medium text-xs truncate group-hover:text-primary transition-colors">
              {item.name}
            </p>
            <p className="text-[10px] text-muted-foreground truncate capitalize">
              {item.type}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}
```

### 7.3 Detail Card with Back Navigation

```tsx
function ItemDetailCard({ item, onClose, onFocus }) {
  return (
    <div className="p-4 space-y-4">
      {/* Header with actions */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold truncate">{item.name}</h2>
          <p className="text-sm text-muted-foreground capitalize">{item.type}</p>
        </div>
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" onClick={() => onFocus(item.id)}>
            <MapPin className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Status badges */}
      <div className="flex flex-wrap gap-2">
        <Badge variant={item.verified ? "default" : "secondary"}>
          {item.verified ? "Verified" : "Unverified"}
        </Badge>
        <Badge variant="outline">{item.category}</Badge>
      </div>

      {/* Description */}
      {item.description && (
        <p className="text-sm text-muted-foreground">{item.description}</p>
      )}

      {/* Tags */}
      {item.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {item.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <Button className="flex-1" size="sm">
          View Details
        </Button>
        <Button variant="outline" size="sm">
          Contribute
        </Button>
      </div>
    </div>
  );
}
```

---

## 8. Safe Area & Touch Targets

### 8.1 CSS for Mobile Safety

```css
/* Add to globals.css */

/* Safe area support for notched phones */
.pb-safe {
  padding-bottom: max(2rem, env(safe-area-inset-bottom));
}

.pt-safe {
  padding-top: max(1rem, env(safe-area-inset-top));
}

/* Smooth scrolling with momentum (iOS) */
.overscroll-contain {
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}

/* Prevent pull-to-refresh when drawer is open */
.no-pull-refresh {
  overscroll-behavior-y: contain;
}

/* Minimum touch target sizes (iOS HIG + Material Design) */
.touch-target {
  min-width: 44px;
  min-height: 44px;
}

/* Custom thin scrollbar */
.scrollbar-thin {
  scrollbar-width: thin;
  scrollbar-color: hsl(var(--muted)) transparent;
}

.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background: hsl(var(--muted));
  border-radius: 3px;
}

/* Backdrop blur support check */
@supports (backdrop-filter: blur(10px)) or (-webkit-backdrop-filter: blur(10px)) {
  .drawer-backdrop {
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }
}
```

### 8.2 Dynamic Viewport Height

```tsx
// Use dvh instead of vh for mobile
<div className="h-[100dvh]">  {/* Accounts for browser chrome */}
  {/* Content */}
</div>

// For drawer max-height
<DrawerContent className="max-h-[92dvh]">
  {/* Content */}
</DrawerContent>
```

---

## 9. Implementation Checklist

### 9.1 Dependencies

```bash
# Required
npm install vaul @radix-ui/react-scroll-area

# Optional (for custom animations)
npm install framer-motion
```

### 9.2 Files to Create

- [ ] `src/shared/lib/z-index.ts` - Z-index system
- [ ] `src/shared/ui/drawer.tsx` - Vaul drawer wrapper
- [ ] `src/shared/ui/scroll-area.tsx` - Radix scroll area
- [ ] `src/widgets/navigation/mobile-navbar.tsx` - Bottom nav
- [ ] CSS utilities in `globals.css`

### 9.3 Integration Steps

1. [ ] Set up z-index system
2. [ ] Create drawer component with snap points
3. [ ] Add safe area CSS utilities
4. [ ] Implement mobile header with search
5. [ ] Create thumbnail grid component
6. [ ] Create detail card component
7. [ ] Add mobile navbar (conditional on route)
8. [ ] Test on actual mobile device
9. [ ] Test with iOS notch simulation
10. [ ] Test gesture interactions

---

## 10. File Structure Reference

```
src/
├── shared/
│   ├── lib/
│   │   ├── utils.ts          # cn() and other utilities
│   │   └── z-index.ts        # Centralized z-index
│   └── ui/
│       ├── drawer.tsx        # Vaul wrapper
│       ├── scroll-area.tsx   # Radix scroll area
│       ├── button.tsx
│       ├── input.tsx
│       └── badge.tsx
├── widgets/
│   └── navigation/
│       ├── mobile-navbar.tsx # Bottom navigation
│       └── app-topbar.tsx    # Top bar (desktop + mobile)
├── app/
│   ├── globals.css           # Safe area, scrollbar styles
│   └── (app)/
│       └── map/
│           └── _components/
│               ├── mobile-site-explorer.tsx  # Main mobile view
│               ├── site-detail-card.tsx
│               └── site-grid.tsx
```

---

## Summary: Key Differences from Legacy

| Aspect | Legacy (Event Horizon) | Modern (Megalithic Mapper) |
|--------|------------------------|----------------------------|
| Drawer | Custom/none | Vaul with snap points |
| Search | Page-based | Floating with autocomplete |
| Navigation | Full page nav | Drawer tabs + conditional bottom nav |
| Z-index | Ad-hoc | Centralized system |
| Safe areas | Not handled | CSS env() support |
| Touch targets | Inconsistent | 44px minimum |
| Scroll | Native | Radix ScrollArea |
| Gestures | Custom | Native Vaul gestures |

---

*Last updated: December 2024*

