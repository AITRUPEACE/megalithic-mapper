# Progressive Detail Drawer Implementation Guide

> Implementing Citizen app's signature peek-expand drawer pattern for Megalithic Mapper

## Overview

The Progressive Detail Drawer is the core mobile UX pattern from Citizen app that makes map-based detail viewing feel natural and intuitive on mobile devices.

## The Pattern

```
┌─────────────────────────┐
│                         │
│         MAP VIEW        │  ← Always visible
│                         │
│     Selected POI ●      │
│                         │
├─────────────────────────┤  ← Drawer at 50% (PEEK)
│  ═══ Drag Handle ═══    │
│                         │
│   Site Name             │
│   Quick Info            │
│   [Scroll for more...]  │
└─────────────────────────┘

       ↓ User scrolls down

┌─────────────────────────┐
│     Selected POI ●      │  ← Map compressed to 10%
├─────────────────────────┤  ← Drawer at 90% (EXPANDED)
│                         │
│   Site Name             │
│   Quick Info            │
│                         │
│   Full Details...       │
│   Photos...             │
│   Comments...           │
│   Nearby Sites...       │
│                         │
└─────────────────────────┘
```

## Installation

First, install required dependencies:

```bash
npm install framer-motion @use-gesture/react
```

## Component Architecture

```
ProgressiveDetailDrawer.tsx
├── DrawerContainer        # Fixed positioning, z-index management
├── DragHandle            # Visual indicator + touch target
├── DrawerContent         # Scrollable content area
│   ├── QuickInfo        # Always visible header
│   └── DetailsTabs      # Tabs that appear on scroll
└── MapOverlay           # Dims map when expanded
```

## Implementation

### 1. Create the Component

