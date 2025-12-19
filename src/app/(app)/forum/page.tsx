"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
	MapPin,
	Compass,
	FlaskConical,
	Sparkles,
	MessageCircle,
	Clock,
	MessageSquare,
	Eye,
	Pin,
	Flame,
	Search,
	Plus,
	TrendingUp,
	BadgeCheck,
	ChevronRight,
	Users,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Input } from "@/shared/ui/input";
import { cn, timeAgo } from "@/shared/lib/utils";
import { forumBoards, forumStats, getThreadsByBoard, getHotThreads, getAllThreads, type ForumThread } from "@/shared/mocks/forum-data";

// Icon mapping for boards
const boardIcons: Record<string, React.ComponentType<{ className?: string }>> = {
	MapPin,
	Compass,
	FlaskConical,
	Sparkles,
	MessageCircle,
};

function BoardIcon({ name, className }: { name: string; className?: string }) {
	const Icon = boardIcons[name] || MessageCircle;
	return <Icon className={className} />;
}

// Thread card component
function ThreadCard({ thread }: { thread: ForumThread }) {
	return (
		<Link
			href={`/forum/thread/${thread.slug}`}
			className="group block rounded-xl border border-border/30 bg-card/50 p-3 sm:p-4 transition-all hover:border-border/50 hover:bg-card/80 active:bg-card/90"
		>
			<div className="flex gap-3">
				{/* Author avatar */}
				<div className="relative shrink-0 hidden sm:block">
					<img
						src={thread.author.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${thread.author.username}`}
						alt={thread.author.displayName}
						className="h-10 w-10 rounded-full bg-muted"
					/>
					{thread.author.isVerified && <BadgeCheck className="absolute -bottom-0.5 -right-0.5 h-4 w-4 text-primary bg-background rounded-full" />}
				</div>

				{/* Content */}
				<div className="min-w-0 flex-1">
					{/* Title row */}
					<div className="flex items-start gap-2">
						<div className="flex items-center gap-1.5 flex-wrap">
							{thread.isPinned && <Pin className="h-3.5 w-3.5 text-amber-500 fill-amber-500 shrink-0" />}
							{thread.isHot && <Flame className="h-3.5 w-3.5 text-orange-500 shrink-0" />}
							<h3 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">{thread.title}</h3>
						</div>
					</div>

					{/* Excerpt */}
					<p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">{thread.excerpt}</p>

					{/* Linked site badge */}
					{thread.linkedSiteName && (
						<div className="mt-2">
							<Badge variant="secondary" className="gap-1 text-xs font-normal">
								<MapPin className="h-3 w-3" />
								{thread.linkedSiteName}
							</Badge>
						</div>
					)}

					{/* Tags */}
					{thread.tags.length > 0 && (
						<div className="mt-2 flex flex-wrap gap-1.5">
							{thread.tags.slice(0, 3).map((tag) => (
								<span key={tag} className="rounded-full bg-secondary/50 px-2 py-0.5 text-[11px] text-muted-foreground">
									#{tag}
								</span>
							))}
							{thread.tags.length > 3 && <span className="text-[11px] text-muted-foreground">+{thread.tags.length - 3}</span>}
						</div>
					)}

					{/* Footer */}
					<div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
						<span className="flex items-center gap-1">
							<span className="sm:hidden">
								<img
									src={thread.author.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${thread.author.username}`}
									alt=""
									className="h-4 w-4 rounded-full"
								/>
							</span>
							<span className="text-foreground/80">{thread.author.displayName}</span>
							{thread.author.role && (
								<Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
									{thread.author.role}
								</Badge>
							)}
						</span>
						<span className="flex items-center gap-1">
							<Clock className="h-3 w-3" />
							{timeAgo(thread.lastActivity)}
						</span>
						<span className="flex items-center gap-1">
							<MessageSquare className="h-3 w-3" />
							{thread.replyCount}
						</span>
						<span className="hidden sm:flex items-center gap-1">
							<Eye className="h-3 w-3" />
							{thread.viewCount}
						</span>
					</div>
				</div>
			</div>
		</Link>
	);
}

