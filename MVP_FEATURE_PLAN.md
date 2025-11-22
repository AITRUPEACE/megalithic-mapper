# Megalithic Mapper - MVP Feature Implementation Plan

## Executive Summary

This document breaks down the MVP (v1) features from the Interactive Map PRD into actionable implementation tasks. The MVP focuses on core discovery, filtering, and community contribution workflows while establishing the foundation for future enhancements.

---

## MVP Scope (from PRD Section 11)

### Core Deliverables

1. ✅ Site/Artifact/Text pins with clustering
2. Detail panel with Overview + Media + Documents tabs
3. Filters for civilization, site type, verification
4. Dual Official/Community layer toggle
5. Site submission flow (Community-first) with AI validation
6. Basic analytics events
7. **Featured Users Profile Pin Overlay** - Display notable researchers/contributors on map
8. 🎯 **STRETCH GOAL (High Priority):** Expedition pins for historical trips - Critical for featured users to showcase tours and events

---

## Feature Breakdown by Functional Area

### 1. Core Map Rendering & Canvas

**Status**: Foundation established, needs refinement

**Required Features**:

- [ ] **Leaflet Integration**

  - [x] Basic Leaflet map with react-leaflet
  - [ ] Dark mode tile styling (custom tiles or filter)
  - [ ] Adaptive viewport height (minus chrome)
  - [ ] Client-side only rendering (SSR guard)

- [ ] **Map Controls**

  - [x] Zoom in/out controls
  - [x] Pan navigation
  - [ ] Reset to default view button
  - [ ] Scale indicator
  - [ ] Coordinate display on hover/cursor
  - [ ] Optional grid overlay toggle

- [ ] **Viewport Management**
  - [ ] Persist last viewed viewport per session (localStorage)
  - [ ] URL-based viewport state (query params for lat/lng/zoom)
  - [ ] Smooth animations for programmatic zoom/pan
  - [ ] Bounding box calculation for data fetching

**Technical Tasks**:

- Configure custom map tiles (CartoDB Dark Matter or similar)
- Add scale control component
- Implement coordinate tooltip on cursor move
- Create viewport state management (Zustand or context)
- Add debounced bounding box change handler

---

### 2. Pin System & Taxonomy

**Status**: Partially implemented, needs expansion

**Required Pin Types**:

- [ ] **Site Pins** (Primary entity)
  - [ ] Custom icon (monument silhouette)
  - [ ] Color coding by civilization
  - [ ] Verification status badge overlay
  - [ ] Hover tooltip with basic info
  - [ ] Click interaction to open detail panel

-- I don't think we need these yet

- [ ] **Artifact Pins** (Linked to sites)
  - [ ] Ring icon design
  - [ ] Visual relationship to parent site
  - [ ] Smaller size than site pins
  - [ ] Link indicator when hovering parent site

-- I don't think we need these yet

- [ ] **Text/Research Pins**

  - [ ] Book/scroll icon
  - [ ] Represents libraries, archives, research HQs
  - [ ] Distinct color scheme
  - [ ] Link to related sites

- [ ] **Expedition Pins** (Historical trips) - 🎯 **STRETCH GOAL**

  - [ ] Circular avatar pins (host profile picture)
  - [ ] Status ring (archived for MVP, live for v1.1)
  - [ ] Content format badge (video/podcast/article)
  - [ ] Archived status indicator
  - **Note**: High importance for featured users to showcase their tours/events

- [ ] **User Profile Pins** (Featured users/researchers)

  - [ ] Circular avatar pins (user profile picture)
  - [ ] "Featured" badge indicator (e.g., gold star)
  - [ ] User type badge (researcher, content creator, archaeologist, etc.)
  - [ ] Distinguished styling for high-profile users (Graham Hancock, etc.)
  - [ ] Optional "verified" checkmark
  - [ ] Hover shows user name, title, and location

- [ ] **Unverified Submission Pins**

  - [ ] Outline icon style
  - [ ] "Pending Review" badge
  - [ ] Different opacity/styling

- [ ] **Community Tier Badges**
  - [ ] Bronze/Silver/Gold badge overlays
  - [ ] Progress indicator toward Official status
  - [ ] Visual differentiation from Official pins

**Technical Tasks**:

- Create custom icon components for each pin type
- Build badge overlay system (SVG composition)
- Implement conditional styling based on status
- Create tooltip component with rich preview
- Design icon sprite or use SVG components
- Implement z-index layering (artifacts on top of sites, etc.)

---

### 3. Clustering & Density Management

**Status**: Basic clustering implemented, needs enhancement

**Required Features**:

- [ ] **Marker Clustering**

  - [x] Basic Leaflet marker clustering
  - [ ] Intelligent breakpoint configuration
  - [ ] Cluster badge showing total count
  - [ ] Predominant type/status indicator in cluster
  - [ ] Avatar mosaic for expedition clusters

- [ ] **Cluster Interactions**

  - [ ] Click to zoom into cluster bounds
  - [ ] Show mini list overlay when zoom change is minimal
  - [ ] Hover to preview cluster contents
  - [ ] Display composition (e.g., "5 sites, 3 artifacts")

