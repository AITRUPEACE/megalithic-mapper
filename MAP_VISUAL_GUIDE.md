# Marker Clustering & Sizing - Visual Guide

## 🎯 Marker Size Comparison

### Before (Old System)
```
All markers same size: ⚫ (10px) or ⚫ (14px when selected)
No clustering
```

### After (New System)

#### Unselected Markers
```
Minor:      ⚫ (8px)   - Small community contributions
Moderate:   ⚫ (10px)  - Standard verified sites
Major:      ⚫ (12px)  - Significant historical sites
Critical:   ⚫ (14px)  - World Heritage level
```

#### Selected Markers
```
Minor:      ⚫ (14px)  - Emphasized
Moderate:   ⚫ (14px)  - Emphasized
Major:      ⚫ (16px)  - Large and prominent
Critical:   ⚫ (18px)  - Maximum prominence
```

## 🎨 Cluster Badge Visualization

### Small Cluster (2-10 sites)
```
   ┌─────────┐
   │    5    │  ← 40px, Orange/Primary
   └─────────┘
```

### Medium Cluster (11-50 sites)
```
   ┌───────────┐
   │    23     │  ← 50px, Yellow/Accent
   └───────────┘
```

### Large Cluster (51+ sites)
```
   ┌─────────────┐
   │     127     │  ← 60px, Red/Destructive
   └─────────────┘
```

## 🗺️ Map View Examples

### World View (Zoomed Out)
```
                      🌍 World Map
     ┌─────────────────────────────────────────┐
     │                                          │
     │    ⭕ 15         ⭕ 23                   │
     │  Egypt        Peru                      │
     │                              ⭕ 8        │
     │                            UK           │
     │         ⭕ 34                           │
     │       Americas                          │
     │                                          │
     │    ⭕ 12                                │
     │  Africa                                 │
     └─────────────────────────────────────────┘
```
*Clusters automatically group nearby markers*

### Regional View (Medium Zoom)
```
              🗺️ Mediterranean Region
     ┌─────────────────────────────────────────┐
     │                                          │
     │     ⭕ 5        ⚫ ⚫                    │
     │   Egypt       Greece                    │
     │                                          │
     │  ⚫ ⚫ ⚫                                │
     │  Turkey                                  │
     │                    ⚫                    │
     │                 Italy                    │
     └─────────────────────────────────────────┘
```
*Mix of clusters and individual markers*

### Site View (Zoomed In)
```
           📍 Giza Plateau (High Zoom)
     ┌─────────────────────────────────────────┐
     │                                          │
     │              ⚫⚫⚫                      │
     │              Critical                    │
     │            (Great Pyramid)               │
     │                                          │
     │         ⚫⚫                             │
     │         Major                            │
     │       (Sphinx)                           │
     │                                          │
     │     ⚫         ⚫      ⚫                │
     │   Moderate  Moderate  Minor              │
     │                                          │
     └─────────────────────────────────────────┘
```
*All markers visible with size hierarchy*

## 🎯 Importance Level Examples

### Critical Importance ⭐⭐⭐⭐
**Sites that define civilizations or represent unique achievements**
- Great Pyramid of Giza
- Machu Picchu
- Stonehenge
- Angkor Wat
- Teotihuacan

**Characteristics:**
- Largest markers (14px → 18px)
- Maximum visual prominence
- Often World Heritage Sites
- Extensive research projects
- High media count

### Major Importance ⭐⭐⭐
**Significant sites with substantial historical/archaeological value**
- Great Sphinx of Giza
- Sacsayhuaman
- Luxor Temple
- Palenque
- Chichén Itzá

**Characteristics:**
- Large markers (12px → 16px)
- Strong visual presence
- Important research subjects
- Multiple research projects
- Verified contributions

### Moderate Importance ⭐⭐
**Well-documented sites with historical significance**
- Regional temples
- Secondary pyramids
- Major tombs
- Archaeological zones
- City ruins

**Characteristics:**
- Medium markers (10px → 14px)
- Standard visual presence
- Active research
- Community contributions
- Growing documentation

### Minor Importance ⭐
**Local sites or recently discovered locations**
- Small shrines
- Local monuments
- Community findings
- Preliminary sites
- Under investigation

**Characteristics:**
- Small markers (8px → 14px when selected)
- Subtle presence when unselected
- Emerging research
- Community driven
- Building documentation

