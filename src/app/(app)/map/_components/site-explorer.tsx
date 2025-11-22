"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { SiteFilters } from "./site-filters";
import { SiteList } from "./site-list";
import { SiteDetailPanel } from "./site-detail-panel";
<<<<<<< HEAD
import { filterSites, getSelectedSite, useSiteStore } from "@/state/site-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CommunityTier, MapSite } from "@/lib/types";
import { useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProgressiveDetailDrawer } from "@/components/map/progressive-detail-drawer";
import { DrawerSiteContent } from "@/components/map/drawer-site-content";
=======
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { useSearchParams } from "next/navigation";
import { cn } from "@/shared/lib/utils";
import type { BoundingBox, CommunityTier, MapSiteFeature, MapZoneFeature, SiteCategory } from "@/entities/map/model/types";
import { useMapStore, applySiteFilters } from "@/features/map-explorer/model/map-store";
import { SiteEditor } from "./site-editor";
import { ZoneEditor } from "./zone-editor";
import { loadMapData } from "../actions";
import type L from "leaflet";
>>>>>>> 520337dfb48b4ef3f55d0edf1ade0738f592525b

const SiteMap = dynamic(() => import("./site-map").then((module) => module.SiteMap), {
	ssr: false,
});

<<<<<<< HEAD
export const SiteExplorer = () => {
	const { sites, filters, selectedSiteId, setFilters, clearFilters, selectSite } = useSiteStore();
	const searchParams = useSearchParams();
	const [sidePanelTab, setSidePanelTab] = useState<"results" | "details">("results");
	const [showZones, setShowZones] = useState(true);

	const filteredSites = useMemo(() => filterSites(sites, filters), [sites, filters]);
	const selectedSite = useMemo(() => getSelectedSite(sites, selectedSiteId), [sites, selectedSiteId]);

	const civilizations = useMemo(() => Array.from(new Set<MapSite["civilization"]>(sites.map((site) => site.civilization))).sort(), [sites]);
	const siteTypes = useMemo(() => Array.from(new Set<MapSite["siteType"]>(sites.map((site) => site.siteType))).sort(), [sites]);
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
=======
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
>>>>>>> 520337dfb48b4ef3f55d0edf1ade0738f592525b

	const continents = useMemo(() => Array.from(new Set(sites.map((site) => site.geography.continent))).sort(), [sites]);
	const zones = useMemo(() => Array.from(new Set(sites.map((site) => site.geography.zone).filter((zone): zone is string => !!zone))).sort(), [sites]);

<<<<<<< HEAD
	const focusParam = searchParams.get("focus");
	const projectParam = searchParams.get("project");
	const siteParam = searchParams.get("site");
=======
  useEffect(() => {
    if (!sites.length || !isHydrated) return;
>>>>>>> 520337dfb48b4ef3f55d0edf1ade0738f592525b

	useEffect(() => {
		if (!sites.length) return;

		if (focusParam) {
			selectSite(focusParam);
			setSidePanelTab("details");
			return;
		}

<<<<<<< HEAD
		if (siteParam) {
			selectSite(siteParam);
			setSidePanelTab("details");
			return;
		}
=======
    if (projectParam) {
      const relatedSite = sites.find((site) => site.relatedResearchIds.includes(projectParam));
      if (relatedSite) {
        selectSite(relatedSite.id);
      }
    }
  }, [focusParam, projectParam, siteParam, selectSite, sites, isHydrated]);
>>>>>>> 520337dfb48b4ef3f55d0edf1ade0738f592525b

		if (projectParam) {
			const relatedSite = sites.find((site) => site.relatedResearchIds.includes(projectParam));
			if (relatedSite) {
				selectSite(relatedSite.id);
				setSidePanelTab("details");
			}
		}
	}, [focusParam, projectParam, siteParam, selectSite, sites]);

<<<<<<< HEAD
	useEffect(() => {
		if (selectedSite) {
			setSidePanelTab("details");
		}
	}, [selectedSite]);

	return (
		<div className="flex h-full flex-col gap-4">
			<div className="space-y-2">
				<div className="flex items-center gap-2">
					<h2 className="text-2xl font-semibold">Global research map</h2>
					<Badge variant="secondary" className="hidden lg:inline-flex">
						Leaflet integration
					</Badge>
				</div>
				<p className="max-w-2xl text-sm text-muted-foreground">
					Explore trusted field submissions, research-linked hypotheses, and community discoveries in one Leaflet view.
				</p>
				<Badge variant="secondary" className="inline-flex lg:hidden">
					Leaflet integration
				</Badge>
			</div>

			<div className="flex flex-1 flex-col gap-5 overflow-hidden lg:grid lg:min-h-0 lg:grid-cols-[minmax(0,1.9fr)_minmax(380px,1fr)] lg:grid-rows-1 lg:gap-6">
				<div className="flex flex-col gap-4 overflow-hidden lg:min-h-0">
					<SiteFilters
						variant="flat"
						className="w-full flex-shrink-0 rounded-2xl border border-border/40 bg-background/20 p-4 shadow-lg"
						filters={filters}
						availableCivilizations={civilizations}
						availableSiteTypes={siteTypes}
						availableCommunityTiers={communityTiers}
						availableContinents={continents}
						availableZones={zones}
						onUpdate={setFilters}
						onClear={clearFilters}
					/>
					<div className="relative flex flex-col overflow-hidden rounded-3xl border border-border/40 bg-background/10 shadow-lg backdrop-blur">
						<div className="absolute right-4 top-4 z-[400] flex gap-2">
							<Button
								size="sm"
								variant={showZones ? "secondary" : "ghost"}
								className="bg-background/90 backdrop-blur shadow-md hover:bg-background/70"
								onClick={() => setShowZones(!showZones)}
							>
								{showZones ? "Hide zones" : "Show zones"}
							</Button>
						</div>
						<SiteMap
							sites={filteredSites}
							selectedSiteId={selectedSiteId}
							onSelect={(id) => {
								selectSite(id);
								setSidePanelTab("details");
							}}
							showZones={showZones}
							className="h-[85vh] min-h-[360px] max-h-[700px] lg:h-[60vh] lg:max-h-[700px]"
						/>
						{/* Progressive Detail Drawer for Mobile */}
						<div className="lg:hidden">
							<ProgressiveDetailDrawer
								site={selectedSite}
								open={!!selectedSite}
								onClose={() => selectSite(null)}
							>
								{selectedSite && (
									<DrawerSiteContent
										site={selectedSite}
										allSites={filteredSites}
										onSelectSite={(id) => selectSite(id)}
									/>
								)}
							</ProgressiveDetailDrawer>
						</div>
					</div>
				</div>
				<aside className="flex min-h-[360px] flex-col gap-4 overflow-hidden lg:min-h-0">
					<Tabs
						value={sidePanelTab}
						onValueChange={(value) => setSidePanelTab(value as "results" | "details")}
						className="flex flex-1 min-h-0 flex-col overflow-hidden rounded-2xl border border-border/40 bg-background/10 shadow-lg"
					>
						<TabsList className="grid flex-shrink-0 grid-cols-2 gap-1 bg-background/30 p-1">
							<TabsTrigger value="results" className="rounded-xl text-xs font-semibold uppercase tracking-wide">
								Results
							</TabsTrigger>
							<TabsTrigger value="details" className="rounded-xl text-xs font-semibold uppercase tracking-wide">
								Details
							</TabsTrigger>
						</TabsList>
						<TabsContent value="results" className="flex flex-1 flex-col overflow-hidden">
							<SiteList
								variant="flat"
								className="flex-1 min-h-0 border-0 bg-transparent"
								scrollClassName="h-full"
								sites={filteredSites}
								selectedSiteId={selectedSiteId}
								onSelect={(id) => {
									selectSite(id);
									setSidePanelTab("details");
								}}
							/>
						</TabsContent>
						<TabsContent value="details" className="flex flex-1 flex-col overflow-hidden">
							<SiteDetailPanel site={selectedSite} variant="flat" className="flex-1 border-0 bg-transparent" />
						</TabsContent>
					</Tabs>
				</aside>
			</div>
		</div>
	);
=======
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
>>>>>>> 520337dfb48b4ef3f55d0edf1ade0738f592525b
};

