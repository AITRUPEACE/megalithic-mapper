/**
 * Fetch REAL megalithic sites from Wikidata
 * 
 * This version excludes the polluted "megalithic monument" generic type
 * and focuses on specific, well-defined megalithic site types.
 * 
 * Usage: npx tsx scripts/data-gathering/fetch-wikidata-clean.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const WIKIDATA_SPARQL_ENDPOINT = 'https://query.wikidata.org/sparql';

// Focused queries for REAL megalithic types only
// NO generic "megalithic monument" (Q8205328) - it's polluted with garbage
const SPARQL_QUERIES = [
  // Batch 1: Stone circles and henges (well-defined)
  {
    name: 'Stone circles & henges',
    query: `SELECT DISTINCT ?site ?siteLabel ?siteDescription ?coord ?image ?wikipedia ?countryLabel WHERE {
      VALUES ?type { wd:Q1935728 wd:Q12090 wd:Q210548 }
      ?site wdt:P31 ?type . ?site wdt:P625 ?coord .
      OPTIONAL { ?site wdt:P17 ?country . } OPTIONAL { ?site wdt:P18 ?image . }
      OPTIONAL { ?wikipedia schema:about ?site ; schema:isPartOf <https://en.wikipedia.org/> . }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en,fr,de,es,it" . }
    }`
  },
  
  // Batch 2: Dolmens and passage tombs
  {
    name: 'Dolmens & passage tombs',
    query: `SELECT DISTINCT ?site ?siteLabel ?siteDescription ?coord ?image ?wikipedia ?countryLabel WHERE {
      VALUES ?type { wd:Q180846 wd:Q2518569 wd:Q3574619 wd:Q1172959 }
      ?site wdt:P31 ?type . ?site wdt:P625 ?coord .
      OPTIONAL { ?site wdt:P17 ?country . } OPTIONAL { ?site wdt:P18 ?image . }
      OPTIONAL { ?wikipedia schema:about ?site ; schema:isPartOf <https://en.wikipedia.org/> . }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en,fr,de,es,it" . }
    }`
  },
  
  // Batch 3: Menhirs and standing stones  
  {
    name: 'Menhirs & standing stones',
    query: `SELECT DISTINCT ?site ?siteLabel ?siteDescription ?coord ?image ?wikipedia ?countryLabel WHERE {
      VALUES ?type { wd:Q189539 wd:Q7599155 }
      ?site wdt:P31 ?type . ?site wdt:P625 ?coord .
      OPTIONAL { ?site wdt:P17 ?country . } OPTIONAL { ?site wdt:P18 ?image . }
      OPTIONAL { ?wikipedia schema:about ?site ; schema:isPartOf <https://en.wikipedia.org/> . }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en,fr,de,es,it" . }
    }`
  },
  
  // Batch 4: Chambered cairns and long barrows
  {
    name: 'Cairns & barrows',
    query: `SELECT DISTINCT ?site ?siteLabel ?siteDescription ?coord ?image ?wikipedia ?countryLabel WHERE {
      VALUES ?type { wd:Q816116 wd:Q1535671 wd:Q194195 }
      ?site wdt:P31 ?type . ?site wdt:P625 ?coord .
      OPTIONAL { ?site wdt:P17 ?country . } OPTIONAL { ?site wdt:P18 ?image . }
      OPTIONAL { ?wikipedia schema:about ?site ; schema:isPartOf <https://en.wikipedia.org/> . }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en,fr,de,es,it" . }
    }`
  },
  
  // Batch 5: Nuraghi (Sardinia) and Taulas (Menorca)
  {
    name: 'Nuraghi & Taulas',
    query: `SELECT DISTINCT ?site ?siteLabel ?siteDescription ?coord ?image ?wikipedia ?countryLabel WHERE {
      VALUES ?type { wd:Q2519340 wd:Q15917920 wd:Q1269085 }
      ?site wdt:P31 ?type . ?site wdt:P625 ?coord .
      OPTIONAL { ?site wdt:P17 ?country . } OPTIONAL { ?site wdt:P18 ?image . }
      OPTIONAL { ?wikipedia schema:about ?site ; schema:isPartOf <https://en.wikipedia.org/> . }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en,fr,de,es,it" . }
    }`
  },
  
  // Batch 6: Stone rows and alignments  
  {
    name: 'Stone rows & alignments',
    query: `SELECT DISTINCT ?site ?siteLabel ?siteDescription ?coord ?image ?wikipedia ?countryLabel WHERE {
      VALUES ?type { wd:Q5503563 wd:Q15617695 }
      ?site wdt:P31 ?type . ?site wdt:P625 ?coord .
      OPTIONAL { ?site wdt:P17 ?country . } OPTIONAL { ?site wdt:P18 ?image . }
      OPTIONAL { ?wikipedia schema:about ?site ; schema:isPartOf <https://en.wikipedia.org/> . }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en,fr,de,es,it" . }
    }`
  },
  
  // Batch 7: Tholos tombs and court tombs
  {
    name: 'Tholos & court tombs',
    query: `SELECT DISTINCT ?site ?siteLabel ?siteDescription ?coord ?image ?wikipedia ?countryLabel WHERE {
      VALUES ?type { wd:Q1251989 wd:Q5175814 wd:Q5791531 }
      ?site wdt:P31 ?type . ?site wdt:P625 ?coord .
      OPTIONAL { ?site wdt:P17 ?country . } OPTIONAL { ?site wdt:P18 ?image . }
      OPTIONAL { ?wikipedia schema:about ?site ; schema:isPartOf <https://en.wikipedia.org/> . }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en,fr,de,es,it" . }
    }`
  },
];

// Words that indicate garbage data (not real megalithic sites)
const GARBAGE_KEYWORDS = [
  // Generic retail terms
  'supermarket', 'store', 'market', 'grocery', 'mall', 'shopping', 'retail', 
  'branch', 'subsidiary', 'hypermarket', 'hyper-', 'hypermarché',
  // US chains
  'walmart', 'kroger', 'trader joe', 'costco', 'target', 'safeway', 'publix',
  // UK chains  
  'tesco', 'sainsbury', 'asda', 'morrisons', 'waitrose',
  // German chains
  'lidl', 'aldi', 'rewe', 'edeka', 'kaufland', 'netto', 'penny', 'hozain',
  'e-center', 'e center', 'umspannwerk',
  // French chains
  'carrefour', 'leclerc', 'e.leclerc', 'auchan', 'intermarché', 'super u', 
  'hyper u', 'casino', 'monoprix', 'franprix', 'bazar', 'castorama', 'boulanger',
  'boucherie', 'vincennes gate', 'pradet', 'loretto', 'hallmarkt',
  // Other
  'ikea', 'decathlon', 'bricomarché', 'leroy merlin', 'brico',
  // Religious/modern buildings
  'church', 'mosque', 'synagogue', 'temple ', 'cathedral',
];

// Valid megalithic regions (countries where megaliths actually exist)
const MEGALITHIC_REGIONS = new Set([
  // Western Europe (primary)
  'United Kingdom', 'Ireland', 'France', 'Spain', 'Portugal',
  // Mediterranean
  'Italy', 'Malta', 'Greece', 'Turkey',
  // Northern Europe
  'Sweden', 'Denmark', 'Norway', 'Germany', 'Netherlands', 'Belgium',
  // Eastern Europe
  'Poland', 'Czech Republic', 'Bulgaria', 'Romania',
  // Middle East & Africa
  'Israel', 'Jordan', 'Lebanon', 'Egypt', 'Morocco', 'Algeria', 'Tunisia',
  'Ethiopia', 'Senegal', 'Gambia',
  // Asia
  'India', 'South Korea', 'Japan', 'Indonesia',
  // South America (limited)
  'Peru', 'Bolivia', 'Colombia',
  // Other
  'Armenia', 'Georgia', 'Russia'
]);

interface WikidataResult {
  site: { value: string };
  siteLabel: { value: string };
  siteDescription?: { value: string };
  coord: { value: string };
  image?: { value: string };
  wikipedia?: { value: string };
  countryLabel?: { value: string };
}

interface MegalithicSite {
  wikidata_id: string;
  slug: string;
  name: string;
  summary: string;
  site_type: string;
  category: 'site';
  coordinates: { lat: number; lng: number };
  layer: 'official';
  verification_status: 'verified';
  trust_tier: null;
  media_count: number;
  image_url?: string;
  wikipedia_url?: string;
  country?: string;
}

function parseCoordinates(pointStr: string): { lat: number; lng: number } | null {
  const match = pointStr.match(/Point\(([^ ]+) ([^)]+)\)/);
  if (match) {
    return { lng: parseFloat(match[1]), lat: parseFloat(match[2]) };
  }
  return null;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
}

function isGarbage(site: WikidataResult): boolean {
  const name = site.siteLabel.value.toLowerCase();
  const summary = (site.siteDescription?.value || '').toLowerCase();
  const combined = name + ' ' + summary;
  
  return GARBAGE_KEYWORDS.some(keyword => combined.includes(keyword));
}

function isValidRegion(country: string | undefined): boolean {
  if (!country) return true; // Allow if no country specified
  return MEGALITHIC_REGIONS.has(country);
}

function mapSiteType(batchName: string): string {
  const typeMap: Record<string, string> = {
    'Stone circles & henges': 'stone circle',
    'Dolmens & passage tombs': 'dolmen',
    'Menhirs & standing stones': 'menhir',
    'Cairns & barrows': 'cairn',
    'Nuraghi & Taulas': 'nuraghe',
    'Stone rows & alignments': 'stone alignment',
    'Tholos & court tombs': 'tholos tomb',
  };
  return typeMap[batchName] || 'megalithic monument';
}

async function fetchBatch(query: string, batchName: string): Promise<WikidataResult[]> {
  const url = `${WIKIDATA_SPARQL_ENDPOINT}?query=${encodeURIComponent(query)}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/sparql-results+json',
        'User-Agent': 'MegalithicMapper/1.0 (https://github.com/megalithic-mapper)'
      }
    });
    
    if (!response.ok) {
      console.log(`   ⚠️ ${batchName} failed: ${response.status} - skipping`);
      return [];
    }
    
    const data = await response.json();
    return data.results.bindings;
  } catch (error) {
    console.log(`   ⚠️ ${batchName} error: ${(error as Error).message} - skipping`);
    return [];
  }
}

async function main() {
  console.log('🔍 Fetching REAL megalithic sites from Wikidata...\n');
  console.log('📋 Excluding generic "megalithic monument" type (polluted with garbage)\n');
  
  const allResults: { result: WikidataResult; batchName: string }[] = [];
  
  for (let i = 0; i < SPARQL_QUERIES.length; i++) {
    const { name, query } = SPARQL_QUERIES[i];
    console.log(`📦 Batch ${i + 1}/${SPARQL_QUERIES.length}: ${name}...`);
    
    const results = await fetchBatch(query, name);
    console.log(`   ✅ Found ${results.length} sites`);
    
    results.forEach(r => allResults.push({ result: r, batchName: name }));
    
    // Rate limiting
    if (i < SPARQL_QUERIES.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
  }
  
  console.log(`\n📊 Total raw results: ${allResults.length}`);
  
  // Deduplicate by Wikidata ID
  const siteMap = new Map<string, { result: WikidataResult; batchName: string }>();
  for (const item of allResults) {
    const wikidataId = item.result.site.value.split('/').pop()!;
    if (!siteMap.has(wikidataId)) {
      siteMap.set(wikidataId, item);
    }
  }
  console.log(`📊 After deduplication: ${siteMap.size} unique sites`);
  
  // Filter and convert
  const sites: MegalithicSite[] = [];
  const slugs = new Set<string>();
  let garbageFiltered = 0;
  let regionFiltered = 0;
  let noNameFiltered = 0;
  
  for (const [wikidataId, { result, batchName }] of siteMap) {
    const name = result.siteLabel.value;
    
    // Skip if name is just the Wikidata ID
    if (name.startsWith('Q') && /^Q\d+$/.test(name)) {
      noNameFiltered++;
      continue;
    }
    
    // Filter garbage
    if (isGarbage(result)) {
      garbageFiltered++;
      continue;
    }
    
    // Filter invalid regions
    const country = result.countryLabel?.value;
    if (!isValidRegion(country)) {
      regionFiltered++;
      continue;
    }
    
    const coords = parseCoordinates(result.coord.value);
    if (!coords) continue;
    
    // Generate unique slug
    let baseSlug = slugify(name);
    let slug = baseSlug;
    let counter = 1;
    while (slugs.has(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    slugs.add(slug);
    
    const site: MegalithicSite = {
      wikidata_id: wikidataId,
      slug,
      name,
      summary: result.siteDescription?.value || `${name} - a megalithic site.`,
      site_type: mapSiteType(batchName),
      category: 'site',
      coordinates: coords,
      layer: 'official',
      verification_status: 'verified',
      trust_tier: null,
      media_count: result.image ? 1 : 0,
      image_url: result.image?.value,
      wikipedia_url: result.wikipedia?.value,
      country
    };
    
    sites.push(site);
  }
  
  console.log(`\n🧹 Filtering results:`);
  console.log(`   Garbage filtered (supermarkets, etc): ${garbageFiltered}`);
  console.log(`   Invalid regions filtered: ${regionFiltered}`);
  console.log(`   No name filtered: ${noNameFiltered}`);
  console.log(`   ✅ Valid megalithic sites: ${sites.length}`);
  
  // Stats by country
  const byCountry = new Map<string, number>();
  for (const site of sites) {
    const country = site.country || 'Unknown';
    byCountry.set(country, (byCountry.get(country) || 0) + 1);
  }
  
  console.log('\n📍 Sites by country:');
  const sortedCountries = [...byCountry.entries()].sort((a, b) => b[1] - a[1]);
  for (const [country, count] of sortedCountries.slice(0, 15)) {
    console.log(`   ${country}: ${count}`);
  }
  
  // Stats by type
  const byType = new Map<string, number>();
  for (const site of sites) {
    byType.set(site.site_type, (byType.get(site.site_type) || 0) + 1);
  }
  
  console.log('\n🏛️ Sites by type:');
  const sortedTypes = [...byType.entries()].sort((a, b) => b[1] - a[1]);
  for (const [type, count] of sortedTypes) {
    console.log(`   ${type}: ${count}`);
  }
  
  // Save to file
  const outputDir = path.join(__dirname, 'data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const outputPath = path.join(outputDir, 'megalithic-sites-clean.json');
  fs.writeFileSync(outputPath, JSON.stringify({ sites }, null, 2));
  console.log(`\n💾 Saved to ${outputPath}`);
  
  // CSV for review
  const csvPath = path.join(outputDir, 'megalithic-sites-clean.csv');
  const csvHeader = 'name,slug,site_type,lat,lng,country,has_image,wikipedia_url\n';
  const csvRows = sites.map(s => 
    `"${s.name.replace(/"/g, '""')}","${s.slug}","${s.site_type}",${s.coordinates.lat},${s.coordinates.lng},"${s.country || ''}",${s.image_url ? 'yes' : 'no'},"${s.wikipedia_url || ''}"`
  ).join('\n');
  fs.writeFileSync(csvPath, csvHeader + csvRows);
  console.log(`📄 Saved CSV to ${csvPath}`);
  
  // Final stats
  const withImages = sites.filter(s => s.image_url).length;
  const withWikipedia = sites.filter(s => s.wikipedia_url).length;
  
  console.log('\n📈 Final Statistics:');
  console.log(`   Total megalithic sites: ${sites.length}`);
  console.log(`   With images: ${withImages} (${Math.round(withImages/sites.length*100)}%)`);
  console.log(`   With Wikipedia: ${withWikipedia} (${Math.round(withWikipedia/sites.length*100)}%)`);
}

main();