## 📊 Tooltip Display

### Critical Site Tooltip
```
┌──────────────────────────────┐
│ Great Pyramid of Giza        │
│ Ancient Egyptian             │
│ pyramid                      │
│ ⭐ CRITICAL significance     │
│ 📍 Giza Plateau              │
│ Egypt                        │
│ OFFICIAL DATASET             │
└──────────────────────────────┘
```

### Minor Site Tooltip
```
┌──────────────────────────────┐
│ Local Temple Ruins           │
│ Ancient Egyptian             │
│ temple                       │
│ ⭐ MINOR significance        │
│ 📍 Upper Egypt               │
│ Egypt                        │
│ COMMUNITY BRONZE TIER        │
└──────────────────────────────┘
```

## 🔄 Clustering Behavior

### Zoom Level 3 (World View)
```
Sites within 80px radius → Cluster
Result: ~10-20 clusters worldwide
```

### Zoom Level 6 (Continental)
```
Sites within 80px radius → Cluster
Result: ~30-50 clusters per continent
```

### Zoom Level 10 (Regional)
```
Sites within 80px radius → Cluster
Result: Mix of clusters and individual markers
```

### Zoom Level 15+ (Site Level)
```
No clustering - all individual markers
Sites "spiderfy" if still overlapping
```

## 🎨 Color Coding

### By Layer & Status
```
Official Sites:
✓ Verified:     🟢 Green
⏳ Under Review: 🟡 Orange
❌ Unverified:   🔴 Red

Community Sites:
🥉 Bronze:       🟠 Orange
🥈 Silver:       ⚪ Gray
🥇 Gold:         🟡 Yellow
⭐ Promoted:     🟢 Green
```

### By Cluster Size
```
Small (2-10):    🟠 Orange (Primary)
Medium (11-50):  🟡 Yellow (Accent)
Large (51+):     🔴 Red (Destructive)
```

## 🎯 Use Cases

### Researcher Exploring New Region
1. Zooms to continent → Sees 5-10 clusters
2. Identifies dense areas → Clicks largest cluster
3. Zooms in → Sees major sites stand out (larger)
4. Hovers critical site → Sees importance level
5. Clicks → Opens full details

### User Looking for Specific Site
1. Uses search or filters
2. Map auto-zooms to site
3. Critical sites immediately visible (largest)
4. Surrounding context shown with smaller markers
5. Easy to identify target vs surroundings

### Casual Explorer
1. Pans around world map
2. Notices cluster density patterns
3. Clicks interesting cluster → Discovers sites
4. Large markers draw attention to famous sites
5. Small markers show depth of catalog

## 📱 Mobile Considerations

### Touch Targets
```
Minimum touch target: 44x44px
Cluster badges: 40-60px (easily tappable)
Critical markers: 18px + padding (adequate)
Spiderfy: Spreads markers for easier tapping
```

### Performance
```
Clustering: Reduces DOM nodes significantly
Visibility culling: Only renders visible markers
Smooth animations: Hardware accelerated
No lag: Even with 1000+ sites
```

## 🎓 Best Practices

### Assigning Importance Levels

**Critical:**
- UNESCO World Heritage Sites
- Define civilization milestones
- Unique in the world
- Extensive research base
- High visitor interest

**Major:**
- Regional significance
- Well-documented
- Active research
- Strong evidence
- Notable features

**Moderate:**
- Verified sites
- Standard documentation
- Growing research
- Local significance
- Clear context

**Minor:**
- Initial documentation
- Community findings
- Under investigation
- Supplementary sites
- Local interest

### Clustering Configuration

**Dense Urban Areas:**
```typescript
maxClusterRadius: 60  // Tighter clustering
```

**Rural/Spread Sites:**
```typescript
maxClusterRadius: 100  // Looser clustering
```

**High Detail Needed:**
```typescript
disableClusteringAtZoom: 12  // Uncluster earlier
```

## ✨ Visual Hierarchy Summary

```
Zoom Out:  Clusters (density pattern) 
    ↓
Zoom In:   Critical sites emerge (largest)
    ↓
Close Up:  All sites visible (sized by importance)
    ↓
Selected:  Emphasized (larger + highlighted)
```

This creates a natural discovery flow where important sites are always prominent while maintaining a clean, uncluttered interface!

