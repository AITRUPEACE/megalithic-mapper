"use client";

import { MapContainer, TileLayer, Marker, Tooltip, useMap, useMapEvents, Rectangle } from "react-leaflet";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "next-themes";
import L from "leaflet";
import type { BoundingBox, MapSiteFeature, MapZoneFeature } from "@/entities/map/model/types";
import { cn } from "@/shared/lib/utils";
import { getSiteTypeIconSvg } from "@/components/map/site-type-icons";

const MAP_CENTER: [number, number] = [20, 10];
const DEFAULT_ZOOM = 3;
const SITE_FOCUS_ZOOM = 6; // Default zoom level when focusing on a site

// Quick zoom level presets
const ZOOM_LEVELS = {
	world: 2, // Fully zoomed out - world view
	region: 6, // Half zoom - regional view
	detail: 12, // Fully zoomed in - detail view
} as const;

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
	sites: MapSiteFeature[];
	zones: MapZoneFeature[];
	selectedSiteId: string | null;
	onSelect: (siteId: string) => void;
	className?: string;
	onBoundsChange?: (bounds: L.LatLngBounds) => void;
	onMapClick?: (lat: number, lng: number) => void;
	onMapReady?: (map: L.Map) => void;
	/** Called during map movement (pan/zoom) - useful for focus point tracking */
	onMapMove?: (map: L.Map) => void;
	/** Called when zoom level changes - useful for smart loading */
	onZoomChange?: (zoom: number) => void;
	/**
	 * Percentage of viewport height covered by a bottom drawer (0-100).
	 * When set, the map will center selected sites above the drawer.
	 */
	drawerHeightPercent?: number;
	/** ID of site currently auto-hovered (near screen center) */
	autoHoveredSiteId?: string | null;
}

const MapClickHandler = ({ onClick }: { onClick?: (lat: number, lng: number) => void }) => {
	useMapEvents({
		click(e) {
			onClick?.(e.latlng.lat, e.latlng.lng);
		},
	});
	return null;
};

// Standardized site types with colors (matches database site_types table)
export const SITE_TYPES = {
	pyramid: { name: "Pyramid", color: "#f59e0b", icon: "pyramid" },
	temple: { name: "Temple", color: "#8b5cf6", icon: "temple" },
	megalith: { name: "Megalith", color: "#6366f1", icon: "megalith" },
	stone_circle: { name: "Stone Circle", color: "#06b6d4", icon: "stone-circle" },
	mound: { name: "Mound", color: "#84cc16", icon: "mound" },
	tomb: { name: "Tomb", color: "#10b981", icon: "tomb" },
	fortress: { name: "Fortress", color: "#78716c", icon: "wall" },
	city: { name: "Ancient City", color: "#14b8a6", icon: "city" },
	cave: { name: "Cave", color: "#92400e", icon: "cave" },
	underwater: { name: "Underwater", color: "#0891b2", icon: "underwater" },
	geoglyph: { name: "Geoglyph", color: "#f97316", icon: "geoglyph" },
	observatory: { name: "Observatory", color: "#3b82f6", icon: "observatory" },
	statue: { name: "Statue", color: "#ec4899", icon: "statue" },
	ruins: { name: "Ruins", color: "#a1a1aa", icon: "ruins" },
	unknown: { name: "Unknown", color: "#64748b", icon: "unknown" },
} as const;

export type SiteTypeId = keyof typeof SITE_TYPES;

