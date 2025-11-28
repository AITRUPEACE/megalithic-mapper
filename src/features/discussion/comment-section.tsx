"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import { MessageSquare, ThumbsUp, Flag } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { FeedComment } from "@/shared/types/content";

interface CommentSectionProps {
	comments: FeedComment[];
}

export function CommentSection({ comments: initialComments }: CommentSectionProps) {
	const [comments, setComments] = useState(initialComments);
	const [newComment, setNewComment] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!newComment.trim()) return;

		const comment: FeedComment = {
			id: Math.random().toString(),
			postId: "current",
			author: {
				id: "me",
				username: "explorer_one",
				displayName: "Explorer One",
				isVerified: false,
			},
			content: newComment,
			timestamp: new Date().toISOString(),
			likes: 0,
			replies: [],
		};

		setComments([comment, ...comments]);
		setNewComment("");
	};

	return (
		<div className="space-y-6">
			<h3 className="text-lg font-semibold flex items-center gap-2">
				<MessageSquare className="h-5 w-5" />
				Discussion ({comments.length})
			</h3>

			{/* Comment Input */}
			<form onSubmit={handleSubmit} className="flex gap-4">
				<Avatar className="h-10 w-10">
					<AvatarFallback>ME</AvatarFallback>
				</Avatar>
				<div className="flex-1 gap-2 space-y-2">
					<Textarea
						placeholder="Add to the discussion..."
						value={newComment}
						onChange={(e) => setNewComment(e.target.value)}
						className="min-h-[80px] bg-background/50"
					/>
					<div className="flex justify-end">
						<Button type="submit" size="sm" disabled={!newComment.trim()}>
							Post Comment
						</Button>
					</div>
				</div>
			</form>

			{/* Comment List */}
			<div className="space-y-6">
				{comments.map((comment) => (
					<CommentItem key={comment.id} comment={comment} />
				))}
			</div>
		</div>
	);
}

function CommentItem({ comment, isReply = false }: { comment: FeedComment; isReply?: boolean }) {
	const [isReplying, setIsReplying] = useState(false);
	const [replyText, setReplyText] = useState("");
	const [likes, setLikes] = useState(comment.likes);
	const [hasLiked, setHasLiked] = useState(false);

	const handleLike = () => {
		if (hasLiked) {
			setLikes(likes - 1);
			setHasLiked(false);
		} else {
			setLikes(likes + 1);
			setHasLiked(true);
		}
	};

	return (
		<div className={cn("group flex gap-3", isReply && "ml-12 relative")}>
			{isReply && <div className="absolute -left-8 top-0 h-8 w-8 border-b-2 border-l-2 border-border/30 rounded-bl-xl" />}

			<Avatar className="h-8 w-8 mt-1">
				<AvatarImage src={comment.author.avatarUrl} />
				<AvatarFallback>{comment.author.username[0].toUpperCase()}</AvatarFallback>
			</Avatar>

			<div className="flex-1 space-y-1">
				<div className="flex items-center gap-2 text-sm">
					<span className="font-semibold text-foreground">{comment.author.displayName}</span>
					<span className="text-xs text-muted-foreground">@{comment.author.username}</span>
					<span className="text-xs text-muted-foreground">• 2h ago</span>
				</div>

				<div className="text-sm leading-relaxed text-foreground/90">{comment.content}</div>

				<div className="flex items-center gap-4 pt-1">
					<button
						onClick={handleLike}
						className={cn(
							"flex items-center gap-1.5 text-xs font-medium transition-colors",
							hasLiked ? "text-primary" : "text-muted-foreground hover:text-foreground"
						)}
					>
						<ThumbsUp className="h-3.5 w-3.5" />
						{likes > 0 && likes}
					</button>

					<button
						onClick={() => setIsReplying(!isReplying)}
						className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
					>
						Reply
					</button>

					<button className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive">
						<Flag className="h-3.5 w-3.5" />
					</button>
				</div>

				{isReplying && (
					<div className="mt-3 flex gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
						<div className="flex-1 space-y-2">
							<Textarea
								placeholder={`Reply to @${comment.author.username}...`}
								value={replyText}
								onChange={(e) => setReplyText(e.target.value)}
								className="min-h-[60px] text-sm bg-background/50"
								autoFocus
							/>
							<div className="flex justify-end gap-2">
								<Button size="sm" variant="ghost" onClick={() => setIsReplying(false)}>
									Cancel
								</Button>
								<Button size="sm" disabled={!replyText.trim()}>
									Reply
								</Button>
							</div>
						</div>
					</div>
				)}

				{/* Nested Replies */}
				{comment.replies && comment.replies.length > 0 && (
					<div className="mt-4 space-y-4">
						{comment.replies.map((reply) => (
							<CommentItem key={reply.id} comment={reply} isReply />
						))}
					</div>
				)}
			</div>
		</div>
	);
}
