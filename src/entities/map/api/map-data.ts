import { createClient } from "@/lib/supabase/server";
import { SUPABASE_SCHEMA } from "@/lib/supabase/config";
import { mapRecords } from "@/shared/mocks/map-records";
import type {
  BoundingBox,
  MapDataResult,
  MapLayer,
  MapSiteFeature,
  MapZoneFeature,
  SiteRow,
  SiteTagRow,
  SiteZoneRow,
  TagCollection,
  VerificationStatus,
  ZoneRow,
} from "@/entities/map/model/types";

export interface MapRecordSet {
  sites: SiteRow[];
  siteTags: SiteTagRow[];
  zones: ZoneRow[];
  siteZones?: SiteZoneRow[];
}

const ensureTagCollection = (): TagCollection => ({ cultures: [], eras: [], themes: [] });

const normalizeStringArray = (value: string[]): string[] => Array.from(new Set(value)).sort();

const buildSearchText = (site: SiteRow, tags: TagCollection): string =>
  [
    site.name,
    site.summary,
    site.site_type,
    site.category,
    ...tags.cultures,
    ...tags.eras,
    ...tags.themes,
  ]
    .join(" ")
    .toLowerCase();

const mapZoneRow = (zone: ZoneRow): MapZoneFeature => ({
  id: zone.id,
  slug: zone.slug,
  name: zone.name,
  description: zone.description,
  color: zone.color,
  bounds: zone.bounds,
  centroid: zone.centroid,
  cultureFocus: zone.culture_focus,
  eraFocus: zone.era_focus,
  verificationState: zone.verification_state,
  updatedAt: zone.updated_at,
});

const toZoneSummary = (zone: MapZoneFeature) => ({
  id: zone.id,
  slug: zone.slug,
  name: zone.name,
  color: zone.color,
  verificationState: zone.verificationState,
});

const buildZoneMemberships = (
  site: SiteRow,
  zoneMap: Map<string, MapZoneFeature>,
  siteZones: SiteZoneRow[] | undefined
) => {
  if (siteZones && siteZones.length > 0) {
    return siteZones
      .filter((link) => link.site_id === site.id)
      .map((link) => zoneMap.get(link.zone_id))
      .filter(Boolean)
      .map((zone) => toZoneSummary(zone!));
  }

  return site.zone_ids.map((zoneId) => zoneMap.get(zoneId)).filter(Boolean).map((zone) => toZoneSummary(zone!));
};

// Calculate importance score for a site (higher = more important)
// This is used for sorting sites by "most recognizable"
const calculateImportanceScoreFromRaw = (
  site: SiteRow,
  mediaCount: number,
  researchCount: number
): number => {
  let score = 0;
  
  // Verification status contribution (verified sites are more recognizable)
  if (site.verification_status === "verified") score += 40;
  else if (site.verification_status === "under_review") score += 15;
  
  // Layer contribution (official sites are more important)
  if (site.layer === "official") score += 25;
  
  // Media count contribution (sites with photos are more interesting to browse)
  // Give significant weight to having at least one photo
  if (mediaCount > 0) score += 20;
  score += Math.min(mediaCount * 2, 20); // Up to 20 more points for multiple photos
  
  // Research links contribution
  score += Math.min(researchCount * 5, 15);
  
  // Trust tier contribution
  if (site.trust_tier === "gold") score += 10;
  else if (site.trust_tier === "silver") score += 6;
  else if (site.trust_tier === "bronze") score += 3;
  
  return score;
};

