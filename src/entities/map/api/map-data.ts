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
  updatedBy: zone.updated_by,
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
      updatedAt: site.updated_at,
      updatedBy: site.updated_by,
      searchText: buildSearchText(site, tags),
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
}

async function fetchRecordsFromSupabase(query: MapQueryFilters): Promise<MapRecordSet | null> {
  let supabase;
  try {
    supabase = await createClient();
  } catch (error) {
    console.warn("Falling back to mocked map records due to Supabase config error", error);
    return null;
  }

  const mapSchema = supabase.schema(SUPABASE_SCHEMA);

  try {
    const sitesQuery = mapSchema
      .from("sites")
      .select(
        "id, slug, name, summary, site_type, category, coordinates, verification_status, layer, trust_tier, zone_ids, media_count, related_research_ids, updated_at, updated_by, coordinates_lat, coordinates_lng"
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

    const siteIds = siteRows.map((site) => site.id as string);

    const { data: tagRows } = await mapSchema
      .from("site_tags")
      .select("site_id, tag, tag_type")
      .in("site_id", siteIds.length ? siteIds : [""]);

    const { data: zoneRows, error: zoneError } = await mapSchema
      .from("zones")
      .select(
        "id, slug, name, description, color, bounds, centroid, culture_focus, era_focus, verification_state, updated_at, updated_by"
      )
      .gte("bounds_max_lat", query.bounds.minLat)
      .lte("bounds_min_lat", query.bounds.maxLat)
      .gte("bounds_max_lng", query.bounds.minLng)
      .lte("bounds_min_lng", query.bounds.maxLng);

    if (zoneError || !zoneRows) {
      console.warn("Falling back to mocked map records due to zone error", zoneError);
      return null;
    }

    const { data: siteZones } = await mapSchema
      .from("site_zones")
      .select("site_id, zone_id, assigned_by, assigned_at")
      .in("site_id", siteIds.length ? siteIds : [""]); 

    const filteredZones = query.zoneIds?.length
      ? zoneRows.filter((zone) => query.zoneIds!.includes(zone.id as string))
      : zoneRows;

    return {
      sites: siteRows as SiteRow[],
      siteTags: (tagRows ?? []) as SiteTagRow[],
      zones: filteredZones as ZoneRow[],
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

  return {
    sites,
    zones,
    meta: {
      totalSites: sites.length,
      totalZones: zones.length,
      bounds: query.bounds,
      tagCounts: computeTagCounts(sites),
    },
  } satisfies MapDataResult;
};