- [ ] **Community Cluster Features**
  - [ ] Show tier composition (Bronze/Silver/Gold counts)
  - [ ] Display promotion threshold proximity
  - [ ] Live badge if any active expeditions inside

**Technical Tasks**:

- Configure markercluster breakpoints based on zoom level
- Create custom cluster icon renderer
- Build cluster popup/overlay component
- Implement smart zoom logic (calculate optimal zoom level)
- Add cluster composition calculator
- Test performance with 1000+ markers

---

### 4. Dual Layer System (Official vs Community)

**Status**: Need to implement from scratch

**Required Features**:

- [ ] **Layer Control UI**

  - [ ] Toggle switch: Official / Community / Both
  - [ ] Visual indicator of active layer(s)
  - [ ] Keyboard accessible controls
  - [ ] Layer-specific pin counts

- [ ] **Layer Data Management**

  - [ ] Separate data queries for Official vs Community
  - [ ] Filter pins based on selected layer
  - [ ] Smooth transition when toggling layers
  - [ ] Combine layers efficiently when "Both" selected

- [ ] **Visual Differentiation**
  - [ ] Official pins: Solid, full opacity
  - [ ] Community pins: Different style/badge
  - [ ] Clear verification status badges
  - [ ] Layer indicator in detail panel

**Technical Tasks**:

- Create layer control component (toggle or dropdown)
- Extend Zustand store with layer state
- Add `layer_status` field to data queries
- Implement layer filtering logic
- Add layer badge to pin tooltips
- Update list view to show layer status

---

### 5. Filtering & Search System

**Status**: Basic filters exist, needs full implementation

**Required Filters for MVP**:

- [ ] **Civilization Filter**

  - [ ] Multi-select dropdown
  - [ ] Show count per civilization
  - [ ] "Select All" / "Clear All" options
  - [ ] Visual chips showing active filters

- [ ] **Site Type Filter**

  - [ ] Multi-select: Temple, Observatory, Tomb, Megalith, etc.
  - [ ] Count per type
  - [ ] Icon previews for each type

- [ ] **Verification Status Filter**

  - [ ] Verified / Pending / Community options
  - [ ] Single-select or multi-select
  - [ ] Badge preview for each status

- [ ] **Map Layer Filter**

  - [ ] Official / Community / Composite
  - [ ] Integrated with layer toggle (sync state)

- [ ] **Text Search**

  - [ ] Search by site name
  - [ ] Search by artifact ID
  - [ ] Search by researcher name
  - [ ] Auto-suggest dropdown
  - [ ] Debounced input (300ms)

- [ ] **Filter Management**
  - [ ] Active filter chips display
  - [ ] "Clear All Filters" button
  - [ ] Real-time map + list updates
  - [ ] URL persistence (query params)
  - [ ] Filter count badge

**Technical Tasks**:

- Build filter panel component (collapsible sidebar)
- Create multi-select filter components
- Implement text search with debouncing
- Add auto-suggest/typeahead functionality
- Extend Zustand store with filter state
- Create filter query builder for API
- Add URL sync for shareable filtered views
- Build active filter chips component

---

### 6. Detail Panel System

**Status**: Basic panel exists, needs tab system and content

**Layout**: Right-side panel (30% width on desktop, full-screen drawer on mobile)

**Required Components**:

- [ ] **Panel Header**

  - [ ] Entity name (large, prominent)
  - [ ] Civilization tag/badge
  - [ ] Verification status badge
  - [ ] Quick actions toolbar:
    - [ ] Bookmark/save button
    - [ ] Share button (copy link)
    - [ ] Flag/report button
    - [ ] Close panel X

- [ ] **Tab Navigation**

  - [x] Tab component (already exists in UI)
  - [ ] Overview tab
  - [ ] Media tab
  - [ ] Documents tab
  - [ ] Analytics tracking for tab switches

- [ ] **Overview Tab Content**

  - [ ] Summary/description
  - [ ] Coordinates (lat/lng) with copy button
  - [ ] Era/time period
  - [ ] Contributor credits (avatar + name)
  - [ ] Linked hypotheses (if any)
  - [ ] Parent site reference (for artifacts)
  - [ ] Related entities section
  - [ ] Link to full entity page button

- [ ] **Media Tab Content**

  - [ ] Image carousel/gallery
  - [ ] Video player embeds
  - [ ] 360° tour viewer (iframe/embed)
  - [ ] Media attribution/credits
  - [ ] Download/view full resolution link
  - [ ] Lazy loading for performance

- [ ] **Documents Tab Content**

  - [ ] PDF inline previews
  - [ ] Transcription display
  - [ ] External link list
  - [ ] Download buttons
  - [ ] Document metadata (author, date, type)

- [ ] **Community Submission Features**

  - [ ] Trust tier display (Bronze/Silver/Gold)
  - [ ] AI moderation summary
  - [ ] Upvote/downvote controls
  - [ ] Current upvote count
  - [ ] Progress bar toward Official promotion
  - [ ] Required steps checklist
  - [ ] "Request Verification" CTA

