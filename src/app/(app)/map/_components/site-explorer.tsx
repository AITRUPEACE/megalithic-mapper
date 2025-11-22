"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { SiteFilters } from "./site-filters";
import { SiteList } from "./site-list";
import { SiteDetailPanel } from "./site-detail-panel";
import { filterSites, getSelectedSite, useSiteStore } from "@/state/site-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CommunityTier, MapSite } from "@/lib/types";
import { useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProgressiveDetailDrawer } from "@/components/map/progressive-detail-drawer";
import { DrawerSiteContent } from "@/components/map/drawer-site-content";

const SiteMap = dynamic(() => import("./site-map").then((module) => module.SiteMap), {
	ssr: false,
});

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

	const continents = useMemo(() => Array.from(new Set(sites.map((site) => site.geography.continent))).sort(), [sites]);
	const zones = useMemo(() => Array.from(new Set(sites.map((site) => site.geography.zone).filter((zone): zone is string => !!zone))).sort(), [sites]);

	const focusParam = searchParams.get("focus");
	const projectParam = searchParams.get("project");
	const siteParam = searchParams.get("site");

	useEffect(() => {
		if (!sites.length) return;

		if (focusParam) {
			selectSite(focusParam);
			setSidePanelTab("details");
			return;
		}

		if (siteParam) {
			selectSite(siteParam);
			setSidePanelTab("details");
			return;
		}

		if (projectParam) {
			const relatedSite = sites.find((site) => site.relatedResearchIds.includes(projectParam));
			if (relatedSite) {
				selectSite(relatedSite.id);
				setSidePanelTab("details");
			}
		}
	}, [focusParam, projectParam, siteParam, selectSite, sites]);

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
};

