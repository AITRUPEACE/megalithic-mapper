"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { MobileDrawer, DRAWER_SNAP_POINTS, type DrawerSnapPoint } from "@/shared/ui/mobile-drawer";
import {
	Plus,
	Search,
	X,
	Layers,
	MapPin,
	Sparkles,
	Navigation,
	Map as MapIcon,
	List,
	Image as ImageIcon,
	ChevronDown,
	Info,
	MessageSquare,
	Grid3X3,
	Star,
	Clock,
	SortAsc,
	HelpCircle,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { useSearchParams } from "next/navigation";
import { cn } from "@/shared/lib/utils";
import { zClass } from "@/shared/lib/z-index";
import type { BoundingBox, MapSiteFeature, MapZoneFeature } from "@/entities/map/model/types";
import { useMapStore, applySiteFilters } from "@/features/map-explorer/model/map-store";
import { HomeFeed } from "./home-feed";
import { SiteEditor } from "./site-editor";
import { loadMapData } from "../actions";
import { getSimulatedHeatData } from "./whats-hot-panel";
import { getSiteTypeIcon } from "@/components/map/site-type-icons";
import { DrawerComments } from "@/components/discussion/drawer-comments";
import { SiteFocusTooltip, FocusPointIndicator } from "./site-focus-tooltip";
import { useFocusPoint, getPixelDistance, FOCUS_THRESHOLD_PX } from "../_hooks/use-focus-point";
import L from "leaflet";

const SiteMap = dynamic(() => import("./site-map").then((module) => module.SiteMap), {
	ssr: false,
});

interface MobileSiteExplorerProps {
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

type ViewMode = "map" | "list";
type DrawerContentType = "sites" | "activity";
type SiteListViewMode = "card" | "list";
type SiteSortOption = "importance" | "name" | "recent" | "mediaCount";

// Drawer snap point shortcuts
const { PEEK: SNAP_PEEK, HALF: SNAP_HALF, FULL: SNAP_FULL } = DRAWER_SNAP_POINTS;

export const MobileSiteExplorer = ({ initialSites, initialZones, initialBounds }: MobileSiteExplorerProps) => {
	const { sites, zones, filters, selectedSiteId, selectSite, initialize, replaceData, setBounds } = useMapStore();

	const searchParams = useSearchParams();
	const [activeEditor, setActiveEditor] = useState<"site" | null>(null);
	const [pendingCoordinates, setPendingCoordinates] = useState<{ lat: number; lng: number } | null>(null);
	const [isPending, startTransition] = useTransition();
	const [isHydrated, setHydrated] = useState(false);
	const lastBoundsRef = useRef<BoundingBox | null>(null);
	const mapRef = useRef<L.Map | null>(null);

	// Mobile-specific state
	const [viewMode, setViewMode] = useState<ViewMode>("map");
	const [drawerContent, setDrawerContent] = useState<DrawerContentType>("sites");
	const [searchQuery, setSearchQuery] = useState("");
	const [showSearchDropdown, setShowSearchDropdown] = useState(false);
	const [drawerSnap, setDrawerSnap] = useState<DrawerSnapPoint>(SNAP_PEEK);
	const searchInputRef = useRef<HTMLInputElement>(null);

	// Site list controls state
	const [drawerSearchQuery, setDrawerSearchQuery] = useState("");
	const [showDrawerSearch, setShowDrawerSearch] = useState(false);
	const [siteListViewMode, setSiteListViewMode] = useState<SiteListViewMode>("card");
	const [siteSortOption, setSiteSortOption] = useState<SiteSortOption>("importance");
	const drawerSearchInputRef = useRef<HTMLInputElement>(null);

	// Focus-based site detection state
	const [focusSite, setFocusSite] = useState<MapSiteFeature | null>(null);
	const [focusSitePosition, setFocusSitePosition] = useState<{ x: number; y: number } | null>(null);
	const focusPoint = useFocusPoint(drawerSnap);

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
	const sitesWithHeat = useMemo(() => getSimulatedHeatData(filteredSites), [filteredSites]);
	const selectedSite = useMemo(() => sites.find((site) => site.id === selectedSiteId) ?? null, [sites, selectedSiteId]);

	// Sort and filter sites for the drawer list
	const sortedSitesForDrawer = useMemo(() => {
		// First, filter by drawer search query
		let result = sitesWithHeat;
		if (drawerSearchQuery.trim()) {
			const query = drawerSearchQuery.toLowerCase();
			result = result.filter(
				(site) =>
					site.name.toLowerCase().includes(query) ||
					site.siteType.toLowerCase().includes(query) ||
					site.tags?.cultures?.some((c) => c.toLowerCase().includes(query)) ||
					site.tags?.themes?.some((t) => t.toLowerCase().includes(query))
			);
		}

		// Then sort based on selected option
		return [...result].sort((a, b) => {
			switch (siteSortOption) {
				case "importance":
					// Sort by effective score (importance + activity), highest first
					const scoreA = a.effectiveScore ?? a.importanceScore ?? 50;
					const scoreB = b.effectiveScore ?? b.importanceScore ?? 50;
					return scoreB - scoreA;
				case "name":
					return a.name.localeCompare(b.name);
				case "recent":
					return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
				case "mediaCount":
					return b.mediaCount - a.mediaCount;
				default:
					return 0;
			}
		});
	}, [sitesWithHeat, drawerSearchQuery, siteSortOption]);

	// Search results for autocomplete dropdown
	const searchResults = useMemo(() => {
		if (!searchQuery.trim()) return [];
		const query = searchQuery.toLowerCase();
		return filteredSites
			.filter(
				(site) =>
					site.name.toLowerCase().includes(query) ||
					site.siteType.toLowerCase().includes(query) ||
					site.tags?.cultures?.some((c) => c.toLowerCase().includes(query))
			)
			.slice(0, 8);
	}, [filteredSites, searchQuery]);

	// URL params handling
	useEffect(() => {
		if (!sites.length || !isHydrated) return;

		const focusParam = searchParams.get("focus");
		const siteParam = searchParams.get("site");

		if (focusParam) {
			selectSite(focusParam);
			setDrawerSnap(SNAP_HALF); // Half screen for site detail
		} else if (siteParam) {
			selectSite(siteParam);
			setDrawerSnap(SNAP_HALF);
		}
	}, [searchParams, selectSite, sites, isHydrated]);

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

			startTransition(async () => {
				try {
					const payload = await loadMapData({ bounds: nextBounds });
					if (payload?.sites && payload?.zones) {
						replaceData({ sites: payload.sites, zones: payload.zones });
					}
				} catch (error) {
					console.error("Failed to refresh map data", error);
				}
			});
		},
		[isHydrated, replaceData, setBounds, selectedSiteId]
	);

	const handleSelectSite = useCallback(
		(siteId: string) => {
			selectSite(siteId);
			setViewMode("map");
			setDrawerSnap(SNAP_HALF); // Open to half to show site details
		},
		[selectSite]
	);

	const handleFocusSite = useCallback(
		(siteId: string) => {
			selectSite(siteId);
			setViewMode("map");
			setSearchQuery("");
			setShowSearchDropdown(false);
			setDrawerSnap(SNAP_HALF);
		},
		[selectSite]
	);

	const handleSearchSelect = (site: MapSiteFeature) => {
		handleFocusSite(site.id);
	};

	const handleCloseSiteDetail = useCallback(() => {
		selectSite(null);
		// Reset drawer to default peek position when closing site details
		setDrawerSnap(SNAP_PEEK);
	}, [selectSite]);

	// Handle map movement - find nearest site to focus point
	const handleMapMove = useCallback(
		(map: L.Map) => {
			// Don't show focus tooltip when a site is already selected
			if (selectedSiteId) {
				setFocusSite(null);
				setFocusSitePosition(null);
				return;
			}

			// Get viewport bounds for early filtering
			const bounds = map.getBounds();

			// Get the focus point in container coordinates
			const containerSize = map.getSize();
			const focusX = containerSize.x / 2;
			// Calculate focus Y based on drawer state (shifted up when drawer is open)
			const visibleAreaPercent = (100 - drawerSnap) / 100;
			const focusY = (visibleAreaPercent / 2) * containerSize.y;

			// Find the nearest site to the focus point
			let nearestSite: MapSiteFeature | null = null;
			let nearestDistance = Infinity;
			let nearestPosition: { x: number; y: number } | null = null;

			// Only check visible sites (viewport culling for performance)
			const visibleSites = sitesWithHeat.filter((site) => bounds.contains([site.coordinates.lat, site.coordinates.lng]));

			// Cap at 100 sites for performance
			const sitesToCheck = visibleSites.slice(0, 100);

			for (const site of sitesToCheck) {
				// Convert site coordinates to container point
				const siteLatLng = L.latLng(site.coordinates.lat, site.coordinates.lng);
				const sitePoint = map.latLngToContainerPoint(siteLatLng);

				// Calculate pixel distance from focus point
				const distance = getPixelDistance(focusX, focusY, sitePoint.x, sitePoint.y);

				if (distance < nearestDistance) {
					nearestDistance = distance;
					nearestSite = site;
					nearestPosition = { x: sitePoint.x, y: sitePoint.y };
				}
			}

			// Update state if nearest site is within threshold
			if (nearestSite && nearestDistance <= FOCUS_THRESHOLD_PX && nearestPosition) {
				setFocusSite(nearestSite);
				setFocusSitePosition(nearestPosition);
			} else {
				setFocusSite(null);
				setFocusSitePosition(null);
			}
		},
		[selectedSiteId, sitesWithHeat, drawerSnap]
	);

	// Clear focus site when a site is selected
	useEffect(() => {
		if (selectedSiteId) {
			setFocusSite(null);
			setFocusSitePosition(null);
		}
	}, [selectedSiteId]);

	// Check if drawer is expanded (beyond peek)
	const isDrawerExpanded = drawerSnap !== SNAP_PEEK;

	// Ensure drawer expands when a site is selected
	useEffect(() => {
		if (selectedSiteId && selectedSite) {
			setDrawerSnap(SNAP_HALF);
		}
	}, [selectedSiteId, selectedSite]);

	return (
		<div className="relative h-[100dvh] w-full overflow-hidden bg-background">
			{/* Map view - hidden when in list mode */}
			<div className={cn("absolute inset-0 transition-opacity duration-300", viewMode === "list" && "hidden")}>
				<SiteMap
					sites={sitesWithHeat}
					zones={zones}
					selectedSiteId={selectedSiteId}
					autoHoveredSiteId={focusSite?.id}
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
					onMapMove={handleMapMove}
					drawerHeightPercent={SNAP_HALF}
				/>
			</div>

			{/* Focus point indicator and tooltip - outside map container for proper z-index */}
			{viewMode === "map" && !selectedSiteId && (
				<>
					<FocusPointIndicator focusY={focusPoint.focusYPixels} isActive={!!focusSite} />
					<SiteFocusTooltip site={focusSite} markerPosition={focusSitePosition} onSelect={handleSelectSite} />
				</>
			)}

			{/* List view - full screen when active */}
			{viewMode === "list" && (
				<div className="absolute inset-0 bg-background flex flex-col pt-16">
					<div className="px-3 py-2 border-b border-border/30">
						<SiteListHeader
							sortOption={siteSortOption}
							onSortChange={setSiteSortOption}
							viewMode={siteListViewMode}
							onViewModeChange={setSiteListViewMode}
							siteCount={sortedSitesForDrawer.length}
						/>
					</div>
					<ScrollArea className="flex-1">
						<SiteListWithThumbnails sites={sortedSitesForDrawer} onSelect={handleFocusSite} viewMode={siteListViewMode} />
					</ScrollArea>
				</div>
			)}

			{/* Top bar - minimal controls */}
			<div
				className={cn(
					"absolute top-0 left-0 right-0 pt-2 px-3 pb-2 bg-gradient-to-b from-background/95 via-background/80 to-transparent",
					zClass.mapControls
				)}
			>
				<div className="flex items-center gap-2">
					{/* View toggle */}
					<div className="flex items-center bg-card rounded-full shadow-lg p-1">
						<button
							onClick={() => setViewMode("map")}
							className={cn("p-2 rounded-full transition-all", viewMode === "map" ? "bg-primary text-primary-foreground" : "text-muted-foreground")}
						>
							<MapIcon className="h-4 w-4" />
						</button>
						<button
							onClick={() => setViewMode("list")}
							className={cn("p-2 rounded-full transition-all", viewMode === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground")}
						>
							<List className="h-4 w-4" />
						</button>
					</div>

					{/* Search bar with dropdown */}
					<div className="relative flex-1">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
						<Input
							ref={searchInputRef}
							value={searchQuery}
							onChange={(e) => {
								setSearchQuery(e.target.value);
								setShowSearchDropdown(true);
							}}
							onFocus={() => setShowSearchDropdown(true)}
							placeholder="Search sites..."
							className="h-10 pl-10 pr-10 bg-card shadow-lg rounded-full text-sm border-border/50"
						/>
						{searchQuery && (
							<Button
								size="icon"
								variant="ghost"
								className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
								onClick={() => {
									setSearchQuery("");
									setShowSearchDropdown(false);
								}}
							>
								<X className="h-4 w-4" />
							</Button>
						)}

						{/* Search autocomplete dropdown */}
						{showSearchDropdown && searchQuery && searchResults.length > 0 && (
							<div className="absolute top-full left-0 right-0 mt-1 bg-card rounded-xl shadow-xl border border-border/50 overflow-hidden z-50 max-h-[60vh] overflow-y-auto">
								{searchResults.map((site) => {
									const SiteIcon = getSiteTypeIcon(site.siteType);
									return (
										<button
											key={site.id}
											onClick={() => handleSearchSelect(site)}
											className="w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors flex items-center gap-3 border-b border-border/20 last:border-0"
										>
											<div
												className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
												style={{
													backgroundColor: site.verificationStatus === "verified" ? "hsl(var(--primary) / 0.15)" : "hsl(var(--muted))",
												}}
											>
												<SiteIcon className={cn("h-4 w-4", site.verificationStatus === "verified" ? "text-primary" : "text-muted-foreground")} />
											</div>
											<div className="flex-1 min-w-0">
												<p className="font-medium text-sm truncate">{site.name}</p>
												<p className="text-xs text-muted-foreground truncate capitalize">{site.siteType.replace(/_/g, " ")}</p>
											</div>
											{site.verificationStatus === "verified" && (
												<Badge variant="secondary" className="text-[10px] shrink-0">
													✓
												</Badge>
											)}
										</button>
									);
								})}
							</div>
						)}
					</div>

					{/* Add site button */}
					<Button size="icon" className="h-10 w-10 rounded-full bg-primary shadow-lg shrink-0" onClick={() => setActiveEditor("site")}>
						<Plus className="h-5 w-5" />
					</Button>
				</div>

				{/* Loading indicator */}
				{isPending && (
					<div className="flex justify-center mt-2">
						<Badge variant="secondary" className="bg-card shadow-md">
							Loading...
						</Badge>
					</div>
				)}
			</div>

			{/* Floating map controls (only visible in map view) */}
			{viewMode === "map" && (
				<div className={cn("absolute right-3 bottom-[30%] flex flex-col gap-2", zClass.mapControls)}>
					<Button
						size="icon"
						variant="secondary"
						className="h-11 w-11 rounded-full bg-card shadow-lg"
						onClick={() => {
							if (navigator.geolocation && mapRef.current) {
								navigator.geolocation.getCurrentPosition((pos) => {
									mapRef.current?.flyTo([pos.coords.latitude, pos.coords.longitude], 12);
								});
							}
						}}
					>
						<Navigation className="h-5 w-5" />
					</Button>
					<Button size="icon" variant="secondary" className="h-11 w-11 rounded-full bg-card shadow-lg">
						<Layers className="h-5 w-5" />
					</Button>
				</div>
			)}

			{/* Floating site editor */}
			{activeEditor === "site" && (
				<div className={cn("absolute top-24 left-3 right-3", zClass.mapEditors)}>
					<SiteEditor
						className="border border-primary/40 bg-card shadow-xl rounded-2xl"
						zones={zones}
						site={selectedSite}
						onClose={() => setActiveEditor(null)}
						pendingCoordinates={pendingCoordinates}
					/>
				</div>
			)}

			{/* Bottom drawer - custom implementation for reliable snap points and scrolling */}
			{viewMode === "map" && (
				<MobileDrawer
					snap={drawerSnap}
					onSnapChange={setDrawerSnap}
					header={
						selectedSite ? null : (
							// Compact header with Sites/Activity toggle and search
							<div className="flex items-center justify-between px-3 py-1.5 gap-2">
								{/* Left: Sites/Activity toggle (hidden when search is open) */}
								<div className={cn("flex items-center transition-all", showDrawerSearch ? "w-0 opacity-0 overflow-hidden" : "flex-1")}>
									<div className="flex items-center gap-0.5 p-0.5 bg-secondary/30 rounded-full">
										<button
											onClick={() => setDrawerContent("sites")}
											className={cn(
												"flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors",
												drawerContent === "sites" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
											)}
										>
											<MapPin className="h-3 w-3" />
											Sites
										</button>
										<button
											onClick={() => setDrawerContent("activity")}
											className={cn(
												"flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors",
												drawerContent === "activity" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
											)}
										>
											<Sparkles className="h-3 w-3" />
											Activity
										</button>
									</div>
								</div>

								{/* Search input (expands when active) */}
								<div className={cn("flex items-center gap-1 transition-all", showDrawerSearch ? "flex-1" : "")}>
									{showDrawerSearch ? (
										<div className="flex-1 flex items-center gap-1">
											<div className="relative flex-1">
												<Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
												<Input
													ref={drawerSearchInputRef}
													value={drawerSearchQuery}
													onChange={(e) => setDrawerSearchQuery(e.target.value)}
													placeholder="Search sites..."
													className="h-7 pl-8 pr-8 text-xs bg-muted/50 rounded-full border-border/50"
													autoFocus
												/>
												{drawerSearchQuery && (
													<button
														className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-muted"
														onClick={() => setDrawerSearchQuery("")}
													>
														<X className="h-3 w-3 text-muted-foreground" />
													</button>
												)}
											</div>
											<button
												onClick={() => {
													setShowDrawerSearch(false);
													setDrawerSearchQuery("");
												}}
												className="p-1.5 rounded-full hover:bg-muted/50 text-muted-foreground"
											>
												<X className="h-4 w-4" />
											</button>
										</div>
									) : (
										<button
											onClick={() => {
												setShowDrawerSearch(true);
												setTimeout(() => drawerSearchInputRef.current?.focus(), 100);
											}}
											className={cn(
												"p-1.5 rounded-full transition-colors",
												drawerSearchQuery ? "bg-primary/10 text-primary" : "hover:bg-muted/50 text-muted-foreground"
											)}
										>
											<Search className="h-4 w-4" />
										</button>
									)}
								</div>
							</div>
						)
					}
				>
					{/* Drawer content */}
					{selectedSite ? (
						<SiteDetailCard site={selectedSite} onClose={handleCloseSiteDetail} onFocus={handleFocusSite} onExpand={() => setDrawerSnap(SNAP_FULL)} />
					) : drawerContent === "sites" ? (
						<>
							<SiteListHeader
								sortOption={siteSortOption}
								onSortChange={setSiteSortOption}
								viewMode={siteListViewMode}
								onViewModeChange={setSiteListViewMode}
								siteCount={sortedSitesForDrawer.length}
							/>
							<SiteListWithThumbnails sites={sortedSitesForDrawer} onSelect={handleFocusSite} viewMode={siteListViewMode} />
						</>
					) : (
						<HomeFeed sites={filteredSites} onFocusSite={handleFocusSite} className="h-full" />
					)}
				</MobileDrawer>
			)}

			{/* Tap to dismiss search dropdown */}
			{showSearchDropdown && searchQuery && <div className="fixed inset-0 z-40" onClick={() => setShowSearchDropdown(false)} />}
		</div>
	);
};

// Collapsible section component
function CollapsibleSection({
	title,
	icon,
	expanded,
	onToggle,
	children,
	badge,
}: {
	title: string;
	icon: React.ReactNode;
	expanded: boolean;
	onToggle: () => void;
	children: React.ReactNode;
	badge?: string | number;
}) {
	return (
		<div className="border border-border/40 rounded-lg overflow-hidden">
			<button onClick={onToggle} className="w-full flex items-center justify-between px-3 py-2.5 bg-muted/30 hover:bg-muted/50 transition-colors">
				<div className="flex items-center gap-2">
					{icon}
					<span className="text-sm font-medium">{title}</span>
					{badge !== undefined && (
						<Badge variant="secondary" className="text-[10px] h-4 px-1.5">
							{badge}
						</Badge>
					)}
				</div>
				<ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", expanded && "rotate-180")} />
			</button>
			{expanded && <div className="p-3 border-t border-border/30">{children}</div>}
		</div>
	);
}

// Site detail card component
function SiteDetailCard({
	site,
	onClose,
	onFocus,
	onExpand,
}: {
	site: MapSiteFeature;
	onClose: () => void;
	onFocus: (id: string) => void;
	onExpand: () => void;
}) {
	const [expandedSection, setExpandedSection] = useState<"overview" | "media" | "discussion">("overview");

	return (
		<div className="px-4 py-2 space-y-3">
			{/* Header */}
			<div className="flex items-start justify-between gap-3">
				<div className="flex-1 min-w-0">
					<h2 className="text-lg font-bold truncate">{site.name}</h2>
					<p className="text-sm text-muted-foreground capitalize">{site.siteType.replace(/_/g, " ")}</p>
				</div>
				<div className="flex items-center gap-1">
					<Button size="icon" variant="ghost" onClick={() => onFocus(site.id)}>
						<MapPin className="h-4 w-4" />
					</Button>
					<Button size="icon" variant="ghost" onClick={onClose}>
						<X className="h-4 w-4" />
					</Button>
				</div>
			</div>

			{/* Status badges */}
			<div className="flex flex-wrap gap-2">
				<Badge variant={site.verificationStatus === "verified" ? "default" : "secondary"}>{site.verificationStatus}</Badge>
				<Badge variant="outline">{site.layer}</Badge>
				{site.trustTier && (
					<Badge variant="outline" className="capitalize">
						{site.trustTier}
					</Badge>
				)}
			</div>

			{/* Collapsible sections */}
			<div className="space-y-2">
				{/* Overview Section */}
				<CollapsibleSection
					title="Overview"
					icon={<Info className="h-4 w-4 text-muted-foreground" />}
					expanded={expandedSection === "overview"}
					onToggle={() => setExpandedSection(expandedSection === "overview" ? "overview" : "overview")}
				>
					<div className="space-y-3">
						{/* Description */}
						{site.summary && <p className="text-sm text-muted-foreground">{site.summary}</p>}

						{/* Tags */}
						{site.tags && (site.tags.cultures?.length > 0 || site.tags.themes?.length > 0) && (
							<div className="flex flex-wrap gap-1.5">
								{site.tags.cultures?.map((tag) => (
									<Badge key={tag} variant="secondary" className="text-xs">
										{tag}
									</Badge>
								))}
								{site.tags.themes?.map((tag: string) => (
									<Badge key={tag} variant="outline" className="text-xs">
										{tag}
									</Badge>
								))}
							</div>
						)}

						{/* Coordinates */}
						<p className="text-xs text-muted-foreground">
							{site.coordinates.lat.toFixed(4)}, {site.coordinates.lng.toFixed(4)}
						</p>
					</div>
				</CollapsibleSection>

				{/* Media Section */}
				<CollapsibleSection
					title="Media"
					icon={<ImageIcon className="h-4 w-4 text-muted-foreground" />}
					expanded={expandedSection === "media"}
					onToggle={() => setExpandedSection("media")}
					badge={site.mediaCount > 0 ? site.mediaCount : undefined}
				>
					{site.mediaCount > 0 || site.thumbnailUrl ? (
						<div className="space-y-2">
							<div className="grid grid-cols-3 gap-1.5">
								{/* First slot: show actual thumbnail if available */}
								{site.thumbnailUrl ? (
									<div className="aspect-square rounded bg-muted overflow-hidden">
										<img src={site.thumbnailUrl} alt={site.name} className="w-full h-full object-cover" loading="lazy" />
									</div>
								) : (
									<div className="aspect-square rounded bg-muted flex items-center justify-center">
										<ImageIcon className="h-4 w-4 text-muted-foreground/40" />
									</div>
								)}
								{/* Remaining slots as placeholders */}
								{Array.from({ length: Math.min(Math.max(site.mediaCount - 1, 0), 5) }).map((_, i) => (
									<div key={i} className="aspect-square rounded bg-muted flex items-center justify-center">
										<ImageIcon className="h-4 w-4 text-muted-foreground/40" />
									</div>
								))}
							</div>
							{site.mediaCount > 6 && <p className="text-[10px] text-muted-foreground text-center">+{site.mediaCount - 6} more</p>}
						</div>
					) : (
						<p className="text-xs text-muted-foreground text-center py-2">No media uploaded yet</p>
					)}
				</CollapsibleSection>

				{/* Discussion Section */}
				<CollapsibleSection
					title="Discussion"
					icon={<MessageSquare className="h-4 w-4 text-muted-foreground" />}
					expanded={expandedSection === "discussion"}
					onToggle={() => setExpandedSection("discussion")}
				>
					<DrawerComments siteId={site.id} />
				</CollapsibleSection>
			</div>

			{/* Actions */}
			<div className="flex gap-2 pt-2">
				<Button className="flex-1" size="sm" onClick={onExpand}>
					View Full Details
				</Button>
				<Button variant="outline" size="sm" asChild>
					<Link href={`/contribute?site=${site.id}`}>Contribute</Link>
				</Button>
			</div>
		</div>
	);
}

// Site list header with sort and view toggle
function SiteListHeader({
	sortOption,
	onSortChange,
	viewMode,
	onViewModeChange,
	siteCount,
}: {
	sortOption: SiteSortOption;
	onSortChange: (option: SiteSortOption) => void;
	viewMode: SiteListViewMode;
	onViewModeChange: (mode: SiteListViewMode) => void;
	siteCount: number;
}) {
	const [showSortMenu, setShowSortMenu] = useState(false);

	const sortOptions: { value: SiteSortOption; label: string; icon: React.ReactNode }[] = [
		{ value: "importance", label: "Most Famous", icon: <Star className="h-3.5 w-3.5" /> },
		{ value: "name", label: "Name A-Z", icon: <SortAsc className="h-3.5 w-3.5" /> },
		{ value: "recent", label: "Recently Updated", icon: <Clock className="h-3.5 w-3.5" /> },
		{ value: "mediaCount", label: "Most Photos", icon: <ImageIcon className="h-3.5 w-3.5" /> },
	];

	const currentSort = sortOptions.find((opt) => opt.value === sortOption);

	return (
		<div className="px-3 py-2">
			{/* Controls row */}
			<div className="flex items-center justify-between gap-2">
				{/* Sort dropdown */}
				<div className="relative">
					<button
						onClick={() => setShowSortMenu(!showSortMenu)}
						className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-muted/50 rounded-lg hover:bg-muted transition-colors"
					>
						{currentSort?.icon}
						<span className="hidden xs:inline">{currentSort?.label}</span>
						<ChevronDown className={cn("h-3 w-3 transition-transform", showSortMenu && "rotate-180")} />
					</button>

					{showSortMenu && (
						<>
							<div className="fixed inset-0 z-40" onClick={() => setShowSortMenu(false)} />
							<div className="absolute top-full left-0 mt-1 bg-card rounded-lg shadow-xl border border-border/50 overflow-hidden z-50 min-w-[140px]">
								{sortOptions.map((option) => (
									<button
										key={option.value}
										onClick={() => {
											onSortChange(option.value);
											setShowSortMenu(false);
										}}
										className={cn(
											"w-full px-3 py-2 text-left text-xs flex items-center gap-2 hover:bg-muted/50 transition-colors",
											sortOption === option.value && "bg-primary/10 text-primary"
										)}
									>
										{option.icon}
										{option.label}
									</button>
								))}
							</div>
						</>
					)}
				</div>

				{/* Site count */}
				<span className="text-xs text-muted-foreground">
					{siteCount} site{siteCount !== 1 ? "s" : ""}
				</span>

				{/* View mode toggle */}
				<div className="flex items-center bg-muted/50 rounded-lg p-0.5">
					<button
						onClick={() => onViewModeChange("card")}
						className={cn(
							"p-1.5 rounded-md transition-colors",
							viewMode === "card" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
						)}
						title="Card view"
					>
						<Grid3X3 className="h-3.5 w-3.5" />
					</button>
					<button
						onClick={() => onViewModeChange("list")}
						className={cn(
							"p-1.5 rounded-md transition-colors",
							viewMode === "list" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
						)}
						title="List view"
					>
						<List className="h-3.5 w-3.5" />
					</button>
				</div>
			</div>
		</div>
	);
}

// Site list with thumbnails component
function SiteListWithThumbnails({
	sites,
	onSelect,
	viewMode = "card",
}: {
	sites: MapSiteFeature[];
	onSelect: (id: string) => void;
	viewMode?: SiteListViewMode;
}) {
	if (sites.length === 0) {
		return (
			<div className="p-8 text-center text-muted-foreground">
				<MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
				<p className="text-sm">No sites found</p>
			</div>
		);
	}

	// Compact list view
	if (viewMode === "list") {
		return (
			<div className="divide-y divide-border/30">
				{sites.map((site) => {
					const SiteIcon = getSiteTypeIcon(site.siteType);
					const importanceScore = site.effectiveScore ?? site.importanceScore ?? 50;
					return (
						<button
							key={site.id}
							onClick={() => onSelect(site.id)}
							className="w-full px-3 py-2.5 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left"
						>
							{/* Thumbnail or icon */}
							<div className="h-12 w-12 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
								{site.thumbnailUrl ? (
									<img src={site.thumbnailUrl} alt={site.name} className="w-full h-full object-cover" loading="lazy" />
								) : (
									<div className="w-full h-full flex items-center justify-center">
										<SiteIcon className="h-5 w-5 text-muted-foreground/50" />
									</div>
								)}
							</div>
							{/* Info */}
							<div className="flex-1 min-w-0">
								<div className="flex items-center gap-1.5">
									<p className="font-medium text-sm truncate">{site.name}</p>
									{site.verificationStatus === "verified" && <span className="text-primary text-[10px]">✓</span>}
								</div>
								<p className="text-xs text-muted-foreground truncate capitalize">{site.siteType.replace(/_/g, " ")}</p>
							</div>
							{/* Right side info */}
							<div className="flex flex-col items-end gap-0.5 flex-shrink-0">
								{importanceScore >= 70 && (
									<Badge variant="secondary" className="text-[9px] px-1.5 py-0">
										<Star className="h-2.5 w-2.5 mr-0.5" />
										Notable
									</Badge>
								)}
								{site.mediaCount > 0 && (
									<span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
										<ImageIcon className="h-2.5 w-2.5" />
										{site.mediaCount}
									</span>
								)}
							</div>
						</button>
					);
				})}
			</div>
		);
	}

	// Card grid view (default)
	return (
		<div className="p-3 grid grid-cols-2 gap-3">
			{sites.map((site) => (
				<button
					key={site.id}
					onClick={() => onSelect(site.id)}
					className="group relative bg-card rounded-xl overflow-hidden border border-border/40 hover:border-primary/40 transition-all text-left"
				>
					{/* Thumbnail placeholder */}
					<div className="aspect-[4/3] bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center relative">
						{site.thumbnailUrl ? (
							<img src={site.thumbnailUrl} alt={site.name} className="w-full h-full object-cover" loading="lazy" />
						) : (
							<div className="text-center p-2">
								<MapPin className="h-8 w-8 text-muted-foreground/30 mx-auto" />
							</div>
						)}
						{/* Verification badge */}
						{site.verificationStatus === "verified" && (
							<div className="absolute top-2 right-2 bg-primary/90 text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-full">✓</div>
						)}
						{/* Media count */}
						{site.mediaCount > 0 && (
							<div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-md flex items-center gap-1">
								<ImageIcon className="h-2.5 w-2.5" />
								{site.mediaCount}
							</div>
						)}
					</div>
					{/* Info */}
					<div className="p-2.5">
						<p className="font-medium text-xs truncate group-hover:text-primary transition-colors">{site.name}</p>
						<p className="text-[10px] text-muted-foreground truncate capitalize">{site.siteType}</p>
					</div>
				</button>
			))}
		</div>
	);
}
