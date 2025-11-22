# Citizen UI Patterns - Quick Reference Card

> Fast lookup for developers implementing Citizen-inspired mobile patterns

## 🎯 Core Patterns at a Glance

| Pattern | Citizen App | Our Implementation Status | Priority |
|---------|-------------|---------------------------|----------|
| **Progressive Drawer** | ✅ Peek→Expand on scroll | ⚠️ Modal only | 🔴 CRITICAL |
| **Search FAB** | ✅ Top-right floating | ❌ Embedded in filters | 🟡 HIGH |
| **Bottom Nav** | ✅ 5 items with center FAB | ✅ 5 items (no FAB) | 🟢 DONE |
| **Nearby POIs** | ✅ With distance | ❌ Not implemented | 🟡 HIGH |
| **Site Chat** | ✅ Per-incident thread | ⚠️ General forum only | 🟡 MEDIUM |
| **Quick Photo Upload** | ✅ FAB on map | ❌ Full upload flow only | 🟡 HIGH |
| **Custom Markers** | ✅ Icons + size + badges | ✅ Implemented well | 🟢 DONE |
| **Marker Clustering** | ✅ Smart clustering | ✅ Implemented | 🟢 DONE |
| **Shield/Boundary** | ✅ Draw perimeter | ❌ Not implemented | 🔵 FUTURE |

---

## 📱 Layout Breakdowns

### Citizen's Mobile Layout

```
┌─────────────────────────────────┐
│  [≡] INCIDENTS ▼   🔍  👤        │ ← Top bar with dropdown + search
├─────────────────────────────────┤
│                                 │
│                                 │
│          MAP VIEW               │ ← Full-screen Leaflet map
│          with POIs              │
│                                 │
│                                 │
├─────────────────────────────────┤
│ 🗺️  | 👥  | ➕  | 🔔  | ⚙️      │ ← Bottom nav (5 items)
└─────────────────────────────────┘
```

### Megalithic Mapper Current Layout

```
┌─────────────────────────────────┐
│  MEGALITHIC MAPPER    🔍  👤     │ ← Top bar
├─────────────────────────────────┤
│ [Filters Panel - Collapsible]   │ ← Filters (can hide)
├─────────────────────────────────┤
│                                 │
│          MAP VIEW               │
│          with clustering        │
│                                 │
├─────────────────────────────────┤
│ [Side Panel with Tabs]          │ ← Desktop: sidebar, Mobile: separate
├─────────────────────────────────┤
│ 🗺️  | 🧭  | 💬  | 📷  | 📖      │ ← Bottom nav
└─────────────────────────────────┘
```

### Proposed Layout (Citizen-Inspired)

```
┌─────────────────────────────────┐
│  [≡] SITES ▼         🔍  👤      │ ← Top bar + FAB search
├─────────────────────────────────┤
│                                 │
│                                 │
│          MAP VIEW               │ ← Full-screen on mobile
│       (85vh on mobile)          │
│              ●                  │ ← Selected site marker
│                 📷  ← FAB        │ ← Quick report FAB
│                                 │
│ ╔═══════════════════════════╗   │ ← Drawer at 50vh
│ ║   ─── DRAG HANDLE ───     ║   │
│ ║  STONEHENGE               ║   │
│ ║  Verified • Official      ║   │
│ ║  [Add Photo] [Discuss]    ║   │
│ ║  Scroll for more...       ║   │
│ ╚═══════════════════════════╝   │
├─────────────────────────────────┤
│ 🗺️  | 🧭  |  ➕  | 🔔  | 👤     │ ← Bottom nav with center FAB
└─────────────────────────────────┘
```

---

## 🔧 Component Mapping

### Current → Citizen-Inspired

| Current Component | New/Modified Component | Changes Needed |
|-------------------|------------------------|----------------|
| `SiteDetailDrawer` | `ProgressiveDetailDrawer` | Add peek mode, scroll-to-expand, drag gestures |
| `SiteFilters` | `SearchFAB` + `FilterSheet` | Extract search, make it floating |
| `MobileNavbar` | `MobileNavbar` (enhanced) | Add center FAB for "Report Site" |
| `SiteDetailPanel` | `DrawerSiteContent` | Add "Nearby Sites" section with distances |
| `SiteDetailPanel` (Discussion tab) | `SiteChatPanel` | Real-time chat UI, not just forum link |
| N/A | `QuickPhotoUpload` | NEW: FAB on map → camera → quick upload |
| N/A | `ResearchBoundaryTool` | NEW: Draw perimeter (Shield equivalent) |

---

## 🎨 Design Tokens

### Spacing (Touch Targets)

```tsx
// Minimum touch target size (iOS HIG + Material Design)
const TOUCH_TARGET = {
  min: "44px",      // Minimum for any interactive element
  comfortable: "48px", // Preferred size
  fab: "56px"       // Floating action button
};
```

