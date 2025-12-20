# Megalithic Mapper - MVP Product Requirements Document

## Executive Summary

**Current Progress:** ~60-65% complete  
**Target:** Feature-complete MVP for community testing  
**Last Updated:** December 2024

This document consolidates all MVP features, technical decisions, and implementation priorities for the Megalithic Mapper platform.

---

## 1. Current Status

### 1.1 Completed Features

#### Database & Backend

- [x] Core sites table with coordinates, verification, tags
- [x] Site contribution tracking (`created_by`, `verified_by`, `verified_at`)
- [x] Site follows/watch list (`site_follows` table with RLS)
- [x] Community voting system (`site_votes` with auto-count triggers)
- [x] Activity feed table (pre-computed with engagement scores)
- [x] Auto-verification trigger (sites auto-verify at 5 approvals)
- [x] Activity feed triggers (auto-creates entries for sites/posts/media)
- [x] User profiles & follows
- [x] Posts & threaded comments
- [x] Badges schema
- [x] Media assets storage schema

#### API Routes

- [x] `POST /api/sites` - Create site
- [x] `GET /api/sites` - List with filters
- [x] `POST /api/sites/[id]/vote` - Vote on site
- [x] `GET /api/sites/[id]/vote` - Get vote counts
- [x] `DELETE /api/sites/[id]/vote` - Remove vote
- [x] `GET /api/feed` - Activity feed with sorting
- [x] `POST /api/posts` - Create posts

#### Frontend

- [x] Leaflet map with react-leaflet
- [x] Custom site pins by type with heat indicators
- [x] Marker clustering
- [x] Dark mode tiles (CartoDB)
- [x] Coordinate picker (click-to-pick on map)
- [x] Site editor form
- [x] Activity feed UI with cards
- [x] Site detail panel with tabs

### 1.2 Remaining Critical Work

- [ ] Site voting UI component (API exists, needs UI)
- [ ] Image upload (currently URL-only)
- [ ] Profile page implementation
- [ ] Mobile drawer polish
- [ ] Official/Community toggle enhancement

---

## 2. New Features

### 2.1 User Search

**Priority:** Phase 2  
**Effort:** Small

#### Requirements

- Search users by username and full_name
- Integrate into header search or dedicated page
- Show user avatar, badge tier, and contribution count in results

#### Implementation

- **API:** `GET /api/users/search?q=searchterm`
- **File:** `src/app/api/users/search/route.ts`

#### Database Query

```sql
SELECT id, username, full_name, avatar_url, is_verified, role
FROM megalithic.profiles
WHERE username ILIKE '%' || $1 || '%'
   OR full_name ILIKE '%' || $1 || '%'
ORDER BY is_verified DESC, username
LIMIT 20;
```

---

### 2.2 Custom Research Categories

**Priority:** Phase 3  
**Effort:** Medium

#### Requirements

- Only verified users can create new categories
- Categories can be applied to sites and posts
- Examples: "Acoustics", "Chemical Analysis", "Archaeoastronomy", "Construction Techniques"

#### Schema

```sql
CREATE TABLE IF NOT EXISTS megalithic.research_categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT, -- optional emoji or icon name
  created_by uuid REFERENCES megalithic.profiles(id),
  created_at timestamptz DEFAULT now(),
  post_count INT DEFAULT 0,
  site_count INT DEFAULT 0
);

-- Junction table for sites
CREATE TABLE IF NOT EXISTS megalithic.site_research_categories (
  site_id uuid REFERENCES megalithic.sites(id) ON DELETE CASCADE,
  category_id uuid REFERENCES megalithic.research_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (site_id, category_id)
);

-- Junction table for posts
CREATE TABLE IF NOT EXISTS megalithic.post_research_categories (
  post_id uuid REFERENCES megalithic.posts(id) ON DELETE CASCADE,
  category_id uuid REFERENCES megalithic.research_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, category_id)
);
```

#### Default Categories (Seeded)

| Slug              | Name                    | Description                                           |
| ----------------- | ----------------------- | ----------------------------------------------------- |
| acoustics         | Acoustics               | Sound resonance, frequencies, and acoustic properties |
| chemical-analysis | Chemical Analysis       | Material composition, dating methods                  |
| archaeoastronomy  | Archaeoastronomy        | Astronomical alignments and celestial observations    |
| construction      | Construction Techniques | Building methods, tool marks, engineering             |
| geology           | Geology                 | Rock types, quarrying, geological context             |
| mythology         | Mythology & Symbolism   | Cultural significance, legends, iconography           |

---

### 2.3 Badge System

**Priority:** Phase 2  
**Effort:** Medium

#### Scoring Algorithm

```
Score = (upvotes_received * 1) +
        (sites_contributed * 10) +
        (posts_created * 5) +
        (comments_made * 2) +
        (verified_contributions * 25)
```

#### Badge Tiers

| Tier        | Points  | Icon |
| ----------- | ------- | ---- |
| Explorer    | 0-49    | 🔍   |
| Contributor | 50-199  | ⭐   |
| Researcher  | 200-499 | 📚   |
| Expert      | 500-999 | 🏆   |
| Legend      | 1000+   | 👑   |

