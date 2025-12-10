/**
 * Feed Item Types - Different types of content that can appear in feeds
 */

// Base activity type
export type ActivityType =
	| "site_update"        // Site info was updated
	| "new_media"          // New image/video/document added to site
	| "new_discussion"     // New discussion thread created
	| "discussion_reply"   // Hot discussion with new replies
	| "research_update"    // Research project updated
	| "expert_post"        // Post from verified/notable contributor
	| "event_announcement" // New event/tour announced
	| "connection_found"   // New site connection discovered
	| "milestone"          // Site reached engagement milestone
	| "trending";          // Content is trending

// Source type - who made the change
export type ActivitySourceType = "official" | "community" | "system";

// Specific change type for granular activity descriptions
// Ordered by priority/magnitude (higher = more important)
export type ChangeType =
	// Site changes (highest priority)
	| "new_site"              // 100 - Brand new site added
	| "site_verified"         // 90 - Site verified
	| "video_added"           // 85 - Videos are high value
	| "document_added"        // 75 - Research docs, external 3D scans
	| "photos_added"          // 70 - Photo uploads
	| "description_updated"   // 50 - Text updates
	| "coordinates_updated"   // 45 - Location corrections
	| "metadata_updated"      // 30 - Tags, categories
	// Engagement-driven
	| "trending"              // 80 - Content is trending
	| "milestone"             // 70 - Engagement milestone
	// Social
	| "post_created"          // 60 - New discussion
	| "research_published"    // 75 - Research paper
	| "event_announced"       // 65 - Events, tours
	| "connection_proposed";  // 70 - New connection theory

// Change magnitude values for ranking (higher = more important in feed)
export const CHANGE_MAGNITUDE: Record<ChangeType, number> = {
	new_site: 100,
	site_verified: 90,
	video_added: 85,
	trending: 80,
	document_added: 75,
	research_published: 75,
	photos_added: 70,
	milestone: 70,
	connection_proposed: 70,
	event_announced: 65,
	post_created: 60,
	description_updated: 50,
	coordinates_updated: 45,
	metadata_updated: 30,
};

// Human-readable labels for change types
export const CHANGE_LABELS: Record<ChangeType, string> = {
	new_site: "New site",
	site_verified: "Verified",
	video_added: "Video added",
	document_added: "Document added",
	photos_added: "Photos added",
	description_updated: "Description updated",
	coordinates_updated: "Location corrected",
	metadata_updated: "Details updated",
	trending: "Trending",
	milestone: "Milestone",
	post_created: "New discussion",
	research_published: "Research published",
	event_announced: "Event announced",
	connection_proposed: "Connection discovered",
};

// Get label with count support (e.g., "12 photos added")
export function getChangeLabel(changeType: ChangeType, count?: number): string {
	if (changeType === "photos_added" && count && count > 1) {
		return `${count} photos added`;
	}
	return CHANGE_LABELS[changeType] || "Updated";
}

// Content that can generate feed items
export interface FeedableContent {
	id: string;
	type: ActivityType;
	contentType: "site" | "media" | "discussion" | "research" | "event" | "connection" | "post";
	title: string;
	excerpt?: string;
	thumbnail?: string;
	
	// The actual content reference
	siteId?: string;
	mediaId?: string;
	discussionId?: string;
	researchId?: string;
	eventId?: string;
	connectionId?: string;
	
	// Source and change tracking (new)
	sourceType: ActivitySourceType;  // official, community, or system
	changeType?: ChangeType;         // Specific type of change
	changeMagnitude: number;         // 0-100, higher = more important
	mediaCount?: number;             // For "X photos added" style labels
	changeDetails?: {
		fieldsChanged?: string[];
		oldValues?: Record<string, unknown>;
		newValues?: Record<string, unknown>;
	};
	
	// Author/contributor info
	author: {
		id: string;
		name: string;
		username: string;
		avatar?: string;
		isVerified: boolean;
		isExpert: boolean;          // Verified researcher/archaeologist
		isNotable: boolean;         // YouTuber, author, public figure
		followerCount: number;
		badges: string[];
	};
	
	// Engagement metrics
	engagement: {
		upvotes: number;
		comments: number;
		shares: number;
		bookmarks: number;
		views: number;
	};
	
	// Time-based metrics for trending calculation
	timestamps: {
		createdAt: Date;
		updatedAt: Date;
		lastActivityAt: Date;       // Most recent interaction
	};
	
	// For engagement velocity calculation
	recentEngagement: {
		upvotesLast24h: number;
		commentsLast24h: number;
		viewsLast24h: number;
	};
	
	// Categorization
	tags: string[];
	civilization?: string;
	region?: string;
	era?: string;
	
	// Related content
	relatedSites: string[];
	mentionedUsers: string[];
}

// Media-specific feed item (new photos, videos, documents)
export interface MediaFeedItem extends FeedableContent {
	contentType: "media";
	mediaType: "image" | "video" | "youtube" | "document" | "text";
	mediaUrl: string;
	mediaThumbnail: string;
	duration?: string;           // For videos
	pageCount?: number;          // For documents
	parentSite: {
		id: string;
		name: string;
	};
}

// Event feed item
export interface EventFeedItem extends FeedableContent {
	contentType: "event";
	eventType: "tour" | "lecture" | "expedition" | "conference" | "meetup";
	eventDate: Date;
	location?: string;
	isOnline: boolean;
	attendeeCount: number;
	maxAttendees?: number;
}

// User preferences for personalization
export interface UserFeedPreferences {
	userId: string;
	
	// Following
	followedSites: string[];
	followedUsers: string[];
	followedTags: string[];
	followedRegions: string[];
	followedCivilizations: string[];
	
	// Bookmarks for activity tracking
	bookmarkedSites: string[];
	bookmarkedContent: string[];
	
	// Muted/hidden
	mutedUsers: string[];
	mutedTags: string[];
	hiddenContent: string[];
	
	// Engagement history for algorithm learning
	recentViews: { contentId: string; timestamp: Date }[];
	recentUpvotes: { contentId: string; timestamp: Date }[];
	recentComments: { contentId: string; timestamp: Date }[];
}

// Feed response with pagination
export interface FeedResponse {
	items: FeedableContent[];
	nextCursor?: string;
	hasMore: boolean;
	totalCount: number;
}

// Feed filter options
export interface FeedFilters {
	contentTypes?: FeedableContent["contentType"][];
	activityTypes?: ActivityType[];
	regions?: string[];
	civilizations?: string[];
	tags?: string[];
	timeRange?: "1h" | "24h" | "7d" | "30d" | "all";
	authorTypes?: ("verified" | "expert" | "notable" | "community")[];
	// Source filtering (new)
	sourceType?: ActivitySourceType | "all";   // Filter by official/community
	changeTypes?: ChangeType[];                 // Filter by specific change types
	minMagnitude?: number;                      // Minimum change magnitude (0-100)
}

// Sort options for feeds
export type FeedSortOption =
	| "trending"           // Engagement velocity (recent activity / time)
	| "hot"                // High engagement in last 24h
	| "new"                // Most recently created
	| "top"                // Highest total engagement
	| "discussed"          // Most comments
	| "rising"             // Fast-growing engagement
	| "smart";             // Smart ranking: magnitude + official first + engagement

