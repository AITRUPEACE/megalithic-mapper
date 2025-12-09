# Megalithic Mapper UX Redesign Proposal

## Problem with Current Approach

daily.dev is a **news aggregator** focused on articles and links. Megalithic Mapper is a **geographic research platform** where:

- The **MAP** is the primary interface
- **Sites** are the core content unit
- **Contributions** (media, texts, research) are tied to sites
- Users discover through exploration, not scrolling a feed

## Better Inspiration Sources

| Platform          | Why It's Relevant             | Key Pattern to Adopt                                |
| ----------------- | ----------------------------- | --------------------------------------------------- |
| **Atlas Obscura** | Location-based discovery      | Place pages as core unit, editorial + community mix |
| **iNaturalist**   | Citizen science, observations | Contribution feed showing "what + where + who"      |
| **Historypin**    | Historical media on maps      | Media-first contributions, collections              |
| **Google Earth**  | Map exploration               | Layers, rich location detail                        |
| **Wikipedia**     | Collaborative research        | References, verification, history                   |

---

## Proposed Navigation Structure

### Primary Navigation (Sidebar)

```
┌─────────────────────────────────┐
│  🗿 Megalithic Mapper           │
├─────────────────────────────────┤
│  [🗺️ Explore Map]  ← PRIMARY    │
│                                 │
│  📍 Activity                    │
│     • Recent Contributions      │
│     • Near You (if location)    │
│     • Following                 │
│                                 │
│  🔬 Research                    │
│     • Projects                  │
│     • Text Library              │
│     • Connections               │
│                                 │
│  💬 Community                   │
│     • Forum                     │
│     • Events & Tours            │
│                                 │
│  📚 My Library                  │
│     • Saved Sites               │
│     • My Contributions          │
│     • Watch List                │
│                                 │
├─────────────────────────────────┤
│  [+ Add Contribution]           │
└─────────────────────────────────┘
```

### Key Changes from daily.dev Style

| Remove                   | Replace With                     | Reason                                                |
| ------------------------ | -------------------------------- | ----------------------------------------------------- |
| "My Feed" as home        | **Map** as home                  | Map-first experience                                  |
| "Explore" (content feed) | **Activity** (contribution feed) | Shows specific contributions to specific sites        |
| Bookmarks section        | **My Library**                   | More research-oriented language                       |
| Network / Squads         | **Research Projects**            | Collaborative groups around research topics           |
| "+ New Post"             | **"+ Add Contribution"**         | Contributions are tied to sites, not standalone posts |

---

## Activity Feed Redesign

Instead of a news-style feed, show a **contribution-centric activity stream**:

### Feed Item Types

#### 1. New Media Added

```
┌────────────────────────────────────────────────┐
│ 📸 New Photos at Göbekli Tepe                  │
│                                                │
│ [Thumbnail] [Thumbnail] [Thumbnail] +12 more   │
│                                                │
│ Maria Santos added 15 photos documenting       │
│ Pillar 43 carvings from her December visit.    │
│                                                │
│ 📍 Göbekli Tepe, Turkey · 3 hours ago          │
│ 👍 45  💬 12  🔗 View on Map                    │
└────────────────────────────────────────────────┘
```

#### 2. New Research/Text Added

```
┌────────────────────────────────────────────────┐
│ 📜 New Translation Added                       │
│                                                │
│ "Pyramid Texts Utterance 273-274"              │
│ A new annotated translation of the Cannibal    │
│ Hymn with comparative Mesopotamian analysis.   │
│                                                │
│ By Dr. Zahi Hawass · Linked to: Great Pyramid  │
│ 📍 Giza, Egypt · 2 days ago                    │
│ 👍 234  💬 89  📖 Read Translation              │
└────────────────────────────────────────────────┘
```

#### 3. Expert Video/Content

```
┌────────────────────────────────────────────────┐
│ 🎬 New Video from UnchartedX                   │
│                                                │
│ [Video Thumbnail with Play Button]             │
│ "Precision Engineering at Sacsayhuaman"        │
│                                                │
│ Ben presents new photogrammetry data showing   │
│ stone tolerances of less than 0.5mm.           │
│                                                │
│ 📍 Sacsayhuaman, Peru · 5 hours ago            │
│ 🔥 2,847 upvotes · 342 comments                │
│ ▶️ Watch · 🗺️ View Site                        │
└────────────────────────────────────────────────┘
```

#### 4. Site Update

```
┌────────────────────────────────────────────────┐
│ 📍 Site Updated: Bimini Road                   │
│                                                │
│ Alex Rivera updated the site profile with:     │
│ • New sonar mapping data (47 points)           │
│ • Updated coordinates                          │
│ • 3 new underwater photographs                 │
│                                                │
│ 📍 Bimini Islands, Bahamas · 12 hours ago      │
│ 👁️ View Changes · 🗺️ View on Map               │
└────────────────────────────────────────────────┘
```

#### 5. Event/Tour Announcement

