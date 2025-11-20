"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import type L from "leaflet";

import { applySiteFilters, useMapStore } from "@/state/map-store";
import { loadMapData } from "../server/load-map-data";
import type {
  BoundingBox,
  CommunityTier,
  MapSiteFeature,
  MapZoneFeature,
  SiteCategory,
} from "@/types/map";

interface UseMapExplorerOptions {
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

export function useMapExplorer({ initialSites, initialZones, initialBounds }: UseMapExplorerOptions) {
  const {
    sites,
    zones,
    filters,
    selectedSiteId,
    setFilters,
    clearFilters,
    selectSite,
    initialize,
    replaceData,
    setBounds,
  } = useMapStore();
  const [isPending, startTransition] = useTransition();
  const [isHydrated, setHydrated] = useState(false);
  const lastBoundsRef = useRef<BoundingBox | null>(null);

  useEffect(() => {
    initialize({ sites: initialSites, zones: initialZones, bounds: initialBounds });
    lastBoundsRef.current = initialBounds;
    setHydrated(true);
  }, [initialize, initialSites, initialZones, initialBounds]);

  const filteredSites = useMemo(() => applySiteFilters(sites, filters), [sites, filters]);
  const selectedSite = useMemo(() => sites.find((site) => site.id === selectedSiteId) ?? null, [
    sites,
    selectedSiteId,
  ]);

  const cultures = useMemo(
    () => Array.from(new Set(sites.flatMap((site) => site.tags.cultures))).sort(),
    [sites]
  );
  const eras = useMemo(() => Array.from(new Set(sites.flatMap((site) => site.tags.eras))).sort(), [sites]);
  const siteTypes = useMemo(
    () => Array.from(new Set(sites.map((site) => site.siteType))).sort(),
    [sites]
  );
  const categories = useMemo(() => {
    const order: SiteCategory[] = ["site", "artifact", "text"];
    return order.filter((category) => sites.some((site) => site.category === category));
  }, [sites]);
  const communityTiers = useMemo(() => {
    const tierOrder: CommunityTier[] = ["bronze", "silver", "gold", "promoted"];
    const tiers = new Set<CommunityTier>();
    sites.forEach((site) => {
      if (site.layer === "community" && site.trustTier) {
        tiers.add(site.trustTier);
      }
    });
    return tierOrder.filter((tier) => tiers.has(tier));
  }, [sites]);
  const zoneOptions = useMemo(() => zones.map((zone) => ({ id: zone.id, name: zone.name })), [zones]);
  const themeTags = useMemo(
    () => Array.from(new Set(sites.flatMap((site) => site.tags.themes))).sort(),
    [sites]
  );

  const handleBoundsChange = useCallback(
    (bounds: L.LatLngBounds) => {
      if (!isHydrated) return;
      const nextBounds = toBoundingBox(bounds);
      const last = lastBoundsRef.current;
      const hasMeaningfulChange =
        !last ||
        Math.abs(nextBounds.minLat - last.minLat) > 0.1 ||
        Math.abs(nextBounds.minLng - last.minLng) > 0.1 ||
        Math.abs(nextBounds.maxLat - last.maxLat) > 0.1 ||
        Math.abs(nextBounds.maxLng - last.maxLng) > 0.1;

      if (!hasMeaningfulChange) return;
      lastBoundsRef.current = nextBounds;
      setBounds(nextBounds);

      const layersFilter = filters.layer === "composite" ? undefined : [filters.layer];
      const verificationFilter = filters.verification === "all" ? undefined : [filters.verification];
      const zoneFilter = filters.zones.length ? filters.zones : undefined;
      const tagFilter = filters.tags.length ? filters.tags : undefined;

      startTransition(async () => {
        const payload = await loadMapData({
          bounds: nextBounds,
          layers: layersFilter,
          verification: verificationFilter,
          zoneIds: zoneFilter,
          tags: tagFilter,
        });
        replaceData({ sites: payload.sites, zones: payload.zones });
      });
    },
    [filters.layer, filters.tags, filters.verification, filters.zones, isHydrated, replaceData, setBounds]
  );

  return {
    sites,
    zones,
    filters,
    selectedSite,
    selectedSiteId,
    filteredSites,
    isPending,
    isHydrated,
    setFilters,
    clearFilters,
    selectSite,
    handleBoundsChange,
    options: {
      cultures,
      eras,
      siteTypes,
      categories,
      communityTiers,
      zoneOptions,
      themeTags,
    },
  };
}
