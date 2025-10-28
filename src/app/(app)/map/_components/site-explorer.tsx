"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { SiteFilters } from "./site-filters";
import { SiteList } from "./site-list";
import { SiteDetailPanel } from "./site-detail-panel";
import { filterSites, getSelectedSite, useSiteStore } from "@/state/site-store";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { MapSite } from "@/lib/types";

const SiteMap = dynamic(() => import("./site-map").then((module) => module.SiteMap), {
  ssr: false,
});

export const SiteExplorer = () => {
  const { sites, filters, selectedSiteId, setFilters, clearFilters, selectSite } = useSiteStore();

  const filteredSites = useMemo(() => filterSites(sites, filters), [sites, filters]);
  const selectedSite = useMemo(() => getSelectedSite(sites, selectedSiteId), [sites, selectedSiteId]);

  const civilizations = useMemo(
    () => Array.from(new Set<MapSite["civilization"]>(sites.map((site) => site.civilization))).sort(),
    [sites]
  );
  const siteTypes = useMemo(
    () => Array.from(new Set<MapSite["siteType"]>(sites.map((site) => site.siteType))).sort(),
    [sites]
  );

  return (
    <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold">Global research map</h2>
            <p className="text-sm text-muted-foreground">
              Explore trusted field submissions, research-linked hypotheses, and community discoveries in one Leaflet view.
            </p>
          </div>
          <Badge variant="secondary">Leaflet integration</Badge>
        </div>
        <SiteMap
          sites={filteredSites}
          selectedSiteId={selectedSiteId}
          onSelect={selectSite}
        />
        <Separator className="border-border/40" />
        <SiteDetailPanel site={selectedSite} />
      </div>
      <div className="space-y-4">
        <SiteFilters
          filters={filters}
          availableCivilizations={civilizations}
          availableSiteTypes={siteTypes}
          onUpdate={setFilters}
          onClear={clearFilters}
        />
        <SiteList sites={filteredSites} selectedSiteId={selectedSiteId} onSelect={selectSite} />
      </div>
    </div>
  );
};
