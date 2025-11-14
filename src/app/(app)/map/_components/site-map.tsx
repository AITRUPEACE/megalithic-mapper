"use client";

import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap, useMapEvents, Rectangle } from "react-leaflet";
import { useEffect, useMemo } from "react";
import L from "leaflet";
import type { BoundingBox, MapSiteFeature, MapZoneFeature } from "@/types/map";
import { cn } from "@/lib/utils";

const MAP_CENTER: [number, number] = [20, 10];

interface SiteMapProps {
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
};
