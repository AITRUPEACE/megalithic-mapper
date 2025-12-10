# PRD: New User Onboarding & Interactive Tour

## Overview

### Problem Statement
New users arriving at Megalithic Mapper are presented with an overwhelming world map containing hundreds of ancient sites with no clear starting point. This leads to:
- Decision paralysis (where do I click first?)
- Missed discovery of key features (media, research connections, community voting)
- Low-quality first contributions due to unclear expectations
- Users clicking on low-engagement sites and getting a poor first impression

### Solution
An interactive, guided onboarding experience that:
1. Takes users on a "world tour" of highlighted sites
2. Demonstrates all key features through hands-on interaction
3. Shows examples of high-quality contributions
4. Requires meaningful interaction before full access
5. Provides visual cues for site popularity/activity

### Success Metrics
- **Completion rate**: >70% of new users complete the tour
- **First contribution quality**: 80%+ of first posts include required elements
- **7-day retention**: 40% of onboarded users return within a week
- **Engagement rate**: 3x higher interaction rate vs. non-onboarded users

---

## Feature Requirements

### Phase 1: Visual Cues for Site Popularity

#### 1.1 Heat Indicators on Map Markers
**Priority: High** | **Effort: Medium**

Add visual indicators showing site activity/popularity:

```
Visual Hierarchy:
┌─────────────────────────────────────────────────────────┐
│  🔥 HOT (top 5%)     - Pulsing glow + flame badge       │
│  ⬆️ RISING (top 15%) - Subtle pulse animation           │
│  ✨ ACTIVE (top 30%) - Slightly larger marker           │
│  ○ NORMAL           - Standard marker                   │
│  ◌ LOW ACTIVITY     - Muted/smaller marker              │
└─────────────────────────────────────────────────────────┘
```

**Calculation factors:**
- Recent posts/comments (last 7 days) - 40% weight
- Recent media uploads - 20% weight
- Vote velocity (upvotes per day) - 25% weight
- Unique visitors - 15% weight

**Implementation:**
```typescript
interface SiteHeatScore {
  siteId: string;
  heatScore: number; // 0-100
  heatTier: 'hot' | 'rising' | 'active' | 'normal' | 'low';
  lastCalculated: Date;
  factors: {
    recentPosts: number;
    recentMedia: number;
    voteVelocity: number;
    visitors: number;
  };
}
```

#### 1.2 "What's Hot" Quick Access
**Priority: High** | **Effort: Low**

Add a floating button/panel showing:
- Top 5 trending sites right now
- One-click to fly to any hot site
- Shows why it's trending ("12 new photos added", "Expert discussion ongoing")

---

### Phase 2: Interactive Onboarding Tour

#### 2.1 Tour Structure

**Total Duration:** ~5-8 minutes (skippable sections)

```
Tour Flow:
┌──────────────────────────────────────────────────────────┐
│  1. WELCOME (30s)                                        │
│     └─ Introduction to Megalithic Mapper                 │
│     └─ "What ancient mysteries will you help uncover?"   │
│                                                          │
│  2. WORLD TOUR (2-3 min)                                 │
│     └─ Fly to 4-5 iconic sites around the world          │
│     └─ Brief narration for each                          │
│     └─ User clicks "Next" or auto-advances               │
│                                                          │
│  3. FEATURE DEEP DIVE (2 min)                            │
│     └─ Stop at Göbekli Tepe (example site)               │
│     └─ Walk through all tabs/features                    │
│     └─ Show high-quality content example                 │
│                                                          │
│  4. FIRST INTERACTION (1-2 min)                          │
│     └─ Required: vote, comment, or create post           │
│     └─ Option to add their first site                    │
│                                                          │
│  5. COMPLETION (30s)                                     │
│     └─ Badge awarded: "Explorer Initiate"                │
│     └─ Points added to profile                           │
│     └─ Suggestions for next steps                        │
└──────────────────────────────────────────────────────────┘
```

#### 2.2 Tour Stops (World Tour)

| Stop | Site | Region | Key Feature Highlight |
|------|------|--------|----------------------|
| 1 | Great Pyramid of Giza | Egypt | Media gallery, expert research |
| 2 | Göbekli Tepe | Turkey | Community posts, connections |
| 3 | Stonehenge | UK | Astronomical alignments, theories |
| 4 | Machu Picchu | Peru | Building techniques, site details |
| 5 | Easter Island | Pacific | Mystery & theories, user contributions |

