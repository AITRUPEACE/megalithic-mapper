/**
 * OpenStreetMap Overpass API Integration for Archaeological Sites
 * 
 * Uses the Overpass API to fetch archaeological and historic sites.
 * OpenStreetMap data is available under the Open Database License (ODbL).
 * 
 * @see https://wiki.openstreetmap.org/wiki/Overpass_API
 * @see https://wiki.openstreetmap.org/wiki/Key:historic
 */

export interface OSMSite {
  id: string;
  osmId: number;
  osmType: "node" | "way" | "relation";
  name: string;
  coordinates: { lat: number; lng: number };
  siteType?: string;
  historicType?: string;
  description?: string;
  wikipedia?: string;
  wikidata?: string;
  heritage?: string;
  startDate?: string;
  tags: Record<string, string>;
}

// Overpass API endpoints (use multiple for redundancy)
const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
];

/**
 * Overpass QL query for megalithic and archaeological sites
 * 
 * Fetches sites with these tags:
 * - historic=archaeological_site
 * - historic=megalith
 * - historic=stone
 * - site_type=megalith
 * - megalith_type=*
 */
const MEGALITHIC_SITES_QUERY = `
[out:json][timeout:120];
(
  // Archaeological sites
  node["historic"="archaeological_site"];
  way["historic"="archaeological_site"];
  relation["historic"="archaeological_site"];
  
  // Megalithic monuments
  node["historic"="megalith"];
  way["historic"="megalith"];
  node["megalith_type"];
  way["megalith_type"];
  
  // Standing stones
  node["historic"="standing_stone"];
  way["historic"="standing_stone"];
  
  // Stone circles
  node["historic"="stone_circle"];
  way["historic"="stone_circle"];
  
  // Dolmens
  node["historic"="dolmen"];
  way["historic"="dolmen"];
  
  // Tumuli and burial mounds
  node["historic"="tumulus"];
  way["historic"="tumulus"];
  node["historic"="tomb"];
  way["historic"="tomb"];
  
  // Pyramids
  node["historic"="pyramid"];
  way["historic"="pyramid"];
  node["man_made"="pyramid"];
  way["man_made"="pyramid"];
  
  // Ancient ruins
  node["historic"="ruins"]["ruins"="ancient"];
  way["historic"="ruins"]["ruins"="ancient"];
);
out center tags;
`;

/**
 * Query for a specific bounding box region
 */
function createBoundingBoxQuery(
  minLat: number,
  minLng: number,
  maxLat: number,
  maxLng: number
): string {
  const bbox = `${minLat},${minLng},${maxLat},${maxLng}`;
  
  return `
[out:json][timeout:60][bbox:${bbox}];
(
  node["historic"="archaeological_site"];
  way["historic"="archaeological_site"];
  node["historic"="megalith"];
  way["historic"="megalith"];
  node["megalith_type"];
  node["historic"="standing_stone"];
  node["historic"="stone_circle"];
  way["historic"="stone_circle"];
  node["historic"="dolmen"];
  node["historic"="tumulus"];
  node["historic"="pyramid"];
  way["historic"="pyramid"];
);
out center tags;
`;
}

/**
 * Query for sites near a specific point
 */
function createNearbyQuery(lat: number, lng: number, radiusMeters: number = 50000): string {
  return `
[out:json][timeout:60];
(
  node["historic"="archaeological_site"](around:${radiusMeters},${lat},${lng});
  way["historic"="archaeological_site"](around:${radiusMeters},${lat},${lng});
  node["historic"="megalith"](around:${radiusMeters},${lat},${lng});
  node["megalith_type"](around:${radiusMeters},${lat},${lng});
  node["historic"="standing_stone"](around:${radiusMeters},${lat},${lng});
  node["historic"="stone_circle"](around:${radiusMeters},${lat},${lng});
  way["historic"="stone_circle"](around:${radiusMeters},${lat},${lng});
);
out center tags;
`;
}

/**
 * Query for specific site types
 */
const SITE_TYPE_QUERIES: Record<string, string> = {
  stone_circles: `
[out:json][timeout:60];
(
  node["historic"="stone_circle"];
  way["historic"="stone_circle"];
  relation["historic"="stone_circle"];
);
out center tags;
`,
  standing_stones: `
[out:json][timeout:60];
(
  node["historic"="standing_stone"];
  node["megalith_type"="menhir"];
  node["historic"="megalith"]["megalith_type"="menhir"];
);
out center tags;
`,
  dolmens: `
[out:json][timeout:60];
(
  node["historic"="dolmen"];
  way["historic"="dolmen"];
  node["megalith_type"="dolmen"];
);
out center tags;
`,
  pyramids: `
[out:json][timeout:60];
(
  node["historic"="pyramid"];
  way["historic"="pyramid"];
  node["man_made"="pyramid"];
  way["man_made"="pyramid"];
);
out center tags;
`,
  tumuli: `
[out:json][timeout:60];
(
  node["historic"="tumulus"];
  way["historic"="tumulus"];
  node["historic"="tomb"];
  way["historic"="tomb"];
);
out center tags;
`,
};

