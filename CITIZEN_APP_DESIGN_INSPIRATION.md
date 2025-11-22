# Citizen App Design Inspiration for Megalithic Mapper

> Based on analysis of Citizen app (crime/incident reporting) and adapting patterns for archaeological field work

## Executive Summary

The Citizen app provides an excellent reference for map-based field reporting with community engagement. While Citizen focuses on real-time crime/incident reporting, many of its UX patterns translate beautifully to archaeological site discovery and field documentation.

**Key Insight from Citizen**: The app successfully balances information density with mobile usability through a progressive disclosure model - starting with the map view, expanding to half-screen details on tap, and allowing full-screen deep dive through natural scroll behavior.

---

## 1. Core UI Patterns from Citizen

### 1.1 Bottom Navigation (Priority: HIGH)

**Citizen's Pattern:**

- Map (primary view)
- People/Social (community feed)
- Report (FAB-style center button)
- Notifications (alerts)

**Adapted for Megalithic Mapper:**

```
[Map] [Discover] [+ Report] [Community] [Profile]
```

**Current State:** ✅ Already implemented in `mobile-navbar.tsx`

- Map, Discover, Forum, Media, Texts

**Recommendation:** Consider adding a prominent "Report Site" FAB button

- Could be center position (Citizen style)
- Or floating FAB on map screen
- Quick access to field reporting/photo upload

### 1.2 Search FAB (Floating Action Button) - Top Right

**Citizen's Pattern:**

- Persistent search button top-right
- Overlays map content
- Opens search overlay/modal

**Current State:** ❌ Not implemented

- Search is embedded in filters component
- Not easily accessible in one tap

**Recommendation: HIGH PRIORITY**

```tsx
// Add to SiteMap component
<Button className="absolute right-4 top-16 z-[400] rounded-full shadow-lg" size="icon">
	<Search className="h-5 w-5" />
</Button>
```

---

## 2. Progressive Detail Disclosure (CRITICAL PATTERN)

### 2.1 The Citizen Drawer Pattern

This is Citizen's killer feature for mobile UX:

**Three States:**

1. **Collapsed** - Map only, markers visible
2. **Half-screen** - Map top (50%), Details bottom (50%)
3. **Expanded** - Details fill screen as user scrolls down

**How It Works:**

```
User taps marker
  ↓
Drawer slides up from bottom (50% height)
  ↓
Map auto-centers on selected POI (top half)
  ↓
Details show in bottom half with scroll
  ↓
As user scrolls down, drawer expands to ~90% height
  ↓
Swipe down or back button collapses drawer
```

**Current State:** ⚠️ Partially implemented

- Have `SiteDetailDrawer` component (lines 175-203 in site-explorer.tsx)
- But it's modal-style, not progressive
- Doesn't maintain map visibility
- No scroll-to-expand behavior

### 2.2 Implementation Recommendations

**Create New Component: `ProgressiveDetailDrawer.tsx`**

```tsx
interface ProgressiveDetailDrawerProps {
	site: MapSite | null;
	open: boolean;
	onClose: () => void;
}

// Three states: closed, peek (50%), expanded (90%)
type DrawerState = "closed" | "peek" | "expanded";

export const ProgressiveDetailDrawer = ({ site, open, onClose }) => {
	const [drawerState, setDrawerState] = useState<DrawerState>("closed");
	const [scrollY, setScrollY] = useState(0);

	// When drawer opens, start in 'peek' mode
	useEffect(() => {
		if (open && site) {
			setDrawerState("peek");
		} else {
			setDrawerState("closed");
		}
	}, [open, site]);

	// Monitor scroll to expand drawer
	const handleScroll = (e: UIEvent<HTMLDivElement>) => {
		const scrollTop = e.currentTarget.scrollTop;
		setScrollY(scrollTop);

		// Expand when user scrolls down
		if (scrollTop > 50 && drawerState === "peek") {
			setDrawerState("expanded");
		}
	};

	const heightClass = {
		closed: "h-0",
		peek: "h-[50vh]",
		expanded: "h-[90vh]",
	}[drawerState];

	return (
		<div
			className={cn(
				"fixed bottom-0 left-0 right-0 z-[450]",
				"bg-background/95 backdrop-blur-xl",
				"rounded-t-3xl shadow-2xl border-t border-border/40",
				"transition-all duration-300 ease-out",
				heightClass,
				!open && "pointer-events-none"
			)}
		>
			{/* Drag handle */}
			<div className="flex justify-center pt-2 pb-1">
				<div className="w-12 h-1 bg-muted-foreground/30 rounded-full" />
			</div>

			{/* Scrollable content */}
			<div className="h-full overflow-y-auto px-4 pb-safe" onScroll={handleScroll}>
				{site && <SiteDetailContent site={site} />}
			</div>

			{/* Close button */}
			<button className="absolute top-4 right-4 z-10" onClick={onClose}>
				<X className="h-5 w-5" />
			</button>
		</div>
	);
};
```

