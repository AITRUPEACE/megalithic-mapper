"use client";

import { useState } from "react";
import Link from "next/link";
import { Comment as CommentType } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Flag, MoreHorizontal, VerifiedIcon } from "lucide-react";
import { timeAgo } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface CommentProps {
	comment: CommentType;
	depth?: number;
	onReply?: (commentId: string, body: string) => void;
	onLike?: (commentId: string) => void;
	onFlag?: (commentId: string) => void;
	onEdit?: (commentId: string, body: string) => void;
	onDelete?: (commentId: string) => void;
	currentUserId?: string;
}

function Comment({ comment, depth = 0, onReply, onLike, onFlag, onEdit, onDelete, currentUserId }: CommentProps) {
	const [isReplying, setIsReplying] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [replyText, setReplyText] = useState("");
	const [editText, setEditText] = useState(comment.body);
	const maxDepth = 3;

	const handleReply = () => {
		if (replyText.trim() && onReply) {
			onReply(comment.id, replyText);
			setReplyText("");
			setIsReplying(false);
		}
	};

	const handleEdit = () => {
		if (editText.trim() && onEdit) {
			onEdit(comment.id, editText);
			setIsEditing(false);
		}
	};

	const isAuthor = currentUserId === comment.author.userId;

	if (comment.isDeleted) {
		return (
			<div className={`rounded-lg border border-border/40 bg-secondary/10 p-4 ${depth > 0 ? "ml-8" : ""}`}>
				<p className="text-sm italic text-muted-foreground">[deleted]</p>
			</div>
		);
	}

	return (
		<div className={`space-y-3 ${depth > 0 ? "ml-8" : ""}`}>
			<div className="rounded-lg border border-border/40 bg-card/70 p-4 hover:bg-card/90 transition-colors">
				{/* Comment Header */}
				<div className="flex items-start justify-between gap-3 mb-3">
					<div className="flex items-center gap-2">
						<Link href={`/profile/${comment.author.username}`}>
							<Avatar className="h-8 w-8">
								<AvatarImage src={comment.author.avatar} />
								<AvatarFallback>{comment.author.displayName[0]}</AvatarFallback>
							</Avatar>
						</Link>
						<div>
							<Link href={`/profile/${comment.author.username}`} className="flex items-center gap-1 text-sm font-medium hover:underline">
								{comment.author.displayName}
								{comment.author.verificationStatus === "verified" && <VerifiedIcon className="h-3 w-3 text-blue-500" />}
							</Link>
							<div className="flex items-center gap-2 text-xs text-muted-foreground">
								<span>{timeAgo(comment.createdAt)}</span>
								{comment.isEdited && <span>• edited</span>}
							{comment.flagCount > 0 && (
								<Badge variant="warning" className="text-xs h-4 px-1">
									{comment.flagCount} flags
								</Badge>
							)}
							</div>
						</div>
					</div>

					{/* Actions Menu */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="sm" className="h-8 w-8 p-0">
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							{isAuthor && !isEditing && (
								<>
									<DropdownMenuItem onClick={() => setIsEditing(true)}>Edit</DropdownMenuItem>
									<DropdownMenuItem onClick={() => onDelete?.(comment.id)} className="text-destructive">
										Delete
									</DropdownMenuItem>
								</>
							)}
							{!isAuthor && (
								<DropdownMenuItem onClick={() => onFlag?.(comment.id)}>
									<Flag className="mr-2 h-4 w-4" />
									Report
								</DropdownMenuItem>
							)}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>

				{/* Comment Body */}
				{isEditing ? (
					<div className="space-y-2">
						<Textarea value={editText} onChange={(e) => setEditText(e.target.value)} className="min-h-[80px]" />
						<div className="flex gap-2">
							<Button size="sm" onClick={handleEdit}>
								Save
							</Button>
							<Button
								size="sm"
								variant="outline"
								onClick={() => {
									setIsEditing(false);
									setEditText(comment.body);
								}}
							>
								Cancel
							</Button>
						</div>
					</div>
				) : (
					<p className="text-sm text-foreground whitespace-pre-wrap">{comment.body}</p>
				)}

				{/* Comment Actions */}
				<div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/40">
					<Button variant="ghost" size="sm" onClick={() => onLike?.(comment.id)} className="gap-1 h-8">
						<Heart className="h-3 w-3" />
						<span className="text-xs">{comment.likes}</span>
					</Button>

					{depth < maxDepth && onReply && (
						<Button variant="ghost" size="sm" onClick={() => setIsReplying(!isReplying)} className="gap-1 h-8">
							<MessageCircle className="h-3 w-3" />
							<span className="text-xs">Reply</span>
						</Button>
					)}

					{comment.replyCount > 0 && (
						<span className="text-xs text-muted-foreground">
							{comment.replyCount} {comment.replyCount === 1 ? "reply" : "replies"}
						</span>
					)}
				</div>
			</div>

			{/* Reply Form */}
			{isReplying && (
				<div className="ml-8 space-y-2">
					<Textarea placeholder="Write a reply..." value={replyText} onChange={(e) => setReplyText(e.target.value)} className="min-h-[80px]" />
					<div className="flex gap-2">
						<Button size="sm" onClick={handleReply} disabled={!replyText.trim()}>
							Reply
						</Button>
						<Button
							size="sm"
							variant="outline"
							onClick={() => {
								setIsReplying(false);
								setReplyText("");
							}}
						>
							Cancel
						</Button>
					</div>
				</div>
			)}

			{/* Nested Replies */}
			{comment.replies.length > 0 && (
				<div className="space-y-3">
					{comment.replies.map((reply) => (
						<Comment
							key={reply.id}
							comment={reply}
							depth={depth + 1}
							onReply={onReply}
							onLike={onLike}
							onFlag={onFlag}
							onEdit={onEdit}
							onDelete={onDelete}
							currentUserId={currentUserId}
						/>
					))}
				</div>
			)}
		</div>
	);
}

interface CommentThreadProps {
	comments: CommentType[];
	onAddComment?: (body: string) => void;
	onReply?: (commentId: string, body: string) => void;
	onLike?: (commentId: string) => void;
	onFlag?: (commentId: string) => void;
	onEdit?: (commentId: string, body: string) => void;
	onDelete?: (commentId: string) => void;
	currentUserId?: string;
	isLoading?: boolean;
}

export function CommentThread({
	comments,
	onAddComment,
	onReply,
	onLike,
	onFlag,
	onEdit,
	onDelete,
	currentUserId,
	isLoading = false,
}: CommentThreadProps) {
	const [newComment, setNewComment] = useState("");

	const handleAddComment = () => {
		if (newComment.trim() && onAddComment) {
			onAddComment(newComment);
			setNewComment("");
		}
	};

	return (
		<div className="space-y-6">
			{/* New Comment Form */}
			{onAddComment && (
				<div className="space-y-3">
					<h3 className="text-lg font-semibold">Add a comment</h3>
					<Textarea
						placeholder="Share your thoughts..."
						value={newComment}
						onChange={(e) => setNewComment(e.target.value)}
						className="min-h-[120px]"
					/>
					<Button onClick={handleAddComment} disabled={!newComment.trim() || isLoading}>
						Post Comment
					</Button>
				</div>
			)}

			{/* Comments List */}
			<div className="space-y-3">
				<h3 className="text-lg font-semibold">Comments {comments.length > 0 && `(${comments.length})`}</h3>

				{comments.length === 0 ? (
					<div className="text-center py-8 text-muted-foreground">
						<MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
						<p>No comments yet. Be the first to share your thoughts!</p>
					</div>
				) : (
					<div className="space-y-4">
						{comments.map((comment) => (
							<Comment
								key={comment.id}
								comment={comment}
								onReply={onReply}
								onLike={onLike}
								onFlag={onFlag}
								onEdit={onEdit}
								onDelete={onDelete}
								currentUserId={currentUserId}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
