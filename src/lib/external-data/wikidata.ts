/**
 * Wikidata Integration for Megalithic Sites
 * 
 * Uses the Wikidata Query Service (SPARQL) to fetch archaeological and megalithic sites.
 * This is a legitimate, open data source with CC0 licensing.
 * 
 * @see https://query.wikidata.org/
 */

export interface WikidataSite {
  id: string;
  wikidataId: string;
  name: string;
  description?: string;
  coordinates: { lat: number; lng: number };
  siteType?: string;
  country?: string;
  countryCode?: string;
  inception?: string;
  wikipediaUrl?: string;
  imageUrl?: string;
  heritageStatus?: string;
}

const WIKIDATA_SPARQL_ENDPOINT = "https://query.wikidata.org/sparql";

/**
 * SPARQL query to fetch megalithic and archaeological sites from Wikidata
 * 
 * This query fetches:
 * - Megalithic monuments (Q1066693)
 * - Stone circles (Q1495447)
 * - Dolmens (Q179132)
 * - Menhirs (Q152810)
 * - Passage graves (Q183644)
 * - Cairns (Q170519)
 * - Pyramids (Q12518)
 * - Archaeological sites (Q839954)
 */
const MEGALITHIC_SITES_QUERY = `
SELECT DISTINCT ?site ?siteLabel ?siteDescription ?lat ?lon ?siteTypeLabel ?countryLabel ?countryCode ?inception ?image ?heritageLabel ?article
WHERE {
  # Sites that are instances of megalithic monument types
  VALUES ?type {
    wd:Q1066693   # megalithic monument
    wd:Q1495447   # stone circle
    wd:Q179132    # dolmen
    wd:Q152810    # menhir/standing stone
    wd:Q183644    # passage grave
    wd:Q170519    # cairn
    wd:Q12518     # pyramid
    wd:Q839954    # archaeological site
    wd:Q41176     # building (for ancient temples)
    wd:Q5107      # continent (for filtering)
  }
  
  ?site wdt:P31 ?siteType .
  ?siteType wdt:P279* ?type .
  
  # Must have coordinates
  ?site wdt:P625 ?coord .
  ?site p:P625 ?coordStatement .
  ?coordStatement psv:P625 ?coordNode .
  ?coordNode wikibase:geoLatitude ?lat .
  ?coordNode wikibase:geoLongitude ?lon .
  
  # Optional properties
  OPTIONAL { ?site wdt:P17 ?country . ?country wdt:P297 ?countryCode . }
  OPTIONAL { ?site wdt:P571 ?inception . }
  OPTIONAL { ?site wdt:P18 ?image . }
  OPTIONAL { ?site wdt:P1435 ?heritage . }
  OPTIONAL {
    ?article schema:about ?site ;
             schema:isPartOf <https://en.wikipedia.org/> .
  }
  
  # Filter to get meaningful results (exclude very modern sites)
  FILTER(!BOUND(?inception) || YEAR(?inception) < 1500)
  
  SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en" . }
}
LIMIT 500
`;

/**
 * More specific query for stone circles and megalithic monuments
 */
const STONE_CIRCLES_QUERY = `
SELECT DISTINCT ?site ?siteLabel ?siteDescription ?lat ?lon ?countryLabel ?countryCode ?image ?article
WHERE {
  VALUES ?type {
    wd:Q1495447   # stone circle
    wd:Q1066693   # megalithic monument
    wd:Q179132    # dolmen
    wd:Q152810    # menhir
  }
  
  ?site wdt:P31 ?type .
  
  ?site wdt:P625 ?coord .
  ?site p:P625 ?coordStatement .
  ?coordStatement psv:P625 ?coordNode .
  ?coordNode wikibase:geoLatitude ?lat .
  ?coordNode wikibase:geoLongitude ?lon .
  
  OPTIONAL { ?site wdt:P17 ?country . ?country wdt:P297 ?countryCode . }
  OPTIONAL { ?site wdt:P18 ?image . }
  OPTIONAL {
    ?article schema:about ?site ;
             schema:isPartOf <https://en.wikipedia.org/> .
  }
  
  SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en" . }
}
LIMIT 1000
`;

