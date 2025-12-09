"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
	ArrowUp,
	MessageSquare,
	Bookmark,
	Share2,
	MoreHorizontal,
	ExternalLink,
	Clock,
	Eye,
	Map,
	FileText,
	Video,
	Image as ImageIcon,
	Link as LinkIcon,
	Users,
	Calendar,
	Award,
	Sparkles,
	Youtube,
	TrendingUp,
	CheckCircle2,
	Star,
	Play,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { cn } from "@/shared/lib/utils";
import type { FeedableContent, ActivityType } from "@/lib/feed/feed-types";
import { getActivityIcon, getActivityLabel } from "@/lib/feed/mock-feed-data";

// Activity type icons and colors
const activityConfig: Record<ActivityType, { icon: typeof Map; color: string; bgColor: string }> = {
	new_media: { icon: Play, color: "text-pink-400", bgColor: "bg-pink-500/10" },
	site_update: { icon: Map, color: "text-emerald-400", bgColor: "bg-emerald-500/10" },
	new_discussion: { icon: MessageSquare, color: "text-amber-400", bgColor: "bg-amber-500/10" },
	discussion_reply: { icon: TrendingUp, color: "text-orange-400", bgColor: "bg-orange-500/10" },
	research_update: { icon: FileText, color: "text-purple-400", bgColor: "bg-purple-500/10" },
	expert_post: { icon: Award, color: "text-blue-400", bgColor: "bg-blue-500/10" },
	event_announcement: { icon: Calendar, color: "text-cyan-400", bgColor: "bg-cyan-500/10" },
	connection_found: { icon: LinkIcon, color: "text-teal-400", bgColor: "bg-teal-500/10" },
	milestone: { icon: Star, color: "text-yellow-400", bgColor: "bg-yellow-500/10" },
	trending: { icon: TrendingUp, color: "text-red-400", bgColor: "bg-red-500/10" },
};

interface ActivityFeedCardProps {
	item: FeedableContent;
	variant?: "default" | "compact";
	onUpvote?: (id: string) => void;
	onBookmark?: (id: string) => void;
}

function formatNumber(num: number): string {
	if (num >= 1000000) {
		return (num / 1000000).toFixed(1) + "M";
	}
	if (num >= 1000) {
		return (num / 1000).toFixed(1) + "K";
	}
	return num.toString();
}

function timeAgo(date: Date): string {
	const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
	
	if (seconds < 60) return "just now";
	if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
	if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
	if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
	return date.toLocaleDateString();
}