#### Implementation

- Compute on profile view OR cache daily via cron
- Store in `profiles.badge_tier` and `profiles.badge_score`
- Display badge on avatar in posts, comments, and profile

#### Database Function

```sql
CREATE OR REPLACE FUNCTION megalithic.calculate_badge_score(p_user_id uuid)
RETURNS TABLE (score INT, tier TEXT) AS $$
DECLARE
  v_score INT;
  v_tier TEXT;
BEGIN
  SELECT
    COALESCE(SUM(
      CASE
        WHEN r.reaction_type = 'upvote' THEN 1
        ELSE 0
      END
    ), 0) +
    (SELECT COUNT(*) * 10 FROM megalithic.sites WHERE created_by = p_user_id) +
    (SELECT COUNT(*) * 5 FROM megalithic.posts WHERE author_id = p_user_id) +
    (SELECT COUNT(*) * 2 FROM megalithic.comments WHERE author_id = p_user_id) +
    (SELECT COUNT(*) * 25 FROM megalithic.sites WHERE created_by = p_user_id AND verification_status = 'verified')
  INTO v_score
  FROM megalithic.reactions r
  JOIN megalithic.posts p ON r.target_id = p.id AND r.target_type = 'post'
  WHERE p.author_id = p_user_id;

  v_tier := CASE
    WHEN v_score >= 1000 THEN 'legend'
    WHEN v_score >= 500 THEN 'expert'
    WHEN v_score >= 200 THEN 'researcher'
    WHEN v_score >= 50 THEN 'contributor'
    ELSE 'explorer'
  END;

  RETURN QUERY SELECT v_score, v_tier;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

### 2.4 Activity Feed Calculation

**Status:** Implemented, documented here for reference

#### Current Implementation

- Pre-computed `activity_feed` table with database triggers
- Triggers fire on: new site, new post, new media, site verified

#### Engagement Score Formula

```
engagement_score = reactions + (comments * 2) + (bookmarks * 1.5)
```

#### Sort Modes

| Mode  | Description                                            |
| ----- | ------------------------------------------------------ |
| smart | Official sources first, then by magnitude + engagement |
| hot   | High engagement + recency (decay factor)               |
| new   | Most recent first                                      |
| top   | Highest engagement regardless of time                  |

#### Decision: Keep Pre-computed Feed

**Rationale:**

- Fast feed queries (no complex joins)
- Consistent scoring across the app
- Can be enhanced with personalization later
- Triggers keep it up-to-date automatically

---

### 2.5 Official/Community Toggle Enhancement

**Priority:** Phase 1  
**Effort:** Small

#### Requirements

- Make toggle more prominent in filter bar
- Add visual indicator showing current mode
- Show pin counts per layer
- Clear color differentiation (blue = official, green = community)

#### UI Changes

- Pill-style toggle with count badges
- Sticky position at top of filter panel
- Animate transition between modes

---

### 2.6 Smart Pin Loading Strategy

**Priority:** Phase 1  
**Effort:** Medium

#### Problem

Map will have thousands of pins - need efficient loading strategy.

#### Solution

1. **Bounding box queries** - Only load visible pins
2. **Zoom-based limits** - Fewer pins at low zoom
3. **Importance scoring** - Show most significant first
4. **Server-side filtering** - Don't send filtered-out pins

#### Zoom Thresholds

| Zoom Level | Strategy                                     |
| ---------- | -------------------------------------------- |
| < 5        | Top 100 pins globally by importance_score    |
| 5-8        | Top 500 pins in viewport by importance_score |
| > 8        | All pins in viewport                         |

#### API Changes

```typescript
// GET /api/sites?bbox=sw_lat,sw_lng,ne_lat,ne_lng&zoom=7&limit=500
interface BoundingBoxQuery {
	bbox: [number, number, number, number]; // sw_lat, sw_lng, ne_lat, ne_lng
	zoom: number;
	limit?: number;
	filters?: MapFilters;
}
```

#### Importance Score Calculation

```sql
importance_score =
  (CASE verification_status
    WHEN 'verified' THEN 50
    WHEN 'under_review' THEN 20
    ELSE 0
  END) +
  (votes_approve * 2) +
  (media_count * 3) +
  (CASE layer
    WHEN 'official' THEN 30
    ELSE 0
  END)
