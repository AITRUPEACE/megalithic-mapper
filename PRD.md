# Ancient Civilizations Research Social Network PRD

## Document Control
- **Owner:** Solo developer working with coding agent
- **Date:** 2024-XX-XX
- **Target Release:** MVP in 8 weeks
- **Change Log:** Maintain within repo via Git commits

## 1. Vision & Objectives
Create a community-driven platform dedicated to mapping and researching ancient civilizations. The product combines geospatial exploration, knowledge sharing, collaborative research tooling, and multimedia discussion to help archaeologists, historians, enthusiasts, and content creators collaborate. The MVP focuses on core discovery, contribution, and trust-building features while planting the groundwork for shared research breakthroughs.

### Business Objectives
1. Aggregate user-contributed site, artifact, and literature information in a searchable, map-driven interface.
2. Foster a trustworthy community with verified creators and structured discussion.
3. Provide a foundation for future premium research tools and partnerships with academic institutions.

### Success Metrics
- 500 registered users and 50 verified contributors within 3 months of MVP launch.
- ≥ 60% weekly returning verified contributors.
- ≥ 3 average pieces of content (sites, posts, media) contributed per active user per week.
- Time-to-first-contribution ≤ 10 minutes for new users after onboarding.

## 2. Product Scope

### In-Scope (MVP)
- Public landing page describing the network and inviting sign-ups.
- Authenticated web application with email/password & magic link authentication via Supabase.
- Profile creation/editing, including verification status and areas of expertise.
- Interactive world map using Leaflet to visualize ancient sites, artifacts, and research locations.
- Content submission for:
  - **Sites**: geospatial pin, description, cultural era, media.
  - **Artifacts**: associated site, description, media, provenance tags.
  - **Texts & Research**: external links, PDF references, summaries.
- Collaborative research workspace for connecting artifacts, texts, figures, and hypotheses.
- Social interaction:
  - Discussion threads (forum-style) tied to content or general topics.
  - Image forum/gallery with tagging and search.
  - Embedded YouTube videos inside posts.
  - Commenting and reactions (like/upvote) on posts.
- Search & discovery:
  - Text search across content using Supabase full-text search.
  - Filters by era, geography, content type, verification status.
  - Map-based filtering using bounding box and cluster markers.
- Verified users system:
  - Admin-managed verification requests.
  - Visual badges across UI.
- Notifications (in-app) for replies, mentions, verification updates.
- Basic moderation tools for admins (hide content, ban users).
- Responsive layout using shadcn/ui components.

### Out-of-Scope (Post-MVP/Future)
- Mobile native applications.
- Monetization, subscriptions, or donations.
- AI-driven content recommendations or fact-checking.
- Complex moderation workflows (appeals, automated detection).
- Real-time collaborative editing.
- Offline or downloadable map datasets.

## 3. Personas & Use Cases

### Personas
1. **Field Researcher (Verified Contributor)**
   - Needs to document findings, share GPS coordinates, attach field photos.
   - Requires credibility through verification and ability to moderate comments.
2. **Historian/Academic**
   - Consumes and contributes long-form text, bibliographies, and curated collections.
   - Wants rigorous metadata, citations, and discussion with peers.
3. **Content Creator**
   - Shares explainer videos, image galleries, and interacts with followers.
   - Needs easy embedding and community feedback.
4. **Enthusiast**
   - Browses map, learns about sites, asks questions in forums.
   - Contributes lightweight comments and curated media.
5. **Admin/Moderator**
   - Verifies users, reviews reports, removes inappropriate content.

### Key Use Cases
- Researcher pins a newly documented megalithic wall with photos and coordinates.
- Historian uploads a translation summary and links to ancient text PDFs.
- Creator shares a YouTube playlist embedded within a themed discussion thread.
- Enthusiast filters map to "Neolithic" sites in South America and joins the related forum.
- Verified contributors co-author a research project linking sound resonance measurements, mythic figures, and temple layouts to test a new theory.
- Admin reviews verification requests and flags duplicate site submissions.

## 4. Feature Requirements

### 4.1 Authentication & Profiles
- Supabase email/password & magic link flows.
- User profile fields: display name, affiliation, bio, avatar, expertise tags, verification status.
- Profile editing screen with shadcn forms, validation, autosave feedback.
- Verification request form: upload credentials or references, tracked by admins.

### 4.2 Mapping & Geospatial Content
- Leaflet map component with base tiles (OpenStreetMap default) and custom marker icons per content type.
- Cluster markers for dense areas; clicking opens summary card and link to detail page.
- Content creation form integrates map picker for coordinates (drag marker or search geocoder - use third-party API placeholder instructions).
- Sites include fields: name, culture, period, coordinates, summary, media attachments (images via Supabase Storage), references.
- Artifacts link to parent site ID and include discovery details, materials, current location.
- Map filters: time period, type, verified-only toggle.