```tsx
// src/components/map/progressive-detail-drawer.tsx

"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useAnimation, PanInfo } from "framer-motion";
import { X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MapSite } from "@/lib/types";
import { Button } from "@/components/ui/button";

interface ProgressiveDetailDrawerProps {
  site: MapSite | null;
  open: boolean;
  onClose: () => void;
  children?: React.ReactNode;
}

type DrawerState = "closed" | "peek" | "expanded";

const DRAWER_STATES = {
  closed: 0,
  peek: 50, // 50vh
  expanded: 90, // 90vh
};

export const ProgressiveDetailDrawer = ({
  site,
  open,
  onClose,
  children,
}: ProgressiveDetailDrawerProps) => {
  const [drawerState, setDrawerState] = useState<DrawerState>("closed");
  const [isDragging, setIsDragging] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();

  // When drawer opens, start in peek mode
  useEffect(() => {
    if (open && site) {
      setDrawerState("peek");
      controls.start({
        height: `${DRAWER_STATES.peek}vh`,
        transition: { type: "spring", damping: 30, stiffness: 300 },
      });
    } else {
      setDrawerState("closed");
      controls.start({
        height: 0,
        transition: { type: "spring", damping: 30, stiffness: 300 },
      });
    }
  }, [open, site, controls]);

  // Handle scroll to expand
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (drawerState !== "peek") return;

    const scrollTop = e.currentTarget.scrollTop;

    // Expand when user scrolls down past threshold
    if (scrollTop > 30) {
      setDrawerState("expanded");
      controls.start({
        height: `${DRAWER_STATES.expanded}vh`,
        transition: { type: "spring", damping: 30, stiffness: 300 },
      });
    }
  };

  // Handle drag gesture on handle
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    const { velocity, offset } = info;

    // Fast swipe down = close
    if (velocity.y > 500) {
      handleClose();
      return;
    }

    // Dragged down significantly = close or collapse
    if (offset.y > 100) {
      if (drawerState === "expanded") {
        setDrawerState("peek");
        controls.start({
          height: `${DRAWER_STATES.peek}vh`,
          transition: { type: "spring", damping: 30, stiffness: 300 },
        });
      } else {
        handleClose();
      }
      return;
    }

    // Dragged up = expand
    if (offset.y < -100 && drawerState === "peek") {
      setDrawerState("expanded");
      controls.start({
        height: `${DRAWER_STATES.expanded}vh`,
        transition: { type: "spring", damping: 30, stiffness: 300 },
      });
    }
  };

  const handleClose = () => {
    setDrawerState("closed");
    controls.start({
      height: 0,
      transition: { type: "spring", damping: 30, stiffness: 300 },
    }).then(() => {
      if (contentRef.current) {
        contentRef.current.scrollTop = 0;
      }
      onClose();
    });
  };

  // Handle back button on Android
  useEffect(() => {
    if (!open) return;

    const handlePopState = () => {
      handleClose();
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [open]);

  if (!site) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className={cn(
          "fixed inset-0 z-[450] bg-black/20 backdrop-blur-sm",
          "md:hidden" // Only on mobile
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: open ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        onClick={handleClose}
        style={{ pointerEvents: open ? "auto" : "none" }}
      />

      {/* Drawer */}
      <motion.div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-[460]",
          "bg-background/98 backdrop-blur-xl",
          "rounded-t-3xl shadow-2xl",
          "border-t border-l border-r border-border/40",
          "md:hidden", // Only on mobile
          isDragging && "cursor-grabbing"
        )}
        initial={{ height: 0 }}
        animate={controls}
        style={{
          touchAction: "none", // Prevent scrolling while dragging
        }}
      >
        {/* Drag Handle Area */}
        <motion.div
          className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm"
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.2}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={handleDragEnd}
        >
          {/* Visual drag handle */}
          <div className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
            <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
          </div>

          {/* Header with close button */}
          <div className="flex items-center justify-between px-4 pb-3">
            <div className="flex items-center gap-2">
              <ChevronDown 
                className={cn(
                  "h-5 w-5 text-muted-foreground transition-transform",
                  drawerState === "expanded" && "rotate-180"
                )} 
              />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {drawerState === "peek" ? "Scroll for more" : "Swipe down to collapse"}
              </span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>

        {/* Scrollable Content */}
        <div
          ref={contentRef}
          className="h-full overflow-y-auto overscroll-contain pb-safe"
          onScroll={handleScroll}
        >
          <div className="px-4 pb-8">
            {children}
          </div>
        </div>

        {/* Scroll indicator - only in peek mode */}
        {drawerState === "peek" && (
          <motion.div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5, repeat: 3, repeatType: "reverse" }}
          >
            <div className="flex flex-col items-center gap-1 text-muted-foreground">
              <ChevronDown className="h-4 w-4" />
              <span className="text-xs">Scroll for more</span>
            </div>
          </motion.div>
        )}
      </motion.div>
    </>
  );
};
```

### 2. Create Content Component

```tsx
// src/components/map/drawer-site-content.tsx

"use client";

import { useMemo } from "react";
import type { MapSite } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Calendar, Users, MessageSquare, Camera } from "lucide-react";
import Link from "next/link";

interface DrawerSiteContentProps {
  site: MapSite;
}

export const DrawerSiteContent = ({ site }: DrawerSiteContentProps) => {
  return (
    <div className="space-y-6">
      {/* Quick Info - Always Visible in Peek Mode */}
      <div className="space-y-3">
        <div>
          <h2 className="text-2xl font-bold">{site.name}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {site.civilization} • {site.era}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant={site.verificationStatus === "verified" ? "success" : "outline"}>
            {site.verificationStatus === "verified" ? "Verified" : "Under Review"}
          </Badge>
          <Badge variant="secondary">
            {site.layer === "official" ? "Official" : site.trustTier}
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          {site.summary}
        </p>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button size="sm" className="flex-1" asChild>
            <Link href={`/content/upload?site=${site.id}`}>
              <Camera className="h-4 w-4 mr-2" />
              Add Photo
            </Link>
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            <MessageSquare className="h-4 w-4 mr-2" />
            Discuss
          </Button>
        </div>
      </div>

      <Separator />

      {/* Detailed Info - Visible on Expand */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div>
              <p className="font-medium">Location</p>
              <p className="text-xs text-muted-foreground">
                {site.geography.country}
                {site.geography.region && ` • ${site.geography.region}`}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div>
              <p className="font-medium">Type</p>
              <p className="text-xs text-muted-foreground">{site.siteType}</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Tags</p>
          <div className="flex flex-wrap gap-2">
            {site.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <Separator />

      {/* Tabs for More Content */}
      <Tabs defaultValue="nearby" className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="nearby">Nearby</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="discuss">Discuss</TabsTrigger>
        </TabsList>
        
        <TabsContent value="nearby" className="space-y-3 mt-4">
          <p className="text-sm text-muted-foreground">
            Nearby sites implementation here...
          </p>
        </TabsContent>
        
        <TabsContent value="media" className="space-y-3 mt-4">
          <p className="text-sm text-muted-foreground">
            {site.mediaCount} photos and videos
          </p>
        </TabsContent>
        
        <TabsContent value="discuss" className="space-y-3 mt-4">
          <p className="text-sm text-muted-foreground">
            Community discussion thread here...
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
};
```

