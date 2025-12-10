"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ActivityFeedCard } from "@/components/feed/activity-feed-card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent } from "@/shared/ui/card";
import {
	Sparkles,
	TrendingUp,
	Clock,
	Users,
	LayoutGrid,
	List,
	ChevronRight,
	Map,
	MessageSquare,
	Flame,
	Bell,
	Settings2,
	Filter,
} from "lucide-react";

// Feed algorithm and mock data
import {
	mockFeedItems,
	mockUserPreferences,
	getActivityLabel,
} from "@/lib/feed/mock-feed-data";
import {
	generateFeed,
	calculateMyFeedScore,
} from "@/lib/feed/feed-algorithm";
import type { FeedFilters, FeedSortOption, ActivityType } from "@/lib/feed/feed-types";

// Feed tabs for My Feed
const feedTabs = [
	{ id: "for-you", label: "For You", description: "Personalized based on your interests" },
	{ id: "following", label: "Following", description: "From users you follow" },
	{ id: "latest", label: "Latest", description: "Most recent activity" },
];

// Content type filters
const activityFilters: { id: ActivityType | "all"; label: string }[] = [
	{ id: "all", label: "All Activity" },
	{ id: "new_media", label: "New Media" },
	{ id: "expert_post", label: "Expert Posts" },
	{ id: "event_announcement", label: "Events" },
	{ id: "connection_found", label: "Connections" },
	{ id: "discussion_reply", label: "Hot Discussions" },
];

