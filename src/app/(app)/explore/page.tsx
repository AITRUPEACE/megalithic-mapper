"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ActivityFeedCard } from "@/components/feed/activity-feed-card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import {
	Compass,
	Search,
	TrendingUp,
	Clock,
	LayoutGrid,
	List,
	ChevronRight,
	Globe,
	MapPin,
	Flame,
	Zap,
	ArrowUp,
	Star,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";

// Feed algorithm and mock data
import { mockFeedItems } from "@/lib/feed/mock-feed-data";
import { generateFeed } from "@/lib/feed/feed-algorithm";
import type { FeedFilters, FeedSortOption } from "@/lib/feed/feed-types";

// Sort options for Explore
const sortOptions: { id: FeedSortOption; label: string; icon: typeof TrendingUp; description: string }[] = [
	{ id: "hot", label: "Hot", icon: Flame, description: "Trending right now" },
	{ id: "rising", label: "Rising", icon: Zap, description: "Gaining traction fast" },
	{ id: "top", label: "Top", icon: Star, description: "Highest engagement" },
	{ id: "new", label: "New", icon: Clock, description: "Most recent" },
];

// Region filters
const regionFilters = [
	{ id: "all", label: "All Regions" },
	{ id: "Africa", label: "Africa" },
	{ id: "Asia", label: "Asia" },
	{ id: "Europe", label: "Europe" },
	{ id: "South America", label: "Americas" },
	{ id: "Oceania", label: "Oceania" },
];

// Time range filters
const timeFilters: { id: FeedFilters["timeRange"]; label: string }[] = [
	{ id: "24h", label: "Today" },
	{ id: "7d", label: "This Week" },
	{ id: "30d", label: "This Month" },
	{ id: "all", label: "All Time" },
];

export default function ExplorePage() {
	const [searchTerm, setSearchTerm] = useState("");
	const [activeSort, setActiveSort] = useState<FeedSortOption>("hot");
	const [activeRegion, setActiveRegion] = useState("all");
	const [activeTime, setActiveTime] = useState<FeedFilters["timeRange"]>("7d");
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

	// Generate explore feed using the algorithm
	const feedItems = useMemo(() => {
		const filters: FeedFilters = {
			timeRange: activeTime,
		};

		// Region filter
		if (activeRegion !== "all") {
			filters.regions = [activeRegion];
		}

		let items = generateFeed(mockFeedItems, activeSort, filters);

		// Search filter (client-side for demo)
		if (searchTerm) {
			items = items.filter(
				(item) =>
					item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
					item.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
					item.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
					item.author.name.toLowerCase().includes(searchTerm.toLowerCase())
			);
		}

		return items;
	}, [activeSort, activeRegion, activeTime, searchTerm]);

	// Get trending stats
	const totalEngagement = mockFeedItems.reduce(
		(sum, item) => sum + item.engagement.upvotes + item.engagement.comments,
		0
	);
	const totalViews = mockFeedItems.reduce((sum, item) => sum + item.engagement.views, 0);
	const hotItems = mockFeedItems.filter((item) => item.recentEngagement.upvotesLast24h > 100).length;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<div className="flex items-center gap-2 mb-1">
						<Compass className="h-5 w-5 text-primary" />
						<h1 className="text-xl font-bold sm:text-2xl">Explore</h1>
					</div>
					<p className="text-sm text-muted-foreground max-w-lg">
						Discover trending content from the global research community. Find new sites, 
						expert insights, and hot discussions.
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Badge variant="secondary" className="gap-1">
						<MapPin className="h-3 w-3" />
						{mockFeedItems.length} Items
					</Badge>
				</div>
			</div>

			{/* How Explore Works */}
			<Card className="bg-gradient-to-r from-orange-500/5 via-transparent to-red-500/5 border-orange-500/20">
				<CardContent className="p-4">
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
						<div className="flex items-start gap-3">
							<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500/20 to-red-500/20">
								<Flame className="h-5 w-5 text-orange-400" />
							</div>
							<div>
								<h3 className="font-semibold text-sm">Discovery Feed</h3>
								<p className="text-xs text-muted-foreground mt-0.5">
									Content ranked by engagement velocity—how fast it's gaining traction. 
									Hot items have high activity in the last 24 hours. Rising shows emerging content.
								</p>
							</div>
						</div>
						<div className="flex items-center gap-4 text-xs text-muted-foreground">
							<div className="flex items-center gap-1.5">
								<Flame className="h-4 w-4 text-orange-400" />
								<span>{hotItems} hot</span>
							</div>
							<div className="flex items-center gap-1.5">
								<ArrowUp className="h-4 w-4 text-emerald-400" />
								<span>{(totalEngagement / 1000).toFixed(1)}K engagement</span>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Search & Filters */}
			<Card className="bg-[#1a1f26] border-border/30">
				<CardContent className="p-4 space-y-4">
					{/* Search */}
					<div className="relative">
						<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							placeholder="Search sites, research, discussions, users..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-9 bg-secondary/30 border-border/40"
						/>
					</div>

					{/* Filters Row */}
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						{/* Sort Options */}
						<div className="flex items-center gap-1 p-1 bg-secondary/30 rounded-lg">
							{sortOptions.map((option) => {
								const Icon = option.icon;
								return (
									<Button
										key={option.id}
										variant={activeSort === option.id ? "secondary" : "ghost"}
										size="sm"
										className={cn(
											"gap-1.5",
											activeSort === option.id && "bg-white text-slate-900 hover:bg-white/90"
										)}
										onClick={() => setActiveSort(option.id)}
										title={option.description}
									>
										<Icon className="h-3.5 w-3.5" />
										{option.label}
									</Button>
								);
							})}
						</div>

						{/* Time Range & View */}
						<div className="flex items-center gap-2">
							<div className="flex items-center gap-1">
								{timeFilters.map((filter) => (
									<Button
										key={filter.id}
										variant={activeTime === filter.id ? "secondary" : "ghost"}
										size="sm"
										className="h-8 px-2 text-xs"
										onClick={() => setActiveTime(filter.id)}
									>
										{filter.label}
									</Button>
								))}
							</div>

							{/* View Mode */}
							<div className="flex items-center gap-1 border-l border-border/40 pl-2">
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

					{/* Region Filters */}
					<div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
						<Globe className="h-4 w-4 text-muted-foreground shrink-0" />
						{regionFilters.map((region) => (
							<Button
								key={region.id}
								variant={activeRegion === region.id ? "default" : "outline"}
								size="sm"
								className={cn(
									"shrink-0 h-7 text-xs",
									activeRegion === region.id
										? "bg-white text-slate-900 hover:bg-white/90"
										: "border-border/40 hover:bg-secondary/50"
								)}
								onClick={() => setActiveRegion(region.id)}
							>
								{region.label}
							</Button>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Results Info */}
			<div className="flex items-center justify-between">
				<p className="text-sm text-muted-foreground">
					<span className="font-medium text-foreground">{feedItems.length}</span> results
					{activeRegion !== "all" && (
						<span className="ml-1">
							in <span className="font-medium text-foreground">{regionFilters.find((r) => r.id === activeRegion)?.label}</span>
						</span>
					)}
					{searchTerm && (
						<span className="ml-1">
							for "<span className="font-medium text-foreground">{searchTerm}</span>"
						</span>
					)}
				</p>
				<p className="text-xs text-muted-foreground">
					Sorted by: <span className="font-medium text-foreground">{sortOptions.find(s => s.id === activeSort)?.label}</span>
					{" • "}
					<span className="font-medium text-foreground">{timeFilters.find(t => t.id === activeTime)?.label}</span>
				</p>
			</div>

			{/* Feed Grid/List */}
			{viewMode === "grid" ? (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
						<Search className="h-12 w-12 text-muted-foreground mb-4" />
						<p className="text-lg font-medium text-muted-foreground mb-2">No results found</p>
						<p className="text-sm text-muted-foreground mb-4">
							Try adjusting your search or filters
						</p>
						<Button
							variant="outline"
							onClick={() => {
								setSearchTerm("");
								setActiveRegion("all");
								setActiveTime("7d");
							}}
						>
							Clear filters
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
