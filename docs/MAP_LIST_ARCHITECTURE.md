# Map/List Explorer Architecture

This document describes the complete architecture of the map/list explorer feature in the megalithic-mapper application.

## Overview

The explorer is a **responsive, dual-mode interface** that displays archaeological sites as either:
1. **Map View** - Interactive Leaflet map with markers
2. **List View** - Scrollable list of site cards

The implementation is **fully responsive** with:
- **Desktop**: Split view (feed + map side-by-side), or expanded single views
- **Mobile**: Map-first with draggable bottom drawer, or full-screen list

---

## File Structure

```
src/app/(app)/map/
├── page.tsx                      # Page entry point (SSR data fetch)
├── actions.ts                    # Server actions for data loading
└── _components/
    ├── site-explorer.tsx         # Main orchestrator (responsive switch)
    ├── mobile-site-explorer.tsx  # Mobile-specific implementation
    ├── site-map.tsx              # Leaflet map component
    ├── site-list.tsx             # Desktop list view
    ├── home-feed.tsx             # Activity feed component
    ├── site-slide-over.tsx       # Desktop site detail panel
    ├── mobile-drawer.tsx         # (Not used - see shared/ui)
    ├── site-editor.tsx           # Add/edit site form
    ├── zone-editor.tsx           # Add/edit zone form
    ├── site-filters.tsx          # Filter UI components
    ├── whats-hot-panel.tsx       # Trending sites indicator
    └── activity-detail-drawer.tsx # Activity item details
```

Supporting files:
```
src/entities/map/
├── model/types.ts               # TypeScript types for map entities
└── api/map-data.ts              # Data fetching & normalization

src/features/map-explorer/
└── model/map-store.ts           # Zustand state management

src/shared/
├── ui/mobile-drawer.tsx         # Custom drawer component
├── hooks/use-media-query.ts     # Responsive hooks
└── lib/z-index.ts               # Z-index constants
```

---

## Architecture Components

### 1. Page Entry Point (`page.tsx`)

```tsx
// Server component that fetches initial data
export default function MapPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MapPageContent />
    </Suspense>
  );
}

const MapPageContent = async () => {
  const initialBounds = WORLD_BOUNDS;
  const { sites, zones } = await fetchMapEntities({ bounds: initialBounds });
  return <SiteExplorer initialSites={sites} initialZones={zones} initialBounds={initialBounds} />;
};
```

**Key Pattern**: SSR data fetching with Suspense boundary. Initial data is passed to client components.

---

### 2. Responsive Switch (`site-explorer.tsx`)

The main `SiteExplorer` component detects screen size and renders the appropriate view:

```tsx
export const SiteExplorer = ({ initialSites, initialZones, initialBounds }) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileSiteExplorer {...props} />;
  }
  return <DesktopSiteExplorer {...props} />;
};
```

#### Desktop View Modes

```tsx
type ViewMode = "split" | "map" | "feed";
```

- **Split**: Feed panel (left, ~420-480px) + Map (right, flex-1)
- **Map**: Full-width map with floating controls
- **Feed**: Full-width activity feed

#### Desktop Layout Structure

```tsx
<div className="relative flex h-full w-full">
  {/* Left Panel - Activity Feed */}
  {showFeed && (
    <aside className="flex flex-col w-[420px] lg:w-[480px]">
      {/* View mode toggle */}
      <div className="flex items-center gap-0.5 p-0.5 bg-secondary/30 rounded-lg">
        <button onClick={() => setViewMode("feed")}>Feed</button>
        <button onClick={() => setViewMode("split")}>Split</button>
        <button onClick={() => setViewMode("map")}>Map</button>
      </div>
      <HomeFeed sites={filteredSites} onFocusSite={handleFocusSite} />
    </aside>
  )}

  {/* Right Panel - Map */}
  {showMap && (
    <div className="relative flex-1">
      {/* Floating controls overlay */}
      <div className="absolute top-3 left-3 right-3 z-[1010]">
        <Input placeholder="Search..." />
        <QuickFilters />
        <AddSiteButton />
      </div>
      <SiteMap sites={sitesWithHeat} onSelect={handleSelectSite} />
    </div>
  )}

  {/* Site Detail Slide-over */}
  <SiteSlideOver site={selectedSite} isOpen={isSlideOverOpen} onClose={handleCloseSlideOver} />
</div>
```

