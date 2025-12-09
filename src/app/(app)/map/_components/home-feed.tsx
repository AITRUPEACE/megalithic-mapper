"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
	Sparkles,
	Flame,
	TrendingUp,
	Clock,
	MessageSquare,
	MapPin,
	ThumbsUp,
	Eye,
	Image as ImageIcon,
	FileText,
	Video,
	Link2,
	Calendar,
	ChevronRight,
	Play,
	BookOpen,
	Users,
	ExternalLink,
	Loader2,
	RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/shared/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { cn, timeAgo } from "@/shared/lib/utils";
import type { MapSiteFeature } from "@/entities/map/model/types";

// Feed sorting options
type SortMode = "hot" | "new" | "top";

// Activity/contribution types
type ContributionType =
	| "new_photos"
	| "new_video"
	| "research_update"
	| "site_update"
	| "expert_post"
	| "connection_found"
	| "event_announcement";

interface FeedItem {
	id: string;
	type: ContributionType;
	siteId?: string;
	siteName?: string;
	siteLocation?: string;
	title: string;
	description: string;
	author: {
		name: string;
		username: string;
		avatar?: string;
		isVerified?: boolean;
		badge?: string; // "YouTuber", "Researcher", "Expert"
	};
	timestamp: Date;
	engagement: {
		upvotes: number;
		comments: number;
		views: number;
	};
	media?: {
		type: "image" | "video" | "youtube";
		thumbnail?: string;
		count?: number;
	};
	tags: string[];
	externalLink?: {
		url: string;
		domain: string;
	};
}

interface HomeFeedProps {
	sites: MapSiteFeature[];
	onFocusSite: (siteId: string) => void;
	className?: string;
}

const contributionConfig: Record<
	ContributionType,
	{
		icon: typeof ImageIcon;
		color: string;
		bg: string;
		label: string;
	}
> = {
	new_photos: {
		icon: ImageIcon,
		color: "text-pink-400",
		bg: "bg-pink-500/20",
		label: "New Media",
	},
	new_video: {
		icon: Video,
		color: "text-red-400",
		bg: "bg-red-500/20",
		label: "New Video",
	},
	research_update: {
		icon: BookOpen,
		color: "text-blue-400",
		bg: "bg-blue-500/20",
		label: "Research",
	},
	site_update: {
		icon: MapPin,
		color: "text-emerald-400",
		bg: "bg-emerald-500/20",
		label: "Site Update",
	},
	expert_post: {
		icon: Users,
		color: "text-purple-400",
		bg: "bg-purple-500/20",
		label: "Expert",
	},
	connection_found: {
		icon: Link2,
		color: "text-amber-400",
		bg: "bg-amber-500/20",
		label: "Connection",
	},
	event_announcement: {
		icon: Calendar,
		color: "text-cyan-400",
		bg: "bg-cyan-500/20",
		label: "Event",
	},
};

