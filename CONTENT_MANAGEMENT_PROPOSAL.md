# Content Management System Proposal

## Problem Statement

The current architecture treats media and texts as separate, loosely-coupled entities. We need a robust system to:

1. **Link content to sites** - Media and texts should be strongly associated with sites when applicable
2. **Support standalone content** - Allow orphaned content (not linked to any site)
3. **Enable social features** - Comments, ratings, likes, and user engagement
4. **Handle various media types** - Images, videos, YouTube embeds, PDFs, external links
5. **Scale to large volumes** - Efficient querying and filtering for thousands of items
6. **Track provenance** - Clear attribution, submission dates, verification status

## Proposed Architecture

### 1. Unified Content Model

Create a flexible content system with:

- **Content Items** (sites, media, texts, posts)
- **Content Relationships** (links between items)
- **User Interactions** (comments, ratings, bookmarks)
- **Moderation State** (verification, flagging, promotion)

### 2. Enhanced Type System

```typescript
// Base content types
type ContentType = "site" | "image" | "video" | "youtube" | "document" | "text" | "post" | "link";

// Content item interface
interface ContentItem {
	id: string;
	type: ContentType;
	title: string;
	description: string;

	// Attribution
	submittedBy: {
		userId: string;
		username: string;
		displayName: string;
		avatar?: string;
		verificationStatus: VerificationStatus;
	};
	createdAt: string;
	updatedAt: string;

	// Verification & Trust
	verificationStatus: VerificationStatus;
	trustTier?: CommunityTier;

	// Content specifics
	data: ContentData; // Varies by type

	// Relationships
	linkedSites: string[]; // Site IDs this is linked to
	linkedContent: string[]; // Other content items
	tags: string[];

	// Metadata
	civilization?: string;
	era?: string;
	geography?: Partial<GeographicHierarchy>;

	// Engagement
	stats: ContentStats;
}

// Content-specific data
type ContentData = ImageData | VideoData | YoutubeData | DocumentData | TextData | PostData | LinkData;

interface ImageData {
	url: string;
	thumbnail: string;
	width?: number;
	height?: number;
	format?: string;
	source?: string; // Original source URL if applicable
	license?: string;
}

interface VideoData {
	url: string;
	thumbnail: string;
	duration?: number;
	format?: string;
	source?: string;
}

interface YoutubeData {
	videoId: string;
	thumbnail: string;
	duration?: number;
	channelName?: string;
	channelId?: string;
}

interface DocumentData {
	url: string;
	fileType: "pdf" | "doc" | "docx" | "txt" | "other";
	fileSize?: number;
	pages?: number;
	author?: string;
	language?: string;
}

interface TextData {
	body: string; // Markdown or rich text
	author?: string;
	originalLanguage?: string;
	translatedBy?: string;
	sourceReference?: string;
}

interface PostData {
	body: string; // Markdown
	featuredImage?: string;
	category?: string;
}

interface LinkData {
	url: string;
	domain: string;
	favicon?: string;
	preview?: {
		title: string;
		description: string;
		image?: string;
	};
}

// Engagement statistics
interface ContentStats {
	views: number;
	likes: number;
	bookmarks: number;
	comments: number;
	shares: number;
	rating: {
		average: number; // 0-5 stars
		count: number;
	};
}
```

### 3. Comments & Interactions

```typescript
interface Comment {
	id: string;
	contentId: string; // What it's commenting on
	parentCommentId?: string; // For threaded replies

	author: {
		userId: string;
		username: string;
		displayName: string;
		avatar?: string;
		verificationStatus: VerificationStatus;
	};

	body: string; // Markdown supported
	createdAt: string;
	updatedAt?: string;

	// Engagement
	likes: number;
	isEdited: boolean;

	// Moderation
	isHidden: boolean;
	isDeleted: boolean;
	flagCount: number;

	// Threading
	replies: Comment[]; // Nested comments
	replyCount: number;
}

interface Rating {
	id: string;
	contentId: string;
	userId: string;
	rating: number; // 1-5 stars
	review?: string; // Optional text review
	createdAt: string;
	updatedAt?: string;

	// Helpful votes
	helpfulCount: number;
	notHelpfulCount: number;
}

interface UserAction {
	id: string;
	userId: string;
	contentId: string;
	actionType: "like" | "bookmark" | "flag" | "share";
	createdAt: string;
	metadata?: Record<string, any>; // For additional action data
}
```

