"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
	X,
	ExternalLink,
	MapPin,
	MessageSquare,
	ThumbsUp,
	Eye,
	Play,
	Image as ImageIcon,
	Video,
	BookOpen,
	Link2,
	Calendar,
	Users,
	Share2,
	Bookmark,
	Flag,
	Loader2,
	Clock,
	ChevronRight,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Separator } from "@/shared/ui/separator";
import { cn, timeAgo } from "@/shared/lib/utils";
import { zClass } from "@/shared/lib/z-index";

// Activity/contribution types (matching home-feed.tsx)
type ContributionType =
	| "new_photos"
	| "new_video"
	| "research_update"
	| "site_update"
	| "expert_post"
	| "connection_found"
	| "event_announcement";

interface FeedItemAuthor {
	name: string;
	username: string;
	avatar?: string;
	isVerified?: boolean;
	badge?: string;
}

interface FeedItemEngagement {
	upvotes: number;
	comments: number;
	views: number;
}

interface FeedItemMedia {
	type: "image" | "video" | "youtube";
	thumbnail?: string;
	count?: number;
}

interface FeedItemExternalLink {
	url: string;
	domain: string;
}

// Source type for official vs community content
export type SourceType = "official" | "community" | "system";

// Change type for specific activity labels
export type ChangeType = 
	| "new_site" | "site_verified" | "video_added" | "photos_added" 
	| "document_added" | "description_updated" 
	| "coordinates_updated" | "metadata_updated" | "trending" 
	| "milestone" | "post_created" | "research_published" 
	| "event_announced" | "connection_proposed";

export interface FeedItem {
	id: string;
	type: ContributionType;
	siteId?: string;
	siteName?: string;
	siteLocation?: string;
	title: string;
	description: string;
	author: FeedItemAuthor;
	timestamp: Date;
	engagement: FeedItemEngagement;
	media?: FeedItemMedia;
	tags: string[];
	externalLink?: FeedItemExternalLink;
	// New fields for enhanced activity tracking
	sourceType?: SourceType;         // official, community, system
	changeType?: ChangeType;         // Specific type of change
	changeMagnitude?: number;        // 0-100, importance ranking
	mediaCount?: number;             // For "X photos added" labels
}

interface ActivityDetailDrawerProps {
	item: FeedItem | null;
	isOpen: boolean;
	onClose: () => void;
	onFocusSite?: (siteId: string) => void;
	className?: string;
}

// Human-readable labels for change types
const CHANGE_LABELS: Record<ChangeType, string> = {
	new_site: "New site",
	site_verified: "Verified",
	video_added: "Video added",
	document_added: "Document added",
	photos_added: "Photos added",
	description_updated: "Description updated",
	coordinates_updated: "Location corrected",
	metadata_updated: "Details updated",
	trending: "Trending",
	milestone: "Milestone",
	post_created: "New discussion",
	research_published: "Research published",
	event_announced: "Event announced",
	connection_proposed: "Connection discovered",
};

// Get a descriptive label for activity, using changeType when available
export function getActivityLabel(item: FeedItem): string {
	if (item.changeType) {
		const label = CHANGE_LABELS[item.changeType];
		// Add count for photos
		if (item.changeType === "photos_added" && item.mediaCount && item.mediaCount > 1) {
			return `${item.mediaCount} photos added`;
		}
		return label || item.type.replace(/_/g, " ");
	}
	return typeConfig[item.type]?.label || item.type.replace(/_/g, " ");
}

const typeConfig: Record<
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
		label: "Research Update",
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
		label: "Expert Post",
	},
	connection_found: {
		icon: Link2,
		color: "text-amber-400",
		bg: "bg-amber-500/20",
		label: "Connection Found",
	},
	event_announcement: {
		icon: Calendar,
		color: "text-cyan-400",
		bg: "bg-cyan-500/20",
		label: "Event",
	},
};

// Mock related items
function getRelatedItems(item: FeedItem): FeedItem[] {
	if (!item.siteId) return [];
	return [
		{
			id: `related-1-${item.id}`,
			type: "new_photos",
			siteId: item.siteId,
			siteName: item.siteName,
			title: "12 new HD photos added",
			description: "High resolution aerial photography from drone survey",
			author: { name: "Maria S.", username: "maria_arch", isVerified: true },
			timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
			engagement: { upvotes: 156, comments: 12, views: 890 },
			tags: ["photography", "aerial"],
		},
		{
			id: `related-2-${item.id}`,
			type: "research_update",
			siteId: item.siteId,
			siteName: item.siteName,
			title: "Acoustic analysis results",
			description: "New resonance frequency measurements from chamber interior",
			author: { name: "Dr. Chen", username: "dr_chen", isVerified: true, badge: "Researcher" },
			timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
			engagement: { upvotes: 234, comments: 45, views: 1200 },
			tags: ["acoustics", "research"],
		},
	];
}