// Normalize legacy site_type text to standardized type ID
const normalizeSiteType = (legacyType: string): SiteTypeId => {
	const normalized = legacyType.toLowerCase().trim();

	if (normalized.includes("pyramid")) return "pyramid";
	if (normalized.includes("temple") || normalized.includes("shrine") || normalized.includes("sanctuary")) return "temple";
	if (normalized.includes("circle") || normalized.includes("henge") || normalized.includes("ring")) return "stone_circle";
	if (normalized.includes("megalith") || normalized.includes("dolmen") || normalized.includes("menhir") || normalized.includes("standing"))
		return "megalith";
	if (normalized.includes("mound") || normalized.includes("tumulus") || normalized.includes("barrow") || normalized.includes("cairn")) return "mound";
	if (normalized.includes("tomb") || normalized.includes("burial") || normalized.includes("passage") || normalized.includes("crypt")) return "tomb";
	if (normalized.includes("wall") || normalized.includes("fort") || normalized.includes("citadel") || normalized.includes("hillfort"))
		return "fortress";
	if (normalized.includes("city") || normalized.includes("settlement") || normalized.includes("complex")) return "city";
	if (normalized.includes("cave") || normalized.includes("grotto") || normalized.includes("shelter")) return "cave";
	if (normalized.includes("underwater") || normalized.includes("submerged") || normalized.includes("sunken")) return "underwater";
	if (normalized.includes("geoglyph") || normalized.includes("nazca") || normalized.includes("lines") || normalized.includes("effigy"))
		return "geoglyph";
	if (normalized.includes("observ") || normalized.includes("astronomical") || normalized.includes("align")) return "observatory";
	if (normalized.includes("statue") || normalized.includes("moai") || normalized.includes("sculpture") || normalized.includes("coloss"))
		return "statue";
	if (normalized.includes("ruin")) return "ruins";

	return "unknown";
};

// Get color for site type
const getSiteTypeColor = (siteType: string): string => {
	const typeId = normalizeSiteType(siteType);
	return SITE_TYPES[typeId].color;
};

// Heat tier size multipliers (legacy, still used as fallback)
const heatSizeMultipliers: Record<MapSiteFeature["heatTier"] & string, number> = {
	hot: 1.2,
	rising: 1.1,
	active: 1.0,
	normal: 1.0,
	low: 0.9,
};

// Get marker size based on effective score
// With new scoring: max 110 (thumbnail:50 + verified:35 + official:25)
const getMarkerSizeFromScore = (
	effectiveScore: number,
	isSelected: boolean,
	isAutoHovered: boolean
): { iconSize: number; svgSize: number; zIndex: number } => {
	if (isSelected) return { iconSize: 44, svgSize: 34, zIndex: 1000 };

	// Base sizes by importance tier - adjusted for new scoring system
	let baseIconSize: number;
	let baseSvgSize: number;
	let zIndex: number;

	if (effectiveScore >= 100) {
		// ICONIC tier - The big famous ones (thumbnail + verified + official)
		// Giza, Stonehenge, Machu Picchu, etc.
		baseIconSize = 40;
		baseSvgSize = 32;
		zIndex = 500;
	} else if (effectiveScore >= 80) {
		// Landmark tier - well-documented verified sites with thumbnails
		baseIconSize = 32;
		baseSvgSize = 26;
		zIndex = 400;
	} else if (effectiveScore >= 50) {
		// Notable tier - has thumbnail OR verified+official
		baseIconSize = 26;
		baseSvgSize = 20;
		zIndex = 300;
	} else if (effectiveScore >= 25) {
		// Minor tier - some verification or official status
		baseIconSize = 22;
		baseSvgSize = 16;
		zIndex = 200;
	} else {
		// Unverified community submissions
		baseIconSize = 18;
		baseSvgSize = 12;
		zIndex = 100;
	}

	// Auto-hovered gets scale boost and z-index bump
	if (isAutoHovered) {
		baseIconSize = Math.round(baseIconSize * 1.25);
		baseSvgSize = Math.round(baseSvgSize * 1.25);
		zIndex = 900;
	}

	return { iconSize: baseIconSize, svgSize: baseSvgSize, zIndex };
};

