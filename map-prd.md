# Megalithic Mapper - Interactive Map PRD

## 1. Product Overview

The interactive map is the core exploratory surface for Megalithic Mapper. It visualizes ancient sites, artifacts, expedition activity, and research locations on a Leaflet-powered world map so researchers, content creators, and everyday enthusiasts can analyze spatial relationships, inspect rich metadata, and contribute new findings. The experience exposes side-by-side Official and Community map layers: the Official layer highlights vetted, moderator-approved content, while the Community (Unofficial) layer channels low-barrier submissions that pass AI-assisted moderation and community review before promotion. The map must function as a complex dashboard with contextual panels, cross-linking to related content, and collaboration features that help teams move from discovery to discussion while inspiring high-quality community contributions.

## 2. Goals & Success Metrics

- **Single source of geographic truth**: Present an authoritative, filterable view of all vetted sites, artifacts, and research assets.
- **Accelerate research workflows**: Reduce clicks to move from a geospatial view to artifacts, documents, and discussions.
- **Promote contributions**: Provide in-context creation flows that encourage uploading new sites, artifacts, or texts.
- **Build trust**: Surface verification badges, provenance tags, and moderator notes directly on map entities.
- **Elevate community voices**: Provide a clear pathway for citizen discoveries to move from Community to Official map status.
- **Success metrics**:
  - > =70% of active users interact with at least one map pin per session.
  - > =40% of research project visits originate from the map.
  - Submission funnel conversion (map-triggered submissions) >=15%.
  - Map renders in <2.5s for 90th percentile cold loads on broadband.
  - > =30% of new Official entries originate from promoted community submissions each quarter.

## 3. Primary Personas

- **Field Researcher**: Needs to validate new site discoveries, overlay past expeditions, and upload media from digs.
- **Academic Curator**: Evaluates existing artifacts/texts, ensures provenance, and links them to research hypotheses.
- **Expedition Host / Content Creator**: Plans public-facing trips, uploads field footage, and wants fans to follow live or historical routes.
- **Citizen Explorer**: Browses both Official and Community layers, submits discoveries with minimal friction, and collaborates via upvotes and annotations.
- **Moderator**: Oversees submissions, tracks verification pipeline, and maintains data consistency.

## 4. Use Cases

1. Researcher searches for megalithic structures in the Andes, filters by era, and inspects associated texts before joining a forum thread.
2. Curator reviews newly added artifacts, checks provenance tags, and approves the submission from the map detail panel.
3. Citizen explorer toggles between Official and Community layers, upvotes promising finds, and contributes photos to elevate a discovery toward Official status.
4. Moderator receives alerts about low-confidence submissions, opens pin detail, and toggles visibility or assigns verification.
5. Expedition host plots a new tour, tags Community submissions they plan to visit, and schedules live updates for followers.

## 5. Experience Overview

- **Layout**: Split view with map on left (70%) and detail/dashboard column on right (30%). Detail column houses tabs: Overview, Media, Documents, Discussion, Activity.
- **Leaflet Map**:
  - Dual-layer switcher that separates Official (vetted) and Community (AI-precleared) pins, with badges showing promotion status.
  - Custom tile styling (Dark mode) with support for switching to satellite (future phase).
  - Pin icons by entity type (Site, Artifact, Text/Research Location, Expedition, Verification status).
  - Expedition overlays that display host avatars as circular pins, optionally pulsing when a trip is live.
  - Toggleable expedition layer that reveals historical routes, highlights recent stops, and filters by host.
  - Cluster aggregation icons showing count and predominant status at lower zoom levels.
  - Dynamic bounding box filtering tied to site list and data fetch.
- **Detail Interactions**:
  - Clicking a cluster zooms in or expands contents.
  - Clicking a pin opens a detail drawer or panel showing rich content.
  - Secondary interactions for bookmarking, adding to project, or launching contributions.
  - Expedition detail view surfaces host bio, ongoing itinerary, and quick links to follow or join community threads.
  - Community contributions display trust tiers, upvote controls, and transparent moderation queue states with paths to request promotion.