### Z-Index Layers

```tsx
const Z_INDEX = {
  map: 0,
  mapControls: 400,
  topbar: 500,
  drawer: 450,
  drawerBackdrop: 445,
  fab: 460,
  bottomNav: 500,
  modal: 600,
  toast: 700
};
```

### Animation Springs

```tsx
// Framer Motion spring configs (Citizen-like feel)
const SPRING_CONFIGS = {
  drawer: {
    type: "spring",
    damping: 30,
    stiffness: 300
  },
  fab: {
    type: "spring",
    damping: 20,
    stiffness: 400
  },
  bounce: {
    type: "spring",
    damping: 10,
    stiffness: 200
  }
};
```

### Safe Areas

```css
/* iOS safe area insets */
.safe-top {
  padding-top: max(1rem, env(safe-area-inset-top));
}

.safe-bottom {
  padding-bottom: max(1rem, env(safe-area-inset-bottom));
}

.safe-left {
  padding-left: max(1rem, env(safe-area-inset-left));
}

.safe-right {
  padding-right: max(1rem, env(safe-area-inset-right));
}
```

---

## 🏗️ Implementation Priority Order

### Week 1: Critical Mobile UX
1. **Progressive Detail Drawer** (2-3 days)
   - Peek mode (50vh)
   - Expand on scroll (90vh)
   - Drag to dismiss
   - Haptic feedback

2. **Search FAB** (1 day)
   - Floating button top-right
   - Overlay search interface
   - Recent searches

3. **Quick Photo Upload FAB** (1 day)
   - Camera icon bottom-right
   - Quick capture flow
   - Auto-geotag

### Week 2: Community Features
4. **Nearby Sites** (2 days)
   - Distance calculation
   - Sort by proximity
   - Quick navigation

5. **Site-Specific Chat** (3 days)
   - Per-site thread
   - Photo attachments
   - Real-time updates

### Week 3: Advanced Features
6. **Research Boundary Tool** (3 days)
   - Draw polygon on map
   - Filter sites in boundary
   - Save boundaries

7. **Enhanced Bottom Nav** (2 days)
   - Center FAB design
   - Icon animations
   - Badge notifications

---

## 📐 Layout Measurements

### Drawer Heights

```tsx
// Mobile viewport heights
const DRAWER_HEIGHTS = {
  closed: "0vh",
  peek: "50vh",     // Half screen - map still visible
  expanded: "90vh", // Almost full screen
  full: "100vh"     // Rare, only for modal-style
};

// Corresponding map heights
const MAP_HEIGHTS = {
  nDrawer: "85vh",   // When no drawer open
  peek: "50vh",      // When drawer in peek mode
  expanded: "10vh"   // When drawer expanded
};
```

### FAB Positions

```tsx
// Floating Action Button positions
const FAB_POSITIONS = {
  search: {
    top: "1rem",
    right: "1rem"
  },
  quickReport: {
    bottom: "5rem", // Above bottom nav
    right: "1.5rem"
  },
  centerNav: {
    bottom: "1rem",
    left: "50%",
    transform: "translateX(-50%)"
  }
};
```

---

## 🎭 Animation Recipes

### Drawer Peek → Expand

```tsx
// When user scrolls down in peek mode
const expandDrawer = () => {
  controls.start({
    height: "90vh",
    transition: {
      type: "spring",
      damping: 30,
      stiffness: 300,
      duration: 0.4
    }
  });
};
```

### FAB Bounce on Appear

```tsx
<motion.button
  initial={{ scale: 0, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{
    type: "spring",
    damping: 15,
    stiffness: 200,
    delay: 0.2
  }}
  whileTap={{ scale: 0.9 }}
>
  <Camera />
</motion.button>
```

### Drawer Drag Resistance

```tsx
<motion.div
  drag="y"
  dragConstraints={{ top: 0, bottom: 0 }}
  dragElastic={0.2} // 20% elastic resistance
  onDragEnd={(e, info) => {
    // Handle based on velocity and offset
    if (info.velocity.y > 500) {
      closeDrawer();
    }
  }}
>
```

---

## 🔍 Comparison: Key Interactions

### Opening a POI Detail

**Citizen:**
1. Tap marker → Drawer slides up to 50vh
2. Map auto-centers POI in top half
3. Scroll down → Drawer expands to 90vh
4. Swipe down → Collapses to 50vh or closes

**Current Megalithic Mapper:**
1. Tap marker → Modal/drawer appears
2. Map stays at current position
3. No progressive expansion
4. Close button only

**Recommended:**
- Implement Citizen's pattern exactly ✅

### Searching for Sites

**Citizen:**
1. Tap search FAB (top-right)
2. Full-screen search overlay
3. Recent searches + suggestions
4. Results appear on map