**Key Features to Add:**

- ✨ Drag gesture to dismiss (swipe down)
- ✨ Smooth spring animations (use `framer-motion`)
- ✨ Map stays visible in peek mode
- ✨ Elastic scroll boundaries
- ✨ Safe area support for notched phones

---

## 3. "Nearby Sites" Section (From Citizen)

### 3.1 Pattern Description

After viewing a POI's details, Citizen shows nearby incidents with:

- Distance from current POI
- Incident type with icon
- Time stamp
- Quick tap to view

### 3.2 Implementation for Megalithic Mapper

**Add to Site Detail Panel:**

```tsx
// In site-detail-panel.tsx, add new tab or section

const NearbySitesSection = ({ currentSite, allSites }: Props) => {
	const nearbySites = useMemo(() => {
		return allSites
			.filter((s) => s.id !== currentSite.id)
			.map((site) => ({
				...site,
				distance: calculateDistance(currentSite.latitude, currentSite.longitude, site.latitude, site.longitude),
			}))
			.sort((a, b) => a.distance - b.distance)
			.slice(0, 10); // Top 10 nearest
	}, [currentSite, allSites]);

	return (
		<div className="space-y-3">
			<h3 className="text-sm font-semibold">Nearby Sites</h3>
			{nearbySites.map((site) => (
				<button key={site.id} onClick={() => onSelectSite(site.id)} className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-muted/50">
					{/* Site icon based on type */}
					<SiteIcon type={site.siteType} />

					<div className="flex-1 text-left">
						<p className="text-sm font-medium">{site.name}</p>
						<p className="text-xs text-muted-foreground">
							{site.civilization} • {site.siteType}
						</p>
					</div>

					{/* Distance badge */}
					<Badge variant="secondary" className="text-xs">
						{formatDistance(site.distance)}
					</Badge>
				</button>
			))}
		</div>
	);
};

// Distance calculation utility
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
	const R = 6371; // Earth's radius in km
	const dLat = toRad(lat2 - lat1);
	const dLon = toRad(lon2 - lon1);
	const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return R * c;
}

function formatDistance(km: number): string {
	if (km < 1) return `${Math.round(km * 1000)}m`;
	return `${km.toFixed(1)}km`;
}

function toRad(deg: number): number {
	return deg * (Math.PI / 180);
}
```

---

## 4. Site-Specific Chat/Comments (From Citizen)

### 4.1 Citizen's Pattern

- Full-width chat input at bottom of detail view
- Expandable to full-screen chat window
- Real-time community discussion
- Photo/video attachments

### 4.2 Adapted for Archaeological Context

**Use Case:** Researchers/enthusiasts discuss findings at specific sites

```tsx
// Add to SiteDetailPanel as new tab or bottom section

const SiteChatSection = ({ siteId }: { siteId: string }) => {
	const [messages, setMessages] = useState([]);
	const [inputValue, setInputValue] = useState("");

	return (
		<div className="flex flex-col h-full">
			{/* Messages list */}
			<div className="flex-1 overflow-y-auto space-y-3 p-4">
				{messages.map((msg) => (
					<div key={msg.id} className="flex gap-3">
						<Avatar user={msg.author} />
						<div className="flex-1">
							<p className="text-xs text-muted-foreground">
								{msg.author.name} • {timeAgo(msg.timestamp)}
							</p>
							<p className="text-sm mt-1">{msg.content}</p>
							{msg.photos && (
								<div className="flex gap-2 mt-2">
									{msg.photos.map((photo) => (
										<img key={photo.id} src={photo.thumbnailUrl} className="w-16 h-16 rounded object-cover" />
									))}
								</div>
							)}
						</div>
					</div>
				))}
			</div>

			{/* Input area */}
			<div className="border-t border-border/40 p-3 flex gap-2">
				<Input placeholder="Add observation or question..." value={inputValue} onChange={(e) => setInputValue(e.target.value)} className="flex-1" />
				<Button size="icon" variant="ghost">
					<Camera className="h-5 w-5" />
				</Button>
				<Button size="icon">
					<Send className="h-5 w-5" />
				</Button>
			</div>
		</div>
	);
};
```

