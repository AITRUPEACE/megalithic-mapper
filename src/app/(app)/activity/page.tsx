"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { ActivityFeedCard } from "@/components/feed/activity-feed-card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Activity, Users, ChevronRight, Map, Upload, Image, FileText, Calendar, Link2, X, Hash } from "lucide-react";

// Feed algorithm and mock data
import { mockFeedItems, mockUserPreferences } from "@/lib/feed/mock-feed-data";
import { generateFeed } from "@/lib/feed/feed-algorithm";
import type { FeedFilters, ActivityType } from "@/lib/feed/feed-types";
import { getFollowedSites, type SiteFollow } from "@/lib/supabase/profile-actions";

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
	const router = useRouter();
	const searchParams = useSearchParams();
	const tagFilter = searchParams.get("tag");

	const [activeTab, setActiveTab] = useState("all");
	const [activeFilter, setActiveFilter] = useState<ActivityType | "all">("all");
	const [followedSites, setFollowedSites] = useState<SiteFollow[]>([]);
	const [isLoadingFollows, setIsLoadingFollows] = useState(false);

	// Fetch user's followed sites on mount
	useEffect(() => {
		async function fetchFollowedSites() {
			setIsLoadingFollows(true);
			try {
				const sites = await getFollowedSites();
				setFollowedSites(sites);
			} catch (error) {
				console.error("Failed to fetch followed sites:", error);
			} finally {
				setIsLoadingFollows(false);
			}
		}
		fetchFollowedSites();
	}, []);

	// Clear tag filter
	const clearTagFilter = () => {
		router.push("/activity");
	};

	// Merge real followed sites with mock preferences for filtering
	const effectivePreferences = useMemo(() => {
		const realFollowedSiteIds = followedSites.map((f) => f.site_id);
		return {
			...mockUserPreferences,
			followedSites: realFollowedSiteIds.length > 0 ? realFollowedSiteIds : mockUserPreferences.followedSites,
		};
	}, [followedSites]);

	// Generate activity feed
	const feedItems = useMemo(() => {
		const filters: FeedFilters = {};

		if (activeFilter !== "all") {
			filters.activityTypes = [activeFilter];
		}

		let items = mockFeedItems;

		// Filter by tab
		if (activeTab === "following") {
			const followedUserIds = effectivePreferences.followedUsers;
			const followedSiteIds = effectivePreferences.followedSites;
			items = items.filter((item) => followedUserIds.includes(item.author.id) || (item.siteId && followedSiteIds.includes(item.siteId)));
		}

		// Filter by tag (from URL parameter)
		if (tagFilter) {
			items = items.filter((item) => item.tags.some((t) => t.toLowerCase() === tagFilter.toLowerCase()));
		}

		return generateFeed(items, "new", filters, effectivePreferences);
	}, [activeTab, activeFilter, tagFilter, effectivePreferences]);

	return (
		<div className="mx-auto max-w-[1400px] space-y-4 p-3 pb-20 sm:p-4 md:p-6 md:pb-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<h1 className="text-lg font-semibold">Activity</h1>
				<Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" asChild>
					<Link href="/contribute">
						<Upload className="h-4 w-4" />
						<span className="hidden sm:inline">Contribute</span>
					</Link>
				</Button>
			</div>

			{/* Tabs */}
			<div className="flex items-center gap-1 p-1 bg-secondary/30 rounded-lg w-fit">
				{activityTabs.map((tab) => (
					<Button
						key={tab.id}
						variant={activeTab === tab.id ? "secondary" : "ghost"}
						size="sm"
						className={activeTab === tab.id ? "bg-foreground text-background hover:bg-foreground/90" : ""}
						onClick={() => setActiveTab(tab.id)}
					>
						{tab.label}
					</Button>
				))}
			</div>

			{/* Active Tag Filter */}
			{tagFilter && (
				<div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
					<Hash className="h-4 w-4 text-primary" />
					<span className="text-sm">
						Showing posts tagged with{" "}
						<Badge variant="secondary" className="ml-1">
							#{tagFilter}
						</Badge>
					</span>
					<Button variant="ghost" size="sm" className="ml-auto h-7 px-2 text-xs" onClick={clearTagFilter}>
						<X className="h-3 w-3 mr-1" />
						Clear filter
					</Button>
				</div>
			)}

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
									? "bg-foreground text-background hover:bg-foreground/90 shrink-0 gap-1.5"
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

			{/* Activity Feed */}
			<div className="space-y-3">
				{feedItems.map((item) => (
					<ActivityFeedCard key={item.id} item={item} variant="compact" />
				))}
			</div>

			{/* Empty State */}
			{feedItems.length === 0 && (
				<div className="flex flex-col items-center justify-center py-12 text-center">
					<Activity className="h-12 w-12 text-muted-foreground mb-4" />
					<p className="text-lg font-medium text-muted-foreground mb-2">No activity yet</p>
					<p className="text-sm text-muted-foreground mb-4">
						{activeTab === "following" ? "Follow sites and researchers to see their contributions here" : "Be the first to contribute!"}
					</p>
					<Button variant="outline" asChild>
						<Link href="/contribute">Add Contribution</Link>
					</Button>
				</div>
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