### 4.3 Content Types & Media
- Posts support markdown-like rich text (shadcn editor), image uploads (Supabase Storage), YouTube embed validation (URL parsing).
- Image gallery view with masonry layout, tags, and search by tag or keyword.
- Text repository view with filters by civilization, material type, language.
- Content detail pages show metadata, media carousel, related discussions.

### 4.4 Social & Community
- Forum threads organized by topic or tied to specific content items.
- Nested comments up to 2 levels, with reaction counts.
- Mention users with `@` autocompletion.
- Notification center with unread badges; store notifications in Supabase table.
- Follow creators and receive notifications on new posts (MVP: toggle per creator).
- Research hub threads focused on collaborative theory-building.

### 4.5 Collaborative Research Workspace
- Dedicated **Research Hub** section aggregating collaborative research projects centered on themes (e.g., "Acoustic Properties of Stone Chambers").
- Allow verified users to create research projects with:
  - Research summary, objectives, geographic focus, associated eras.
  - Structured hypotheses cards with status (proposed, under review, validated, deprecated).
  - Linked entities: sites, artifacts, texts, media, historical/mythic figures.
  - Relationship graph view (Leaflet overlay or network diagram component) showing connections between linked entities.
- Contribution workflow:
  - Participants append evidence notes, upload media, cite references, and tag related content.
  - Threaded discussions per hypothesis with decision log (accepted/rejected rationale).
  - Ability to propose new connections (e.g., artifact to mythic figure) with justification and peer review.
- Research activity feed summarizing recent contributions, new links, and outstanding questions.
- Version history for hypotheses and project summaries to track evolution of theories.
- Read-only access for non-verified users with option to request participation.

### 4.6 Search & Discovery
- Global search bar hitting Supabase RPC for full-text search across tables.
- Search results segmented by type (Sites, Artifacts, Texts, Discussions, Users).
- Map search integration: bounding box queries to fetch relevant geospatial entries.
- Saved searches (MVP: store last 5 queries per user).

### 4.7 Admin & Verification
- Admin role flag in Supabase auth metadata.
- Admin dashboard:
  - Queue of verification requests with attachments.
  - Content moderation table: filter by reports, date, content type.
  - Actions: approve/deny verification, hide/unhide content, ban/unban user.
- Logging of admin actions for audit trail.

### 4.8 Non-Functional Requirements
- Responsive across desktop, tablet, mobile.
- Performance: initial map load < 3s on broadband; API requests < 500ms.
- Accessibility: WCAG AA (color contrast, keyboard nav, ARIA labels on map controls).
- Localization-ready (strings stored for future translation, but MVP in English only).
- Analytics: page views, content contributions, verification conversion (use Supabase or simple logging for MVP).

## 5. Information Architecture & Data Model

### High-Level Entities
- `users`: profile info, verification status, expertise tags.
- `verification_requests`: user ID, submission data, status, reviewer ID, timestamps.
- `sites`: geospatial data (lat/lng), era, culture, description, media refs.
- `artifacts`: site_id, description, material, era, storage location, media.
- `texts`: title, author, era, language, external_url or storage path, summary.
- `posts`: content (rich text), type (forum, gallery, video), linked entity IDs.
- `comments`: parent_id, post_id, body, reactions summary.
- `media_assets`: storage path, type, metadata, owner_id, moderation status.
- `notifications`: user_id, type, payload, read_at.
- `follows`: follower_id, followee_id.
- `reactions`: user_id, target_type, target_id, reaction_type.
- `research_projects`: title, summary, objectives, status, owner_id, access level.
- `research_hypotheses`: project_id, title, description, status, confidence, version metadata.
- `research_links`: project_id, source_type/id, target_type/id, relationship_type, justification, reviewer_id, status.
- `research_notes`: project_id, hypothesis_id (optional), author_id, body, media_refs, created_at.
- `reports` (post-MVP optional placeholder): reason, reporter_id, target.

### Relationships
- Users have many posts, comments, follows, media assets.
- Sites have many artifacts, posts, media assets.
- Posts can be tied to specific site/artifact/text via polymorphic relation.
- Research projects have many hypotheses, notes, and linked entities.
- Research links connect polymorphic entities (site ↔ artifact, text ↔ figure, etc.) within a project.
- Verification requests belong to users; admins process them.

### Data Storage
- Supabase Postgres for relational data and PostGIS extension for geospatial queries (if enabled; otherwise store lat/lng numeric and use bounding box math).
- Supabase Storage buckets for images/documents (with signed URLs for access).

## 6. UX & Interaction Guidelines

### Navigation Structure
- **Public Landing** → Sign In / Sign Up → Onboarding wizard (profile setup, follow suggested users).
- Authenticated layout: sidebar navigation (Map, Discover, Forum, Media, Text Library, Notifications, Profile).
- Research Hub entry point highlighting active collaborative projects and personalized invitations.
- Map page: full-height map with filter drawer, list view on right for selected results.
- Content detail: hero media, metadata tabs (Overview, Discussion, References), related map inset.
- Forum threads: list of topics with filters (Latest, Trending, Verified-only).