---

## 5. Quick Photo/Video Upload at Site (Citizen Pattern)

### 5.1 Pattern from Citizen

- Users can quickly upload media directly from incident view
- Shows up in real-time feed
- Tagged with location and timestamp
- Community can view and verify

### 5.2 Field Report Quick Action

**Add FAB on Map View:**

```tsx
// In SiteMap component or site-explorer
const [showQuickReport, setShowQuickReport] = useState(false);

<>
	{/* Quick Report FAB */}
	<Button
		className="fixed bottom-24 right-6 z-[450] rounded-full shadow-2xl h-14 w-14 md:hidden"
		size="icon"
		onClick={() => setShowQuickReport(true)}
	>
		<Camera className="h-6 w-6" />
	</Button>

	{/* Quick Report Sheet */}
	<Sheet open={showQuickReport} onOpenChange={setShowQuickReport}>
		<SheetContent side="bottom" className="h-[80vh]">
			<SheetHeader>
				<SheetTitle>Quick Field Report</SheetTitle>
				<SheetDescription>Document a finding at your current location</SheetDescription>
			</SheetHeader>

			<div className="space-y-4 mt-4">
				{/* Camera capture */}
				<div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
					<Button variant="outline" size="lg">
						<Camera className="h-5 w-5 mr-2" />
						Take Photo
					</Button>
				</div>

				{/* Quick fields */}
				<Select>
					<SelectTrigger>
						<SelectValue placeholder="Site type" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="mound">Mound</SelectItem>
						<SelectItem value="stone">Stone Circle</SelectItem>
						<SelectItem value="ruins">Ruins</SelectItem>
					</SelectContent>
				</Select>

				<Textarea placeholder="Describe what you found..." rows={4} />

				{/* Location auto-filled from GPS */}
				<div className="text-xs text-muted-foreground">
					📍 Location: {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
				</div>

				<Button className="w-full">Submit Field Report</Button>
			</div>
		</SheetContent>
	</Sheet>
</>;
```

---

## 6. Shield Feature Inspiration

### 6.1 Citizen's "Shield" Feature

From the UX case study, this allows users to:

- Draw a perimeter around their neighborhood
- Only see alerts within their shield
- Reduces anxiety from city-wide crime reporting
- User-controlled information filtering

### 6.2 Adapted: "Research Boundary" or "Expedition Zone"

**Use Cases for Megalithic Mapper:**

- Define research expedition areas
- Create "watch zones" for sites of interest
- Filter map to show only sites within boundary
- Get notifications for new discoveries in zone

**Implementation Concept:**

```tsx
const ResearchBoundaryTool = () => {
	const [isDrawing, setIsDrawing] = useState(false);
	const [boundary, setBoundary] = useState<LatLng[]>([]);

	return (
		<>
			<Button variant="outline" onClick={() => setIsDrawing(true)} className="absolute left-4 bottom-4 z-[400]">
				<Target className="h-4 w-4 mr-2" />
				Define Research Zone
			</Button>

			{isDrawing && (
				<DrawingOverlay
					onComplete={(coords) => {
						setBoundary(coords);
						setIsDrawing(false);
					}}
				/>
			)}

			{boundary.length > 0 && (
				<Polygon
					positions={boundary}
					pathOptions={{
						color: "#3b82f6",
						weight: 3,
						fillOpacity: 0.1,
					}}
				/>
			)}
		</>
	);
};
```

---

## 7. Custom Marker Icons & Previews

### 7.1 Citizen's Approach

- Different icons for incident types (fire, crime, accident)
- Size varies by severity/importance
- Color coding for status
- Preview images in markers at high zoom

### 7.2 Current Implementation

✅ Already well implemented in `site-map.tsx`:

- Custom pin icons with badges
- Size based on importance
- Color by verification status
- Hover tooltips with rich info

**Enhancement Ideas:**

```tsx
// Add photo previews to markers at high zoom (>14)
const createPhotoPreviewMarker = (site: MapSite, zoom: number) => {
	if (zoom < 14 || !site.primaryPhoto) {
		return createCustomPinIcon(site, isSelected);
	}

	// Show photo preview at high zoom
	const html = `
    <div class="photo-marker">
      <img src="${site.primaryPhoto.thumbnailUrl}" />
      <div class="marker-badge">${site.name}</div>
    </div>
  `;

	return L.divIcon({
		html,
		className: "photo-marker-wrapper",
		iconSize: [60, 60],
	});
};
```

