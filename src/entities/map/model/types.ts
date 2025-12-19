export type VerificationStatus = "verified" | "under_review" | "unverified";
export type MapLayer = "official" | "community";
export type CommunityTier = "bronze" | "silver" | "gold" | "promoted";
export type SiteCategory = "site" | "artifact" | "text";
export type ZoneVerificationState = "draft" | "published";

// Heat tier for site popularity indicators
export type HeatTier = "hot" | "rising" | "active" | "normal" | "low";

// Importance tier based on effective score (base importance + decayed activity)
export type ImportanceTier = "landmark" | "major" | "notable" | "minor";

// Helper to derive importance tier from effective score
export const getImportanceTier = (effectiveScore: number): ImportanceTier => {
  if (effectiveScore >= 80) return "landmark";
  if (effectiveScore >= 60) return "major";
  if (effectiveScore >= 40) return "notable";
  return "minor";
};

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
  thumbnail_url?: string;
}

export type SiteTagType = "culture" | "era" | "theme";

export interface SiteTagRow {
  site_id: string;
  tag: string;
  tag_type: SiteTagType;
}

export interface SiteZoneRow {
  site_id: string;
  zone_id: string;
  assigned_by?: string;
  assigned_at?: string;
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
  verification_state: ZoneVerificationState;
  updated_at?: string;
  updated_by?: string;
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
  verificationState: ZoneVerificationState;
  updatedAt?: string;
  updatedBy?: string;
}

export interface MapZoneSummary {
  id: string;
  slug: string;
  name: string;
  color: string;
  verificationState: ZoneVerificationState;
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
  mediaCount: number;
  relatedResearchIds: string[];
  evidenceLinks?: string[];
  thumbnailUrl?: string; // Cover image URL for map preview
  updatedAt: string;
  updatedBy: string;
  searchText: string;
  // Heat/popularity indicators (legacy)
  heatTier?: HeatTier;
  heatScore?: number; // 0-100
  trendReason?: string; // Why it's trending, e.g., "12 new photos"
  // Importance & Activity scoring
  importanceScore?: number; // 0-100, base static score
  activityScore?: number; // 0+, raw activity points from contributions
  activityUpdatedAt?: string; // ISO timestamp of last activity
  effectiveScore?: number; // Computed: importance + decayed activity
  importanceTier?: ImportanceTier; // Derived tier for UI display
  isTrending?: boolean; // High activity in recent days
}

export interface MapDataResult {
  sites: MapSiteFeature[];
  zones: MapZoneFeature[];
  meta: {
    totalSites: number;
    totalBeforeLimit?: number;
    totalZones: number;
    bounds: BoundingBox;
    tagCounts: Record<string, number>;
    layerCounts?: {
      official: number;
      community: number;
      total: number;
    };
    wasLimited?: boolean;
    zoom?: number;
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
  // Importance filtering
  minImportance: number; // 0-100, minimum effective score to show
  importanceTiers: ImportanceTier[]; // Filter by specific tiers
  showTrending: boolean; // Quick toggle to prioritize recent activity
}

// Smart map query parameters for zoom-aware loading
export interface SmartMapQuery {
  bounds: BoundingBox;
  zoom: number;
  siteTypes?: string[];
  minScore?: number;
  limit?: number;
}

// Response from smart map API
export interface SmartMapResponse {
  sites: MapSiteFeature[];
  meta: {
    total: number;
    showing: number;
    hasMore: boolean;
    hiddenCount: number;
    zoom: number;
    bounds: BoundingBox;
    filters?: {
      siteTypes: string[] | null;
      minScore: number;
      limit: number;
    };
  };
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
  verificationState: ZoneVerificationState;
  updatedBy?: string;
}