- [ ] **Expedition-Specific Content**
  - [ ] Host bio and avatar
  - [ ] Crew roster
  - [ ] Expedition itinerary (stops list)
  - [ ] Associated media playlist
  - [ ] Follower count
  - [ ] Privacy settings display

**Technical Tasks**:

- Build detail panel wrapper component
- Create header component with actions
- Implement tab content components
- Add lazy loading for media/documents
- Create upvote button component
- Build progress indicator for community submissions
- Add share functionality (Web Share API + fallback)
- Implement bookmark/flag actions
- Create media carousel component
- Add PDF viewer component (react-pdf or similar)

---

### 7. List & Table Views

**Status**: Basic list exists, needs enhancement

**Required Features**:

- [ ] **List Display Modes**

  - [x] Card view (current)
  - [ ] Table view toggle
  - [ ] Compact mode option

- [ ] **List Content**

  - [ ] Filtered results matching map
  - [ ] Entity preview cards:
    - [ ] Thumbnail/icon
    - [ ] Name and type
    - [ ] Civilization badge
    - [ ] Verification status
    - [ ] Official vs Community indicator
    - [ ] Quick stats (media count, documents, etc.)

- [ ] **Sorting Options**

  - [ ] Recently updated
  - [ ] Verification status
  - [ ] Alphabetical (A-Z, Z-A)
  - [ ] Distance from map center
  - [ ] Upvote count (for Community)

- [ ] **Interactions**

  - [x] Click to open detail panel
  - [ ] Hover to highlight corresponding pin
  - [ ] Selected state when detail open
  - [ ] Scroll to bring pin into view

- [ ] **Expedition List Features**

  - [ ] Host avatar display
  - [ ] Last update timestamp
  - [ ] Expedition status badge
  - [ ] Follower count

- [ ] **Community Features**
  - [ ] Trust tier badge
  - [ ] Promotion queue position
  - [ ] Quick endorse button

**Technical Tasks**:

- Add table view component (data table)
- Create sort dropdown control
- Implement hover-to-highlight map pin
- Add map-to-list sync (scroll into view)
- Build preview card component variants
- Add pagination (lazy loading or pages)
- Implement multi-select for batch actions (future)

---

### 8. Site Submission Flow (Community-First)

**Status**: Need to implement from scratch

**Required Flow**:

1. **Entry Points**

   - [ ] "+ Add Site" CTA button (in top bar or sidebar)
   - [ ] Right-click context menu on map
   - [ ] "Contribute" button in empty state

2. **Submission Form**

   - [ ] Step 1: Location Selection

     - [ ] Click on map to set coordinates
     - [ ] Or enter lat/lng manually
     - [ ] Draggable pin for fine-tuning
     - [ ] Preview map showing selected location

   - [ ] Step 2: Basic Information

     - [ ] Title/name field (required)
     - [ ] Description/summary (textarea, required)
     - [ ] Civilization dropdown (required)
     - [ ] Site type dropdown (required)
     - [ ] Era/time period (optional)

   - [ ] Step 3: Media Upload

     - [ ] Image upload (drag & drop or file picker)
     - [ ] Multiple image support
     - [ ] Image preview thumbnails
     - [ ] Video URL input (YouTube, Vimeo)
     - [ ] Caption/attribution fields

   - [ ] Step 4: Verification Evidence

     - [ ] Document upload (PDF, images)
     - [ ] External source links
     - [ ] References/citations
     - [ ] Personal notes

   - [ ] Step 5: Review & Submit
     - [ ] Preview all entered data
     - [ ] AI pre-check results display
     - [ ] Suggestions for improvement
     - [ ] Flag issues (missing fields, low quality, etc.)
     - [ ] Terms acceptance checkbox
     - [ ] Submit to Community layer button

3. **AI Pre-Check Integration**

   - [ ] Completeness scoring
   - [ ] Content safety check
   - [ ] Duplicate detection
   - [ ] Coordinate validation
   - [ ] Suggestions display
   - [ ] Minimum quality threshold

4. **Post-Submission**
   - [ ] Success confirmation
   - [ ] Show new pin on map (Community layer)
   - [ ] Open detail panel for new submission
   - [ ] Share link to submission
   - [ ] Track submission in profile

**Technical Tasks**:

- Create multi-step form component
- Build map-based coordinate picker
- Implement image upload with preview
- Add file upload to Supabase Storage
- Create AI pre-check API endpoint (mock for MVP)
- Build validation logic
- Add form state management (react-hook-form)
- Create submission API endpoint
- Add real-time update to map after submission
- Build success/error notification system

---

### 9. Community Features (Upvoting & Trust Tiers)

**Status**: Need to implement from scratch

**Required Features**:

- [ ] **Upvote System**

  - [ ] Upvote button (heart, thumbs up, or star)
  - [ ] Downvote button (optional for MVP)
  - [ ] Current vote count display
  - [ ] User's vote state (voted/not voted)
  - [ ] Optimistic updates
  - [ ] Prevent duplicate votes