// Hot threads sidebar component
function HotThreadsSidebar() {
	const hotThreads = getHotThreads(5);

	return (
		<div className="rounded-xl border border-border/30 bg-card/50 p-4">
			<h3 className="flex items-center gap-2 text-sm font-semibold mb-4">
				<Flame className="h-4 w-4 text-orange-500" />
				Trending Now
			</h3>
			<div className="space-y-3">
				{hotThreads.map((thread, index) => (
					<Link key={thread.id} href={`/forum/thread/${thread.slug}`} className="group block">
						<div className="flex items-start gap-2.5">
							<span className="text-lg font-bold text-muted-foreground/40 w-5">{index + 1}</span>
							<div className="min-w-0 flex-1">
								<p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">{thread.title}</p>
								<p className="mt-1 text-xs text-muted-foreground">
									{thread.replyCount} replies · {thread.viewCount} views
								</p>
							</div>
						</div>
					</Link>
				))}
			</div>
		</div>
	);
}

// Forum stats sidebar component
function ForumStatsSidebar() {
	return (
		<div className="rounded-xl border border-border/30 bg-card/50 p-4">
			<h3 className="flex items-center gap-2 text-sm font-semibold mb-4">
				<TrendingUp className="h-4 w-4 text-emerald-500" />
				Community Stats
			</h3>
			<div className="grid grid-cols-2 gap-3 mb-4">
				<div className="text-center p-2 rounded-lg bg-secondary/30">
					<p className="text-xl font-bold text-foreground">{forumStats.totalThreads.toLocaleString()}</p>
					<p className="text-[11px] text-muted-foreground">Threads</p>
				</div>
				<div className="text-center p-2 rounded-lg bg-secondary/30">
					<p className="text-xl font-bold text-foreground">{forumStats.totalPosts.toLocaleString()}</p>
					<p className="text-[11px] text-muted-foreground">Posts</p>
				</div>
				<div className="text-center p-2 rounded-lg bg-secondary/30">
					<p className="text-xl font-bold text-foreground">{forumStats.totalMembers.toLocaleString()}</p>
					<p className="text-[11px] text-muted-foreground">Members</p>
				</div>
				<div className="text-center p-2 rounded-lg bg-secondary/30">
					<p className="text-xl font-bold text-emerald-500">{forumStats.onlineNow}</p>
					<p className="text-[11px] text-muted-foreground">Online</p>
				</div>
			</div>

			<div className="border-t border-border/30 pt-3">
				<p className="text-xs text-muted-foreground mb-2">Top Contributors</p>
				<div className="space-y-2">
					{forumStats.topContributors.slice(0, 3).map((user) => (
						<div key={user.username} className="flex items-center justify-between text-sm">
							<div className="flex items-center gap-1.5">
								<span className="text-foreground">@{user.username}</span>
								{user.isVerified && <BadgeCheck className="h-3.5 w-3.5 text-primary" />}
							</div>
							<span className="text-xs text-muted-foreground">{user.posts}</span>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

export default function ForumPage() {
	const [activeBoard, setActiveBoard] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState("");

	// Get threads based on active board
	const threads = useMemo(() => {
		if (activeBoard) {
			return getThreadsByBoard(activeBoard);
		}
		return getAllThreads();
	}, [activeBoard]);

	// Filter threads by search
	const filteredThreads = useMemo(() => {
		if (!searchQuery.trim()) return threads;
		const query = searchQuery.toLowerCase();
		return threads.filter(
			(t) =>
				t.title.toLowerCase().includes(query) || t.excerpt.toLowerCase().includes(query) || t.tags.some((tag) => tag.toLowerCase().includes(query))
		);
	}, [threads, searchQuery]);

	// Get active board details
	const activeBoardData = activeBoard ? forumBoards.find((b) => b.id === activeBoard) : null;

	return (
		<div className="relative mx-auto max-w-[1400px] space-y-4 p-3 pb-24 sm:p-4 sm:pb-20 md:p-6 md:pb-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-xl font-semibold sm:text-2xl">Forum</h1>
					<p className="text-sm text-muted-foreground hidden sm:block">Discuss discoveries, share research, and connect with explorers</p>
				</div>
				<Button asChild size="sm" className="gap-1.5">
					<Link href="/forum/new">
						<Plus className="h-4 w-4" />
						<span className="hidden sm:inline">New Thread</span>
					</Link>
				</Button>
			</div>

			{/* Search */}
			<div className="relative max-w-md">
				<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					placeholder="Search threads..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="pl-9 bg-secondary/30 border-border/40"
				/>
			</div>

			{/* Board selector - touch-friendly with min 44px height */}
			<div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin -mx-3 px-3 sm:mx-0 sm:px-0">
				<Button
					variant={activeBoard === null ? "default" : "outline"}
					size="sm"
					className={cn(
						"shrink-0 gap-1.5 h-10 px-4",
						activeBoard === null ? "bg-foreground text-background hover:bg-foreground/90" : "border-border/40 hover:bg-secondary/50"
					)}
					onClick={() => setActiveBoard(null)}
				>
					<Users className="h-4 w-4" />
					All
				</Button>
				{forumBoards.map((board) => (
					<Button
						key={board.id}
						variant={activeBoard === board.id ? "default" : "outline"}
						size="sm"
						className={cn(
							"shrink-0 gap-1.5 h-10 px-4",
							activeBoard === board.id ? "bg-foreground text-background hover:bg-foreground/90" : "border-border/40 hover:bg-secondary/50"
						)}
						onClick={() => setActiveBoard(board.id)}
					>
						<BoardIcon name={board.icon} className={cn("h-4 w-4", activeBoard !== board.id && board.color)} />
						{board.name}
					</Button>
				))}
			</div>

			{/* Board description */}
			{activeBoardData && (
				<div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/20 border border-border/30">
					<div className={cn("p-2 rounded-lg bg-secondary/50", activeBoardData.color)}>
						<BoardIcon name={activeBoardData.icon} className="h-5 w-5" />
					</div>
					<div>
						<p className="text-sm font-medium">{activeBoardData.name}</p>
						<p className="text-xs text-muted-foreground">{activeBoardData.description}</p>
					</div>
					<div className="ml-auto text-right hidden sm:block">
						<p className="text-sm font-medium">{activeBoardData.threadCount}</p>
						<p className="text-xs text-muted-foreground">threads</p>
					</div>
				</div>
			)}

			{/* Main content */}
			<div className="flex flex-col lg:flex-row gap-6">
				{/* Thread list */}
				<div className="flex-1 min-w-0 space-y-3">
					{filteredThreads.length > 0 ? (
						filteredThreads.map((thread) => <ThreadCard key={thread.id} thread={thread} />)
					) : (
						<div className="flex flex-col items-center justify-center py-12 text-center">
							<MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />
							<p className="text-lg font-medium text-muted-foreground mb-2">No threads found</p>
							<p className="text-sm text-muted-foreground mb-4">
								{searchQuery ? "Try a different search term" : "Be the first to start a discussion!"}
							</p>
							<Button variant="outline" asChild>
								<Link href="/forum/new">Start a Thread</Link>
							</Button>
						</div>
					)}

					{/* Load more */}
					{filteredThreads.length > 0 && (
						<div className="flex justify-center pt-4">
							<Button variant="outline" className="gap-2 border-border/40">
								Load more
								<ChevronRight className="h-4 w-4" />
							</Button>
						</div>
					)}
				</div>

				{/* Sidebar - desktop only */}
				<aside className="hidden lg:block w-80 space-y-4 shrink-0">
					<HotThreadsSidebar />
					<ForumStatsSidebar />
				</aside>
			</div>

			{/* Mobile FAB - New Thread button */}
			<Link
				href="/forum/new"
				className="fixed bottom-20 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95 sm:hidden"
				aria-label="New Thread"
			>
				<Plus className="h-6 w-6" />
			</Link>
		</div>
	);
}