---

### 3. Mobile Implementation (`mobile-site-explorer.tsx`)

Mobile uses a completely different approach with a **bottom drawer pattern**:

```tsx
type ViewMode = "map" | "list";
type DrawerContentType = "sites" | "activity";
```

#### Mobile Layout Structure

```tsx
<div className="relative h-[100dvh] w-full">
  {/* Map (hidden when in list mode) */}
  <div className={cn("absolute inset-0", viewMode === "list" && "hidden")}>
    <SiteMap sites={sitesWithHeat} onSelect={handleSelectSite} />
  </div>

  {/* List view (full screen when active) */}
  {viewMode === "list" && (
    <div className="absolute inset-0 pt-16">
      <SiteListWithThumbnails sites={filteredSites} onSelect={handleFocusSite} />
    </div>
  )}

  {/* Top bar with toggle */}
  <div className="absolute top-0 left-0 right-0 z-[1010]">
    <div className="flex items-center gap-2">
      {/* Map/List toggle pill */}
      <div className="flex items-center bg-card rounded-full shadow-lg p-1">
        <button onClick={() => setViewMode("map")}>
          <MapIcon className={cn(viewMode === "map" && "text-primary")} />
        </button>
        <button onClick={() => setViewMode("list")}>
          <List className={cn(viewMode === "list" && "text-primary")} />
        </button>
      </div>

      <SearchInput />
      <AddSiteButton />
    </div>
  </div>

  {/* Bottom drawer (only in map mode) */}
  {viewMode === "map" && (
    <MobileDrawer snap={drawerSnap} onSnapChange={setDrawerSnap}>
      {selectedSite ? (
        <SiteDetailCard site={selectedSite} />
      ) : drawerContent === "sites" ? (
        <SiteListWithThumbnails sites={filteredSites} onSelect={handleFocusSite} />
      ) : (
        <HomeFeed sites={filteredSites} onFocusSite={handleFocusSite} />
      )}
    </MobileDrawer>
  )}
</div>
```

---

### 4. Mobile Drawer (`src/shared/ui/mobile-drawer.tsx`)

Custom implementation that solves common issues with libraries like `vaul`:
- Works with `modal={false}` (keeps background interactive)
- Properly handles scrollable content inside drawer
- Reliable snap points

```tsx
export const DRAWER_SNAP_POINTS = {
  PEEK: 25,   // 25% - minimal view
  HALF: 55,   // 55% - half screen
  FULL: 92,   // 92% - nearly full screen
} as const;

export function MobileDrawer({
  children,
  header,
  snap,
  onSnapChange,
}: MobileDrawerProps) {
  // Touch/drag handling for snap point transitions
  // Separate drag handle area (header) from scrollable content

  return (
    <div style={{ height: `${snap}dvh` }}>
      {/* Drag handle - responds to drag gestures */}
      <div onTouchStart={...} onTouchMove={...}>
        <div className="w-12 h-1.5 rounded-full bg-muted" />
        {header}
      </div>
      
      {/* Scrollable content - doesn't trigger drawer drag */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
```

---

### 5. State Management (`map-store.ts`)

Zustand store for centralized map state:

```tsx
interface MapStoreState {
  // Data
  sites: MapSiteFeature[];
  zones: MapZoneFeature[];
  bounds: BoundingBox;
  filters: MapFilters;
  selectedSiteId: string | null;

  // Actions
  initialize: (payload) => void;
  replaceData: (payload) => void;
  setBounds: (bounds) => void;
  setFilters: (update) => void;
  selectSite: (id) => void;
  optimisticUpsertSite: (site) => MapSiteFeature;
  optimisticUpsertZone: (zone) => MapZoneFeature;
}

// Filter function (exported for use in components)
export const applySiteFilters = (sites, filters): MapSiteFeature[] => {
  return sites.filter(site => {
    const matchesSearch = ...;
    const matchesCultures = ...;
    const matchesVerification = ...;
    // etc.
    return matchesSearch && matchesCultures && matchesVerification && ...;
  });
};
```

