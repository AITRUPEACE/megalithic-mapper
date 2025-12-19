import { create } from "zustand";
import { nanoid } from "nanoid";

import type {
  BoundingBox,
  DraftSiteInput,
  DraftZoneInput,
  MapFilters,
  MapSiteFeature,
  MapZoneFeature,
  TagCollection,
  ImportanceTier,
} from "@/entities/map/model/types";
import { WORLD_BOUNDS, getImportanceTier } from "@/entities/map/model/types";

const DEFAULT_FILTERS: MapFilters = {
  search: "",
  cultures: [],
  eras: [],
  verification: "all",
  researchOnly: false,
  siteTypes: [],
  layer: "composite",
  communityTiers: [],
  categories: [],
  zones: [],
  tags: [],
  // Importance filtering defaults
  minImportance: 0, // Show all by default
  importanceTiers: [], // Empty = all tiers
  showTrending: false,
};

const normalizeTags = (tags: TagCollection): TagCollection => ({
  cultures: Array.from(new Set(tags.cultures.map((value) => value.trim()).filter(Boolean))).sort(),
  eras: Array.from(new Set(tags.eras.map((value) => value.trim()).filter(Boolean))).sort(),
  themes: Array.from(new Set(tags.themes.map((value) => value.trim()).filter(Boolean))).sort(),
});

const buildSearchText = (site: DraftSiteInput & { tags: TagCollection }) =>
  [
    site.name,
    site.summary,
    site.siteType,
    site.category,
    ...site.tags.cultures,
    ...site.tags.eras,
    ...site.tags.themes,
  ]
    .join(" ")
    .toLowerCase();

const inflateSite = (input: DraftSiteInput, zones: MapZoneFeature[]): MapSiteFeature => {
  const tags = normalizeTags(input.tags);
  const zoneMemberships = input.zoneIds
    .map((zoneId) => zones.find((zone) => zone.id === zoneId))
    .filter(Boolean)
    .map((zone) => ({
      id: zone!.id,
      slug: zone!.slug,
      name: zone!.name,
      color: zone!.color,
      verificationState: zone!.verificationState,
    }));

  return {
    id: input.id ?? `local-${nanoid(8)}`,
    slug: input.slug,
    name: input.name,
    summary: input.summary,
    siteType: input.siteType,
    category: input.category,
    coordinates: input.coordinates,
    verificationStatus: input.verificationStatus,
    layer: input.layer,
    trustTier: input.trustTier,
    tags,
    zoneMemberships,
    mediaCount: input.mediaCount ?? 0,
    relatedResearchIds: input.relatedResearchIds ?? [],
    evidenceLinks: input.evidenceLinks ?? [],
    updatedAt: new Date().toISOString(),
    updatedBy: input.updatedBy,
    searchText: buildSearchText({ ...input, tags }),
  } satisfies MapSiteFeature;
};

const updateSiteZoneMemberships = (sites: MapSiteFeature[], zone: MapZoneFeature): MapSiteFeature[] =>
  sites.map((site) => {
    if (!site.zoneMemberships.some((membership) => membership.id === zone.id)) {
      return site;
    }
    return {
      ...site,
      zoneMemberships: site.zoneMemberships.map((membership) =>
        membership.id === zone.id
          ? {
              ...membership,
              name: zone.name,
              color: zone.color,
              slug: zone.slug,
              verificationState: zone.verificationState,
            }
          : membership
      ),
    } satisfies MapSiteFeature;
  });

export const applySiteFilters = (sites: MapSiteFeature[], filters: MapFilters): MapSiteFeature[] =>
  sites.filter((site) => {
    const matchesSearch = filters.search
      ? site.searchText.includes(filters.search.toLowerCase())
      : true;

    const matchesCultures =
      filters.cultures.length === 0 || site.tags.cultures.some((value) => filters.cultures.includes(value));

    const matchesEras =
      filters.eras.length === 0 || site.tags.eras.some((value) => filters.eras.includes(value));

    const matchesVerification =
      filters.verification === "all" || site.verificationStatus === filters.verification;

    const matchesSiteTypes =
      filters.siteTypes.length === 0 || filters.siteTypes.includes(site.siteType);

    const matchesCategories =
      filters.categories.length === 0 || filters.categories.includes(site.category);

    const matchesLayer =
      filters.layer === "composite" || site.layer === filters.layer;

    const matchesCommunityTier =
      site.layer !== "community" ||
      filters.communityTiers.length === 0 ||
      (site.trustTier ? filters.communityTiers.includes(site.trustTier) : false);

    const matchesZones =
      filters.zones.length === 0 || site.zoneMemberships.some((zone) => filters.zones.includes(zone.id));

    const matchesTags =
      filters.tags.length === 0 || site.tags.themes.some((tag) => filters.tags.includes(tag));

    const matchesResearch = !filters.researchOnly || site.relatedResearchIds.length > 0;

    // Importance filtering
    const effectiveScore = site.effectiveScore ?? site.importanceScore ?? 50;
    const matchesMinImportance = effectiveScore >= filters.minImportance;

    const siteTier = site.importanceTier ?? getImportanceTier(effectiveScore);
    const matchesImportanceTiers =
      filters.importanceTiers.length === 0 || filters.importanceTiers.includes(siteTier);

    // Trending filter - if showTrending is enabled, only show trending sites
    const matchesTrending = !filters.showTrending || site.isTrending === true;

    return (
      matchesSearch &&
      matchesCultures &&
      matchesEras &&
      matchesVerification &&
      matchesSiteTypes &&
      matchesCategories &&
      matchesLayer &&
      matchesCommunityTier &&
      matchesZones &&
      matchesTags &&
      matchesResearch &&
      matchesMinImportance &&
      matchesImportanceTiers &&
      matchesTrending
    );
  });

