"use client";

import Image from "next/image";
import Link from "next/link";
import { ContentItem } from "@/shared/types/content";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import {
	Heart,
	MessageCircle,
	Bookmark,
	Share2,
	Eye,
	Star,
	FileText,
	Image as ImageIcon,
	Video,
	Youtube,
	File,
	Link as LinkIcon,
	MapPin,
	VerifiedIcon,
} from "lucide-react";
import { timeAgo } from "@/shared/lib/utils";

interface ContentCardProps {
	content: ContentItem;
	variant?: "compact" | "detailed" | "list";
	showStats?: boolean;
	showRelationships?: boolean;
	onLike?: (contentId: string) => void;
	onBookmark?: (contentId: string) => void;
	onComment?: (contentId: string) => void;
	onShare?: (contentId: string) => void;
}

function getContentIcon(type: string) {
	switch (type) {
		case "image":
			return ImageIcon;
		case "video":
			return Video;
		case "youtube":
			return Youtube;
		case "document":
			return File;
		case "text":
			return FileText;
		case "post":
			return FileText;
		case "link":
			return LinkIcon;
		default:
			return FileText;
	}
}

function getThumbnail(content: ContentItem): string | null {
	switch (content.content.type) {
		case "image":
			return content.content.data.thumbnail;
		case "video":
			return content.content.data.thumbnail;
		case "youtube":
			return content.content.data.thumbnail;
		case "link":
			return content.content.data.preview?.image || null;
		case "post":
			return content.content.data.featuredImage || null;
		default:
			return null;
	}
}

