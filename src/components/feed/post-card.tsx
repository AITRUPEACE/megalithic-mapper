"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUp, MessageSquare, Bookmark, Share2, MapPin } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { cn } from "@/shared/lib/utils";

interface PostAuthor {
	id: string;
	username: string | null;
	full_name: string | null;
	avatar_url: string | null;
	is_verified: boolean;
	role: string;
}

interface Post {
	id: string;
	title: string | null;
	body: string;
	excerpt: string | null;
	tags: string[];
	target_type: string;
	target_id: string | null;
	likes_count: number;
	comments_count: number;
	created_at: string;
	author: PostAuthor | null;
}

interface PostCardProps {
	post: Post;
	onTagClick?: (tag: string) => void;
}

function timeAgo(dateString: string): string {
	const date = new Date(dateString);
	const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

	if (seconds < 60) return "just now";
	if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
	if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
	if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
	return date.toLocaleDateString();
}

// Render post body with clickable hashtags
function renderBodyWithHashtags(body: string, onTagClick?: (tag: string) => void): React.ReactNode {
	const parts = body.split(/(#[\w-]+)/g);
	return parts.map((part, i) => {
		if (part.startsWith("#")) {
			const tag = part.slice(1).toLowerCase();
			return (
				<Link
					key={i}
					href={`/activity?tag=${tag}`}
					onClick={(e) => {
						if (onTagClick) {
							e.preventDefault();
							onTagClick(tag);
						}
					}}
					className="text-primary hover:underline"
				>
					{part}
				</Link>
			);
		}
		return part;
	});
}

export function PostCard({ post, onTagClick }: PostCardProps) {
	const [isLiked, setIsLiked] = useState(false);
	const [likesCount, setLikesCount] = useState(post.likes_count);
	const [isBookmarked, setIsBookmarked] = useState(false);

	const author = post.author;
	const displayName = author?.full_name || author?.username || "Anonymous";
	const initials = displayName.slice(0, 2).toUpperCase();

	const handleLike = (e: React.MouseEvent) => {
		e.preventDefault();
		setIsLiked(!isLiked);
		setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
	};

	const handleBookmark = (e: React.MouseEvent) => {
		e.preventDefault();
		setIsBookmarked(!isBookmarked);
	};

	// Truncate body for display
	const displayBody = post.body.length > 280 ? post.body.slice(0, 280) + "..." : post.body;

	return (
		<article className="group border-b border-border/30 p-4 hover:bg-muted/30 transition-colors">
			<div className="flex gap-3">
				{/* Avatar */}
				<Link href={author ? `/profile/${author.username || author.id}` : "#"} className="shrink-0">
					<Avatar className="h-10 w-10">
						<AvatarImage src={author?.avatar_url || undefined} />
						<AvatarFallback className="text-xs">{initials}</AvatarFallback>
					</Avatar>
				</Link>

				{/* Content */}
				<div className="flex-1 min-w-0">
					{/* Header */}
					<div className="flex items-center gap-1.5 text-sm">
						<Link href={author ? `/profile/${author.username || author.id}` : "#"} className="font-semibold hover:underline truncate">
							{displayName}
						</Link>
						{author?.username && <span className="text-muted-foreground truncate">@{author.username}</span>}
						<span className="text-muted-foreground">·</span>
						<span className="text-muted-foreground shrink-0">{timeAgo(post.created_at)}</span>
					</div>

					{/* Title (if exists) */}
					{post.title && <h3 className="font-semibold mt-1 text-foreground">{post.title}</h3>}

					{/* Body */}
					<p className="mt-1 text-sm text-foreground/90 whitespace-pre-wrap">{renderBodyWithHashtags(displayBody, onTagClick)}</p>

					{/* Linked site badge */}
					{post.target_type === "site" && post.target_id && (
						<Link
							href={`/map?focus=${post.target_id}`}
							className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs hover:bg-primary/20 transition-colors"
						>
							<MapPin className="h-3 w-3" />
							View Site
						</Link>
					)}

					{/* Actions */}
					<div className="flex items-center gap-1 mt-3 -ml-2">
						<Button
							variant="ghost"
							size="sm"
							className={cn("h-8 px-2 gap-1.5 text-xs text-muted-foreground hover:text-primary hover:bg-primary/10", isLiked && "text-primary")}
							onClick={handleLike}
						>
							<ArrowUp className={cn("h-4 w-4", isLiked && "fill-current")} />
							{likesCount > 0 && likesCount}
						</Button>
						<Button variant="ghost" size="sm" className="h-8 px-2 gap-1.5 text-xs text-muted-foreground hover:text-blue-400 hover:bg-blue-400/10">
							<MessageSquare className="h-4 w-4" />
							{post.comments_count > 0 && post.comments_count}
						</Button>
						<Button
							variant="ghost"
							size="sm"
							className={cn("h-8 px-2 text-xs text-muted-foreground hover:text-amber-400 hover:bg-amber-400/10", isBookmarked && "text-amber-400")}
							onClick={handleBookmark}
						>
							<Bookmark className={cn("h-4 w-4", isBookmarked && "fill-current")} />
						</Button>
						<Button variant="ghost" size="sm" className="h-8 px-2 text-xs text-muted-foreground hover:text-emerald-400 hover:bg-emerald-400/10">
							<Share2 className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</div>
		</article>
	);
}
