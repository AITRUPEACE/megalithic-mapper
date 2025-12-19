# Auto-Hover POI Tooltip System

## Product Requirements Document (PRD)

### Overview

The Auto-Hover Tooltip system provides an intuitive way for users to explore Points of Interest (POIs) on a map by "hovering" the center of the screen over markers. This creates a hands-free, scroll-to-explore experience ideal for mobile maps where traditional mouse hover isn't available.

### Problem Statement

On touch-based map interfaces, users cannot "hover" over markers to see quick previews. They must tap each marker individually, which:

- Interrupts the exploration flow
- Requires precise tap targeting on small markers
- Doesn't allow rapid scanning of multiple POIs

### Solution

A virtual "crosshair" at the screen center that automatically detects nearby POIs and displays a floating tooltip with key information. Users can pan the map to "scan" through POIs, seeing tooltips appear and disappear smoothly.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        MapShell                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    MapContainer                          │   │
│  │  ┌─────────────────────────────────────────────────┐    │   │
│  │  │              POIMarkersLayer                     │    │   │
│  │  │  - Renders all POI markers                       │    │   │
│  │  │  - Passes autoHoveredPoiId to each marker        │    │   │
│  │  │  - Markers scale up when isAutoHovered=true      │    │   │
│  │  └─────────────────────────────────────────────────┘    │   │
│  │  ┌─────────────────────────────────────────────────┐    │   │
│  │  │            AutoHoverTooltip                      │    │   │
│  │  │  - Listens to map move/zoom events               │    │   │
│  │  │  - Finds POI nearest to screen center            │    │   │
│  │  │  - Renders floating tooltip UI                   │    │   │
│  │  │  - Notifies parent of hovered POI ID             │    │   │
│  │  └─────────────────────────────────────────────────┘    │   │
│  │  ┌─────────────────────────────────────────────────┐    │   │
│  │  │              OverlaysLayer                       │    │   │
│  │  │  - MapCenterer: handles centering with Y offset  │    │   │
│  │  │  - Accounts for drawer height                    │    │   │
│  │  └─────────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘

State Flow:
┌──────────────┐     ┌──────────────────┐     ┌───────────────┐
│ useMapCore   │────▶│ autoHoveredPoiId │────▶│ POIMarkersLayer│
│              │     └──────────────────┘     │ + AutoTooltip │
└──────────────┘                              └───────────────┘
       ▲                                              │
       │              onAutoHoverChange               │
       └──────────────────────────────────────────────┘
```

---

## Core Components

### 1. AutoHoverTooltip Component

**File:** `src/components/map/AutoHoverTooltip.tsx`

#### Props Interface

```typescript
interface AutoHoverTooltipProps {
	pois: POI[]; // Array of all POIs to check against
	onHoverPOI: (poiId: string | null) => void; // Callback when hovered POI changes
	threshold?: number; // Distance in pixels from center (default: 60)
	centerYOffset?: number; // Y offset for drawer compensation
	themeColor?: string | null; // Event theme color for accent styling
}
```

#### Core Algorithm: `findPOINearCenter()`

This is the heart of the system. It finds the closest POI to the screen center:

```typescript
const findPOINearCenter = useCallback((): EnhancedPOI | null => {
	if (!map) return null;

	// Step 1: Get viewport bounds for early filtering (performance)
	const bounds = map.getBounds();
	const mapCenter = map.getCenter();
	const mapCenterPoint = map.latLngToContainerPoint(mapCenter);

	// Step 2: Adjust center for drawer offset
	// When drawer covers bottom of screen, shift detection center UP
	const adjustedCenterY = mapCenterPoint.y - centerYOffset;

	let closestPOI: EnhancedPOI | null = null;
	let closestDistance = threshold;

	// Step 3: Filter to visible POIs only (performance optimization)
	const visiblePOIs = pois.filter((poi): poi is EnhancedPOI => {
		if (!isRichEntityType(poi) || !poi.position) return false;
		return bounds.contains([poi.position.lat, poi.position.lng]);
	});

	// Step 4: Early exit if no visible POIs
	if (visiblePOIs.length === 0) return null;

	// Step 5: Limit to 100 POIs for performance on large datasets
	const poisToCheck = visiblePOIs.length > 100 ? visiblePOIs.slice(0, 100) : visiblePOIs;

	// Step 6: Find closest POI using Euclidean distance
	poisToCheck.forEach((poi) => {
		if (!poi.position) return;
		const poiPoint = map.latLngToContainerPoint([poi.position.lat, poi.position.lng]);

		const distance = Math.sqrt(Math.pow(poiPoint.x - mapCenterPoint.x, 2) + Math.pow(poiPoint.y - adjustedCenterY, 2));

		if (distance < closestDistance) {
			closestDistance = distance;
			closestPOI = poi;
		}
	});

	return closestPOI;
}, [map, pois, threshold, centerYOffset]);
```

#### Performance Optimizations

**1. RequestAnimationFrame Throttling**

Prevents multiple updates per frame during rapid map movements:

```typescript
const rafIdRef = useRef<number | null>(null);
const isScheduledRef = useRef(false);

