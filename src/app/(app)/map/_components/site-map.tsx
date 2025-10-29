"use client";

import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from "react-leaflet";
import { useEffect, useMemo } from "react";
import L from "leaflet";
import type { LatLngTuple } from "leaflet";
import type { MapSite } from "@/lib/types";
import { cn } from "@/lib/utils";

const MAP_CENTER: [number, number] = [20, 10];

interface SiteMapProps {
  sites: MapSite[];
  selectedSiteId: string | null;
  onSelect: (siteId: string) => void;
  className?: string;
  onBoundsChange?: (bounds: L.LatLngBounds) => void;
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

const MapBounds = ({ sites, onBoundsChange }: { sites: MapSite[]; onBoundsChange?: (bounds: L.LatLngBounds) => void }) => {
  const map = useMap();

  useEffect(() => {
    if (!sites.length) return;

    const coordinates = sites.map(
      (site) => [site.latitude, site.longitude] as LatLngTuple
    );
    const bounds = L.latLngBounds(coordinates);

    if (!bounds.isValid()) return;

    const targetBounds = coordinates.length === 1 ? bounds.pad(0.25) : bounds;

    map.fitBounds(targetBounds, { padding: [48, 48], animate: false });
    if (onBoundsChange) {
      onBoundsChange(bounds);
    }
  }, [map, sites, onBoundsChange]);

  return null;
};

const SelectedSiteFocus = ({ site }: { site: MapSite | null }) => {
  const map = useMap();

  useEffect(() => {
    if (!site) return;
    map.flyTo([site.latitude, site.longitude], 6, { duration: 0.8 });
  }, [map, site]);

  return null;
};

export const SiteMap = ({ sites, selectedSiteId, onSelect, className, onBoundsChange }: SiteMapProps) => {
  const selectedSite = useMemo(
    () => sites.find((site) => site.id === selectedSiteId) ?? null,
    [sites, selectedSiteId]
  );

  return (
    <div className={cn("glass-panel overflow-hidden border-border/40", className)}>
      <MapContainer
        center={selectedSite ? [selectedSite.latitude, selectedSite.longitude] : MAP_CENTER}
        zoom={selectedSite ? 6 : 3}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapBounds sites={sites} onBoundsChange={onBoundsChange} />
        <SelectedSiteFocus site={selectedSite} />
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
              center={[site.latitude, site.longitude]}
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
                  <p className="text-muted-foreground">{site.civilization}</p>
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