---

### 6. Map Component (`site-map.tsx`)

Leaflet-based map with custom markers:

```tsx
export const SiteMap = ({
  sites,
  zones,
  selectedSiteId,
  onSelect,
  onBoundsChange,
  onMapClick,
  onMapReady,
}) => {
  const { resolvedTheme } = useTheme();

  return (
    <MapContainer center={MAP_CENTER} zoom={DEFAULT_ZOOM}>
      <TileLayer url={tileLayer.url} />
      
      {/* Event handlers */}
      <BoundsWatcher onChange={onBoundsChange} />
      <MapClickHandler onClick={onMapClick} />
      <MapReadyHandler onReady={onMapReady} />
      <SelectedSiteFocus site={selectedSite} />

      {/* Zones as rectangles */}
      {zones.map((zone) => (
        <Rectangle key={zone.id} bounds={zone.bounds} />
      ))}

      {/* Sites as custom markers */}
      {sites.map((site) => (
        <SiteMarker key={site.id} site={site} isSelected={site.id === selectedSiteId} />
      ))}
    </MapContainer>
  );
};
```

#### Custom Marker Icons

```tsx
const createCustomPinIcon = (site, isSelected): L.DivIcon => {
  const iconColor = getSiteTypeColor(site.siteType);
  const siteTypeIcon = getSiteTypeIconSvg(site.siteType, iconColor, svgSize);

  return L.divIcon({
    html: `
      <div class="custom-marker ${isSelected ? 'selected' : ''} heat-${site.heatTier}">
        <div class="marker-icon-container">
          ${siteTypeIcon}
        </div>
      </div>
    `,
    className: "custom-marker-wrapper",
    iconSize: [iconSize, iconSize],
    iconAnchor: [iconSize / 2, iconSize / 2],
  });
};
```

---

### 7. Types (`entities/map/model/types.ts`)

Core data structures:

```tsx
export interface MapSiteFeature {
  id: string;
  slug: string;
  name: string;
  summary: string;
  siteType: string;
  category: SiteCategory; // "site" | "artifact" | "text"
  coordinates: CoordinatePair;
  verificationStatus: VerificationStatus; // "verified" | "under_review" | "unverified"
  layer: MapLayer; // "official" | "community"
  trustTier?: CommunityTier; // "bronze" | "silver" | "gold" | "promoted"
  tags: TagCollection;
  zoneMemberships: MapZoneSummary[];
  mediaCount: number;
  relatedResearchIds: string[];
  evidenceLinks?: string[];
  thumbnailUrl?: string;
  updatedAt: string;
  updatedBy: string;
  searchText: string;
  // Heat/popularity
  heatTier?: HeatTier;
  heatScore?: number;
  trendReason?: string;
}

export interface MapZoneFeature {
  id: string;
  slug: string;
  name: string;
  description: string;
  color: string;
  bounds: BoundingBox;
  centroid: CoordinatePair;
  cultureFocus: string[];
  eraFocus: string[];
  verificationState: ZoneVerificationState;
}

export interface MapFilters {
  search: string;
  cultures: string[];
  eras: string[];
  verification: "all" | VerificationStatus;
  researchOnly: boolean;
  siteTypes: string[];
  layer: "composite" | MapLayer;
  communityTiers: CommunityTier[];
  categories: SiteCategory[];
  zones: string[];
  tags: string[];
}
```

---

## Key Patterns

### 1. Responsive Detection

```tsx
// src/shared/hooks/use-media-query.ts
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  
  return isMobile;
}
```

### 2. Dynamic Imports

Map component is loaded client-side only to avoid SSR issues with Leaflet:

```tsx
const SiteMap = dynamic(() => import("./site-map").then(m => m.SiteMap), {
  ssr: false,
});

const MobileSiteExplorer = dynamic(
  () => import("./mobile-site-explorer").then(m => m.MobileSiteExplorer),
  { ssr: false }
);
```