/**
 * Query for pyramids worldwide
 */
const PYRAMIDS_QUERY = `
SELECT DISTINCT ?site ?siteLabel ?siteDescription ?lat ?lon ?countryLabel ?countryCode ?inception ?image ?article
WHERE {
  ?site wdt:P31/wdt:P279* wd:Q12518 .  # instance of pyramid or subclass
  
  ?site wdt:P625 ?coord .
  ?site p:P625 ?coordStatement .
  ?coordStatement psv:P625 ?coordNode .
  ?coordNode wikibase:geoLatitude ?lat .
  ?coordNode wikibase:geoLongitude ?lon .
  
  OPTIONAL { ?site wdt:P17 ?country . ?country wdt:P297 ?countryCode . }
  OPTIONAL { ?site wdt:P571 ?inception . }
  OPTIONAL { ?site wdt:P18 ?image . }
  OPTIONAL {
    ?article schema:about ?site ;
             schema:isPartOf <https://en.wikipedia.org/> .
  }
  
  SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en" . }
}
LIMIT 500
`;

/**
 * Query for UNESCO World Heritage archaeological sites
 */
const UNESCO_ARCHAEOLOGICAL_QUERY = `
SELECT DISTINCT ?site ?siteLabel ?siteDescription ?lat ?lon ?countryLabel ?countryCode ?inception ?image ?article
WHERE {
  ?site wdt:P1435 wd:Q9259 .  # UNESCO World Heritage Site
  ?site wdt:P31/wdt:P279* wd:Q839954 .  # archaeological site
  
  ?site wdt:P625 ?coord .
  ?site p:P625 ?coordStatement .
  ?coordStatement psv:P625 ?coordNode .
  ?coordNode wikibase:geoLatitude ?lat .
  ?coordNode wikibase:geoLongitude ?lon .
  
  OPTIONAL { ?site wdt:P17 ?country . ?country wdt:P297 ?countryCode . }
  OPTIONAL { ?site wdt:P571 ?inception . }
  OPTIONAL { ?site wdt:P18 ?image . }
  OPTIONAL {
    ?article schema:about ?site ;
             schema:isPartOf <https://en.wikipedia.org/> .
  }
  
  SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en" . }
}
LIMIT 500
`;

interface WikidataRawResult {
  site: { value: string };
  siteLabel: { value: string };
  siteDescription?: { value: string };
  lat: { value: string };
  lon: { value: string };
  siteTypeLabel?: { value: string };
  countryLabel?: { value: string };
  countryCode?: { value: string };
  inception?: { value: string };
  image?: { value: string };
  heritageLabel?: { value: string };
  article?: { value: string };
}

/**
 * Execute a SPARQL query against Wikidata
 */