### Design System
- Base on shadcn/ui components with Tailwind customization.
- Typography referencing historical/archaeological aesthetic (serif headings, high readability body text).
- Color palette: earth tones with accent for verification badge.
- Icons for content types (site, artifact, text, video) for quick visual identification.

### Mapping UX Guidelines
- Use Leaflet with responsive container, default viewport to world view.
- Provide marker clustering (leaflet.markercluster or equivalent) to manage density.
- On marker hover/click show summary card with quick actions (view detail, open discussion).
- Support drawing bounding box/polygon search in future; MVP uses bounding box from viewport.
- Provide toggle for satellite tiles (if licensing allows) or future enhancement.

### Accessibility Considerations
- Map controls must be keyboard accessible (tab order, focus states).
- Provide textual description for map markers in accompanying list for screen readers.
- Ensure video embeds have accessible titles and transcripts where available.

## 7. Technical Architecture

### Frontend
- Next.js 14 App Router (TypeScript) with server actions where suitable.
- shadcn/ui for component primitives; Tailwind CSS for styling.
- Leaflet for map rendering; integrate via dynamic import (`next/dynamic`) to avoid SSR issues.
- Supabase client for auth and data fetching (server-side and client-side as needed).
- React Query or Supabase hooks for data synchronization.
- Edge caching for public pages (map, discovery) where possible.
- Research Hub integrates lightweight knowledge graph visualization (client-rendered with D3/Sigma.js) and uses Leaflet overlays for geospatial context on linked entities.

### Backend / Services
- Supabase Postgres + Auth + Storage.
- Supabase Functions/Edge Functions for server-side business logic (e.g., verification processing, notifications dispatch).
- PostGIS extension for geospatial queries; fallback to computed bounding box if not available.

### Integrations
- YouTube embed support via oEmbed or manual parsing; store metadata (title, channel) when embedding.
- Optional geocoding service (Mapbox/Photon/Nominatim) for location search; store API keys in environment variables.
- Email delivery via Supabase (magic links, notifications, verification updates).

### Deployment
- Vercel deployment for Next.js frontend.
- Supabase project for backend services.
- Environment management via `.env.local` (local) and Vercel/Supabase secrets.

## 8. Feature Breakdown & Milestones

### Milestone 1 – Foundation (Weeks 1-2)
- Project setup (Next.js, Tailwind, shadcn, Supabase client).
- Auth flows (sign up/in, session management).
- Basic layout and navigation skeleton.
- Database schema scaffolding in Supabase (users, sites, posts, comments).

### Milestone 2 – Mapping & Content (Weeks 3-4)
- Leaflet map integration with sample data.
- Site and artifact creation forms with map picker.
- Content detail pages with media upload to Supabase Storage.
- Search API endpoints for map and text search.

### Milestone 3 – Social & Verification (Weeks 5-6)
- Forum threads, comments, reactions, notifications.
- Verification request flow and admin dashboard basics.
- Profile pages with follow functionality.
- Image gallery and video embedding.
- Initial Research Hub rollout with project creation, hypothesis cards, and linking existing entities.

### Milestone 4 – Polish & Launch (Weeks 7-8)
- Responsive design QA.
- Accessibility and performance improvements.
- Content moderation tools.
- Analytics instrumentation and launch checklist.
- Enhanced research collaboration features: activity feed, decision logs, and read-only public views.

## 9. Analytics & Reporting
- Track key funnel events: sign-up, profile completion, first content submission, verification request, verification approval.
- Monitor content engagement metrics: views, reactions, comments per item.
- Map usage: number of map searches, filter usage, average session length on map page.
- Research Hub engagement: number of active projects, hypotheses status transitions, cross-entity link submissions, and collaboration participation rate (unique contributors per project).
- Error monitoring via Vercel + Supabase logs.

## 10. Risks & Mitigations
- **Data accuracy & credibility:** Introduce verification badge, admin moderation, citation fields.
- **Geospatial performance:** Use clustering and pagination; leverage PostGIS indexes.
- **Content moderation burden:** Start with basic hide/ban tools and plan for community moderation later.
- **Media storage costs:** Compress images client-side before upload; limit per-upload size.
- **Leaflet SSR issues:** Use dynamic import and ensure map renders only client-side.
- **User onboarding complexity:** Provide guided onboarding and default follow suggestions.

## 11. Open Questions
- What licensing is required for map tiles beyond OSM default?
- Should verification include document uploads stored securely (encryption at rest)?
- What is the threshold for automatic content flagging (e.g., keyword filters)?
- Will we integrate with academic repositories (e.g., JSTOR) in future iterations?

## 12. Appendices
- **Glossary**: Define key terms (site, artifact, text, post, verification).
- **References**: Include inspiration from existing archaeological platforms and social networks.
- **AI Collaboration Guidelines**:
  - Coding agent can handle repetitive scaffolding, UI wiring, API integration tasks.
  - Human developer reviews architecture decisions, critical security logic, and moderation workflows.
  - Maintain clear issue descriptions and acceptance criteria for each task before delegating to agent.
  - Enforce code reviews by human before merge.