const throttledUpdateHover = useCallback(() => {
	// Skip if we already have a frame scheduled
	if (isScheduledRef.current) return;

	isScheduledRef.current = true;
	rafIdRef.current = requestAnimationFrame(() => {
		isScheduledRef.current = false;
		updateHover();
	});
}, [updateHover]);
```

**2. Event-Based Updates**

Only recalculate on actual map movements:

```typescript
useMapEvents({
	move: throttledUpdateHover, // Throttled during drag
	zoom: throttledUpdateHover, // Throttled during pinch
	zoomend: updateHover, // Immediate for accuracy after zoom
	moveend: updateHover, // Immediate for accuracy after pan
});
```

**3. Viewport Culling**

Only check POIs within the visible map bounds:

```typescript
const visiblePOIs = pois.filter((poi) => {
	return bounds.contains([poi.position.lat, poi.position.lng]);
});
```

---

### 2. POIMarker Component

**File:** `src/components/map/poi/POIMarker.tsx`

#### Auto-Hover Visual Feedback

When `isAutoHovered` prop is true, the marker receives visual emphasis:

```typescript
// In marker creation
if (isAutoHovered) animationClasses.push("poi-marker-autohover");
```

#### CSS Styles for Auto-Hover State

```css
/* Auto-hover state: scale up with glow effect */
.poi-marker-container.poi-marker-autohover .poi-marker-icon {
	transform: scale(1.25);
	box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.9), 0 0 20px rgba(59, 130, 246, 0.5), 0 8px 24px rgba(0, 0, 0, 0.3);
	border-width: 4px;
	z-index: 10;
}

/* Z-index elevation */
.poi-marker-container.poi-marker-autohover {
	z-index: 10;
}

/* Hide built-in title when auto-hovered (tooltip shows instead) */
.poi-marker-container.poi-marker-autohover .poi-marker-title {
	opacity: 0 !important;
	visibility: hidden !important;
	pointer-events: none;
}
```

#### Efficient Class Updates

The marker updates classes without recreating the entire marker:

```typescript
useEffect(() => {
	const container = marker.getElement()?.querySelector(".poi-marker-container");
	if (!container) return;

	if (isAutoHovered) {
		container.classList.add("poi-marker-autohover");
		marker.bringToFront(); // Ensure marker is on top
	} else {
		container.classList.remove("poi-marker-autohover");
	}
}, [isAutoHovered]);
```

---

### 3. POIMarkersLayer Component

**File:** `src/components/map/layers/POIMarkersLayer.tsx`

Passes the auto-hover state to individual markers:

```typescript
<POIMarker
	key={poi.id}
	poi={poi}
	isAutoHovered={autoHoveredPoiId === poi.id}
	// ... other props
/>
```

---

### 4. Drawer-Aware Centering

**File:** `src/components/map/layers/OverlaysLayer.tsx`

#### MapCenterer Component

Handles centering POIs with offset for bottom drawers:

```typescript
const MapCenterer = ({ target, yOffset = 0 }) => {
	const map = useMap();
	const lastTargetRef = useRef<string | null>(null);

	useEffect(() => {
		if (!target) return;

		const targetKey = `${target.lat},${target.lng}`;

		// Only re-center if target changed (not just yOffset)
		if (lastTargetRef.current === targetKey) return;
		lastTargetRef.current = targetKey;

		if (yOffset !== 0) {
			// Calculate offset position
			const targetPoint = map.project(target, map.getZoom());
			// Shift center down so marker appears higher (above drawer)
			const offsetPoint = targetPoint.add([0, yOffset]);
			const offsetLatLng = map.unproject(offsetPoint, map.getZoom());
			map.setView(offsetLatLng, map.getZoom(), { animate: true });
		} else {
			map.setView(target, map.getZoom(), { animate: true });
		}
	}, [target, yOffset, map]);

	return null;
};
```

---

### 5. State Management

**File:** `src/features/map/attendee/hooks/useMapCore.ts`

```typescript
export function useMapCore(options: UseMapCoreOptions) {
	// Auto-hover state - which POI is currently "hovered"
	const [autoHoveredPoiId, setAutoHoveredPoiId] = useState<string | null>(null);

	// ... other state

	return {
		autoHoveredPoiId,
		setAutoHoveredPoiId,
		// ... other returns
	};
}
```

---

## Integration Example

**File:** `src/features/map/attendee/components/MapShell.tsx`

```typescript
export function MapShell({
	filteredPois,
	autoHoveredPoiId,
	onAutoHoverChange,
	mapCenterYOffset = 0,
}: // ... other props
MapShellProps) {
	const { themeColor } = useMapExperience();

	return (
		<MapContainer center={center} zoom={zoom}>
			{/* POI Markers with auto-hover state */}
			<POIMarkersLayer
				pois={filteredPois}
				autoHoveredPoiId={autoHoveredPoiId}
				showTitles={false} // Titles hidden; tooltip shows instead
			/>

			{/* Auto-Hover Detection & Tooltip */}
			<AutoHoverTooltip pois={filteredPois} onHoverPOI={onAutoHoverChange} threshold={60} centerYOffset={mapCenterYOffset} themeColor={themeColor} />
		</MapContainer>
	);
}
```

---

## Drawer Height Communication

**File:** `src/components/map/panels/POIHalfSheet.tsx`

The drawer reports its height so the tooltip system can adjust:

```typescript
// In parent component
const [drawerHeightPercent, setDrawerHeightPercent] = useState(0);

