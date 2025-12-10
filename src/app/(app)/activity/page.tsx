"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ActivityFeedCard } from "@/components/feed/activity-feed-card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent } from "@/shared/ui/card";
import {
	Activity,
	Clock,
	Eye,
	Users,
	LayoutGrid,
	List,
	ChevronRight,
	Map,
	Upload,
	Image,
	FileText,
	Video,
	Calendar,
	Link2,
	Filter,
} from "lucide-react";

// Feed algorithm and mock data
import {
	mockFeedItems,
	mockUserPreferences,
} from "@/lib/feed/mock-feed-data";
import { generateFeed } from "@/lib/feed/feed-algorithm";
import type { FeedFilters, ActivityType } from "@/lib/feed/feed-types";

// Activity tabs
const activityTabs = [
	{ id: "all", label: "All Activity" },
	{ id: "following", label: "Following" },
	{ id: "nearby", label: "Near You" },
];

// Content type filters  
const contentFilters: { id: ActivityType | "all"; label: string; icon: typeof Image }[] = [
	{ id: "all", label: "All", icon: Activity },
	{ id: "new_media", label: "Media", icon: Image },
	{ id: "expert_post", label: "Expert", icon: Users },
	{ id: "site_update", label: "Sites", icon: Map },
	{ id: "research_update", label: "Research", icon: FileText },
	{ id: "event_announcement", label: "Events", icon: Calendar },
	{ id: "connection_found", label: "Connections", icon: Link2 },
];

export default function ActivityPage() {
	const [activeTab, setActiveTab] = useState("all");
	const [activeFilter, setActiveFilter] = useState<ActivityType | "all">("all");
	const [viewMode, setViewMode] = useState<"list" | "grid">("list");

	// Generate activity feed
	const feedItems = useMemo(() => {
		const filters: FeedFilters = {};
		
		if (activeFilter !== "all") {
			filters.activityTypes = [activeFilter];
		}

		let items = mockFeedItems;

		// Filter by tab
		if (activeTab === "following") {
			const followedUserIds = mockUserPreferences.followedUsers;
			const followedSiteIds = mockUserPreferences.followedSites;
			items = items.filter(
				(item) =>
					followedUserIds.includes(item.author.id) ||
					(item.siteId && followedSiteIds.includes(item.siteId))
			);
		}

		return generateFeed(items, "new", filters, mockUserPreferences);
	}, [activeTab, activeFilter]);

	// Stats
	const todayCount = feedItems.filter(
		(i) => Date.now() - i.timestamps.createdAt.getTime() < 24 * 60 * 60 * 1000
	).length;
	const mediaCount = mockFeedItems.filter((i) => i.type === "new_media").length;
	const sitesUpdated = new Set(mockFeedItems.filter((i) => i.siteId).map((i) => i.siteId)).size;

	return (
		<div className="mx-auto max-w-[1400px] space-y-6 p-3 pb-20 sm:p-4 md:p-6 md:pb-6">
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<div className="flex items-center gap-2 mb-1">
						<Activity className="h-5 w-5 text-primary" />
						<h1 className="text-xl font-bold sm:text-2xl">Recent Activity</h1>
					</div>
					<p className="text-sm text-muted-foreground max-w-lg">
						See what's being contributed across the research network. New media, site updates, research findings, and more.
					</p>
				</div>
				<Button className="gap-2 bg-primary hover:bg-primary/90 shrink-0" asChild>
					<Link href="/contribute">
						<Upload className="h-4 w-4" />
						Add Contribution
					</Link>
				</Button>
			</div>

			{/* Quick Stats */}
			<div className="grid grid-cols-3 gap-3">
				<Card className="bg-[#1a1f26] border-border/30">
					<CardContent className="p-4 flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
							<Clock className="h-5 w-5 text-primary" />
						</div>
						<div>
							<p className="text-lg font-bold">{todayCount}</p>
							<p className="text-xs text-muted-foreground">Today</p>
						</div>
					</CardContent>
				</Card>
				<Card className="bg-[#1a1f26] border-border/30">
					<CardContent className="p-4 flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-500/10">
							<Image className="h-5 w-5 text-pink-400" />
						</div>
						<div>
							<p className="text-lg font-bold">{mediaCount}</p>
							<p className="text-xs text-muted-foreground">New Media</p>
						</div>
					</CardContent>
				</Card>
				<Card className="bg-[#1a1f26] border-border/30">
					<CardContent className="p-4 flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
							<Map className="h-5 w-5 text-emerald-400" />
						</div>
						<div>
							<p className="text-lg font-bold">{sitesUpdated}</p>
							<p className="text-xs text-muted-foreground">Sites Updated</p>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Tabs & Filters */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				{/* Tabs */}
				<div className="flex items-center gap-1 p-1 bg-secondary/30 rounded-lg">
					{activityTabs.map((tab) => (
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

				{/* View Mode */}
				<div className="flex items-center gap-2">
					<Button
						variant={viewMode === "list" ? "secondary" : "ghost"}
						size="icon"
						className="h-8 w-8"
						onClick={() => setViewMode("list")}
					>
						<List className="h-4 w-4" />
					</Button>
					<Button
						variant={viewMode === "grid" ? "secondary" : "ghost"}
						size="icon"
						className="h-8 w-8"
						onClick={() => setViewMode("grid")}
					>
						<LayoutGrid className="h-4 w-4" />
					</Button>
				</div>
			</div>

			{/* Content Type Filters */}
			<div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
				{contentFilters.map((filter) => {
					const Icon = filter.icon;
					return (
						<Button
							key={filter.id}
							variant={activeFilter === filter.id ? "default" : "outline"}
							size="sm"
							className={
								activeFilter === filter.id
									? "bg-white text-slate-900 hover:bg-white/90 shrink-0 gap-1.5"
									: "border-border/40 hover:bg-secondary/50 shrink-0 gap-1.5"
							}
							onClick={() => setActiveFilter(filter.id)}
						>
							<Icon className="h-3.5 w-3.5" />
							{filter.label}
						</Button>
					);
				})}
			</div>

			{/* Results info */}
			<div className="flex items-center justify-between">
				<p className="text-sm text-muted-foreground">
					<span className="font-medium text-foreground">{feedItems.length}</span> contributions
					{activeTab === "following" && " from people and sites you follow"}
				</p>
				<Badge variant="secondary" className="text-xs">
					Sorted by recent
				</Badge>
			</div>

			{/* Activity Feed */}
			{viewMode === "list" ? (
				<div className="space-y-3">
					{feedItems.map((item) => (
						<ActivityFeedCard key={item.id} item={item} variant="compact" />
					))}
				</div>
			) : (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{feedItems.map((item) => (
						<ActivityFeedCard key={item.id} item={item} />
					))}
				</div>
			)}

			{/* Empty State */}
			{feedItems.length === 0 && (
				<Card className="bg-[#1a1f26] border-border/30">
					<CardContent className="flex flex-col items-center justify-center py-12 text-center">
						<Activity className="h-12 w-12 text-muted-foreground mb-4" />
						<p className="text-lg font-medium text-muted-foreground mb-2">No activity yet</p>
						<p className="text-sm text-muted-foreground mb-4">
							{activeTab === "following"
								? "Follow sites and researchers to see their contributions here"
								: "Be the first to contribute!"}
						</p>
						<Button asChild>
							<Link href="/contribute">Add Contribution</Link>
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

