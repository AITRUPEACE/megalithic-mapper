"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { SiteFilters } from "./site-filters";
import { SiteList } from "./site-list";
import { SiteDetailPanel } from "./site-detail-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import type { BoundingBox, CommunityTier, MapSiteFeature, MapZoneFeature, SiteCategory } from "@/types/map";
import { useMapStore, applySiteFilters } from "@/state/map-store";
import { SiteEditor } from "./site-editor";
import { ZoneEditor } from "./zone-editor";
import { loadMapData } from "../actions";
import type L from "leaflet";

const SiteMap = dynamic(() => import("./site-map").then((module) => module.SiteMap), {
  ssr: false,
});

interface SiteExplorerProps {
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

export const SiteExplorer = ({ initialSites, initialZones, initialBounds }: SiteExplorerProps) => {
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
  const searchParams = useSearchParams();
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [activeEditor, setActiveEditor] = useState<"site" | "zone" | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isHydrated, setHydrated] = useState(false);
  const lastBoundsRef = useRef<BoundingBox | null>(null);

  useEffect(() => {
    initialize({ sites: initialSites, zones: initialZones, bounds: initialBounds });
    lastBoundsRef.current = initialBounds;
    setHydrated(true);
  }, [initialize, initialSites, initialZones, initialBounds]);

  const filteredSites = useMemo(() => applySiteFilters(sites, filters), [sites, filters]);
  const selectedSite = useMemo(() => sites.find((site) => site.id === selectedSiteId) ?? null, [sites, selectedSiteId]);

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

  const focusParam = searchParams.get("focus");
  const projectParam = searchParams.get("project");
  const siteParam = searchParams.get("site");

  useEffect(() => {
    if (!sites.length || !isHydrated) return;

    if (focusParam) {
      selectSite(focusParam);
      return;
    }

    if (siteParam) {
      selectSite(siteParam);
      return;
    }

    if (projectParam) {
      const relatedSite = sites.find((site) => site.relatedResearchIds.includes(projectParam));
      if (relatedSite) {
        selectSite(relatedSite.id);
      }
    }
  }, [focusParam, projectParam, siteParam, selectSite, sites, isHydrated]);

  useEffect(() => {
    setDrawerOpen(selectedSite !== null);
  }, [selectedSite]);

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

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Global research map</h2>
          <p className="text-sm text-muted-foreground">
            Explore trusted field submissions, research-linked hypotheses, and community discoveries in one Leaflet view.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Leaflet integration</Badge>
          {isPending && <Badge variant="outline">Updating viewport</Badge>}
          <Button
            size="sm"
            variant={activeEditor === "site" ? "ghost" : "secondary"}
            onClick={() => setActiveEditor((prev) => (prev === "site" ? null : "site"))}
          >
            {activeEditor === "site" ? "Hide site form" : "New site"}
          </Button>
          <Button
            size="sm"
            variant={activeEditor === "zone" ? "ghost" : "secondary"}
            onClick={() => setActiveEditor((prev) => (prev === "zone" ? null : "zone"))}
          >
            {activeEditor === "zone" ? "Hide zone form" : "New zone"}
          </Button>
        </div>
      </div>

      {activeEditor === "site" && (
        <SiteEditor
          className="border border-dashed border-primary/40 bg-primary/5"
          zones={zones}
          site={selectedSite}
          onClose={() => setActiveEditor(null)}
        />
      )}

      {activeEditor === "zone" && (
        <ZoneEditor
          className="border border-dashed border-secondary/40 bg-secondary/5"
          onClose={() => setActiveEditor(null)}
        />
      )}

      <div className="flex flex-1 flex-col gap-4 lg:grid lg:grid-cols-[320px_1fr] lg:gap-6">
        <div className="order-2 flex min-h-[320px] flex-col overflow-hidden rounded-xl border border-border/40 bg-background/15 lg:order-1 lg:max-h-[calc(100vh-200px)]">
          <SiteFilters
            variant="flat"
            className="max-h-[220px] overflow-y-auto border-b border-border/30"
            filters={filters}
            availableCultures={cultures}
            availableEras={eras}
            availableSiteTypes={siteTypes}
            availableCommunityTiers={communityTiers}
            availableCategories={categories}
            availableZones={zoneOptions}
            availableTags={themeTags}
            onUpdate={setFilters}
            onClear={clearFilters}
          />
          <SiteList
            variant="flat"
            className="flex-1 overflow-hidden"
            scrollClassName="h-full"
            sites={filteredSites}
            selectedSiteId={selectedSiteId}
            onSelect={selectSite}
          />
        </div>
        <div className="order-1 relative flex min-h-[400px] flex-col overflow-hidden rounded-xl border border-border/40 bg-background/10 lg:order-2 lg:max-h-[calc(100vh-200px)]">
          <SiteMap
            sites={filteredSites}
            zones={zones}
            selectedSiteId={selectedSiteId}
            onSelect={selectSite}
            className="h-[55vh] min-h-[320px] lg:flex-1 lg:h-full"
            onBoundsChange={handleBoundsChange}
          />
          <SiteDetailDrawer
            site={selectedSite}
            open={isDrawerOpen && !!selectedSite}
            onClose={() => setDrawerOpen(false)}
          />
        </div>
      </div>
    </div>
  );
};

interface SiteDetailDrawerProps {
  site: ReturnType<typeof getSelectedSite>;
  open: boolean;
  onClose: () => void;
}

const SiteDetailDrawer = ({ site, open, onClose }: SiteDetailDrawerProps) => {
  return (
    <div
      className={cn(
        "absolute inset-0 flex items-end justify-center p-4 transition-opacity duration-300 sm:justify-end sm:p-6",
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      )}
    >
      <div
        className={cn(
          "w-full max-w-md transform transition-all duration-300",
          open ? "translate-y-0" : "translate-y-8"
        )}
      >
        <div className="relative rounded-xl bg-background/95 shadow-2xl backdrop-blur">
          <button
            type="button"
            className="absolute right-3 top-3 z-10 rounded-full bg-background/90 px-2 py-1 text-xs text-muted-foreground shadow"
            onClick={onClose}
          >
            Close
          </button>
          <SiteDetailPanel site={site ?? null} variant="flat" className="border-none bg-transparent shadow-none" />
        </div>
      </div>
    </div>
  );
};