async function executeSparqlQuery(query: string): Promise<WikidataRawResult[]> {
  const url = new URL(WIKIDATA_SPARQL_ENDPOINT);
  url.searchParams.set("query", query);
  url.searchParams.set("format", "json");

  const response = await fetch(url.toString(), {
    headers: {
      "Accept": "application/sparql-results+json",
      "User-Agent": "MegalithicMapper/1.0 (https://github.com/megalithic-mapper; contact@example.com)",
    },
  });

  if (!response.ok) {
    throw new Error(`Wikidata query failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.results.bindings as WikidataRawResult[];
}

/**
 * Transform raw Wikidata results into our site format
 */
function transformWikidataResults(results: WikidataRawResult[]): WikidataSite[] {
  const seen = new Set<string>();
  
  return results
    .filter((result) => {
      // Deduplicate by Wikidata ID
      const wikidataId = result.site.value.split("/").pop() || "";
      if (seen.has(wikidataId)) return false;
      seen.add(wikidataId);
      return true;
    })
    .map((result) => {
      const wikidataId = result.site.value.split("/").pop() || "";
      
      return {
        id: `wikidata-${wikidataId}`,
        wikidataId,
        name: result.siteLabel.value,
        description: result.siteDescription?.value,
        coordinates: {
          lat: parseFloat(result.lat.value),
          lng: parseFloat(result.lon.value),
        },
        siteType: result.siteTypeLabel?.value,
        country: result.countryLabel?.value,
        countryCode: result.countryCode?.value,
        inception: result.inception?.value,
        wikipediaUrl: result.article?.value,
        imageUrl: result.image?.value,
        heritageStatus: result.heritageLabel?.value,
      };
    })
    .filter((site) => {
      // Filter out invalid coordinates
      return (
        !isNaN(site.coordinates.lat) &&
        !isNaN(site.coordinates.lng) &&
        site.coordinates.lat >= -90 &&
        site.coordinates.lat <= 90 &&
        site.coordinates.lng >= -180 &&
        site.coordinates.lng <= 180
      );
    });
}

/**
 * Fetch megalithic sites from Wikidata
 */
export async function fetchMegalithicSitesFromWikidata(): Promise<WikidataSite[]> {
  const results = await executeSparqlQuery(MEGALITHIC_SITES_QUERY);
  return transformWikidataResults(results);
}

/**
 * Fetch stone circles and standing stones from Wikidata
 */
export async function fetchStoneCirclesFromWikidata(): Promise<WikidataSite[]> {
  const results = await executeSparqlQuery(STONE_CIRCLES_QUERY);
  return transformWikidataResults(results);
}

/**
 * Fetch pyramids from Wikidata
 */
export async function fetchPyramidsFromWikidata(): Promise<WikidataSite[]> {
  const results = await executeSparqlQuery(PYRAMIDS_QUERY);
  return transformWikidataResults(results);
}

/**
 * Fetch UNESCO archaeological sites from Wikidata
 */
export async function fetchUnescoArchaeologicalSites(): Promise<WikidataSite[]> {
  const results = await executeSparqlQuery(UNESCO_ARCHAEOLOGICAL_QUERY);
  return transformWikidataResults(results);
}

/**
 * Fetch all megalithic-related sites from multiple queries
 */
export async function fetchAllWikidataSites(): Promise<WikidataSite[]> {
  const [megalithic, stoneCircles, pyramids, unesco] = await Promise.all([
    fetchMegalithicSitesFromWikidata().catch(() => []),
    fetchStoneCirclesFromWikidata().catch(() => []),
    fetchPyramidsFromWikidata().catch(() => []),
    fetchUnescoArchaeologicalSites().catch(() => []),
  ]);

  // Merge and deduplicate
  const allSites = [...megalithic, ...stoneCircles, ...pyramids, ...unesco];
  const seen = new Set<string>();
  
  return allSites.filter((site) => {
    if (seen.has(site.wikidataId)) return false;
    seen.add(site.wikidataId);
    return true;
  });
}

/**
 * Search Wikidata for a specific site by name
 * Uses the Wikidata search API first, then fetches details
 */
export async function searchWikidataSite(query: string): Promise<WikidataSite[]> {
  // Use simpler text search that's more reliable
  const searchQuery = `
SELECT DISTINCT ?site ?siteLabel ?siteDescription ?lat ?lon ?countryLabel ?image
WHERE {
  SERVICE wikibase:mwapi {
    bd:serviceParam wikibase:endpoint "www.wikidata.org";
                    wikibase:api "EntitySearch";
                    mwapi:search "${query.replace(/"/g, '\\"')}";
                    mwapi:language "en".
    ?site wikibase:apiOutputItem mwapi:item.
  }
  
  # Must be an archaeological/megalithic site
  ?site wdt:P31/wdt:P279* ?type .
  FILTER(?type IN (wd:Q839954, wd:Q1066693, wd:Q12518, wd:Q1495447, wd:Q179132, wd:Q152810))
  
  # Must have coordinates
  ?site wdt:P625 ?coord .
  ?site p:P625 ?coordStatement .
  ?coordStatement psv:P625 ?coordNode .
  ?coordNode wikibase:geoLatitude ?lat .
  ?coordNode wikibase:geoLongitude ?lon .
  
  OPTIONAL { ?site wdt:P17 ?country . }
  OPTIONAL { ?site wdt:P18 ?image . }
  
  SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en" . }
}
LIMIT 20
`;

  try {
    const results = await executeSparqlQuery(searchQuery);
    return transformWikidataResults(results);
  } catch (error) {
    console.warn("Wikidata search failed, returning empty results:", error);
    return [];
  }
}

