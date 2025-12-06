"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { PanelLeftClose, PanelLeft, Plus, Search, X } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
import { useSearchParams } from "next/navigation";
import { cn } from "@/shared/lib/utils";
import { zClass } from "@/shared/lib/z-index";
import type { BoundingBox, MapSiteFeature, MapZoneFeature } from "@/entities/map/model/types";
import { useMapStore, applySiteFilters } from "@/features/map-explorer/model/map-store";
import { ActivityFeed } from "./activity-feed";
import { SiteSlideOver } from "./site-slide-over";
import { SiteEditor } from "./site-editor";
import { ZoneEditor } from "./zone-editor";
import { loadMapData } from "../actions";
import type L from "leaflet";

const SiteMap = dynamic(() => import("./site-map").then((module) => module.SiteMap), {
	ssr: false,
});

interface SiteExplorerProps {
	initialSites: MapSiteFeature[];
	initialZones: MapZoneFeature[];
	initialBounds: BoundingBox;
}

const toBoundingBox = (bounds: L.LatLngBounds): BoundingBox => ({
	minLat: bounds.getSouthWest().lat,
	minLng: bounds.getSouthWest().lng,
	maxLat: bounds.getNorthEast().lat,
	maxLng: bounds.getNorthEast().lng,
});

const QUICK_FILTERS = [
	{ id: "recent", label: "Recent" },
	{ id: "verified", label: "Verified" },
	{ id: "megalithic", label: "Megalithic" },
	{ id: "egypt", label: "Egypt" },
	{ id: "americas", label: "Americas" },
];

