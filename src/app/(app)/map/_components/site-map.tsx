"use client";

import { MapContainer, TileLayer, Marker, Tooltip, useMap, useMapEvents, Rectangle } from "react-leaflet";
import { useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import L from "leaflet";
import type { BoundingBox, MapSiteFeature, MapZoneFeature } from "@/entities/map/model/types";
import { cn } from "@/shared/lib/utils";
import { getSiteTypeIconSvg } from "@/components/map/site-type-icons";

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
	sites: MapSiteFeature[];
	zones: MapZoneFeature[];
	selectedSiteId: string | null;
	onSelect: (siteId: string) => void;
	className?: string;
	onBoundsChange?: (bounds: L.LatLngBounds) => void;
	onMapClick?: (lat: number, lng: number) => void;
	onMapReady?: (map: L.Map) => void;
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

// Heat tier size multipliers
const heatSizeMultipliers: Record<MapSiteFeature["heatTier"] & string, number> = {
	hot: 1.2,
	rising: 1.1,
	active: 1.0,
	normal: 1.0,
	low: 0.9,
};

// Helper function to create clean icon-only marker
const createCustomPinIcon = (site: MapSiteFeature, isSelected: boolean): L.DivIcon => {
	const heatTier = site.heatTier ?? "normal";
	const sizeMultiplier = heatSizeMultipliers[heatTier];

	// Icon sizing - slightly larger for visibility
	const iconSize = isSelected ? 32 : Math.round(24 * sizeMultiplier);
	const svgSize = isSelected ? 24 : Math.round(18 * sizeMultiplier);

	// Color by site type
	const iconColor = getSiteTypeColor(site.siteType);

	// Get site type icon SVG with the site type color
	const siteTypeIcon = getSiteTypeIconSvg(site.siteType, iconColor, svgSize);

	// Heat indicator (only for hot sites)
	const heatBadge = heatTier === "hot" ? `<div class="marker-fire">🔥</div>` : "";

	const html = `
		<div class="site-marker ${isSelected ? "selected" : ""} heat-${heatTier}" style="
			--bg-color: ${iconColor};
			--size: ${iconSize}px;
		">
			${siteTypeIcon}
			${heatBadge}
		</div>
	`;

	return L.divIcon({
		html,
		className: "site-marker-wrapper",
		iconSize: [iconSize, iconSize],
		iconAnchor: [iconSize / 2, iconSize / 2],
		popupAnchor: [0, -iconSize / 2],
	});
};

const SelectedSiteFocus = ({ site }: { site: MapSiteFeature | null }) => {
	const map = useMap();

	useEffect(() => {
		if (!site) return;
		map.flyTo([site.coordinates.lat, site.coordinates.lng], 6, { duration: 0.8 });
	}, [map, site]);

	return null;
};

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

const MapReadyHandler = ({ onReady }: { onReady?: (map: L.Map) => void }) => {
	const map = useMap();

	useEffect(() => {
		onReady?.(map);
	}, [map, onReady]);

	return null;
};

const toLeafletBounds = (bounds: BoundingBox): L.LatLngBoundsExpression => [
	[bounds.minLat, bounds.minLng],
	[bounds.maxLat, bounds.maxLng],
];

// Sample thumbnails for demo (in production, this would come from site.thumbnailUrl)
const sampleThumbnails: Record<string, string> = {
	avebury: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Avebury_henge_and_village_UK.jpg/320px-Avebury_henge_and_village_UK.jpg",
	stonehenge: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Stonehenge2007_07_30.jpg/320px-Stonehenge2007_07_30.jpg",
	giza: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Kheops-Pyramid.jpg/320px-Kheops-Pyramid.jpg",
	pyramid: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Kheops-Pyramid.jpg/320px-Kheops-Pyramid.jpg",
	machu: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Machu_Picchu%2C_Peru.jpg/320px-Machu_Picchu%2C_Peru.jpg",
	nazca: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Nazca_Lines_-_Hands.jpg/320px-Nazca_Lines_-_Hands.jpg",
	petra: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/The_Treasury_in_Petra.jpg/240px-The_Treasury_in_Petra.jpg",
	angkor: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Angkor_Wat.jpg/320px-Angkor_Wat.jpg",
	easter: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Moai_Rano_raraku.jpg/320px-Moai_Rano_raraku.jpg",
	göbekli: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/G%C3%B6bekli_Tepe%2C_Urfa.jpg/320px-G%C3%B6bekli_Tepe%2C_Urfa.jpg",
	gobekli: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/G%C3%B6bekli_Tepe%2C_Urfa.jpg/320px-G%C3%B6bekli_Tepe%2C_Urfa.jpg",
};

// Get thumbnail URL for a site (demo implementation)
const getThumbnailUrl = (site: MapSiteFeature): string | null => {
	// In production, use site.thumbnailUrl directly
	// For demo, check if site name matches known sites
	const nameLower = site.name.toLowerCase();
	for (const [key, url] of Object.entries(sampleThumbnails)) {
		if (nameLower.includes(key)) {
			return url;
		}
	}
	// Only show thumbnails for verified official sites (they'd have images in production)
	return null;
};

// Custom marker component with enhanced tooltip
const SiteMarker = ({ site, isSelected, onSelect }: { site: MapSiteFeature; isSelected: boolean; onSelect: (id: string) => void }) => {
	const icon = useMemo(() => createCustomPinIcon(site, isSelected), [site, isSelected]);
	const thumbnailUrl = useMemo(() => getThumbnailUrl(site), [site]);
	const isVerified = site.layer === "official" && site.verificationStatus === "verified";

	return (
		<Marker position={[site.coordinates.lat, site.coordinates.lng]} icon={icon} eventHandlers={{ click: () => onSelect(site.id) }}>
			<Tooltip direction="top" offset={[0, -16]} opacity={1} className="site-tooltip">
				<div className="site-tooltip-content">
					{/* Thumbnail for verified sites */}
					{thumbnailUrl && isVerified && (
						<div className="site-tooltip-thumbnail">
							<img src={thumbnailUrl} alt={site.name} loading="lazy" />
						</div>
					)}
					<div className="site-tooltip-info">
						<div className="site-tooltip-header">
							<p className="site-tooltip-name">{site.name}</p>
							{isVerified && (
								<span className="site-tooltip-verified" title="Verified Site">
									✓
								</span>
							)}
						</div>
						<p className="site-tooltip-type">{site.siteType}</p>
						{site.tags.cultures.length > 0 && <p className="site-tooltip-culture">{site.tags.cultures.slice(0, 2).join(", ")}</p>}
						<div className="site-tooltip-meta">
							{site.layer === "official" ? (
								<span className="site-tooltip-badge official">Official</span>
							) : (
								<span className={`site-tooltip-badge ${site.trustTier ?? "bronze"}`}>{site.trustTier ?? "bronze"}</span>
							)}
							{site.mediaCount > 0 && <span className="site-tooltip-media">📷 {site.mediaCount}</span>}
						</div>
					</div>
				</div>
			</Tooltip>
		</Marker>
	);
};

export const SiteMap = ({ sites, zones, selectedSiteId, onSelect, className, onBoundsChange, onMapClick, onMapReady }: SiteMapProps) => {
	const { resolvedTheme } = useTheme();
	const selectedSite = useMemo(() => sites.find((site) => site.id === selectedSiteId) ?? null, [sites, selectedSiteId]);

	// Use appropriate tile layer based on theme
	const tileLayer = resolvedTheme === "light" ? TILE_LAYERS.light : TILE_LAYERS.dark;

	return (
		<div className={cn("overflow-hidden h-full w-full", className)}>
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
				.marker-icon-container {
					position: absolute;
					width: 100%;
					height: 100%;
					background: var(--marker-color);
					border: 2px solid rgba(255, 255, 255, 0.95);
					border-radius: 50%;
					box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
					display: flex;
					align-items: center;
					justify-content: center;
					overflow: hidden;
				}
				.custom-marker.official .marker-icon-container {
					border-color: rgba(255, 255, 255, 1);
					box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2);
				}
				.custom-marker.selected .marker-icon-container {
					border-width: 3px;
					box-shadow: 0 4px 16px rgba(0, 0, 0, 0.6);
				}
				.marker-icon-container svg {
					width: 60%;
					height: 60%;
					filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.3));
				}
				.marker-verified-badge {
					position: absolute;
					bottom: -2px;
					right: -2px;
					width: 14px;
					height: 14px;
					background: #22c55e;
					border: 2px solid white;
					border-radius: 50%;
					display: flex;
					align-items: center;
					justify-content: center;
					box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
				}
				.marker-verified-badge svg {
					width: 8px !important;
					height: 8px !important;
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

				/* Hot tier - pulsing glow */
				.custom-marker.heat-hot .marker-icon-container {
					animation: hot-glow 1.5s ease-in-out infinite;
				}
				@keyframes hot-glow {
					0%,
					100% {
						box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4), 0 0 12px rgba(255, 107, 53, 0.6);
					}
					50% {
						box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4), 0 0 24px rgba(255, 107, 53, 0.9), 0 0 36px rgba(255, 107, 53, 0.4);
					}
				}

				/* Rising tier - subtle pulse */
				.custom-marker.heat-rising .marker-icon-container {
					animation: rising-pulse 2s ease-in-out infinite;
				}
				@keyframes rising-pulse {
					0%,
					100% {
						box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4), 0 0 8px rgba(255, 165, 0, 0.3);
					}
					50% {
						box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4), 0 0 16px rgba(255, 165, 0, 0.6);
					}
				}

				/* Active tier - slight glow */
				.custom-marker.heat-active .marker-icon-container {
					box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5), 0 0 6px rgba(100, 200, 255, 0.3);
				}

				/* Low tier - muted */
				.custom-marker.heat-low {
					opacity: 0.65;
				}
				.custom-marker.heat-low .marker-icon-container {
					filter: saturate(0.7);
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
					border-radius: 10px;
					overflow: hidden;
					box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
					min-width: 180px;
					max-width: 240px;
				}
				.site-tooltip-thumbnail {
					width: 100%;
					height: 100px;
					overflow: hidden;
					background: #0a0c10;
				}
				.site-tooltip-thumbnail img {
					width: 100%;
					height: 100%;
					object-fit: cover;
					transition: transform 0.3s ease;
				}
				.site-tooltip-content:hover .site-tooltip-thumbnail img {
					transform: scale(1.05);
				}
				.site-tooltip-info {
					padding: 10px 12px;
				}
				.site-tooltip-header {
					display: flex;
					align-items: center;
					gap: 6px;
					margin-bottom: 4px;
				}
				.site-tooltip-name {
					font-weight: 600;
					font-size: 13px;
					color: #fff;
					margin: 0;
					line-height: 1.2;
					flex: 1;
				}
				.site-tooltip-verified {
					background: #22c55e;
					color: white;
					font-size: 9px;
					width: 14px;
					height: 14px;
					border-radius: 50%;
					display: flex;
					align-items: center;
					justify-content: center;
					flex-shrink: 0;
				}
				.site-tooltip-type {
					font-size: 11px;
					color: #94a3b8;
					margin: 0 0 2px 0;
					text-transform: capitalize;
				}
				.site-tooltip-culture {
					font-size: 10px;
					color: #64748b;
					margin: 0 0 8px 0;
				}
				.site-tooltip-meta {
					display: flex;
					align-items: center;
					gap: 8px;
				}
				.site-tooltip-badge {
					font-size: 9px;
					font-weight: 600;
					text-transform: uppercase;
					padding: 2px 6px;
					border-radius: 4px;
					letter-spacing: 0.5px;
				}
				.site-tooltip-badge.official {
					background: rgba(34, 197, 94, 0.2);
					color: #22c55e;
				}
				.site-tooltip-badge.bronze {
					background: rgba(251, 146, 60, 0.2);
					color: #fb923c;
				}
				.site-tooltip-badge.silver {
					background: rgba(148, 163, 184, 0.2);
					color: #94a3b8;
				}
				.site-tooltip-badge.gold {
					background: rgba(250, 204, 21, 0.2);
					color: #facc15;
				}
				.site-tooltip-badge.promoted {
					background: rgba(34, 197, 94, 0.2);
					color: #34d399;
				}
				.site-tooltip-media {
					font-size: 10px;
					color: #64748b;
				}

				/* Leaflet tooltip arrow override */
				.site-tooltip::before {
					border-top-color: #1a1f26 !important;
				}
			`}</style>
			<MapContainer
				center={selectedSite ? [selectedSite.coordinates.lat, selectedSite.coordinates.lng] : MAP_CENTER}
				zoom={selectedSite ? 6 : DEFAULT_ZOOM}
				scrollWheelZoom
				className="h-full w-full"
			>
				<TileLayer url={tileLayer.url} attribution={tileLayer.attribution} />
				<BoundsWatcher onChange={onBoundsChange} />
				<MapClickHandler onClick={onMapClick} />
				<MapReadyHandler onReady={onMapReady} />
				<SelectedSiteFocus site={selectedSite} />
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
					<SiteMarker key={site.id} site={site} isSelected={site.id === selectedSiteId} onSelect={onSelect} />
				))}
			</MapContainer>
		</div>
	);
};