export const normalizeMapData = (records: MapRecordSet = mapRecords) => {
  const zoneMap = new Map<string, MapZoneFeature>();
  records.zones.forEach((zone) => {
    zoneMap.set(zone.id, mapZoneRow(zone));
  });

  const tagsBySite = new Map<string, TagCollection>();
  records.siteTags.forEach((tag) => {
    const current = tagsBySite.get(tag.site_id) ?? ensureTagCollection();
    const targetArray = current[`${tag.tag_type}s` as keyof TagCollection] as string[];
    targetArray.push(tag.tag);
    tagsBySite.set(tag.site_id, current);
  });

  const sites: MapSiteFeature[] = records.sites.map((site) => {
    const tags = tagsBySite.get(site.id) ?? ensureTagCollection();
    tags.cultures = normalizeStringArray(tags.cultures);
    tags.eras = normalizeStringArray(tags.eras);
    tags.themes = normalizeStringArray(tags.themes);

    const zoneMemberships = buildZoneMemberships(site, zoneMap, records.siteZones);
    
    // Calculate importance score for client-side sorting
    const importanceScore = calculateImportanceScoreFromRaw(
      site,
      site.media_count,
      site.related_research_ids.length
    );

    return {
      id: site.id,
      slug: site.slug,
      name: site.name,
      summary: site.summary,
      siteType: site.site_type,
      category: site.category,
      coordinates: site.coordinates,
      verificationStatus: site.verification_status,
      layer: site.layer,
      trustTier: site.trust_tier,
      tags,
      zoneMemberships,
      mediaCount: site.media_count,
      relatedResearchIds: site.related_research_ids,
      evidenceLinks: [],
      thumbnailUrl: site.thumbnail_url,
      updatedAt: site.updated_at,
      updatedBy: site.updated_by,
      searchText: buildSearchText(site, tags),
      importanceScore, // Include importance score for client-side sorting
      effectiveScore: importanceScore, // Use same score for now (can add activity boost later)
    } satisfies MapSiteFeature;
  });

  const zones = Array.from(zoneMap.values());

  return { sites, zones } satisfies { sites: MapSiteFeature[]; zones: MapZoneFeature[] };
};

const pointInBounds = (point: { lat: number; lng: number }, bounds: BoundingBox): boolean =>
  point.lat >= bounds.minLat &&
  point.lat <= bounds.maxLat &&
  point.lng >= bounds.minLng &&
  point.lng <= bounds.maxLng;

const boxIntersects = (box: BoundingBox, bounds: BoundingBox): boolean =>
  box.maxLat >= bounds.minLat &&
  box.minLat <= bounds.maxLat &&
  box.maxLng >= bounds.minLng &&
  box.minLng <= bounds.maxLng;

const computeTagCounts = (sites: MapSiteFeature[]): Record<string, number> => {
  const counts: Record<string, number> = {};
  sites.forEach((site) => {
    [...site.tags.cultures, ...site.tags.eras, ...site.tags.themes].forEach((tag) => {
      counts[tag] = (counts[tag] ?? 0) + 1;
    });
  });
  return counts;
};

export interface MapQueryFilters {
  bounds: BoundingBox;
  layers?: MapLayer[];
  verification?: VerificationStatus[];
  zoneIds?: string[];
  tags?: string[];
  zoom?: number;
  limit?: number;
}

// Calculate importance score for a MapSiteFeature (used for API-level sorting)
const calculateImportanceScore = (site: MapSiteFeature): number => {
  // Use the pre-calculated score if available
  if (site.importanceScore !== undefined) {
    return site.importanceScore;
  }
  
  // Fallback calculation (same logic as calculateImportanceScoreFromRaw)
  let score = 0;
  
  if (site.verificationStatus === "verified") score += 40;
  else if (site.verificationStatus === "under_review") score += 15;
  
  if (site.layer === "official") score += 25;
  
  if (site.mediaCount > 0) score += 20;
  score += Math.min(site.mediaCount * 2, 20);
  
  score += Math.min(site.relatedResearchIds.length * 5, 15);
  
  if (site.trustTier === "gold") score += 10;
  else if (site.trustTier === "silver") score += 6;
  else if (site.trustTier === "bronze") score += 3;
  
  return score;
};

// Get limit based on zoom level
const getLimitForZoom = (zoom: number | undefined, defaultLimit?: number): number => {
  if (defaultLimit !== undefined) return defaultLimit;
  
  if (zoom === undefined) return 500; // Default
  
  // Zoom-based limits:
  // < 5: Show top 100 (world view)
  // 5-8: Show top 500 (region view)
  // > 8: Show all in viewport (detailed view)
  if (zoom < 5) return 100;
  if (zoom <= 8) return 500;
  return 2000; // Effectively unlimited for detailed views
};