```
┌────────────────────────────────────────────────┐
│ 📅 Upcoming Event                              │
│                                                │
│ "Egypt Tour 2025 with Graham Hancock"          │
│ 12-day journey including private Pyramid       │
│ access and sunrise Sphinx viewing.             │
│                                                │
│ 🗓️ March 15-27, 2025 · 📍 Egypt                │
│ 👥 24/30 spots remaining                       │
│ 🎟️ Learn More · 🗺️ View Route                  │
└────────────────────────────────────────────────┘
```

#### 6. Connection Discovered

```
┌────────────────────────────────────────────────┐
│ 🔗 New Connection Discovered                   │
│                                                │
│ "Acoustic Resonance: King's Chamber ↔          │
│  Sacsayhuaman Polygonal Walls"                 │
│                                                │
│ Identical 110Hz resonant frequencies found     │
│ in both structures.                            │
│                                                │
│ Connecting: Giza Pyramid ↔ Sacsayhuaman        │
│ Category: Acoustics · By: Maria Santos         │
│ 🔍 Explore Connection                          │
└────────────────────────────────────────────────┘
```

---

## Homepage Options

### Option A: Map-First (Recommended)

The homepage IS the map, with an overlay/sidebar for activity.

```
┌─────────────────────────────────────────────────────────────┐
│ [Sidebar]  │           INTERACTIVE MAP                      │
│            │                                                │
│ Activity   │    🔴 Site markers                             │
│ ─────────  │    📍 User location                           │
│ [Feed      │                                                │
│  items]    │    ┌─────────────────────┐                    │
│            │    │ Site Detail Panel   │                    │
│            │    │ (slides in on       │                    │
│            │    │  marker click)      │                    │
│            │    └─────────────────────┘                    │
│            │                                                │
│            │    [Zoom] [Layers] [Search]                   │
└─────────────────────────────────────────────────────────────┘
```

### Option B: Activity-First with Prominent Map

Activity feed with a persistent mini-map.

```
┌─────────────────────────────────────────────────────────────┐
│ [Sidebar]  │  Activity Feed          │  Mini Map (sticky)  │
│            │  ─────────────          │  ┌─────────────────┐ │
│            │  [Feed items]           │  │                 │ │
│            │  [Feed items]           │  │  [Map showing   │ │
│            │  [Feed items]           │  │   feed items'   │ │
│            │  [Feed items]           │  │   locations]    │ │
│            │  [Feed items]           │  │                 │ │
│            │                         │  │  [Expand Map]   │ │
│            │                         │  └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Removing Non-Fitting Features

### ❌ Remove: Squads / Network Section

**Why**: Doesn't fit the research platform model
**Replace with**: **Research Projects** - collaborative research groups around specific topics

- "Acoustic Properties of Ancient Structures"
- "Pre-Deluvian Civilizations Theory"
- "Polygonal Masonry Documentation"

### ❌ Remove: "Quick Saves" / "Read it Later"

**Why**: Too casual for research platform
**Replace with**: **My Library**

- Saved Sites (sites you want to track)
- Watch List (sites to get notifications for)
- My Contributions (your uploads/edits)

### ❌ Remove: Streak/Coins Gamification

**Why**: May cheapen serious research
**Replace with**: **Contribution metrics**

- "142 photos contributed"
- "Verified contributor" badge
- "Expert in Egyptology" tag

### ❌ Remove: "Popular/By upvotes/By comments" tabs in topbar

**Why**: Not a content aggregator
**Replace with**: **Map filters** and **Activity filters**

- Filter by: Region, Time period, Content type
- Sort by: Recent, Near me, Trending

---

## Recommended Topbar Redesign

```
┌─────────────────────────────────────────────────────────────┐
│ 🗿 Megalithic  │ [🔍 Search sites, media, researchers...]  │
│    Mapper      │                                            │
│                │            [🔔 3] [📊 142] [👤 Profile]    │
│                │            notif  contribs                 │
└─────────────────────────────────────────────────────────────┘
```

Key changes:

- Remove feed sorting tabs (Popular, By upvotes, etc.)
- Keep: Search, Notifications, Profile
- Replace "coins/streak" with **contribution count** or **verification status**

---

## Activity Sorting Options

On the Activity page:

| Sort          | Description                                |
| ------------- | ------------------------------------------ |
| **Recent**    | Newest contributions first                 |
| **Following** | From sites/users you follow                |
| **Near You**  | Geographically close (if location enabled) |
| **Trending**  | High recent engagement                     |

Filter by:

- Content type (Photos, Videos, Texts, Research, Events)
- Region (Africa, Asia, Europe, Americas, Oceania)
- Time period (Today, This Week, This Month)
- Contributor type (Verified, Expert, Community)

---

## Summary of Changes

| Current (daily.dev style) | Proposed (Atlas Obscura/iNaturalist style) |
| ------------------------- | ------------------------------------------ |
| Feed-first homepage       | Map-first homepage                         |
| "My Feed" / "Explore"     | "Explore Map" / "Activity"                 |
| Generic content cards     | Contribution-specific cards                |
| Squads                    | Research Projects                          |
| Bookmarks                 | My Library                                 |
| Streak/Coins              | Contribution count + Verification          |
| Post-style content        | Site-linked contributions                  |

This redesign centers the **map** and **sites** as the core experience, with the **activity feed** serving to highlight **what's new** rather than being a standalone content consumption experience.