export default function DiscoverPage() {
	const [activeTab, setActiveTab] = useState("for-you");
	const [activeFilter, setActiveFilter] = useState<ActivityType | "all">("all");
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

	// Generate personalized feed using the algorithm
	const feedItems = useMemo(() => {
		let sortOption: FeedSortOption = "trending";
		
		// Different sorting based on tab
		if (activeTab === "following") {
			// Filter to only show content from followed users
			const followedUserIds = mockUserPreferences.followedUsers;
			const followedItems = mockFeedItems.filter(
				(item) => followedUserIds.includes(item.author.id)
			);
			return generateFeed(
				followedItems,
				"new",
				{},
				mockUserPreferences
			);
		}
		
		if (activeTab === "latest") {
			sortOption = "new";
		}

		const filters: FeedFilters = {};
		if (activeFilter !== "all") {
			filters.activityTypes = [activeFilter];
		}

		return generateFeed(mockFeedItems, sortOption, filters, mockUserPreferences);
	}, [activeTab, activeFilter]);

	// Stats
	const newMediaCount = mockFeedItems.filter((i) => i.type === "new_media").length;
	const expertPostCount = mockFeedItems.filter((i) => i.type === "expert_post").length;
	const hotDiscussions = mockFeedItems.filter((i) => i.type === "discussion_reply").length;
	const followedUsersActive = mockUserPreferences.followedUsers.filter((userId) =>
		mockFeedItems.some((item) => item.author.id === userId)
	).length;

	return (
		<div className="mx-auto max-w-[1400px] space-y-6 p-3 pb-20 sm:p-4 md:p-6 md:pb-6">
			{/* Header Section */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<div className="flex items-center gap-2 mb-1">
						<Sparkles className="h-5 w-5 text-primary" />
						<h1 className="text-xl font-bold sm:text-2xl">My Feed</h1>
					</div>
					<p className="text-sm text-muted-foreground max-w-lg">
						Personalized updates from sites you follow, researchers you watch, and topics you care about
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Button variant="outline" size="sm" className="gap-2" asChild>
						<Link href="/profile#preferences">
							<Settings2 className="h-4 w-4" />
							Feed Settings
						</Link>
					</Button>
					<Button variant="outline" size="sm" className="gap-2" asChild>
						<Link href="/explore">
							<Flame className="h-4 w-4" />
							Explore All
						</Link>
					</Button>
				</div>
			</div>

			{/* How My Feed Works */}
			<Card className="bg-gradient-to-r from-primary/5 via-transparent to-accent/5 border-primary/20">
				<CardContent className="p-4">
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
						<div className="flex items-start gap-3">
							<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
								<Sparkles className="h-5 w-5 text-primary" />
							</div>
							<div>
								<h3 className="font-semibold text-sm">Your feed is personalized</h3>
								<p className="text-xs text-muted-foreground mt-0.5">
									Content is ranked based on your followed sites ({mockUserPreferences.followedSites.length}), 
									users ({mockUserPreferences.followedUsers.length}), and interests. 
									Expert posts and new media get priority.
								</p>
							</div>
						</div>
						<div className="flex items-center gap-3 text-xs text-muted-foreground">
							<div className="flex items-center gap-1.5">
								<Users className="h-4 w-4 text-purple-400" />
								<span>{followedUsersActive} active</span>
							</div>
							<div className="flex items-center gap-1.5">
								<Bell className="h-4 w-4 text-amber-400" />
								<span>{newMediaCount} new</span>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Quick Stats Row */}
			<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
				<Card className="bg-[#1a1f26] border-border/30 cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setActiveFilter("new_media")}>
					<CardContent className="p-4 flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-500/10">
							<TrendingUp className="h-5 w-5 text-pink-400" />
						</div>
						<div>
							<p className="text-lg font-bold">{newMediaCount}</p>
							<p className="text-xs text-muted-foreground">New Media</p>
						</div>
					</CardContent>
				</Card>
				<Card className="bg-[#1a1f26] border-border/30 cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setActiveFilter("expert_post")}>
					<CardContent className="p-4 flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
							<Users className="h-5 w-5 text-blue-400" />
						</div>
						<div>
							<p className="text-lg font-bold">{expertPostCount}</p>
							<p className="text-xs text-muted-foreground">Expert Posts</p>
						</div>
					</CardContent>
				</Card>
				<Card className="bg-[#1a1f26] border-border/30 cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setActiveFilter("discussion_reply")}>
					<CardContent className="p-4 flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
							<MessageSquare className="h-5 w-5 text-orange-400" />
						</div>
						<div>
							<p className="text-lg font-bold">{hotDiscussions}</p>
							<p className="text-xs text-muted-foreground">Hot Discussions</p>
						</div>
					</CardContent>
				</Card>
				<Card className="bg-[#1a1f26] border-border/30">
					<CardContent className="p-4 flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
							<Map className="h-5 w-5 text-emerald-400" />
						</div>
						<div>
							<p className="text-lg font-bold">{mockUserPreferences.followedSites.length}</p>
							<p className="text-xs text-muted-foreground">Sites Followed</p>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Feed Tabs */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-1 p-1 bg-secondary/30 rounded-lg">
					{feedTabs.map((tab) => (
						<Button
							key={tab.id}
							variant={activeTab === tab.id ? "secondary" : "ghost"}
							size="sm"
							className={activeTab === tab.id ? "bg-white text-slate-900 hover:bg-white/90" : ""}
							onClick={() => setActiveTab(tab.id)}
						>
							{tab.label}
						</Button>
					))}
				</div>

				<div className="flex items-center gap-2">
					{/* View Mode Toggle */}
					<div className="flex items-center gap-1">
						<Button
							variant={viewMode === "grid" ? "secondary" : "ghost"}
							size="icon"
							className="h-8 w-8"
							onClick={() => setViewMode("grid")}
						>
							<LayoutGrid className="h-4 w-4" />
						</Button>
						<Button
							variant={viewMode === "list" ? "secondary" : "ghost"}
							size="icon"
							className="h-8 w-8"
							onClick={() => setViewMode("list")}
						>
							<List className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</div>

			{/* Activity Type Filters */}
			<div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
				{activityFilters.map((filter) => (
					<Button
						key={filter.id}
						variant={activeFilter === filter.id ? "default" : "outline"}
						size="sm"
						className={
							activeFilter === filter.id
								? "bg-white text-slate-900 hover:bg-white/90 shrink-0"
								: "border-border/40 hover:bg-secondary/50 shrink-0"
						}
						onClick={() => setActiveFilter(filter.id)}
					>
						{filter.label}
					</Button>
				))}
			</div>

			{/* Feed Description */}
			<div className="flex items-center justify-between">
				<p className="text-sm text-muted-foreground">
					{activeTab === "for-you" && "Content ranked by your interests and followed topics"}
					{activeTab === "following" && "Latest from users you follow"}
					{activeTab === "latest" && "Most recent activity across all content"}
					{activeFilter !== "all" && ` • Filtered to ${activityFilters.find(f => f.id === activeFilter)?.label}`}
				</p>
				<Badge variant="secondary" className="text-xs">
					{feedItems.length} items
				</Badge>
			</div>

			{/* Feed Grid/List */}
			{viewMode === "grid" ? (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{feedItems.map((item) => (
						<ActivityFeedCard key={item.id} item={item} />
					))}
				</div>
			) : (
				<div className="space-y-3">
					{feedItems.map((item) => (
						<ActivityFeedCard key={item.id} item={item} variant="compact" />
					))}
				</div>
			)}

			{/* Empty State */}
			{feedItems.length === 0 && (
				<Card className="bg-[#1a1f26] border-border/30">
					<CardContent className="flex flex-col items-center justify-center py-12 text-center">
						<Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
						<p className="text-lg font-medium text-muted-foreground mb-2">No activity yet</p>
						<p className="text-sm text-muted-foreground mb-4">
							{activeTab === "following"
								? "Follow more users to see their activity here"
								: "Try following more sites and users to personalize your feed"}
						</p>
						<Button variant="outline" asChild>
							<Link href="/explore">Explore Content</Link>
						</Button>
					</CardContent>
				</Card>
			)}

			{/* Load More */}
			{feedItems.length > 0 && (
				<div className="flex justify-center pt-4">
					<Button variant="outline" className="gap-2 border-border/40">
						Load more
						<ChevronRight className="h-4 w-4" />
					</Button>
				</div>
			)}
		</div>
	);
}