async function fetchRecordsFromSupabase(query: MapQueryFilters): Promise<MapRecordSet | null> {
  let supabase;
  try {
    supabase = await createClient();
  } catch (error) {
    console.warn("Falling back to mocked map records due to Supabase config error", error);
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapSchema = (supabase as any).schema(SUPABASE_SCHEMA);

  try {
    const sitesQuery = mapSchema
      .from("sites")
      .select(
        "id, slug, name, summary, site_type, category, coordinates, verification_status, layer, trust_tier, zone_ids, media_count, related_research_ids, updated_at, updated_by, coordinates_lat, coordinates_lng, thumbnail_url"
      )
      .gte("coordinates_lat", query.bounds.minLat)
      .lte("coordinates_lat", query.bounds.maxLat)
      .gte("coordinates_lng", query.bounds.minLng)
      .lte("coordinates_lng", query.bounds.maxLng);

    if (query.layers?.length) {
      sitesQuery.in("layer", query.layers);
    }
    if (query.verification?.length) {
      sitesQuery.in("verification_status", query.verification);
    }

    const { data: siteRows, error: siteError } = await sitesQuery;
    if (siteError || !siteRows) {
      console.warn("Falling back to mocked map records due to site error", siteError);
      return null;
    }

    const typedSiteRows = siteRows as SiteRow[];
    const siteIds = typedSiteRows.map((site) => site.id);

    const { data: tagRows } = await mapSchema
      .from("site_tags")
      .select("site_id, tag, tag_type")
      .in("site_id", siteIds.length ? siteIds : [""]);

    const { data: zoneRows, error: zoneError } = await mapSchema
      .from("zones")
      .select(
        "id, slug, name, description, color, bounds, centroid, culture_focus, era_focus, verification_state, updated_at"
      )
      .gte("bounds_max_lat", query.bounds.minLat)
      .lte("bounds_min_lat", query.bounds.maxLat)
      .gte("bounds_max_lng", query.bounds.minLng)
      .lte("bounds_min_lng", query.bounds.maxLng);

    if (zoneError || !zoneRows) {
      console.warn("Falling back to mocked map records due to zone error", zoneError);
      return null;
    }

    const typedZoneRows = zoneRows as ZoneRow[];

    const { data: siteZones } = await mapSchema
      .from("site_zones")
      .select("site_id, zone_id, assigned_by, assigned_at")
      .in("site_id", siteIds.length ? siteIds : [""]); 

    const filteredZones = query.zoneIds?.length
      ? typedZoneRows.filter((zone) => query.zoneIds!.includes(zone.id))
      : typedZoneRows;

    return {
      sites: typedSiteRows,
      siteTags: (tagRows ?? []) as SiteTagRow[],
      zones: filteredZones,
      siteZones: siteZones as SiteZoneRow[] | undefined,
    } satisfies MapRecordSet;
  } catch (error) {
    console.warn("Falling back to mocked map records due to unexpected Supabase error", error);
    return null;
  }
}

export const fetchMapEntities = async (query: MapQueryFilters): Promise<MapDataResult> => {
  const records = (await fetchRecordsFromSupabase(query)) ?? mapRecords;
  const normalized = normalizeMapData(records);
  let sites = normalized.sites;
  let zones = normalized.zones;

  if (query.layers && query.layers.length > 0) {
    sites = sites.filter((site) => query.layers!.includes(site.layer));
  }

  if (query.verification && query.verification.length > 0) {
    sites = sites.filter((site) => query.verification!.includes(site.verificationStatus));
  }

  if (query.zoneIds && query.zoneIds.length > 0) {
    sites = sites.filter((site) => site.zoneMemberships.some((zone) => query.zoneIds!.includes(zone.id)));
    zones = zones.filter((zone) => query.zoneIds!.includes(zone.id));
  }

  if (query.tags && query.tags.length > 0) {
    sites = sites.filter((site) =>
      site.tags.themes.some((tag) => query.tags!.includes(tag)) ||
      site.tags.cultures.some((tag) => query.tags!.includes(tag)) ||
      site.tags.eras.some((tag) => query.tags!.includes(tag))
    );
  }

  sites = sites.filter((site) => pointInBounds(site.coordinates, query.bounds));
  zones = zones.filter((zone) => boxIntersects(zone.bounds, query.bounds));

  // Smart loading: Sort by importance and limit based on zoom
  const limit = getLimitForZoom(query.zoom, query.limit);
  const totalBeforeLimit = sites.length;
  
  // Sort sites by importance score (highest first)
  sites = sites
    .map(site => ({ site, importance: calculateImportanceScore(site) }))
    .sort((a, b) => b.importance - a.importance)
    .slice(0, limit)
    .map(({ site }) => site);

  // Count sites by layer for the filter UI
  const layerCounts = {
    official: normalized.sites.filter(s => s.layer === "official").length,
    community: normalized.sites.filter(s => s.layer === "community").length,
    total: normalized.sites.length,
  };

  return {
    sites,
    zones,
    meta: {
      totalSites: sites.length,
      totalBeforeLimit,
      totalZones: zones.length,
      bounds: query.bounds,
      tagCounts: computeTagCounts(sites),
      layerCounts,
      wasLimited: sites.length < totalBeforeLimit,
      zoom: query.zoom,
    },
  } satisfies MapDataResult;
};
