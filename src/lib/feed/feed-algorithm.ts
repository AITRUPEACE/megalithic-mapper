/**
 * Feed Algorithm - Scoring and ranking functions for feed items
 * 
 * Inspired by Reddit's hot ranking, Hacker News, and daily.dev algorithms
 * 
 * PRIORITIZATION RULES:
 * 1. Official sources > Community (but community can rise with engagement)
 * 2. New sites have highest priority
 * 3. Videos > Photos > Description updates
 * 4. High engagement can boost any content
 * 5. Community updates don't "bump" sites to top without engagement
 */

import type {
	FeedableContent,
	FeedFilters,
	FeedSortOption,
	UserFeedPreferences,
	ActivityType,
	ActivitySourceType,
	ChangeType,
} from "./feed-types";
import { CHANGE_MAGNITUDE } from "./feed-types";

// ============================================
// SCORING CONSTANTS
// ============================================

const SCORE_WEIGHTS = {
	// Engagement weights
	upvote: 1,
	comment: 2,        // Comments indicate deeper engagement
	share: 3,          // Shares are high-value actions
	bookmark: 1.5,     // Bookmarks show intent to return
	view: 0.01,        // Views have low weight to avoid clickbait
	
	// Author reputation multipliers
	verifiedAuthor: 1.3,
	expertAuthor: 1.5,
	notableAuthor: 1.8,   // YouTubers, authors get visibility boost
	
	// Content type boosts
	newMedia: 1.4,        // New media is highly engaging
	expertPost: 1.6,      // Expert content is valuable
	eventAnnouncement: 1.3,
	connectionFound: 1.5, // New discoveries are exciting
	
	// Freshness decay (hours)
	halfLife: 12,         // Score halves every 12 hours
	
	// Personalization
	followedSite: 2.0,
	followedUser: 1.8,
	followedTag: 1.3,
	bookmarkedSite: 1.5,
	
	// Source type multipliers (new)
	officialSource: 1.5,  // Official updates get visibility boost
	communitySource: 1.0, // Community needs engagement to rise
	
	// Magnitude threshold for community content visibility
	communityMinMagnitude: 40, // Below this, community content needs engagement
	communityEngagementThreshold: 5, // Engagement needed for low-magnitude community content
};

// Activity type priority for "What's New" style feeds
const ACTIVITY_PRIORITY: Record<ActivityType, number> = {
	expert_post: 100,
	new_media: 90,
	event_announcement: 85,
	connection_found: 80,
	research_update: 75,
	milestone: 70,
	trending: 65,
	site_update: 60,
	new_discussion: 55,
	discussion_reply: 50,
};

// ============================================
// CORE SCORING FUNCTIONS
// ============================================

/**
 * Calculate base engagement score
 */
export function calculateEngagementScore(content: FeedableContent): number {
	const { upvotes, comments, shares, bookmarks, views } = content.engagement;
	
	return (
		upvotes * SCORE_WEIGHTS.upvote +
		comments * SCORE_WEIGHTS.comment +
		shares * SCORE_WEIGHTS.share +
		bookmarks * SCORE_WEIGHTS.bookmark +
		views * SCORE_WEIGHTS.view
	);
}

/**
 * Calculate engagement velocity (recent activity)
 * Higher velocity = content is gaining traction quickly
 */
export function calculateVelocity(content: FeedableContent): number {
	const { upvotesLast24h, commentsLast24h, viewsLast24h } = content.recentEngagement;
	
	const recentScore =
		upvotesLast24h * SCORE_WEIGHTS.upvote +
		commentsLast24h * SCORE_WEIGHTS.comment +
		viewsLast24h * SCORE_WEIGHTS.view;
	
	// Calculate hours since last activity
	const hoursSinceActivity =
		(Date.now() - content.timestamps.lastActivityAt.getTime()) / (1000 * 60 * 60);
	
	// Velocity = recent engagement / time, with minimum of 1 hour
	return recentScore / Math.max(hoursSinceActivity, 1);
}