export function ActivityFeedCard({
	item,
	variant = "default",
	onUpvote,
	onBookmark,
}: ActivityFeedCardProps) {
	const [isUpvoted, setIsUpvoted] = useState(false);
	const [isBookmarked, setIsBookmarked] = useState(false);
	const [upvotes, setUpvotes] = useState(item.engagement.upvotes);

	const config = activityConfig[item.type];
	const ActivityIcon = config.icon;

	const handleUpvote = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsUpvoted(!isUpvoted);
		setUpvotes(isUpvoted ? upvotes - 1 : upvotes + 1);
		onUpvote?.(item.id);
	};

	const handleBookmark = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsBookmarked(!isBookmarked);
		onBookmark?.(item.id);
	};

	// Get href based on content type
	const getHref = () => {
		if (item.siteId) return `/map?focus=${item.siteId}`;
		if (item.mediaId) return `/media/${item.mediaId}`;
		if (item.discussionId) return `/forum?thread=${item.discussionId}`;
		if (item.researchId) return `/research/${item.researchId}`;
		if (item.connectionId) return `/connections/${item.connectionId}`;
		if (item.eventId) return `/events/${item.eventId}`;
		return "#";
	};

	const href = getHref();

	if (variant === "compact") {
		return (
			<article className="group relative flex gap-3 rounded-2xl border border-border/30 bg-[#1a1f26] p-3 transition-all hover:border-border/50 hover:bg-[#1e2430]">
				{/* Activity indicator */}
				<div className={cn("shrink-0 flex h-10 w-10 items-center justify-center rounded-lg", config.bgColor)}>
					<ActivityIcon className={cn("h-5 w-5", config.color)} />
				</div>

				{/* Content */}
				<div className="flex-1 min-w-0">
					{/* Author + Activity Type */}
					<div className="flex items-center gap-2 mb-1">
						<Link href={`/profile/${item.author.username}`} className="flex items-center gap-1.5">
							<Avatar className="h-5 w-5">
								{item.author.avatar && <AvatarImage src={item.author.avatar} />}
								<AvatarFallback className="text-[9px]">
									{item.author.name.slice(0, 2).toUpperCase()}
								</AvatarFallback>
							</Avatar>
							<span className="text-xs font-medium text-foreground">{item.author.name}</span>
							{item.author.isVerified && (
								<CheckCircle2 className="h-3 w-3 text-blue-400 fill-blue-400" />
							)}
							{item.author.isNotable && (
								<Badge variant="secondary" className="h-4 px-1 text-[9px] bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border-0">
									{item.author.badges[0] || "Notable"}
								</Badge>
							)}
						</Link>
						<span className="text-xs text-muted-foreground">•</span>
						<span className="text-xs text-muted-foreground">{getActivityLabel(item.type)}</span>
					</div>

					{/* Title */}
					<Link href={href}>
						<h3 className="text-sm font-semibold leading-snug text-foreground line-clamp-2 group-hover:text-primary transition-colors">
							{item.title}
						</h3>
					</Link>

					{/* Tags */}
					{item.tags.length > 0 && (
						<div className="flex items-center gap-1.5 mt-2">
							{item.tags.slice(0, 3).map((tag) => (
								<Link
									key={tag}
									href={`/tags/${tag}`}
									className="text-[10px] text-muted-foreground hover:text-primary transition-colors"
								>
									#{tag}
								</Link>
							))}
						</div>
					)}

					{/* Footer */}
					<div className="flex items-center justify-between mt-2.5">
						<div className="flex items-center gap-2 text-[11px] text-muted-foreground">
							<span>{timeAgo(item.timestamps.createdAt)}</span>
							{item.engagement.views > 0 && (
								<span className="flex items-center gap-0.5">
									<Eye className="h-3 w-3" />
									{formatNumber(item.engagement.views)}
								</span>
							)}
						</div>
						<div className="flex items-center gap-0.5">
							<Button
								variant="ghost"
								size="sm"
								className={cn("h-6 px-1.5 gap-1 text-[11px]", isUpvoted && "text-primary")}
								onClick={handleUpvote}
							>
								<ArrowUp className={cn("h-3 w-3", isUpvoted && "fill-current")} />
								{formatNumber(upvotes)}
							</Button>
							<Button variant="ghost" size="sm" className="h-6 px-1.5 gap-1 text-[11px]">
								<MessageSquare className="h-3 w-3" />
								{formatNumber(item.engagement.comments)}
							</Button>
							<Button
								variant="ghost"
								size="icon"
								className={cn("h-6 w-6", isBookmarked && "text-primary")}
								onClick={handleBookmark}
							>
								<Bookmark className={cn("h-3 w-3", isBookmarked && "fill-current")} />
							</Button>
						</div>
					</div>
				</div>

				{/* Thumbnail */}
				{item.thumbnail && (
					<Link href={href} className="shrink-0">
						<div className="relative h-20 w-20 overflow-hidden rounded-lg bg-secondary/30">
							<div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20" />
							{item.type === "new_media" && item.contentType === "media" && (
								<div className="absolute inset-0 flex items-center justify-center">
									<div className="flex h-8 w-8 items-center justify-center rounded-full bg-black/60 backdrop-blur-sm">
										<Play className="h-4 w-4 text-white fill-white" />
									</div>
								</div>
							)}
						</div>
					</Link>
				)}
			</article>
		);
	}

	// Default variant
	return (
		<article className="group relative overflow-hidden rounded-2xl border border-border/30 bg-[#1a1f26] transition-all hover:border-border/50 hover:bg-[#1e2430]">
			{/* Thumbnail */}
			{item.thumbnail && (
				<Link href={href} className="block relative aspect-[16/9] overflow-hidden bg-secondary/30">
					<div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20" />
					
					{/* Activity badge */}
					<div className="absolute top-3 left-3 z-10">
						<Badge className={cn("gap-1.5 backdrop-blur-sm border-0", config.bgColor, config.color)}>
							<ActivityIcon className="h-3 w-3" />
							{getActivityLabel(item.type)}
						</Badge>
					</div>

					{/* Play button for videos */}
					{item.type === "new_media" && (
						<div className="absolute inset-0 flex items-center justify-center">
							<div className="flex h-14 w-14 items-center justify-center rounded-full bg-black/60 backdrop-blur-sm transition-transform group-hover:scale-110">
								<Play className="h-6 w-6 text-white fill-white ml-1" />
							</div>
						</div>
					)}

					{/* Velocity indicator for trending content */}
					{item.recentEngagement.upvotesLast24h > 100 && (
						<div className="absolute top-3 right-3 z-10">
							<Badge className="gap-1 bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
								<TrendingUp className="h-3 w-3" />
								Hot
							</Badge>
						</div>
					)}
				</Link>
			)}

			{/* Content */}
			<div className="p-4">
				{/* Author row */}
				<div className="flex items-center justify-between mb-3">
					<Link href={`/profile/${item.author.username}`} className="flex items-center gap-2">
						<Avatar className="h-8 w-8 border border-border/40">
							{item.author.avatar && <AvatarImage src={item.author.avatar} />}
							<AvatarFallback className="text-xs">
								{item.author.name.slice(0, 2).toUpperCase()}
							</AvatarFallback>
						</Avatar>
						<div className="flex flex-col">
							<div className="flex items-center gap-1.5">
								<span className="text-sm font-medium text-foreground">{item.author.name}</span>
								{item.author.isVerified && (
									<CheckCircle2 className="h-3.5 w-3.5 text-blue-400 fill-blue-400" />
								)}
							</div>
							<div className="flex items-center gap-1.5">
								<span className="text-xs text-muted-foreground">@{item.author.username}</span>
								{item.author.isNotable && (
									<Badge variant="secondary" className="h-4 px-1.5 text-[9px] bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border-0">
										{item.author.badges[0] || "Notable"}
									</Badge>
								)}
								{item.author.isExpert && !item.author.isNotable && (
									<Badge variant="secondary" className="h-4 px-1.5 text-[9px] bg-blue-500/20 text-blue-400 border-0">
										Expert
									</Badge>
								)}
							</div>
						</div>
					</Link>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
							>
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="bg-[#1a1f26] border-border/40">
							<DropdownMenuItem>
								<Share2 className="mr-2 h-4 w-4" />
								Share
							</DropdownMenuItem>
							<DropdownMenuItem>
								<ExternalLink className="mr-2 h-4 w-4" />
								Open in new tab
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>

				{/* Title */}
				<Link href={href}>
					<h3 className="text-base font-semibold leading-snug text-foreground line-clamp-2 group-hover:text-primary transition-colors">
						{item.title}
					</h3>
				</Link>

				{/* Excerpt */}
				{item.excerpt && (
					<p className="mt-2 text-sm text-muted-foreground line-clamp-2">
						{item.excerpt}
					</p>
				)}

				{/* Related sites */}
				{item.relatedSites.length > 0 && (
					<div className="flex items-center gap-2 mt-3">
						<Map className="h-3.5 w-3.5 text-muted-foreground" />
						<div className="flex items-center gap-1.5 flex-wrap">
							{item.relatedSites.slice(0, 2).map((siteId) => (
								<Link
									key={siteId}
									href={`/map?focus=${siteId}`}
									className="text-xs text-primary hover:underline"
								>
									{siteId.replace(/-/g, " ")}
								</Link>
							))}
							{item.relatedSites.length > 2 && (
								<span className="text-xs text-muted-foreground">
									+{item.relatedSites.length - 2} more
								</span>
							)}
						</div>
					</div>
				)}

				{/* Tags */}
				{item.tags.length > 0 && (
					<div className="flex items-center gap-2 mt-3 flex-wrap">
						{item.tags.slice(0, 4).map((tag) => (
							<Link
								key={tag}
								href={`/tags/${tag}`}
								className="rounded-full bg-secondary/50 px-2 py-0.5 text-[11px] font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
							>
								#{tag}
							</Link>
						))}
					</div>
				)}

				{/* Footer */}
				<div className="flex items-center justify-between mt-4 pt-3 border-t border-border/20">
					<div className="flex items-center gap-3 text-xs text-muted-foreground">
						<span>{timeAgo(item.timestamps.createdAt)}</span>
						{item.engagement.views > 0 && (
							<span className="flex items-center gap-1">
								<Eye className="h-3 w-3" />
								{formatNumber(item.engagement.views)}
							</span>
						)}
						{item.recentEngagement.upvotesLast24h > 50 && (
							<span className="flex items-center gap-1 text-primary">
								<TrendingUp className="h-3 w-3" />
								+{formatNumber(item.recentEngagement.upvotesLast24h)} today
							</span>
						)}
					</div>

					<div className="flex items-center gap-1">
						<Button
							variant="ghost"
							size="sm"
							className={cn(
								"h-8 px-2.5 gap-1.5 text-xs font-medium rounded-lg",
								isUpvoted
									? "bg-primary/10 text-primary hover:bg-primary/20"
									: "hover:bg-secondary/50"
							)}
							onClick={handleUpvote}
						>
							<ArrowUp className={cn("h-4 w-4", isUpvoted && "fill-current")} />
							{formatNumber(upvotes)}
						</Button>
						<Button
							variant="ghost"
							size="sm"
							className="h-8 px-2.5 gap-1.5 text-xs font-medium rounded-lg hover:bg-secondary/50"
							asChild
						>
							<Link href={`${href}#comments`}>
								<MessageSquare className="h-4 w-4" />
								{formatNumber(item.engagement.comments)}
							</Link>
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className={cn(
								"h-8 w-8 rounded-lg",
								isBookmarked
									? "bg-primary/10 text-primary hover:bg-primary/20"
									: "hover:bg-secondary/50"
							)}
							onClick={handleBookmark}
						>
							<Bookmark className={cn("h-4 w-4", isBookmarked && "fill-current")} />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8 rounded-lg hover:bg-secondary/50"
						>
							<Share2 className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</div>
		</article>
	);
}