// Helper function to create clean icon-only marker
const createCustomPinIcon = (site: MapSiteFeature, isSelected: boolean, isAutoHovered?: boolean): { icon: L.DivIcon; zIndexOffset: number } => {
	const heatTier = site.heatTier ?? "normal";
	const effectiveScore = site.effectiveScore ?? site.importanceScore ?? 50;
	const isTrending = site.isTrending ?? false;

	// Get sizes and z-index based on effective score
	const { iconSize, svgSize, zIndex } = getMarkerSizeFromScore(effectiveScore, isSelected, isAutoHovered ?? false);

	// Color by site type
	const iconColor = getSiteTypeColor(site.siteType);

	// Get site type icon SVG - icon will be filled with color
	const siteTypeIcon = getSiteTypeIconSvg(site.siteType, iconColor, svgSize);

	// Trending indicator (fire emoji for trending sites)
	const trendingBadge = isTrending ? `<div class="marker-trending-badge">🔥</div>` : "";

	// Heat indicator (legacy, still supported)
	const heatBadge = !isTrending && heatTier === "hot" ? `<div class="marker-heat-badge hot">🔥</div>` : "";

	// Build class list
	const classes = ["custom-marker", `heat-${heatTier}`];
	if (isSelected) classes.push("selected");
	if (isAutoHovered) classes.push("auto-hovered");
	if (isTrending) classes.push("trending");

	// Add importance tier class for CSS styling - adjusted for new scoring
	if (effectiveScore >= 100) classes.push("tier-iconic");
	else if (effectiveScore >= 80) classes.push("tier-landmark");
	else if (effectiveScore >= 50) classes.push("tier-notable");
	else if (effectiveScore >= 25) classes.push("tier-minor");
	else classes.push("tier-unverified");

	const html = `
		<div class="${classes.join(" ")}" style="
			--marker-color: ${iconColor};
			--marker-size: ${iconSize}px;
		">
			<div class="marker-icon-container">
				${siteTypeIcon}
			</div>
			${trendingBadge}
			${heatBadge}
		</div>
	`;

	const icon = L.divIcon({
		html,
		className: "custom-marker-wrapper",
		iconSize: [iconSize, iconSize],
		iconAnchor: [iconSize / 2, iconSize / 2],
		popupAnchor: [0, -iconSize / 2],
	});

	return { icon, zIndexOffset: zIndex };
};

const SelectedSiteFocus = ({ site, drawerHeightPercent = 0 }: { site: MapSiteFeature | null; drawerHeightPercent?: number }) => {
	const map = useMap();

	useEffect(() => {
		if (!site) return;

		const targetLatLng: [number, number] = [site.coordinates.lat, site.coordinates.lng];

		// Only zoom in, never zoom out - keep current zoom if already zoomed in more
		const currentZoom = map.getZoom();
		const targetZoom = Math.max(currentZoom, SITE_FOCUS_ZOOM);

		// If there's a drawer covering part of the screen, offset the center
		// so the site appears in the visible area above the drawer
		if (drawerHeightPercent > 0) {
			const containerHeight = map.getSize().y;
			// Calculate visible area: if drawer is 55%, visible is 45%
			const visibleAreaPercent = (100 - drawerHeightPercent) / 100;
			// Center of visible area (e.g., for 55% drawer: 45% visible, center at 22.5% from top)
			const visibleAreaCenter = visibleAreaPercent / 2;
			// Current center is at 50%, calculate how much to shift
			const offsetPercent = 0.5 - visibleAreaCenter;
			const offsetPixels = containerHeight * offsetPercent;

			// Project to pixel space, apply offset, and unproject back
			const targetPoint = map.project(targetLatLng, targetZoom);
			targetPoint.y += offsetPixels;
			const adjustedCenter = map.unproject(targetPoint, targetZoom);

			map.flyTo(adjustedCenter, targetZoom, { duration: 0.8 });
		} else {
			map.flyTo(targetLatLng, targetZoom, { duration: 0.8 });
		}
	}, [map, site, drawerHeightPercent]);

	return null;
};

