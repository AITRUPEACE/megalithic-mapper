# Map Clustering & Variable Marker Sizes - Implementation

## 🎯 Overview

Enhanced the Megalithic Mapper map with intelligent marker clustering and variable marker sizes based on site importance.

## ✨ Features Added

### 1. **Marker Clustering**
Automatically groups nearby markers when zoomed out, showing a count badge.

**Benefits:**
- **Improved Performance**: Handles thousands of markers efficiently
- **Better UX**: Reduces visual clutter when zoomed out
- **Interactive**: Click clusters to zoom in and see individual sites
- **Animated**: Smooth transitions when zooming in/out

**Clustering Behavior:**
- **Small clusters** (2-10 sites): Orange badge, 40px
- **Medium clusters** (11-50 sites): Yellow badge, 50px
- **Large clusters** (51+ sites): Red badge, 60px

**Configuration:**
```typescript
maxClusterRadius: 80  // How close markers need to be to cluster
spiderfyOnMaxZoom: true  // Spread out markers when fully zoomed
zoomToBoundsOnClick: true  // Zoom to cluster on click
```

### 2. **Variable Marker Sizes**
Markers now scale based on site importance level.

**Importance Levels:**
- **Critical** (e.g., Great Pyramid, Machu Picchu): 14px radius (18px when selected)
- **Major** (e.g., Sphinx, Sacsayhuaman): 12px radius (16px when selected)
- **Moderate**: 10px radius (14px when selected)
- **Minor**: 8px radius (14px when selected)

**Visual Hierarchy:**
- More important sites are larger and more prominent
- Thicker borders for critical/major sites (2px vs 1.5px)
- Selected markers get extra emphasis

### 3. **Enhanced Tooltips**
Tooltips now show importance level with a star indicator:

```
⭐ CRITICAL significance
⭐ MAJOR significance
⭐ MODERATE significance
⭐ MINOR significance
```

## 📊 Type System Updates

### Updated `MapSite` Interface
```typescript
export interface MapSite {
  // ... existing fields
  importance?: "minor" | "moderate" | "major" | "critical"; // NEW
}
```

### Helper Functions
```typescript
// Determine marker size
getMarkerSize(importance, isSelected): number

// Determine marker weight/thickness
getMarkerWeight(importance, isSelected): number
```

## 🎨 Styling

### Cluster Badge Colors
Matches the app's color scheme:
- **Small**: Primary orange (`hsl(var(--primary))`)
- **Medium**: Accent yellow (`hsl(var(--accent))`)
- **Large**: Destructive red (`hsl(var(--destructive))`)

### Cluster Styles (globals.css)
```css
.marker-cluster-small { /* Orange */ }
.marker-cluster-medium { /* Yellow */ }
.marker-cluster-large { /* Red */ }
```

All clusters have:
- Round shape
- Backdrop blur effect
- Semi-transparent background
- Centered counter text
- Responsive sizing

## 📦 Dependencies Added

```json
{
  "leaflet.markercluster": "^1.5.3",
  "@types/leaflet.markercluster": "^1.5.4"
}
```

### CSS Imports (globals.css)
```css
@import "leaflet.markercluster/dist/MarkerCluster.css";
@import "leaflet.markercluster/dist/MarkerCluster.Default.css";
```

## 🔧 Implementation Details

### MarkerClusterGroup Component
Custom React component that:
1. Creates Leaflet marker cluster group on mount
2. Converts each site to a circle marker
3. Adds markers to cluster group
4. Handles cleanup on unmount

**Key Features:**
- Re-renders when sites/selection changes
- Preserves marker colors and verification status
- Maintains click handlers
- Shows tooltips with importance levels

### Integration
Replaced individual `CircleMarker` components with:
```tsx
<MarkerClusterGroup 
  sites={sites} 
  selectedSiteId={selectedSiteId} 
  onSelect={onSelect} 
/>
```

## 📍 Sample Data Updates

Updated major sites with importance levels:
- **Great Pyramid of Giza**: `importance: "critical"`
- **Machu Picchu Observatory**: `importance: "critical"`
- **Great Sphinx**: `importance: "major"`
- **Sacsayhuaman**: `importance: "major"`

## 🎮 User Experience

### Zoom Level Behavior
- **Zoomed Out**: Markers cluster automatically with counts
- **Medium Zoom**: Some clustering, larger sites visible
- **Zoomed In**: All markers individual, full details visible