/**
 * Time decay function (similar to Hacker News)
 * Score decays over time to keep feed fresh
 */
export function calculateTimeDecay(content: FeedableContent): number {
	const hoursAge =
		(Date.now() - content.timestamps.createdAt.getTime()) / (1000 * 60 * 60);
	
	// Exponential decay with half-life
	return Math.pow(0.5, hoursAge / SCORE_WEIGHTS.halfLife);
}

/**
 * Author reputation multiplier
 */
export function calculateAuthorMultiplier(content: FeedableContent): number {
	let multiplier = 1;
	
	if (content.author.isVerified) {
		multiplier *= SCORE_WEIGHTS.verifiedAuthor;
	}
	if (content.author.isExpert) {
		multiplier *= SCORE_WEIGHTS.expertAuthor;
	}
	if (content.author.isNotable) {
		multiplier *= SCORE_WEIGHTS.notableAuthor;
	}
	
	// Small boost based on follower count (logarithmic)
	const followerBoost = 1 + Math.log10(Math.max(content.author.followerCount, 1)) * 0.05;
	multiplier *= followerBoost;
	
	return multiplier;
}

/**
 * Content type boost based on activity type
 */
export function calculateContentTypeBoost(content: FeedableContent): number {
	switch (content.type) {
		case "new_media":
			return SCORE_WEIGHTS.newMedia;
		case "expert_post":
			return SCORE_WEIGHTS.expertPost;
		case "event_announcement":
			return SCORE_WEIGHTS.eventAnnouncement;
		case "connection_found":
			return SCORE_WEIGHTS.connectionFound;
		default:
			return 1;
	}
}

/**
 * Calculate source type multiplier
 * Official sources get a boost, community needs engagement
 */
export function calculateSourceMultiplier(content: FeedableContent): number {
	if (content.sourceType === "official") {
		return SCORE_WEIGHTS.officialSource;
	}
	
	// Community content with low magnitude needs engagement to be visible
	if (content.sourceType === "community") {
		const magnitude = content.changeMagnitude || 50;
		const engagement = calculateEngagementScore(content);
		
		// Low magnitude community content gets penalized unless it has engagement
		if (magnitude < SCORE_WEIGHTS.communityMinMagnitude) {
			if (engagement < SCORE_WEIGHTS.communityEngagementThreshold) {
				return 0.3; // Significantly reduce visibility
			}
		}
		return SCORE_WEIGHTS.communitySource;
	}
	
	return 1;
}

/**
 * Calculate change magnitude boost
 * Higher magnitude changes (new site, video) get priority over lower (description update)
 */
export function calculateMagnitudeBoost(content: FeedableContent): number {
	// Use explicit changeMagnitude if available
	if (content.changeMagnitude !== undefined) {
		return content.changeMagnitude / 50; // Normalize to roughly 0-2 range
	}
	
	// Fall back to changeType lookup
	if (content.changeType && CHANGE_MAGNITUDE[content.changeType]) {
		return CHANGE_MAGNITUDE[content.changeType] / 50;
	}
	
	// Default based on activity type
	switch (content.type) {
		case "new_media":
			return 1.4;
		case "site_update":
			return 1.0;
		default:
			return 1.0;
	}
}

/**
 * Personalization score based on user preferences
 */
export function calculatePersonalizationScore(
	content: FeedableContent,
	preferences: UserFeedPreferences
): number {
	let score = 1;
	
	// Check if user follows the site
	if (content.siteId && preferences.followedSites.includes(content.siteId)) {
		score *= SCORE_WEIGHTS.followedSite;
	}
	
	// Check if user follows the author
	if (preferences.followedUsers.includes(content.author.id)) {
		score *= SCORE_WEIGHTS.followedUser;
	}
	
	// Check tag overlap
	const tagOverlap = content.tags.filter((tag) =>
		preferences.followedTags.includes(tag)
	).length;
	score *= 1 + tagOverlap * 0.1; // 10% boost per matching tag
	
	// Boost for bookmarked sites
	if (content.siteId && preferences.bookmarkedSites.includes(content.siteId)) {
		score *= SCORE_WEIGHTS.bookmarkedSite;
	}
	
	// Penalize muted users (but don't completely hide)
	if (preferences.mutedUsers.includes(content.author.id)) {
		score *= 0.1;
	}
	
	return score;
}