const BoundsWatcher = ({ onChange, onZoomChange }: { onChange?: (bounds: L.LatLngBounds) => void; onZoomChange?: (zoom: number) => void }) => {
	const map = useMapEvents({
		moveend() {
			onChange?.(map.getBounds());
		},
		zoomend() {
			onChange?.(map.getBounds());
			onZoomChange?.(map.getZoom());
		},
	});

	useEffect(() => {
		onChange?.(map.getBounds());
		onZoomChange?.(map.getZoom());
	}, [map, onChange, onZoomChange]);

	return null;
};

const MapReadyHandler = ({ onReady }: { onReady?: (map: L.Map) => void }) => {
	const map = useMap();

	useEffect(() => {
		onReady?.(map);
	}, [map, onReady]);

	return null;
};

const MapMoveHandler = ({ onMove }: { onMove?: (map: L.Map) => void }) => {
	const rafIdRef = useRef<number | null>(null);
	const isScheduledRef = useRef(false);

	const map = useMapEvents({
		move() {
			if (!onMove || isScheduledRef.current) return;

			// RAF-based throttling: max one update per animation frame
			isScheduledRef.current = true;
			rafIdRef.current = requestAnimationFrame(() => {
				isScheduledRef.current = false;
				onMove(map);
			});
		},
		moveend() {
			// Always fire immediately on moveend for accuracy
			onMove?.(map);
		},
		zoomend() {
			// Also fire on zoomend for accuracy
			onMove?.(map);
		},
	});

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (rafIdRef.current) {
				cancelAnimationFrame(rafIdRef.current);
			}
		};
	}, []);

	return null;
};

// Quick zoom controls component
const ZoomControls = ({ sites, onSelect }: { sites: MapSiteFeature[]; onSelect: (siteId: string) => void }) => {
	const map = useMap();
	const [currentZoom, setCurrentZoom] = useState(map.getZoom());

	// Update current zoom on map zoom changes
	useMapEvents({
		zoomend() {
			setCurrentZoom(map.getZoom());
		},
	});

	// Find the nearest site to the current map center
	const findNearestSite = (): MapSiteFeature | null => {
		if (sites.length === 0) return null;

		const center = map.getCenter();
		let nearestSite: MapSiteFeature | null = null;
		let minDistance = Infinity;

		for (const site of sites) {
			const siteLatLng = L.latLng(site.coordinates.lat, site.coordinates.lng);
			const distance = center.distanceTo(siteLatLng);
			if (distance < minDistance) {
				minDistance = distance;
				nearestSite = site;
			}
		}

		return nearestSite;
	};

	const handleZoomWorld = () => {
		// Fly to world view, keeping current center
		map.flyTo(map.getCenter(), ZOOM_LEVELS.world, { duration: 0.8 });
	};

	const handleZoomRegion = () => {
		// Fly to region view, keeping current center
		map.flyTo(map.getCenter(), ZOOM_LEVELS.region, { duration: 0.6 });
	};

	const handleZoomDetail = () => {
		// Find nearest site and fly to it
		const nearestSite = findNearestSite();
		if (nearestSite) {
			const targetLatLng: [number, number] = [nearestSite.coordinates.lat, nearestSite.coordinates.lng];
			map.flyTo(targetLatLng, ZOOM_LEVELS.detail, { duration: 0.8 });
			// Select the site so user sees what they're zooming to
			onSelect(nearestSite.id);
		} else {
			// No sites, just zoom in on current center
			map.flyTo(map.getCenter(), ZOOM_LEVELS.detail, { duration: 0.8 });
		}
	};

	const isActive = (level: number) => {
		// Consider "active" if within 1 zoom level of the preset
		return Math.abs(currentZoom - level) < 1;
	};

	return (
		<div className="zoom-controls">
			<button
				className={cn("zoom-control-btn", isActive(ZOOM_LEVELS.world) && "active")}
				onClick={handleZoomWorld}
				title="World View (zoom out)"
				aria-label="Zoom to world view"
			>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
					<circle cx="12" cy="12" r="10" />
					<path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
				</svg>
			</button>
			<button
				className={cn("zoom-control-btn", isActive(ZOOM_LEVELS.region) && "active")}
				onClick={handleZoomRegion}
				title="Region View"
				aria-label="Zoom to region view"
			>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
					<rect x="3" y="3" width="18" height="18" rx="2" />
					<path d="M3 9h18M9 3v18" />
				</svg>
			</button>
			<button
				className={cn("zoom-control-btn", isActive(ZOOM_LEVELS.detail) && "active")}
				onClick={handleZoomDetail}
				title="Zoom to nearest site"
				aria-label="Zoom to nearest site"
			>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
					<circle cx="11" cy="11" r="8" />
					<path d="m21 21-4.35-4.35M11 8v6M8 11h6" />
				</svg>
			</button>
		</div>
	);
};