## 6. Functional Requirements

### 6.1 Map Canvas & Controls

- Render Leaflet map with adaptive viewport height minus navigation chrome.
- Provide zoom, pan, and reset controls; keyboard accessible navigation.
- Display a scale indicator, coordinates on hover, and optional grid overlay toggle.
- Persist last viewed viewport per user session.
- Layer control to switch Official, Community, and Expedition overlays independently with keyboard-accessible toggles.

### 6.2 Pin Taxonomy

- **Site pins**: Primary icon (e.g., monument silhouette) with color-coded civilization or verification status.
- **Artifact pins**: Linked to parent site; use ring icons that show relationship to site.
- **Texts/Research pins**: Represent libraries, archives, or research headquarters; use scroll/book icon.
- **Expedition pins**: Circular avatar pins that use the host's profile picture with a status ring (live, archived, planned) and optional badge for content format (video, podcast, article).
- **Expedition routes**: Polylines connecting chronological stops with tooltips for start/end dates, travel distance, and recently uploaded media highlights.
- **Unverified submissions**: Outline icon with badge to signal pending review.
- **Community tiers**: Badge overlays (Bronze, Silver, Gold) that indicate how close a community submission is to Official status based on upvotes, credibility score, and moderator checkpoints.

### 6.3 Clustering & Density Handling

- Use Leaflet marker clustering with intelligent breakpoints to avoid overcrowding.
- Cluster badges display total items and highlight predominant type or verification badge.
- Expedition clusters use an avatar mosaic when multiple hosts overlap, with a live badge if any active trips are inside.
- Community clusters surface tier composition (e.g., count of Bronze/Silver/Gold submissions) and show promotion thresholds.
- On cluster click: zoom into cluster bounds; if minimal zoom change, show a mini list overlay.
- Support heatmap overlay (phase 2) for high-density research regions.

### 6.4 Filtering & Search

- Filters panel with:
  - Civilization (multi-select with counts).
  - Cultural era / time range slider.
  - Site type (temple, observatory, tomb, megalith, etc.).
  - Verification status (Verified, Pending, Community).
  - Map layer (Official, Community, Composite).
  - Community trust tier (Bronze, Silver, Gold, Promoted).
  - Research project association. (not as important)
  - Expedition host (filter by researcher or content creator).
  - Expedition status (Live, Archived, Upcoming).
- Text search with suggestions (site names, artifact IDs, researchers).
- Saved filter presets per user.
- Filter application updates both map markers and list panel in real-time.

### 6.5 Detail Panel

- **Header**: Entity name, civilization, verification badge, quick actions (bookmark, share, flag).
- **Overview tab**: Summary, coordinates, era, contributor credits, linked hypotheses.
- **Media tab**: Carousel embedding images, 360 tours, videos.
- **Documents tab**: Inline previews of PDFs, transcriptions, external links.
- **Discussion tab**: Latest forum thread summaries with quick reply.
- **Activity tab**: Timeline of changes, submissions, verification events.
- Expedition overview includes host bio, crew roster, upcoming event dates, and follower metrics.
- Community submissions show trust tier progress, AI moderation summary, upvote counts, and required steps for Official promotion (peer endorsements, moderator review, additional evidence).
- Link to full entity page (`/sites/:id`, `/artifacts/:id`) and parent site reference.
- Inline quick actions: start new research thread, request verification, add artifact to site.

### 6.6 List & Table Views

- Secondary pane showing filtered results as cards or table.
- Supports sorting (recently updated, verification status, alphabetical).
- Hovering over list item highlights corresponding pin.
- Multi-select for batch actions (assign to project, export CSV).
- Expedition entries display host avatar, last broadcast timestamp, and next planned stop.
- Columns indicate Official vs Community status, current trust tier, and promotion queue position with quick actions to endorse or provide supporting evidence.

### 6.7 Submission Flows

