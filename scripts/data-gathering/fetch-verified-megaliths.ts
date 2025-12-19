/**
 * Fetch VERIFIED megalithic sites from Wikidata
 * 
 * Uses strict verification: only sites that:
 * - Have English Wikipedia articles, OR
 * - Are designated heritage sites (P1435), OR
 * - Have archaeological site IDs
 * 
 * Usage: npx tsx scripts/data-gathering/fetch-verified-megaliths.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const WIKIDATA_SPARQL_ENDPOINT = 'https://query.wikidata.org/sparql';

// Query 1: Stone circles with Wikipedia (known good)
const STONE_CIRCLES_QUERY = `
SELECT DISTINCT ?site ?siteLabel ?siteDescription ?coord ?image ?wikipedia ?countryLabel WHERE {
  VALUES ?type { wd:Q1935728 wd:Q12090 wd:Q210548 }
  ?site wdt:P31 ?type .
  ?site wdt:P625 ?coord .
  OPTIONAL { ?site wdt:P17 ?country . }
  OPTIONAL { ?site wdt:P18 ?image . }
  ?wikipedia schema:about ?site ; schema:isPartOf <https://en.wikipedia.org/> .
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en" . }
}`;

// Query 2: Dolmens that are heritage sites (P1435 = heritage designation)
const DOLMENS_HERITAGE_QUERY = `
SELECT DISTINCT ?site ?siteLabel ?siteDescription ?coord ?image ?wikipedia ?countryLabel WHERE {
  ?site wdt:P31 wd:Q180846 .  # dolmen
  ?site wdt:P625 ?coord .
  ?site wdt:P1435 ?heritage .  # Must be designated heritage
  OPTIONAL { ?site wdt:P17 ?country . }
  OPTIONAL { ?site wdt:P18 ?image . }
  OPTIONAL { ?wikipedia schema:about ?site ; schema:isPartOf <https://en.wikipedia.org/> . }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en" . }
}`;

// Query 3: Menhirs that are heritage sites
const MENHIRS_HERITAGE_QUERY = `
SELECT DISTINCT ?site ?siteLabel ?siteDescription ?coord ?image ?wikipedia ?countryLabel WHERE {
  ?site wdt:P31 wd:Q189539 .  # menhir
  ?site wdt:P625 ?coord .
  ?site wdt:P1435 ?heritage .  # Must be designated heritage
  OPTIONAL { ?site wdt:P17 ?country . }
  OPTIONAL { ?site wdt:P18 ?image . }
  OPTIONAL { ?wikipedia schema:about ?site ; schema:isPartOf <https://en.wikipedia.org/> . }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en" . }
}`;

// Query 4: Passage graves with Wikipedia
const PASSAGE_GRAVES_QUERY = `
SELECT DISTINCT ?site ?siteLabel ?siteDescription ?coord ?image ?wikipedia ?countryLabel WHERE {
  VALUES ?type { wd:Q2518569 wd:Q3574619 }
  ?site wdt:P31 ?type .
  ?site wdt:P625 ?coord .
  OPTIONAL { ?site wdt:P17 ?country . }
  OPTIONAL { ?site wdt:P18 ?image . }
  ?wikipedia schema:about ?site ; schema:isPartOf <https://en.wikipedia.org/> .
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en" . }
}`;

// Query 5: Chambered cairns with Wikipedia
const CAIRNS_WIKI_QUERY = `
SELECT DISTINCT ?site ?siteLabel ?siteDescription ?coord ?image ?wikipedia ?countryLabel WHERE {
  VALUES ?type { wd:Q816116 wd:Q1535671 }
  ?site wdt:P31 ?type .
  ?site wdt:P625 ?coord .
  OPTIONAL { ?site wdt:P17 ?country . }
  OPTIONAL { ?site wdt:P18 ?image . }
  ?wikipedia schema:about ?site ; schema:isPartOf <https://en.wikipedia.org/> .
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en" . }
}`;

// Query 6: Real nuraghi (only from Italy/Sardinia)
const NURAGHI_QUERY = `
SELECT DISTINCT ?site ?siteLabel ?siteDescription ?coord ?image ?wikipedia ?countryLabel WHERE {
  ?site wdt:P31 wd:Q2519340 .  # nuraghe
  ?site wdt:P625 ?coord .
  ?site wdt:P17 wd:Q38 .  # MUST be in Italy
  OPTIONAL { ?site wdt:P18 ?image . }
  ?wikipedia schema:about ?site ; schema:isPartOf <https://en.wikipedia.org/> .
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en" . }
}`;

const QUERIES = [
  { name: 'Stone circles (Wikipedia)', query: STONE_CIRCLES_QUERY, type: 'stone circle' },
  { name: 'Dolmens (Heritage)', query: DOLMENS_HERITAGE_QUERY, type: 'dolmen' },
  { name: 'Menhirs (Heritage)', query: MENHIRS_HERITAGE_QUERY, type: 'menhir' },
  { name: 'Passage graves (Wikipedia)', query: PASSAGE_GRAVES_QUERY, type: 'passage tomb' },
  { name: 'Chambered cairns (Wikipedia)', query: CAIRNS_WIKI_QUERY, type: 'chambered cairn' },
  { name: 'Nuraghi (Italy only)', query: NURAGHI_QUERY, type: 'nuraghe' },
];

// Garbage filter
const GARBAGE_PATTERNS = [
  /supermarket/i, /store/i, /market/i, /mall/i, /shop/i,
  /disney/i, /park$/i, /park /i, /land$/i, /world$/i,
  /hotel/i, /palace/i, /palazzo/i, /town hall/i, /prefecture/i,
  /church/i, /mosque/i, /synagogue/i, /cathedral/i,
  /museum/i, /center$/i, /centre$/i, /headquarters/i,
  /walmart/i, /tesco/i, /lidl/i, /aldi/i, /carrefour/i,
  /leclerc/i, /auchan/i, /rewe/i, /edeka/i, /casino$/i,
];

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
  if (match) return { lng: parseFloat(match[1]), lat: parseFloat(match[2]) };
  return null;
}

function slugify(name: string): string {
  return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').substring(0, 100);
}

function isGarbage(name: string, summary: string): boolean {
  const combined = (name + ' ' + summary).toLowerCase();
  return GARBAGE_PATTERNS.some(p => p.test(combined));
}

async function fetchQuery(query: string, name: string): Promise<WikidataResult[]> {
  const url = `${WIKIDATA_SPARQL_ENDPOINT}?query=${encodeURIComponent(query)}`;
  try {
    const response = await fetch(url, {
      headers: { 'Accept': 'application/sparql-results+json', 'User-Agent': 'MegalithicMapper/1.0' }
    });
    if (!response.ok) {
      console.log(`   ⚠️ ${name} failed: ${response.status}`);
      return [];
    }
    const data = await response.json();
    return data.results.bindings;
  } catch (error) {
    console.log(`   ⚠️ ${name} error: ${(error as Error).message}`);
    return [];
  }
}

async function main() {
  console.log('🔍 Fetching VERIFIED megalithic sites...\n');
  
  const allSites: MegalithicSite[] = [];
  const slugs = new Set<string>();
  const wikidataIds = new Set<string>();
  
  for (const { name, query, type } of QUERIES) {
    console.log(`📦 ${name}...`);
    const results = await fetchQuery(query, name);
    console.log(`   Found ${results.length} raw results`);
    
    let added = 0;
    for (const result of results) {
      const wikidataId = result.site.value.split('/').pop()!;
      if (wikidataIds.has(wikidataId)) continue;
      
      const siteName = result.siteLabel.value;
      if (siteName.startsWith('Q') && /^Q\d+$/.test(siteName)) continue;
      
      const summary = result.siteDescription?.value || '';
      if (isGarbage(siteName, summary)) continue;
      
      const coords = parseCoordinates(result.coord.value);
      if (!coords) continue;
      
      wikidataIds.add(wikidataId);
      
      let baseSlug = slugify(siteName);
      let slug = baseSlug;
      let counter = 1;
      while (slugs.has(slug)) { slug = `${baseSlug}-${counter}`; counter++; }
      slugs.add(slug);
      
      allSites.push({
        wikidata_id: wikidataId,
        slug,
        name: siteName,
        summary: summary || `${siteName} - a ${type}.`,
        site_type: type,
        category: 'site',
        coordinates: coords,
        layer: 'official',
        verification_status: 'verified',
        trust_tier: null,
        media_count: result.image ? 1 : 0,
        image_url: result.image?.value,
        wikipedia_url: result.wikipedia?.value,
        country: result.countryLabel?.value
      });
      added++;
    }
    console.log(`   ✅ Added ${added} valid sites`);
    
    await new Promise(r => setTimeout(r, 1500));
  }
  
  console.log(`\n📊 Total verified sites: ${allSites.length}`);
  
  // Stats
  const byCountry = new Map<string, number>();
  const byType = new Map<string, number>();
  allSites.forEach(s => {
    byCountry.set(s.country || 'Unknown', (byCountry.get(s.country || 'Unknown') || 0) + 1);
    byType.set(s.site_type, (byType.get(s.site_type) || 0) + 1);
  });
  
  console.log('\n📍 By country:');
  [...byCountry.entries()].sort((a,b) => b[1]-a[1]).slice(0,15).forEach(([c,n]) => console.log(`   ${c}: ${n}`));
  
  console.log('\n🏛️ By type:');
  [...byType.entries()].sort((a,b) => b[1]-a[1]).forEach(([t,n]) => console.log(`   ${t}: ${n}`));
  
  // Save
  const outputDir = path.join(__dirname, 'data');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  
  const outputPath = path.join(outputDir, 'verified-megaliths.json');
  fs.writeFileSync(outputPath, JSON.stringify({ sites: allSites }, null, 2));
  console.log(`\n💾 Saved to ${outputPath}`);
  
  const withImages = allSites.filter(s => s.image_url).length;
  const withWiki = allSites.filter(s => s.wikipedia_url).length;
  
  console.log('\n📈 Quality:');
  console.log(`   With images: ${withImages} (${Math.round(withImages/allSites.length*100)}%)`);
  console.log(`   With Wikipedia: ${withWiki} (${Math.round(withWiki/allSites.length*100)}%)`);
}

main();