// Generate mock feed items from sites
function generateFeedItems(sites: MapSiteFeature[]): FeedItem[] {
	const items: FeedItem[] = [];
	const now = new Date();

	// Expert video post
	items.push({
		id: "feed-1",
		type: "new_video",
		siteId: sites[0]?.id,
		siteName: "Sacsayhuaman",
		siteLocation: "Peru",
		title: "NEW: Precision Engineering at Sacsayhuaman - Evidence Analysis",
		description:
			"Ben presents new photogrammetry data showing stone tolerances of less than 0.5mm between megalithic blocks. Includes 3D scans and comparison with modern machining standards.",
		author: {
			name: "Ben from UnchartedX",
			username: "unchartedx",
			isVerified: true,
			badge: "YouTuber",
		},
		timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000),
		engagement: { upvotes: 2847, comments: 342, views: 45200 },
		media: { type: "youtube", thumbnail: "/api/placeholder/640/360" },
		tags: ["polygonal-masonry", "sacsayhuaman", "precision"],
		externalLink: { url: "https://youtube.com", domain: "youtube.com" },
	});

	// New photos contribution
	items.push({
		id: "feed-2",
		type: "new_photos",
		siteId: sites[1]?.id,
		siteName: "Göbekli Tepe",
		siteLocation: "Turkey",
		title: "12 New High-Resolution Photos: Göbekli Tepe Pillar 43",
		description:
			"Detailed documentation of the vulture stone carvings, including previously unphotographed sections of the pillar base. Shot with specialized macro lens for inscription details.",
		author: {
			name: "Maria Santos",
			username: "maria_megalith",
			isVerified: true,
		},
		timestamp: new Date(now.getTime() - 5 * 60 * 60 * 1000),
		engagement: { upvotes: 892, comments: 156, views: 8900 },
		media: { type: "image", count: 12 },
		tags: ["gobekli-tepe", "pillar-43", "photography"],
	});

	// Research update
	items.push({
		id: "feed-3",
		type: "research_update",
		siteName: "Great Pyramid of Giza",
		siteLocation: "Egypt",
		title: "Updated Acoustic Resonance Data: King's Chamber Analysis",
		description:
			"New measurements confirm 110Hz resonant frequency. Data now includes spectral analysis and comparison with 14 other megalithic chambers worldwide.",
		author: {
			name: "Dr. Sarah Chen",
			username: "dr_chen_acoustics",
			isVerified: true,
			badge: "Researcher",
		},
		timestamp: new Date(now.getTime() - 8 * 60 * 60 * 1000),
		engagement: { upvotes: 1456, comments: 234, views: 12400 },
		tags: ["acoustics", "giza", "resonance"],
	});

	// Connection found
	items.push({
		id: "feed-4",
		type: "connection_found",
		title: "Connection Proposal: Astronomical Alignment Pattern",
		description:
			"Identified similar solstice alignment angles (±0.3°) at Angkor Wat, Giza, and Teotihuacan. Seeking community verification with additional sites.",
		author: {
			name: "Alex Rivera",
			username: "stellar_archaeology",
			isVerified: false,
		},
		timestamp: new Date(now.getTime() - 12 * 60 * 60 * 1000),
		engagement: { upvotes: 567, comments: 89, views: 4200 },
		tags: ["astronomy", "alignments", "archaeoastronomy"],
	});

	// Site update
	sites.slice(0, 3).forEach((site, i) => {
		items.push({
			id: `site-update-${site.id}`,
			type: "site_update",
			siteId: site.id,
			siteName: site.name,
			siteLocation: site.tags.cultures[0] || "Unknown",
			title: `Site Profile Updated: ${site.name}`,
			description: `New data added: ${
				i === 0
					? "47 coordinate points, updated measurements"
					: i === 1
						? "12 new photographs, updated description"
						: "3D model reference, material analysis"
			}`,
			author: {
				name: "Community Contributor",
				username: "contributor_" + (i + 1),
			},
			timestamp: new Date(now.getTime() - (24 + i * 12) * 60 * 60 * 1000),
			engagement: {
				upvotes: Math.floor(Math.random() * 300 + 50),
				comments: Math.floor(Math.random() * 50 + 10),
				views: Math.floor(Math.random() * 2000 + 500),
			},
			tags: site.tags.themes.slice(0, 2),
		});
	});

	// Event
	items.push({
		id: "feed-event-1",
		type: "event_announcement",
		title: "Egypt Research Tour 2025 with Graham Hancock",
		description:
			"12-day journey including private Pyramid access and sunrise Sphinx viewing. Limited spots remaining for this exclusive research expedition.",
		author: {
			name: "Ancient Origins Tours",
			username: "ao_tours",
			isVerified: true,
		},
		timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
		engagement: { upvotes: 1234, comments: 67, views: 15600 },
		tags: ["event", "egypt", "tour"],
	});

	return items;
}

// Calculate "hotness" score
function calculateHotScore(item: FeedItem): number {
	const hoursSincePost =
		(Date.now() - item.timestamp.getTime()) / (1000 * 60 * 60);
	const engagementScore =
		item.engagement.upvotes * 1 +
		item.engagement.comments * 2 +
		item.engagement.views * 0.01;
	// Decay factor - newer posts get boosted
	const decay = Math.pow(0.95, hoursSincePost);
	return engagementScore * decay;
}