export interface MapStoreState {
  sites: MapSiteFeature[];
  zones: MapZoneFeature[];
  bounds: BoundingBox;
  zoom: number;
  filters: MapFilters;
  selectedSiteId: string | null;
  // Metadata from smart loading
  meta: {
    total: number;
    showing: number;
    hasMore: boolean;
    hiddenCount: number;
  };
  initialize: (payload: { sites: MapSiteFeature[]; zones: MapZoneFeature[]; bounds: BoundingBox }) => void;
  replaceData: (payload: { sites: MapSiteFeature[]; zones: MapZoneFeature[]; meta?: MapStoreState["meta"] }) => void;
  setBounds: (bounds: BoundingBox) => void;
  setZoom: (zoom: number) => void;
  setFilters: (update: Partial<MapFilters>) => void;
  clearFilters: () => void;
  selectSite: (id: string | null) => void;
  optimisticUpsertSite: (site: DraftSiteInput) => MapSiteFeature;
  optimisticUpsertZone: (zone: DraftZoneInput) => MapZoneFeature;
}

const DEFAULT_META = {
  total: 0,
  showing: 0,
  hasMore: false,
  hiddenCount: 0,
};

export const useMapStore = create<MapStoreState>((set, get) => ({
  sites: [],
  zones: [],
  bounds: WORLD_BOUNDS,
  zoom: 3,
  filters: DEFAULT_FILTERS,
  selectedSiteId: null,
  meta: DEFAULT_META,
  initialize: ({ sites, zones, bounds }) => set({ 
    sites, 
    zones, 
    bounds, 
    filters: { ...DEFAULT_FILTERS },
    meta: { ...DEFAULT_META, total: sites.length, showing: sites.length },
  }),
  replaceData: ({ sites, zones, meta }) =>
    set((state) => {
      const siteMap = new Map(state.sites.map((site) => [site.id, site] as const));
      sites.forEach((site) => siteMap.set(site.id, site));

      const zoneMap = new Map(state.zones.map((zone) => [zone.id, zone] as const));
      zones.forEach((zone) => zoneMap.set(zone.id, zone));

      return {
        sites: Array.from(siteMap.values()),
        zones: Array.from(zoneMap.values()),
        meta: meta ?? state.meta,
      };
    }),
  setBounds: (bounds) => set({ bounds }),
  setZoom: (zoom) => set({ zoom }),
  setFilters: (update) => set((state) => ({ filters: { ...state.filters, ...update } })),
  clearFilters: () => set({ filters: { ...DEFAULT_FILTERS } }),
  selectSite: (id) => set({ selectedSiteId: id }),
  optimisticUpsertSite: (input) => {
    const zones = get().zones;
    const nextSite = inflateSite(input, zones);
    set((state) => {
      const exists = state.sites.some((site) => site.id === nextSite.id);
      const nextSites = exists
        ? state.sites.map((site) => (site.id === nextSite.id ? nextSite : site))
        : [...state.sites, nextSite];
      return { sites: nextSites, selectedSiteId: nextSite.id };
    });
    return nextSite;
  },
  optimisticUpsertZone: (input) => {
    const zone: MapZoneFeature = {
      id: input.id ?? `zone-${nanoid(8)}`,
      slug: input.slug,
      name: input.name,
      description: input.description,
      color: input.color,
      bounds: input.bounds,
      centroid: input.centroid,
      cultureFocus: Array.from(new Set(input.cultureFocus)),
      eraFocus: Array.from(new Set(input.eraFocus)),
      verificationState: input.verificationState,
      updatedAt: new Date().toISOString(),
      updatedBy: input.updatedBy,
    };

    set((state) => {
      const exists = state.zones.some((existing) => existing.id === zone.id);
      const zones = exists
        ? state.zones.map((existing) => (existing.id === zone.id ? zone : existing))
        : [...state.zones, zone];
      const sites = updateSiteZoneMemberships(state.sites, zone);
      return { zones, sites };
    });

    return zone;
  },
}));
