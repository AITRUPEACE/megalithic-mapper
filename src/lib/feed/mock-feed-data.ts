/**
 * Mock Feed Data - Demonstrates the different types of feed content
 */

import type {
	FeedableContent,
	MediaFeedItem,
	EventFeedItem,
	UserFeedPreferences,
	ActivityType,
} from "./feed-types";

// ============================================
// MOCK NOTABLE CONTRIBUTORS
// ============================================

export const mockContributors = {
	grahamHancock: {
		id: "user-graham-hancock",
		name: "Graham Hancock",
		username: "graham_hancock",
		avatar: "/avatars/graham.jpg",
		isVerified: true,
		isExpert: false,
		isNotable: true, // Famous author/YouTuber
		followerCount: 125000,
		badges: ["Author", "Documentary Maker", "Top Contributor"],
	},
	drHawass: {
		id: "user-dr-hawass",
		name: "Dr. Zahi Hawass",
		username: "zahi_hawass",
		avatar: "/avatars/hawass.jpg",
		isVerified: true,
		isExpert: true,
		isNotable: true,
		followerCount: 89000,
		badges: ["Egyptologist", "Verified Expert", "PhD"],
	},
	benUnchartedX: {
		id: "user-ben-unchartedx",
		name: "Ben from UnchartedX",
		username: "unchartedx",
		avatar: "/avatars/ben.jpg",
		isVerified: true,
		isExpert: false,
		isNotable: true, // YouTuber
		followerCount: 450000,
		badges: ["YouTuber", "Filmmaker", "Explorer"],
	},
	drSchoch: {
		id: "user-dr-schoch",
		name: "Dr. Robert Schoch",
		username: "robert_schoch",
		avatar: "/avatars/schoch.jpg",
		isVerified: true,
		isExpert: true,
		isNotable: true,
		followerCount: 32000,
		badges: ["Geologist", "Boston University", "Sphinx Expert"],
	},
	communityMember: {
		id: "user-alex-rivera",
		name: "Alex Rivera",
		username: "alex_rivera",
		avatar: "/avatars/alex.jpg",
		isVerified: false,
		isExpert: false,
		isNotable: false,
		followerCount: 245,
		badges: ["Active Contributor"],
	},
	fieldResearcher: {
		id: "user-maria-santos",
		name: "Maria Santos",
		username: "maria_santos",
		avatar: "/avatars/maria.jpg",
		isVerified: true,
		isExpert: true,
		isNotable: false,
		followerCount: 1200,
		badges: ["Field Researcher", "Archaeologist"],
	},
};

// ============================================
// MOCK FEED ITEMS
// ============================================

const now = new Date();
const hoursAgo = (hours: number) => new Date(now.getTime() - hours * 60 * 60 * 1000);
const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

