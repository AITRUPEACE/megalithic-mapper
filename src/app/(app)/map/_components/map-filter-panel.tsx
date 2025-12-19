"use client";

import { useState } from "react";
import { X, Filter, ChevronDown, ChevronUp, Flame, RotateCcw } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import type { MapFilters, ImportanceTier } from "@/entities/map/model/types";
import { SITE_TYPES, type SiteTypeId } from "./site-map";

interface MapFilterPanelProps {
	filters: MapFilters;
	onFiltersChange: (update: Partial<MapFilters>) => void;
	onClearFilters: () => void;
	meta?: {
		total: number;
		showing: number;
		hasMore: boolean;
		hiddenCount: number;
	};
	className?: string;
	isOpen: boolean;
	onToggle: () => void;
}

// Importance tier configuration
const IMPORTANCE_TIERS: { id: ImportanceTier; label: string; minScore: number; color: string }[] = [
	{ id: "landmark", label: "Landmarks", minScore: 80, color: "#f59e0b" },
	{ id: "major", label: "Major", minScore: 60, color: "#8b5cf6" },
	{ id: "notable", label: "Notable", minScore: 40, color: "#3b82f6" },
	{ id: "minor", label: "Minor", minScore: 0, color: "#64748b" },
];

// Quick filter presets
const PRESETS = [
	{ id: "landmarks", label: "Landmarks Only", minImportance: 80, tiers: ["landmark" as ImportanceTier] },
	{ id: "major", label: "Major Sites", minImportance: 60, tiers: ["landmark", "major"] as ImportanceTier[] },
	{ id: "all", label: "All Sites", minImportance: 0, tiers: [] as ImportanceTier[] },
];