const toLeafletBounds = (bounds: BoundingBox): L.LatLngBoundsExpression => [
	[bounds.minLat, bounds.minLng],
	[bounds.maxLat, bounds.maxLng],
];

// Get thumbnail URL for a site (uses thumbnailUrl from API/database)
const getThumbnailUrl = (site: MapSiteFeature): string | null => {
	return site.thumbnailUrl || null;
};

// Custom marker component with enhanced tooltip
const SiteMarker = ({
	site,
	isSelected,
	isAutoHovered,
	onSelect,
	suppressTooltip,
}: {
	site: MapSiteFeature;
	isSelected: boolean;
	isAutoHovered?: boolean;
	onSelect: (id: string) => void;
	suppressTooltip?: boolean;
}) => {
	const { icon, zIndexOffset } = useMemo(() => createCustomPinIcon(site, isSelected, isAutoHovered), [site, isSelected, isAutoHovered]);
	const thumbnailUrl = useMemo(() => getThumbnailUrl(site), [site]);
	const isVerified = site.layer === "official" && site.verificationStatus === "verified";

	// Don't show Leaflet tooltip when:
	// - Auto-hover focus tooltip is active (suppressTooltip=true when any site is auto-hovered)
	// - This specific marker is being auto-hovered (our focus tooltip shows instead)
	const showTooltip = !suppressTooltip && !isAutoHovered;

	return (
		<Marker
			position={[site.coordinates.lat, site.coordinates.lng]}
			icon={icon}
			zIndexOffset={zIndexOffset}
			eventHandlers={{ click: () => onSelect(site.id) }}
		>
			{showTooltip && (
				<Tooltip direction="top" offset={[0, -20]} opacity={1} className="site-tooltip">
					<div className="site-tooltip-content">
						{/* Thumbnail with badge overlay */}
						{thumbnailUrl && (
							<div className="site-tooltip-thumbnail">
								<img src={thumbnailUrl} alt={site.name} loading="lazy" />
								{/* Badge overlay on thumbnail */}
								<div className="site-tooltip-badge-overlay">
									{site.layer === "official" ? (
										<span className="site-tooltip-badge official">Official</span>
									) : (
										<span className={`site-tooltip-badge ${site.trustTier ?? "bronze"}`}>{site.trustTier ?? "bronze"}</span>
									)}
								</div>
							</div>
						)}
						<div className="site-tooltip-info">
							<p className="site-tooltip-name">{site.name}</p>
							<div className="site-tooltip-row">
								<span className="site-tooltip-type">{site.siteType}</span>
								{site.mediaCount > 0 && <span className="site-tooltip-media">📷 {site.mediaCount}</span>}
							</div>
						</div>
					</div>
				</Tooltip>
			)}
		</Marker>
	);
};

