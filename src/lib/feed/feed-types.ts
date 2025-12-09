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
}

// Sort options for feeds
export type FeedSortOption =
	| "trending"           // Engagement velocity (recent activity / time)
	| "hot"                // High engagement in last 24h
	| "new"                // Most recently created
	| "top"                // Highest total engagement
	| "discussed"          // Most comments
	| "rising";            // Fast-growing engagement