**Each stop includes:**
- Cinematic fly-to animation (3-5 seconds)
- Spotlight overlay highlighting the site
- Info card with 2-3 key facts
- Audio narration (optional, can be text-only)

#### 2.3 Feature Deep Dive: Göbekli Tepe

**Why Göbekli Tepe:**
- Rich content already available
- Multiple media types (photos, videos, articles)
- Active community discussion
- Connected to other sites
- Demonstrates all feature categories

**Deep Dive Steps:**

```
Step 1: Site Overview
├─ Show site card expand animation
├─ Highlight: Name, Type, Verification status
└─ Point out: Heat indicator, media count

Step 2: Media Gallery
├─ Show photo gallery
├─ Demonstrate: Image zoom, fullscreen
├─ Show: YouTube video embed
└─ Highlight: "Add Media" button

Step 3: Research & Posts
├─ Show community posts feed
├─ Highlight: Expert badge on quality posts
├─ Show: A well-formatted post example
└─ Demonstrate: Upvote/downvote interaction

Step 4: Connections
├─ Show connection graph
├─ Explain: How sites link to each other
├─ Example: "Similar building techniques to X"
└─ Highlight: "Propose Connection" feature

Step 5: Discussion
├─ Show comment thread
├─ Highlight: Threaded replies
└─ Show: How to start a discussion
```

#### 2.4 Required First Interaction

**Before completing onboarding, user MUST do one of:**

| Action | Points Awarded | Difficulty |
|--------|---------------|------------|
| Upvote/downvote a post | 5 pts | Easy |
| Leave a comment (min 20 chars) | 15 pts | Medium |
| Create a text post | 25 pts | Medium |
| Submit a new site | 50 pts | Hard |

**UI Treatment:**
- Highlight available interaction buttons
- Show encouraging tooltip: "Cast your first vote!"
- Disable "Continue" until action taken
- Or offer "Skip for now" (limited features until completed)

---

### Phase 3: Quality Contribution Guidelines

#### 3.1 Site Submission Requirements

**Minimum Required Fields:**

```typescript
interface SiteSubmission {
  // REQUIRED
  name: string;              // Min 3 chars
  coordinates: LatLng;       // Must be valid
  siteType: SiteType;        // From predefined list
  summary: string;           // Min 50 chars, max 500
  primaryImage: File;        // At least 1 image required
  
  // RECOMMENDED (shown in onboarding)
  additionalImages?: File[]; // Up to 10
  youtubeLinks?: string[];   // Validated URLs
  articleLinks?: string[];   // With title extraction
  
  // OPTIONAL
  cultures?: string[];       // Tags
  estimatedAge?: string;
  features?: string[];
  theories?: string[];
}
```

**Why require an image:**
- Prevents spam/low-effort submissions
- Ensures visual context for verification
- Improves browsing experience
- Image can be from web (with attribution) or user's own

#### 3.2 Example Good Post Display

Show users an ideal post format:

```
┌─────────────────────────────────────────────────────────┐
│  ⭐ EXAMPLE: Quality Post                               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  📍 Göbekli Tepe - New Excavation Findings 2024         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                         │
│  🎬 [YouTube Thumbnail - 12:34]                         │
│     "Ancient Architects: New Chamber Discovered"        │
│                                                         │
│  📝 Summary:                                            │
│  Recent excavations have revealed a previously          │
│  unknown chamber beneath Enclosure D. The chamber       │
│  contains carvings similar to those found at...         │
│                                                         │
│  🔗 Supporting Sources:                                 │
│  • Scientific American - "Göbekli Tepe Rewrites..."     │
│  • Archaeological Institute Report (PDF)                │
│                                                         │
│  🏷️ Tags: #excavation #enclosure-d #turkey #neolithic   │
│                                                         │
│  👤 Posted by @ArchaeologyExpert ✓                      │
│  ⬆️ 234  💬 45 comments  👁️ 1.2K views                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### 3.3 Theory/Symbology Posts

For more complex posts linking multiple sites:

```typescript
interface TheoryPost {
  title: string;
  type: 'theory' | 'symbology' | 'technique' | 'connection';
  body: string;              // Rich text, min 200 chars
  linkedSites: string[];     // 1-20 site IDs
  evidence: {
    images?: File[];
    videos?: string[];
    articles?: string[];
    quotes?: { text: string; source: string }[];
  };
  tags: string[];
}
```

**Example Theory Post:**
- Title: "Polygonal Masonry: A Global Building Technique"
- Linked Sites: Sacsayhuamán, Delphi, Easter Island, Japan (6 sites)
- Evidence: Comparison images, academic papers
- Discussion: Open for community debate

---

### Phase 4: Technical Implementation

#### 4.1 Tour State Management

```typescript
// stores/onboarding-store.ts
interface OnboardingState {
  // Tour progress
  isActive: boolean;
  currentStep: number;
  totalSteps: number;
  currentPhase: 'welcome' | 'world-tour' | 'deep-dive' | 'interaction' | 'complete';
  
