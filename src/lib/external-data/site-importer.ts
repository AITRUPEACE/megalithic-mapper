/**
 * Site Importer Service
 * 
 * Merges and deduplicates sites from multiple external sources,
 * then imports them into the database.
 */

import type { WikidataSite } from "./wikidata";
import type { OSMSite } from "./openstreetmap";
import {
  fetchAllWikidataSites,
  fetchStoneCirclesFromWikidata,
  fetchPyramidsFromWikidata,
} from "./wikidata";
import {
  fetchMegalithicSitesFromOSM,
  fetchSitesByType,
} from "./openstreetmap";

export interface UnifiedSite {
  id: string;
  slug: string;
  name: string;
  summary: string;
  siteType: string;
  category: "site" | "area";
  coordinates: { lat: number; lng: number };
  layer: "official" | "community";
  verificationStatus: "verified" | "under_review" | "unverified";
  trustTier: "promoted" | "gold" | "silver" | "bronze" | null;
  
  // External references
  wikidataId?: string;
  osmId?: string;
  wikipediaUrl?: string;
  imageUrl?: string;
  
  // Metadata
  country?: string;
  countryCode?: string;
  inception?: string;
  heritageStatus?: string;
  
  // Source tracking
  sources: ("wikidata" | "osm" | "manual")[];
  importedAt: string;
}

/**
 * Generate a URL-safe slug from a name
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 100);
}

/**
 * Determine site type category
 */
function categorizeSiteType(type: string): string {
  const typeMap: Record<string, string> = {
    // Megalithic
    megalith: "megalithic monument",
    standing_stone: "standing stone",
    menhir: "standing stone",
    stone_circle: "stone circle",
    dolmen: "dolmen",
    passage_grave: "passage grave",
    cairn: "cairn",
    tumulus: "tumulus",
    
    // Pyramids
    pyramid: "pyramid",
    step_pyramid: "pyramid",
    
    // Other
    archaeological_site: "archaeological site",
    ruins: "ruins",
    tomb: "tomb",
    temple: "temple",
  };

  const normalized = type.toLowerCase().replace(/[_\s]+/g, "_");
  return typeMap[normalized] || type;
}

/**
 * Determine verification status based on source data
 */
