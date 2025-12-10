"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Drawer, DrawerContent } from "@/shared/ui/drawer";
import { Plus, Search, X, Layers, MapPin, Sparkles, Navigation, Map as MapIcon, List, Activity, Image as ImageIcon, ChevronLeft } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { useSearchParams } from "next/navigation";
import { cn } from "@/shared/lib/utils";
import { zClass } from "@/shared/lib/z-index";
import type { BoundingBox, MapSiteFeature, MapZoneFeature } from "@/entities/map/model/types";
import { useMapStore, applySiteFilters } from "@/features/map-explorer/model/map-store";
import { HomeFeed } from "./home-feed";
import { SiteEditor } from "./site-editor";
import { loadMapData } from "../actions";
import { WhatsHotPanel, getSimulatedHeatData } from "./whats-hot-panel";
import { useAuth } from "@/components/providers/AuthProvider";
import { getSiteTypeIcon } from "@/components/map/site-type-icons";
import type L from "leaflet";

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

// Snap points for vaul drawer (as percentages from bottom)
// Peek shows header + thumbnails preview (~28%), half screen, almost full
const SNAP_POINTS: (string | number)[] = [0.28, 0.55, 0.92];

export const MobileSiteExplorer = ({ initialSites, initialZones, initialBounds }: MobileSiteExplorerProps) => {
	const { sites, zones, filters, selectedSiteId, selectSite, initialize, replaceData, setBounds } = useMapStore();
	const { profile, user } = useAuth();

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
	const [drawerSnap, setDrawerSnap] = useState<number | string | null>(SNAP_POINTS[0]);
	const searchInputRef = useRef<HTMLInputElement>(null);

	const initials = useMemo(() => {
		const source = profile?.full_name ?? user?.email ?? "MM";
		return source
			.split(/\s+/)
			.map((part) => part[0])
			.join("")
			.slice(0, 2)
			.toUpperCase();
	}, [profile?.full_name, user?.email]);

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
			setDrawerSnap(SNAP_POINTS[1]); // Half screen
		} else if (siteParam) {
			selectSite(siteParam);
			setDrawerSnap(SNAP_POINTS[1]);
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
			setDrawerSnap(SNAP_POINTS[1]); // Open to half to show site details
		},
		[selectSite]
	);

	const handleFocusSite = useCallback(
		(siteId: string) => {
			const site = sites.find((s) => s.id === siteId);
			if (site && mapRef.current) {
				mapRef.current.flyTo([site.coordinates.lat, site.coordinates.lng], 10, { duration: 0.8 });
			}
			selectSite(siteId);
			setViewMode("map");
			setSearchQuery("");
			setShowSearchDropdown(false);
			setDrawerSnap(SNAP_POINTS[1]);
		},
		[sites, selectSite]
	);

	const handleSearchSelect = (site: MapSiteFeature) => {
		handleFocusSite(site.id);
	};

	const handleCloseSiteDetail = useCallback(() => {
		selectSite(null);
	}, [selectSite]);

	// Check if drawer is expanded (beyond peek)
	const isDrawerExpanded = drawerSnap !== SNAP_POINTS[0];

	return (
		<div className="relative h-[100dvh] w-full overflow-hidden bg-background">
			{/* Map view - hidden when in list mode */}
			<div className={cn("absolute inset-0 transition-opacity duration-300", viewMode === "list" && "hidden")}>
				<SiteMap
					sites={sitesWithHeat}
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

			{/* List view - full screen when active */}
			{viewMode === "list" && (
				<div className="absolute inset-0 bg-background flex flex-col pt-16">
					<ScrollArea className="flex-1">
						<SiteListWithThumbnails sites={filteredSites} onSelect={handleFocusSite} />
					</ScrollArea>
				</div>
			)}

			{/* Top bar - minimal controls */}
			<div
				className={cn(
					"absolute top-0 left-0 right-0 pt-safe px-3 pb-2 bg-gradient-to-b from-background/95 via-background/80 to-transparent",
					zClass.mapControls
				)}
			>
				<div className="flex items-center gap-2 mt-2">
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

			{/* Bottom drawer using vaul - only in map view */}
			{viewMode === "map" && (
				<Drawer
					open={true}
					modal={false}
					showOverlay={false}
					snapPoints={SNAP_POINTS}
					activeSnapPoint={drawerSnap}
					setActiveSnapPoint={setDrawerSnap}
					direction="bottom"
				>
					<DrawerContent className="max-h-[92dvh]">
						{/* Drawer header */}
						<div className="flex items-center justify-between px-4 py-2 border-b border-border/30">
							{/* Show back button when viewing site details */}
							{selectedSite ? (
								<Button variant="ghost" size="sm" className="h-8 gap-1.5 -ml-2" onClick={handleCloseSiteDetail}>
									<ChevronLeft className="h-4 w-4" />
									<span className="text-xs">Back to sites</span>
								</Button>
							) : (
								<div className="flex items-center gap-1 p-0.5 bg-secondary/30 rounded-lg">
									<button
										onClick={() => setDrawerContent("sites")}
										className={cn(
											"flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
											drawerContent === "sites" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
										)}
									>
										<MapPin className="h-3.5 w-3.5" />
										Sites
									</button>
									<button
										onClick={() => setDrawerContent("activity")}
										className={cn(
											"flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
											drawerContent === "activity" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
										)}
									>
										<Sparkles className="h-3.5 w-3.5" />
										Activity
									</button>
								</div>
							)}

							{/* What's Hot Panel */}
							<div className="relative">
								<WhatsHotPanel sites={sitesWithHeat} onFocusSite={handleFocusSite} />
							</div>

							{/* Quick nav links */}
							<div className="flex items-center gap-1">
								<Link href="/activity" className="p-2 text-muted-foreground hover:text-foreground transition-colors">
									<Activity className="h-4 w-4" />
								</Link>
								<Link href="/profile" className="p-2 text-muted-foreground hover:text-foreground transition-colors">
									<Avatar className="h-5 w-5 border border-border/40">
										<AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-[8px]">{initials}</AvatarFallback>
									</Avatar>
								</Link>
							</div>
						</div>

						{/* Drawer content */}
						<div className="flex-1 overflow-hidden">
							{selectedSite ? (
								<ScrollArea className="h-full">
									<SiteDetailCard site={selectedSite} onClose={handleCloseSiteDetail} onFocus={handleFocusSite} />
								</ScrollArea>
							) : drawerContent === "sites" ? (
								<ScrollArea className="h-full">
									<SiteListWithThumbnails sites={filteredSites} onSelect={handleFocusSite} />
								</ScrollArea>
							) : (
								<HomeFeed sites={filteredSites} onFocusSite={handleFocusSite} className="h-full" />
							)}
						</div>
					</DrawerContent>
				</Drawer>
			)}

			{/* Tap to dismiss search dropdown */}
			{showSearchDropdown && searchQuery && <div className="fixed inset-0 z-40" onClick={() => setShowSearchDropdown(false)} />}
		</div>
	);
};

// Site detail card component
function SiteDetailCard({ site, onClose, onFocus }: { site: MapSiteFeature; onClose: () => void; onFocus: (id: string) => void }) {
	return (
		<div className="p-4 space-y-4">
			{/* Header */}
			<div className="flex items-start justify-between gap-3">
				<div className="flex-1 min-w-0">
					<h2 className="text-lg font-bold truncate">{site.name}</h2>
					<p className="text-sm text-muted-foreground capitalize">{site.siteType}</p>
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

			{/* Media count */}
			{site.mediaCount > 0 && <p className="text-xs text-muted-foreground">{site.mediaCount} photos</p>}

			{/* Actions */}
			<div className="flex gap-2 pt-2">
				<Button className="flex-1" size="sm">
					View Full Details
				</Button>
				<Button variant="outline" size="sm">
					Contribute
				</Button>
			</div>
		</div>
	);
}

// Site list with thumbnails component
function SiteListWithThumbnails({ sites, onSelect }: { sites: MapSiteFeature[]; onSelect: (id: string) => void }) {
	if (sites.length === 0) {
		return (
			<div className="p-8 text-center text-muted-foreground">
				<MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
				<p className="text-sm">No sites found</p>
			</div>
		);
	}

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