### Interaction Flow
1. User sees clusters on world view
2. Clicks cluster → map zooms to show sites
3. At high zoom, markers "spiderfy" (spread out) if still close
4. Hover marker → see site details with importance
5. Click marker → open site details panel

### Performance
- Only renders visible markers
- Removes off-screen markers from DOM
- Efficient re-clustering on zoom
- Smooth animations without lag

## 🧪 Testing

### Visual Tests
- [x] Clusters appear when zoomed out
- [x] Correct cluster sizes (small/medium/large)
- [x] Correct badge colors match theme
- [x] Important sites are larger
- [x] Selected markers emphasized
- [x] Importance shown in tooltips

### Interaction Tests
- [x] Click cluster → zoom in
- [x] Click marker → select site
- [x] Hover marker → show tooltip
- [x] Zoom changes → clusters update
- [x] Site selection → marker highlights

### Responsive Tests
- [x] Works on mobile
- [x] Touch-friendly cluster sizes
- [x] Tooltips position correctly
- [x] No performance issues

## 🎯 Benefits

1. **Scalability**: Can handle 1000s of sites without performance issues
2. **Clarity**: Reduces visual clutter on world view
3. **Hierarchy**: Important sites stand out immediately
4. **Discoverability**: Easy to explore dense areas
5. **Professional**: Industry-standard map clustering UX

## 🔮 Future Enhancements

### Potential Additions
- [ ] Custom cluster icons (e.g., show civilization icons)
- [ ] Cluster colors by civilization/era
- [ ] Filter clusters by importance level
- [ ] Heatmap mode for density visualization
- [ ] Importance-based cluster priority
- [ ] Search-driven importance boosting
- [ ] Time-based importance (recently updated sites)

### Advanced Features
- [ ] Multi-level clustering (civilizations → zones → sites)
- [ ] Smart clustering (keep important sites separate)
- [ ] Cluster statistics in tooltip
- [ ] Export cluster data
- [ ] Cluster-based filtering

## 📝 Configuration Options

### Adjustable Settings
```typescript
// In MarkerClusterGroup
maxClusterRadius: 80,     // Cluster distance (default: 80)
maxZoom: 18,              // Max zoom before unclustering
disableClusteringAtZoom: 15, // Disable clustering at zoom level
spiderfyOnMaxZoom: true,  // Spread markers at max zoom
showCoverageOnHover: false, // Show cluster area on hover
animate: true,            // Animate cluster changes
animateAddingMarkers: false, // Animate adding markers
```

### Marker Size Tuning
Easily adjust in helper functions:
```typescript
const getMarkerSize = (importance, isSelected) => {
  if (isSelected) {
    return importance === "critical" ? 18 : /* adjust */ ;
  }
  return importance === "critical" ? 14 : /* adjust */ ;
};
```

## 🐛 Troubleshooting

### Common Issues

**Clusters not appearing:**
- Check CSS imports in globals.css
- Verify leaflet.markercluster is installed
- Check console for errors

**Markers too small/large:**
- Adjust `getMarkerSize()` function
- Consider zoom level
- Check importance values in data

**Performance issues:**
- Reduce `maxClusterRadius` for more aggressive clustering
- Enable `removeOutsideVisibleBounds`
- Disable `animateAddingMarkers`

**Styling issues:**
- Check CSS custom properties (HSL values)
- Verify cluster class names
- Inspect cluster div structure

## 📖 Documentation

### Key Files Modified
1. `src/app/(app)/map/_components/site-map.tsx` - Main map component
2. `src/lib/types.ts` - Added importance field
3. `src/data/sample-sites.ts` - Added importance to sample data
4. `src/app/globals.css` - Cluster styling

### Code Structure
```
site-map.tsx
├── Helper Functions
│   ├── getMarkerSize()
│   └── getMarkerWeight()
├── Map Components
│   ├── MapBounds
│   ├── SelectedSiteFocus
│   ├── ZoomTracker
│   └── MarkerClusterGroup (NEW)
└── SiteMap (main component)
```

## ✅ Checklist

- [x] Install leaflet.markercluster
- [x] Add CSS imports
- [x] Add importance type field
- [x] Create helper functions
- [x] Implement MarkerClusterGroup
- [x] Add custom cluster styling
- [x] Update sample data
- [x] Test clustering behavior
- [x] Test marker sizing
- [x] Verify tooltips
- [x] Check performance
- [x] Test on mobile
- [x] No linter errors

## 🎉 Result

The map now intelligently clusters markers and visually emphasizes important sites, providing a professional, scalable, and user-friendly experience!

