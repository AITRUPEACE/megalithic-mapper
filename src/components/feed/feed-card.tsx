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
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu";
import { cn } from "@/shared/lib/utils";

export interface FeedCardProps {
	id: string;
	type: "site" | "post" | "research" | "media" | "discussion" | "connection";
	title: string;
	excerpt?: string;
	thumbnail?: string;
	source?: {
		name: string;
		icon?: string;
		href?: string;
	};
	author: {
		name: string;
		username: string;
		avatar?: string;
		isVerified?: boolean;
	};
	tags?: string[];
	upvotes: number;
	comments: number;
	views?: number;
	readTime?: string;
	publishedAt: string;
	href: string;
	isBookmarked?: boolean;
	isUpvoted?: boolean;
	onUpvote?: (id: string) => void;
	onBookmark?: (id: string) => void;
	variant?: "default" | "compact" | "featured";
}

const typeIcons = {
	site: Map,
	post: FileText,
	research: Users,
	media: ImageIcon,
	discussion: MessageSquare,
	connection: LinkIcon,
};

const typeColors = {
	site: "text-emerald-400",
	post: "text-blue-400",
	research: "text-purple-400",
	media: "text-pink-400",
	discussion: "text-amber-400",
	connection: "text-cyan-400",
};

export function FeedCard({
	id,
	type,
	title,
	excerpt,
	thumbnail,
	source,
	author,
	tags = [],
	upvotes,
	comments,
	views,
	readTime,
	publishedAt,
	href,
	isBookmarked = false,
	isUpvoted = false,
	onUpvote,
	onBookmark,
	variant = "default",
}: FeedCardProps) {
	const [localUpvoted, setLocalUpvoted] = useState(isUpvoted);
	const [localBookmarked, setLocalBookmarked] = useState(isBookmarked);
	const [localUpvotes, setLocalUpvotes] = useState(upvotes);

	const TypeIcon = typeIcons[type];

	const handleUpvote = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setLocalUpvoted(!localUpvoted);
		setLocalUpvotes(localUpvoted ? localUpvotes - 1 : localUpvotes + 1);
		onUpvote?.(id);
	};

	const handleBookmark = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setLocalBookmarked(!localBookmarked);
		onBookmark?.(id);
	};

	if (variant === "compact") {
		return (
			<article className="group relative flex gap-3 rounded-2xl border border-border/30 bg-card p-3 transition-all hover:border-border/50 hover:bg-muted/50">
				{/* Content */}
				<div className="flex-1 min-w-0">
					{/* Source & Type */}
					<div className="flex items-center gap-2 mb-1.5">
						{source && (
							<div className="flex items-center gap-1.5">
								{source.icon ? (
									<Image src={source.icon} alt={source.name} width={16} height={16} className="rounded" />
								) : (
									<TypeIcon className={cn("h-4 w-4", typeColors[type])} />
								)}
								<span className="text-xs text-muted-foreground">{source.name}</span>
							</div>
						)}
					</div>

					{/* Title */}
					<Link href={href}>
						<h3 className="text-sm font-semibold leading-snug text-foreground line-clamp-2 group-hover:text-primary transition-colors">{title}</h3>
					</Link>

					{/* Tags */}
					{tags.length > 0 && (
						<div className="flex items-center gap-1.5 mt-2">
							{tags.slice(0, 3).map((tag) => (
								<Link key={tag} href={`/tags/${tag}`} className="text-[11px] text-muted-foreground hover:text-primary transition-colors">
									#{tag}
								</Link>
							))}
							{tags.length > 3 && <span className="text-[11px] text-muted-foreground">+{tags.length - 3}</span>}
						</div>
					)}

					{/* Footer */}
					<div className="flex items-center justify-between mt-3">
						<div className="flex items-center gap-3 text-xs text-muted-foreground">
							<span>{publishedAt}</span>
							{readTime && (
								<span className="flex items-center gap-1">
									<Clock className="h-3 w-3" />
									{readTime}
								</span>
							)}
						</div>
						<div className="flex items-center gap-1">
							<Button variant="ghost" size="sm" className={cn("h-7 px-2 gap-1 text-xs", localUpvoted && "text-primary")} onClick={handleUpvote}>
								<ArrowUp className={cn("h-3.5 w-3.5", localUpvoted && "fill-current")} />
								{localUpvotes}
							</Button>
							<Button variant="ghost" size="sm" className="h-7 px-2 gap-1 text-xs">
								<MessageSquare className="h-3.5 w-3.5" />
								{comments}
							</Button>
							<Button variant="ghost" size="icon" className={cn("h-7 w-7", localBookmarked && "text-primary")} onClick={handleBookmark}>
								<Bookmark className={cn("h-3.5 w-3.5", localBookmarked && "fill-current")} />
							</Button>
						</div>
					</div>
				</div>

				{/* Thumbnail */}
				{thumbnail && (
					<Link href={href} className="shrink-0">
						<div className="relative h-20 w-20 overflow-hidden rounded-lg bg-secondary/30">
							<Image src={thumbnail} alt={title} fill className="object-cover" />
						</div>
					</Link>
				)}
			</article>
		);
	}

	return (
		<article className="group relative overflow-hidden rounded-2xl border border-border/30 bg-card transition-all hover:border-border/50 hover:bg-muted/50">
			{/* Thumbnail */}
			{thumbnail && (
				<Link href={href} className="block relative aspect-[16/9] overflow-hidden bg-secondary/30">
					<Image src={thumbnail} alt={title} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
					{/* Type badge overlay */}
					<div className="absolute top-3 left-3">
						<Badge className={cn("gap-1 bg-black/60 backdrop-blur-sm border-0", typeColors[type])}>
							<TypeIcon className="h-3 w-3" />
							{type.charAt(0).toUpperCase() + type.slice(1)}
						</Badge>
					</div>
				</Link>
			)}

			{/* Content */}
			<div className="p-4">
				{/* Header: Source + Actions */}
				<div className="flex items-center justify-between mb-3">
					<div className="flex items-center gap-2">
						{source ? (
							<div className="flex items-center gap-2">
								{source.icon ? (
									<Image src={source.icon} alt={source.name} width={20} height={20} className="rounded" />
								) : (
									<div className={cn("flex h-5 w-5 items-center justify-center rounded", "bg-gradient-to-br from-primary/20 to-accent/20")}>
										<TypeIcon className={cn("h-3 w-3", typeColors[type])} />
									</div>
								)}
								<span className="text-xs font-medium text-muted-foreground">{source.name}</span>
							</div>
						) : (
							<Link href={`/profile/${author.username}`} className="flex items-center gap-2">
								<Avatar className="h-5 w-5">
									{author.avatar && <AvatarImage src={author.avatar} />}
									<AvatarFallback className="text-[10px]">{author.name.slice(0, 2).toUpperCase()}</AvatarFallback>
								</Avatar>
								<span className="text-xs font-medium text-muted-foreground">{author.name}</span>
								{author.isVerified && (
									<Badge variant="secondary" className="h-4 px-1 text-[9px]">
										✓
									</Badge>
								)}
							</Link>
						)}
					</div>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="bg-card border-border/40">
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
					<h3 className="text-base font-semibold leading-snug text-foreground line-clamp-2 group-hover:text-primary transition-colors">{title}</h3>
				</Link>

				{/* Excerpt */}
				{excerpt && <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{excerpt}</p>}

				{/* Tags */}
				{tags.length > 0 && (
					<div className="flex items-center gap-2 mt-3 flex-wrap">
						{tags.slice(0, 4).map((tag) => (
							<Link
								key={tag}
								href={`/tags/${tag}`}
								className="rounded-full bg-secondary/50 px-2 py-0.5 text-[11px] font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
							>
								#{tag}
							</Link>
						))}
						{tags.length > 4 && <span className="text-[11px] text-muted-foreground">+{tags.length - 4}</span>}
					</div>
				)}

				{/* Footer */}
				<div className="flex items-center justify-between mt-4 pt-3 border-t border-border/20">
					<div className="flex items-center gap-3 text-xs text-muted-foreground">
						<span>{publishedAt}</span>
						{readTime && (
							<span className="flex items-center gap-1">
								<Clock className="h-3 w-3" />
								{readTime}
							</span>
						)}
						{views !== undefined && (
							<span className="flex items-center gap-1">
								<Eye className="h-3 w-3" />
								{views}
							</span>
						)}
					</div>

					<div className="flex items-center gap-1">
						<Button
							variant="ghost"
							size="sm"
							className={cn(
								"h-8 px-2.5 gap-1.5 text-xs font-medium rounded-lg",
								localUpvoted ? "bg-primary/10 text-primary hover:bg-primary/20" : "hover:bg-secondary/50"
							)}
							onClick={handleUpvote}
						>
							<ArrowUp className={cn("h-4 w-4", localUpvoted && "fill-current")} />
							{localUpvotes}
						</Button>
						<Button variant="ghost" size="sm" className="h-8 px-2.5 gap-1.5 text-xs font-medium rounded-lg hover:bg-secondary/50" asChild>
							<Link href={`${href}#comments`}>
								<MessageSquare className="h-4 w-4" />
								{comments}
							</Link>
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className={cn("h-8 w-8 rounded-lg", localBookmarked ? "bg-primary/10 text-primary hover:bg-primary/20" : "hover:bg-secondary/50")}
							onClick={handleBookmark}
						>
							<Bookmark className={cn("h-4 w-4", localBookmarked && "fill-current")} />
						</Button>
						<Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-secondary/50">
							<Share2 className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</div>
		</article>
	);
}

// Featured card variant for hero sections
export function FeaturedFeedCard(props: FeedCardProps) {
	return (
		<article className="group relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-card to-muted/50">
			<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />

			{/* Background Image */}
			{props.thumbnail && (
				<div className="relative aspect-[21/9] overflow-hidden">
					<Image src={props.thumbnail} alt={props.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
				</div>
			)}

			{/* Content Overlay */}
			<div className="absolute bottom-0 left-0 right-0 z-20 p-6">
				<Badge className="mb-3 bg-primary text-primary-foreground">Featured</Badge>
				<Link href={props.href}>
					<h2 className="text-2xl font-bold text-white leading-tight mb-2 group-hover:text-primary transition-colors">{props.title}</h2>
				</Link>
				{props.excerpt && <p className="text-sm text-white/80 line-clamp-2 mb-4">{props.excerpt}</p>}
				<div className="flex items-center gap-4 text-sm text-white/70">
					<span className="flex items-center gap-1">
						<ArrowUp className="h-4 w-4" />
						{props.upvotes}
					</span>
					<span className="flex items-center gap-1">
						<MessageSquare className="h-4 w-4" />
						{props.comments}
					</span>
					<span>{props.publishedAt}</span>
				</div>
			</div>
		</article>
	);
}