- [ ] **Trust Tier System**

  - [ ] Bronze tier (0-10 upvotes)
  - [ ] Silver tier (11-25 upvotes)
  - [ ] Gold tier (26-50 upvotes)
  - [ ] Badge display on pins and cards
  - [ ] Progress bar toward next tier
  - [ ] Tier change notifications

- [ ] **Submission Status Display**

  - [ ] "Pending Review" state
  - [ ] "In Community Review" state
  - [ ] "Ready for Promotion" state
  - [ ] Status timeline/history
  - [ ] Required steps checklist:
    - [ ] Minimum upvotes
    - [ ] Peer endorsements
    - [ ] Media quality check
    - [ ] Verification evidence

- [ ] **Credibility Weighting** (Simple MVP version)
  - [ ] User reputation score (future)
  - [ ] Weighted voting (future)
  - [ ] For MVP: All votes count equally

**Technical Tasks**:

- Create vote button component
- Build vote API endpoints (POST, DELETE)
- Add votes table to Supabase schema
- Implement vote counting logic
- Create tier calculation function
- Add tier badges to pin icons
- Build progress indicator component
- Create status checklist component
- Add real-time vote updates (Supabase Realtime)

---

### 10. Featured Users Profile Pin Overlay

**Status**: Need to implement

**Overview**: A toggleable map layer that displays the locations of notable researchers, content creators, and contributors. Unlike expedition pins (which show where someone went), user profile pins show where researchers are based or currently located. This showcases the global community of megalithic researchers and helps users discover and connect with experts like Graham Hancock, Ben van Kerkwyk, and other prominent figures in the field.

**Connection to Expeditions (Stretch Goal)**: Featured users will want to showcase their expeditions, tours, and events. When expeditions are implemented, each featured user profile will link to their past and upcoming expeditions, creating a powerful narrative of their research journey and attracting followers to their work.

**Required for MVP**:

- [ ] **User Profile Pins**

  - [ ] Circular avatar pins (user profile picture)
  - [ ] Distinct visual style from expedition pins:
    - [ ] Different ring color/thickness
    - [ ] "Featured" badge overlay (star icon)
    - [ ] User type indicator (icon badge)
  - [ ] Pin size variations:
    - [ ] Larger pins for high-profile featured users
    - [ ] Standard size for regular featured users
  - [ ] Hover tooltip displays:
    - [ ] User name and title
    - [ ] Current location name
    - [ ] Number of contributions
    - [ ] Social media presence indicator

- [ ] **User Profile Detail Panel**

  - [ ] Header section:

    - [ ] Large avatar
    - [ ] Name and professional title
    - [ ] "Featured User" badge
    - [ ] Verification checkmark
    - [ ] Location (city, country)
    - [ ] Social media links (website, YouTube, Twitter, etc.)
    - [ ] "Follow" button (for future functionality)

  - [ ] Overview tab:

    - [ ] Bio/description
    - [ ] Areas of expertise (tags/badges)
    - [ ] Years of experience
    - [ ] Current projects
    - [ ] Research interests
    - [ ] Professional affiliations

  - [ ] Contributions tab:

    - [ ] Sites discovered or verified
    - [ ] Artifacts contributed
    - [ ] Research papers/texts uploaded
    - [ ] Expeditions hosted (🎯 Stretch Goal - shows when expeditions implemented)
    - [ ] Community submissions
    - [ ] Statistics (total contributions, upvotes received, etc.)

  - [ ] Media tab:

    - [ ] Featured videos (YouTube embeds)
    - [ ] Photo gallery
    - [ ] Podcast episodes
    - [ ] Documentary clips
    - [ ] Lecture recordings

  - [ ] Activity tab (optional for MVP):
    - [ ] Recent contributions
    - [ ] Recent forum activity
    - [ ] Upcoming expeditions (🎯 Stretch Goal)

- [ ] **User Layer Control**

  - [ ] Toggle "Featured Users" layer on/off
  - [ ] Separate from sites and expeditions layer
  - [ ] Layer indicator showing count of visible users
  - [ ] Works in combination with other layers

- [ ] **User Filtering**

  - [ ] Filter by user type:
    - [ ] Researcher/Academic
    - [ ] Content Creator (YouTube, podcaster)
    - [ ] Archaeologist
    - [ ] Author
    - [ ] Expedition Leader
    - [ ] Community Contributor
  - [ ] Filter by expertise area:
    - [ ] Specific civilizations
    - [ ] Time periods
    - [ ] Geographic regions
  - [ ] Featured status:
    - [ ] High-profile only (Graham Hancock tier)
    - [ ] All featured users
  - [ ] Active/Available status (optional)

- [ ] **Privacy & Visibility Rules**

  - [ ] Only featured users appear on map
  - [ ] Regular users NOT shown by default
  - [ ] Users must explicitly opt-in to be visible
  - [ ] Featured status assigned by admins/moderators
  - [ ] Location privacy options:
    - [ ] Exact location (lat/lng)
    - [ ] City-level (generalized)
    - [ ] Country-level only
    - [ ] Hidden (not shown on map)
  - [ ] Can temporarily disable map visibility

