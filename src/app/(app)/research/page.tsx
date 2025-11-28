"use client";

import Image from "next/image";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Card, CardContent, CardFooter, CardHeader } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { MessageSquare, Share2, ThumbsUp, ExternalLink, Search, Plus, BookOpen, Users } from "lucide-react";
import Link from "next/link";
import type { FeedPost, ResearchTopic } from "@/shared/types/content";
import { sampleTopics } from "@/shared/mocks/research-topics";
import { samplePosts } from "@/shared/mocks/sample-posts";

type ResearchTab = "topics" | "feed";

export default function ResearchFeedPage() {
	const [activeTab, setActiveTab] = useState<ResearchTab>("topics");
	const [feedFilter, setFeedFilter] = useState<"official" | "community">("official");

	const posts = samplePosts.filter((post) => post.type === feedFilter);

	return (
		<div className="flex h-full flex-col">
			{/* Header */}
			<div className="flex items-center justify-between border-b border-border/40 bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div>
					<h1 className="text-2xl font-bold tracking-tight">Research Hub</h1>
					<p className="text-sm text-muted-foreground">Explore theories, contribute findings, and analyze data.</p>
				</div>
				<div className="flex gap-2">
					<Button asChild>
						<Link href="/research/new">
							<Plus className="mr-2 h-4 w-4" />
							New Contribution
						</Link>
					</Button>
				</div>
			</div>

			<div className="flex flex-1 overflow-hidden">
				{/* Main Content */}
				<div className="flex-1 overflow-y-auto p-6">
					<div className="mx-auto max-w-5xl space-y-6">
						{/* View Controls */}
						<Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ResearchTab)} className="w-full">
							<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
								<TabsList className="w-full sm:w-auto">
									<TabsTrigger value="topics" className="flex-1 sm:flex-none">Explore Topics</TabsTrigger>
									<TabsTrigger value="feed" className="flex-1 sm:flex-none">Latest Activity</TabsTrigger>
								</TabsList>

								{activeTab === "feed" ? (
									<div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg">
										<Button
											variant={feedFilter === "official" ? "secondary" : "ghost"}
											size="sm"
											onClick={() => setFeedFilter("official")}
											className="text-xs h-7"
										>
											Official Findings
										</Button>
										<Button
											variant={feedFilter === "community" ? "secondary" : "ghost"}
											size="sm"
											onClick={() => setFeedFilter("community")}
											className="text-xs h-7"
										>
											Community Theories
										</Button>
									</div>
								) : (
									<div className="relative w-full sm:w-64">
										<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
										<Input placeholder="Search topics..." className="pl-9 h-9" />
									</div>
								)}
							</div>

							<TabsContent value="topics" className="mt-0">
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
									{sampleTopics.map((topic) => (
										<TopicCard key={topic.id} topic={topic} />
									))}
								</div>
							</TabsContent>

							<TabsContent value="feed" className="mt-0">
								<div className="space-y-4 max-w-3xl mx-auto">
									{posts.map((post) => (
										<FeedCard key={post.id} post={post} />
									))}
								</div>
							</TabsContent>
						</Tabs>
					</div>
				</div>

				{/* Right Sidebar (only for Feed view) */}
				{activeTab === "feed" && (
					<div className="hidden w-80 border-l border-border/40 bg-muted/10 p-6 xl:block">
						<div className="space-y-6">
							<div>
								<h3 className="mb-4 font-semibold">Active Researchers</h3>
								<div className="space-y-3">
									{[1, 2, 3].map((i) => (
										<div key={i} className="flex items-center gap-3">
											<Avatar className="h-8 w-8">
												<AvatarFallback>R{i}</AvatarFallback>
											</Avatar>
											<div>
												<p className="text-sm font-medium">Researcher Name</p>
												<p className="text-xs text-muted-foreground">12 new posts this week</p>
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

function TopicCard({ topic }: { topic: ResearchTopic }) {
	return (
		<Link href={`/research/topic/${topic.slug}`} className="block h-full">
			<Card className="h-full overflow-hidden border-border/40 bg-card/50 transition-all hover:bg-card/80 hover:border-primary/50 group flex flex-col">
				<div className="aspect-video w-full overflow-hidden bg-muted relative">
					{topic.coverImage ? (
						<Image
							src={topic.coverImage}
							alt={topic.title}
							fill
							className="object-cover transition-transform duration-500 group-hover:scale-105"
							sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
						/>
					) : (
						<div className="flex items-center justify-center h-full text-muted-foreground">
							<BookOpen className="h-12 w-12 opacity-20" />
						</div>
					)}
					<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
						<span className="text-white text-sm font-medium">View Topic</span>
					</div>
				</div>
				<CardHeader className="pb-2">
					<div className="flex justify-between items-start gap-2">
						<h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
							{topic.title}
						</h3>
					</div>
				</CardHeader>
				<CardContent className="flex-1 pb-4">
					<p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
						{topic.description}
					</p>
				</CardContent>
				<CardFooter className="border-t border-border/40 bg-muted/5 p-3 text-xs text-muted-foreground flex justify-between">
					<div className="flex items-center gap-1">
						<BookOpen className="h-3.5 w-3.5" />
						{topic.stats.posts} posts
					</div>
					<div className="flex items-center gap-1">
						<Users className="h-3.5 w-3.5" />
						{topic.stats.contributors} contributors
					</div>
				</CardFooter>
			</Card>
		</Link>
	);
}

function FeedCard({ post }: { post: FeedPost }) {
	return (
		<Link href={`/research/${post.id}`} className="block">
			<Card className="overflow-hidden border-border/40 bg-card/50 transition-colors hover:bg-card/80 hover:border-border/60">
				<CardHeader className="flex flex-row items-start gap-4 space-y-0 p-4 pb-2">
					<Avatar>
						<AvatarImage src={post.author.avatarUrl} />
						<AvatarFallback>{post.author.username[0].toUpperCase()}</AvatarFallback>
					</Avatar>
					<div className="flex-1 space-y-1">
						<div className="flex items-center gap-2">
							<span className="font-semibold text-foreground">{post.author.displayName}</span>
							{post.author.isVerified && (
								<Badge variant="secondary" className="h-5 px-1.5 text-[10px] text-primary">
									Verified
								</Badge>
							)}
							<span className="text-xs text-muted-foreground">@{post.author.username}</span>
							<span className="text-xs text-muted-foreground">• 2h ago</span>
						</div>
						{post.author.title && <p className="text-xs text-muted-foreground">{post.author.title}</p>}
					</div>
				</CardHeader>
				<CardContent className="space-y-3 p-4 pt-2">
					<div>
						{post.topicId && (
							<Badge variant="outline" className="mb-2 text-[10px] bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary">
								{sampleTopics.find(t => t.id === post.topicId)?.title || "Topic"}
							</Badge>
						)}
						<h3 className="mb-1 text-lg font-semibold leading-none tracking-tight">{post.title}</h3>
						<p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap line-clamp-3">{post.content}</p>
					</div>

					{post.externalLink && (
						<div className="flex items-center gap-3 rounded-md border border-border/50 bg-muted/20 p-3 transition-colors hover:bg-muted/40">
							<div className="flex h-10 w-10 items-center justify-center rounded bg-background">
								<ExternalLink className="h-5 w-5 text-muted-foreground" />
							</div>
							<div className="flex-1 overflow-hidden">
								<p className="truncate text-sm font-medium text-primary">{post.externalLink.title}</p>
								<p className="text-xs text-muted-foreground">{post.externalLink.domain}</p>
							</div>
						</div>
					)}

					{post.tags.length > 0 && (
						<div className="flex flex-wrap gap-2">
							{post.tags.map((tag) => (
								<span key={tag} className="text-xs text-primary">
									#{tag}
								</span>
							))}
						</div>
					)}
				</CardContent>
				<CardFooter className="border-t border-border/40 bg-muted/5 p-2">
					<div className="flex w-full justify-between px-2">
						<Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
							<ThumbsUp className="h-4 w-4" />
							{post.likes}
						</Button>
						<Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
							<MessageSquare className="h-4 w-4" />
							{post.commentsCount} Comments
						</Button>
						<Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
							<Share2 className="h-4 w-4" />
							Share
						</Button>
					</div>
				</CardFooter>
			</Card>
		</Link>
	);
}