// Calculate Y offset based on drawer height
const mapCenterYOffset = useMemo(() => {
  if (!isMobile || drawerHeightPercent <= 25) return 0;
  const viewportHeight = window.innerHeight;
  const drawerHeight = (drawerHeightPercent / 100) * viewportHeight;
  return drawerHeight / 2;
}, [isMobile, drawerHeightPercent]);

// Pass to MapShell
<MapShell
  mapCenterYOffset={mapCenterYOffset}
  // ...
/>

// And to POIHalfSheet to report height
<POIHalfSheet
  onDrawerHeightChange={setDrawerHeightPercent}
  // ...
/>
```

---

## Tooltip UI Design

The tooltip renders as a fixed-position overlay with:

1. **Themed header accent bar** - Uses event theme color
2. **POI name** - Truncated with max-width
3. **Category badge** - Uppercase, styled
4. **Price indicator** (if available)
5. **Rating & comment count** (if available)
6. **Connector line** - Points down to the marker

```typescript
return (
	<div
		className="fixed pointer-events-none flex flex-col items-center"
		style={{
			left: `${tooltipPosition.x}px`,
			top: `${tooltipPosition.y - totalOffset}px`,
			transform: "translateX(-50%)",
			zIndex: 650,
		}}
	>
		{/* Tooltip card */}
		<div
			className={cn(
				"relative bg-background/98 backdrop-blur-md",
				"border border-border/60 shadow-xl rounded-xl overflow-hidden",
				"animate-in fade-in-0 zoom-in-95 duration-150"
			)}
		>
			{/* Content */}
		</div>

		{/* Connector line to marker */}
		<div
			className="w-0.5 rounded-full"
			style={{
				height: `${connectorHeight}px`,
				background: `linear-gradient(to bottom, ${accentColor}, transparent)`,
			}}
		/>
	</div>
);
```

---

## Configuration Options

| Option          | Type    | Default | Description                                     |
| --------------- | ------- | ------- | ----------------------------------------------- |
| `threshold`     | number  | 60      | Distance in pixels from center to trigger hover |
| `centerYOffset` | number  | 0       | Y offset for drawer compensation                |
| `themeColor`    | string  | null    | Accent color for tooltip styling                |
| `showTitles`    | boolean | false   | Whether markers show titles by default          |

---

## Implementation Checklist for Megalithic Mapper

### Phase 1: Core Detection

- [ ] Create `AutoHoverTooltip` component
- [ ] Implement `findPOINearCenter()` algorithm
- [ ] Add RAF throttling for performance
- [ ] Set up map event listeners (move, zoom, moveend, zoomend)

### Phase 2: Visual Feedback

- [ ] Add `isAutoHovered` prop to marker component
- [ ] Create CSS styles for auto-hover state (scale, glow, z-index)
- [ ] Implement class toggling without marker recreation

### Phase 3: Tooltip UI

- [ ] Create tooltip component with your design system
- [ ] Position tooltip relative to marker
- [ ] Add entrance animation (fade-in, zoom-in)
- [ ] Style with app theme colors

### Phase 4: Drawer Integration (if applicable)

- [ ] Create drawer height reporting mechanism
- [ ] Calculate center Y offset based on drawer height
- [ ] Pass offset to both tooltip and map centerer

### Phase 5: State Management

- [ ] Add `autoHoveredPoiId` state
- [ ] Connect tooltip callback to state setter
- [ ] Pass state to markers layer

---

## Performance Considerations

1. **Limit POI checks** - Cap at 100-200 POIs per frame
2. **Viewport culling** - Only check visible POIs
3. **RAF throttling** - One update per animation frame max
4. **Memoized components** - Prevent unnecessary re-renders
5. **CSS transforms** - Use GPU-accelerated properties
6. **Ref-based callbacks** - Avoid recreation on every render

---

## Accessibility Notes

- Tooltip is `pointer-events: none` to not block interactions
- Visual feedback (scale/glow) helps identify focused POI
- Works alongside tap-to-select for users who prefer explicit selection
- Consider adding haptic feedback on mobile when POI is "acquired"
