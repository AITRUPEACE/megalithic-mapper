"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { Maximize2, Minimize2, Plus, Search, X, Map as MapIcon, List } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
import { useSearchParams } from "next/navigation";
import { cn } from "@/shared/lib/utils";
import { zClass } from "@/shared/lib/z-index";
import type { BoundingBox, MapSiteFeature, MapZoneFeature } from "@/entities/map/model/types";
import { useMapStore, applySiteFilters } from "@/features/map-explorer/model/map-store";
import { HomeFeed } from "./home-feed";
import { SiteSlideOver } from "./site-slide-over";
import { SiteEditor } from "./site-editor";
import { ZoneEditor } from "./zone-editor";
import { WhatsHotPanel, getSimulatedHeatData } from "./whats-hot-panel";
import { MapFilterPanel } from "./map-filter-panel";
import { loadMapData } from "../actions";
import { useIsMobile } from "@/shared/hooks/use-media-query";
import { MapTour } from "@/features/onboarding";
import { HelpCircle } from "lucide-react";
import type L from "leaflet";

// Dynamically import mobile explorer
const MobileSiteExplorer = dynamic(() => import("./mobile-site-explorer").then((mod) => mod.MobileSiteExplorer), { ssr: false });

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

type ViewMode = "split" | "map" | "feed";

export const SiteExplorer = ({ initialSites, initialZones, initialBounds }: SiteExplorerProps) => {
	const isMobile = useIsMobile();

	// Render mobile version on small screens
	if (isMobile) {
		return <MobileSiteExplorer initialSites={initialSites} initialZones={initialZones} initialBounds={initialBounds} />;
	}

	return <DesktopSiteExplorer initialSites={initialSites} initialZones={initialZones} initialBounds={initialBounds} />;
};

