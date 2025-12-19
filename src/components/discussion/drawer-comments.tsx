"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageSquare, Reply, ChevronRight, ThumbsUp, ThumbsDown, Send } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { cn, timeAgo } from "@/shared/lib/utils";

interface Comment {
	id: string;
	authorName: string;
	authorHandle: string;
	body: string;
	createdAt: string;
	replyCount: number;
	thumbsUp: number;
	thumbsDown: number;
}

interface DrawerCommentsProps {
	siteId: string;
	className?: string;
}

// Mock comments for now - in production these would come from an API
const getMockComments = (siteId: string): Comment[] => {
	// Generate deterministic mock based on siteId
	const hash = siteId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);

	const mockComments: Comment[] = [
		{
			id: `comment-${siteId}-1`,
			authorName: "Aurelia Quispe",
			authorHandle: "aurelia",
			body: "The alignment of the main stones suggests astronomical significance. Has anyone analyzed the solstice angle?",
			createdAt: new Date(Date.now() - (hash % 5) * 86400000).toISOString(),
			replyCount: 3,
			thumbsUp: 12,
			thumbsDown: 1,
		},
		{
			id: `comment-${siteId}-2`,
			authorName: "Marcus Chen",
			authorHandle: "marcus.chen",
			body: "I visited last month and noticed tool marks on the eastern face that aren't documented in the literature.",
			createdAt: new Date(Date.now() - ((hash % 3) + 2) * 86400000).toISOString(),
			replyCount: 1,
			thumbsUp: 8,
			thumbsDown: 0,
		},
		{
			id: `comment-${siteId}-3`,
			authorName: "Laila Okoye",
			authorHandle: "laila.okoye",
			body: "Cross-referencing with similar sites in the region. The construction techniques appear consistent.",
			createdAt: new Date(Date.now() - ((hash % 7) + 1) * 86400000).toISOString(),
			replyCount: 0,
			thumbsUp: 5,
			thumbsDown: 2,
		},
	];

	return mockComments.slice(0, 3);
};

function CommentItem({
	comment,
	onReply,
	onThumbsUp,
	onThumbsDown,
	userVote,
}: {
	comment: Comment;
	onReply: (commentId: string) => void;
	onThumbsUp: (commentId: string) => void;
	onThumbsDown: (commentId: string) => void;
	userVote?: "up" | "down" | null;
}) {
	const initials = comment.authorName
		.split(" ")
		.map((n) => n[0])
		.join("")
		.slice(0, 2);

	return (
		<div className="space-y-2">
			<div className="flex items-start gap-2.5">
				<Avatar className="h-7 w-7 shrink-0">
					<AvatarFallback className="text-[10px] bg-primary/10">{initials}</AvatarFallback>
				</Avatar>
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2">
						<span className="text-xs font-medium truncate">{comment.authorName}</span>
						<span className="text-[10px] text-muted-foreground">@{comment.authorHandle}</span>
						<span className="text-[10px] text-muted-foreground">·</span>
						<span className="text-[10px] text-muted-foreground">{timeAgo(comment.createdAt)}</span>
					</div>
					<p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{comment.body}</p>
				</div>
			</div>
			<div className="flex items-center gap-1 pl-9">
				{/* Thumbs up - shows count */}
				<Button
					variant="ghost"
					size="sm"
					className={cn("h-6 px-1.5 text-[10px] gap-1", userVote === "up" && "text-primary bg-primary/10")}
					onClick={() => onThumbsUp(comment.id)}
				>
					<ThumbsUp className="h-3 w-3" />
					{comment.thumbsUp > 0 && <span>{comment.thumbsUp}</span>}
				</Button>
				{/* Thumbs down - count hidden */}
				<Button
					variant="ghost"
					size="sm"
					className={cn("h-6 px-1.5 text-[10px]", userVote === "down" && "text-destructive bg-destructive/10")}
					onClick={() => onThumbsDown(comment.id)}
				>
					<ThumbsDown className="h-3 w-3" />
				</Button>
				<Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] gap-1" onClick={() => onReply(comment.id)}>
					<Reply className="h-3 w-3" />
					Reply
				</Button>
				{comment.replyCount > 0 && <span className="text-[10px] text-muted-foreground ml-1">{comment.replyCount} replies</span>}
			</div>
		</div>
	);
}