- [ ] **User List Panel Integration**
  - [ ] Show featured users in side list
  - [ ] User cards display:
    - [ ] Avatar thumbnail
    - [ ] Name and title
    - [ ] Location
    - [ ] Contribution count
    - [ ] Featured badge
  - [ ] Sort options:
    - [ ] Alphabetical
    - [ ] By contribution count
    - [ ] By location proximity
    - [ ] By user type
  - [ ] Click to open detail panel
  - [ ] Hover to highlight pin on map

**Not in MVP** (Future Enhancements):

- Real-time "online now" status indicators
- User-to-user messaging
- Collaborative project invitations
- User availability calendar
- "Request to connect" feature
- User reputation scoring beyond contributions

**Technical Tasks**:

- Extend user schema with location fields
- Add `is_featured` and `featured_tier` flags to users table
- Create user profile detail panel component
- Build user avatar pin component (distinct from expedition pins)
- Add user layer toggle to map controls
- Implement user filtering in filter panel
- Add privacy settings to user profiles
- Create admin interface for managing featured status
- Implement location privacy levels
- Build user contributions aggregation queries
- Add user profile public page routing
- Create sample featured users data (Graham Hancock, etc.)

**Sample Featured Users for MVP**:

1. **Graham Hancock** - Author, researcher (Egypt, South America)
2. **Ben van Kerkwyk** - UnchartedX creator (Egypt, megalithic sites)
3. **Randall Carlson** - Geologist, researcher (North America, geological catastrophism)
4. **Jimmy Corsetti** - Bright Insight creator (global ancient sites)
5. **Brien Foerster** - Archaeologist (Peru, South America)

---

### 11. 🎯 Expedition Display (Historical Trips) - STRETCH GOAL

**Status**: High priority stretch goal - Not required for initial MVP launch, but critical for featured users feature

**Why High Priority**: Featured users (Graham Hancock, Ben van Kerkwyk, etc.) will want to showcase their tours, expeditions, and events on the map. This layer becomes a key differentiator and value proposition for attracting high-profile users to the platform. Without expeditions, featured user profiles are less compelling.

**Implementation Note**: If time allows, prioritize over some polish/QA tasks to deliver this for launch. At minimum, create the data model and basic pin display even if detail panel is simplified.

**Required for Full Implementation** (Historical/Archived Expeditions Only):

- [ ] **Expedition Pins**

  - [ ] Circular pins with host avatar
  - [ ] "Archived" status ring
  - [ ] Content format badge (video/podcast/article)
  - [ ] Expedition title on hover

- [ ] **Expedition Detail Panel**

  - [ ] Host information:
    - [ ] Avatar and name
    - [ ] Bio/description
    - [ ] Social links
  - [ ] Expedition metadata:
    - [ ] Title and summary
    - [ ] Start/end dates
    - [ ] Total duration
    - [ ] Privacy level
  - [ ] Associated media:
    - [ ] Image gallery
    - [ ] Video embeds
    - [ ] Document links
  - [ ] Itinerary (stops list):
    - [ ] Location name
    - [ ] Visit date
    - [ ] Notes
    - [ ] Media from stop
  - [ ] Related sites visited
  - [ ] Follower count (if archived)

- [ ] **Expedition Filter**
  - [ ] Toggle expedition layer on/off
  - [ ] Filter by host (dropdown)
  - [ ] Status: Archived (only for MVP)

**Not in MVP** (v1.1):

- Live expedition tracking
- Real-time follower subscriptions
- Route polylines
- Live status indicators

**Technical Tasks**:

- Add expeditions to sample data
- Create expedition pin renderer
- Build avatar pin component
- Add expedition filter controls
- Create expedition detail panel variant
- Build itinerary list component
- Add host bio section
- Implement media gallery for expeditions

---

### 12. Data Integration & Backend

**Status**: Partial (using sample data), needs Supabase integration

**Required Database Tables**:

- [ ] **Core Tables**

  - [ ] `sites`
    - id, name, coordinates (lat/lng), civilization, era, verification_status, layer_status, summary, created_at, updated_at, submitter_id
  - [ ] `artifacts`
    - id, site_id, title, description, verification_status, layer_status, created_at, submitter_id
  - [ ] `texts`
    - id, title, summary, external_url, file_ref, verification_status, layer_status, coordinates (optional)
  - [ ] `expeditions`
    - id, host_user_id, title, summary, status, visibility, created_at, updated_at
  - [ ] `expedition_stops`
    - id, expedition_id, site_id (optional), coordinates, started_at, ended_at, notes

- [ ] **Community Tables**

  - [ ] `community_submissions`
    - id, entity_type, entity_id, submitter_id, ai_score, trust_tier, layer_status, created_at
  - [ ] `submission_votes`
    - id, submission_id, voter_id, vote_value, created_at
  - [ ] `promotion_events`
    - id, submission_id, promoted_at, moderator_id, previous_tier, new_tier

- [ ] **Media & Assets**

  - [ ] `media_assets`
    - id, entity_type, entity_id, type, uri, attribution, created_at

- [ ] **Research Projects** (Optional for MVP)
  - [ ] `research_projects`
    - id, title, description, created_at

