import { create } from "zustand";
import { nanoid } from "nanoid";
import { MapSite, VerificationStatus } from "@/lib/types";
import { sampleSites } from "@/data/sample-sites";

export interface MapFilters {
  search: string;
  civilizations: string[];
  verification: "all" | VerificationStatus;
  researchOnly: boolean;
  siteTypes: string[];
}

interface MapState {
  sites: MapSite[];
  selectedSiteId: string | null;
  filters: MapFilters;
  setFilters: (update: Partial<MapFilters>) => void;
  clearFilters: () => void;
  selectSite: (siteId: string | null) => void;
  addSite: (site: Omit<MapSite, "id" | "lastUpdated" | "updatedBy"> & {
    provisionalId?: string;
    updatedBy: string;
  }) => MapSite;
  updateSite: (site: MapSite) => void;
}

const DEFAULT_FILTERS: MapFilters = {
  search: "",
  civilizations: [],
  verification: "all",
  researchOnly: false,
  siteTypes: [],
};

export const useSiteStore = create<MapState>((set) => ({
  sites: sampleSites,
  selectedSiteId: null,
  filters: DEFAULT_FILTERS,
  setFilters: (update) =>
    set((state) => ({
      filters: { ...state.filters, ...update },
    })),
  clearFilters: () => set({ filters: DEFAULT_FILTERS }),
  selectSite: (siteId) => set({ selectedSiteId: siteId }),
  addSite: (siteInput) => {
    const id = siteInput.provisionalId ?? nanoid(8);
    const now = new Date().toISOString();

    const newSite: MapSite = {
      ...siteInput,
      id,
      lastUpdated: now,
    };

    set((state) => ({ sites: [...state.sites, newSite] }));
    set({ selectedSiteId: id });
    return newSite;
  },
  updateSite: (site) =>
    set((state) => ({
      sites: state.sites.map((existing) =>
        existing.id === site.id ? { ...site, lastUpdated: new Date().toISOString() } : existing
      ),
    })),
}));

export const filterSites = (sites: MapSite[], filters: MapFilters): MapSite[] => {
  return sites.filter((site) => {
    const matchesSearch = filters.search
      ? [site.name, site.summary, site.civilization, site.siteType, site.era, site.tags.join(" ")]
          .join(" ")
          .toLowerCase()
          .includes(filters.search.toLowerCase())
      : true;

    const matchesCivilization =
      filters.civilizations.length === 0 || filters.civilizations.includes(site.civilization);

    const matchesVerification =
      filters.verification === "all" || site.verificationStatus === filters.verification;

    const matchesSiteType =
      filters.siteTypes.length === 0 || filters.siteTypes.includes(site.siteType);

    const matchesResearch = !filters.researchOnly || site.relatedResearchIds.length > 0;

    return matchesSearch && matchesCivilization && matchesVerification && matchesSiteType && matchesResearch;
  });
};

export const getSelectedSite = (sites: MapSite[], selectedId: string | null): MapSite | null => {
  if (!selectedId) return null;
  return sites.find((site) => site.id === selectedId) ?? null;
};