function determineVerificationStatus(
  site: WikidataSite | OSMSite
): "verified" | "under_review" | "unverified" {
  // UNESCO sites are verified
  if ("heritageStatus" in site && site.heritageStatus?.includes("UNESCO")) {
    return "verified";
  }
  
  // Sites with Wikipedia articles are more reliable
  if ("wikipediaUrl" in site && site.wikipediaUrl) {
    return "under_review";
  }
  
  // OSM sites with heritage tags
  if ("heritage" in site && site.heritage) {
    return "under_review";
  }
  
  return "unverified";
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Check if two sites are likely the same (within 100m and similar name)
 */
function areSitesSimilar(site1: UnifiedSite, site2: UnifiedSite): boolean {
  const distance = haversineDistance(
    site1.coordinates.lat,
    site1.coordinates.lng,
    site2.coordinates.lat,
    site2.coordinates.lng
  );

  // Must be within 100 meters
  if (distance > 100) return false;

  // Check name similarity (simple contains check)
  const name1 = site1.name.toLowerCase();
  const name2 = site2.name.toLowerCase();
  
  if (name1 === name2) return true;
  if (name1.includes(name2) || name2.includes(name1)) return true;
  
  // Check if they share significant words
  const words1 = new Set(name1.split(/\s+/).filter((w) => w.length > 3));
  const words2 = new Set(name2.split(/\s+/).filter((w) => w.length > 3));
  const commonWords = [...words1].filter((w) => words2.has(w));
  
  return commonWords.length > 0;
}

/**
 * Transform Wikidata site to unified format
 */
function transformWikidataSite(site: WikidataSite): UnifiedSite {
  return {
    id: site.id,
    slug: generateSlug(site.name),
    name: site.name,
    summary: site.description || `${site.siteType || "Archaeological site"} in ${site.country || "unknown location"}.`,
    siteType: categorizeSiteType(site.siteType || "archaeological_site"),
    category: "site",
    coordinates: site.coordinates,
    layer: site.heritageStatus ? "official" : "community",
    verificationStatus: determineVerificationStatus(site),
    trustTier: site.heritageStatus ? "promoted" : "silver",
    wikidataId: site.wikidataId,
    wikipediaUrl: site.wikipediaUrl,
    imageUrl: site.imageUrl,
    country: site.country,
    countryCode: site.countryCode,
    inception: site.inception,
    heritageStatus: site.heritageStatus,
    sources: ["wikidata"],
    importedAt: new Date().toISOString(),
  };
}

/**
 * Transform OSM site to unified format
 */
function transformOSMSite(site: OSMSite): UnifiedSite {
  return {
    id: site.id,
    slug: generateSlug(site.name),
    name: site.name,
    summary: site.description || `${categorizeSiteType(site.siteType || "archaeological_site")} recorded in OpenStreetMap.`,
    siteType: categorizeSiteType(site.siteType || site.historicType || "archaeological_site"),
    category: "site",
    coordinates: site.coordinates,
    layer: "community",
    verificationStatus: determineVerificationStatus(site),
    trustTier: site.heritage ? "silver" : "bronze",
    osmId: `${site.osmType}/${site.osmId}`,
    wikidataId: site.wikidata,
    wikipediaUrl: site.wikipedia ? `https://en.wikipedia.org/wiki/${site.wikipedia.replace(/^en:/, "")}` : undefined,
    heritageStatus: site.heritage,
    inception: site.startDate,
    sources: ["osm"],
    importedAt: new Date().toISOString(),
  };
}

/**
 * Merge two similar sites, preferring Wikidata data
 */
function mergeSites(primary: UnifiedSite, secondary: UnifiedSite): UnifiedSite {
  return {
    ...primary,
    // Prefer non-empty values
    summary: primary.summary.length > secondary.summary.length ? primary.summary : secondary.summary,
    wikipediaUrl: primary.wikipediaUrl || secondary.wikipediaUrl,
    imageUrl: primary.imageUrl || secondary.imageUrl,
    wikidataId: primary.wikidataId || secondary.wikidataId,
    osmId: primary.osmId || secondary.osmId,
    country: primary.country || secondary.country,
    countryCode: primary.countryCode || secondary.countryCode,
    heritageStatus: primary.heritageStatus || secondary.heritageStatus,
    // Merge sources
    sources: [...new Set([...primary.sources, ...secondary.sources])] as ("wikidata" | "osm" | "manual")[],
    // Use better verification status
    verificationStatus: 
      primary.verificationStatus === "verified" || secondary.verificationStatus === "verified"
        ? "verified"
        : primary.verificationStatus === "under_review" || secondary.verificationStatus === "under_review"
        ? "under_review"
        : "unverified",
  };
}

/**
 * Deduplicate sites by merging similar ones
 */
function deduplicateSites(sites: UnifiedSite[]): UnifiedSite[] {
  const result: UnifiedSite[] = [];
  const processed = new Set<string>();

  // Sort by data quality (Wikidata first, then by verification status)
  const sorted = [...sites].sort((a, b) => {
    if (a.sources.includes("wikidata") && !b.sources.includes("wikidata")) return -1;
    if (!a.sources.includes("wikidata") && b.sources.includes("wikidata")) return 1;
    if (a.verificationStatus === "verified" && b.verificationStatus !== "verified") return -1;
    if (a.verificationStatus !== "verified" && b.verificationStatus === "verified") return 1;
    return 0;
  });

  for (const site of sorted) {
    if (processed.has(site.id)) continue;

    // Find similar sites
    const similar = sorted.filter(
      (s) => !processed.has(s.id) && s.id !== site.id && areSitesSimilar(site, s)
    );

    // Merge all similar sites
    let merged = site;
    for (const s of similar) {
      merged = mergeSites(merged, s);
      processed.add(s.id);
    }

    // Ensure unique slug
    let slug = merged.slug;
    let counter = 1;
    while (result.some((r) => r.slug === slug)) {
      slug = `${merged.slug}-${counter++}`;
    }
    merged.slug = slug;

    result.push(merged);
    processed.add(site.id);
  }

  return result;
}

/**
 * Fetch and merge sites from all sources
 */
export async function fetchAllExternalSites(options?: {
  includeWikidata?: boolean;
  includeOSM?: boolean;
  siteTypes?: ("stone_circles" | "standing_stones" | "dolmens" | "pyramids" | "tumuli")[];
}): Promise<UnifiedSite[]> {
  const {
    includeWikidata = true,
    includeOSM = true,
    siteTypes,
  } = options || {};

  const allSites: UnifiedSite[] = [];

  // Fetch from Wikidata
  if (includeWikidata) {
    try {
      console.log("Fetching sites from Wikidata...");
      const wikidataSites = await fetchAllWikidataSites();
      console.log(`Found ${wikidataSites.length} sites from Wikidata`);
      allSites.push(...wikidataSites.map(transformWikidataSite));
    } catch (error) {
      console.error("Failed to fetch from Wikidata:", error);
    }
  }

  // Fetch from OpenStreetMap
  if (includeOSM) {
    try {
      if (siteTypes && siteTypes.length > 0) {
        // Fetch specific types
        for (const type of siteTypes) {
          console.log(`Fetching ${type} from OSM...`);
          const osmSites = await fetchSitesByType(type);
          console.log(`Found ${osmSites.length} ${type} from OSM`);
          allSites.push(...osmSites.map(transformOSMSite));
        }
      } else {
        // Fetch all megalithic sites
        console.log("Fetching megalithic sites from OSM...");
        const osmSites = await fetchMegalithicSitesFromOSM();
        console.log(`Found ${osmSites.length} sites from OSM`);
        allSites.push(...osmSites.map(transformOSMSite));
      }
    } catch (error) {
      console.error("Failed to fetch from OSM:", error);
    }
  }

  // Deduplicate
  console.log(`Deduplicating ${allSites.length} sites...`);
  const deduplicated = deduplicateSites(allSites);
  console.log(`Result: ${deduplicated.length} unique sites`);

  return deduplicated;
}

/**
 * Generate SQL INSERT statements for importing sites
 */
export function generateSiteInsertSQL(sites: UnifiedSite[]): string {
  const siteValues = sites.map((site) => {
    const coords = JSON.stringify(site.coordinates);
    const escapedName = site.name.replace(/'/g, "''");
    const escapedSummary = site.summary.replace(/'/g, "''");
    
    return `('${site.slug}', '${escapedName}', '${escapedSummary}', '${site.siteType}', '${site.category}', '${coords}', '${site.layer}', '${site.verificationStatus}', ${site.trustTier ? `'${site.trustTier}'` : "NULL"}, 0)`;
  });

  return `
INSERT INTO megalithic.sites (slug, name, summary, site_type, category, coordinates, layer, verification_status, trust_tier, media_count)
VALUES
${siteValues.join(",\n")}
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  summary = EXCLUDED.summary,
  site_type = EXCLUDED.site_type,
  coordinates = EXCLUDED.coordinates,
  layer = EXCLUDED.layer,
  verification_status = EXCLUDED.verification_status,
  trust_tier = EXCLUDED.trust_tier;
`;
}

/**
 * Import stats summary
 */
export interface ImportStats {
  total: number;
  bySource: Record<string, number>;
  byType: Record<string, number>;
  byCountry: Record<string, number>;
  byVerification: Record<string, number>;
}

/**
 * Calculate import statistics
 */
export function calculateImportStats(sites: UnifiedSite[]): ImportStats {
  const stats: ImportStats = {
    total: sites.length,
    bySource: {},
    byType: {},
    byCountry: {},
    byVerification: {},
  };

  for (const site of sites) {
    // By source
    for (const source of site.sources) {
      stats.bySource[source] = (stats.bySource[source] || 0) + 1;
    }

    // By type
    stats.byType[site.siteType] = (stats.byType[site.siteType] || 0) + 1;

    // By country
    const country = site.country || "Unknown";
    stats.byCountry[country] = (stats.byCountry[country] || 0) + 1;

    // By verification
    stats.byVerification[site.verificationStatus] = (stats.byVerification[site.verificationStatus] || 0) + 1;
  }

  return stats;
}