**Required API Endpoints**:

- [ ] **GET /api/sites**
  - Query params: bbox, civilization, site_type, verification_status, layer_status, search
  - Returns: Array of sites matching filters within bounding box
- [ ] **GET /api/sites/:id**
  - Returns: Full site details + media + documents + related entities
- [ ] **POST /api/sites**
  - Body: Site data + media uploads
  - Returns: Created site + AI pre-check results
- [ ] **GET /api/artifacts**
  - Similar to sites endpoint
- [ ] **GET /api/expeditions**
  - Query params: status, host_id, bbox
  - Returns: Array of expeditions
- [ ] **GET /api/users/featured**
  - Query params: bbox, user_type, expertise_area, featured_tier
  - Returns: Array of featured users visible on map (where show_on_map=true and is_featured=true)
- [ ] **GET /api/users/:id**
  - Returns: Full user profile + statistics + contributions + media
- [ ] **GET /api/users/:id/contributions**
  - Returns: Paginated list of user's contributions (sites, artifacts, texts, expeditions)
- [ ] **POST /api/votes**
  - Body: submission_id, vote_value
  - Returns: Updated vote count + new tier
- [ ] **DELETE /api/votes/:id**
  - Remove user's vote

**Real-time Subscriptions**:

- [ ] **Sites channel**
  - Subscribe to INSERT events (new submissions)
  - Subscribe to UPDATE events (verification changes)
- [ ] **Votes channel**
  - Subscribe to vote count changes for visible submissions

**Caching Strategy**:

- [ ] Static site data (verified): Cache for 5 minutes
- [ ] Community submissions: Cache for 30 seconds
- [ ] User-specific data: No cache
- [ ] Implement Next.js revalidation on status changes

**Technical Tasks**:

- Create Supabase tables (run migrations)
- Set up Row Level Security (RLS) policies
- Create API route handlers (Next.js App Router)
- Implement bounding box query logic
- Add PostGIS extension for spatial queries
- Set up Supabase Storage buckets
- Create image upload utilities
- Implement real-time subscription hooks
- Add data validation schemas (Zod)
- Create data transformation utilities

---

### 13. Analytics & Telemetry

**Status**: Need to implement

**Required Events for MVP**:

- [ ] **Map Interactions**
  - [ ] `map_view_loaded` - Initial page load
  - [ ] `pin_clicked` - User clicks a pin
  - [ ] `cluster_expanded` - User expands a cluster
  - [ ] `filter_applied` - User changes filters
  - [ ] `layer_toggled` - User switches Official/Community
- [ ] **Detail Panel**
  - [ ] `detail_panel_opened` - Panel opens
  - [ ] `detail_tab_switched` - User changes tabs
  - [ ] `bookmark_clicked` - User bookmarks entity
  - [ ] `share_clicked` - User shares entity
- [ ] **Submissions**
  - [ ] `submission_started` - Form opened
  - [ ] `submission_step_completed` - Each step
  - [ ] `submission_completed` - Successful submit
  - [ ] `submission_abandoned` - User closes form
- [ ] **Community**
  - [ ] `community_vote_cast` - Upvote/downvote
  - [ ] `submission_tier_changed` - Tier progression
- [ ] **Expeditions** (🎯 Stretch Goal)

  - [ ] `expedition_pin_clicked`
  - [ ] `expedition_detail_viewed`

- [ ] **Featured Users**
  - [ ] `user_pin_clicked` - User clicks a featured user pin
  - [ ] `user_detail_viewed` - User opens profile panel
  - [ ] `user_layer_toggled` - Toggle featured users layer
  - [ ] `user_social_link_clicked` - Click on YouTube, Twitter, etc.
  - [ ] `user_contribution_viewed` - View user's contributions tab

**Analytics Provider**:

- [ ] Choose provider (Google Analytics, Mixpanel, Plausible, PostHog)
- [ ] For MVP: Simple event logging to Supabase or basic GA4

**Technical Tasks**:

- Create analytics utility/hook
- Add event tracking calls throughout app
- Set up analytics dashboard
- Add error logging (Sentry or similar)
- Track performance metrics (Core Web Vitals)

---

### 14. Accessibility

**Status**: Basic a11y, needs enhancement

**Required Features**:

- [ ] **Keyboard Navigation**

  - [ ] Tab through map controls
  - [ ] Arrow keys for map panning
  - [ ] +/- or Ctrl+scroll for zoom
  - [ ] Escape to close panels
  - [ ] Enter/Space to activate buttons
  - [ ] Tab order for detail panel content

- [ ] **Screen Reader Support**

  - [ ] Announce pin selection and count
  - [ ] ARIA labels for all controls
  - [ ] Announce layer changes
  - [ ] Announce filter changes
  - [ ] Live regions for dynamic content
  - [ ] Alt text for all images

- [ ] **Visual Accessibility**

  - [ ] High contrast icon set
  - [ ] Color + shape/badge for status (not color alone)
  - [ ] Focus indicators on all interactive elements
  - [ ] Sufficient color contrast (WCAG AA)
  - [ ] Scalable text (no fixed pixel sizes)

