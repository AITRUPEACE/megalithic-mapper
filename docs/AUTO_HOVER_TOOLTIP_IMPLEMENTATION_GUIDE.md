# Auto-Hover Tooltip - Implementation Guide

A concise guide for implementing the center-screen POI detection and tooltip system.

## Quick Start

### 1. Core Component Structure

```
YourMapContainer/
├── POIMarkersLayer          # Renders markers, passes autoHoveredId
├── AutoHoverTooltip         # Detection + tooltip rendering
└── MapCenterer              # Optional: centers with drawer offset
```

### 2. Minimal Implementation

```typescript
// AutoHoverTooltip.tsx
import { useEffect, useState, useRef, useCallback } from "react";
import { useMap, useMapEvents } from "react-leaflet";

interface Props {
	pois: POI[];
	onHoverPOI: (poiId: string | null) => void;
	threshold?: number; // pixels from center
}

export function AutoHoverTooltip({ pois, onHoverPOI, threshold = 60 }: Props) {
	const map = useMap();
	const [hoveredPOI, setHoveredPOI] = useState<POI | null>(null);
	const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

	// RAF throttling refs
	const rafId = useRef<number | null>(null);
	const scheduled = useRef(false);

	// Core algorithm: find POI nearest to screen center
	const findPOINearCenter = useCallback((): POI | null => {
		if (!map) return null;

		const bounds = map.getBounds();
		const centerPoint = map.latLngToContainerPoint(map.getCenter());

		let closest: POI | null = null;
		let closestDist = threshold;

		// Filter to visible POIs only
		const visible = pois.filter(
			(p) => p.position && bounds.contains([p.position.lat, p.position.lng])
		);

		for (const poi of visible.slice(0, 100)) {
			// Cap for performance
			if (!poi.position) continue;

			const point = map.latLngToContainerPoint([poi.position.lat, poi.position.lng]);

			const dist = Math.hypot(point.x - centerPoint.x, point.y - centerPoint.y);

			if (dist < closestDist) {
				closestDist = dist;
				closest = poi;
			}
		}

		return closest;
	}, [map, pois, threshold]);

	// Update hover state and tooltip position
	const updateHover = useCallback(() => {
		const nearby = findPOINearCenter();

		if (nearby?.id !== hoveredPOI?.id) {
			setHoveredPOI(nearby);
			onHoverPOI(nearby?.id ?? null);
		}

		// Always update tooltip position (for smooth following)
		if (nearby?.position) {
			const point = map.latLngToContainerPoint([nearby.position.lat, nearby.position.lng]);
			setTooltipPos({ x: point.x, y: point.y });
		} else {
			setTooltipPos(null);
		}
	}, [findPOINearCenter, hoveredPOI?.id, map, onHoverPOI]);

	// Throttle to one update per frame
	const throttledUpdate = useCallback(() => {
		if (scheduled.current) return;
		scheduled.current = true;
		rafId.current = requestAnimationFrame(() => {
			scheduled.current = false;
			updateHover();
		});
	}, [updateHover]);

	// Cleanup RAF on unmount
	useEffect(() => {
		return () => {
			if (rafId.current) cancelAnimationFrame(rafId.current);
		};
	}, []);

	// Listen to map events
	useMapEvents({
		move: throttledUpdate,
		zoom: throttledUpdate,
		moveend: updateHover, // Immediate on end for accuracy
		zoomend: updateHover,
	});

	if (!hoveredPOI || !tooltipPos) return null;

	return (
		<div
			className="fixed pointer-events-none"
			style={{
				left: tooltipPos.x,
				top: tooltipPos.y - 50, // Offset above marker
				transform: "translateX(-50%)",
				zIndex: 1000,
			}}
		>
			{/* Your tooltip UI here */}
			<div className="bg-white rounded-lg shadow-lg p-2">
				<div className="font-semibold">{hoveredPOI.title}</div>
			</div>
		</div>
	);
}
```

### 3. State Management in Parent

```typescript
function MapView() {
	const [autoHoveredPoiId, setAutoHoveredPoiId] = useState<string | null>(null);

	return (
		<MapContainer>
			<POIMarkersLayer pois={pois} autoHoveredPoiId={autoHoveredPoiId} />
			<AutoHoverTooltip pois={pois} onHoverPOI={setAutoHoveredPoiId} threshold={60} />
		</MapContainer>
	);
}
```

### 4. Marker Visual Feedback

```typescript
// In POIMarker component
interface POIMarkerProps {
	poi: POI;
	isAutoHovered?: boolean;
}

function POIMarker({ poi, isAutoHovered }: POIMarkerProps) {
	const markerRef = useRef<L.Marker>(null);

	useEffect(() => {
		const el = markerRef.current?.getElement();
		if (!el) return;

		const container = el.querySelector(".marker-container");
		if (isAutoHovered) {
			container?.classList.add("marker-autohover");
			markerRef.current?.bringToFront();
		} else {
			container?.classList.remove("marker-autohover");
		}
	}, [isAutoHovered]);

	// ... render marker
}
```

### 5. CSS for Auto-Hover State

```css
.marker-container.marker-autohover {
	z-index: 100;
}

.marker-container.marker-autohover .marker-icon {
	transform: scale(1.25);
	box-shadow: 0 0 0 3px white, 0 0 20px rgba(59, 130, 246, 0.5);
	transition: transform 0.15s ease, box-shadow 0.15s ease;
}
```

---

## Advanced: Drawer Offset

When a bottom drawer is open, adjust the detection center:

```typescript
// In parent component
const [drawerHeight, setDrawerHeight] = useState(0);

// Calculate Y offset (shift detection center UP by half drawer height)
const centerYOffset = useMemo(() => {
	if (drawerHeight <= 0) return 0;
	return drawerHeight / 2;
}, [drawerHeight]);

// Pass to AutoHoverTooltip
<AutoHoverTooltip
	centerYOffset={centerYOffset}
	// ...
/>;

// In AutoHoverTooltip's findPOINearCenter:
const adjustedCenterY = centerPoint.y - centerYOffset;

// Use adjustedCenterY in distance calculation:
const dist = Math.hypot(
	point.x - centerPoint.x,
	point.y - adjustedCenterY // <-- Use adjusted Y
);
```

---

## Key Takeaways

| Concept                | Why                                      |
| ---------------------- | ---------------------------------------- |
| **Viewport culling**   | Only check POIs visible on screen        |
| **Cap iterations**     | Limit to ~100 POIs per check             |
| **RAF throttling**     | Max one calculation per frame            |
| **Event-based**        | Only run on map move/zoom, not intervals |
| **Refs for callbacks** | Avoid marker recreation                  |
| **CSS transforms**     | GPU-accelerated visual feedback          |

---

## Files to Reference

| File                                                | Purpose                |
| --------------------------------------------------- | ---------------------- |
| `src/components/map/AutoHoverTooltip.tsx`           | Full implementation    |
| `src/components/map/poi/POIMarker.tsx`              | Marker with auto-hover |
| `src/components/map/layers/POIMarkersLayer.tsx`     | Layer integration      |
| `src/features/map/attendee/components/MapShell.tsx` | Composition example    |
| `src/features/map/attendee/hooks/useMapCore.ts`     | State management       |