// ============================================
// FEED SCORING ALGORITHMS
// ============================================

/**
 * HOT Score - Trending content with time decay
 * Best for: Explore feed default, discovering what's popular now
 * 
 * Updated to factor in:
 * - Source type (official vs community)
 * - Change magnitude (new site > video > photo > description)
 */
export function calculateHotScore(
	content: FeedableContent,
	preferences?: UserFeedPreferences
): number {
	const engagement = calculateEngagementScore(content);
	const velocity = calculateVelocity(content);
	const timeDecay = calculateTimeDecay(content);
	const authorMultiplier = calculateAuthorMultiplier(content);
	const contentBoost = calculateContentTypeBoost(content);
	const sourceMultiplier = calculateSourceMultiplier(content);
	const magnitudeBoost = calculateMagnitudeBoost(content);
	
	let score = (engagement * 0.3 + velocity * 0.7) 
		* timeDecay 
		* authorMultiplier 
		* contentBoost
		* sourceMultiplier
		* magnitudeBoost;
	
	// Apply personalization if preferences provided
	if (preferences) {
		score *= calculatePersonalizationScore(content, preferences);
	}
	
	return score;
}

/**
 * RISING Score - Content gaining traction quickly
 * Best for: Finding emerging popular content
 */
export function calculateRisingScore(content: FeedableContent): number {
	const velocity = calculateVelocity(content);
	const engagement = calculateEngagementScore(content);
	
	// Rising favors velocity over total engagement
	// But requires minimum engagement to avoid gaming
	const minEngagement = Math.max(engagement, 10);
	
	return velocity * Math.log10(minEngagement);
}

/**
 * MY FEED Score - Personalized feed for followed content
 * Best for: User's home feed with content they care about
 */
export function calculateMyFeedScore(
	content: FeedableContent,
	preferences: UserFeedPreferences
): number {
	const personalization = calculatePersonalizationScore(content, preferences);
	const freshness = calculateTimeDecay(content);
	const activityPriority = ACTIVITY_PRIORITY[content.type] / 100;
	const authorMultiplier = calculateAuthorMultiplier(content);
	
	// My Feed prioritizes:
	// 1. Content from followed users/sites (personalization)
	// 2. Recent content (freshness)
	// 3. High-value activity types (new media, expert posts)
	// 4. Notable authors
	
	return personalization * freshness * activityPriority * authorMultiplier;
}

/**
 * CHRONOLOGICAL Score - Pure time-based sorting
 * Best for: "Latest" tab
 */
export function calculateChronologicalScore(content: FeedableContent): number {
	return content.timestamps.createdAt.getTime();
}

/**
 * TOP Score - Highest total engagement
 * Best for: "All time best" or "This week's top"
 */
export function calculateTopScore(content: FeedableContent): number {
	return calculateEngagementScore(content) * calculateAuthorMultiplier(content);
}

/**
 * SMART Score - Prioritizes by magnitude, official status, and engagement
 * Best for: Default feed that surfaces important changes first
 * 
 * Priority order:
 * 1. Official sources with high magnitude (new verified sites, official updates)
 * 2. High-magnitude community content (new sites, videos)
 * 3. Lower-magnitude content with high engagement
 * 4. Recent content
 * 
 * Community updates to sites don't bump them to top without engagement
 */