### 3. Z-Index Management

Centralized z-index scale to prevent layering conflicts:

```tsx
// src/shared/lib/z-index.ts
export const Z_INDEX = {
  mapControls: 1010,
  mapFilters: 1020,
  mapEditors: 1030,
  mobileDrawer: 1100,
  dropdown: 1300,
  modal: 1410,
  toast: 1500,
};

export const zClass = {
  mapControls: "z-[1010]",
  mapFilters: "z-[1020]",
  // ...
};
```

### 4. Site Focus with Drawer Offset

When a site is selected on mobile, the map centers it accounting for the drawer height:

```tsx
const flyToSiteWithDrawerOffset = useCallback((site) => {
  const map = mapRef.current;
  const targetLatLng = [site.coordinates.lat, site.coordinates.lng];

  // Calculate offset: drawer is 55% of screen
  const containerHeight = map.getSize().y;
  const drawerHeightPercent = 0.55;
  const visibleAreaCenter = (1 - drawerHeightPercent) / 2;
  const offsetPercent = 0.5 - visibleAreaCenter;
  const offsetPixels = containerHeight * offsetPercent;

  // Shift center down so marker appears above drawer
  const targetPoint = map.project(targetLatLng, targetZoom);
  targetPoint.y += offsetPixels;
  const adjustedCenter = map.unproject(targetPoint, targetZoom);

  map.flyTo(adjustedCenter, targetZoom, { duration: 0.8 });
}, []);
```

### 5. Bounds-Based Data Loading

When map bounds change significantly, new data is fetched:

```tsx
const handleBoundsChange = useCallback((bounds: L.LatLngBounds) => {
  const nextBounds = toBoundingBox(bounds);
  const hasMeaningfulChange =
    Math.abs(nextBounds.minLat - lastBounds.minLat) > 1.0 ||
    Math.abs(nextBounds.minLng - lastBounds.minLng) > 1.0 ||
    // ...

  if (!hasMeaningfulChange) return;

  startTransition(async () => {
    const payload = await loadMapData({ bounds: nextBounds });
    replaceData({ sites: payload.sites, zones: payload.zones });
  });
}, [filters, lastBounds, replaceData]);
```

---

## Data Flow

```
┌─────────────┐
│  page.tsx   │ ← SSR: fetchMapEntities()
└──────┬──────┘
       │ initialSites, initialZones
       ▼
┌──────────────────┐
│  SiteExplorer    │ ← Responsive switch
└──────┬───────────┘
       │
       ├─── Mobile ───► MobileSiteExplorer
       │                      │
       └─── Desktop ──► DesktopSiteExplorer
                              │
                              ▼
                    ┌─────────────────┐
                    │   map-store.ts  │ ← Zustand state
                    │   (sites, zones,│
                    │    filters,     │
                    │    selectedId)  │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
   ┌─────────┐        ┌──────────┐        ┌───────────┐
   │ SiteMap │        │ SiteList │        │ HomeFeed  │
   └─────────┘        └──────────┘        └───────────┘
        │
        │ onBoundsChange
        ▼
   ┌───────────────┐
   │ loadMapData() │ ← Server action
   └───────────────┘
```

---

## Implementation Checklist

To implement this pattern in another project:

1. **Types**: Define `MapSiteFeature`, `MapZoneFeature`, `MapFilters` types
2. **State**: Create Zustand store with sites, zones, filters, selectedSiteId
3. **Data API**: Server function to fetch/filter sites by bounds
4. **Page**: SSR component that fetches initial data
5. **Explorer**: Responsive wrapper with `useIsMobile()` switch
6. **Desktop**: Split view with feed panel + map
7. **Mobile**: Full-screen map + bottom drawer
8. **Map Component**: Leaflet with custom markers
9. **Drawer**: Custom snap-point drawer for mobile
10. **Z-Index**: Centralized layering system

---

## Dependencies

```json
{
  "react-leaflet": "^4.x",
  "leaflet": "^1.x",
  "zustand": "^4.x",
  "framer-motion": "^10.x",
  "lucide-react": "^0.x",
  "next-themes": "^0.x"
}
```