### 4. Content Relationships

```typescript
interface ContentRelationship {
	id: string;
	fromContentId: string;
	toContentId: string;
	relationshipType: RelationshipType;
	description?: string;
	createdBy: string;
	createdAt: string;
}

type RelationshipType =
	| "attached_to" // Media attached to site
	| "references" // Text references another item
	| "depicts" // Image depicts a site/artifact
	| "discusses" // Post discusses a topic
	| "supplements" // Additional information
	| "contradicts" // Opposing view
	| "supports" // Supporting evidence
	| "part_of" // Belongs to collection
	| "related"; // General relationship
```

### 5. Content Collections

For organizing related content:

```typescript
interface ContentCollection {
	id: string;
	title: string;
	description: string;

	creator: {
		userId: string;
		username: string;
		displayName: string;
	};

	contentIds: string[];
	isPublic: boolean;
	isCollaborative: boolean; // Can others add to it?

	tags: string[];
	createdAt: string;
	updatedAt: string;

	// Stats
	followerCount: number;
	itemCount: number;
}
```

## Implementation Strategy

### Phase 1: Enhanced Type System & Store

1. Update `src/lib/types.ts` with new interfaces
2. Create content store (`src/state/content-store.ts`)
3. Create comment store (`src/state/comment-store.ts`)
4. Add sample data for all content types

### Phase 2: Content Detail Views

1. Create unified content detail page (`/content/[id]`)
2. Build content card components with proper type discrimination
3. Create comment thread component
4. Add rating/review component
5. Build relationship visualization

### Phase 3: Content Browsing & Discovery

1. Enhance media page with filtering, sorting, and relationships
2. Enhance texts page similarly
3. Create "orphaned content" views (content not linked to sites)
4. Add "content browser" with advanced filters

### Phase 4: Content Creation & Management

1. Multi-type upload flow
2. Batch upload for images
3. Link existing content to sites
4. Manage relationships
5. Content editing interface

### Phase 5: Social Features

1. Comment system with threading
2. Rating and review system
3. Like, bookmark, share functionality
4. User content dashboard

### Phase 6: Site Integration

1. Enhanced site detail panel showing linked content
2. Content gallery view within site
3. Quick add content to site
4. Content timeline (chronological view of additions)

## UI Patterns

### Content Card Component

```typescript
// Unified card that adapts to content type
<ContentCard
  content={item}
  variant="compact" | "detailed" | "list"
  showStats={true}
  showRelationships={true}
  actions={["like", "bookmark", "comment", "share"]}
/>
```

### Content Browser

- Grid/List toggle
- Advanced filtering sidebar
- Sort by: date, popularity, rating, relevance
- Filter by: type, verification, civilization, era, linked sites
- Search with autocomplete
- Bulk actions

### Site Detail Enhancement

Instead of sidebar tabs, use a more spacious layout:

- Main map remains primary
- Content panel can expand to full screen
- Tabbed interface for different content types
- "All Content" tab shows mixed feed
- Type-specific tabs (Images, Videos, Documents, Posts)
- Relationship graph visualization

### Content Detail Page

Full-screen experience:

- Hero image/video
- Metadata sidebar (submitter, dates, verification, tags)
- Description and body content
- Linked sites map (mini map showing locations)
- Related content carousel
- Comments section
- Rating summary and reviews
- Action bar (like, bookmark, share, flag)

