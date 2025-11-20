import type { MediaAsset } from "./media";

export type VerificationStatus = "verified" | "under_review" | "unverified";
export type MapLayer = "official" | "community";
export type CommunityTier = "bronze" | "silver" | "gold" | "promoted";
export type SiteCategory = "site" | "artifact" | "text";

export interface CoordinatePair {
  lat: number;
  lng: number;
}

export interface BoundingBox {
  minLat: number;
  minLng: number;
  maxLat: number;
  maxLng: number;
}

export const WORLD_BOUNDS: BoundingBox = {
  minLat: -90,
  minLng: -180,
  maxLat: 90,
  maxLng: 180,
};

export interface SiteRow {
  id: string;
  slug: string;
  name: string;
  summary: string;
  site_type: string;
  category: SiteCategory;
  coordinates: CoordinatePair;
  verification_status: VerificationStatus;
  layer: MapLayer;
  trust_tier?: CommunityTier;
  zone_ids: string[];
  media_count: number;
  related_research_ids: string[];
  updated_at: string;
  updated_by: string;
}

export type SiteTagType = "culture" | "era" | "theme";

export interface SiteTagRow {
  site_id: string;
  tag: string;
  tag_type: SiteTagType;
}

export interface ZoneRow {
  id: string;
  slug: string;
  name: string;
  description: string;
  color: string;
  bounds: BoundingBox;
  centroid: CoordinatePair;
  culture_focus: string[];
  era_focus: string[];
  verification_state: "draft" | "published";
}

export interface TagCollection {
  cultures: string[];
  eras: string[];
  themes: string[];
}

export interface MapZoneFeature {
  id: string;
  slug: string;
  name: string;
  description: string;
  color: string;
  bounds: BoundingBox;
  centroid: CoordinatePair;
  cultureFocus: string[];
  eraFocus: string[];
}

export interface MapZoneSummary {
  id: string;
  name: string;
  color: string;
}

export interface MapSiteFeature {
  id: string;
  slug: string;
  name: string;
  summary: string;
  siteType: string;
  category: SiteCategory;
  coordinates: CoordinatePair;
  verificationStatus: VerificationStatus;
  layer: MapLayer;
  trustTier?: CommunityTier;
  tags: TagCollection;
  zoneMemberships: MapZoneSummary[];
  mediaAssets?: MediaAsset[];
  documentAssets?: MediaAsset[];
  mediaCount: number;
  relatedResearchIds: string[];
  evidenceLinks?: string[];
  updatedAt: string;
  updatedBy: string;
  searchText: string;
}

export interface MapDataResult {
  sites: MapSiteFeature[];
  zones: MapZoneFeature[];
  meta: {
    totalSites: number;
    bounds: BoundingBox;
    tagCounts: Record<string, number>;
  };
}

export interface MapFilters {
  search: string;
  cultures: string[];
  eras: string[];
  verification: "all" | VerificationStatus;
  researchOnly: boolean;
  siteTypes: string[];
  layer: "composite" | MapLayer;
  communityTiers: CommunityTier[];
  categories: SiteCategory[];
  zones: string[];
  tags: string[];
}

export interface DraftSiteInput {
  id?: string;
  name: string;
  slug: string;
  summary: string;
  siteType: string;
  category: SiteCategory;
  coordinates: CoordinatePair;
  verificationStatus: VerificationStatus;
  layer: MapLayer;
  trustTier?: CommunityTier;
  tags: TagCollection;
  zoneIds: string[];
  mediaAssets?: MediaAsset[];
  documentAssets?: MediaAsset[];
  mediaCount?: number;
  relatedResearchIds?: string[];
  evidenceLinks?: string[];
  updatedBy: string;
}

export interface DraftZoneInput {
  id?: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  bounds: BoundingBox;
  centroid: CoordinatePair;
  cultureFocus: string[];
  eraFocus: string[];
}