---

## 8. Mobile-First Interaction Patterns

### 8.1 Touch Gestures from Citizen

**Essential Touch Interactions:**

1. **Tap marker** → Open detail drawer (peek mode)
2. **Drag drawer handle** → Dismiss or expand
3. **Swipe down** → Close drawer
4. **Long press marker** → Quick actions menu
5. **Pinch zoom** → Map zoom (already supported by Leaflet)
6. **Double tap** → Zoom to site

### 8.2 Haptic Feedback

```tsx
// Add subtle haptics for touch interactions
const triggerHaptic = (type: "light" | "medium" | "heavy") => {
	if ("vibrate" in navigator) {
		const patterns = {
			light: 10,
			medium: 20,
			heavy: 30,
		};
		navigator.vibrate(patterns[type]);
	}
};

// Use on marker selection
const handleMarkerSelect = (siteId: string) => {
	triggerHaptic("light");
	selectSite(siteId);
};
```

---

## 9. Performance Optimizations (Citizen-Inspired)

### 9.1 Marker Clustering

✅ Already implemented with `leaflet.markercluster`

### 9.2 Lazy Loading for Details

```tsx
// Only load full site details when drawer opens
const SiteDetailPanel = ({ siteId }: { siteId: string | null }) => {
	const { data: site, isLoading } = useSiteDetails(siteId, {
		enabled: !!siteId, // Only fetch when selected
	});

	if (!siteId) return <EmptyState />;
	if (isLoading) return <Skeleton />;

	return <DetailContent site={site} />;
};
```

### 9.3 Viewport-Based Loading

```tsx
// Only load markers in current viewport + buffer
const useViewportSites = (allSites: MapSite[], mapBounds: L.LatLngBounds | null) => {
	return useMemo(() => {
		if (!mapBounds) return allSites;

		const buffer = 0.5; // degrees
		return allSites.filter((site) => {
			const lat = site.latitude;
			const lng = site.longitude;
			return (
				lat >= mapBounds.getSouth() - buffer &&
				lat <= mapBounds.getNorth() + buffer &&
				lng >= mapBounds.getWest() - buffer &&
				lng <= mapBounds.getEast() + buffer
			);
		});
	}, [allSites, mapBounds]);
};
```

---

## 10. Priority Implementation Roadmap

### Phase 1: Core Mobile UX (Week 1-2)

1. ✅ **Progressive Detail Drawer** - Citizen's peek/expand pattern
2. ✅ **Search FAB** - Top-right floating search button
3. ✅ **Quick Report FAB** - Camera icon bottom-right
4. ✅ **Touch Gestures** - Swipe to dismiss, drag handle

### Phase 2: Community Features (Week 3-4)

5. **Nearby Sites Section** - With distance calculations
6. **Site-Specific Comments** - Chat/discussion per site
7. **Photo Upload** - Quick capture and attach to site
8. **Activity Feed** - Recent discoveries and updates

### Phase 3: Advanced Features (Week 5-6)

9. **Research Boundary Tool** - Citizen's "Shield" adapted
10. **Photo Preview Markers** - At high zoom levels
11. **Offline Mode** - Download areas for field work
12. **Haptic Feedback** - Subtle touch responses

### Phase 4: Polish (Week 7-8)

13. **Animations** - Spring physics for drawer
14. **Loading States** - Skeleton screens
15. **Error States** - Offline/network error handling
16. **Accessibility** - Screen reader support

---

## 11. Mobile-Specific Design Tokens

### 11.1 Spacing for Touch Targets

```css
/* Minimum touch target: 44x44px (iOS HIG) */
.touch-target {
	min-width: 44px;
	min-height: 44px;
}

/* Safe area padding for notched phones */
.safe-top {
	padding-top: max(1rem, env(safe-area-inset-top));
}

.safe-bottom {
	padding-bottom: max(1rem, env(safe-area-inset-bottom));
}
```

### 11.2 Mobile Breakpoints

```tsx
// Tailwind config
const mobileBreakpoints = {
	xs: "375px", // iPhone SE
	sm: "640px", // Default Tailwind
	md: "768px", // Tablet
	lg: "1024px", // Desktop
};
```

---

## 12. Key Takeaways from Citizen App Study

### What Made Citizen's UX Successful:

