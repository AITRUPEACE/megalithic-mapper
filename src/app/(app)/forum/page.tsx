"use client";

import { useState } from "react";
import Link from "next/link";
import {
	FlaskConical,
	Sparkles,
	Map,
	Compass,
	Users,
	Lightbulb,
	FileCheck,
	ScrollText,
	Microscope,
	Newspaper,
	Shovel,
	RefreshCw,
	Pyramid,
	Mountain,
	Milestone,
	Waves,
	Anchor,
	CalendarDays,
	Wrench,
	FileText,
	HandMetal,
	MessageCircle,
	Image,
	MessageSquarePlus,
	ChevronRight,
	Flame,
	Clock,
	MessageSquare,
	Eye,
	Heart,
	Pin,
	Lock,
	BadgeCheck,
	Search,
	Plus,
	TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { cn, timeAgo } from "@/shared/lib/utils";
import {
	forumCategories,
	forumSections,
	forumThreads,
	forumStats,
	getCategoryById,
	getSectionsByCategory,
	getHotThreads,
	getRecentThreads,
	type ForumCategory,
	type ForumSection,
	type ForumThread,
} from "@/shared/mocks/forum-data";

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
	FlaskConical,
	Sparkles,
	Map,
	Compass,
	Users,
	Lightbulb,
	FileCheck,
	ScrollText,
	Microscope,
	Newspaper,
	Shovel,
	RefreshCw,
	Pyramid,
	Mountain,
	Milestone,
	Waves,
	Anchor,
	CalendarDays,
	Wrench,
	FileText,
	HandMetal,
	MessageCircle,
	Image,
	MessageSquarePlus,
};

function CategoryIcon({ name, className }: { name: string; className?: string }) {
	const Icon = iconMap[name] || MessageCircle;
	return <Icon className={className} />;
}