export const MapFilterPanel = ({ filters, onFiltersChange, onClearFilters, meta, className, isOpen, onToggle }: MapFilterPanelProps) => {
	const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
		siteTypes: true,
		importance: true,
	});

	const toggleSection = (section: string) => {
		setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
	};

	// Count active filters
	const activeFilterCount =
		filters.siteTypes.length + (filters.minImportance > 0 ? 1 : 0) + filters.importanceTiers.length + (filters.showTrending ? 1 : 0);

	// Toggle site type filter
	const toggleSiteType = (typeId: string) => {
		const current = filters.siteTypes;
		const next = current.includes(typeId) ? current.filter((t) => t !== typeId) : [...current, typeId];
		onFiltersChange({ siteTypes: next });
	};

	// Toggle importance tier
	const toggleImportanceTier = (tier: ImportanceTier) => {
		const current = filters.importanceTiers;
		const next = current.includes(tier) ? current.filter((t) => t !== tier) : [...current, tier];
		onFiltersChange({ importanceTiers: next });
	};

	// Apply preset
	const applyPreset = (preset: (typeof PRESETS)[number]) => {
		onFiltersChange({
			minImportance: preset.minImportance,
			importanceTiers: preset.tiers,
		});
	};

	// Check if preset is active
	const isPresetActive = (preset: (typeof PRESETS)[number]) => {
		return (
			filters.minImportance === preset.minImportance &&
			filters.importanceTiers.length === preset.tiers.length &&
			preset.tiers.every((t) => filters.importanceTiers.includes(t))
		);
	};

	if (!isOpen) {
		return (
			<Button variant="secondary" size="sm" className={cn("gap-1.5 bg-card/95 backdrop-blur shadow-md", className)} onClick={onToggle}>
				<Filter className="h-4 w-4" />
				<span className="hidden sm:inline">Filters</span>
				{activeFilterCount > 0 && (
					<span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
						{activeFilterCount}
					</span>
				)}
			</Button>
		);
	}

	return (
		<div className={cn("bg-card/95 backdrop-blur rounded-xl border border-border/50 shadow-lg w-72", className)}>
			{/* Header */}
			<div className="flex items-center justify-between px-3 py-2 border-b border-border/30">
				<div className="flex items-center gap-2">
					<Filter className="h-4 w-4 text-muted-foreground" />
					<span className="text-sm font-medium">Filters</span>
					{activeFilterCount > 0 && (
						<span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
							{activeFilterCount}
						</span>
					)}
				</div>
				<div className="flex items-center gap-1">
					{activeFilterCount > 0 && (
						<Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClearFilters} title="Clear filters">
							<RotateCcw className="h-3.5 w-3.5" />
						</Button>
					)}
					<Button variant="ghost" size="icon" className="h-7 w-7" onClick={onToggle}>
						<X className="h-4 w-4" />
					</Button>
				</div>
			</div>

			<div className="max-h-[60vh] overflow-y-auto">
				{/* Quick Presets */}
				<div className="px-3 py-2 border-b border-border/30">
					<div className="flex flex-wrap gap-1.5">
						{PRESETS.map((preset) => (
							<button
								key={preset.id}
								onClick={() => applyPreset(preset)}
								className={cn(
									"px-2.5 py-1 rounded-full text-xs font-medium transition-colors",
									isPresetActive(preset) ? "bg-primary text-primary-foreground" : "bg-secondary/50 text-foreground hover:bg-secondary"
								)}
							>
								{preset.label}
							</button>
						))}
					</div>
				</div>

				{/* Site Types Section */}
				<div className="border-b border-border/30">
					<button
						className="flex items-center justify-between w-full px-3 py-2 text-left hover:bg-secondary/30 transition-colors"
						onClick={() => toggleSection("siteTypes")}
					>
						<span className="text-sm font-medium">Site Types</span>
						<div className="flex items-center gap-2">
							{filters.siteTypes.length > 0 && <span className="text-xs text-muted-foreground">{filters.siteTypes.length} selected</span>}
							{expandedSections.siteTypes ? (
								<ChevronUp className="h-4 w-4 text-muted-foreground" />
							) : (
								<ChevronDown className="h-4 w-4 text-muted-foreground" />
							)}
						</div>
					</button>

					{expandedSections.siteTypes && (
						<div className="px-3 pb-3 grid grid-cols-2 gap-1.5">
							{Object.entries(SITE_TYPES).map(([typeId, typeConfig]) => {
								const isSelected = filters.siteTypes.includes(typeId);
								return (
									<button
										key={typeId}
										onClick={() => toggleSiteType(typeId)}
										className={cn(
											"flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-medium transition-colors text-left",
											isSelected ? "bg-primary/20 text-primary ring-1 ring-primary/50" : "bg-secondary/30 text-foreground hover:bg-secondary/50"
										)}
									>
										<span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: typeConfig.color }} />
										<span className="truncate">{typeConfig.name}</span>
									</button>
								);
							})}
						</div>
					)}
				</div>

				{/* Importance Section */}
				<div className="border-b border-border/30">
					<button
						className="flex items-center justify-between w-full px-3 py-2 text-left hover:bg-secondary/30 transition-colors"
						onClick={() => toggleSection("importance")}
					>
						<span className="text-sm font-medium">Importance</span>
						{expandedSections.importance ? (
							<ChevronUp className="h-4 w-4 text-muted-foreground" />
						) : (
							<ChevronDown className="h-4 w-4 text-muted-foreground" />
						)}
					</button>

					{expandedSections.importance && (
						<div className="px-3 pb-3 space-y-3">
							{/* Importance Slider */}
							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<span className="text-xs text-muted-foreground">Minimum Score</span>
									<span className="text-xs font-medium">{filters.minImportance}</span>
								</div>
								<input
									type="range"
									min="0"
									max="100"
									value={filters.minImportance}
									onChange={(e) => onFiltersChange({ minImportance: parseInt(e.target.value, 10) })}
									className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
								/>
								<div className="flex justify-between text-[10px] text-muted-foreground">
									<span>All</span>
									<span>Notable</span>
									<span>Major</span>
									<span>Landmark</span>
								</div>
							</div>

							{/* Tier Toggles */}
							<div className="flex flex-wrap gap-1.5">
								{IMPORTANCE_TIERS.map((tier) => {
									const isSelected = filters.importanceTiers.includes(tier.id);
									return (
										<button
											key={tier.id}
											onClick={() => toggleImportanceTier(tier.id)}
											className={cn(
												"px-2 py-1 rounded-md text-xs font-medium transition-colors",
												isSelected ? "ring-1 ring-offset-1 ring-offset-background" : "bg-secondary/30 text-foreground hover:bg-secondary/50"
											)}
											style={{
												backgroundColor: isSelected ? `${tier.color}30` : undefined,
												color: isSelected ? tier.color : undefined,
												borderColor: isSelected ? tier.color : undefined,
											}}
										>
											{tier.label}
										</button>
									);
								})}
							</div>
						</div>
					)}
				</div>

				{/* Trending Toggle */}
				<div className="px-3 py-2 border-b border-border/30">
					<button
						onClick={() => onFiltersChange({ showTrending: !filters.showTrending })}
						className={cn(
							"flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm font-medium transition-colors",
							filters.showTrending
								? "bg-orange-500/20 text-orange-500 ring-1 ring-orange-500/50"
								: "bg-secondary/30 text-foreground hover:bg-secondary/50"
						)}
					>
						<Flame className={cn("h-4 w-4", filters.showTrending && "text-orange-500")} />
						<span>Show Trending Only</span>
					</button>
				</div>
			</div>

			{/* Footer with counts */}
			{meta && (
				<div className="px-3 py-2 border-t border-border/30 bg-secondary/20">
					<div className="text-xs text-muted-foreground">
						Showing <span className="font-medium text-foreground">{meta.showing}</span> of{" "}
						<span className="font-medium text-foreground">{meta.total}</span> sites
						{meta.hasMore && <span className="text-primary ml-1">• Zoom in to see {meta.hiddenCount} more</span>}
					</div>
				</div>
			)}
		</div>
	);
};