export function HomeFeed({ sites, onFocusSite, className }: HomeFeedProps) {
	const [sortMode, setSortMode] = useState<SortMode>("hot");
	const [apiFeedItems, setApiFeedItems] = useState<FeedItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Fetch feed from API
	useEffect(() => {
		async function fetchFeed() {
			setIsLoading(true);
			setError(null);
			try {
				const response = await fetch(`/api/feed?sort=${sortMode}&limit=30`);
				if (!response.ok) throw new Error("Failed to fetch feed");
				
				const data = await response.json();
				
				// Transform API response to FeedItem format
				const items: FeedItem[] = (data.feed || []).map((item: any) => ({
					id: item.id,
					type: mapActivityType(item.activity_type),
					siteId: item.site_id,
					siteName: item.title?.replace("New site: ", ""),
					siteLocation: item.metadata?.site_type || "",
					title: item.title,
					description: item.description || "",
					author: {
						name: item.actor?.full_name || item.actor?.username || "Community",
						username: item.actor?.username || "community",
						avatar: item.actor?.avatar_url,
						isVerified: item.actor?.is_verified,
						badge: item.actor?.role === "expert" ? "Expert" : item.actor?.role === "researcher" ? "Researcher" : undefined,
					},
					timestamp: new Date(item.created_at),
					engagement: {
						upvotes: item.engagement_score || 0,
						comments: 0,
						views: 0,
					},
					media: item.thumbnail_url ? { type: "image", thumbnail: item.thumbnail_url } : 
					       item.metadata?.external_links?.[0]?.type === "youtube" ? { type: "youtube", thumbnail: item.metadata.external_links[0].thumbnail } : undefined,
					tags: [],
					externalLink: item.metadata?.external_links?.[0] ? {
						url: item.metadata.external_links[0].url,
						domain: new URL(item.metadata.external_links[0].url).hostname.replace("www.", ""),
					} : undefined,
				}));
				
				setApiFeedItems(items);
			} catch (err) {
				console.error("Error fetching feed:", err);
				setError("Failed to load feed");
			} finally {
				setIsLoading(false);
			}
		}
		
		fetchFeed();
	}, [sortMode]);

	// Fallback to generated items if API returns nothing
	const generatedItems = useMemo(() => generateFeedItems(sites), [sites]);
	const feedItems = apiFeedItems.length > 0 ? apiFeedItems : generatedItems;

	const sortedItems = useMemo(() => {
		const sorted = [...feedItems];
		switch (sortMode) {
			case "hot":
				return sorted.sort(
					(a, b) => calculateHotScore(b) - calculateHotScore(a)
				);
			case "new":
				return sorted.sort(
					(a, b) => b.timestamp.getTime() - a.timestamp.getTime()
				);
			case "top":
				return sorted.sort(
					(a, b) => b.engagement.upvotes - a.engagement.upvotes
				);
			default:
				return sorted;
		}
	}, [feedItems, sortMode]);

	// Helper to map API activity types to our types
	function mapActivityType(apiType: string): ContributionType {
		const mapping: Record<string, ContributionType> = {
			site_added: "site_update",
			site_verified: "site_update",
			site_updated: "site_update",
			media_added: "new_photos",
			post_created: "expert_post",
			comment_added: "research_update",
		};
		return mapping[apiType] || "site_update";
	}

	const sortOptions: { key: SortMode; label: string; icon: typeof Flame }[] = [
		{ key: "hot", label: "Hot", icon: Flame },
		{ key: "new", label: "New", icon: Clock },
		{ key: "top", label: "Top", icon: TrendingUp },
	];

	return (
		<div className={cn("flex flex-col h-full", className)}>
			{/* Header */}
			<div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
				<div className="flex items-center gap-2">
					<Sparkles className="h-5 w-5 text-primary" />
					<h2 className="font-semibold">Activity Feed</h2>
				</div>
				{/* Sort toggle */}
				<div className="flex items-center gap-1 p-0.5 bg-secondary/50 rounded-lg">
					{sortOptions.map((opt) => {
						const Icon = opt.icon;
						return (
							<button
								key={opt.key}
								onClick={() => setSortMode(opt.key)}
								className={cn(
									"flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors",
									sortMode === opt.key
										? "bg-white text-slate-900 shadow-sm"
										: "text-muted-foreground hover:text-foreground"
								)}
							>
								<Icon className="h-3.5 w-3.5" />
								{opt.label}
							</button>
						);
					})}
				</div>
			</div>

			{/* Feed List */}
			<ScrollArea className="flex-1">
				<div className="p-3 space-y-3">
					{isLoading ? (
						<div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
							<Loader2 className="h-6 w-6 animate-spin mb-2" />
							<span className="text-sm">Loading feed...</span>
						</div>
					) : error ? (
						<div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
							<span className="text-sm mb-2">{error}</span>
							<Button variant="outline" size="sm" onClick={() => setSortMode(sortMode)}>
								<RefreshCw className="h-4 w-4 mr-2" />
								Retry
							</Button>
						</div>
					) : sortedItems.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
							<Sparkles className="h-8 w-8 mb-2" />
							<span className="text-sm">No activity yet</span>
							<p className="text-xs mt-1">Be the first to contribute!</p>
						</div>
					) : (
						<>
							{sortedItems.map((item) => (
								<FeedCard
									key={item.id}
									item={item}
									onFocusSite={onFocusSite}
								/>
							))}

							{/* Load more */}
							<div className="flex justify-center pt-2 pb-4">
								<Button variant="outline" size="sm" className="gap-2">
									Load more
									<ChevronRight className="h-4 w-4" />
								</Button>
							</div>
						</>
					)}
				</div>
			</ScrollArea>
		</div>
	);
}