function SectionCard({ section, category }: { section: ForumSection; category: ForumCategory }) {
	const Icon = iconMap[section.icon] || MessageCircle;

	return (
		<Link
			href={`/forum/${category.slug}/${section.slug}`}
			className="group flex items-start gap-4 rounded-lg border border-border/40 bg-card/50 p-4 transition-all hover:border-border hover:bg-card/80"
		>
			<div className={cn("rounded-lg bg-muted/50 p-2.5", category.color)}>
				<Icon className="h-5 w-5" />
			</div>
			<div className="min-w-0 flex-1">
				<div className="flex items-center gap-2">
					<h3 className="font-medium text-foreground group-hover:text-primary transition-colors">{section.name}</h3>
					{section.isVerifiedOnly && (
						<Badge variant="secondary" className="text-[10px] px-1.5 py-0">
							<BadgeCheck className="h-3 w-3 mr-0.5" />
							Verified
						</Badge>
					)}
					{section.isLocked && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
				</div>
				<p className="mt-1 text-sm text-muted-foreground line-clamp-2">{section.description}</p>
				<div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
					<span>{section.threadCount.toLocaleString()} threads</span>
					<span>{section.postCount.toLocaleString()} posts</span>
				</div>
				{section.lastActivity && (
					<div className="mt-2 text-xs text-muted-foreground">
						<span className="text-foreground/70">Latest:</span>{" "}
						<span className="text-primary hover:underline">{section.lastActivity.threadTitle}</span>
						<span className="mx-1">·</span>
						<span>{timeAgo(section.lastActivity.timestamp)}</span>
					</div>
				)}
			</div>
			<ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
		</Link>
	);
}

function ThreadRow({ thread }: { thread: ForumThread }) {
	return (
		<div className="flex items-start gap-3 rounded-lg border border-border/40 bg-card/50 p-3 sm:p-4 hover:bg-card/70 transition-colors">
			{/* Author avatar */}
			<div className="relative hidden sm:block">
				<img
					src={thread.author.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${thread.author.username}`}
					alt={thread.author.displayName}
					className="h-10 w-10 rounded-full bg-muted"
				/>
				{thread.author.isVerified && <BadgeCheck className="absolute -bottom-0.5 -right-0.5 h-4 w-4 text-primary bg-background rounded-full" />}
			</div>

			{/* Content */}
			<div className="min-w-0 flex-1">
				<div className="flex flex-wrap items-center gap-1.5">
					{thread.isPinned && <Pin className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />}
					{thread.isHot && <Flame className="h-3.5 w-3.5 text-orange-500" />}
					<Link href={`/forum/thread/${thread.slug}`} className="font-medium text-foreground hover:text-primary transition-colors line-clamp-1">
						{thread.title}
					</Link>
					{thread.isVerifiedOnly && (
						<Badge variant="secondary" className="text-[10px] px-1 py-0">
							<BadgeCheck className="h-2.5 w-2.5" />
						</Badge>
					)}
					{thread.isLocked && <Lock className="h-3 w-3 text-muted-foreground" />}
				</div>

				<p className="mt-1 text-sm text-muted-foreground line-clamp-1 sm:line-clamp-2">{thread.excerpt}</p>

				<div className="mt-2 flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-muted-foreground">
					<span className="flex items-center gap-1">
						<span className="text-foreground/70">by</span>
						<span className="text-foreground">{thread.author.displayName}</span>
						{thread.author.role && (
							<Badge variant="outline" className="text-[10px] px-1 py-0 ml-0.5">
								{thread.author.role}
							</Badge>
						)}
					</span>
					<span className="hidden sm:inline">·</span>
					<span className="flex items-center gap-1">
						<Clock className="h-3 w-3" />
						{timeAgo(thread.lastActivity)}
					</span>
				</div>

				{/* Tags */}
				<div className="mt-2 flex flex-wrap gap-1.5">
					{thread.tags.slice(0, 3).map((tag) => (
						<span key={tag} className="rounded-full bg-secondary/40 px-2 py-0.5 text-[10px]">
							#{tag}
						</span>
					))}
					{thread.tags.length > 3 && <span className="text-[10px] text-muted-foreground">+{thread.tags.length - 3}</span>}
				</div>
			</div>

			{/* Stats */}
			<div className="hidden md:flex flex-col items-end gap-1 text-xs text-muted-foreground">
				<div className="flex items-center gap-3">
					<span className="flex items-center gap-1">
						<MessageSquare className="h-3.5 w-3.5" />
						{thread.replyCount}
					</span>
					<span className="flex items-center gap-1">
						<Eye className="h-3.5 w-3.5" />
						{thread.viewCount}
					</span>
					<span className="flex items-center gap-1">
						<Heart className="h-3.5 w-3.5" />
						{thread.likeCount}
					</span>
				</div>
			</div>
		</div>
	);
}

function CategorySection({ category }: { category: ForumCategory }) {
	const sections = getSectionsByCategory(category.id);

	return (
		<div className="space-y-4">
			<div className="flex items-center gap-3">
				<div className={cn("rounded-lg bg-muted/50 p-2", category.color)}>
					<CategoryIcon name={category.icon} className="h-5 w-5" />
				</div>
				<div>
					<h2 className="text-lg font-semibold">{category.name}</h2>
					<p className="text-sm text-muted-foreground">{category.description}</p>
				</div>
			</div>

			<div className="grid gap-3 sm:grid-cols-2">
				{sections.map((section) => (
					<SectionCard key={section.id} section={section} category={category} />
				))}
			</div>
		</div>
	);
}

function HotThreadsSidebar() {
	const hotThreads = getHotThreads(5);

	return (
		<Card className="glass-panel border-border/40">
			<CardHeader className="pb-3">
				<CardTitle className="flex items-center gap-2 text-base">
					<Flame className="h-4 w-4 text-orange-500" />
					Hot Threads
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3">
				{hotThreads.map((thread, index) => (
					<Link key={thread.id} href={`/forum/thread/${thread.slug}`} className="group block">
						<div className="flex items-start gap-2">
							<span className="text-lg font-bold text-muted-foreground/50">{index + 1}</span>
							<div className="min-w-0 flex-1">
								<p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">{thread.title}</p>
								<p className="mt-1 text-xs text-muted-foreground">
									{thread.replyCount} replies · {thread.viewCount} views
								</p>
							</div>
						</div>
					</Link>
				))}
			</CardContent>
		</Card>
	);
}

function ForumStatsSidebar() {
	return (
		<Card className="glass-panel border-border/40">
			<CardHeader className="pb-3">
				<CardTitle className="flex items-center gap-2 text-base">
					<TrendingUp className="h-4 w-4 text-emerald-500" />
					Forum Stats
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid grid-cols-2 gap-3">
					<div className="text-center">
						<p className="text-2xl font-bold text-foreground">{forumStats.totalThreads.toLocaleString()}</p>
						<p className="text-xs text-muted-foreground">Threads</p>
					</div>
					<div className="text-center">
						<p className="text-2xl font-bold text-foreground">{forumStats.totalPosts.toLocaleString()}</p>
						<p className="text-xs text-muted-foreground">Posts</p>
					</div>
					<div className="text-center">
						<p className="text-2xl font-bold text-foreground">{forumStats.totalMembers.toLocaleString()}</p>
						<p className="text-xs text-muted-foreground">Members</p>
					</div>
					<div className="text-center">
						<p className="text-2xl font-bold text-emerald-500">{forumStats.onlineNow}</p>
						<p className="text-xs text-muted-foreground">Online Now</p>
					</div>
				</div>

				<div className="border-t border-border/40 pt-3">
					<p className="text-xs text-muted-foreground mb-2">Top Contributors</p>
					<div className="space-y-2">
						{forumStats.topContributors.slice(0, 3).map((user) => (
							<div key={user.username} className="flex items-center justify-between text-sm">
								<div className="flex items-center gap-1.5">
									<span className="text-foreground">@{user.username}</span>
									{user.isVerified && <BadgeCheck className="h-3.5 w-3.5 text-primary" />}
								</div>
								<span className="text-muted-foreground">{user.posts} posts</span>
							</div>
						))}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

export default function ForumPage() {
	const [activeTab, setActiveTab] = useState("categories");
	const [searchQuery, setSearchQuery] = useState("");

	const recentThreads = getRecentThreads(10);
	const hotThreads = getHotThreads(10);

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-semibold sm:text-3xl">Forum</h1>
					<p className="text-sm text-muted-foreground">Discuss theories, share discoveries, and connect with the research community</p>
				</div>
				<div className="flex items-center gap-2">
					<Button asChild size="sm">
						<Link href="/forum/new">
							<Plus className="h-4 w-4 mr-1.5" />
							New Thread
						</Link>
					</Button>
				</div>
			</div>

			{/* Search */}
			<div className="relative max-w-md">
				<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
				<Input placeholder="Search threads..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
			</div>

			<div className="flex flex-col lg:flex-row gap-6">
				{/* Main content */}
				<div className="flex-1 min-w-0">
					<Tabs value={activeTab} onValueChange={setActiveTab}>
						<TabsList className="w-full justify-start bg-muted/30">
							<TabsTrigger value="categories" className="text-sm">
								Categories
							</TabsTrigger>
							<TabsTrigger value="recent" className="text-sm">
								<Clock className="h-3.5 w-3.5 mr-1.5" />
								Recent
							</TabsTrigger>
							<TabsTrigger value="hot" className="text-sm">
								<Flame className="h-3.5 w-3.5 mr-1.5" />
								Hot
							</TabsTrigger>
						</TabsList>

						<TabsContent value="categories" className="mt-6 space-y-8">
							{forumCategories.map((category) => (
								<CategorySection key={category.id} category={category} />
							))}
						</TabsContent>

						<TabsContent value="recent" className="mt-6 space-y-3">
							<h2 className="text-lg font-semibold flex items-center gap-2">
								<Clock className="h-5 w-5 text-muted-foreground" />
								Recent Activity
							</h2>
							{recentThreads.map((thread) => (
								<ThreadRow key={thread.id} thread={thread} />
							))}
						</TabsContent>

						<TabsContent value="hot" className="mt-6 space-y-3">
							<h2 className="text-lg font-semibold flex items-center gap-2">
								<Flame className="h-5 w-5 text-orange-500" />
								Hot Threads
							</h2>
							{hotThreads.map((thread) => (
								<ThreadRow key={thread.id} thread={thread} />
							))}
						</TabsContent>
					</Tabs>
				</div>

				{/* Sidebar */}
				<aside className="w-full lg:w-80 space-y-4">
					<HotThreadsSidebar />
					<ForumStatsSidebar />
				</aside>
			</div>
		</div>
	);
}