// Desktop version of the explorer
const DesktopSiteExplorer = ({ initialSites, initialZones, initialBounds }: SiteExplorerProps) => {
	const { sites, zones, filters, selectedSiteId, meta, zoom, selectSite, initialize, replaceData, setBounds, setZoom, setFilters, clearFilters } =
		useMapStore();

	const searchParams = useSearchParams();
	const [activeEditor, setActiveEditor] = useState<"site" | "zone" | null>(null);
	const [pendingCoordinates, setPendingCoordinates] = useState<{ lat: number; lng: number } | null>(null);
	const [isPending, startTransition] = useTransition();
	const [isHydrated, setHydrated] = useState(false);
	const lastBoundsRef = useRef<BoundingBox | null>(null);
	const mapRef = useRef<L.Map | null>(null);

	// UI state - default to split view showing both feed and map
	const [viewMode, setViewMode] = useState<ViewMode>("split");
	const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
	const [activeQuickFilters, setActiveQuickFilters] = useState<string[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
	const [isTourRunning, setIsTourRunning] = useState(false);

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

	// Add heat tier data to filtered sites for map display
	const sitesWithHeat = useMemo(() => getSimulatedHeatData(filteredSites), [filteredSites]);
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

	// Track zoom changes for smart loading
	const handleZoomChange = useCallback(
		(newZoom: number) => {
			setZoom(newZoom);
		},
		[setZoom]
	);

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
				// Only zoom in, never zoom out - keep current zoom if already zoomed in more
				const SITE_FOCUS_ZOOM = 8;
				const currentZoom = mapRef.current.getZoom();
				const targetZoom = Math.max(currentZoom, SITE_FOCUS_ZOOM);
				mapRef.current.flyTo([site.coordinates.lat, site.coordinates.lng], targetZoom, { duration: 0.8 });
			}
			selectSite(siteId);
			// If in feed-only mode, switch to split to show the map
			if (viewMode === "feed") {
				setViewMode("split");
			}
		},
		[sites, selectSite, viewMode]
	);

	// Invalidate map size when view mode changes to ensure tiles fill properly
	useEffect(() => {
		if (mapRef.current && (viewMode === "map" || viewMode === "split")) {
			// Small delay to allow CSS transitions to complete
			const timeout = setTimeout(() => {
				mapRef.current?.invalidateSize();
			}, 350);
			return () => clearTimeout(timeout);
		}
	}, [viewMode]);

	const handleCloseSlideOver = useCallback(() => {
		setIsSlideOverOpen(false);
		selectSite(null);
	}, [selectSite]);

	const toggleQuickFilter = (filterId: string) => {
		setActiveQuickFilters((prev) => (prev.includes(filterId) ? prev.filter((f) => f !== filterId) : [...prev, filterId]));
	};

	// Tour handlers
	const handleStartTour = useCallback(() => {
		// Ensure we're in map view for the tour
		if (viewMode === "feed") {
			setViewMode("split");
		}
		setIsTourRunning(true);
	}, [viewMode]);

	const handleTourComplete = useCallback(() => {
		setIsTourRunning(false);
	}, []);

	const handleTourSkip = useCallback(() => {
		setIsTourRunning(false);
	}, []);

	// Format sites for the tour (simple structure for matching)
	const sitesForTour = useMemo(
		() =>
			sites.map((s) => ({
				id: s.id,
				name: s.name,
				coordinates: s.coordinates,
			})),
		[sites]
	);

	// Calculate layout based on view mode
	// On mobile: show either feed or map (not split)
	// On desktop: can show split view
	const showFeed = viewMode === "split" || viewMode === "feed";
	const showMap = viewMode === "split" || viewMode === "map";

	return (
		<div className="relative flex h-[calc(100dvh-10rem)] sm:h-[calc(100dvh-9rem)] md:h-[calc(100dvh-7rem)] w-full overflow-hidden rounded-xl border border-border/40 bg-background">
			{/* Activity Feed Panel */}
			{showFeed && (
				<aside
					className={cn(
						"flex flex-col shrink-0 border-r border-border/30 bg-card transition-all duration-300 overflow-hidden",
						// On mobile: feed takes full width in split/feed mode
						// On desktop: feed has fixed width in split, full in feed mode
						viewMode === "feed" ? "flex-1" : "w-full md:w-[420px] lg:w-[480px]"
					)}
				>
					{/* Feed header with view controls */}
					<div className="flex items-center justify-between px-3 py-2 border-b border-border/30 bg-card">
						<div className="flex items-center gap-2">
							<span className="text-sm font-medium text-muted-foreground hidden sm:inline">View:</span>
							<div className="flex items-center gap-0.5 p-0.5 bg-secondary/30 rounded-lg">
								<button
									onClick={() => setViewMode("feed")}
									className={cn(
										"flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-colors",
										viewMode === "feed" ? "bg-foreground text-background shadow-sm" : "text-muted-foreground hover:text-foreground"
									)}
								>
									<List className="h-3.5 w-3.5" />
									Feed
								</button>
								<button
									onClick={() => setViewMode("split")}
									className={cn(
										"flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-colors hidden md:flex",
										viewMode === "split" ? "bg-foreground text-background shadow-sm" : "text-muted-foreground hover:text-foreground"
									)}
								>
									Split
								</button>
								<button
									onClick={() => setViewMode("map")}
									className={cn(
										"flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-colors",
										viewMode === "map" ? "bg-foreground text-background shadow-sm" : "text-muted-foreground hover:text-foreground"
									)}
								>
									<MapIcon className="h-3.5 w-3.5" />
									Map
								</button>
							</div>
						</div>
						{viewMode !== "map" && (
							<Button size="sm" variant="ghost" className="h-7 gap-1.5 text-xs md:flex hidden" onClick={() => setViewMode("map")}>
								<Maximize2 className="h-3.5 w-3.5" />
								Expand Map
							</Button>
						)}
					</div>

					<HomeFeed sites={filteredSites} onFocusSite={handleFocusSite} className="flex-1" />
				</aside>
			)}

			{/* Map Area - fills remaining space */}
			{showMap && (
				<div
					className={cn(
						"relative min-w-0 h-full",
						// Width: flex-1 on desktop split, full width on map mode
						viewMode === "map" ? "flex-1" : "flex-1 hidden md:block"
					)}
				>
					{/* Map controls overlay */}
					<div className={cn("absolute top-3 left-3 right-3 flex items-center gap-2", zClass.mapControls)}>
						{/* Back to feed button (mobile only, when in map mode) */}
						{viewMode === "map" && (
							<Button
								size="icon"
								variant="secondary"
								className="h-9 w-9 shrink-0 bg-card/95 backdrop-blur shadow-md md:hidden"
								onClick={() => setViewMode("feed")}
								title="Show Feed"
							>
								<List className="h-4 w-4" />
							</Button>
						)}
						{/* Collapse map button (desktop only, when expanded) */}
						{viewMode === "map" && (
							<Button
								size="icon"
								variant="secondary"
								className="h-9 w-9 shrink-0 bg-card/95 backdrop-blur shadow-md hidden md:flex"
								onClick={() => setViewMode("split")}
								title="Split View"
							>
								<Minimize2 className="h-4 w-4" />
							</Button>
						)}

						{/* Search bar */}
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
						<div className="flex items-center gap-2 relative">
							{isPending && (
								<Badge variant="outline" className="hidden sm:flex bg-card/95 text-xs">
									Loading...
								</Badge>
							)}
							{/* What's Hot Panel */}
							<WhatsHotPanel sites={filteredSites} onFocusSite={handleFocusSite} />
							{/* Tour Button */}
							<Button
								size="sm"
								className="h-9 bg-card/95 backdrop-blur shadow-md"
								variant="secondary"
								onClick={handleStartTour}
								title="Start guided tour"
							>
								<HelpCircle className="h-4 w-4 sm:mr-1.5" />
								<span className="hidden sm:inline">Tour</span>
							</Button>
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

					{/* Filter Panel */}
					<div className={cn("absolute top-14 left-3", zClass.mapFilters)}>
						<MapFilterPanel
							filters={filters}
							onFiltersChange={setFilters}
							onClearFilters={clearFilters}
							meta={meta}
							isOpen={isFilterPanelOpen}
							onToggle={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
						/>
					</div>

					{/* Site count indicator (when filter panel is closed) */}
					{!isFilterPanelOpen && meta.total > 0 && (
						<div className={cn("absolute bottom-3 left-3 bg-card/95 backdrop-blur rounded-lg px-3 py-1.5 shadow-md", zClass.mapFilters)}>
							<span className="text-xs text-muted-foreground">
								Showing <span className="font-medium text-foreground">{meta.showing}</span> of{" "}
								<span className="font-medium text-foreground">{meta.total}</span> sites
								{meta.hasMore && <span className="text-primary ml-1">• Zoom in for more</span>}
							</span>
						</div>
					)}

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

					{/* Map fills the container */}
					<SiteMap
						sites={sitesWithHeat}
						zones={zones}
						selectedSiteId={selectedSiteId}
						onSelect={handleSelectSite}
						className="absolute inset-0"
						onBoundsChange={handleBoundsChange}
						onZoomChange={handleZoomChange}
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
			)}

			{/* Site Detail Slide-over */}
			<SiteSlideOver site={selectedSite} isOpen={isSlideOverOpen} onClose={handleCloseSlideOver} />

			{/* Interactive Map Tour */}
			{isTourRunning && (
				<MapTour
					mapRef={mapRef.current}
					onSelectSite={handleSelectSite}
					onComplete={handleTourComplete}
					onSkip={handleTourSkip}
					sites={sitesForTour}
					autoStart
				/>
			)}
		</div>
	);
};