export const SiteMap = ({
	sites,
	zones,
	selectedSiteId,
	onSelect,
	className,
	onBoundsChange,
	onMapClick,
	onMapReady,
	onMapMove,
	onZoomChange,
	drawerHeightPercent = 0,
	autoHoveredSiteId,
}: SiteMapProps) => {
	const { resolvedTheme } = useTheme();
	const selectedSite = useMemo(() => sites.find((site) => site.id === selectedSiteId) ?? null, [sites, selectedSiteId]);

	// Use appropriate tile layer based on theme
	const tileLayer = resolvedTheme === "light" ? TILE_LAYERS.light : TILE_LAYERS.dark;

	return (
		<div className={cn("overflow-hidden h-full w-full", autoHoveredSiteId && "suppress-leaflet-tooltips", className)}>
			<style jsx global>{`
				.custom-marker-wrapper {
					background: transparent;
					border: none;
				}
				.custom-marker {
					position: relative;
					width: var(--marker-size);
					height: var(--marker-size);
					transition: all 0.15s ease;
					cursor: pointer;
				}
				.custom-marker:hover {
					transform: scale(1.15);
				}
				.custom-marker.selected {
					transform: scale(1.25);
					filter: drop-shadow(0 0 12px var(--marker-color));
					z-index: 1000 !important;
				}
				/* Auto-hover state: scale up with glow when marker is near screen center */
				.custom-marker.auto-hovered {
					transform: scale(1.35);
					z-index: 100 !important;
				}
				.custom-marker.auto-hovered .marker-icon-container svg {
					filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.5)) drop-shadow(0 0 4px rgba(59, 130, 246, 0.5));
				}
				.marker-icon-container {
					position: absolute;
					width: 100%;
					height: 100%;
					background: transparent;
					display: flex;
					align-items: center;
					justify-content: center;
				}
				.custom-marker.official .marker-icon-container {
					/* Official markers get a subtle glow */
				}
				.custom-marker.selected .marker-icon-container {
					/* Selected state handled by parent filter */
				}
				.marker-icon-container svg {
					width: 100%;
					height: 100%;
					/* Subtle shadow for visibility - keep it sharp */
					filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.5));
				}

				/* Heat tier indicators */
				.marker-heat-badge {
					position: absolute;
					top: -6px;
					left: -6px;
					font-size: 10px;
					line-height: 1;
					z-index: 10;
				}
				.marker-heat-badge.hot {
					animation: heat-badge-pulse 1s ease-in-out infinite;
				}
				.marker-heat-badge.rising {
					animation: heat-badge-pulse 2s ease-in-out infinite;
				}
				@keyframes heat-badge-pulse {
					0%,
					100% {
						transform: scale(1);
					}
					50% {
						transform: scale(1.2);
					}
				}

				/* Trending indicator badge */
				.marker-trending-badge {
					position: absolute;
					top: -8px;
					right: -8px;
					font-size: 12px;
					line-height: 1;
					z-index: 10;
					animation: trending-pulse 1.5s ease-in-out infinite;
				}
				@keyframes trending-pulse {
					0%,
					100% {
						transform: scale(1);
						filter: drop-shadow(0 0 1px rgba(255, 165, 0, 0.4));
					}
					50% {
						transform: scale(1.3);
						filter: drop-shadow(0 0 3px rgba(255, 165, 0, 0.5));
					}
				}

				/* Trending marker glow */
				.custom-marker.trending .marker-icon-container svg {
					filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.5)) drop-shadow(0 0 3px rgba(255, 165, 0, 0.4));
				}

				/* Importance tier styling */
				.custom-marker.tier-iconic .marker-icon-container svg {
					/* The BIG famous sites - prominent glow */
					filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.7)) drop-shadow(0 0 8px var(--marker-color));
				}
				.custom-marker.tier-landmark .marker-icon-container svg {
					filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.6)) drop-shadow(0 0 4px var(--marker-color));
				}
				.custom-marker.tier-notable .marker-icon-container svg {
					filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5));
				}
				.custom-marker.tier-minor {
					opacity: 0.85;
				}
				.custom-marker.tier-minor .marker-icon-container svg {
					filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.4));
				}
				.custom-marker.tier-unverified {
					opacity: 0.7;
				}
				.custom-marker.tier-unverified .marker-icon-container svg {
					filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.3));
				}

				/* Hot tier - pulsing glow */
				.custom-marker.heat-hot .marker-icon-container svg {
					animation: hot-glow 1.5s ease-in-out infinite;
				}
				@keyframes hot-glow {
					0%,
					100% {
						filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.5)) drop-shadow(0 0 3px rgba(255, 107, 53, 0.5));
					}
					50% {
						filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.5)) drop-shadow(0 0 5px rgba(255, 107, 53, 0.6));
					}
				}

				/* Rising tier - subtle pulse */
				.custom-marker.heat-rising .marker-icon-container svg {
					animation: rising-pulse 2s ease-in-out infinite;
				}
				@keyframes rising-pulse {
					0%,
					100% {
						filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.5)) drop-shadow(0 0 2px rgba(255, 165, 0, 0.4));
					}
					50% {
						filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.5)) drop-shadow(0 0 4px rgba(255, 165, 0, 0.5));
					}
				}

				/* Active tier - slight glow */
				.custom-marker.heat-active .marker-icon-container svg {
					filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.5)) drop-shadow(0 0 2px rgba(100, 200, 255, 0.3));
				}

				/* Low tier - muted */
				.custom-marker.heat-low {
					opacity: 0.65;
				}
				.custom-marker.heat-low .marker-icon-container svg {
					filter: saturate(0.7) drop-shadow(0 1px 1px rgba(0, 0, 0, 0.4));
				}

				/* Enhanced Tooltip Styles */
				.leaflet-tooltip-pane {
					z-index: 650 !important; /* Below navigation dropdowns (1300) */
				}
				.site-tooltip {
					padding: 0 !important;
					border: none !important;
					background: transparent !important;
					box-shadow: none !important;
				}
				.site-tooltip .leaflet-tooltip-content {
					margin: 0;
				}
				.site-tooltip-content {
					background: #1a1f26;
					border: 1px solid rgba(255, 255, 255, 0.1);
					border-radius: 8px;
					overflow: hidden;
					box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
					min-width: 160px;
					max-width: 200px;
				}
				.site-tooltip-thumbnail {
					position: relative;
					width: 100%;
					height: 72px;
					overflow: hidden;
					background: #0a0c10;
				}
				.site-tooltip-thumbnail img {
					width: 100%;
					height: 100%;
					object-fit: cover;
				}
				.site-tooltip-badge-overlay {
					position: absolute;
					top: 5px;
					left: 5px;
				}
				.site-tooltip-info {
					padding: 6px 8px;
				}
				.site-tooltip-name {
					font-weight: 600;
					font-size: 12px;
					color: #fff;
					margin: 0 0 2px 0;
					line-height: 1.2;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
				}
				.site-tooltip-row {
					display: flex;
					align-items: center;
					justify-content: space-between;
					gap: 6px;
				}
				.site-tooltip-type {
					font-size: 10px;
					color: #94a3b8;
					margin: 0;
					text-transform: capitalize;
				}
				.site-tooltip-badge {
					font-size: 8px;
					font-weight: 600;
					text-transform: uppercase;
					padding: 2px 5px;
					border-radius: 3px;
					letter-spacing: 0.3px;
					backdrop-filter: blur(4px);
				}
				.site-tooltip-badge.official {
					background: rgba(34, 197, 94, 0.85);
					color: #fff;
				}
				.site-tooltip-badge.bronze {
					background: rgba(251, 146, 60, 0.85);
					color: #fff;
				}
				.site-tooltip-badge.silver {
					background: rgba(148, 163, 184, 0.85);
					color: #fff;
				}
				.site-tooltip-badge.gold {
					background: rgba(250, 204, 21, 0.85);
					color: #1a1f26;
				}
				.site-tooltip-badge.promoted {
					background: rgba(34, 197, 94, 0.85);
					color: #fff;
				}
				.site-tooltip-media {
					font-size: 9px;
					color: #64748b;
				}

				/* Leaflet tooltip arrow override */
				.site-tooltip::before {
					border-top-color: #1a1f26 !important;
				}

				/* Quick Zoom Controls */
				.zoom-controls {
					position: absolute;
					bottom: 24px;
					right: 12px;
					z-index: 1000;
					display: flex;
					flex-direction: column;
					gap: 2px;
					background: rgba(26, 31, 38, 0.95);
					border: 1px solid rgba(255, 255, 255, 0.1);
					border-radius: 10px;
					padding: 4px;
					box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
					backdrop-filter: blur(8px);
				}
				/* Mobile: position at top-right */
				@media (max-width: 768px) {
					.zoom-controls {
						top: 12px;
						bottom: auto;
						right: 12px;
						flex-direction: row;
					}
				}
				.zoom-control-btn {
					width: 36px;
					height: 36px;
					display: flex;
					align-items: center;
					justify-content: center;
					border: none;
					background: transparent;
					color: #94a3b8;
					cursor: pointer;
					border-radius: 6px;
					transition: all 0.15s ease;
				}
				.zoom-control-btn:hover {
					background: rgba(255, 255, 255, 0.1);
					color: #fff;
				}
				.zoom-control-btn:active {
					transform: scale(0.95);
				}
				.zoom-control-btn.active {
					background: rgba(99, 102, 241, 0.3);
					color: #a5b4fc;
				}
				.zoom-control-btn svg {
					width: 18px;
					height: 18px;
				}

				/* Light mode adjustments */
				:root[data-theme="light"] .zoom-controls,
				.light .zoom-controls {
					background: rgba(255, 255, 255, 0.95);
					border-color: rgba(0, 0, 0, 0.1);
					box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
				}
				:root[data-theme="light"] .zoom-control-btn,
				.light .zoom-control-btn {
					color: #64748b;
				}
				:root[data-theme="light"] .zoom-control-btn:hover,
				.light .zoom-control-btn:hover {
					background: rgba(0, 0, 0, 0.05);
					color: #1e293b;
				}
				:root[data-theme="light"] .zoom-control-btn.active,
				.light .zoom-control-btn.active {
					background: rgba(99, 102, 241, 0.15);
					color: #6366f1;
				}

				/* Hide Leaflet tooltips when focus tooltip is active */
				.suppress-leaflet-tooltips .leaflet-tooltip,
				.suppress-leaflet-tooltips .site-tooltip {
					display: none !important;
					opacity: 0 !important;
					pointer-events: none !important;
				}
			`}</style>

			<MapContainer
				center={selectedSite ? [selectedSite.coordinates.lat, selectedSite.coordinates.lng] : MAP_CENTER}
				zoom={selectedSite ? 6 : DEFAULT_ZOOM}
				scrollWheelZoom
				className="h-full w-full"
			>
				<TileLayer url={tileLayer.url} attribution={tileLayer.attribution} />
				<BoundsWatcher onChange={onBoundsChange} onZoomChange={onZoomChange} />
				<MapClickHandler onClick={onMapClick} />
				<MapReadyHandler onReady={onMapReady} />
				<MapMoveHandler onMove={onMapMove} />
				<ZoomControls sites={sites} onSelect={onSelect} />
				<SelectedSiteFocus site={selectedSite} drawerHeightPercent={drawerHeightPercent} />
				{zones.map((zone) => (
					<Rectangle key={zone.id} bounds={toLeafletBounds(zone.bounds)} pathOptions={{ color: zone.color, weight: 1.5, fillOpacity: 0.08 }}>
						<Tooltip direction="center" opacity={0.9} className="text-xs">
							<div className="space-y-1">
								<p className="font-semibold text-foreground">{zone.name}</p>
								<p className="text-muted-foreground">{zone.cultureFocus.join(", ")}</p>
							</div>
						</Tooltip>
					</Rectangle>
				))}
				{sites.map((site) => (
					<SiteMarker
						key={site.id}
						site={site}
						isSelected={site.id === selectedSiteId}
						isAutoHovered={site.id === autoHoveredSiteId}
						onSelect={onSelect}
						suppressTooltip={!!autoHoveredSiteId}
					/>
				))}
			</MapContainer>
		</div>
	);
};