export const mockFeedItems: FeedableContent[] = [
	// 1. NEW MEDIA - YouTube video from notable contributor
	{
		id: "feed-1-youtube-unchartedx",
		type: "new_media",
		contentType: "media",
		title: "NEW: Precision Engineering at Sacsayhuaman - Evidence Analysis",
		excerpt: "In this video, I examine the incredible polygonal masonry at Sacsayhuaman and present new photogrammetry data showing tolerances of less than 0.5mm between stones.",
		thumbnail: "/thumbnails/unchartedx-sacsay.jpg",
		siteId: "cusco-sacsayhuaman",
		mediaId: "media-unchartedx-001",
		author: mockContributors.benUnchartedX,
		engagement: {
			upvotes: 2847,
			comments: 342,
			shares: 156,
			bookmarks: 891,
			views: 45230,
		},
		timestamps: {
			createdAt: hoursAgo(3),
			updatedAt: hoursAgo(2),
			lastActivityAt: hoursAgo(0.5),
		},
		recentEngagement: {
			upvotesLast24h: 2100,
			commentsLast24h: 280,
			viewsLast24h: 38000,
		},
		tags: ["polygonal-masonry", "sacsayhuaman", "precision", "photogrammetry"],
		civilization: "Inca",
		region: "South America",
		era: "Pre-Columbian",
		relatedSites: ["cusco-sacsayhuaman", "andes-machu"],
		mentionedUsers: [],
	} as FeedableContent,

	// 2. EXPERT POST - Dr. Schoch analysis
	{
		id: "feed-2-expert-schoch",
		type: "expert_post",
		contentType: "post",
		title: "Water Erosion Patterns on the Sphinx Enclosure: 2024 Update",
		excerpt: "After reviewing the latest geological surveys, I've updated my analysis of the vertical water erosion patterns. The data continues to support precipitation weathering inconsistent with 4,500 years...",
		thumbnail: "/thumbnails/sphinx-erosion.jpg",
		siteId: "giza-sphinx",
		author: mockContributors.drSchoch,
		engagement: {
			upvotes: 1923,
			comments: 487,
			shares: 234,
			bookmarks: 1102,
			views: 28900,
		},
		timestamps: {
			createdAt: hoursAgo(8),
			updatedAt: hoursAgo(6),
			lastActivityAt: hoursAgo(1),
		},
		recentEngagement: {
			upvotesLast24h: 1650,
			commentsLast24h: 398,
			viewsLast24h: 22000,
		},
		tags: ["sphinx", "water-erosion", "geology", "dating"],
		civilization: "Ancient Egyptian",
		region: "Africa",
		era: "Old Kingdom",
		relatedSites: ["giza-sphinx", "giza-gp"],
		mentionedUsers: [],
	},

	// 3. NEW MEDIA - Photos added to site
	{
		id: "feed-3-new-photos-gobekli",
		type: "new_media",
		contentType: "media",
		title: "12 New High-Resolution Photos: Göbekli Tepe Pillar 43",
		excerpt: "Uploaded detailed macro photography of the vulture and scorpion carvings on Pillar 43. These images reveal previously undocumented details in the relief work.",
		thumbnail: "/thumbnails/pillar43-vulture.jpg",
		siteId: "anatolia-gobekli",
		mediaId: "media-gobekli-photos-001",
		author: mockContributors.fieldResearcher,
		engagement: {
			upvotes: 892,
			comments: 156,
			shares: 67,
			bookmarks: 445,
			views: 8900,
		},
		timestamps: {
			createdAt: hoursAgo(5),
			updatedAt: hoursAgo(4),
			lastActivityAt: hoursAgo(1.5),
		},
		recentEngagement: {
			upvotesLast24h: 820,
			commentsLast24h: 142,
			viewsLast24h: 7800,
		},
		tags: ["gobekli-tepe", "pillar-43", "photography", "carvings"],
		civilization: "Anatolian",
		region: "Asia",
		era: "Pre-Pottery Neolithic",
		relatedSites: ["anatolia-gobekli"],
		mentionedUsers: [],
	},

	// 4. EVENT ANNOUNCEMENT - Tour
	{
		id: "feed-4-event-hancock-tour",
		type: "event_announcement",
		contentType: "event",
		title: "Egypt Tour 2025: Exploring Ancient Mysteries with Graham Hancock",
		excerpt: "Join me for an exclusive 12-day journey through Egypt, including private access to the Great Pyramid chambers and the Sphinx enclosure at sunrise.",
		thumbnail: "/thumbnails/hancock-tour.jpg",
		author: mockContributors.grahamHancock,
		engagement: {
			upvotes: 3456,
			comments: 892,
			shares: 567,
			bookmarks: 2340,
			views: 67800,
		},
		timestamps: {
			createdAt: hoursAgo(18),
			updatedAt: hoursAgo(12),
			lastActivityAt: hoursAgo(2),
		},
		recentEngagement: {
			upvotesLast24h: 2100,
			commentsLast24h: 456,
			viewsLast24h: 34000,
		},
		tags: ["tour", "egypt", "giza", "pyramid", "event"],
		civilization: "Ancient Egyptian",
		region: "Africa",
		relatedSites: ["giza-gp", "giza-sphinx"],
		mentionedUsers: [],
	},

	// 5. CONNECTION FOUND - New research
	{
		id: "feed-5-connection-acoustics",
		type: "connection_found",
		contentType: "connection",
		title: "Acoustic Resonance Match: King's Chamber ↔ Sacsayhuaman Polygonal Walls",
		excerpt: "Our team has measured identical resonant frequencies (110Hz) in both the King's Chamber and specific sections of the Sacsayhuaman walls. This suggests potential shared acoustic engineering principles.",
		thumbnail: "/thumbnails/acoustic-connection.jpg",
		connectionId: "conn-acoustics-001",
		author: mockContributors.fieldResearcher,
		engagement: {
			upvotes: 2156,
			comments: 567,
			shares: 234,
			bookmarks: 1890,
			views: 23400,
		},
		timestamps: {
			createdAt: daysAgo(1),
			updatedAt: hoursAgo(6),
			lastActivityAt: hoursAgo(3),
		},
		recentEngagement: {
			upvotesLast24h: 1200,
			commentsLast24h: 234,
			viewsLast24h: 12000,
		},
		tags: ["acoustics", "resonance", "connection", "cross-cultural"],
		relatedSites: ["giza-gp", "cusco-sacsayhuaman"],
		mentionedUsers: [],
	},

	// 6. SITE UPDATE - Community contribution
	{
		id: "feed-6-site-update-bimini",
		type: "site_update",
		contentType: "site",
		title: "Bimini Road Survey: New Underwater Mapping Data Added",
		excerpt: "Updated the site profile with new sonar mapping data and underwater photography from our December dive expedition. 47 new data points added.",
		thumbnail: "/thumbnails/bimini-sonar.jpg",
		siteId: "community-bimini",
		author: mockContributors.communityMember,
		engagement: {
			upvotes: 234,
			comments: 67,
			shares: 23,
			bookmarks: 156,
			views: 3400,
		},
		timestamps: {
			createdAt: hoursAgo(12),
			updatedAt: hoursAgo(10),
			lastActivityAt: hoursAgo(4),
		},
		recentEngagement: {
			upvotesLast24h: 189,
			commentsLast24h: 45,
			viewsLast24h: 2800,
		},
		tags: ["bimini", "underwater", "sonar", "mapping"],
		region: "North America",
		relatedSites: ["community-bimini"],
		mentionedUsers: [],
	},

	// 7. DISCUSSION - Hot thread
	{
		id: "feed-7-discussion-dating",
		type: "discussion_reply",
		contentType: "discussion",
		title: "The Sphinx Dating Debate: Geological vs Archaeological Evidence",
		excerpt: "This thread has become the most active discussion this week with researchers and community members debating the conflicting evidence for Sphinx dating.",
		thumbnail: "/thumbnails/sphinx-debate.jpg",
		discussionId: "thread-sphinx-dating",
		author: mockContributors.communityMember,
		engagement: {
			upvotes: 567,
			comments: 456,
			shares: 89,
			bookmarks: 234,
			views: 12300,
		},
		timestamps: {
			createdAt: daysAgo(3),
			updatedAt: hoursAgo(1),
			lastActivityAt: hoursAgo(0.5),
		},
		recentEngagement: {
			upvotesLast24h: 234,
			commentsLast24h: 178,
			viewsLast24h: 5600,
		},
		tags: ["sphinx", "dating", "debate", "geology", "archaeology"],
		civilization: "Ancient Egyptian",
		region: "Africa",
		relatedSites: ["giza-sphinx"],
		mentionedUsers: [mockContributors.drSchoch.id, mockContributors.drHawass.id],
	},

	// 8. RESEARCH UPDATE
	{
		id: "feed-8-research-harappan",
		type: "research_update",
		contentType: "research",
		title: "Harappan Hydraulic Systems: Phase 2 Field Report Published",
		excerpt: "Our team has completed the second phase of mapping Dholavira's water management infrastructure. New findings suggest a sophisticated understanding of hydrology.",
		thumbnail: "/thumbnails/dholavira-reservoir.jpg",
		researchId: "research-harappan-hydro",
		siteId: "indus-dholavira",
		author: mockContributors.fieldResearcher,
		engagement: {
			upvotes: 456,
			comments: 123,
			shares: 56,
			bookmarks: 345,
			views: 5600,
		},
		timestamps: {
			createdAt: daysAgo(2),
			updatedAt: hoursAgo(18),
			lastActivityAt: hoursAgo(8),
		},
		recentEngagement: {
			upvotesLast24h: 156,
			commentsLast24h: 34,
			viewsLast24h: 2100,
		},
		tags: ["harappan", "hydraulics", "research", "dholavira"],
		civilization: "Indus Valley",
		region: "Asia",
		era: "Bronze Age",
		relatedSites: ["indus-dholavira"],
		mentionedUsers: [],
	},

	// 9. NEW MEDIA - Document/Text upload
	{
		id: "feed-9-new-text-translation",
		type: "new_media",
		contentType: "media",
		title: "New Translation: Pyramid Texts Utterance 273-274 (Cannibal Hymn)",
		excerpt: "Completed a new annotated translation of the controversial 'Cannibal Hymn' with comparative analysis to Mesopotamian texts. Includes original hieroglyphic transcription.",
		thumbnail: "/thumbnails/pyramid-texts.jpg",
		mediaId: "media-translation-001",
		author: mockContributors.drHawass,
		engagement: {
			upvotes: 1234,
			comments: 234,
			shares: 178,
			bookmarks: 890,
			views: 15600,
		},
		timestamps: {
			createdAt: hoursAgo(36),
			updatedAt: hoursAgo(24),
			lastActivityAt: hoursAgo(6),
		},
		recentEngagement: {
			upvotesLast24h: 456,
			commentsLast24h: 89,
			viewsLast24h: 6700,
		},
		tags: ["pyramid-texts", "translation", "hieroglyphics", "texts"],
		civilization: "Ancient Egyptian",
		region: "Africa",
		era: "Old Kingdom",
		relatedSites: ["giza-gp"],
		mentionedUsers: [],
	},

	// 10. MILESTONE - Site trending
	{
		id: "feed-10-milestone-gobekli",
		type: "milestone",
		contentType: "site",
		title: "🎉 Göbekli Tepe reached 10,000 site views this month!",
		excerpt: "Thanks to recent media coverage and new photo uploads, Göbekli Tepe has become the most viewed site on the platform this month.",
		thumbnail: "/thumbnails/gobekli-milestone.jpg",
		siteId: "anatolia-gobekli",
		author: {
			id: "system",
			name: "Megalithic Mapper",
			username: "system",
			isVerified: true,
			isExpert: false,
			isNotable: false,
			followerCount: 0,
			badges: ["System"],
		},
		engagement: {
			upvotes: 567,
			comments: 89,
			shares: 45,
			bookmarks: 123,
			views: 4500,
		},
		timestamps: {
			createdAt: hoursAgo(6),
			updatedAt: hoursAgo(6),
			lastActivityAt: hoursAgo(2),
		},
		recentEngagement: {
			upvotesLast24h: 450,
			commentsLast24h: 67,
			viewsLast24h: 3800,
		},
		tags: ["milestone", "trending", "gobekli-tepe"],
		civilization: "Anatolian",
		region: "Asia",
		relatedSites: ["anatolia-gobekli"],
		mentionedUsers: [],
	},
];

