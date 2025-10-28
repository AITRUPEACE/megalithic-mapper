"use client";

import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from "react-leaflet";
import { useEffect, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { MapSite } from "@/lib/types";

const MAP_CENTER: [number, number] = [20, 10];

interface SiteMapProps {
  sites: MapSite[];
  selectedSiteId: string | null;
  onSelect: (siteId: string) => void;
}

const statusColors: Record<MapSite["verificationStatus"], string> = {
  verified: "#34d399",
  under_review: "#f59e0b",
  unverified: "#f87171",
};

const MapBounds = ({ sites }: { sites: MapSite[] }) => {
  const map = useMap();

  useEffect(() => {
    if (!sites.length) return;
    const bounds = sites.reduce(
      (acc, site) => acc.extend([site.latitude, site.longitude]),
      L.latLngBounds([sites[0].latitude, sites[0].longitude])
    );
    map.fitBounds(bounds, { padding: [40, 40], animate: true });
  }, [map, sites]);

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

export const SiteMap = ({ sites, selectedSiteId, onSelect }: SiteMapProps) => {
  const selectedSite = useMemo(
    () => sites.find((site) => site.id === selectedSiteId) ?? null,
    [sites, selectedSiteId]
  );

  return (
    <div className="glass-panel h-[520px] overflow-hidden border-border/40">
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
        <MapBounds sites={sites} />
        <SelectedSiteFocus site={selectedSite} />
        {sites.map((site) => {
          const isSelected = site.id === selectedSiteId;
          const radius = isSelected ? 14 : 10;
          return (
            <CircleMarker
              key={site.id}
              center={[site.latitude, site.longitude]}
              radius={radius}
              weight={isSelected ? 3 : 1.5}
              color={statusColors[site.verificationStatus]}
              fillColor={statusColors[site.verificationStatus]}
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
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
};