**Current Megalithic Mapper:**
1. Search embedded in filters
2. Requires scrolling to find
3. Not prominent

**Recommended:**
- Add floating search FAB ✅
- Keep existing filter search as advanced option

### Reporting New Content

**Citizen:**
1. Tap center "+" button in nav
2. OR tap camera FAB on map
3. Quick camera capture
4. Add details → Submit

**Current Megalithic Mapper:**
1. Navigate to /content/upload
2. Full form with many fields
3. Manual photo selection

**Recommended:**
- Add quick report FAB for field use ✅
- Keep full upload page for desktop/detailed submissions

---

## 🧪 Testing Scenarios

### Mobile Device Testing Matrix

| Device | Screen Size | Test Focus |
|--------|-------------|------------|
| iPhone SE | 375×667 | Small screen, compact UI |
| iPhone 14 Pro | 393×852 | Notch, safe areas |
| Galaxy S21 | 360×800 | Android gestures |
| iPad Mini | 744×1133 | Tablet breakpoint |

### Interaction Tests

```typescript
// Test suite for progressive drawer
describe("ProgressiveDetailDrawer", () => {
  it("opens to peek mode (50vh) when site selected", () => {
    // Test implementation
  });

  it("expands to 90vh when user scrolls down", () => {
    // Test scroll behavior
  });

  it("closes on fast downward swipe", () => {
    // Test velocity detection
  });

  it("collapses to peek when expanded and dragged down slowly", () => {
    // Test drag threshold
  });

  it("centers map on selected site in peek mode", () => {
    // Test map centering
  });
});
```

---

## 📦 Required Dependencies

```json
{
  "dependencies": {
    "framer-motion": "^10.16.4",
    "@use-gesture/react": "^10.3.0",
    "react-leaflet": "^4.2.1",
    "leaflet": "^1.9.4",
    "leaflet.markercluster": "^1.5.3"
  },
  "devDependencies": {
    "@types/leaflet": "^1.9.8",
    "@types/leaflet.markercluster": "^1.5.4"
  }
}
```

---

## 🎯 Success Metrics

### User Experience
- Time to view site details: **< 1 second** (from marker tap)
- Drawer animation: **60fps** smooth
- Touch response: **< 100ms** feedback

### Adoption
- Mobile usage increase: **+30%** target
- Photo uploads from field: **+50%** target
- Site reports from mobile: **+40%** target

### Technical
- Lighthouse mobile score: **> 90**
- First Contentful Paint: **< 2s**
- Time to Interactive: **< 3s**

---

## 🐛 Common Gotchas

### 1. Drawer Scroll Conflicts
**Problem:** Scroll in drawer conflicts with drag gesture
**Solution:** Only make handle draggable, not content

### 2. iOS Bounce Scroll
**Problem:** Drawer bounces past boundaries
**Solution:** Add `overscroll-behavior: contain`

### 3. Android Back Button
**Problem:** Back button doesn't close drawer
**Solution:** Listen for `popstate` event

### 4. Safe Area Insets
**Problem:** Content hidden behind iPhone notch
**Solution:** Use `env(safe-area-inset-*)` in CSS

### 5. Touch Through Backdrop
**Problem:** Can interact with map through drawer backdrop
**Solution:** Set `pointer-events: none` when closed

---

## 🔗 Related Files

- `CITIZEN_APP_DESIGN_INSPIRATION.md` - Full analysis
- `PROGRESSIVE_DRAWER_IMPLEMENTATION.md` - Detailed implementation
- `MOBILE_IMPROVEMENTS_SUMMARY.md` - Existing mobile work
- `src/components/map/progressive-detail-drawer.tsx` - Component code
- `src/app/(app)/map/_components/site-explorer.tsx` - Integration point

---

## 💡 Pro Tips

1. **Always test on real devices** - Simulators don't capture touch nuances
2. **Use spring animations** - They feel more natural than easing curves
3. **Add haptic feedback** - Small vibrations enhance user confidence
4. **Respect safe areas** - Especially important for new iPhones
5. **Lazy load content** - Don't load everything until drawer expands
6. **Cache map tiles** - For offline field work capability
7. **Throttle scroll events** - Performance optimization for drawer expansion

---

## 🚀 Quick Start Commands

```bash
# Install dependencies
npm install framer-motion @use-gesture/react

# Create component files
mkdir -p src/components/map
touch src/components/map/progressive-detail-drawer.tsx
touch src/components/map/drawer-site-content.tsx
touch src/components/map/search-fab.tsx
touch src/components/map/quick-report-fab.tsx

# Run dev server and test on mobile
npm run dev
# Then visit from phone: http://[your-ip]:3000

# Build and test performance
npm run build
npm run start
```

---

**Last Updated:** Based on Citizen app v12.0 (2024) and megalithic-mapper current state
**Maintained by:** Development Team
**Questions?** See full documentation in linked files above