export function ContentCard({
	content,
	variant = "detailed",
	showStats = true,
	showRelationships = true,
	onLike,
	onBookmark,
	onComment,
	onShare,
}: ContentCardProps) {
	const ContentIcon = getContentIcon(content.type);
	const thumbnail = getThumbnail(content);

	if (variant === "list") {
		return (
			<div className="flex flex-col gap-3 rounded-lg border border-border/40 bg-card/70 p-3 hover:bg-card/90 transition-colors sm:flex-row sm:gap-4 sm:p-4">
				{/* Thumbnail */}
				{thumbnail && (
					<div className="relative h-40 w-full overflow-hidden rounded-md sm:h-24 sm:w-32 sm:flex-shrink-0">
						<Image src={thumbnail} alt={content.title} fill className="object-cover" sizes="(max-width: 640px) 100vw, 128px" />
						<Badge className="absolute left-2 top-2 bg-black/60 text-xs">{content.type}</Badge>
					</div>
				)}

				{/* Content */}
				<div className="min-w-0 flex-1 space-y-2">
					<div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
						<div className="min-w-0 flex-1">
							<Link href={`/content/${content.id}`} className="hover:underline">
								<h3 className="font-semibold text-foreground line-clamp-2 text-sm sm:text-base sm:line-clamp-1">{content.title}</h3>
							</Link>
							<p className="text-xs text-muted-foreground line-clamp-2 sm:text-sm">{content.description}</p>
						</div>

						<Badge variant={content.verificationStatus === "verified" ? "default" : "secondary"} className="self-start shrink-0 text-xs">
							{content.verificationStatus}
						</Badge>
					</div>

					{/* Metadata */}
					<div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground sm:gap-4">
						<Link href={`/profile/${content.submittedBy.username}`} className="flex items-center gap-1 hover:text-foreground">
							<Avatar className="h-4 w-4">
								<AvatarImage src={content.submittedBy.avatar} />
								<AvatarFallback>{content.submittedBy.displayName[0]}</AvatarFallback>
							</Avatar>
							<span className="truncate max-w-[100px] sm:max-w-none">{content.submittedBy.displayName}</span>
							{content.submittedBy.verificationStatus === "verified" && <VerifiedIcon className="h-3 w-3 text-blue-500" />}
						</Link>

						<span className="hidden sm:inline">•</span>
						<span>{timeAgo(content.createdAt)}</span>

						{content.linkedSites.length > 0 && (
							<>
								<span className="hidden sm:inline">•</span>
								<span className="flex items-center gap-1">
									<MapPin className="h-3 w-3" />
									{content.linkedSites.length} {content.linkedSites.length === 1 ? "site" : "sites"}
								</span>
							</>
						)}
					</div>

					{/* Stats */}
					{showStats && (
						<div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground sm:gap-4">
							<span className="flex items-center gap-1">
								<Heart className="h-3 w-3" />
								{content.stats.likes}
							</span>
							<span className="flex items-center gap-1">
								<MessageCircle className="h-3 w-3" />
								{content.stats.comments}
							</span>
							<span className="flex items-center gap-1">
								<Star className="h-3 w-3" />
								{content.stats.rating.average.toFixed(1)} ({content.stats.rating.count})
							</span>
							<span className="flex items-center gap-1">
								<Eye className="h-3 w-3" />
								{content.stats.views}
							</span>
						</div>
					)}
				</div>
			</div>
		);
	}

	if (variant === "compact") {
		return (
			<Card className="glass-panel border-border/40 overflow-hidden hover:shadow-lg transition-shadow">
				{/* Thumbnail */}
				{thumbnail && (
					<div className="relative h-40 w-full">
						<Image
							src={thumbnail}
							alt={content.title}
							fill
							className="object-cover"
							sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
						/>
						<Badge className="absolute left-3 top-3 bg-black/60 text-xs uppercase tracking-wide">
							<ContentIcon className="mr-1 h-3 w-3" />
							{content.type}
						</Badge>
						{content.verificationStatus === "verified" && (
							<Badge className="absolute right-3 top-3 bg-green-600/80 text-xs">
								<VerifiedIcon className="mr-1 h-3 w-3" />
								Verified
							</Badge>
						)}
					</div>
				)}

				<CardHeader className="space-y-1">
					<Link href={`/content/${content.id}`} className="hover:underline">
						<CardTitle className="text-base font-semibold line-clamp-2">{content.title}</CardTitle>
					</Link>
					<CardDescription className="line-clamp-2">{content.description}</CardDescription>
				</CardHeader>

				<CardContent className="space-y-3">
					{/* Submitter */}
					<Link href={`/profile/${content.submittedBy.username}`} className="flex items-center gap-2 text-sm hover:text-foreground">
						<Avatar className="h-6 w-6">
							<AvatarImage src={content.submittedBy.avatar} />
							<AvatarFallback>{content.submittedBy.displayName[0]}</AvatarFallback>
						</Avatar>
						<span className="text-muted-foreground">{content.submittedBy.displayName}</span>
						{content.submittedBy.verificationStatus === "verified" && <VerifiedIcon className="h-3 w-3 text-blue-500" />}
					</Link>

					{/* Stats */}
					{showStats && (
						<div className="flex items-center gap-3 text-xs text-muted-foreground">
							<span className="flex items-center gap-1">
								<Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
								{content.stats.rating.average.toFixed(1)}
							</span>
							<span className="flex items-center gap-1">
								<MessageCircle className="h-3 w-3" />
								{content.stats.comments}
							</span>
							<span className="flex items-center gap-1">
								<Heart className="h-3 w-3" />
								{content.stats.likes}
							</span>
						</div>
					)}

					{/* Tags */}
					<div className="flex flex-wrap gap-1">
						{content.tags.slice(0, 3).map((tag: string) => (
							<span key={tag} className="rounded-full bg-secondary/40 px-2 py-0.5 text-xs">
								#{tag}
							</span>
						))}
						{content.tags.length > 3 && <span className="rounded-full bg-secondary/40 px-2 py-0.5 text-xs">+{content.tags.length - 3}</span>}
					</div>

					{/* Linked sites */}
					{showRelationships && content.linkedSites.length > 0 && (
						<div className="flex items-center gap-1 text-xs text-muted-foreground">
							<MapPin className="h-3 w-3" />
							<span>
								Linked to {content.linkedSites.length} site{content.linkedSites.length !== 1 ? "s" : ""}
							</span>
						</div>
					)}
				</CardContent>
			</Card>
		);
	}

	// Default: detailed variant
	return (
		<Card className="glass-panel border-border/40 overflow-hidden">
			{/* Thumbnail */}
			{thumbnail && (
				<div className="relative h-56 w-full">
					<Image src={thumbnail} alt={content.title} fill className="object-cover" sizes="(min-width: 1280px) 50vw, 100vw" />
					<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

					<div className="absolute left-4 top-4 flex gap-2">
						<Badge className="bg-black/60 text-xs uppercase tracking-wide">
							<ContentIcon className="mr-1 h-3 w-3" />
							{content.type}
						</Badge>
						{content.verificationStatus === "verified" && (
							<Badge className="bg-green-600/80 text-xs">
								<VerifiedIcon className="mr-1 h-3 w-3" />
								Verified
							</Badge>
						)}
						{content.trustTier && <Badge className="bg-purple-600/80 text-xs uppercase">{content.trustTier}</Badge>}
					</div>

					{/* Rating overlay */}
					{content.stats.rating.count > 0 && (
						<div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-sm backdrop-blur-sm">
							<Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
							<span className="font-semibold text-white">{content.stats.rating.average.toFixed(1)}</span>
							<span className="text-xs text-gray-300">({content.stats.rating.count})</span>
						</div>
					)}
				</div>
			)}

			<CardHeader className="space-y-3">
				<Link href={`/content/${content.id}`} className="hover:underline">
					<CardTitle className="text-xl font-semibold">{content.title}</CardTitle>
				</Link>

				<CardDescription className="line-clamp-3">{content.description}</CardDescription>

				{/* Submitter info */}
				<div className="flex items-center justify-between">
					<Link href={`/profile/${content.submittedBy.username}`} className="flex items-center gap-2 hover:text-foreground">
						<Avatar className="h-8 w-8">
							<AvatarImage src={content.submittedBy.avatar} />
							<AvatarFallback>{content.submittedBy.displayName[0]}</AvatarFallback>
						</Avatar>
						<div className="flex flex-col">
							<span className="text-sm font-medium flex items-center gap-1">
								{content.submittedBy.displayName}
								{content.submittedBy.isVerified && <VerifiedIcon className="inline h-3 w-3 text-blue-500" />}
								{content.submittedBy.role === "expert" && (
									<Badge variant="outline" className="ml-1 text-[10px] h-4 px-1 border-amber-500 text-amber-500">
										Expert
									</Badge>
								)}
							</span>
							<span className="text-xs text-muted-foreground">{timeAgo(content.createdAt)}</span>
						</div>
					</Link>

					{(content.civilization || content.era) && (
						<div className="text-right text-xs text-muted-foreground">
							{content.civilization && <div>{content.civilization}</div>}
							{content.era && <div>{content.era}</div>}
						</div>
					)}
				</div>
			</CardHeader>

			<CardContent className="space-y-4">
				{/* Tags */}
				{content.tags.length > 0 && (
					<div className="flex flex-wrap gap-2">
						{content.tags.map((tag: string) => (
							<Link
								key={tag}
								href={`/content?tag=${tag}`}
								className="rounded-full bg-secondary/40 px-3 py-1 text-xs hover:bg-secondary/60 transition-colors"
							>
								#{tag}
							</Link>
						))}
					</div>
				)}

				{/* Linked sites */}
				{showRelationships && content.linkedSites.length > 0 && (
					<div className="rounded-lg border border-border/40 bg-secondary/20 p-3">
						<div className="flex items-center gap-2 text-sm font-medium mb-2">
							<MapPin className="h-4 w-4" />
							<span>Linked Sites</span>
						</div>
						<div className="flex flex-wrap gap-2">
							{content.linkedSites.map((siteId: string) => (
								<Link key={siteId} href={`/map?site=${siteId}`} className="text-xs text-primary hover:underline">
									{siteId}
								</Link>
							))}
						</div>
					</div>
				)}

				{/* Stats and Actions */}
				<div className="flex items-center justify-between border-t border-border/40 pt-4">
					<div className="flex items-center gap-4 text-sm text-muted-foreground">
						<span className="flex items-center gap-1">
							<Eye className="h-4 w-4" />
							{content.stats.views}
						</span>
						<span className="flex items-center gap-1">
							<Heart className="h-4 w-4" />
							{content.stats.likes}
						</span>
						<span className="flex items-center gap-1">
							<MessageCircle className="h-4 w-4" />
							{content.stats.comments}
						</span>
						<span className="flex items-center gap-1">
							<Bookmark className="h-4 w-4" />
							{content.stats.bookmarks}
						</span>
					</div>

					<div className="flex items-center gap-2">
						{onLike && (
							<Button size="sm" variant="ghost" onClick={() => onLike(content.id)} className="gap-1">
								<Heart className="h-4 w-4" />
							</Button>
						)}
						{onBookmark && (
							<Button size="sm" variant="ghost" onClick={() => onBookmark(content.id)} className="gap-1">
								<Bookmark className="h-4 w-4" />
							</Button>
						)}
						{onComment && (
							<Button size="sm" variant="ghost" onClick={() => onComment(content.id)} className="gap-1">
								<MessageCircle className="h-4 w-4" />
							</Button>
						)}
						{onShare && (
							<Button size="sm" variant="ghost" onClick={() => onShare(content.id)} className="gap-1">
								<Share2 className="h-4 w-4" />
							</Button>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
