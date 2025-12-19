/**
 * Fetch megalithic sites from Wikidata using SPARQL
 * 
 * This script queries Wikidata for all megalithic monuments with:
 * - Coordinates
 * - Images  
 * - Descriptions
 * - Wikipedia links
 * 
 * Usage: npx tsx scripts/data-gathering/fetch-wikidata.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const WIKIDATA_SPARQL_ENDPOINT = 'https://query.wikidata.org/sparql';

// Smaller, focused queries to avoid timeout
const SPARQL_QUERIES = [
  // Batch 1: Stone circles, henges, cromlechs
  `SELECT DISTINCT ?site ?siteLabel ?siteDescription ?coord ?image ?wikipedia ?countryLabel ?siteTypeLabel WHERE {
    VALUES ?type { wd:Q1935728 wd:Q12090 wd:Q210548 }
    ?site wdt:P31 ?type . ?site wdt:P31 ?siteType . ?site wdt:P625 ?coord .
    OPTIONAL { ?site wdt:P17 ?country . } OPTIONAL { ?site wdt:P18 ?image . }
    OPTIONAL { ?wikipedia schema:about ?site ; schema:isPartOf <https://en.wikipedia.org/> . }
    SERVICE wikibase:label { bd:serviceParam wikibase:language "en,fr,de,es,it" . }
  }`,
  
  // Batch 2: Dolmens, passage graves, portal tombs
  `SELECT DISTINCT ?site ?siteLabel ?siteDescription ?coord ?image ?wikipedia ?countryLabel ?siteTypeLabel WHERE {
    VALUES ?type { wd:Q180846 wd:Q2518569 wd:Q3574619 }
    ?site wdt:P31 ?type . ?site wdt:P31 ?siteType . ?site wdt:P625 ?coord .
    OPTIONAL { ?site wdt:P17 ?country . } OPTIONAL { ?site wdt:P18 ?image . }
    OPTIONAL { ?wikipedia schema:about ?site ; schema:isPartOf <https://en.wikipedia.org/> . }
    SERVICE wikibase:label { bd:serviceParam wikibase:language "en,fr,de,es,it" . }
  }`,
  
  // Batch 3: Menhirs, standing stones
  `SELECT DISTINCT ?site ?siteLabel ?siteDescription ?coord ?image ?wikipedia ?countryLabel ?siteTypeLabel WHERE {
    VALUES ?type { wd:Q189539 }
    ?site wdt:P31 ?type . ?site wdt:P31 ?siteType . ?site wdt:P625 ?coord .
    OPTIONAL { ?site wdt:P17 ?country . } OPTIONAL { ?site wdt:P18 ?image . }
    OPTIONAL { ?wikipedia schema:about ?site ; schema:isPartOf <https://en.wikipedia.org/> . }
    SERVICE wikibase:label { bd:serviceParam wikibase:language "en,fr,de,es,it" . }
  }`,
  
  // Batch 4: Cairns, barrows, tumuli
  `SELECT DISTINCT ?site ?siteLabel ?siteDescription ?coord ?image ?wikipedia ?countryLabel ?siteTypeLabel WHERE {
    VALUES ?type { wd:Q194195 wd:Q816116 wd:Q1535671 wd:Q653588 }
    ?site wdt:P31 ?type . ?site wdt:P31 ?siteType . ?site wdt:P625 ?coord .
    OPTIONAL { ?site wdt:P17 ?country . } OPTIONAL { ?site wdt:P18 ?image . }
    OPTIONAL { ?wikipedia schema:about ?site ; schema:isPartOf <https://en.wikipedia.org/> . }
    SERVICE wikibase:label { bd:serviceParam wikibase:language "en,fr,de,es,it" . }
  }`,
  
  // Batch 5: General megalithic monuments
  `SELECT DISTINCT ?site ?siteLabel ?siteDescription ?coord ?image ?wikipedia ?countryLabel ?siteTypeLabel WHERE {
    VALUES ?type { wd:Q8205328 }
    ?site wdt:P31 ?type . ?site wdt:P31 ?siteType . ?site wdt:P625 ?coord .
    OPTIONAL { ?site wdt:P17 ?country . } OPTIONAL { ?site wdt:P18 ?image . }
    OPTIONAL { ?wikipedia schema:about ?site ; schema:isPartOf <https://en.wikipedia.org/> . }
    SERVICE wikibase:label { bd:serviceParam wikibase:language "en,fr,de,es,it" . }
  }`,
  
  // Batch 6: Nuraghi, tholos, taula (Mediterranean)
  `SELECT DISTINCT ?site ?siteLabel ?siteDescription ?coord ?image ?wikipedia ?countryLabel ?siteTypeLabel WHERE {
    VALUES ?type { wd:Q2519340 wd:Q1251989 wd:Q15917920 }
    ?site wdt:P31 ?type . ?site wdt:P31 ?siteType . ?site wdt:P625 ?coord .
    OPTIONAL { ?site wdt:P17 ?country . } OPTIONAL { ?site wdt:P18 ?image . }
    OPTIONAL { ?wikipedia schema:about ?site ; schema:isPartOf <https://en.wikipedia.org/> . }
    SERVICE wikibase:label { bd:serviceParam wikibase:language "en,fr,de,es,it" . }
  }`
];

// Keep single query for reference but use batched approach
const SPARQL_QUERY = SPARQL_QUERIES[0];

interface WikidataResult {
  site: { value: string };
  siteLabel: { value: string };
  siteDescription?: { value: string };
  coord: { value: string };
  image?: { value: string };
  wikipedia?: { value: string };
  countryLabel?: { value: string };
  siteTypeLabel?: { value: string };
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
  // Format: "Point(longitude latitude)"
  const match = pointStr.match(/Point\(([^ ]+) ([^)]+)\)/);
  if (match) {
    return {
      lng: parseFloat(match[1]),
      lat: parseFloat(match[2])
    };
  }
  return null;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
}

function mapSiteType(wikidataType: string): string {
  const typeMap: Record<string, string> = {
    'megalithic monument': 'megalithic monument',
    'stone circle': 'stone circle',
    'dolmen': 'dolmen',
    'menhir': 'menhir',
    'passage grave': 'passage tomb',
    'cairn': 'cairn',
    'chambered cairn': 'chambered cairn',
    'henge': 'henge',
    'long barrow': 'long barrow',
    'stone row': 'stone alignment',
    'cromlech': 'stone circle',
    'portal tomb': 'portal dolmen',
    'tholos': 'tholos tomb',
    'nuraghe': 'nuraghe',
    'taula': 'taula',
    'tumulus': 'artificial mound',
    'ring fort': 'ring fort',
    'pyramid': 'pyramid',
    'temple': 'temple complex',
  };
  
  return typeMap[wikidataType.toLowerCase()] || 'megalithic monument';
}

async function fetchWikidataSites(): Promise<WikidataResult[]> {
  console.log('🔍 Fetching megalithic sites from Wikidata in batches...\n');
  
  const allResults: WikidataResult[] = [];
  const batchNames = [
    'Stone circles, henges, cromlechs',
    'Dolmens, passage graves, portal tombs',
    'Menhirs, standing stones',
    'Cairns, barrows, tumuli',
    'General megalithic monuments',
    'Nuraghi, tholos, taula'
  ];
  
  for (let i = 0; i < SPARQL_QUERIES.length; i++) {
    const query = SPARQL_QUERIES[i];
    console.log(`📦 Batch ${i + 1}/${SPARQL_QUERIES.length}: ${batchNames[i]}...`);
    
    const url = `${WIKIDATA_SPARQL_ENDPOINT}?query=${encodeURIComponent(query)}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/sparql-results+json',
          'User-Agent': 'MegalithicMapper/1.0 (https://github.com/megalithic-mapper)'
        }
      });
      
      if (!response.ok) {
        console.log(`   ⚠️ Batch ${i + 1} failed: ${response.status} - skipping`);
        continue;
      }
      
      const data = await response.json();
      const results = data.results.bindings;
      console.log(`   ✅ Found ${results.length} sites`);
      allResults.push(...results);
      
      // Rate limiting between batches
      if (i < SPARQL_QUERIES.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.log(`   ⚠️ Batch ${i + 1} error: ${(error as Error).message} - skipping`);
    }
  }
  
  return allResults;
}

async function main() {
  try {
    const results = await fetchWikidataSites();
    console.log(`✅ Found ${results.length} results from Wikidata`);
    
    // Deduplicate by Wikidata ID (same site may appear multiple times with different types)
    const siteMap = new Map<string, WikidataResult>();
    for (const result of results) {
      const wikidataId = result.site.value.split('/').pop()!;
      if (!siteMap.has(wikidataId)) {
        siteMap.set(wikidataId, result);
      }
    }
    
    console.log(`📊 ${siteMap.size} unique sites after deduplication`);
    
    // Convert to our site format
    const sites: MegalithicSite[] = [];
    const slugs = new Set<string>();
    
    for (const [wikidataId, result] of siteMap) {
      const name = result.siteLabel.value;
      
      // Skip if name is just the Wikidata ID (no label found)
      if (name.startsWith('Q') && /^Q\d+$/.test(name)) {
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
        site_type: mapSiteType(result.siteTypeLabel?.value || 'megalithic monument'),
        category: 'site',
        coordinates: coords,
        layer: 'official',
        verification_status: 'verified',
        trust_tier: null,
        media_count: result.image ? 1 : 0,
        image_url: result.image?.value,
        wikipedia_url: result.wikipedia?.value,
        country: result.countryLabel?.value
      };
      
      sites.push(site);
    }
    
    console.log(`✅ Processed ${sites.length} valid sites`);
    
    // Group by country for analysis
    const byCountry = new Map<string, number>();
    for (const site of sites) {
      const country = site.country || 'Unknown';
      byCountry.set(country, (byCountry.get(country) || 0) + 1);
    }
    
    console.log('\n📍 Sites by country:');
    const sortedCountries = [...byCountry.entries()].sort((a, b) => b[1] - a[1]);
    for (const [country, count] of sortedCountries.slice(0, 20)) {
      console.log(`   ${country}: ${count}`);
    }
    
    // Save to file
    const outputDir = path.join(__dirname, 'data');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const outputPath = path.join(outputDir, 'wikidata-sites.json');
    fs.writeFileSync(outputPath, JSON.stringify({ sites }, null, 2));
    console.log(`\n💾 Saved to ${outputPath}`);
    
    // Also save a summary CSV for quick review
    const csvPath = path.join(outputDir, 'wikidata-sites.csv');
    const csvHeader = 'name,slug,site_type,lat,lng,country,has_image,wikipedia_url\n';
    const csvRows = sites.map(s => 
      `"${s.name.replace(/"/g, '""')}","${s.slug}","${s.site_type}",${s.coordinates.lat},${s.coordinates.lng},"${s.country || ''}",${s.image_url ? 'yes' : 'no'},"${s.wikipedia_url || ''}"`
    ).join('\n');
    fs.writeFileSync(csvPath, csvHeader + csvRows);
    console.log(`📄 Saved CSV summary to ${csvPath}`);
    
    // Stats
    const withImages = sites.filter(s => s.image_url).length;
    const withWikipedia = sites.filter(s => s.wikipedia_url).length;
    const withDescriptions = sites.filter(s => s.summary && !s.summary.endsWith('a megalithic site.')).length;
    
    console.log('\n📈 Statistics:');
    console.log(`   Total sites: ${sites.length}`);
    console.log(`   With images: ${withImages} (${Math.round(withImages/sites.length*100)}%)`);
    console.log(`   With Wikipedia: ${withWikipedia} (${Math.round(withWikipedia/sites.length*100)}%)`);
    console.log(`   With descriptions: ${withDescriptions} (${Math.round(withDescriptions/sites.length*100)}%)`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
