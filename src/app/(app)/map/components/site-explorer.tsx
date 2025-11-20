"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MediaCarousel } from "@/components/ui/media-carousel";
import { Panel, PanelContent, PanelDescription, PanelHeader, PanelTitle } from "@/components/ui/panel";
import { TabbedDrawer } from "@/components/ui/tabbed-drawer";
import type { BoundingBox, MapSiteFeature, MapZoneFeature } from "@/types/map";
import { useMapExplorer } from "../hooks/use-map-explorer";
import { SiteDetailPanel } from "./site-detail-panel";
import { SiteEditor } from "./site-editor";
import { SiteFilters } from "./site-filters";
import { SiteList } from "./site-list";
import { ZoneEditor } from "./zone-editor";

const SiteMap = dynamic(() => import("./site-map").then((module) => module.SiteMap), {
  ssr: false,
});

interface SiteExplorerProps {
  initialSites: MapSiteFeature[];
  initialZones: MapZoneFeature[];
  initialBounds: BoundingBox;
}

export const SiteExplorer = ({ initialSites, initialZones, initialBounds }: SiteExplorerProps) => {
  const {
    filters,
    setFilters,
    clearFilters,
    selectSite,
    selectedSite,
    selectedSiteId,
    filteredSites,
    zones,
    options,
    handleBoundsChange,
    isPending,
    isHydrated,
  } = useMapExplorer({ initialSites, initialZones, initialBounds });

  const searchParams = useSearchParams();
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [activeEditor, setActiveEditor] = useState<"site" | "zone" | null>(null);

  const focusParam = searchParams.get("focus");
  const projectParam = searchParams.get("project");
  const siteParam = searchParams.get("site");

  useEffect(() => {
    if (!filteredSites.length || !isHydrated) return;

    if (focusParam) {
      selectSite(focusParam);
      return;
    }

    if (siteParam) {
      selectSite(siteParam);
      return;
    }

    if (projectParam) {
      const relatedSite = filteredSites.find((site) => site.relatedResearchIds.includes(projectParam));
      if (relatedSite) {
        selectSite(relatedSite.id);
      }
    }
  }, [focusParam, projectParam, siteParam, filteredSites, selectSite, isHydrated]);

  useEffect(() => {
    setDrawerOpen(selectedSite !== null);
  }, [selectedSite]);

  const drawerTabs = useMemo(() => {
    if (!selectedSite) return [];

    return [
      {
        id: "details",
        label: "Details",
        content: (
          <SiteDetailPanel
            site={selectedSite}
            variant="flat"
            className="border-none bg-transparent p-0 shadow-none"
          />
        ),
      },
      {
        id: "insights",
        label: "Metadata",
        content: <SiteInsightSummary site={selectedSite} />,
      },
    ];
  }, [selectedSite]);

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Global research map</h2>
          <p className="text-sm text-muted-foreground">
            Explore trusted field submissions, research-linked hypotheses, and community discoveries in one
            Leaflet view.
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
        <Panel className="order-2 flex min-h-[320px] flex-col overflow-hidden bg-background/60 lg:order-1 lg:max-h-[calc(100vh-200px)]">
          <PanelHeader>
            <PanelTitle>Filters & list</PanelTitle>
            <PanelDescription>Align viewport queries with the dataset before opening details.</PanelDescription>
          </PanelHeader>
          <PanelContent className="flex flex-1 flex-col gap-0 p-0">
            <SiteFilters
              variant="flat"
              className="max-h-[220px] overflow-y-auto border-b border-border/30"
              filters={filters}
              availableCultures={options.cultures}
              availableEras={options.eras}
              availableSiteTypes={options.siteTypes}
              availableCommunityTiers={options.communityTiers}
              availableCategories={options.categories}
              availableZones={options.zoneOptions}
              availableTags={options.themeTags}
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
          </PanelContent>
        </Panel>

        <Panel className="order-1 relative flex min-h-[400px] flex-col overflow-hidden bg-background/60 lg:order-2 lg:max-h-[calc(100vh-200px)]">
          <PanelHeader className="flex items-center justify-between gap-3">
            <div>
              <PanelTitle>Spatial overview</PanelTitle>
              <PanelDescription>Live Leaflet canvas synced with server-side filters.</PanelDescription>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{filteredSites.length} sites</span>
              <span className="hidden sm:inline" aria-hidden>
                ·
              </span>
              <span className="hidden sm:inline">{zones.length} zones</span>
            </div>
          </PanelHeader>
          <PanelContent className="relative flex flex-1 flex-col p-0">
            <SiteMap
              sites={filteredSites}
              zones={zones}
              selectedSiteId={selectedSiteId}
              onSelect={selectSite}
              className="h-[55vh] min-h-[320px] lg:flex-1 lg:h-full"
              onBoundsChange={handleBoundsChange}
            />
            <TabbedDrawer
              title={selectedSite?.name ?? "Site details"}
              description={selectedSite ? "Research metadata and collaboration hooks" : "Select a site to open details"}
              tabs={drawerTabs}
              open={isDrawerOpen && !!selectedSite}
              onClose={() => setDrawerOpen(false)}
              defaultTab="details"
            />
          </PanelContent>
        </Panel>
      </div>
    </div>
  );
};

function SiteInsightSummary({ site }: { site: MapSiteFeature }) {
  const mediaItems = useMemo(() => {
    if (site.mediaCount === 0) return [];
    return Array.from({ length: Math.min(site.mediaCount, 5) }).map((_, index) => ({
      id: `${site.id}-media-${index}`,
      type: "image" as const,
      title: `Placeholder media ${index + 1}`,
    }));
  }, [site.id, site.mediaCount]);

  return (
    <div className="space-y-4 text-sm text-muted-foreground">
      <MediaCarousel items={mediaItems} />
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-border/40 bg-background/60 p-3">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Zone membership</p>
          <div className="mt-1 flex flex-wrap gap-2">
            {site.zoneMemberships.length === 0 && <span>No zones linked</span>}
            {site.zoneMemberships.map((zone) => (
              <span
                key={zone.id}
                className="rounded-full px-3 py-1 text-xs"
                style={{ backgroundColor: `${zone.color}22`, color: zone.color }}
              >
                {zone.name}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-border/40 bg-background/60 p-3">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Tag coverage</p>
          <div className="mt-1 flex flex-wrap gap-2 text-xs">
            {[...site.tags.themes, ...site.tags.cultures, ...site.tags.eras].map((tag) => (
              <span key={tag} className="rounded-full bg-primary/10 px-3 py-1 text-primary">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-border/40 bg-background/60 p-3">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Verification</p>
          <p className="mt-1 capitalize text-foreground">{site.verificationStatus.replace("_", " ")}</p>
          {site.trustTier && (
            <p className="text-xs">Community tier: {site.trustTier}</p>
          )}
        </div>
        <div className="rounded-lg border border-border/40 bg-background/60 p-3">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Linked research</p>
          <p className="mt-1 text-foreground">{site.relatedResearchIds.length} threads</p>
          <p className="text-xs">{site.mediaCount} media assets staged</p>
        </div>
      </div>
    </div>
  );
}