```

---

### 2.7 AI Pre-Check for Site Submissions

**Priority:** Phase 3  
**Effort:** Small

#### Requirements

- Cheap validation (~100 tokens per submission)
- No external research - just validation
- Provide helpful feedback without blocking

#### Checks Performed

1. **Spam detection** - All caps, gibberish, suspicious patterns
2. **Coordinate validation** - Verify on land (simple bbox check)
3. **Duplicate detection** - Fuzzy name match + distance proximity
4. **Quality suggestions** - Recommend improvements

#### API Response

```typescript
interface PreCheckResult {
	pass: boolean;
	score: number; // 0-100
	warnings: string[];
	suggestions: string[];
	duplicateCandidate?: {
		id: string;
		name: string;
		distance: number; // km
	};
}
```

#### Implementation

- **File:** `src/app/api/sites/precheck/route.ts`
- Use simple pattern matching for spam
- Use Haversine formula for distance calculations
- Optional: Use OpenAI for advanced validation (only if basic checks pass)

---

### 2.8 Favorite Posts with Notifications

**Priority:** Phase 2  
**Effort:** Small

#### Requirements

- Bookmark posts/research for quick access
- Get notified when bookmarked content has new activity
- Show "new activity" badge on bookmarked items

#### Schema Changes

```sql
ALTER TABLE megalithic.bookmarks
ADD COLUMN IF NOT EXISTS notify_on_update BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS last_seen_at timestamptz DEFAULT now();
```

#### Notification Logic

- When new comment added to bookmarked post → notify
- When bookmarked site updated → notify
- Track `last_seen_at` to show "new" badge

---

### 2.9 World Tour Onboarding

**Priority:** Phase 3  
**Effort:** Medium

#### Requirements

- Trigger on first login
- Guide users through key features
- Store completion status in profile

#### Tour Steps

1. **Welcome** - Introduction to Megalithic Mapper
2. **Map Basics** - Pan, zoom, click pins
3. **Filtering** - Official vs Community, cultures, eras
4. **Site Details** - View information, vote, bookmark
5. **Contributing** - Submit new sites, add media
6. **Community** - Follow users, join discussions

#### Implementation

- Use `driver.js` or `react-joyride` library
- Store `onboarding_completed` in profiles
- Allow replay from settings

#### Schema

```sql
ALTER TABLE megalithic.profiles
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamptz;
```

---

### 2.10 Content Priority System

**Priority:** Phase 3  
**Effort:** Medium

#### Default Priority Order (Configurable per User)

1. YouTube videos from official/verified users (highest)
2. Forum posts with high engagement
3. Research posts (unless from official researchers)
4. Site updates
5. Comments/reactions

#### User Preferences Schema

```sql
ALTER TABLE megalithic.profiles
ADD COLUMN IF NOT EXISTS feed_preferences JSONB DEFAULT '{
  "priority_order": ["youtube", "forum", "research", "sites", "comments"],
  "show_community": true,
  "show_low_engagement": true
}'::jsonb;
```

#### Feed Query Modification

```sql
ORDER BY
  CASE
    WHEN source_type = 'official' THEN 1
    WHEN activity_type = 'video_added' AND actor_verified THEN 2
    WHEN activity_type = 'post_created' AND engagement_score > 50 THEN 3
    WHEN activity_type = 'research_published' THEN 4
    ELSE 5
  END,
  engagement_score DESC,
  created_at DESC
```

---

## 3. Technical Decisions Summary

| Decision            | Choice                             | Rationale                              |
| ------------------- | ---------------------------------- | -------------------------------------- |
| AI pre-check        | Basic (~100 tokens)                | Cost-effective, covers spam/duplicates |
| Research categories | Verified users only can create     | Quality control                        |
| Content priority    | User configurable, YouTube default | Flexibility                            |
| Activity feed       | Keep pre-computed table            | Performance                            |
| Smart pin loading   | Bounding box + importance          | Scalability                            |
| Badge calculation   | On-demand with caching             | Balance freshness vs performance       |

---

## 4. Implementation Phases

### Phase 1 - Critical (This Week)

1. Site voting UI component
2. Official/Community toggle enhancement
3. Smart pin loading (bounding box)

### Phase 2 - Core Features (Next Week)

4. User search
5. Bookmark with notifications
6. Badge system

### Phase 3 - Polish (Week 3)

7. AI pre-check
8. Research categories
9. Content priority settings
10. World tour onboarding

---

## 5. Files Reference

### New Files to Create

- `src/app/api/users/search/route.ts`
- `src/app/api/sites/precheck/route.ts`
- `src/features/onboarding/world-tour.tsx`
- `src/components/voting/site-vote-buttons.tsx`
- `supabase/migrations/20251221000000_research_categories.sql`
- `supabase/migrations/20251221000001_feed_preferences.sql`
- `supabase/migrations/20251221000002_badge_system.sql`

### Files to Modify

- `src/app/(app)/map/_components/site-filters.tsx` - Toggle visibility
- `src/app/(app)/map/_components/site-detail-panel.tsx` - Voting UI
- `src/entities/map/api/map-data.ts` - Smart loading
- `src/app/api/feed/route.ts` - Content priority

---

## 6. Success Metrics

### MVP Launch Criteria

- [ ] 100+ sites in database
- [ ] Site voting functional
- [ ] Smart pin loading working at scale
- [ ] Mobile responsive
- [ ] Core filters working
- [ ] Activity feed populated

### Post-Launch Metrics to Track

- Daily active users
- Sites submitted per week
- Average votes per site
- Feed engagement rate
- Onboarding completion rate