export const SiteExplorer = ({ initialSites, initialZones, initialBounds }: SiteExplorerProps) => {
	const { sites, zones, filters, selectedSiteId, selectSite, initialize, replaceData, setBounds } = useMapStore();

	const searchParams = useSearchParams();
	const [activeEditor, setActiveEditor] = useState<"site" | "zone" | null>(null);
	const [pendingCoordinates, setPendingCoordinates] = useState<{ lat: number; lng: number } | null>(null);
	const [isPending, startTransition] = useTransition();
	const [isHydrated, setHydrated] = useState(false);
	const lastBoundsRef = useRef<BoundingBox | null>(null);
	const mapRef = useRef<L.Map | null>(null);

	// UI state
	const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
	const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
	const [activeQuickFilters, setActiveQuickFilters] = useState<string[]>([]);
	const [searchQuery, setSearchQuery] = useState("");

	useEffect(() => {
		if (activeEditor !== "site") {
			setPendingCoordinates(null);
		}
	}, [activeEditor]);

	useEffect(() => {
		initialize({ sites: initialSites, zones: initialZones, bounds: initialBounds });
		lastBoundsRef.current = initialBounds;
		setHydrated(true);
	}, [initialize, initialSites, initialZones, initialBounds]);

	const filteredSites = useMemo(() => applySiteFilters(sites, filters), [sites, filters]);
	const selectedSite = useMemo(() => sites.find((site) => site.id === selectedSiteId) ?? null, [sites, selectedSiteId]);

	// Open slide-over when site is selected
	useEffect(() => {
		if (selectedSiteId && selectedSite) {
			setIsSlideOverOpen(true);
		}
	}, [selectedSiteId, selectedSite]);

	const focusParam = searchParams.get("focus");
	const projectParam = searchParams.get("project");
	const siteParam = searchParams.get("site");

	useEffect(() => {
		if (!sites.length || !isHydrated) return;

		if (focusParam) {
			selectSite(focusParam);
			return;
		}

		if (siteParam) {
			selectSite(siteParam);
			return;
		}

		if (projectParam) {
			const relatedSite = sites.find((site) => site.relatedResearchIds.includes(projectParam));
			if (relatedSite) {
				selectSite(relatedSite.id);
			}
		}
	}, [focusParam, projectParam, siteParam, selectSite, sites, isHydrated]);

	const handleBoundsChange = useCallback(
		(bounds: L.LatLngBounds) => {
			if (!isHydrated || selectedSiteId) return;
			const nextBounds = toBoundingBox(bounds);
			const last = lastBoundsRef.current;
			const hasMeaningfulChange =
				!last ||
				Math.abs(nextBounds.minLat - last.minLat) > 1.0 ||
				Math.abs(nextBounds.minLng - last.minLng) > 1.0 ||
				Math.abs(nextBounds.maxLat - last.maxLat) > 1.0 ||
				Math.abs(nextBounds.maxLng - last.maxLng) > 1.0;

			if (!hasMeaningfulChange) return;
			lastBoundsRef.current = nextBounds;
			setBounds(nextBounds);

			const layersFilter = filters.layer === "composite" ? undefined : [filters.layer];
			const verificationFilter = filters.verification === "all" ? undefined : [filters.verification];
			const zoneFilter = filters.zones.length ? filters.zones : undefined;
			const tagFilter = filters.tags.length ? filters.tags : undefined;

			startTransition(async () => {
				try {
					const payload = await loadMapData({
						bounds: nextBounds,
						layers: layersFilter,
						verification: verificationFilter,
						zoneIds: zoneFilter,
						tags: tagFilter,
					});
					replaceData({ sites: payload.sites, zones: payload.zones });
				} catch (error) {
					console.error("Failed to refresh map data", error);
				}
			});
		},
		[filters.layer, filters.tags, filters.verification, filters.zones, isHydrated, replaceData, setBounds, selectedSiteId]
	);

	const handleSelectSite = useCallback(
		(siteId: string) => {
			selectSite(siteId);
			setIsSlideOverOpen(true);
		},
		[selectSite]
	);

	const handleFocusSite = useCallback(
		(siteId: string) => {
			const site = sites.find((s) => s.id === siteId);
			if (site && mapRef.current) {
				mapRef.current.flyTo([site.coordinates.lat, site.coordinates.lng], 8, { duration: 0.8 });
			}
			selectSite(siteId);
		},
		[sites, selectSite]
	);

	const handleCloseSlideOver = useCallback(() => {
		setIsSlideOverOpen(false);
		selectSite(null);
	}, [selectSite]);

	const toggleQuickFilter = (filterId: string) => {
		setActiveQuickFilters((prev) => (prev.includes(filterId) ? prev.filter((f) => f !== filterId) : [...prev, filterId]));
	};

	return (
		// Height: subtract topbar + padding + bottom nav on mobile, just topbar + padding on desktop
		<div className="relative flex h-[calc(100dvh-10rem)] sm:h-[calc(100dvh-9rem)] md:h-[calc(100dvh-7rem)] w-full overflow-hidden rounded-xl border border-border/40 bg-card/30">
			{/* Activity Feed Panel - Desktop only */}
			<aside
				className={cn(
					"hidden lg:flex flex-col shrink-0 border-r border-border/30 bg-card/60 transition-all duration-300 overflow-hidden",
					isPanelCollapsed ? "w-0" : "w-72"
				)}
			>
				<ActivityFeed
					sites={filteredSites}
					selectedSiteId={selectedSiteId}
					onSelectSite={handleSelectSite}
					onFocusSite={handleFocusSite}
					className="h-full"
				/>
			</aside>

			{/* Main Map Area */}
			<div className="relative flex-1 flex flex-col min-w-0">
				{/* Floating controls */}
				<div className={cn("absolute top-3 left-3 right-3 flex items-center gap-2", zClass.mapControls)}>
					{/* Panel toggle - Desktop */}
					<Button
						size="icon"
						variant="secondary"
						className="hidden lg:flex h-9 w-9 shrink-0 bg-card/95 backdrop-blur shadow-md"
						onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
					>
						{isPanelCollapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
					</Button>

					{/* Search bar - visible on all screen sizes */}
					<div className="flex-1 max-w-sm">
						<div className="relative">
							<Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder="Search sites..."
								className="h-9 pl-9 pr-8 bg-card/95 backdrop-blur shadow-md text-sm"
							/>
							{searchQuery && (
								<Button
									size="icon"
									variant="ghost"
									className="absolute right-0.5 top-1/2 -translate-y-1/2 h-8 w-8"
									onClick={() => setSearchQuery("")}
								>
									<X className="h-3.5 w-3.5" />
								</Button>
							)}
						</div>
					</div>

					{/* Actions */}
					<div className="flex items-center gap-2">
						{isPending && (
							<Badge variant="outline" className="hidden sm:flex bg-card/95 text-xs">
								Loading...
							</Badge>
						)}
						<Button
							size="sm"
							className="h-9 bg-card/95 backdrop-blur shadow-md"
							variant="secondary"
							onClick={() => setActiveEditor((prev) => (prev === "site" ? null : "site"))}
						>
							<Plus className="h-4 w-4 sm:mr-1.5" />
							<span className="hidden sm:inline">Add Site</span>
						</Button>
					</div>
				</div>

				{/* Quick filter chips */}
				<div className={cn("absolute top-14 left-3 flex gap-1.5 overflow-x-auto max-w-[calc(100%-1.5rem)] pb-1", zClass.mapFilters)}>
					{QUICK_FILTERS.map((filter) => (
						<button
							key={filter.id}
							onClick={() => toggleQuickFilter(filter.id)}
							className={cn(
								"shrink-0 rounded-full px-2.5 py-1 text-xs font-medium transition-all shadow-md",
								activeQuickFilters.includes(filter.id)
									? "bg-primary text-primary-foreground"
									: "bg-card/95 backdrop-blur text-foreground hover:bg-card"
							)}
						>
							{filter.label}
						</button>
					))}
				</div>

				{/* Floating editors */}
				{activeEditor === "site" && (
					<div className={cn("absolute top-24 left-3 right-3 max-w-md", zClass.mapEditors)}>
						<SiteEditor
							className="border border-primary/40 bg-card shadow-xl rounded-xl"
							zones={zones}
							site={selectedSite}
							onClose={() => setActiveEditor(null)}
							pendingCoordinates={pendingCoordinates}
						/>
					</div>
				)}

				{activeEditor === "zone" && (
					<div className={cn("absolute top-24 left-3 right-3 max-w-md", zClass.mapEditors)}>
						<ZoneEditor className="border border-secondary/40 bg-card shadow-xl rounded-xl" onClose={() => setActiveEditor(null)} />
					</div>
				)}

				{/* Map */}
				<SiteMap
					sites={filteredSites}
					zones={zones}
					selectedSiteId={selectedSiteId}
					onSelect={handleSelectSite}
					className="h-full w-full"
					onBoundsChange={handleBoundsChange}
					onMapClick={(lat, lng) => {
						if (activeEditor === "site") {
							setPendingCoordinates({ lat, lng });
						}
					}}
					onMapReady={(map) => {
						mapRef.current = map;
					}}
				/>
			</div>

			{/* Site Detail Slide-over */}
			<SiteSlideOver site={selectedSite} isOpen={isSlideOverOpen} onClose={handleCloseSlideOver} />
		</div>
	);
};