1. **Progressive Disclosure** - Don't overwhelm with all info at once
2. **Context-Aware Actions** - Right actions at right time
3. **Visual Hierarchy** - Important info stands out
4. **Community Trust** - Multiple data sources with badges
5. **Speed** - Fast interactions, no unnecessary steps

### What to Avoid (Citizen's Lessons):

1. **Information Overload** - Too many alerts = anxiety
2. **Unclear Verification** - Need trust indicators
3. **Feature Creep** - Keep core experience simple
4. **Navigation Depth** - Max 2-3 taps to any feature

### Archaeological Context Differences:

| Citizen (Crime)    | Megalithic Mapper (Archaeology) |
| ------------------ | ------------------------------- |
| Real-time urgency  | Historical/timeless             |
| Frequent updates   | Slow-changing data              |
| Nearby danger      | Nearby history                  |
| Emotional response | Intellectual curiosity          |
| Quick actions      | Detailed documentation          |

---

## 13. Component Checklist

### New Components Needed:

- [ ] `ProgressiveDetailDrawer` - Main mobile interaction
- [ ] `SearchFAB` - Floating search button
- [ ] `QuickReportFAB` - Camera/field report
- [ ] `NearbySitesList` - Distance-based recommendations
- [ ] `SiteChatPanel` - Community discussion per site
- [ ] `QuickPhotoUpload` - Camera capture component
- [ ] `ResearchBoundaryTool` - Draw perimeter on map
- [ ] `TouchGestureWrapper` - Handle swipes/drags

### Enhanced Components:

- [ ] `SiteMap` - Add FAB buttons, touch gestures
- [ ] `SiteDetailPanel` - Add nearby sites, chat sections
- [ ] `MobileNavbar` - Consider center FAB style
- [ ] `SiteMarker` - Photo previews at high zoom

---

## 14. Code Examples Repository

### Touch Gesture Handler

```tsx
import { useGesture } from "@use-gesture/react";

const useDragToDismiss = (onDismiss: () => void) => {
	const bind = useGesture({
		onDrag: ({ movement: [, my], velocity: [, vy], direction: [, dy] }) => {
			// Dismiss if dragged down > 100px or fast swipe down
			if ((my > 100 && dy > 0) || (vy > 0.5 && dy > 0)) {
				onDismiss();
			}
		},
	});

	return bind;
};

// Usage in drawer
const DrawerWithGestures = ({ onClose }) => {
	const bind = useDragToDismiss(onClose);

	return (
		<div {...bind()} className="drawer">
			<div className="drag-handle" />
			{/* content */}
		</div>
	);
};
```

### Progressive Disclosure Animation

```tsx
import { motion, useAnimation } from "framer-motion";

const AnimatedDrawer = ({ isOpen, state }) => {
	const controls = useAnimation();

	useEffect(() => {
		if (state === "peek") {
			controls.start({ height: "50vh", transition: { type: "spring", damping: 25 } });
		} else if (state === "expanded") {
			controls.start({ height: "90vh", transition: { type: "spring", damping: 25 } });
		}
	}, [state, controls]);

	return (
		<motion.div animate={controls} initial={{ height: 0 }} className="drawer">
			{/* content */}
		</motion.div>
	);
};
```

---

## 15. Testing Checklist

### Mobile Device Testing:

- [ ] iPhone SE (small screen)
- [ ] iPhone 14 Pro (notch)
- [ ] Samsung Galaxy (Android)
- [ ] iPad (tablet)

### Interaction Testing:

- [ ] Tap marker → drawer opens
- [ ] Scroll down in drawer → expands
- [ ] Swipe down → dismisses
- [ ] Pinch zoom → map zooms
- [ ] Long press → quick actions

### Performance Testing:

- [ ] 1000+ markers load smoothly
- [ ] Drawer animation 60fps
- [ ] Photo upload works offline
- [ ] Network error handling

---

## Conclusion

The Citizen app demonstrates that complex, information-dense applications can have excellent mobile UX through:

1. **Progressive disclosure** (peek → expand pattern)
2. **Context-aware actions** (quick report, nearby items)
3. **Community features** (chat, photo sharing)
4. **Smart filtering** (Shield/boundary feature)

For Megalithic Mapper, these patterns translate into a field-work-optimized mobile experience where researchers can quickly document sites, view nearby discoveries, and collaborate with the community - all while maintaining the detailed academic rigor required for archaeological work.

**Next Step**: Implement Phase 1 components (Progressive Drawer, FABs) as proof-of-concept, then gather user feedback from archaeologists/enthusiasts in the field.