export function DrawerComments({ siteId, className }: DrawerCommentsProps) {
	const [replyingTo, setReplyingTo] = useState<string | null>(null);
	const [newComment, setNewComment] = useState("");
	const [userVotes, setUserVotes] = useState<Record<string, "up" | "down" | null>>({});
	const comments = getMockComments(siteId);

	const handleReply = (commentId: string) => {
		// Toggle reply state - in production this would open a reply composer
		setReplyingTo(replyingTo === commentId ? null : commentId);
	};

	const handleThumbsUp = (commentId: string) => {
		setUserVotes((prev) => ({
			...prev,
			[commentId]: prev[commentId] === "up" ? null : "up",
		}));
	};

	const handleThumbsDown = (commentId: string) => {
		setUserVotes((prev) => ({
			...prev,
			[commentId]: prev[commentId] === "down" ? null : "down",
		}));
	};

	const handleSubmitComment = () => {
		if (!newComment.trim()) return;
		// In production, this would POST to an API
		console.log("New comment:", newComment);
		setNewComment("");
	};

	const handleSubmitReply = () => {
		if (!replyingTo) return;
		// In production, this would POST to an API
		console.log("Reply to:", replyingTo);
		setReplyingTo(null);
	};

	return (
		<div className={cn("space-y-3", className)}>
			{/* New comment input */}
			<div className="flex gap-2">
				<input
					type="text"
					value={newComment}
					onChange={(e) => setNewComment(e.target.value)}
					placeholder="Add a comment..."
					className="flex-1 text-xs bg-background/50 rounded-lg px-3 py-2 border border-border/50 focus:outline-none focus:ring-1 focus:ring-primary"
					onKeyDown={(e) => {
						if (e.key === "Enter" && !e.shiftKey) {
							e.preventDefault();
							handleSubmitComment();
						}
					}}
				/>
				<Button size="sm" className="h-8 px-2.5" onClick={handleSubmitComment} disabled={!newComment.trim()}>
					<Send className="h-3.5 w-3.5" />
				</Button>
			</div>

			{/* Comment list */}
			{comments.length > 0 ? (
				<div className="space-y-3">
					{comments.map((comment) => (
						<CommentItem
							key={comment.id}
							comment={comment}
							onReply={handleReply}
							onThumbsUp={handleThumbsUp}
							onThumbsDown={handleThumbsDown}
							userVote={userVotes[comment.id]}
						/>
					))}
				</div>
			) : (
				<div className="text-center py-4">
					<MessageSquare className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
					<p className="text-xs text-muted-foreground">No comments yet</p>
					<p className="text-[10px] text-muted-foreground mt-0.5">Be the first to start the discussion!</p>
				</div>
			)}

			{/* Reply composer */}
			{replyingTo && (
				<div className="rounded-lg border border-primary/30 bg-primary/5 p-2">
					<p className="text-[10px] text-muted-foreground mb-1.5">Replying to comment...</p>
					<div className="flex gap-2">
						<input
							type="text"
							placeholder="Write a reply..."
							className="flex-1 text-xs bg-background/50 rounded px-2 py-1.5 border border-border/50 focus:outline-none focus:ring-1 focus:ring-primary"
							onKeyDown={(e) => {
								if (e.key === "Enter" && !e.shiftKey) {
									e.preventDefault();
									handleSubmitReply();
								}
							}}
						/>
						<Button size="sm" className="h-7 text-xs" onClick={handleSubmitReply}>
							Post
						</Button>
					</div>
				</div>
			)}

			{/* Go to full discussion */}
			<Button variant="outline" size="sm" className="w-full" asChild>
				<Link href={`/forum?site=${siteId}`}>
					Go to Full Discussion
					<ChevronRight className="h-3.5 w-3.5 ml-1" />
				</Link>
			</Button>
		</div>
	);
}
