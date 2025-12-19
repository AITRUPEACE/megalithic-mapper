"use client";

import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import type { MapFilters, CommunityTier, SiteCategory } from "@/entities/map/model/types";
import { cn } from "@/shared/lib/utils";
import { Shield, Users, Layers } from "lucide-react";

interface SiteFiltersProps {
	filters: MapFilters;
	availableCultures: string[];
	availableEras: string[];
	availableSiteTypes: string[];
	availableCommunityTiers: CommunityTier[];
	availableCategories: SiteCategory[];
	availableZones: { id: string; name: string }[];
	availableTags: string[];
	onUpdate: (update: Partial<MapFilters>) => void;
	onClear: () => void;
	className?: string;
	variant?: "card" | "flat";
	siteCounts?: {
		official: number;
		community: number;
		total: number;
	};
}

export const SiteFilters = ({
	filters,
	availableCultures,
	availableEras,
	availableSiteTypes,
	availableCommunityTiers,
	availableCategories,
	availableZones,
	availableTags,
	onUpdate,
	onClear,
	className,
	variant = "card",
	siteCounts,
}: SiteFiltersProps) => {
	const toggleArrayValue = <T extends string>(current: T[], value: T) =>
		current.includes(value) ? current.filter((item) => item !== value) : [...current, value];

	const containerClasses =
		variant === "card"
			? "glass-panel space-y-3 border-border/40 p-5"
			: "flex flex-col gap-3 rounded-2xl border border-border/40 bg-background/20 p-4";

	return (
		<div className={cn(containerClasses, className)}>
			<div>
				<Input
					placeholder="Search by site name..."
					value={filters.search}
					onChange={(event) => onUpdate({ search: event.target.value })}
					className="w-full"
				/>
			</div>

			{/* Enhanced Layer Toggle - More Prominent */}
			<div className="rounded-lg border-2 border-border/60 bg-background/50 p-3">
				<div className="flex items-center justify-between mb-2">
					<p className="text-sm font-semibold text-foreground flex items-center gap-2">
						<Layers className="h-4 w-4" />
						Map Layer
					</p>
					{siteCounts && <span className="text-xs text-muted-foreground">{siteCounts.total} sites</span>}
				</div>
				<div className="flex rounded-lg bg-muted/50 p-1 gap-1">
					{/* Official */}
					<button
						onClick={() =>
							onUpdate({
								layer: "official",
								communityTiers: [],
							})
						}
						className={cn(
							"flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all",
							filters.layer === "official" ? "bg-blue-600 text-white shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted"
						)}
					>
						<Shield className="h-4 w-4" />
						<span>Official</span>
						{siteCounts && (
							<span
								className={cn(
									"ml-1 px-1.5 py-0.5 text-xs rounded-full",
									filters.layer === "official" ? "bg-white/20" : "bg-blue-500/20 text-blue-400"
								)}
							>
								{siteCounts.official}
							</span>
						)}
					</button>

					{/* Community */}
					<button
						onClick={() =>
							onUpdate({
								layer: "community",
							})
						}
						className={cn(
							"flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all",
							filters.layer === "community" ? "bg-emerald-600 text-white shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted"
						)}
					>
						<Users className="h-4 w-4" />
						<span>Community</span>
						{siteCounts && (
							<span
								className={cn(
									"ml-1 px-1.5 py-0.5 text-xs rounded-full",
									filters.layer === "community" ? "bg-white/20" : "bg-emerald-500/20 text-emerald-400"
								)}
							>
								{siteCounts.community}
							</span>
						)}
					</button>

					{/* Combined */}
					<button
						onClick={() =>
							onUpdate({
								layer: "composite",
							})
						}
						className={cn(
							"flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all",
							filters.layer === "composite" ? "bg-purple-600 text-white shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted"
						)}
					>
						<Layers className="h-4 w-4" />
						<span>All</span>
						{siteCounts && (
							<span
								className={cn(
									"ml-1 px-1.5 py-0.5 text-xs rounded-full",
									filters.layer === "composite" ? "bg-white/20" : "bg-purple-500/20 text-purple-400"
								)}
							>
								{siteCounts.total}
							</span>
						)}
					</button>
				</div>
				<p className="mt-2 text-[11px] text-muted-foreground">
					{filters.layer === "official" && "Verified sites from archaeological databases"}
					{filters.layer === "community" && "User-submitted discoveries awaiting verification"}
					{filters.layer === "composite" && "All sites from both official and community sources"}
				</p>
			</div>

			{availableCategories.length > 0 && (
				<div>
					<p className="text-sm font-semibold text-foreground">Entry type</p>
					<div className="mt-2 flex flex-wrap gap-2 sm:flex-nowrap sm:overflow-x-auto sm:pr-2">
						{availableCategories.map((category) => {
							const isActive = filters.categories.includes(category);
							const labelMap: Record<SiteCategory, string> = {
								site: "Sites",
								artifact: "Artifacts",
								text: "Texts",
							};
							return (
								<Button
									key={category}
									size="sm"
									variant={isActive ? "secondary" : "ghost"}
									className={cn("rounded-full sm:shrink-0", isActive && "border border-primary/40")}
									onClick={() => onUpdate({ categories: toggleArrayValue(filters.categories, category) })}
								>
									{labelMap[category]}
								</Button>
							);
						})}
					</div>
				</div>
			)}

			<div>
				<p className="text-sm font-semibold text-foreground">Cultures</p>
				<div className="mt-2 flex flex-wrap gap-2 sm:flex-nowrap sm:overflow-x-auto sm:pr-2">
					{availableCultures.map((culture) => {
						const isActive = filters.cultures.includes(culture);
						return (
							<Button
								key={culture}
								size="sm"
								variant={isActive ? "secondary" : "ghost"}
								className={cn("rounded-full sm:shrink-0", isActive && "border border-primary/40")}
								onClick={() => onUpdate({ cultures: toggleArrayValue(filters.cultures, culture) })}
							>
								{culture}
							</Button>
						);
					})}
				</div>
			</div>

			<div>
				<p className="text-sm font-semibold text-foreground">Eras</p>
				<div className="mt-2 flex flex-wrap gap-2 sm:flex-nowrap sm:overflow-x-auto sm:pr-2">
					{availableEras.map((era) => {
						const isActive = filters.eras.includes(era);
						return (
							<Button
								key={era}
								size="sm"
								variant={isActive ? "secondary" : "ghost"}
								className={cn("rounded-full sm:shrink-0", isActive && "border border-primary/40")}
								onClick={() => onUpdate({ eras: toggleArrayValue(filters.eras, era) })}
							>
								{era}
							</Button>
						);
					})}
				</div>
			</div>

			<div>
				<p className="text-sm font-semibold text-foreground">Site types</p>
				<div className="mt-2 flex flex-wrap gap-2 sm:flex-nowrap sm:overflow-x-auto sm:pr-2">
					{availableSiteTypes.map((type) => {
						const isActive = filters.siteTypes.includes(type);
						return (
							<Button
								key={type}
								size="sm"
								variant={isActive ? "secondary" : "ghost"}
								className={cn("rounded-full sm:shrink-0", isActive && "border border-primary/40")}
								onClick={() => onUpdate({ siteTypes: toggleArrayValue(filters.siteTypes, type) })}
							>
								{type}
							</Button>
						);
					})}
				</div>
			</div>

			{availableZones.length > 0 && (
				<div>
					<p className="text-sm font-semibold text-foreground">Zones</p>
					<div className="mt-2 flex flex-wrap gap-2 sm:flex-nowrap sm:overflow-x-auto sm:pr-2">
						{availableZones.map((zone) => {
							const isActive = filters.zones.includes(zone.id);
							return (
								<Button
									key={zone.id}
									size="sm"
									variant={isActive ? "secondary" : "ghost"}
									className={cn("rounded-full sm:shrink-0", isActive && "border border-primary/40")}
									onClick={() => onUpdate({ zones: toggleArrayValue(filters.zones, zone.id) })}
								>
									{zone.name}
								</Button>
							);
						})}
					</div>
				</div>
			)}

			{availableTags.length > 0 && (
				<div>
					<p className="text-sm font-semibold text-foreground">Themes</p>
					<div className="mt-2 flex flex-wrap gap-2 sm:flex-nowrap sm:overflow-x-auto sm:pr-2">
						{availableTags.map((tag) => {
							const isActive = filters.tags.includes(tag);
							return (
								<Button
									key={tag}
									size="sm"
									variant={isActive ? "secondary" : "ghost"}
									className={cn("rounded-full sm:shrink-0", isActive && "border border-primary/40")}
									onClick={() => onUpdate({ tags: toggleArrayValue(filters.tags, tag) })}
								>
									#{tag}
								</Button>
							);
						})}
					</div>
				</div>
			)}

			{availableCommunityTiers.length > 0 && filters.layer !== "official" && (
				<div>
					<p className="text-sm font-semibold text-foreground">Community tier</p>
					<div className="mt-2 flex flex-wrap gap-2 sm:flex-nowrap sm:overflow-x-auto sm:pr-2">
						{availableCommunityTiers.map((tier) => {
							const isActive = filters.communityTiers.includes(tier);
							const labelMap: Record<CommunityTier, string> = {
								bronze: "Bronze",
								silver: "Silver",
								gold: "Gold",
								promoted: "Promoted",
							};
							return (
								<Button
									key={tier}
									size="sm"
									variant={isActive ? "secondary" : "ghost"}
									className={cn("rounded-full sm:shrink-0", isActive && "border border-primary/40")}
									onClick={() =>
										onUpdate({
											communityTiers: toggleArrayValue(filters.communityTiers, tier),
										})
									}
								>
									{labelMap[tier]}
								</Button>
							);
						})}
					</div>
				</div>
			)}

			<div className="flex flex-wrap items-center gap-3">
				<Button
					size="sm"
					variant={filters.verification === "verified" ? "secondary" : "ghost"}
					onClick={() => onUpdate({ verification: filters.verification === "verified" ? "all" : "verified" })}
				>
					Verified only
				</Button>
				<Button size="sm" variant={filters.researchOnly ? "secondary" : "ghost"} onClick={() => onUpdate({ researchOnly: !filters.researchOnly })}>
					Linked to research projects
				</Button>
				<Button size="sm" variant="ghost" onClick={onClear}>
					Reset filters
				</Button>
			</div>
		</div>
	);
};
