"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ContentCard } from "@/components/content/content-card";
import { useContentStore, filterContent } from "@/state/content-store";
import { ContentType } from "@/lib/types";
import {
	Search,
	Grid3x3,
	List,
	X,
	SlidersHorizontal,
	Image as ImageIcon,
	Video,
	Youtube,
	FileText,
	File,
	Link as LinkIcon,
	Star,
} from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LucideIcon } from "lucide-react";

const contentTypeOptions: { value: ContentType; label: string; icon: LucideIcon }[] = [
	{ value: "image", label: "Images", icon: ImageIcon },
	{ value: "video", label: "Videos", icon: Video },
	{ value: "youtube", label: "YouTube", icon: Youtube },
	{ value: "document", label: "Documents", icon: File },
	{ value: "text", label: "Texts", icon: FileText },
	{ value: "post", label: "Posts", icon: FileText },
	{ value: "link", label: "Links", icon: LinkIcon },
];

const sortOptions = [
	{ value: "recent", label: "Most Recent" },
	{ value: "popular", label: "Most Popular" },
	{ value: "rating", label: "Highest Rated" },
	{ value: "comments", label: "Most Discussed" },
];

function BrowsePageContent() {
	const searchParams = useSearchParams();
	const { contentItems, filters, setFilters, clearFilters, likeContent, bookmarkContent } = useContentStore();

	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
	const [searchTerm, setSearchTerm] = useState("");
	const [showFilters, setShowFilters] = useState(false);

	// Initialize from URL params
	useEffect(() => {
		const type = searchParams?.get("type");
		if (type && contentTypeOptions.some((opt) => opt.value === type)) {
			setFilters({ types: [type as ContentType] });
		}
	}, [searchParams, setFilters]);

	// Get all unique values for filters
	const allCivilizations = Array.from(new Set(contentItems.map((c) => c.civilization).filter(Boolean)));
	const allEras = Array.from(new Set(contentItems.map((c) => c.era).filter(Boolean)));
	const allTags = Array.from(new Set(contentItems.flatMap((c) => c.tags)));

	// Apply filters
	const filteredContent = filterContent(contentItems, {
		...filters,
		search: searchTerm,
	});

	const handleLike = (contentId: string) => {
		likeContent(contentId, "current-user");
	};

	const handleBookmark = (contentId: string) => {
		bookmarkContent(contentId, "current-user");
	};

	const toggleType = (type: ContentType) => {
		const newTypes = filters.types.includes(type) ? filters.types.filter((t) => t !== type) : [...filters.types, type];
		setFilters({ types: newTypes });
	};

	const toggleCivilization = (civ: string) => {
		const newCivs = filters.civilizations.includes(civ) ? filters.civilizations.filter((c) => c !== civ) : [...filters.civilizations, civ];
		setFilters({ civilizations: newCivs });
	};

	const toggleEra = (era: string) => {
		const newEras = filters.eras.includes(era) ? filters.eras.filter((e) => e !== era) : [...filters.eras, era];
		setFilters({ eras: newEras });
	};

	const toggleTag = (tag: string) => {
		const newTags = filters.tags.includes(tag) ? filters.tags.filter((t) => t !== tag) : [...filters.tags, tag];
		setFilters({ tags: newTags });
	};

	const hasActiveFilters =
		filters.types.length > 0 ||
		filters.civilizations.length > 0 ||
		filters.eras.length > 0 ||
		filters.tags.length > 0 ||
		filters.verification !== "all" ||
		filters.hasNoSiteLink ||
		filters.minRating > 0;

	const FiltersSidebar = () => (
		<div className="space-y-6">
			<div>
				<h3 className="font-semibold mb-3">Content Type</h3>
				<div className="space-y-2">
					{contentTypeOptions.map(({ value, label, icon: Icon }) => (
						<Button
							key={value}
							variant={filters.types.includes(value) ? "default" : "outline"}
							className="w-full justify-start"
							size="sm"
							onClick={() => toggleType(value)}
						>
							<Icon className="mr-2 h-4 w-4" />
							{label}
						</Button>
					))}
				</div>
			</div>

			<Separator />

			<div>
				<h3 className="font-semibold mb-3">Verification</h3>
				<div className="space-y-2">
					<Button
						variant={filters.verification === "all" ? "default" : "outline"}
						className="w-full justify-start"
						size="sm"
						onClick={() => setFilters({ verification: "all" })}
					>
						All
					</Button>
					<Button
						variant={filters.verification === "verified" ? "default" : "outline"}
						className="w-full justify-start"
						size="sm"
						onClick={() => setFilters({ verification: "verified" })}
					>
						Verified Only
					</Button>
					<Button
						variant={filters.verification === "under_review" ? "default" : "outline"}
						className="w-full justify-start"
						size="sm"
						onClick={() => setFilters({ verification: "under_review" })}
					>
						Under Review
					</Button>
				</div>
			</div>

			<Separator />

			<div>
				<h3 className="font-semibold mb-3">Minimum Rating</h3>
				<div className="space-y-2">
					{[0, 3, 4, 4.5].map((rating) => (
						<Button
							key={rating}
							variant={filters.minRating === rating ? "default" : "outline"}
							className="w-full justify-start"
							size="sm"
							onClick={() => setFilters({ minRating: rating })}
						>
							<Star className="mr-2 h-4 w-4" />
							{rating === 0 ? "Any Rating" : `${rating}+ Stars`}
						</Button>
					))}
				</div>
			</div>

			<Separator />

			<div>
				<div className="flex items-center justify-between mb-3">
					<h3 className="font-semibold">Site Linking</h3>
				</div>
				<Button
					variant={filters.hasNoSiteLink ? "default" : "outline"}
					className="w-full justify-start"
					size="sm"
					onClick={() => setFilters({ hasNoSiteLink: !filters.hasNoSiteLink })}
				>
					Orphaned Content Only
				</Button>
			</div>

			<Separator />

			<div>
				<h3 className="font-semibold mb-3">Civilization</h3>
				<ScrollArea className="h-48">
					<div className="space-y-1">
						{allCivilizations.map((civ) => (
							<Button
								key={civ}
								variant={filters.civilizations.includes(civ as string) ? "default" : "ghost"}
								className="w-full justify-start"
								size="sm"
								onClick={() => toggleCivilization(civ as string)}
							>
								{civ}
							</Button>
						))}
					</div>
				</ScrollArea>
			</div>

			<Separator />

			<div>
				<h3 className="font-semibold mb-3">Era</h3>
				<ScrollArea className="h-48">
					<div className="space-y-1">
						{allEras.map((era) => (
							<Button
								key={era}
								variant={filters.eras.includes(era as string) ? "default" : "ghost"}
								className="w-full justify-start"
								size="sm"
								onClick={() => toggleEra(era as string)}
							>
								{era}
							</Button>
						))}
					</div>
				</ScrollArea>
			</div>

			<Separator />

			<div>
				<h3 className="font-semibold mb-3">Tags</h3>
				<ScrollArea className="h-48">
					<div className="flex flex-wrap gap-1">
						{allTags.slice(0, 20).map((tag) => (
							<Badge key={tag} variant={filters.tags.includes(tag) ? "default" : "outline"} className="cursor-pointer" onClick={() => toggleTag(tag)}>
								#{tag}
							</Badge>
						))}
					</div>
				</ScrollArea>
			</div>
		</div>
	);

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-wrap items-center justify-between gap-4">
				<div>
					<h1 className="text-3xl font-semibold">Browse Content</h1>
					<p className="text-sm text-muted-foreground">Explore all submitted content across sites, media, texts, and more</p>
				</div>
				<Button asChild>
					<Link href="/content/upload">Upload Content</Link>
				</Button>
			</div>

			{/* Search and Controls */}
			<Card className="glass-panel border-border/40">
				<CardContent className="pt-6">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center">
						{/* Search */}
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
							<Input placeholder="Search all content..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
						</div>

						{/* Sort */}
						<div className="flex items-center gap-2">
							<Label className="text-sm text-muted-foreground">Sort:</Label>
							{sortOptions.map((option) => (
								<Button
									key={option.value}
									variant={filters.sortBy === option.value ? "default" : "outline"}
									size="sm"
									onClick={() => setFilters({ sortBy: option.value as "recent" | "popular" | "rating" | "comments" })}
								>
									{option.label}
								</Button>
							))}
						</div>

						{/* View Mode */}
						<div className="flex items-center gap-2">
							<Button variant={viewMode === "grid" ? "default" : "outline"} size="sm" onClick={() => setViewMode("grid")}>
								<Grid3x3 className="h-4 w-4" />
							</Button>
							<Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")}>
								<List className="h-4 w-4" />
							</Button>

							{/* Mobile Filter Toggle */}
							<Sheet open={showFilters} onOpenChange={setShowFilters}>
								<SheetTrigger asChild className="lg:hidden">
									<Button variant="outline" size="sm">
										<SlidersHorizontal className="mr-2 h-4 w-4" />
										Filters
										{hasActiveFilters && (
											<Badge variant="warning" className="ml-2 h-4 px-1">
												{filters.types.length + filters.civilizations.length + filters.eras.length + filters.tags.length}
											</Badge>
										)}
									</Button>
								</SheetTrigger>
								<SheetContent side="left" className="w-80">
									<SheetHeader>
										<SheetTitle>Filters</SheetTitle>
										<SheetDescription>Refine your content search</SheetDescription>
									</SheetHeader>
									<ScrollArea className="h-[calc(100vh-8rem)] mt-6">
										<FiltersSidebar />
									</ScrollArea>
								</SheetContent>
							</Sheet>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Active Filters */}
			{hasActiveFilters && (
				<div className="flex flex-wrap items-center gap-2">
					<span className="text-sm text-muted-foreground">Active filters:</span>
					{filters.types.map((type) => (
						<Badge key={type} variant="secondary" className="gap-1">
							{type}
							<X className="h-3 w-3 cursor-pointer" onClick={() => toggleType(type)} />
						</Badge>
					))}
					{filters.civilizations.map((civ) => (
						<Badge key={civ} variant="secondary" className="gap-1">
							{civ}
							<X className="h-3 w-3 cursor-pointer" onClick={() => toggleCivilization(civ)} />
						</Badge>
					))}
					{filters.eras.map((era) => (
						<Badge key={era} variant="secondary" className="gap-1">
							{era}
							<X className="h-3 w-3 cursor-pointer" onClick={() => toggleEra(era)} />
						</Badge>
					))}
					{filters.tags.map((tag) => (
						<Badge key={tag} variant="secondary" className="gap-1">
							#{tag}
							<X className="h-3 w-3 cursor-pointer" onClick={() => toggleTag(tag)} />
						</Badge>
					))}
					<Button variant="ghost" size="sm" onClick={clearFilters}>
						Clear All
					</Button>
				</div>
			)}

			{/* Results */}
			<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
				{/* Desktop Filters Sidebar */}
				<div className="hidden lg:block">
					<Card className="glass-panel border-border/40 sticky top-20">
						<CardContent className="pt-6">
							<div className="flex items-center justify-between mb-4">
								<h2 className="font-semibold">Filters</h2>
								{hasActiveFilters && (
									<Button variant="ghost" size="sm" onClick={clearFilters}>
										Clear
									</Button>
								)}
							</div>
							<ScrollArea className="h-[calc(100vh-12rem)]">
								<FiltersSidebar />
							</ScrollArea>
						</CardContent>
					</Card>
				</div>

				{/* Content Grid/List */}
				<div className="lg:col-span-3 space-y-4">
					<div className="text-sm text-muted-foreground">
						Showing {filteredContent.length} {filteredContent.length === 1 ? "item" : "items"}
					</div>

					{viewMode === "grid" ? (
						<div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
							{filteredContent.map((content) => (
								<ContentCard key={content.id} content={content} variant="compact" onLike={handleLike} onBookmark={handleBookmark} />
							))}
						</div>
					) : (
						<div className="space-y-4">
							{filteredContent.map((content) => (
								<ContentCard key={content.id} content={content} variant="list" onLike={handleLike} onBookmark={handleBookmark} />
							))}
						</div>
					)}

					{/* Empty State */}
					{filteredContent.length === 0 && (
						<Card className="glass-panel border-border/40">
							<CardContent className="flex flex-col items-center justify-center py-12 text-center">
								<Search className="h-12 w-12 text-muted-foreground mb-4" />
								<p className="text-lg font-medium text-muted-foreground mb-2">No content found</p>
								<p className="text-sm text-muted-foreground mb-4">Try adjusting your filters or search terms</p>
								<Button
									variant="outline"
									onClick={() => {
										clearFilters();
										setSearchTerm("");
									}}
								>
									Clear All Filters
								</Button>
							</CardContent>
						</Card>
					)}
				</div>
			</div>
		</div>
	);
}

export default function BrowsePage() {
	return (
		<Suspense fallback={<div className="p-6">Loading...</div>}>
			<BrowsePageContent />
		</Suspense>
	);
}
