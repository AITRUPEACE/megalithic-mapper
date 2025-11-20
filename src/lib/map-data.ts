import { mapRecords } from "@/data/map-records";
import type {
  BoundingBox,
  MapDataResult,
  MapLayer,
  MapSiteFeature,
  MapZoneFeature,
  SiteRow,
  SiteTagRow,
  TagCollection,
  VerificationStatus,
  ZoneRow,
} from "@/types/map";

export interface MapRecordSet {
  sites: SiteRow[];
  siteTags: SiteTagRow[];
  zones: ZoneRow[];
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
});

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

    const zoneMemberships = site.zone_ids
      .map((zoneId) => zoneMap.get(zoneId))
      .filter(Boolean)
      .map((zone) => ({
        id: zone!.id,
        name: zone!.name,
        color: zone!.color,
      }));

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
      mediaAssets: [],
      documentAssets: [],
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

export const fetchMapEntities = async (query: MapQueryFilters): Promise<MapDataResult> => {
  const normalized = normalizeMapData(mapRecords);
  let sites = normalized.sites;

  if (query.layers && query.layers.length > 0) {
    sites = sites.filter((site) => query.layers!.includes(site.layer));
  }

  if (query.verification && query.verification.length > 0) {
    sites = sites.filter((site) => query.verification!.includes(site.verificationStatus));
  }

  if (query.zoneIds && query.zoneIds.length > 0) {
    sites = sites.filter((site) =>
      site.zoneMemberships.some((zone) => query.zoneIds!.includes(zone.id))
    );
  }

  if (query.tags && query.tags.length > 0) {
    sites = sites.filter((site) =>
      site.tags.themes.some((tag) => query.tags!.includes(tag)) ||
      site.tags.cultures.some((tag) => query.tags!.includes(tag)) ||
      site.tags.eras.some((tag) => query.tags!.includes(tag))
    );
  }

  sites = sites.filter((site) => pointInBounds(site.coordinates, query.bounds));

  return {
    sites,
    zones: normalized.zones,
    meta: {
      totalSites: sites.length,
      bounds: query.bounds,
      tagCounts: computeTagCounts(sites),
    },
  } satisfies MapDataResult;
};