  // Tour stops
  tourStops: TourStop[];
  currentStopIndex: number;
  
  // User interactions
  hasVoted: boolean;
  hasCommented: boolean;
  hasPosted: boolean;
  hasAddedSite: boolean;
  interactionComplete: boolean;
  
  // Preferences
  audioEnabled: boolean;
  autoAdvance: boolean;
  
  // Completion
  completedAt?: Date;
  skippedAt?: Date;
  earnedBadges: string[];
}

interface TourStop {
  id: string;
  siteId: string;
  siteName: string;
  coordinates: LatLng;
  zoomLevel: number;
  duration: number; // seconds
  narration: string;
  highlights: string[];
  featureFocus?: 'media' | 'research' | 'connections' | 'discussion';
}
```

#### 4.2 Component Structure

```
src/features/onboarding/
├── components/
│   ├── OnboardingProvider.tsx      # Context & state
│   ├── TourOverlay.tsx             # Full-screen overlay
│   ├── TourProgress.tsx            # Step indicator
│   ├── TourNarration.tsx           # Text/audio narration
│   ├── SpotlightHighlight.tsx      # Element highlighting
│   ├── TourControls.tsx            # Next/Back/Skip buttons
│   ├── InteractionPrompt.tsx       # First action prompt
│   ├── ExamplePostCard.tsx         # Quality post example
│   └── CompletionCelebration.tsx   # Confetti & badge award
├── hooks/
│   ├── useTour.ts                  # Tour navigation
│   ├── useTourAnimation.ts         # Map fly-to animations
│   └── useInteractionTracking.ts   # Track first interactions
├── lib/
│   ├── tour-config.ts              # Tour stops configuration
│   ├── narrations.ts               # All narration text
│   └── animations.ts               # Animation presets
└── model/
    └── onboarding-store.ts         # Zustand store
```

#### 4.3 Database Schema Additions

```sql
-- Track onboarding completion
CREATE TABLE onboarding_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  skipped_at TIMESTAMPTZ,
  current_step INTEGER DEFAULT 0,
  interactions JSONB DEFAULT '{}',
  tour_version INTEGER DEFAULT 1,
  UNIQUE(user_id)
);

