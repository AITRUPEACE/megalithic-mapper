"use client";

import { notFound } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { ArrowLeft, ThumbsUp, Share2, ExternalLink, Calendar } from "lucide-react";
import Link from "next/link";
import { CommentSection } from "@/features/discussion/comment-section";
import type { FeedPost, FeedComment } from "@/shared/types/content";

// Mock Data (would come from API)
const MOCK_POST: FeedPost = {
	id: "1",
	type: "official",
	author: {
		id: "u1",
		username: "dr_hawass",
		displayName: "Dr. Zahi Hawass",
		isVerified: true,
		title: "Egyptologist",
		avatarUrl: "https://github.com/shadcn.png",
	},
	title: "New GPR Scan Results from KV62 Area C",
	content: `We have completed the latest ground-penetrating radar (GPR) scans of the area north of Tutankhamun's tomb (KV62). The preliminary data suggests a void consistent with a corridor, approximately 2 meters wide and extending 10 meters north.

This aligns with the hypothesis of a hidden chamber adjacent to the burial chamber. The thermal scanning performed last year also indicated a temperature anomaly in this exact sector.

Our team will be conducting further non-invasive tests next week before proposing any drilling. We must be absolutely certain to preserve the integrity of the paintings on the North Wall.

Full technical report is available on my Substack.`,
	timestamp: "2024-11-21T10:00:00Z",
	externalLink: {
		url: "https://substack.com",
		title: "Read the full preliminary report",
		domain: "substack.com",
	},
	likes: 1240,
	commentsCount: 86,
	shares: 45,
	tags: ["Egypt", "ValleyOfTheKings", "Radar", "Discovery"],
};

const MOCK_COMMENTS: FeedComment[] = [
	{
		id: "c1",
		postId: "1",
		author: {
			id: "u4",
			username: "archaeo_student",
			displayName: "Alex Chen",
			isVerified: false,
		},
		content: "This is incredible! Does the width match the dimensions of the annex in KV62? Could it be a storeroom?",
		timestamp: "2024-11-21T10:30:00Z",
		likes: 45,
		replies: [
			{
				id: "c2",
				postId: "1",
				author: {
					id: "u1",
					username: "dr_hawass",
					displayName: "Dr. Zahi Hawass",
					isVerified: true,
				},
				content: "It is slightly wider, more consistent with a corridor than a simple annex. We will know more soon.",
				timestamp: "2024-11-21T11:00:00Z",
				likes: 120,
			},
		],
	},
	{
		id: "c3",
		postId: "1",
		author: {
			id: "u5",
			username: "lidar_expert",
			displayName: "Sarah Tech",
			isVerified: true,
		},
		content: "The frequency used for these scans would be interesting to know. High frequency gives better resolution but less depth.",
		timestamp: "2024-11-21T12:15:00Z",
		likes: 12,
	},
];

export default function PostDetailPage({ params }: { params: { id: string } }) {
	const { id } = params;
	const post = id === MOCK_POST.id ? MOCK_POST : null;

	if (!post) return notFound();

	return (
		<div className="flex h-full flex-col bg-background">
			{/* Header */}
			<div className="flex items-center gap-4 border-b border-border/40 bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<Button variant="ghost" size="icon" asChild>
					<Link href="/research">
						<ArrowLeft className="h-5 w-5" />
					</Link>
				</Button>
				<div>
					<h1 className="text-lg font-semibold">Research Discussion</h1>
					<p className="text-xs text-muted-foreground">Viewing post by @{post.author.username}</p>
				</div>
			</div>

			<ScrollArea className="flex-1">
				<div className="mx-auto max-w-3xl p-6 pb-20">
					{/* Author & Meta */}
					<div className="mb-6 flex items-center justify-between">
						<div className="flex items-center gap-3">
							<Avatar className="h-12 w-12 border border-border/50">
								<AvatarImage src={post.author.avatarUrl} />
								<AvatarFallback>{post.author.username[0].toUpperCase()}</AvatarFallback>
							</Avatar>
							<div>
								<div className="flex items-center gap-2">
									<span className="font-bold text-foreground">{post.author.displayName}</span>
									{post.author.isVerified && (
										<Badge variant="secondary" className="h-5 px-1.5 text-[10px] text-primary">
											Verified
										</Badge>
									)}
								</div>
								<p className="text-sm text-muted-foreground">
									@{post.author.username} • {post.author.title}
								</p>
							</div>
						</div>
						<div className="text-xs text-muted-foreground flex items-center gap-1.5">
							<Calendar className="h-3.5 w-3.5" />
							21 Nov 2024
						</div>
					</div>

					{/* Content */}
					<article className="prose prose-invert max-w-none">
						<h1 className="mb-4 text-2xl font-bold leading-tight">{post.title}</h1>
						<p className="whitespace-pre-wrap text-base leading-relaxed text-foreground/90">{post.content}</p>
					</article>

					{/* External Link Card */}
					{post.externalLink && (
						<a
							href={post.externalLink.url}
							target="_blank"
							rel="noopener noreferrer"
							className="my-6 flex items-center gap-4 rounded-xl border border-border/50 bg-muted/20 p-4 transition-colors hover:bg-muted/40 hover:border-border/80 group"
						>
							<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-background shadow-sm group-hover:scale-105 transition-transform">
								<ExternalLink className="h-6 w-6 text-primary" />
							</div>
							<div className="flex-1 overflow-hidden">
								<p className="truncate font-semibold text-primary group-hover:underline decoration-primary/50 underline-offset-4">
									{post.externalLink.title}
								</p>
								<p className="text-sm text-muted-foreground">{post.externalLink.domain}</p>
							</div>
						</a>
					)}

					{/* Tags */}
					{post.tags.length > 0 && (
						<div className="mb-8 flex flex-wrap gap-2">
							{post.tags.map((tag) => (
								<Badge key={tag} variant="outline" className="cursor-pointer hover:bg-primary/10 hover:text-primary border-border/60">
									#{tag}
								</Badge>
							))}
						</div>
					)}

					{/* Actions */}
					<div className="mb-8 flex items-center gap-4 border-y border-border/40 py-3">
						<Button variant="ghost" className="gap-2">
							<ThumbsUp className="h-5 w-5" />
							{post.likes} Likes
						</Button>
						<Button variant="ghost" className="gap-2">
							<Share2 className="h-5 w-5" />
							Share
						</Button>
					</div>

					{/* Comments */}
					<CommentSection comments={MOCK_COMMENTS} />
				</div>
			</ScrollArea>
		</div>
	);
}