### 3. Integrate with Site Explorer

```tsx
// src/app/(app)/map/_components/site-explorer.tsx

import { ProgressiveDetailDrawer } from "@/components/map/progressive-detail-drawer";
import { DrawerSiteContent } from "@/components/map/drawer-site-content";

export const SiteExplorer = () => {
  // ... existing code ...

  return (
    <div className="flex h-full flex-col gap-4">
      {/* ... existing map and filters ... */}
      
      <div className="relative flex flex-col overflow-hidden rounded-3xl">
        <SiteMap
          sites={filteredSites}
          selectedSiteId={selectedSiteId}
          onSelect={(id) => {
            selectSite(id);
          }}
          className="h-[85vh] md:h-[60vh]" // Taller on mobile to account for drawer
        />
        
        {/* REPLACE the old drawer with Progressive Drawer */}
        <ProgressiveDetailDrawer
          site={selectedSite}
          open={!!selectedSite}
          onClose={() => selectSite(null)}
        >
          {selectedSite && <DrawerSiteContent site={selectedSite} />}
        </ProgressiveDetailDrawer>
      </div>
    </div>
  );
};
```

## Styling Enhancements

### Add to globals.css

```css
/* Progressive Drawer Styles */

/* Safe area support for notched phones */
.pb-safe {
  padding-bottom: max(2rem, env(safe-area-inset-bottom));
}

.pt-safe {
  padding-top: max(1rem, env(safe-area-inset-top));
}

/* Smooth scrolling with momentum */
.overscroll-contain {
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}

/* Prevent pull-to-refresh on iOS */
.no-pull-refresh {
  overscroll-behavior-y: contain;
}

/* Drawer scroll indicator animation */
@keyframes bounce-gentle {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(4px);
  }
}

.animate-bounce-gentle {
  animation: bounce-gentle 2s infinite;
}
```

## Advanced Features

### 1. Haptic Feedback

```tsx
// Add to progressive-detail-drawer.tsx

const triggerHaptic = (type: "light" | "medium" | "heavy" = "light") => {
  if ("vibrate" in navigator) {
    const patterns = {
      light: 10,
      medium: 20,
      heavy: 30,
    };
    navigator.vibrate(patterns[type]);
  }
};

// Use when drawer state changes
const setDrawerStateWithHaptic = (state: DrawerState) => {
  triggerHaptic("light");
  setDrawerState(state);
};
```

### 2. Momentum-Based Auto-Expand

```tsx
const handleDragEnd = (event: any, info: PanInfo) => {
  setIsDragging(false);
  const { velocity, offset } = info;

  // Calculate momentum
  const momentum = Math.abs(velocity.y) * Math.sign(offset.y);

  if (momentum > 500) {
    // Fast upward swipe = expand
    if (velocity.y < 0 && drawerState === "peek") {
      setDrawerStateWithHaptic("expanded");
    }
    // Fast downward swipe = collapse or close
    else if (velocity.y > 0) {
      if (drawerState === "expanded") {
        setDrawerStateWithHaptic("peek");
      } else {
        handleClose();
      }
    }
  } else {
    // Slow drag, use distance threshold
    const threshold = window.innerHeight * 0.15;
    
    if (offset.y > threshold) {
      // Dragged down
      if (drawerState === "expanded") {
        setDrawerStateWithHaptic("peek");
      } else {
        handleClose();
      }
    } else if (offset.y < -threshold) {
      // Dragged up
      if (drawerState === "peek") {
        setDrawerStateWithHaptic("expanded");
      }
    } else {
      // Return to current state
      controls.start({
        height: `${DRAWER_STATES[drawerState]}vh`,
        transition: { type: "spring", damping: 30 },
      });
    }
  }
};
```

