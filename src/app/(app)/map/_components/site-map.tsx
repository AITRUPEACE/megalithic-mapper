"use client";

import { MapContainer, TileLayer, Marker, Tooltip, useMap, useMapEvents, Rectangle } from "react-leaflet";
import { useEffect, useMemo } from "react";
import L from "leaflet";
import type { BoundingBox, MapSiteFeature, MapZoneFeature } from "@/entities/map/model/types";
import { cn } from "@/shared/lib/utils";

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

// Helper function to create custom pin icon with verification badge
const createCustomPinIcon = (site: MapSiteFeature, isSelected: boolean): L.DivIcon => {
	const baseSize = isSelected ? 16 : 12;
	const markerColor = site.layer === "official" ? verificationColors[site.verificationStatus] : communityTierColors[site.trustTier ?? "bronze"];

	// Determine badge based on verification or tier
	const getBadge = () => {
		if (site.layer === "official") {
			if (site.verificationStatus === "verified") {
				return `<svg class="badge-icon" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
			}
			if (site.verificationStatus === "under_review") {
				return `<svg class="badge-icon" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
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
			--marker-size: ${baseSize * 2}px;
		">
			<div class="marker-pin"></div>
			${getBadge() ? `<div class="marker-badge">${getBadge()}</div>` : ""}
		</div>
	`;

	return L.divIcon({
		html,
		className: "custom-marker-wrapper",
		iconSize: [baseSize * 2, baseSize * 2],
		iconAnchor: [baseSize, baseSize * 2],
		popupAnchor: [0, -baseSize * 2],
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

// Custom marker component
const SiteMarker = ({ site, isSelected, onSelect }: { site: MapSiteFeature; isSelected: boolean; onSelect: (id: string) => void }) => {
	const icon = useMemo(() => createCustomPinIcon(site, isSelected), [site, isSelected]);

	return (
		<Marker position={[site.coordinates.lat, site.coordinates.lng]} icon={icon} eventHandlers={{ click: () => onSelect(site.id) }}>
			<Tooltip direction="top" offset={[0, -20]} opacity={1} className="text-xs">
				<div className="space-y-1">
					<p className="font-semibold text-foreground">{site.name}</p>
					<p className="text-muted-foreground">{site.tags.cultures.join(", ") || "Unknown culture"}</p>
					<p className="text-muted-foreground">{site.siteType}</p>
					<p className="text-[10px] uppercase tracking-wide text-muted-foreground">
						{site.layer === "official" ? "Official dataset" : `Community ${site.trustTier ?? "bronze"} tier`}
					</p>
				</div>
			</Tooltip>
		</Marker>
	);
};

export const SiteMap = ({ sites, zones, selectedSiteId, onSelect, className, onBoundsChange, onMapClick, onMapReady }: SiteMapProps) => {
	const selectedSite = useMemo(() => sites.find((site) => site.id === selectedSiteId) ?? null, [sites, selectedSiteId]);

	return (
		<div className={cn("overflow-hidden", className)}>
			<style jsx global>{`
				.custom-marker-wrapper {
					background: transparent;
					border: none;
				}
				.custom-marker {
					position: relative;
					width: var(--marker-size);
					height: var(--marker-size);
					transition: all 0.2s ease;
				}
				.custom-marker.selected {
					transform: scale(1.2);
					filter: drop-shadow(0 0 8px var(--marker-color));
				}
				.marker-pin {
					position: absolute;
					width: 100%;
					height: 100%;
					background: var(--marker-color);
					border: 2px solid rgba(255, 255, 255, 0.9);
					border-radius: 50% 50% 50% 0;
					transform: rotate(-45deg);
					box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
				}
				.custom-marker.selected .marker-pin {
					border-width: 3px;
					box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);
				}
				.marker-badge {
					position: absolute;
					top: 50%;
					left: 50%;
					transform: translate(-50%, -60%);
					z-index: 10;
					display: flex;
					align-items: center;
					justify-content: center;
				}
				.badge-icon {
					filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.8));
				}
				.badge-text {
					color: white;
					font-size: 10px;
					font-weight: bold;
					text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
				}
			`}</style>
			<MapContainer
				center={selectedSite ? [selectedSite.coordinates.lat, selectedSite.coordinates.lng] : MAP_CENTER}
				zoom={selectedSite ? 6 : DEFAULT_ZOOM}
				scrollWheelZoom
				className="h-full w-full"
			>
				<TileLayer url={TILE_LAYERS.dark.url} attribution={TILE_LAYERS.dark.attribution} />
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