## Database Schema Considerations

When moving to Supabase:

```sql
-- Main content table
CREATE TABLE content_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  submitted_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  verification_status TEXT,
  trust_tier TEXT,
  data JSONB, -- Flexible content-specific data
  tags TEXT[],
  civilization TEXT,
  era TEXT,
  geography JSONB
);

-- Site relationships (many-to-many)
CREATE TABLE content_site_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES content_items(id),
  site_id UUID REFERENCES sites(id),
  relationship_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Content relationships (many-to-many)
CREATE TABLE content_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_content_id UUID REFERENCES content_items(id),
  to_content_id UUID REFERENCES content_items(id),
  relationship_type TEXT,
  description TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES content_items(id),
  parent_comment_id UUID REFERENCES comments(id),
  author_id UUID REFERENCES users(id),
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  is_edited BOOLEAN DEFAULT FALSE,
  is_hidden BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  flag_count INTEGER DEFAULT 0
);

-- Ratings
CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES content_items(id),
  user_id UUID REFERENCES users(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  UNIQUE(content_id, user_id) -- One rating per user per content
);

-- User actions (likes, bookmarks, flags, shares)
CREATE TABLE user_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  content_id UUID REFERENCES content_items(id),
  action_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB,
  UNIQUE(user_id, content_id, action_type)
);

-- Materialized view for content stats (performance)
CREATE MATERIALIZED VIEW content_stats AS
SELECT
  c.id AS content_id,
  COUNT(DISTINCT CASE WHEN ua.action_type = 'like' THEN ua.user_id END) AS likes,
  COUNT(DISTINCT CASE WHEN ua.action_type = 'bookmark' THEN ua.user_id END) AS bookmarks,
  COUNT(DISTINCT CASE WHEN ua.action_type = 'share' THEN ua.user_id END) AS shares,
  COUNT(DISTINCT com.id) AS comments,
  AVG(r.rating) AS avg_rating,
  COUNT(DISTINCT r.id) AS rating_count
FROM content_items c
LEFT JOIN user_actions ua ON c.id = ua.content_id
LEFT JOIN comments com ON c.id = com.content_id AND NOT com.is_deleted
LEFT JOIN ratings r ON c.id = r.content_id
GROUP BY c.id;

-- Indexes for performance
CREATE INDEX idx_content_items_type ON content_items(type);
CREATE INDEX idx_content_items_submitted_by ON content_items(submitted_by);
CREATE INDEX idx_content_items_created_at ON content_items(created_at DESC);
CREATE INDEX idx_content_items_tags ON content_items USING GIN(tags);
CREATE INDEX idx_content_site_links_content ON content_site_links(content_id);
CREATE INDEX idx_content_site_links_site ON content_site_links(site_id);
CREATE INDEX idx_comments_content ON comments(content_id);
CREATE INDEX idx_comments_author ON comments(author_id);
CREATE INDEX idx_ratings_content ON ratings(content_id);
CREATE INDEX idx_user_actions_content ON user_actions(content_id);
CREATE INDEX idx_user_actions_user ON user_actions(user_id);
```

## Benefits

1. **Scalability**: Flexible schema handles any content type
2. **Relationships**: Clear linkage between all entities
3. **Social**: Rich commenting, rating, and engagement
4. **Discovery**: Multiple entry points (by type, by site, by user, by tag)
5. **Attribution**: Clear provenance and contribution tracking
6. **Moderation**: Built-in verification and trust tiers
7. **Performance**: Materialized views for stats, proper indexing
8. **Flexibility**: Easy to add new content types or relationships

## Next Steps

1. **Review & Refine**: Validate this architecture with your vision
2. **Prioritize**: Decide which phases to implement first
3. **Sample Data**: Create rich sample data for all content types
4. **Prototype**: Build key components to validate UX
5. **Iterate**: Adjust based on real usage patterns
