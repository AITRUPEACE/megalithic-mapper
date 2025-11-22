"use client";

import Link from "next/link";
<<<<<<< HEAD
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ContentCard } from "@/components/content/content-card";
import { useContentStore, filterContent } from "@/state/content-store";
import { Search, Grid3x3, List, SlidersHorizontal, FileText } from "lucide-react";
=======
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { sampleTextSources } from "@/shared/mocks/sample-texts";
>>>>>>> 520337dfb48b4ef3f55d0edf1ade0738f592525b

export default function TextLibraryPage() {
	const { contentItems, filters, setFilters, likeContent, bookmarkContent } = useContentStore();
	const [viewMode, setViewMode] = useState<"grid" | "list">("list");
	const [searchTerm, setSearchTerm] = useState("");

	// Filter for text/document types only
	const textContent = filterContent(contentItems, {
		...filters,
		types: ["text", "document", "post"],
		search: searchTerm,
	});

	// Get unique civilizations and eras for quick filters
	const civilizations = Array.from(
		new Set(
			contentItems
				.filter((c) => ["text", "document", "post"].includes(c.type))
				.map((c) => c.civilization)
				.filter(Boolean)
		)
	);

	const eras = Array.from(
		new Set(
			contentItems
				.filter((c) => ["text", "document", "post"].includes(c.type))
				.map((c) => c.era)
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
					<h1 className="text-3xl font-semibold">Text Library</h1>
					<p className="text-sm text-muted-foreground">Annotated manuscripts, translations, and field notes powering collaborative hypotheses.</p>
				</div>
				<Button asChild>
					<Link href="/content/upload?type=text">
						<FileText className="mr-2 h-4 w-4" />
						Add Text
					</Link>
				</Button>
			</div>

			{/* Filters and Controls */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				{/* Search */}
				<div className="relative flex-1 max-w-md">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder="Search texts, documents, posts..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="pl-9"
					/>
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
						<Link href="/browse?type=text">
							<SlidersHorizontal className="mr-2 h-4 w-4" />
							Advanced Filters
						</Link>
					</Button>
				</div>
			</div>

			{/* Quick Filters */}
			<div className="space-y-2">
				<div className="flex flex-wrap gap-2">
					<span className="text-sm font-medium text-muted-foreground">Verification:</span>
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
				</div>

				{civilizations.length > 0 && (
					<div className="flex flex-wrap gap-2">
						<span className="text-sm font-medium text-muted-foreground">Civilization:</span>
						{civilizations.map((civ) => (
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
				)}

				{eras.length > 0 && (
					<div className="flex flex-wrap gap-2">
						<span className="text-sm font-medium text-muted-foreground">Era:</span>
						{eras.slice(0, 6).map((era) => (
							<Badge
								key={era}
								variant={filters.eras.includes(era as string) ? "default" : "outline"}
								className="cursor-pointer"
								onClick={() => {
									const newEras = filters.eras.includes(era as string) ? filters.eras.filter((e) => e !== era) : [...filters.eras, era as string];
									setFilters({ eras: newEras });
								}}
							>
								{era}
							</Badge>
						))}
					</div>
				)}
			</div>

			{/* Results count */}
			<div className="text-sm text-muted-foreground">
				Showing {textContent.length} {textContent.length === 1 ? "item" : "items"}
			</div>

			{/* Content Grid/List */}
			{viewMode === "grid" ? (
				<div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
					{textContent.map((content) => (
						<ContentCard key={content.id} content={content} variant="compact" onLike={handleLike} onBookmark={handleBookmark} />
					))}
				</div>
			) : (
				<div className="space-y-4">
					{textContent.map((content) => (
						<ContentCard key={content.id} content={content} variant="list" onLike={handleLike} onBookmark={handleBookmark} />
					))}
				</div>
			)}

			{/* Empty state */}
			{textContent.length === 0 && (
				<div className="flex flex-col items-center justify-center py-12 text-center">
					<FileText className="h-12 w-12 text-muted-foreground mb-4" />
					<p className="text-lg font-medium text-muted-foreground">No texts found</p>
					<p className="text-sm text-muted-foreground">Try adjusting your filters or search terms</p>
					<Button
						variant="outline"
						className="mt-4"
						onClick={() => {
							setSearchTerm("");
							setFilters({ verification: "all", civilizations: [], eras: [] });
						}}
					>
						Clear filters
					</Button>
				</div>
			)}
		</div>
	);
}