-- Site heat scores (cached)
CREATE TABLE site_heat_scores (
  site_id UUID REFERENCES sites(id) PRIMARY KEY,
  heat_score INTEGER DEFAULT 0,
  heat_tier VARCHAR(20) DEFAULT 'normal',
  recent_posts INTEGER DEFAULT 0,
  recent_media INTEGER DEFAULT 0,
  vote_velocity DECIMAL DEFAULT 0,
  visitor_count INTEGER DEFAULT 0,
  calculated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast heat tier lookups
CREATE INDEX idx_site_heat_tier ON site_heat_scores(heat_tier);
```

#### 4.4 API Endpoints

```typescript
// GET /api/onboarding/status
// Returns current onboarding state for user

// POST /api/onboarding/start
// Initializes onboarding for new user

// POST /api/onboarding/progress
// Updates current step/phase
// Body: { step: number, phase: string }

// POST /api/onboarding/interaction
// Records first interaction
// Body: { type: 'vote' | 'comment' | 'post' | 'site', targetId: string }

// POST /api/onboarding/complete
// Marks onboarding as complete, awards badge

// POST /api/onboarding/skip
// Marks onboarding as skipped (limited features)

// GET /api/sites/heat-scores
// Returns top N sites by heat score
// Query: ?limit=50&tier=hot

// GET /api/tour/stops
// Returns configured tour stops with site data
```

---

### Phase 5: UI/UX Specifications

#### 5.1 Tour Overlay Design

```
┌──────────────────────────────────────────────────────────┐
│  [Skip Tour]                              Step 3 of 12   │
│                                           ● ● ○ ○ ○ ○    │
├──────────────────────────────────────────────────────────┤
│                                                          │
│                    ╭─────────────────╮                   │
│                    │                 │                   │
│                    │   MAP AREA      │   <- Visible      │
│                    │   (Highlighted  │      through      │
│                    │    site)        │      overlay      │
│                    │                 │                   │
│                    ╰─────────────────╯                   │
│                                                          │
├──────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────┐  │
│  │  🏛️ Göbekli Tepe                                   │  │
│  │                                                    │  │
│  │  The world's oldest known temple complex,         │  │
│  │  predating Stonehenge by 6,000 years.             │  │
│  │                                                    │  │
│  │  ✨ Featured: 12,000 years old • Turkey           │  │
│  │                                                    │  │
│  │  [← Back]              [Next →]                   │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

#### 5.2 Spotlight Highlight System

```css
/* Spotlight effect for highlighted elements */
.tour-spotlight {
  position: relative;
  z-index: 9999;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.7);
  border-radius: 8px;
  animation: spotlight-pulse 2s ease-in-out infinite;
}

@keyframes spotlight-pulse {
  0%, 100% { box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.7); }
  50% { box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.75); }
}

/* Tooltip pointer for highlighted elements */
.tour-tooltip {
  position: absolute;
  background: var(--card);
  border: 1px solid var(--primary);
  border-radius: 12px;
  padding: 16px;
  max-width: 300px;
  animation: tooltip-bounce 0.5s ease-out;
}
```

#### 5.3 Heat Indicator Styles

```css
/* Map marker heat indicators */
.marker-hot {
  filter: drop-shadow(0 0 8px #ff6b35) drop-shadow(0 0 16px #ff6b35);
  animation: heat-pulse 1.5s ease-in-out infinite;
}

.marker-rising {
  filter: drop-shadow(0 0 4px #ffa500);
  animation: heat-pulse 2s ease-in-out infinite;
}

.marker-active {
  transform: scale(1.1);
}

.marker-low {
  opacity: 0.6;
  transform: scale(0.9);
}

@keyframes heat-pulse {
  0%, 100% { filter: drop-shadow(0 0 8px #ff6b35); }
  50% { filter: drop-shadow(0 0 16px #ff6b35) drop-shadow(0 0 24px #ff6b35); }
}

/* Heat badge on markers */
.heat-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  font-size: 12px;
}
```

---

### Implementation Roadmap

#### Sprint 1: Foundation (1 week)
- [ ] Create `site_heat_scores` table and calculation job
- [ ] Implement heat score API endpoint
- [ ] Add heat tier to map markers
- [ ] Create "What's Hot" floating panel

#### Sprint 2: Tour Infrastructure (1 week)
- [ ] Create onboarding store (Zustand)
- [ ] Build `TourOverlay` component
- [ ] Implement map fly-to animations
- [ ] Create `SpotlightHighlight` system

#### Sprint 3: Tour Content (1 week)
- [ ] Define all tour stops with content
- [ ] Create narration text for each stop
- [ ] Build `TourNarration` component
- [ ] Implement progress tracking

#### Sprint 4: Interaction & Completion (1 week)
- [ ] Build `InteractionPrompt` component
- [ ] Track first interactions in database
- [ ] Create `CompletionCelebration` with badge award
- [ ] Implement skip functionality

#### Sprint 5: Quality & Polish (1 week)
- [ ] Add audio narration (optional)
- [ ] Responsive design for mobile
- [ ] A/B test tour variants
- [ ] Analytics integration

---

### Future Enhancements

1. **Personalized Tours**: Based on user interests (pyramids, stone circles, etc.)
2. **Regional Tours**: "Explore Ancient Egypt", "Mysteries of South America"
3. **Expert-Led Tours**: Curated by verified researchers
4. **Achievement System**: Badges for completing different tour types
5. **Social Onboarding**: Invite friends to tour together
6. **AR Integration**: Use phone camera to visualize sites at scale

---

### Appendix: Narration Scripts

#### Welcome Script
> "Welcome to Megalithic Mapper, a collaborative platform where researchers and enthusiasts explore the ancient mysteries of our world. You're about to embark on a journey spanning thousands of years and every continent. Let's begin..."

#### Göbekli Tepe Script
> "This is Göbekli Tepe in Turkey—the world's oldest known temple complex. Built 12,000 years ago, it predates agriculture, pottery, and writing. Here you can see how our community documents research, shares discoveries, and debates theories about this enigmatic site."

#### First Interaction Script
> "Now it's your turn. Every great discovery starts with a single step. Cast your first vote, share your thoughts, or contribute what you know. Your perspective matters in uncovering the truth about our ancient past."

---

*Document Version: 1.0*
*Last Updated: December 2024*
*Author: Megalithic Mapper Team*