export function calculateSmartScore(
	content: FeedableContent,
	preferences?: UserFeedPreferences
): number {
	const magnitude = content.changeMagnitude || 50;
	const engagement = calculateEngagementScore(content);
	const freshness = calculateTimeDecay(content);
	
	// Base score from magnitude (0-100)
	let score = magnitude;
	
	// Official sources get a significant boost
	if (content.sourceType === "official") {
		score += 30;
	}
	
	// Engagement adds to score (capped to avoid gaming)
	const engagementBoost = Math.min(engagement * 0.5, 40);
	score += engagementBoost;
	
	// Freshness multiplier (newer content gets boost)
	score *= (0.5 + freshness * 0.5); // Range: 0.5-1.0
	
	// Community low-magnitude updates (like description changes) get penalized
	// unless they have significant engagement
	if (content.sourceType === "community" && magnitude < 50 && engagement < 10) {
		score *= 0.3; // Significant penalty
	}
	
	// Personalization boost
	if (preferences) {
		score *= calculatePersonalizationScore(content, preferences);
	}
	
	return score;
}

// ============================================
// FEED GENERATION FUNCTIONS
// ============================================

/**
 * Sort and filter feed items
 */
export function generateFeed(
	items: FeedableContent[],
	sortOption: FeedSortOption,
	filters: FeedFilters,
	preferences?: UserFeedPreferences
): FeedableContent[] {
	// Apply filters
	let filtered = filterFeedItems(items, filters, preferences);
	
	// Apply sorting
	filtered = sortFeedItems(filtered, sortOption, preferences);
	
	// Apply diversity (avoid too many items from same author/site)
	filtered = applyDiversity(filtered);
	
	return filtered;
}

/**
 * Filter feed items based on criteria
 */
export function filterFeedItems(
	items: FeedableContent[],
	filters: FeedFilters,
	preferences?: UserFeedPreferences
): FeedableContent[] {
	return items.filter((item) => {
		// Filter by content type
		if (filters.contentTypes?.length && !filters.contentTypes.includes(item.contentType)) {
			return false;
		}
		
		// Filter by activity type
		if (filters.activityTypes?.length && !filters.activityTypes.includes(item.type)) {
			return false;
		}
		
		// Filter by source type (official/community)
		if (filters.sourceType && filters.sourceType !== "all") {
			if (item.sourceType !== filters.sourceType) {
				return false;
			}
		}
		
		// Filter by change types
		if (filters.changeTypes?.length && item.changeType) {
			if (!filters.changeTypes.includes(item.changeType)) {
				return false;
			}
		}
		
		// Filter by minimum magnitude
		if (filters.minMagnitude !== undefined) {
			const magnitude = item.changeMagnitude || 50;
			if (magnitude < filters.minMagnitude) {
				// Allow low-magnitude items if they have significant engagement
				const engagement = calculateEngagementScore(item);
				if (engagement < SCORE_WEIGHTS.communityEngagementThreshold) {
					return false;
				}
			}
		}
		
		// Filter by region
		if (filters.regions?.length && item.region && !filters.regions.includes(item.region)) {
			return false;
		}
		
		// Filter by time range
		if (filters.timeRange && filters.timeRange !== "all") {
			const maxAge = getMaxAgeForTimeRange(filters.timeRange);
			const itemAge = Date.now() - item.timestamps.createdAt.getTime();
			if (itemAge > maxAge) {
				return false;
			}
		}
		
		// Filter by author type
		if (filters.authorTypes?.length) {
			const authorMatches = filters.authorTypes.some((type) => {
				switch (type) {
					case "verified":
						return item.author.isVerified;
					case "expert":
						return item.author.isExpert;
					case "notable":
						return item.author.isNotable;
					case "community":
						return !item.author.isVerified && !item.author.isExpert;
					default:
						return true;
				}
			});
			if (!authorMatches) return false;
		}
		
		// Hide muted/hidden content
		if (preferences) {
			if (preferences.mutedUsers.includes(item.author.id)) {
				return false;
			}
			if (preferences.hiddenContent.includes(item.id)) {
				return false;
			}
		}
		
		return true;
	});
}

/**
 * Sort feed items by score
 */