// Individual Feed Card Component
function FeedCard({
	item,
	onFocusSite,
}: {
	item: FeedItem;
	onFocusSite: (siteId: string) => void;
}) {
	const [isUpvoted, setIsUpvoted] = useState(false);
	const config = contributionConfig[item.type];
	const Icon = config.icon;

	return (
		<Card className="overflow-hidden border-border/40 bg-[#1a1f26] hover:bg-[#1e232b] transition-colors">
			<CardHeader className="p-3 pb-2">
				<div className="flex items-start gap-3">
					{/* Author avatar */}
					<Avatar className="h-9 w-9 border border-border/40">
						<AvatarImage src={item.author.avatar} />
						<AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-xs">
							{item.author.name
								.split(" ")
								.map((n) => n[0])
								.join("")
								.slice(0, 2)}
						</AvatarFallback>
					</Avatar>

					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-2 flex-wrap">
							<span className="font-medium text-sm">
								{item.author.name}
							</span>
							{item.author.isVerified && (
								<Badge
									variant="secondary"
									className="h-4 px-1 text-[9px] bg-blue-500/20 text-blue-400"
								>
									✓
								</Badge>
							)}
							{item.author.badge && (
								<Badge
									variant="outline"
									className="h-4 px-1.5 text-[9px] border-primary/40 text-primary"
								>
									{item.author.badge}
								</Badge>
							)}
							<span className="text-xs text-muted-foreground">
								• {item.type.replace(/_/g, " ")}
							</span>
						</div>
						<div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
							{item.siteName && (
								<>
									<MapPin className="h-3 w-3" />
									<span>{item.siteName}</span>
									{item.siteLocation && (
										<span>• {item.siteLocation}</span>
									)}
								</>
							)}
						</div>
					</div>

					{/* Type badge */}
					<div className={cn("shrink-0 rounded-md p-1.5", config.bg)}>
						<Icon className={cn("h-4 w-4", config.color)} />
					</div>
				</div>
			</CardHeader>

			<CardContent className="px-3 py-2">
				{/* Title */}
				<h3 className="font-semibold text-sm leading-tight mb-1.5">
					{item.title}
				</h3>

				{/* Description */}
				<p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-2">
					{item.description}
				</p>

				{/* Media preview */}
				{item.media && (
					<div className="relative aspect-video w-full rounded-lg overflow-hidden bg-muted/30 mb-2">
						{item.media.type === "youtube" ? (
							<div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-red-900/40 to-red-950/60">
								<div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 shadow-lg">
									<Play className="h-5 w-5 text-white ml-0.5" />
								</div>
							</div>
						) : item.media.type === "image" && item.media.count ? (
							<div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-pink-900/30 to-pink-950/50">
								<div className="text-center">
									<ImageIcon className="h-8 w-8 text-pink-400 mx-auto mb-1" />
									<span className="text-sm font-medium text-pink-300">
										{item.media.count} photos
									</span>
								</div>
							</div>
						) : null}
					</div>
				)}

				{/* External link */}
				{item.externalLink && (
					<a
						href={item.externalLink.url}
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors text-xs mb-2"
					>
						<ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
						<span className="text-muted-foreground">
							{item.externalLink.domain}
						</span>
					</a>
				)}

				{/* Tags */}
				<div className="flex flex-wrap gap-1.5">
					{item.tags.slice(0, 3).map((tag) => (
						<span
							key={tag}
							className="text-[10px] text-primary hover:underline cursor-pointer"
						>
							#{tag}
						</span>
					))}
				</div>
			</CardContent>

			<CardFooter className="px-3 py-2 border-t border-border/30 flex items-center justify-between">
				<div className="flex items-center gap-3">
					{/* Upvote */}
					<button
						onClick={() => setIsUpvoted(!isUpvoted)}
						className={cn(
							"flex items-center gap-1.5 text-xs transition-colors",
							isUpvoted
								? "text-primary"
								: "text-muted-foreground hover:text-foreground"
						)}
					>
						<ThumbsUp
							className={cn("h-3.5 w-3.5", isUpvoted && "fill-current")}
						/>
						{item.engagement.upvotes + (isUpvoted ? 1 : 0)}
					</button>

					{/* Comments */}
					<button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
						<MessageSquare className="h-3.5 w-3.5" />
						{item.engagement.comments}
					</button>

					{/* Views */}
					<span className="flex items-center gap-1.5 text-xs text-muted-foreground">
						<Eye className="h-3.5 w-3.5" />
						{item.engagement.views > 1000
							? `${(item.engagement.views / 1000).toFixed(1)}K`
							: item.engagement.views}
					</span>
				</div>

				<div className="flex items-center gap-2">
					{/* Timestamp */}
					<span className="text-[10px] text-muted-foreground">
						{timeAgo(item.timestamp)}
					</span>

					{/* Focus on map */}
					{item.siteId && (
						<Button
							variant="ghost"
							size="icon"
							className="h-7 w-7"
							onClick={() => onFocusSite(item.siteId!)}
						>
							<MapPin className="h-3.5 w-3.5" />
						</Button>
					)}
				</div>
			</CardFooter>
		</Card>
	);
}