// Mock comments
interface Comment {
	id: string;
	author: FeedItemAuthor;
	content: string;
	timestamp: Date;
	likes: number;
}

function getMockComments(itemId: string): Comment[] {
	return [
		{
			id: `comment-1-${itemId}`,
			author: { name: "Alex R.", username: "stellar_arch", isVerified: false },
			content: "Incredible find! The precision here is remarkable. Have you compared this with the measurements from Puma Punku?",
			timestamp: new Date(Date.now() - 30 * 60 * 1000),
			likes: 12,
		},
		{
			id: `comment-2-${itemId}`,
			author: { name: "Dr. Santos", username: "santos_geo", isVerified: true, badge: "Expert" },
			content: "The tool marks visible in the third image are particularly interesting. This deserves a more detailed geological analysis.",
			timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
			likes: 28,
		},
		{
			id: `comment-3-${itemId}`,
			author: { name: "Maya L.", username: "maya_explorer" },
			content: "I visited this site last month. Happy to share more photos if anyone is interested!",
			timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
			likes: 8,
		},
	];
}

export function ActivityDetailDrawer({
	item,
	isOpen,
	onClose,
	onFocusSite,
	className,
}: ActivityDetailDrawerProps) {
	const [isLoading, setIsLoading] = useState(true);
	const [isUpvoted, setIsUpvoted] = useState(false);
	const [isBookmarked, setIsBookmarked] = useState(false);
	const [comments, setComments] = useState<Comment[]>([]);
	const [relatedItems, setRelatedItems] = useState<FeedItem[]>([]);

	// Simulate loading delay for realistic feel
	useEffect(() => {
		if (isOpen && item) {
			setIsLoading(true);
			const timer = setTimeout(() => {
				setComments(getMockComments(item.id));
				setRelatedItems(getRelatedItems(item));
				setIsLoading(false);
			}, 300);
			return () => clearTimeout(timer);
		}
	}, [isOpen, item?.id]);

	// Close on escape key
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		if (isOpen) {
			document.addEventListener("keydown", handleKeyDown);
			return () => document.removeEventListener("keydown", handleKeyDown);
		}
	}, [isOpen, onClose]);

	if (!item) return null;

	const config = typeConfig[item.type];
	const TypeIcon = config.icon;

	return (
		<AnimatePresence>
			{isOpen && (
				<>
					{/* Backdrop */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
						className={cn(
							"fixed inset-0 bg-black/40 backdrop-blur-sm lg:hidden",
							zClass.modalBackdrop
						)}
						onClick={onClose}
					/>

					{/* Panel */}
					<motion.div
						initial={{ x: "100%" }}
						animate={{ x: 0 }}
						exit={{ x: "100%" }}
						transition={{ type: "spring", damping: 25, stiffness: 300 }}
						className={cn(
							"fixed right-0 top-0 h-full w-full max-w-lg border-l border-border/40 bg-[#0e1217] shadow-2xl",
							zClass.modal,
							"lg:w-[480px]",
							className
						)}
					>
						{/* Header */}
						<div className="flex items-start justify-between gap-3 border-b border-border/40 p-4">
							<div className="flex items-center gap-3">
								<div className={cn("rounded-lg p-2", config.bg)}>
									<TypeIcon className={cn("h-5 w-5", config.color)} />
								</div>
								<div>
									<Badge variant="outline" className="text-xs mb-1">
										{config.label}
									</Badge>
									<div className="flex items-center gap-2 text-xs text-muted-foreground">
										<Clock className="h-3 w-3" />
										{timeAgo(item.timestamp)}
									</div>
								</div>
							</div>
							<Button
								size="icon"
								variant="ghost"
								className="shrink-0 h-8 w-8"
								onClick={onClose}
							>
								<X className="h-4 w-4" />
							</Button>
						</div>

						{/* Loading State */}
						{isLoading ? (
							<div className="flex flex-col items-center justify-center h-[calc(100%-200px)]">
								<Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
								<p className="text-sm text-muted-foreground">Loading details...</p>
							</div>
						) : (
							<ScrollArea className="h-[calc(100%-180px)]">
								<div className="p-4 space-y-5">
									{/* Author Section */}
									<div className="flex items-center gap-3">
										<Avatar className="h-11 w-11 border border-border/40">
											<AvatarImage src={item.author.avatar} />
											<AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20">
												{item.author.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
											</AvatarFallback>
										</Avatar>
										<div className="flex-1">
											<div className="flex items-center gap-2">
												<span className="font-semibold text-sm">{item.author.name}</span>
												{item.author.isVerified && (
													<Badge variant="secondary" className="h-4 px-1 text-[9px] bg-blue-500/20 text-blue-400">
														✓
													</Badge>
												)}
												{item.author.badge && (
													<Badge variant="outline" className="h-4 px-1.5 text-[9px] border-primary/40 text-primary">
														{item.author.badge}
													</Badge>
												)}
											</div>
											<p className="text-xs text-muted-foreground">@{item.author.username}</p>
										</div>
										<Button variant="outline" size="sm" className="h-8 text-xs">
											Follow
										</Button>
									</div>

									{/* Site Reference */}
									{item.siteName && (
										<button
											onClick={() => item.siteId && onFocusSite?.(item.siteId)}
											className="flex items-center gap-2 w-full p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors text-left"
										>
											<MapPin className="h-4 w-4 text-emerald-400" />
											<div className="flex-1 min-w-0">
												<p className="text-sm font-medium truncate">{item.siteName}</p>
												{item.siteLocation && (
													<p className="text-xs text-muted-foreground">{item.siteLocation}</p>
												)}
											</div>
											<ChevronRight className="h-4 w-4 text-muted-foreground" />
										</button>
									)}

									{/* Title & Description */}
									<div>
										<h2 className="text-lg font-semibold leading-tight mb-2">{item.title}</h2>
										<p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
									</div>

									{/* Media Preview */}
									{item.media && (
										<div className="relative aspect-video w-full rounded-xl overflow-hidden bg-muted/30">
											{item.media.type === "youtube" ? (
												<div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-red-900/40 to-red-950/60 cursor-pointer hover:from-red-900/50 hover:to-red-950/70 transition-colors">
													<div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600 shadow-lg hover:bg-red-500 transition-colors">
														<Play className="h-7 w-7 text-white ml-1" />
													</div>
												</div>
											) : item.media.type === "image" && item.media.count ? (
												<div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-pink-900/30 to-pink-950/50">
													<div className="text-center">
														<ImageIcon className="h-12 w-12 text-pink-400 mx-auto mb-2" />
														<span className="text-lg font-medium text-pink-300">
															{item.media.count} photos
														</span>
														<p className="text-xs text-pink-400/80 mt-1">Click to view gallery</p>
													</div>
												</div>
											) : null}
										</div>
									)}

									{/* External Link */}
									{item.externalLink && (
										<a
											href={item.externalLink.url}
											target="_blank"
											rel="noopener noreferrer"
											className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
										>
											<ExternalLink className="h-4 w-4 text-muted-foreground" />
											<div className="flex-1 min-w-0">
												<p className="text-sm font-medium truncate">{item.externalLink.domain}</p>
												<p className="text-xs text-muted-foreground truncate">{item.externalLink.url}</p>
											</div>
										</a>
									)}

									{/* Tags */}
									{item.tags.length > 0 && (
										<div className="flex flex-wrap gap-2">
											{item.tags.map((tag) => (
												<span
													key={tag}
													className="text-xs text-primary hover:underline cursor-pointer"
												>
													#{tag}
												</span>
											))}
										</div>
									)}

									{/* Engagement Stats */}
									<div className="flex items-center gap-4 py-3 border-y border-border/30">
										<button
											onClick={() => setIsUpvoted(!isUpvoted)}
											className={cn(
												"flex items-center gap-1.5 transition-colors",
												isUpvoted ? "text-primary" : "text-muted-foreground hover:text-foreground"
											)}
										>
											<ThumbsUp className={cn("h-4 w-4", isUpvoted && "fill-current")} />
											<span className="text-sm font-medium">
												{item.engagement.upvotes + (isUpvoted ? 1 : 0)}
											</span>
										</button>
										<button className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
											<MessageSquare className="h-4 w-4" />
											<span className="text-sm font-medium">{item.engagement.comments}</span>
										</button>
										<span className="flex items-center gap-1.5 text-muted-foreground">
											<Eye className="h-4 w-4" />
											<span className="text-sm">
												{item.engagement.views > 1000
													? `${(item.engagement.views / 1000).toFixed(1)}K`
													: item.engagement.views}
											</span>
										</span>
										<div className="flex-1" />
										<button
											onClick={() => setIsBookmarked(!isBookmarked)}
											className={cn(
												"p-1.5 rounded transition-colors",
												isBookmarked
													? "text-primary bg-primary/10"
													: "text-muted-foreground hover:text-foreground"
											)}
										>
											<Bookmark className={cn("h-4 w-4", isBookmarked && "fill-current")} />
										</button>
										<button className="p-1.5 rounded text-muted-foreground hover:text-foreground">
											<Share2 className="h-4 w-4" />
										</button>
									</div>

									{/* Comments Section */}
									<div className="space-y-3">
										<h3 className="text-sm font-semibold">
											Comments ({comments.length})
										</h3>
										{comments.map((comment) => (
											<div key={comment.id} className="flex gap-3">
												<Avatar className="h-8 w-8 shrink-0">
													<AvatarFallback className="text-xs bg-secondary">
														{comment.author.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
													</AvatarFallback>
												</Avatar>
												<div className="flex-1 min-w-0">
													<div className="flex items-center gap-2">
														<span className="text-xs font-medium">{comment.author.name}</span>
														{comment.author.isVerified && (
															<Badge variant="secondary" className="h-3.5 px-1 text-[8px] bg-blue-500/20 text-blue-400">
																✓
															</Badge>
														)}
														<span className="text-[10px] text-muted-foreground">
															{timeAgo(comment.timestamp)}
														</span>
													</div>
													<p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
														{comment.content}
													</p>
													<div className="flex items-center gap-3 mt-1.5">
														<button className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1">
															<ThumbsUp className="h-3 w-3" />
															{comment.likes}
														</button>
														<button className="text-[10px] text-muted-foreground hover:text-foreground">
															Reply
														</button>
													</div>
												</div>
											</div>
										))}
										<Button variant="ghost" size="sm" className="w-full text-xs mt-2">
											View all comments
											<ChevronRight className="h-3 w-3 ml-1" />
										</Button>
									</div>

									{/* Related Activity */}
									{relatedItems.length > 0 && (
										<>
											<Separator className="bg-border/30" />
											<div className="space-y-3">
												<h3 className="text-sm font-semibold">More from this site</h3>
												{relatedItems.map((related) => {
													const relatedConfig = typeConfig[related.type];
													const RelatedIcon = relatedConfig.icon;
													return (
														<div
															key={related.id}
															className="flex items-start gap-3 p-2 rounded-lg hover:bg-secondary/30 cursor-pointer transition-colors"
														>
															<div className={cn("rounded p-1.5 shrink-0", relatedConfig.bg)}>
																<RelatedIcon className={cn("h-3.5 w-3.5", relatedConfig.color)} />
															</div>
															<div className="flex-1 min-w-0">
																<p className="text-sm font-medium truncate">{related.title}</p>
																<p className="text-xs text-muted-foreground">
																	{timeAgo(related.timestamp)} · {related.engagement.upvotes} upvotes
																</p>
															</div>
														</div>
													);
												})}
											</div>
										</>
									)}
								</div>
							</ScrollArea>
						)}

						{/* Footer Actions */}
						<div className="absolute bottom-0 left-0 right-0 border-t border-border/40 bg-[#0e1217] p-4">
							<div className="flex gap-2">
								{item.siteId && (
									<Button
										variant="default"
										className="flex-1"
										onClick={() => onFocusSite?.(item.siteId!)}
									>
										<MapPin className="h-4 w-4 mr-2" />
										View on Map
									</Button>
								)}
								<Button variant="outline" className="flex-1" asChild>
									<Link href={item.externalLink?.url || `/activity/${item.id}`}>
										{item.externalLink ? (
											<>
												<ExternalLink className="h-4 w-4 mr-2" />
												Open Source
											</>
										) : (
											<>
												<MessageSquare className="h-4 w-4 mr-2" />
												Join Discussion
											</>
										)}
									</Link>
								</Button>
							</div>
							{/* Report button */}
							<button className="flex items-center justify-center gap-1 w-full mt-2 text-xs text-muted-foreground hover:text-foreground">
								<Flag className="h-3 w-3" />
								Report this content
							</button>
						</div>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
}