- [ ] **Motion & Animation**
  - [ ] Respect `prefers-reduced-motion`
  - [ ] Optional: Disable cluster animations
  - [ ] Smooth but not excessive transitions

**Technical Tasks**:

- Add ARIA labels to all controls
- Implement keyboard event handlers
- Create focus trap for modals
- Test with screen reader (NVDA, JAWS, VoiceOver)
- Run Lighthouse accessibility audit
- Add skip links (skip to map, skip to filters)
- Ensure color contrast compliance

---

## Data Model Summary

### Minimal MVP Schema

```typescript
// sites
interface Site {
	id: string;
	name: string;
	latitude: number;
	longitude: number;
	civilization: string;
	era?: string;
	site_type: string;
	summary: string;
	verification_status: "verified" | "pending" | "unverified";
	layer_status: "official" | "community";
	submitter_id?: string;
	created_at: string;
	updated_at: string;
}

// artifacts
interface Artifact {
	id: string;
	site_id: string;
	title: string;
	description: string;
	verification_status: "verified" | "pending" | "unverified";
	layer_status: "official" | "community";
	submitter_id?: string;
	created_at: string;
}

// texts
interface Text {
	id: string;
	title: string;
	summary: string;
	external_url?: string;
	file_ref?: string;
	latitude?: number;
	longitude?: number;
	verification_status: "verified" | "pending" | "unverified";
	layer_status: "official" | "community";
	created_at: string;
}

// expeditions
interface Expedition {
	id: string;
	host_user_id: string;
	host_name: string;
	host_avatar?: string;
	title: string;
	summary: string;
	status: "archived" | "live" | "upcoming"; // MVP: archived only
	visibility: "public" | "subscribers";
	created_at: string;
}

// expedition_stops
interface ExpeditionStop {
	id: string;
	expedition_id: string;
	site_id?: string;
	latitude: number;
	longitude: number;
	started_at: string;
	ended_at?: string;
	notes: string;
}

// user_profiles (extended from base auth.users)
interface UserProfile {
	id: string;
	username: string;
	display_name: string;
	avatar_url?: string;
	bio?: string;
	professional_title?: string;
	location_name?: string; // City, Country
	latitude?: number;
	longitude?: number;
	location_privacy: "exact" | "city" | "country" | "hidden";
	is_featured: boolean;
	featured_tier: "high_profile" | "featured" | "regular"; // high_profile = Graham Hancock level
	is_verified: boolean;
	user_type: "researcher" | "content_creator" | "archaeologist" | "author" | "expedition_leader" | "community";
	expertise_areas: string[]; // civilizations, time periods
	years_experience?: number;
	website_url?: string;
	youtube_url?: string;
	twitter_url?: string;
	social_links?: Record<string, string>;
	show_on_map: boolean; // user opt-in toggle
	created_at: string;
	updated_at: string;
}

// user_statistics (aggregated)
interface UserStatistics {
	user_id: string;
	total_contributions: number;
	sites_contributed: number;
	artifacts_contributed: number;
	texts_contributed: number;
	expeditions_hosted: number; // Stretch goal - 0 if expeditions not implemented
	community_submissions: number;
	upvotes_received: number;
	verified_contributions: number;
}

// community_submissions (join table)
interface CommunitySubmission {
	id: string;
	entity_type: "site" | "artifact" | "text";
	entity_id: string;
	submitter_id: string;
	ai_score: number; // 0-100
	trust_tier: "bronze" | "silver" | "gold" | "promoted";
	created_at: string;
}

// submission_votes
interface SubmissionVote {
	id: string;
	submission_id: string;
	voter_id: string;
	vote_value: 1 | -1;
	created_at: string;
}

// media_assets
interface MediaAsset {
	id: string;
	entity_type: "site" | "artifact" | "text" | "expedition";
	entity_id: string;
	type: "image" | "video" | "document" | "360_tour";
	uri: string;
	attribution?: string;
	created_at: string;
}
```

---

## Implementation Priority (Suggested Order)

### Phase 1: Core Foundation (Weeks 1-2)

1. ✅ Leaflet map rendering (DONE)
2. ✅ Basic pin display (DONE)
3. ✅ Detail panel structure (DONE)
4. Map controls refinement (zoom reset, scale, coordinates)
5. Viewport persistence
6. Supabase database setup

### Phase 2: Data & Filtering (Weeks 3-4)

1. API endpoints for sites/artifacts/texts
2. Bounding box queries
3. Filter panel UI
4. Filter state management
5. Real-time data sync
6. List view enhancements

### Phase 3: Pin System & Clustering (Week 5)

1. Custom pin icons for all types
2. Verification badges
3. Enhanced clustering
4. Cluster interactions
5. Pin hover/click interactions

### Phase 4: Layer System (Week 6)

1. Official/Community layer toggle
2. Layer filtering logic
3. Visual differentiation
4. Layer-specific queries

### Phase 5: Submission Flow (Weeks 7-8)

1. Site submission form
2. Coordinate picker
3. Media upload
4. AI pre-check (mock)
5. Form validation
6. Post-submission flow