export function sortFeedItems(
	items: FeedableContent[],
	sortOption: FeedSortOption,
	preferences?: UserFeedPreferences
): FeedableContent[] {
	return [...items].sort((a, b) => {
		let scoreA: number, scoreB: number;
		
		switch (sortOption) {
			case "smart":
				scoreA = calculateSmartScore(a, preferences);
				scoreB = calculateSmartScore(b, preferences);
				break;
			case "trending":
			case "hot":
				scoreA = calculateHotScore(a, preferences);
				scoreB = calculateHotScore(b, preferences);
				break;
			case "rising":
				scoreA = calculateRisingScore(a);
				scoreB = calculateRisingScore(b);
				break;
			case "new":
				scoreA = calculateChronologicalScore(a);
				scoreB = calculateChronologicalScore(b);
				break;
			case "top":
				scoreA = calculateTopScore(a);
				scoreB = calculateTopScore(b);
				break;
			case "discussed":
				scoreA = a.engagement.comments;
				scoreB = b.engagement.comments;
				break;
			default:
				// Default to smart sort
				scoreA = calculateSmartScore(a, preferences);
				scoreB = calculateSmartScore(b, preferences);
		}
		
		return scoreB - scoreA;
	});
}

/**
 * Apply diversity to avoid feed dominated by single author/site
 */
export function applyDiversity(items: FeedableContent[]): FeedableContent[] {
	const result: FeedableContent[] = [];
	const authorCounts = new Map<string, number>();
	const siteCounts = new Map<string, number>();
	
	const MAX_PER_AUTHOR = 3;
	const MAX_PER_SITE = 4;
	
	for (const item of items) {
		const authorCount = authorCounts.get(item.author.id) || 0;
		const siteCount = item.siteId ? siteCounts.get(item.siteId) || 0 : 0;
		
		// Allow item if under limits
		if (authorCount < MAX_PER_AUTHOR && (!item.siteId || siteCount < MAX_PER_SITE)) {
			result.push(item);
			authorCounts.set(item.author.id, authorCount + 1);
			if (item.siteId) {
				siteCounts.set(item.siteId, siteCount + 1);
			}
		}
	}
	
	return result;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getMaxAgeForTimeRange(range: FeedFilters["timeRange"]): number {
	const hour = 60 * 60 * 1000;
	const day = 24 * hour;
	
	switch (range) {
		case "1h":
			return hour;
		case "24h":
			return day;
		case "7d":
			return 7 * day;
		case "30d":
			return 30 * day;
		default:
			return Infinity;
	}
}

/**
 * Generate activity description for feed item
 * Uses changeType for more specific labels when available
 */
export function getActivityDescription(item: FeedableContent): string {
	// Use changeType if available for more specific descriptions
	if (item.changeType) {
		switch (item.changeType) {
			case "new_site":
				return "added a new site";
			case "site_verified":
				return item.sourceType === "official" ? "officially verified" : "community verified";
			case "video_added":
				return "added a video";
		case "photos_added":
			return item.mediaCount && item.mediaCount > 1 
				? `added ${item.mediaCount} photos` 
				: "added photos";
		case "document_added":
			return "added a document";
			case "description_updated":
				return "updated description";
			case "coordinates_updated":
				return "corrected location";
			case "metadata_updated":
				return "updated details";
			case "trending":
				return "is trending";
			case "milestone":
				return "reached a milestone";
			case "post_created":
				return "started a discussion";
			case "research_published":
				return "published research";
			case "event_announced":
				return "announced an event";
			case "connection_proposed":
				return "discovered a connection";
		}
	}
	
	// Fall back to activity type
	switch (item.type) {
		case "new_media":
			return "added new media";
		case "site_update":
			return "updated site information";
		case "new_discussion":
			return "started a discussion";
		case "discussion_reply":
			return "replied to a discussion";
		case "research_update":
			return "updated their research";
		case "expert_post":
			return "shared insights";
		case "event_announcement":
			return "announced an event";
		case "connection_found":
			return "discovered a connection";
		case "milestone":
			return "reached a milestone";
		case "trending":
			return "is trending";
		default:
			return "shared content";
	}
}

// Export score weights for use in filter function
export { SCORE_WEIGHTS };