### 3. Map Interaction While Drawer Open

```tsx
// In SiteMap component, add blur effect when drawer is open

<MapContainer
  className={cn(
    "h-full w-full transition-all duration-300",
    isDrawerOpen && "blur-sm brightness-75" // Subtle blur when drawer open
  )}
>
  {/* ... map layers ... */}
</MapContainer>
```

## Testing Checklist

### Interaction Testing
- [ ] Tap marker opens drawer in peek mode (50vh)
- [ ] Scroll down expands drawer to 90vh
- [ ] Drag handle down collapses/closes drawer
- [ ] Drag handle up expands drawer
- [ ] Fast swipe down closes drawer instantly
- [ ] Tap backdrop closes drawer
- [ ] Back button (Android) closes drawer

### Visual Testing
- [ ] Drag handle visible and centered
- [ ] Rounded corners render correctly
- [ ] Border and shadow applied
- [ ] Content doesn't overflow
- [ ] Scroll indicator appears in peek mode
- [ ] Animations are smooth (60fps)

### Edge Cases
- [ ] Works on iPhone SE (small screen)
- [ ] Works on iPad (should hide, use desktop layout)
- [ ] Works with iPhone notch (safe areas)
- [ ] Works in landscape orientation
- [ ] Scroll position resets when drawer closes
- [ ] Multiple rapid taps don't break state

### Performance
- [ ] No jank during animation
- [ ] Touch response < 100ms
- [ ] Smooth scrolling with many items
- [ ] No memory leaks on open/close cycles

## Browser Support

| Feature | iOS Safari | Chrome Android | Firefox Android |
|---------|-----------|----------------|-----------------|
| Drag gestures | ✅ | ✅ | ✅ |
| Backdrop blur | ✅ | ✅ | ⚠️ (fallback) |
| Safe areas | ✅ | ✅ | ✅ |
| Haptics | ✅ | ✅ | ❌ |
| Spring animations | ✅ | ✅ | ✅ |

## Performance Optimization

### Lazy Load Content

```tsx
const DrawerSiteContent = ({ site }: DrawerSiteContentProps) => {
  const [showDetailedContent, setShowDetailedContent] = useState(false);

  useEffect(() => {
    // Delay loading heavy content until drawer is open
    const timer = setTimeout(() => {
      setShowDetailedContent(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      {/* Always show quick info */}
      <QuickInfo site={site} />
      
      {/* Lazy load detailed content */}
      {showDetailedContent ? (
        <DetailedContent site={site} />
      ) : (
        <Skeleton />
      )}
    </div>
  );
};
```

## Troubleshooting

### Issue: Drawer doesn't expand on scroll
**Solution**: Check that `overscroll-contain` is applied and scroll event is firing

### Issue: Drag gesture conflicts with scroll
**Solution**: Set `touchAction: "none"` on drag handle only, not content

### Issue: Animation stutters
**Solution**: Use `will-change: height` and reduce DOM complexity

### Issue: Content jumps when expanding
**Solution**: Use `min-height` instead of `height` for content areas

## Next Steps

1. Implement nearby sites calculation and display
2. Add photo gallery in media tab
3. Implement site-specific chat
4. Add quick photo upload from drawer
5. Create field report shortcut button

---

**Related Documentation:**
- [CITIZEN_APP_DESIGN_INSPIRATION.md](./CITIZEN_APP_DESIGN_INSPIRATION.md)
- [MOBILE_IMPROVEMENTS_SUMMARY.md](./MOBILE_IMPROVEMENTS_SUMMARY.md)