// ============================================
// MOCK USER PREFERENCES
// ============================================

export const mockUserPreferences: UserFeedPreferences = {
	userId: "current-user",
	followedSites: ["giza-gp", "giza-sphinx", "anatolia-gobekli", "cusco-sacsayhuaman"],
	followedUsers: [
		mockContributors.benUnchartedX.id,
		mockContributors.drSchoch.id,
		mockContributors.grahamHancock.id,
	],
	followedTags: ["acoustics", "precision", "water-erosion", "polygonal-masonry"],
	followedRegions: ["Africa", "South America"],
	followedCivilizations: ["Ancient Egyptian", "Inca"],
	bookmarkedSites: ["giza-gp", "cusco-sacsayhuaman"],
	bookmarkedContent: ["feed-2-expert-schoch", "feed-5-connection-acoustics"],
	mutedUsers: [],
	mutedTags: [],
	hiddenContent: [],
	recentViews: [],
	recentUpvotes: [],
	recentComments: [],
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getActivityIcon(type: ActivityType): string {
	const icons: Record<ActivityType, string> = {
		new_media: "🎬",
		site_update: "📍",
		new_discussion: "💬",
		discussion_reply: "🔥",
		research_update: "🔬",
		expert_post: "👨‍🔬",
		event_announcement: "📅",
		connection_found: "🔗",
		milestone: "🎉",
		trending: "📈",
	};
	return icons[type] || "📌";
}

export function getActivityLabel(type: ActivityType): string {
	const labels: Record<ActivityType, string> = {
		new_media: "New Media",
		site_update: "Site Updated",
		new_discussion: "New Discussion",
		discussion_reply: "Hot Discussion",
		research_update: "Research Update",
		expert_post: "Expert Insight",
		event_announcement: "Event",
		connection_found: "Connection Found",
		milestone: "Milestone",
		trending: "Trending",
	};
	return labels[type] || "Activity";
}

