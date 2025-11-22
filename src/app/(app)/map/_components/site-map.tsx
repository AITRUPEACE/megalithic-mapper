"use client";

<<<<<<< HEAD
import { MapContainer, TileLayer, useMap, Polygon, Popup, ScaleControl } from "react-leaflet";
import { useEffect, useMemo, useState } from "react";
import L from "leaflet";
import "leaflet.markercluster";
import type { LatLngTuple } from "leaflet";
import type { MapSite, CommunityTier } from "@/lib/types";
import { cn } from "@/lib/utils";
import { sampleZones } from "@/data/sample-zones";
import { Crosshair, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
=======
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap, useMapEvents, Rectangle } from "react-leaflet";
import { useEffect, useMemo } from "react";
import L from "leaflet";
import type { BoundingBox, MapSiteFeature, MapZoneFeature } from "@/entities/map/model/types";
import { cn } from "@/shared/lib/utils";
>>>>>>> 520337dfb48b4ef3f55d0edf1ade0738f592525b

const MAP_CENTER: [number, number] = [20, 10];
const DEFAULT_ZOOM = 3;

// CartoDB Dark Matter tile layer for dark mode aesthetic
const TILE_LAYERS = {
	dark: {
		url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
		attribution:
			'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	},
	light: {
		url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
		attribution:
			'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	},
};

interface SiteMapProps {
<<<<<<< HEAD
	sites: MapSite[];
	selectedSiteId: string | null;
	onSelect: (siteId: string) => void;
	className?: string;
	onBoundsChange?: (bounds: L.LatLngBounds) => void;
	showZones?: boolean;
}

const verificationColors: Record<MapSite["verificationStatus"], string> = {
	verified: "#34d399",
	under_review: "#f59e0b",
	unverified: "#f87171",
};

const communityTierColors: Record<NonNullable<MapSite["trustTier"]>, string> = {
	bronze: "#fb923c",
	silver: "#94a3b8",
	gold: "#facc15",
	promoted: "#34d399",
};

const zoneTypeColors = {
	archaeological_zone: "#8b5cf6",
	cultural_region: "#3b82f6",
	expedition_area: "#10b981",
};

// Helper function to determine marker size based on importance
const getMarkerSize = (importance: MapSite["importance"], isSelected: boolean): number => {
	if (isSelected) {
		return importance === "critical" ? 18 : importance === "major" ? 16 : importance === "moderate" ? 14 : 14;
	}
	return importance === "critical" ? 14 : importance === "major" ? 12 : importance === "moderate" ? 10 : 8;
};

// Helper function to create custom pin with verification badge
const createCustomPinIcon = (site: MapSite, isSelected: boolean): L.DivIcon => {
	const radius = getMarkerSize(site.importance, isSelected);
	const markerColor = site.layer === "official" ? verificationColors[site.verificationStatus] : communityTierColors[site.trustTier ?? "bronze"];

	// Determine badge based on verification or tier
	const getBadge = () => {
		if (site.layer === "official") {
			if (site.verificationStatus === "verified") {
				return `<svg class="badge-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
			}
			if (site.verificationStatus === "under_review") {
				return `<svg class="badge-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
			}
		} else {
			// Community badges
			if (site.trustTier === "bronze") return `<span class="badge-text">B</span>`;
			if (site.trustTier === "silver") return `<span class="badge-text">S</span>`;
			if (site.trustTier === "gold") return `<span class="badge-text">G</span>`;
			if (site.trustTier === "promoted") return `<span class="badge-text">★</span>`;
		}
		return "";
	};

	const html = `
		<div class="custom-marker ${isSelected ? "selected" : ""}" style="
			--marker-color: ${markerColor};
			--marker-size: ${radius * 2}px;
		">
			<div class="marker-pin"></div>
			${getBadge() ? `<div class="marker-badge">${getBadge()}</div>` : ""}
		</div>
	`;

	return L.divIcon({
		html,
		className: "custom-marker-wrapper",
		iconSize: [radius * 2, radius * 2],
		iconAnchor: [radius, radius],
	});
};

const MapBounds = ({
	sites,
	onBoundsChange,
	disabled,
}: {
	sites: MapSite[];
	onBoundsChange?: (bounds: L.LatLngBounds) => void;
	disabled?: boolean;
}) => {
	const map = useMap();

	useEffect(() => {
		if (!sites.length || disabled) return;

		const coordinates = sites.map((site) => [site.latitude, site.longitude] as LatLngTuple);
		const bounds = L.latLngBounds(coordinates);

		if (!bounds.isValid()) return;

		const targetBounds = coordinates.length === 1 ? bounds.pad(0.25) : bounds;

		map.fitBounds(targetBounds, { padding: [48, 48], animate: false });
		if (onBoundsChange) {
			onBoundsChange(bounds);
		}
	}, [map, sites, onBoundsChange, disabled]);

	return null;
};

const SelectedSiteFocus = ({ site }: { site: MapSite | null }) => {
	const map = useMap();

	useEffect(() => {
		if (!site) return;
		map.flyTo([site.latitude, site.longitude], 6, { duration: 0.8 });
	}, [map, site]);
=======
  sites: MapSiteFeature[];
  zones: MapZoneFeature[];
  selectedSiteId: string | null;
  onSelect: (siteId: string) => void;
  className?: string;
  onBoundsChange?: (bounds: L.LatLngBounds) => void;
}

const verificationColors: Record<MapSiteFeature["verificationStatus"], string> = {
  verified: "#34d399",
  under_review: "#f59e0b",
  unverified: "#f87171",
};

const communityTierColors: Record<NonNullable<MapSiteFeature["trustTier"]>, string> = {
  bronze: "#fb923c",
  silver: "#94a3b8",
  gold: "#facc15",
  promoted: "#34d399",
};

const SelectedSiteFocus = ({ site }: { site: MapSiteFeature | null }) => {
  const map = useMap();

  useEffect(() => {
    if (!site) return;
    map.flyTo([site.coordinates.lat, site.coordinates.lng], 6, { duration: 0.8 });
  }, [map, site]);
>>>>>>> 520337dfb48b4ef3f55d0edf1ade0738f592525b

	return null;
};

<<<<<<< HEAD
const ZoomTracker = ({ onZoomChange }: { onZoomChange: (zoom: number) => void }) => {
	const map = useMap();

	useEffect(() => {
		const handleZoom = () => {
			onZoomChange(map.getZoom());
		};

		// Initial zoom
		handleZoom();

		// Listen for zoom events
		map.on("zoomend", handleZoom);

		return () => {
			map.off("zoomend", handleZoom);
		};
	}, [map, onZoomChange]);

	return null;
};

// Component to handle viewport persistence
const ViewportPersistence = () => {
	const map = useMap();

	useEffect(() => {
		let saveTimeout: NodeJS.Timeout;

		const saveViewport = () => {
			const center = map.getCenter();
			const zoom = map.getZoom();

			const viewport = {
				lat: center.lat,
				lng: center.lng,
				zoom,
				timestamp: Date.now(),
			};

			try {
				localStorage.setItem("map-viewport", JSON.stringify(viewport));

				// Update URL params without navigation
				const url = new URL(window.location.href);
				url.searchParams.set("lat", center.lat.toFixed(4));
				url.searchParams.set("lng", center.lng.toFixed(4));
				url.searchParams.set("zoom", zoom.toString());
				window.history.replaceState({}, "", url.toString());
			} catch (error) {
				console.error("Failed to save viewport:", error);
			}
		};

		const handleMoveEnd = () => {
			// Debounce the save operation
			clearTimeout(saveTimeout);
			saveTimeout = setTimeout(saveViewport, 500);
		};

		map.on("moveend", handleMoveEnd);
		map.on("zoomend", handleMoveEnd);

		return () => {
			clearTimeout(saveTimeout);
			map.off("moveend", handleMoveEnd);
			map.off("zoomend", handleMoveEnd);
		};
	}, [map]);

	return null;
};

// Component to display cursor coordinates
const CoordinateDisplay = () => {
	const map = useMap();
	const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);

	useEffect(() => {
		const handleMouseMove = (e: L.LeafletMouseEvent) => {
			setCoordinates({
				lat: e.latlng.lat,
				lng: e.latlng.lng,
			});
		};

		const handleMouseOut = () => {
			setCoordinates(null);
		};

		map.on("mousemove", handleMouseMove);
		map.on("mouseout", handleMouseOut);

		return () => {
			map.off("mousemove", handleMouseMove);
			map.off("mouseout", handleMouseOut);
		};
	}, [map]);

	if (!coordinates) return null;

	return (
		<div className="pointer-events-none absolute bottom-4 left-4 z-[400] flex items-center gap-2 rounded-lg bg-background/90 px-3 py-1.5 text-xs font-mono backdrop-blur-sm border border-border/40 shadow-md">
			<Crosshair className="h-3 w-3" />
			<span>
				{coordinates.lat.toFixed(4)}°, {coordinates.lng.toFixed(4)}°
			</span>
		</div>
	);
};

// Component to reset map view
const ResetViewControl = () => {
	const map = useMap();

	const handleReset = () => {
		map.flyTo(MAP_CENTER, DEFAULT_ZOOM, { duration: 1 });
	};

	return (
		<Button
			size="sm"
			variant="secondary"
			onClick={handleReset}
			className="absolute left-4 top-4 z-[400] bg-background/90 backdrop-blur-sm shadow-md hover:bg-background/70"
		>
			<RotateCcw className="mr-1 h-3 w-3" />
			Reset View
		</Button>
	);
};

// Component to handle marker clustering
const MarkerClusterGroup = ({
	sites,
	selectedSiteId,
	onSelect,
}: {
	sites: MapSite[];
	selectedSiteId: string | null;
	onSelect: (siteId: string) => void;
}) => {
	const map = useMap();

	useEffect(() => {
		// Calculate cluster composition
		const getClusterComposition = (cluster: L.MarkerCluster) => {
			const markers = cluster.getAllChildMarkers() as L.Marker[];
			const sitesInCluster: MapSite[] = [];

			// Extract sites from markers
			markers.forEach((marker) => {
				const matchingSite = sites.find((s) => s.latitude === marker.getLatLng().lat && s.longitude === marker.getLatLng().lng);
				if (matchingSite) sitesInCluster.push(matchingSite);
			});

			// Count by layer
			const officialCount = sitesInCluster.filter((s) => s.layer === "official").length;
			const communityCount = sitesInCluster.filter((s) => s.layer === "community").length;

			// Count by verification status
			const verifiedCount = sitesInCluster.filter((s) => s.verificationStatus === "verified").length;

			// Find predominant color
			const predominantLayer = officialCount >= communityCount ? "official" : "community";
			let predominantColor: string;

			if (predominantLayer === "official") {
				predominantColor = verifiedCount > officialCount / 2 ? verificationColors.verified : verificationColors.under_review;
			} else {
				// Find most common tier
				const tierCounts = sitesInCluster.reduce((acc, s) => {
					if (s.trustTier) acc[s.trustTier] = (acc[s.trustTier] || 0) + 1;
					return acc;
				}, {} as Record<CommunityTier, number>);
				const mostCommonTier = (Object.entries(tierCounts).sort(([, a], [, b]) => b - a)[0]?.[0] as CommunityTier) || "bronze";
				predominantColor = communityTierColors[mostCommonTier];
			}

			return {
				total: sitesInCluster.length,
				officialCount,
				communityCount,
				verifiedCount,
				predominantColor,
				predominantLayer,
			};
		};

		// Dynamic cluster radius based on zoom level
		const getClusterRadius = () => {
			const zoom = map.getZoom();
			if (zoom < 3) return 120;
			if (zoom < 5) return 100;
			if (zoom < 7) return 80;
			if (zoom < 10) return 60;
			return 40;
		};

		// Create marker cluster group with custom options
		const markerClusterGroup = L.markerClusterGroup({
			showCoverageOnHover: false,
			zoomToBoundsOnClick: false, // We'll handle this manually for smart zoom
			spiderfyOnMaxZoom: true,
			removeOutsideVisibleBounds: true,
			animate: true,
			animateAddingMarkers: false,
			maxClusterRadius: getClusterRadius(),
			iconCreateFunction: (cluster) => {
				const composition = getClusterComposition(cluster);
				const count = composition.total;
				let size = "small";
				let dimension = 40;

				if (count > 50) {
					size = "large";
					dimension = 60;
				} else if (count > 10) {
					size = "medium";
					dimension = 50;
				}

				// Create HTML with composition indicator
				const html = `
					<div style="background-color: ${composition.predominantColor};">
						<span>${count}</span>
					</div>
					<div class="cluster-badge">
						<span class="cluster-composition">
							${composition.officialCount > 0 ? `<span class="official-dot" title="Official: ${composition.officialCount}">●</span>` : ""}
							${composition.communityCount > 0 ? `<span class="community-dot" title="Community: ${composition.communityCount}">●</span>` : ""}
						</span>
					</div>
				`;

				return L.divIcon({
					html,
					className: `marker-cluster marker-cluster-${size} cluster-${composition.predominantLayer}`,
					iconSize: L.point(dimension, dimension),
				});
			},
		});

		// Add markers to cluster group
		sites.forEach((site) => {
			const isSelected = site.id === selectedSiteId;
			const icon = createCustomPinIcon(site, isSelected);

			// Create marker with custom icon
			const marker = L.marker([site.latitude, site.longitude], {
				icon,
			});

			// Add tooltip
			const tooltipContent = `
				<div class="space-y-1">
					<p class="font-semibold text-foreground">${site.name}</p>
					<p class="text-xs text-muted-foreground">${site.civilization}</p>
					<p class="text-xs text-muted-foreground">${site.siteType}</p>
					${site.importance ? `<p class="text-[10px] font-semibold uppercase tracking-wide text-accent">⭐ ${site.importance} significance</p>` : ""}
					${site.geography.zone ? `<p class="text-[10px] font-semibold uppercase tracking-wide text-primary">📍 ${site.geography.zone}</p>` : ""}
					<p class="text-[10px] text-muted-foreground">${site.geography.country}</p>
					<p class="text-[10px] uppercase tracking-wide">
						<span class="text-muted-foreground">${site.layer === "official" ? "Official" : "Community"}</span>
						<span class="ml-1 font-semibold" style="color: ${
							site.layer === "official" ? verificationColors[site.verificationStatus] : communityTierColors[site.trustTier ?? "bronze"]
						}">
							${site.layer === "official" ? site.verificationStatus.replace("_", " ") : site.trustTier}
						</span>
					</p>
				</div>
			`;

			marker.bindTooltip(tooltipContent, {
				direction: "top",
				offset: [0, -10],
				opacity: 1,
				className: "custom-map-tooltip",
			});

			// Add click handler
			marker.on("click", () => onSelect(site.id));

			// Add to cluster group
			markerClusterGroup.addLayer(marker);
		});

		// Smart zoom handler for cluster clicks
		markerClusterGroup.on("clusterclick", (event) => {
			const cluster = event.layer as L.MarkerCluster;
			const composition = getClusterComposition(cluster);
			const markers = cluster.getAllChildMarkers() as L.Marker[];

			// Get cluster bounds
			const bounds = cluster.getBounds();
			const currentZoom = map.getZoom();

			// Calculate what zoom level would be needed to separate the cluster
			const targetBounds = L.latLngBounds(markers.map((m) => m.getLatLng()));
			const targetZoom = map.getBoundsZoom(targetBounds, false);

			// If the zoom change would be minimal (< 2 levels) or we're already zoomed in far enough,
			// show a popup instead of zooming
			if (targetZoom - currentZoom < 2 || currentZoom >= 12) {
				// Create popup content with site list
				const sitesInCluster: MapSite[] = [];
				markers.forEach((marker) => {
					const matchingSite = sites.find((s) => s.latitude === marker.getLatLng().lat && s.longitude === marker.getLatLng().lng);
					if (matchingSite) sitesInCluster.push(matchingSite);
				});

				const popupContent = `
					<div class="cluster-popup">
						<div class="cluster-popup-header">
							<h3 class="font-semibold text-sm mb-2">${composition.total} Sites in Cluster</h3>
							<div class="flex gap-2 text-xs mb-3">
								${
									composition.officialCount > 0
										? `<span class="px-2 py-0.5 rounded bg-green-500/20 text-green-400">${composition.officialCount} Official</span>`
										: ""
								}
								${
									composition.communityCount > 0
										? `<span class="px-2 py-0.5 rounded bg-orange-500/20 text-orange-400">${composition.communityCount} Community</span>`
										: ""
								}
							</div>
						</div>
						<div class="cluster-popup-list max-h-64 overflow-y-auto space-y-2">
							${sitesInCluster
								.slice(0, 10)
								.map(
									(site) => `
								<div class="cluster-site-item p-2 rounded hover:bg-white/5 cursor-pointer transition-colors" data-site-id="${site.id}">
									<div class="font-medium text-sm">${site.name}</div>
									<div class="text-xs text-muted-foreground">${site.civilization} · ${site.siteType}</div>
								</div>
							`
								)
								.join("")}
							${sitesInCluster.length > 10 ? `<div class="text-xs text-muted-foreground text-center py-2">+ ${sitesInCluster.length - 10} more sites</div>` : ""}
						</div>
					</div>
				`;

				const popup = L.popup({
					maxWidth: 300,
					className: "cluster-popup-container",
				})
					.setLatLng(cluster.getLatLng())
					.setContent(popupContent);

				map.openPopup(popup);

				// Add click handlers to site items after popup is open
				setTimeout(() => {
					const siteItems = document.querySelectorAll(".cluster-site-item");
					siteItems.forEach((item) => {
						item.addEventListener("click", () => {
							const siteId = item.getAttribute("data-site-id");
							if (siteId) {
								onSelect(siteId);
								map.closePopup();
							}
						});
					});
				}, 100);
			} else {
				// Zoom into the cluster with smart bounds
				map.fitBounds(bounds, {
					padding: [50, 50],
					maxZoom: Math.min(currentZoom + 3, 18),
				});
			}
		});

		// Add cluster group to map
		map.addLayer(markerClusterGroup);

		// Cleanup
		return () => {
			map.removeLayer(markerClusterGroup);
		};
	}, [map, sites, selectedSiteId, onSelect]);

	return null;
};

export const SiteMap = ({ sites, selectedSiteId, onSelect, className, onBoundsChange, showZones = true }: SiteMapProps) => {
	const selectedSite = useMemo(() => sites.find((site) => site.id === selectedSiteId) ?? null, [sites, selectedSiteId]);
	const [currentZoom, setCurrentZoom] = useState(3);

	// Restore viewport from URL params or localStorage
	const getInitialViewport = (): { center: [number, number]; zoom: number } => {
		if (typeof window === "undefined") {
			return { center: MAP_CENTER, zoom: DEFAULT_ZOOM };
		}

		try {
			// Check URL params first (takes priority)
			const urlParams = new URLSearchParams(window.location.search);
			const urlLat = urlParams.get("lat");
			const urlLng = urlParams.get("lng");
			const urlZoom = urlParams.get("zoom");

			if (urlLat && urlLng && urlZoom) {
				return {
					center: [parseFloat(urlLat), parseFloat(urlLng)],
					zoom: parseInt(urlZoom, 10),
				};
			}

			// Fall back to localStorage
			const stored = localStorage.getItem("map-viewport");
			if (stored) {
				const viewport = JSON.parse(stored);
				// Only use if less than 7 days old
				const age = Date.now() - viewport.timestamp;
				if (age < 7 * 24 * 60 * 60 * 1000) {
					return {
						center: [viewport.lat, viewport.lng],
						zoom: viewport.zoom,
					};
				}
			}
		} catch (error) {
			console.error("Failed to restore viewport:", error);
		}

		return { center: MAP_CENTER, zoom: DEFAULT_ZOOM };
	};

	const initialViewport = useMemo(() => (selectedSite ? null : getInitialViewport()), [selectedSite]);

	// Group sites by zone for the tooltip
	const zoneGroups = useMemo(() => {
		const groups = new Map<string, MapSite[]>();
		sites.forEach((site) => {
			if (site.zoneId) {
				const existing = groups.get(site.zoneId) || [];
				groups.set(site.zoneId, [...existing, site]);
			}
		});
		return groups;
	}, [sites]);

	// Filter zones based on current zoom level
	const visibleZones = useMemo(() => {
		const filtered = sampleZones.filter((zone) => {
			const minZoom = zone.minZoom ?? 0;
			const maxZoom = zone.maxZoom ?? 20;
			return currentZoom >= minZoom && currentZoom <= maxZoom;
		});
		console.log(
			`Zoom level: ${currentZoom}, Visible zones: ${filtered.length}`,
			filtered.map((z) => z.name)
		);
		return filtered;
	}, [currentZoom]);

	// Use detailBounds if zoom is high enough, otherwise use regular bounds
	const getZoneBounds = (zone: (typeof sampleZones)[0]) => {
		if (zone.detailBounds && currentZoom >= 10) {
			return zone.detailBounds;
		}
		return zone.bounds;
	};

	// Check if running in browser (SSR guard)
	const isBrowser = typeof window !== "undefined";

	if (!isBrowser) {
		return (
			<div className={cn("glass-panel overflow-hidden border-border/40 flex items-center justify-center", className)}>
				<div className="text-muted-foreground">Loading map...</div>
			</div>
		);
	}

	return (
		<div className={cn("glass-panel overflow-hidden border-border/40 relative", className)}>
			<MapContainer
				center={selectedSite ? [selectedSite.latitude, selectedSite.longitude] : initialViewport?.center || MAP_CENTER}
				zoom={selectedSite ? 6 : initialViewport?.zoom || DEFAULT_ZOOM}
				scrollWheelZoom
				className="h-full w-full"
			>
				<TileLayer url={TILE_LAYERS.dark.url} attribution={TILE_LAYERS.dark.attribution} />
				<ScaleControl position="bottomright" imperial={false} />
				<MapBounds sites={sites} onBoundsChange={onBoundsChange} disabled={!!selectedSiteId} />
				<SelectedSiteFocus site={selectedSite} />
				<ZoomTracker onZoomChange={setCurrentZoom} />
				<ViewportPersistence />
				<ResetViewControl />
				<CoordinateDisplay />

				{/* Render zone boundaries - filtered by zoom level */}
				{showZones &&
					visibleZones.map((zone) => {
						const zoneSites = zoneGroups.get(zone.id) || [];
						const bounds = getZoneBounds(zone);

						// Convert bounds to polygon coordinates (rectangle with 4 corners)
						const positions: LatLngTuple[] = [
							[bounds.north, bounds.west],
							[bounds.north, bounds.east],
							[bounds.south, bounds.east],
							[bounds.south, bounds.west],
						];

						// Adjust opacity and weight based on zoom level
						const baseOpacity = 0.8;
						const baseFillOpacity = 0.25;
						const weight = currentZoom < 6 ? 2 : currentZoom < 10 ? 3 : 4;

						return (
							<Polygon
								key={zone.id}
								positions={positions}
								pathOptions={{
									color: zoneTypeColors[zone.type],
									weight,
									opacity: baseOpacity,
									fillColor: zoneTypeColors[zone.type],
									fillOpacity: baseFillOpacity,
									dashArray: "5, 10",
								}}
								pane="overlayPane"
							>
								<Popup>
									<div className="space-y-2">
										<div>
											<p className="font-semibold text-foreground">{zone.name}</p>
											<p className="text-xs text-muted-foreground capitalize">{zone.type.replace(/_/g, " ")}</p>
										</div>
										{zone.description && <p className="text-xs text-muted-foreground">{zone.description}</p>}
										<div className="flex flex-wrap gap-1 text-xs">
											<span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary">
												{zoneSites.length} visible site{zoneSites.length !== 1 ? "s" : ""}
											</span>
											<span className="rounded-full bg-secondary/40 px-2 py-0.5">{zone.siteCount} total</span>
											{zone.civilizations.map((civ) => (
												<span key={civ} className="rounded-full bg-secondary/40 px-2 py-0.5">
													{civ}
												</span>
											))}
										</div>
										{zone.parentZoneId && <p className="text-[10px] text-muted-foreground italic">Part of larger region (zoom out to see)</p>}
									</div>
								</Popup>
							</Polygon>
						);
					})}

				{/* Render clustered site markers */}
				<MarkerClusterGroup sites={sites} selectedSiteId={selectedSiteId} onSelect={onSelect} />
			</MapContainer>
		</div>
	);
=======
const BoundsWatcher = ({ onChange }: { onChange?: (bounds: L.LatLngBounds) => void }) => {
  const map = useMapEvents({
    moveend() {
      onChange?.(map.getBounds());
    },
    zoomend() {
      onChange?.(map.getBounds());
    },
  });

  useEffect(() => {
    onChange?.(map.getBounds());
  }, [map, onChange]);

  return null;
};

const toLeafletBounds = (bounds: BoundingBox): L.LatLngBoundsExpression => [
  [bounds.minLat, bounds.minLng],
  [bounds.maxLat, bounds.maxLng],
];

export const SiteMap = ({ sites, zones, selectedSiteId, onSelect, className, onBoundsChange }: SiteMapProps) => {
  const selectedSite = useMemo(
    () => sites.find((site) => site.id === selectedSiteId) ?? null,
    [sites, selectedSiteId]
  );

  return (
    <div className={cn("glass-panel overflow-hidden border-border/40", className)}>
      <MapContainer
        center={selectedSite ? [selectedSite.coordinates.lat, selectedSite.coordinates.lng] : MAP_CENTER}
        zoom={selectedSite ? 6 : 3}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <BoundsWatcher onChange={onBoundsChange} />
        <SelectedSiteFocus site={selectedSite} />
        {zones.map((zone) => (
          <Rectangle
            key={zone.id}
            bounds={toLeafletBounds(zone.bounds)}
            pathOptions={{ color: zone.color, weight: 1.5, fillOpacity: 0.08 }}
          >
            <Tooltip direction="center" opacity={0.9} className="text-xs">
              <div className="space-y-1">
                <p className="font-semibold text-foreground">{zone.name}</p>
                <p className="text-muted-foreground">{zone.cultureFocus.join(", ")}</p>
              </div>
            </Tooltip>
          </Rectangle>
        ))}
        {sites.map((site) => {
          const isSelected = site.id === selectedSiteId;
          const radius = isSelected ? 14 : 10;
          const markerColor =
            site.layer === "official"
              ? verificationColors[site.verificationStatus]
              : communityTierColors[site.trustTier ?? "bronze"];
          return (
            <CircleMarker
              key={site.id}
              center={[site.coordinates.lat, site.coordinates.lng]}
              radius={radius}
              weight={isSelected ? 3 : 1.5}
              color={markerColor}
              fillColor={markerColor}
              fillOpacity={isSelected ? 0.7 : 0.4}
              eventHandlers={{
                click: () => onSelect(site.id),
              }}
            >
              <Tooltip direction="top" offset={[0, -radius]} opacity={1} className="text-xs">
                <div className="space-y-1">
                  <p className="font-semibold text-foreground">{site.name}</p>
                  <p className="text-muted-foreground">{site.tags.cultures.join(", ")}</p>
                  <p className="text-muted-foreground">{site.siteType}</p>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    {site.layer === "official"
                      ? "Official dataset"
                      : `Community ${site.trustTier ?? "bronze"} tier`}
                  </p>
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
>>>>>>> 520337dfb48b4ef3f55d0edf1ade0738f592525b
};