interface OverpassElement {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

interface OverpassResponse {
  version: number;
  generator: string;
  elements: OverpassElement[];
}

/**
 * Execute an Overpass API query with fallback endpoints
 */
async function executeOverpassQuery(query: string): Promise<OverpassElement[]> {
  let lastError: Error | null = null;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `data=${encodeURIComponent(query)}`,
      });

      if (!response.ok) {
        throw new Error(`Overpass API error: ${response.status} ${response.statusText}`);
      }

      const data: OverpassResponse = await response.json();
      return data.elements;
    } catch (error) {
      lastError = error as Error;
      console.warn(`Overpass endpoint ${endpoint} failed, trying next...`);
    }
  }

  throw lastError || new Error("All Overpass endpoints failed");
}

/**
 * Transform Overpass elements into our site format
 */
function transformOverpassResults(elements: OverpassElement[]): OSMSite[] {
  return elements
    .filter((element) => {
      // Must have coordinates
      const lat = element.lat ?? element.center?.lat;
      const lon = element.lon ?? element.center?.lon;
      return lat !== undefined && lon !== undefined;
    })
    .filter((element) => {
      // Must have a name or meaningful tags
      return element.tags?.name || element.tags?.historic || element.tags?.megalith_type;
    })
    .map((element) => {
      const lat = element.lat ?? element.center?.lat ?? 0;
      const lon = element.lon ?? element.center?.lon ?? 0;
      const tags = element.tags || {};

      // Determine site type from tags
      let siteType = tags.historic || tags.site_type || "archaeological_site";
      if (tags.megalith_type) {
        siteType = tags.megalith_type;
      }

      // Generate a name if missing
      const name = tags.name || 
                   tags["name:en"] || 
                   `${siteType.replace(/_/g, " ")} (OSM ${element.id})`;

      return {
        id: `osm-${element.type}-${element.id}`,
        osmId: element.id,
        osmType: element.type,
        name,
        coordinates: { lat, lng: lon },
        siteType,
        historicType: tags.historic,
        description: tags.description || tags["description:en"],
        wikipedia: tags.wikipedia,
        wikidata: tags.wikidata,
        heritage: tags.heritage || tags["heritage:operator"],
        startDate: tags.start_date,
        tags,
      };
    });
}

/**
 * Fetch all megalithic and archaeological sites from OpenStreetMap
 */
export async function fetchMegalithicSitesFromOSM(): Promise<OSMSite[]> {
  const elements = await executeOverpassQuery(MEGALITHIC_SITES_QUERY);
  return transformOverpassResults(elements);
}

/**
 * Fetch sites within a bounding box
 */
export async function fetchSitesInBoundingBox(
  minLat: number,
  minLng: number,
  maxLat: number,
  maxLng: number
): Promise<OSMSite[]> {
  const query = createBoundingBoxQuery(minLat, minLng, maxLat, maxLng);
  const elements = await executeOverpassQuery(query);
  return transformOverpassResults(elements);
}

/**
 * Fetch sites near a specific location
 */
export async function fetchNearbySites(
  lat: number,
  lng: number,
  radiusMeters: number = 50000
): Promise<OSMSite[]> {
  const query = createNearbyQuery(lat, lng, radiusMeters);
  const elements = await executeOverpassQuery(query);
  return transformOverpassResults(elements);
}

/**
 * Fetch sites of a specific type
 */
export async function fetchSitesByType(
  type: "stone_circles" | "standing_stones" | "dolmens" | "pyramids" | "tumuli"
): Promise<OSMSite[]> {
  const query = SITE_TYPE_QUERIES[type];
  if (!query) {
    throw new Error(`Unknown site type: ${type}`);
  }
  const elements = await executeOverpassQuery(query);
  return transformOverpassResults(elements);
}

/**
 * Fetch sites by country using Nominatim area search
 */
export async function fetchSitesByCountry(countryCode: string): Promise<OSMSite[]> {
  // Use area search for country
  const query = `
[out:json][timeout:120];
area["ISO3166-1"="${countryCode.toUpperCase()}"]->.searchArea;
(
  node["historic"="archaeological_site"](area.searchArea);
  way["historic"="archaeological_site"](area.searchArea);
  node["historic"="megalith"](area.searchArea);
  node["megalith_type"](area.searchArea);
  node["historic"="standing_stone"](area.searchArea);
  node["historic"="stone_circle"](area.searchArea);
  way["historic"="stone_circle"](area.searchArea);
);
out center tags;
`;
  const elements = await executeOverpassQuery(query);
  return transformOverpassResults(elements);
}

/**
 * Get statistics about available sites (lightweight query)
 */
export async function getOSMSiteStats(): Promise<{ total: number; byType: Record<string, number> }> {
  const query = `
[out:json][timeout:30];
(
  node["historic"="archaeological_site"];
  node["historic"="megalith"];
  node["historic"="standing_stone"];
  node["historic"="stone_circle"];
  node["historic"="dolmen"];
  node["historic"="tumulus"];
  node["historic"="pyramid"];
);
out count;
`;

  try {
    const elements = await executeOverpassQuery(query);
    // The count query returns a special element with count
    const countElement = elements[0] as unknown as { tags: { total: string } };
    const total = parseInt(countElement?.tags?.total || "0", 10);
    
    return {
      total,
      byType: {}, // Would need separate queries for breakdown
    };
  } catch {
    return { total: 0, byType: {} };
  }
}