- All submission flows default to Community layer; contributors choose Official only when meeting verification requirements. AI pre-check evaluates completeness, flags issues, and suggests improvements before final submission.
- **Sites**:
  - Launch from map via `+ Add Site` CTA or right-click context menu on map.
  - Form captures coordinates (map selection), title, description, civilization, era, media upload, verification evidence.
  - Optional linking to existing research projects.
- **Artifacts**:
  - Initiated from site detail or global CTA.
  - Requires associated site selection, artifact description, media, provenance tags (origin, current location).
  - Supports multiple media assets and document attachments.
- **Texts & Research**:
  - Form collects title, summary, external link or PDF upload, related sites/artifacts.
  - Option to schedule internal discussion or follow-up task.
- **Expeditions**:
  - Started from an expedition layer CTA or directly from a host profile.
  - Form captures host, crew, itinerary (stops with timestamps), media playlist, and privacy settings (public, subscriber-only).
  - Allows attaching daily logs, linking to live stream platforms, and tagging associated sites or artifacts visited.
- Promotion workflow surfaces after submission: community voting phase, AI credibility scoring, moderator review, and final promotion toggle to Official layer.

### 6.8 Collaboration & Real-time

- Live marker updates when new submissions are approved.
- Indicate other viewers on the same site (avatar presence).
- In-panel commenting with optimistic updates.
- Notifications when subscribed sites receive new activity.
- Followers can subscribe to expeditions for push updates when hosts add new media or change locations.
- Real-time upvote tallying and tier progression indicators update as community members endorse contributions; moderators receive queue alerts when a submission crosses promotion thresholds.

### 6.9 Permissions & Roles

- Role-based visibility:
  - Verified researchers see pending submissions in situ.
  - Moderators can toggle pin visibility, assign verification tasks.
  - Guests see only verified content and teaser for membership.
  - Registered citizen contributors can add Community layer content, vote, and earn tier badges.
- Expedition hosts can obfuscate live coordinates (rounded or delayed) for safety.
- Audit logging for all map interactions influencing data.

### 6.10 Offline & Error Handling

- Graceful fallback when Leaflet tiles fail (retry, fallback view).
- Indicate when filters yield zero results; suggest clearing filters.
- Offline indicator with cached last-known markers (phase 2).

## 7. Data & Integration Requirements

- Data sourced from Supabase tables:
  - `sites`: id, name, coordinates (lat/lng), civilization, era, verification status, summary, parent relationships.
  - `artifacts`: id, site_id, title, description, media refs, provenance tags, status.
  - `texts`: id, title, summary, external_url, file_ref, related_site_ids, related_artifact_ids.
  - `expeditions`: id, host_user_id, title, summary, status, current_stop_id, social_links, visibility.
  - `expedition_stops`: id, expedition_id, site_id (optional), coordinates, started_at, ended_at, notes, media_refs.
  - `expedition_followers`: expedition_id, user_id, notification_preferences.
  - `community_submissions`: id, entity_type, entity_payload, submitter_id, ai_score, trust_tier, layer_status.
  - `submission_votes`: submission_id, voter_id, vote_value, credibility_weight.
  - `promotion_events`: submission_id, promoted_at, moderator_id, previous_tier, new_tier, notes.
  - `media_assets`: id, entity_type, entity_id, type, uri, attribution.
  - `research_projects`: id, title, hypothesis links, member list.
- API layer (Next.js server actions or edge functions) for:
  - Filtered data fetching (respecting bounding box + filters).
  - Submission endpoints with validation.
  - AI moderation webhooks (content classification, safety scoring).
  - Real-time updates via Supabase Realtime channels (sites, artifacts, expeditions, discussions, community_submissions).
- Caching: Leverage Next.js caching for static segments; use revalidation when verification status changes.
- Geospatial indexing: Consider PostGIS extension for spatial queries (phase 2).

## 8. Analytics & Telemetry

- Track events:
  - `map_view_loaded`, `pin_clicked`, `cluster_expanded`, `filter_applied`, `detail_tab_switched`, `submission_started`, `submission_completed`.
  - `expedition_pin_clicked`, `expedition_followed`, `expedition_stop_viewed`, `expedition_live_toggle`.
  - `community_submission_created`, `community_vote_cast`, `submission_tier_changed`, `submission_promoted`.
  - Dwell time on detail panel, bounce rates between tabs.
