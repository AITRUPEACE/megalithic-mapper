"use client";

import Link from "next/link";
<<<<<<< HEAD
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ContentCard } from "@/components/content/content-card";
import { useContentStore, filterContent } from "@/state/content-store";
import { Search, Grid3x3, List, SlidersHorizontal } from "lucide-react";
=======
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { sampleMediaAssets } from "@/shared/mocks/sample-media";
import { timeAgo } from "@/shared/lib/utils";
>>>>>>> 520337dfb48b4ef3f55d0edf1ade0738f592525b

export default function MediaPage() {
	const { contentItems, filters, setFilters, likeContent, bookmarkContent } = useContentStore();
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
	const [searchTerm, setSearchTerm] = useState("");

	// Filter for media types only
	const mediaContent = filterContent(contentItems, {
		...filters,
		types: ["image", "video", "youtube"],
		search: searchTerm,
	});

	// Get unique civilizations and tags for quick filters
	const civilizations = Array.from(
		new Set(
			contentItems
				.filter((c) => ["image", "video", "youtube"].includes(c.type))
				.map((c) => c.civilization)
				.filter(Boolean)
		)
	);

	const handleLike = (contentId: string) => {
		likeContent(contentId, "current-user");
	};

	const handleBookmark = (contentId: string) => {
		bookmarkContent(contentId, "current-user");
	};

	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="flex flex-wrap items-center justify-between gap-4">
				<div>
					<h1 className="text-3xl font-semibold">Media Library</h1>
					<p className="text-sm text-muted-foreground">
						High-resolution imagery, slow-motion experiments, and curated video discussions supporting active research threads.
					</p>
				</div>
				<Button asChild>
					<Link href="/content/upload?type=media">Upload media</Link>
				</Button>
			</div>

			{/* Filters and Controls */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				{/* Search */}
				<div className="relative flex-1 max-w-md">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input placeholder="Search media..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
				</div>

				{/* View controls */}
				<div className="flex items-center gap-2">
					<Button variant={viewMode === "grid" ? "default" : "outline"} size="sm" onClick={() => setViewMode("grid")}>
						<Grid3x3 className="h-4 w-4" />
					</Button>
					<Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")}>
						<List className="h-4 w-4" />
					</Button>
					<Button variant="outline" size="sm" asChild>
						<Link href="/browse?type=media">
							<SlidersHorizontal className="mr-2 h-4 w-4" />
							Advanced Filters
						</Link>
					</Button>
				</div>
			</div>

			{/* Quick Filters */}
			<div className="flex flex-wrap gap-2">
				<Badge
					variant={filters.verification === "all" ? "secondary" : "default"}
					className="cursor-pointer"
					onClick={() => setFilters({ verification: "all" })}
				>
					All
				</Badge>
				<Badge
					variant={filters.verification === "verified" ? "default" : "secondary"}
					className="cursor-pointer"
					onClick={() => setFilters({ verification: "verified" })}
				>
					Verified
				</Badge>
				<Badge
					variant={filters.verification === "under_review" ? "default" : "secondary"}
					className="cursor-pointer"
					onClick={() => setFilters({ verification: "under_review" })}
				>
					Under Review
				</Badge>
				<div className="ml-4 flex flex-wrap gap-2">
					{civilizations.slice(0, 5).map((civ) => (
						<Badge
							key={civ}
							variant={filters.civilizations.includes(civ as string) ? "default" : "outline"}
							className="cursor-pointer"
							onClick={() => {
								const newCivs = filters.civilizations.includes(civ as string)
									? filters.civilizations.filter((c) => c !== civ)
									: [...filters.civilizations, civ as string];
								setFilters({ civilizations: newCivs });
							}}
						>
							{civ}
						</Badge>
					))}
				</div>
			</div>

			{/* Results count */}
			<div className="text-sm text-muted-foreground">
				Showing {mediaContent.length} {mediaContent.length === 1 ? "item" : "items"}
			</div>

			{/* Content Grid/List */}
			{viewMode === "grid" ? (
				<div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
					{mediaContent.map((content) => (
						<ContentCard key={content.id} content={content} variant="compact" onLike={handleLike} onBookmark={handleBookmark} />
					))}
				</div>
			) : (
				<div className="space-y-4">
					{mediaContent.map((content) => (
						<ContentCard key={content.id} content={content} variant="list" onLike={handleLike} onBookmark={handleBookmark} />
					))}
				</div>
			)}

			{/* Empty state */}
			{mediaContent.length === 0 && (
				<div className="flex flex-col items-center justify-center py-12 text-center">
					<p className="text-lg font-medium text-muted-foreground">No media found</p>
					<p className="text-sm text-muted-foreground">Try adjusting your filters or search terms</p>
					<Button
						variant="outline"
						className="mt-4"
						onClick={() => {
							setSearchTerm("");
							setFilters({ verification: "all", civilizations: [] });
						}}
					>
						Clear filters
					</Button>
				</div>
			)}
		</div>
	);
}
