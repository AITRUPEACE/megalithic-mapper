"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence, PanInfo, useAnimation } from "framer-motion";
import { ChevronUp, ChevronDown, Search, X, Sparkles, Flame, MapPin } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { cn, timeAgo } from "@/shared/lib/utils";
import { zClass } from "@/shared/lib/z-index";
import type { MapSiteFeature } from "@/entities/map/model/types";

interface MobileDrawerProps {
	sites: MapSiteFeature[];
	selectedSite: MapSiteFeature | null;
	onSelectSite: (siteId: string) => void;
	onFocusSite: (siteId: string) => void;
	onClose: () => void;
	className?: string;
}

type DrawerState = "peek" | "half" | "full";

const DRAWER_HEIGHTS = {
	peek: 120,
	half: "50vh",
	full: "85vh",
};

// Quick filter options
const QUICK_FILTERS = [
	{ id: "recent", label: "✨ Recent", icon: Sparkles },
	{ id: "trending", label: "🔥 Trending", icon: Flame },
	{ id: "nearby", label: "📍 Nearby", icon: MapPin },
];

export function MobileDrawer({ sites, selectedSite, onSelectSite, onFocusSite, onClose, className }: MobileDrawerProps) {
	const [drawerState, setDrawerState] = useState<DrawerState>("peek");
	const [searchQuery, setSearchQuery] = useState("");
	const [isSearching, setIsSearching] = useState(false);
	const [activeFilter, setActiveFilter] = useState<string | null>("recent");
	const controls = useAnimation();
	const dragStartY = useRef(0);

	// Get recent sites (mock: use last 10 sites)
	const recentSites = sites.slice(0, 10);

	const handleDragStart = (_: any, info: PanInfo) => {
		dragStartY.current = info.point.y;
	};

	const handleDragEnd = (_: any, info: PanInfo) => {
		const threshold = 50;
		const velocity = info.velocity.y;
		const delta = info.point.y - dragStartY.current;

		if (velocity < -500 || delta < -threshold) {
			// Swiped up
			if (drawerState === "peek") setDrawerState("half");
			else if (drawerState === "half") setDrawerState("full");
		} else if (velocity > 500 || delta > threshold) {
			// Swiped down
			if (drawerState === "full") setDrawerState("half");
			else if (drawerState === "half") setDrawerState("peek");
		}
	};

	const toggleExpand = () => {
		if (drawerState === "peek") setDrawerState("half");
		else if (drawerState === "half") setDrawerState("full");
		else setDrawerState("half");
	};

	// Animate drawer height changes
	useEffect(() => {
		const height = DRAWER_HEIGHTS[drawerState];
		controls.start({
			height: typeof height === "number" ? height : height,
			transition: { type: "spring", damping: 25, stiffness: 300 },
		});
	}, [drawerState, controls]);

	// If a site is selected, show site details view
	if (selectedSite) {
		return (
			<motion.div
				className={cn("fixed bottom-0 left-0 right-0 bg-card border-t border-border/40 rounded-t-2xl shadow-2xl", zClass.mobileDrawer, className)}
				initial={{ height: DRAWER_HEIGHTS.half }}
				animate={controls}
				drag="y"
				dragConstraints={{ top: 0, bottom: 0 }}
				dragElastic={0.1}
				onDragStart={handleDragStart}
				onDragEnd={handleDragEnd}
			>
				{/* Drag handle */}
				<div className="flex justify-center py-2">
					<div className="w-12 h-1 bg-muted-foreground/30 rounded-full" />
				</div>

				{/* Header */}
				<div className="flex items-start justify-between px-4 pb-2">
					<div className="flex-1 min-w-0">
						<h3 className="font-semibold truncate">{selectedSite.name}</h3>
						<p className="text-xs text-muted-foreground">
							{selectedSite.tags.cultures[0] || "Unknown"} · {selectedSite.tags.eras[0] || "Unknown era"}
						</p>
					</div>
					<div className="flex items-center gap-2">
						<Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => toggleExpand()}>
							{drawerState === "full" ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
						</Button>
						<Button size="icon" variant="ghost" className="h-8 w-8" onClick={onClose}>
							<X className="h-4 w-4" />
						</Button>
					</div>
				</div>

				{/* Badges */}
				<div className="flex gap-1.5 px-4 pb-3">
					<Badge variant={selectedSite.verificationStatus === "verified" ? "success" : "outline"} className="text-xs">
						{selectedSite.verificationStatus === "verified" && "Verified"}
						{selectedSite.verificationStatus === "under_review" && "Under review"}
						{selectedSite.verificationStatus === "unverified" && "Unverified"}
					</Badge>
					<Badge variant="outline" className="text-xs">
						{selectedSite.layer === "community" ? "Community" : "Official"}
					</Badge>
				</div>

				{/* Content (only visible when expanded) */}
				{drawerState !== "peek" && (
					<ScrollArea className="flex-1 px-4">
						<div className="space-y-4 pb-20">
							<p className="text-sm text-muted-foreground">{selectedSite.summary}</p>

							{/* Stats */}
							<div className="flex gap-4">
								<div className="flex-1 rounded-lg bg-muted/30 p-3 text-center">
									<p className="text-lg font-semibold">{selectedSite.mediaCount}</p>
									<p className="text-xs text-muted-foreground">Media</p>
								</div>
								<div className="flex-1 rounded-lg bg-muted/30 p-3 text-center">
									<p className="text-lg font-semibold">{selectedSite.relatedResearchIds.length}</p>
									<p className="text-xs text-muted-foreground">Research</p>
								</div>
							</div>

							{/* Tags */}
							{selectedSite.tags.themes.length > 0 && (
								<div className="space-y-2">
									<p className="text-xs uppercase tracking-wide text-muted-foreground">Tags</p>
									<div className="flex flex-wrap gap-1.5">
										{selectedSite.tags.themes.slice(0, 5).map((tag) => (
											<span key={tag} className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
												#{tag}
											</span>
										))}
									</div>
								</div>
							)}

							{/* Actions */}
							<div className="flex gap-2 pt-2">
								<Button className="flex-1" size="sm">
									View Full Details
								</Button>
								<Button variant="outline" className="flex-1" size="sm">
									Discuss
								</Button>
							</div>
						</div>
					</ScrollArea>
				)}
			</motion.div>
		);
	}

	// Default view: Recent discoveries
	return (
		<motion.div
			className={cn("fixed bottom-0 left-0 right-0 bg-card border-t border-border/40 rounded-t-2xl shadow-2xl", zClass.mobileDrawer, className)}
			initial={{ height: DRAWER_HEIGHTS.peek }}
			animate={controls}
			drag="y"
			dragConstraints={{ top: 0, bottom: 0 }}
			dragElastic={0.1}
			onDragStart={handleDragStart}
			onDragEnd={handleDragEnd}
		>
			{/* Drag handle */}
			<div className="flex justify-center py-2">
				<div className="w-12 h-1 bg-muted-foreground/30 rounded-full" />
			</div>

			{/* Peek header - always visible */}
			<div className="px-4 pb-2">
				<div className="flex items-center justify-between">
					<div>
						<h3 className="font-semibold text-sm">Recent Discoveries</h3>
						<p className="text-xs text-muted-foreground">{recentSites.length} new sites this week</p>
					</div>
					<Button size="sm" variant="ghost" className="h-8" onClick={toggleExpand}>
						{drawerState === "peek" ? (
							<>
								<span className="mr-1 text-xs">See all</span>
								<ChevronUp className="h-4 w-4" />
							</>
						) : (
							<ChevronDown className="h-4 w-4" />
						)}
					</Button>
				</div>

				{/* Quick preview of sites - only in peek mode */}
				{drawerState === "peek" && (
					<div className="flex gap-2 mt-2 overflow-x-auto pb-1">
						{recentSites.slice(0, 4).map((site) => (
							<button
								key={site.id}
								className="shrink-0 rounded-lg bg-muted/30 px-3 py-2 text-left text-xs hover:bg-muted/50 transition-colors"
								onClick={() => onSelectSite(site.id)}
							>
								<p className="font-medium truncate max-w-[120px]">{site.name}</p>
								<p className="text-muted-foreground truncate max-w-[120px]">{site.tags.cultures[0] || "Unknown"}</p>
							</button>
						))}
					</div>
				)}
			</div>

			{/* Expanded content */}
			{drawerState !== "peek" && (
				<div className="flex-1 flex flex-col overflow-hidden">
					{/* Search */}
					<div className="px-4 pb-3">
						{isSearching ? (
							<div className="flex items-center gap-2">
								<Input
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									placeholder="Search sites..."
									className="h-9 text-sm"
									autoFocus
								/>
								<Button
									size="icon"
									variant="ghost"
									className="h-9 w-9 shrink-0"
									onClick={() => {
										setIsSearching(false);
										setSearchQuery("");
									}}
								>
									<X className="h-4 w-4" />
								</Button>
							</div>
						) : (
							<Button variant="outline" className="w-full justify-start text-muted-foreground h-9" onClick={() => setIsSearching(true)}>
								<Search className="h-3.5 w-3.5 mr-2" />
								Search sites...
							</Button>
						)}
					</div>

					{/* Filter chips */}
					<div className="flex gap-2 px-4 pb-3 overflow-x-auto">
						{QUICK_FILTERS.map((filter) => (
							<button
								key={filter.id}
								onClick={() => setActiveFilter(filter.id === activeFilter ? null : filter.id)}
								className={cn(
									"shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
									activeFilter === filter.id ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground"
								)}
							>
								{filter.label}
							</button>
						))}
					</div>

					{/* Sites list */}
					<ScrollArea className="flex-1 px-4">
						<div className="space-y-2 pb-20">
							{recentSites.map((site) => (
								<button
									key={site.id}
									className="w-full rounded-lg bg-muted/20 p-3 text-left hover:bg-muted/40 transition-colors"
									onClick={() => onSelectSite(site.id)}
								>
									<div className="flex items-start justify-between gap-2">
										<div className="flex-1 min-w-0">
											<p className="font-medium text-sm truncate">{site.name}</p>
											<p className="text-xs text-muted-foreground">
												{site.tags.cultures[0] || "Unknown"} · {timeAgo(site.updatedAt)}
											</p>
										</div>
										<Button
											size="icon"
											variant="ghost"
											className="h-7 w-7 shrink-0"
											onClick={(e) => {
												e.stopPropagation();
												onFocusSite(site.id);
											}}
										>
											<MapPin className="h-3.5 w-3.5" />
										</Button>
									</div>
								</button>
							))}
						</div>
					</ScrollArea>
				</div>
			)}
		</motion.div>
	);
}