- Heatmap analytics for clusters to inform default zoom levels.
- Error logging for failed submissions or tile loads (Sentry or equivalent).

## 9. Accessibility & UX Guidelines

- Keyboard navigation for map controls (tab focus, arrow panning, zoom shortcuts).
- High-contrast icon set; ensure color-coded statuses also include shape or badge.
- Screen-reader friendly detail panel: announce pin selection and key metadata.
- Respect reduced motion preferences (limit animation on clustering transitions).
- Provide text alternatives for host avatar pins and announce live expedition status to screen readers.
- Ensure Official/Community layer toggles and trust-tier indicators are screen-reader labelled and reachable without pointer devices.

## 10. Technical Constraints & Considerations

- Leaflet must render on client; guard SSR with dynamic import (already used).
- Optimize payload size via lazy loading detail data (documents/media fetched on demand).
- Implement server-side pagination for list panel when results exceed threshold.
- Debounce filter interactions to avoid spamming queries.

## 11. Release Plan

- **MVP (v1)**:
  - Site/Artifact/Text pins with clustering.
  - Detail panel with Overview + Media + Documents tabs.
  - Filters for civilization, site type, verification.
  - Dual Official/Community layer toggle with read-only Official content and AI-prechecked Community submissions.
  - Site submission flow (Community-first) with basic AI validation and upvoting.
  - Basic analytics events.
  - Expedition pins for historical trips with associated media sets and host profiles.
- **v1.1**:
  - Artifact and Text submission flows.
  - Discussion tab integration (forum threads embed).
  - Saved filter presets.
  - Map presence indicators.
  - Live expedition tracking with avatar pins, follower subscriptions, and itinerary playback.
  - Community promotion workflow (tier progression, moderator dashboard, Official publish action).
- **Future**:
  - Heatmap overlay, advanced expedition telemetry (real-time GPS ingest, predictive routes).
  - Offline caching for field work.
  - Satellite basemap toggle, VR/AR preview.
  - Custom user-defined layers (e.g., climate overlays).

## 12. Risks & Mitigations

- **Data accuracy**: Provide moderation workflow and audit logs; require verification tags.
- **Performance under load**: Implement clustering, bounding box queries, and lazy detail loads.
- **Content abuse**: Gate submissions by role, add flagging, and integrate reporting queue.
- **Media storage costs**: Use Supabase storage lifecycle policies, encourage compression, and limit upload sizes.
- **Location privacy**: Require explicit opt-in for live tracking, support coordinate obfuscation, and log access to live feeds.
- **Signal manipulation**: Detect vote brigading, weight credibility scores, and add AI anomaly detection to keep promotions trustworthy.

## 13. Open Questions

- Should we allow offline first data entry for field researchers with later sync?
- What is the maximum acceptable lag for real-time updates across collaborators?
- Do we need 3D terrain or time-series playback in near future?
- How should we handle disputed site locations (multiple pin positions)?
- Which external GIS datasets (DEM, UNESCO, etc.) should be layered for context?
- What refresh cadence balances live expedition excitement with host privacy and safety?
- Do expedition hosts require identity verification or moderation before appearing on the map?
- What thresholds (AI score, upvotes, moderator endorsements) should trigger automatic promotion reviews from Community to Official?
- How do we acknowledge and reward citizen contributors when their submissions are promoted?

## 14. Dependencies

- Leaflet + react-leaflet for map rendering.
- Supabase for auth, data storage, realtime.
- Shadcn UI components for panel UI.
- Node `node:test` for regression checks.
- CDN for media delivery (to be determined).

## 15. Definition of Done

- All MVP requirements implemented with passing QA checklist.
- Map renders without blocking errors across supported browsers (Chrome, Firefox, Safari, Edge).
- Keyboard and screen-reader pass basic accessibility audit.
- Analytics events captured and visible in dashboard.
- Documentation updated for content submission workflows and moderator guidelines.