### Phase 6: Community Features (Week 9)

1. Upvote system
2. Trust tier calculation
3. Tier badges
4. Progress indicators
5. Status display

### Phase 7: Featured Users (Week 10)

1. Featured users data model
2. User profile pins
3. User profile detail panel
4. User layer toggle
5. User filtering
6. Sample featured users data (Graham Hancock, etc.)
7. Privacy settings implementation

### Phase 7.5: 🎯 Expeditions (STRETCH GOAL - If time allows)

1. Expedition data model
2. Expedition pins (basic display)
3. Expedition detail panel (simplified)
4. Link expeditions to featured users
5. Sample expedition data

### Phase 8: Polish & Analytics (Week 11)

1. Analytics integration
2. Error tracking
3. Accessibility audit
4. Performance optimization
5. Mobile responsiveness

### Phase 9: Testing & QA (Week 12)

1. End-to-end testing
2. Cross-browser testing
3. Accessibility testing
4. Performance testing
5. Bug fixes

---

## Success Criteria for MVP Launch

### Functional Requirements

- [ ] All pin types display correctly
- [ ] Clustering works smoothly with 500+ pins
- [ ] Filters apply in real-time
- [ ] Detail panel loads without errors
- [ ] Site submission completes successfully
- [ ] Upvoting increments correctly
- [ ] Layer toggle switches content
- [ ] Search returns relevant results

### Performance Requirements

- [ ] Map loads in < 2.5s (cold load, broadband)
- [ ] Filter changes reflect in < 500ms
- [ ] Detail panel opens in < 300ms
- [ ] No jank during pan/zoom
- [ ] Smooth clustering transitions

### Accessibility Requirements

- [ ] Lighthouse accessibility score > 90
- [ ] Keyboard navigation works for all features
- [ ] Screen reader announces key interactions
- [ ] Color contrast WCAG AA compliant
- [ ] Focus indicators visible

### Browser Support

- [ ] Chrome (latest 2 versions)
- [ ] Firefox (latest 2 versions)
- [ ] Safari (latest 2 versions)
- [ ] Edge (latest 2 versions)

### Analytics

- [ ] All key events tracked
- [ ] Error logging active
- [ ] Conversion funnels configured

---

## Open Questions for Team Discussion

1. **AI Pre-Check**: What service/model for AI validation? Mock for MVP?
2. **Media Storage**: Supabase Storage limits? CDN needed?
3. **Real-time**: All users subscribe to all sites? Or viewport-based subscriptions?
4. **Authentication**: Required for upvoting? Guest browsing allowed?
5. **Moderation**: Who reviews community submissions in MVP? Manual queue?
6. **Expeditions**: Sample historical expeditions for MVP? Need content?
7. **Performance**: What's our target for max concurrent users?
8. **Deployment**: Vercel? Self-hosted? Database location?
9. **Featured Users**: Who decides featured status? What criteria? How do we reach out to high-profile users like Graham Hancock?
10. **User Privacy**: What default location privacy level? How to handle users who move frequently?

---

## Post-MVP Roadmap (v1.1 Preview)

Planned for v1.1 (not in MVP scope):

- Artifact and Text submission flows
- Discussion tab integration (forum threads)
- Saved filter presets
- Community promotion workflow
- Map presence indicators (other viewers)
- Activity tab (timeline)
- **Expedition Features** (if not completed in MVP stretch goal):
  - Full expedition implementation with detail panels
  - Live expedition tracking (real-time)
  - Follower subscriptions
  - Route polylines connecting stops
  - Expedition itinerary timeline
  - Link expeditions to featured users
- **User Features**:
  - User-to-user messaging
  - Real-time "online now" status for featured users
  - User collaboration requests
  - User availability calendar
  - All users map visibility (with privacy controls)

---

## Conclusion

This MVP plan delivers a functional, engaging map experience with core discovery, filtering, and community contribution features. The phased approach allows for iterative development while maintaining focus on the most critical user journeys: exploring sites, understanding context through detail panels, and contributing new discoveries through the Community layer.

**Key Priorities for Launch**:

1. **Featured Users Layer** - Critical for attracting high-profile researchers and content creators to the platform
2. **Site Discovery & Filtering** - Core user experience for exploring ancient sites
3. **Community Contributions** - Enable user-generated content and engagement
4. **🎯 Stretch Goal: Expeditions** - High importance for featured users to showcase their work, implement if time allows

**Total estimated effort**: 10-12 weeks for a small team (2-3 developers)

- Core MVP: 9-10 weeks
- Expeditions stretch goal: +1-2 weeks (can be simplified)

**Key risks**:

- Performance with large datasets
- Real-time scaling
- AI pre-check integration
- Media upload/storage costs
- Featured user outreach and onboarding

**Mitigation strategies**:

- Implement aggressive clustering and bounding box queries
- Use viewport-based real-time subscriptions
- Start with mock AI (manual review)
- Set strict upload limits and compression
- Begin featured user outreach early in development (Graham Hancock, Ben van Kerkwyk, etc.)
