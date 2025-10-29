"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { SiteFilters } from "./site-filters";
import { SiteList } from "./site-list";
import { SiteDetailPanel } from "./site-detail-panel";
import { filterSites, getSelectedSite, useSiteStore } from "@/state/site-store";
import { Badge } from "@/components/ui/badge";
import { CommunityTier, MapSite } from "@/lib/types";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const SiteMap = dynamic(() => import("./site-map").then((module) => module.SiteMap), {
  ssr: false,
});

export const SiteExplorer = () => {
  const { sites, filters, selectedSiteId, setFilters, clearFilters, selectSite } = useSiteStore();
  const searchParams = useSearchParams();
  const [isDrawerOpen, setDrawerOpen] = useState(false);

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

  const focusParam = searchParams.get("focus");
  const projectParam = searchParams.get("project");
  const siteParam = searchParams.get("site");

  useEffect(() => {
    if (!sites.length) return;

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
  }, [focusParam, projectParam, siteParam, selectSite, sites]);

  useEffect(() => {
    setDrawerOpen(selectedSite !== null);
  }, [selectedSite]);

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Global research map</h2>
          <p className="text-sm text-muted-foreground">
            Explore trusted field submissions, research-linked hypotheses, and community discoveries in one Leaflet view.
          </p>
        </div>
        <Badge variant="secondary">Leaflet integration</Badge>
      </div>

      <div className="flex flex-1 flex-col gap-4 lg:grid lg:grid-cols-[320px_1fr] lg:gap-6">
        <div className="order-2 flex min-h-[320px] flex-col overflow-hidden rounded-xl border border-border/40 bg-background/15 lg:order-1 lg:max-h-[calc(100vh-200px)]">
          <SiteFilters
            variant="flat"
            className="max-h-[220px] overflow-y-auto border-b border-border/30"
            filters={filters}
            availableCivilizations={civilizations}
            availableSiteTypes={siteTypes}
            availableCommunityTiers={communityTiers}
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
            selectedSiteId={selectedSiteId}
            onSelect={selectSite}
            className="h-[55vh] min-h-[320px] lg:flex-1 lg:h-full"
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
