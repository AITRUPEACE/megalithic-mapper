/**
 * Enrich megalithic sites with Wikipedia data
 * 
 * Fetches from Wikipedia REST API:
 * - Rich text summaries
 * - Thumbnail images
 * - Coordinates (verification)
 * - Article URLs
 * 
 * Usage: npx tsx scripts/data-gathering/enrich-wikipedia.ts [input-file]
 */

import * as fs from 'fs';
import * as path from 'path';

const WIKIPEDIA_API = 'https://en.wikipedia.org/api/rest_v1/page/summary';
const RATE_LIMIT_MS = 100; // Be nice to Wikipedia

interface WikipediaSummary {
  title: string;
  extract: string;
  extract_html?: string;
  description?: string;
  coordinates?: {
    lat: number;
    lon: number;
  };
  thumbnail?: {
    source: string;
    width: number;
    height: number;
  };
  originalimage?: {
    source: string;
    width: number;
    height: number;
  };
  content_urls?: {
    desktop: { page: string };
    mobile: { page: string };
  };
}

interface InputSite {
  slug: string;
  name: string;
  summary: string;
  site_type: string;
  coordinates: { lat: number; lng: number };
  wikipedia_url?: string;
  image_url?: string;
  [key: string]: unknown;
}

interface EnrichedSite extends InputSite {
  wikipedia_summary?: string;
  wikipedia_thumbnail?: string;
  wikipedia_image_full?: string;
  wikipedia_description?: string;
  wikipedia_verified_coords?: { lat: number; lng: number };
  enrichment_source: 'wikipedia' | 'none';
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function extractWikipediaTitle(url: string): string | null {
  const match = url.match(/wikipedia\.org\/wiki\/(.+?)(?:#|$)/);
  if (match) {
    return decodeURIComponent(match[1]).replace(/_/g, ' ');
  }
  return null;
}

async function fetchWikipediaSummary(title: string): Promise<WikipediaSummary | null> {
  try {
    const encodedTitle = encodeURIComponent(title.replace(/ /g, '_'));
    const url = `${WIKIPEDIA_API}/${encodedTitle}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'MegalithicMapper/1.0 (https://github.com/megalithic-mapper)',
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return null; // Article doesn't exist
      }
      throw new Error(`Wikipedia API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`  ⚠️ Failed to fetch "${title}":`, (error as Error).message);
    return null;
  }
}

async function searchWikipedia(siteName: string): Promise<string | null> {
  try {
    // Use Wikipedia search API to find relevant article
    const searchUrl = `https://en.wikipedia.org/w/api.php?` + new URLSearchParams({
      action: 'query',
      list: 'search',
      srsearch: `${siteName} megalith OR archaeology OR ancient`,
      srlimit: '5',
      format: 'json',
      origin: '*'
    });
    
    const response = await fetch(searchUrl);
    const data = await response.json();
    
    if (data.query?.search?.length > 0) {
      // Return the first result's title
      return data.query.search[0].title;
    }
    return null;
  } catch {
    return null;
  }
}

async function main() {
  // Determine input file
  const inputArg = process.argv[2];
  let inputPath: string;
  
  if (inputArg) {
    inputPath = path.isAbsolute(inputArg) ? inputArg : path.join(process.cwd(), inputArg);
  } else {
    // Default to wikidata sites
    inputPath = path.join(__dirname, 'data', 'wikidata-sites.json');
  }
  
  if (!fs.existsSync(inputPath)) {
    console.error(`❌ Input file not found: ${inputPath}`);
    console.log('\nUsage: npx tsx scripts/data-gathering/enrich-wikipedia.ts [input-file]');
    console.log('\nRun one of these first:');
    console.log('  npx tsx scripts/data-gathering/fetch-wikidata.ts');
    console.log('  npx tsx scripts/data-gathering/fetch-osm.ts');
    process.exit(1);
  }
  
  console.log(`📖 Reading ${inputPath}...`);
  const data = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
  const sites: InputSite[] = data.sites;
  
  console.log(`🔍 Processing ${sites.length} sites...`);
  
  // Prioritize sites that already have Wikipedia URLs
  const sitesWithWikipedia = sites.filter(s => s.wikipedia_url);
  const sitesWithoutWikipedia = sites.filter(s => !s.wikipedia_url);
  
  console.log(`   ${sitesWithWikipedia.length} sites have Wikipedia URLs`);
  console.log(`   ${sitesWithoutWikipedia.length} sites need search`);
  
  const enrichedSites: EnrichedSite[] = [];
  let enrichedCount = 0;
  let imageCount = 0;
  
  // Process sites with Wikipedia URLs first (faster, more reliable)
  console.log('\n📚 Enriching sites with known Wikipedia articles...');
  
  for (let i = 0; i < sitesWithWikipedia.length; i++) {
    const site = sitesWithWikipedia[i];
    const title = extractWikipediaTitle(site.wikipedia_url!);
    
    if (!title) {
      enrichedSites.push({ ...site, enrichment_source: 'none' });
      continue;
    }
    
    const wikiData = await fetchWikipediaSummary(title);
    await sleep(RATE_LIMIT_MS);
    
    if (wikiData) {
      const enriched: EnrichedSite = {
        ...site,
        summary: wikiData.extract || site.summary,
        wikipedia_summary: wikiData.extract,
        wikipedia_description: wikiData.description,
        wikipedia_thumbnail: wikiData.thumbnail?.source,
        wikipedia_image_full: wikiData.originalimage?.source,
        image_url: site.image_url || wikiData.originalimage?.source || wikiData.thumbnail?.source,
        enrichment_source: 'wikipedia'
      };
      
      if (wikiData.coordinates) {
        enriched.wikipedia_verified_coords = {
          lat: wikiData.coordinates.lat,
          lng: wikiData.coordinates.lon
        };
      }
      
      enrichedSites.push(enriched);
      enrichedCount++;
      if (enriched.image_url) imageCount++;
    } else {
      enrichedSites.push({ ...site, enrichment_source: 'none' });
    }
    
    // Progress
    if ((i + 1) % 50 === 0) {
      console.log(`   Processed ${i + 1}/${sitesWithWikipedia.length} (${enrichedCount} enriched)`);
    }
  }
  
  console.log(`\n✅ Enriched ${enrichedCount} sites with Wikipedia data`);
  
  // Optionally search for articles for sites without URLs (slower)
  const SEARCH_LIMIT = 100; // Limit how many to search
  
  if (sitesWithoutWikipedia.length > 0) {
    console.log(`\n🔎 Searching Wikipedia for top ${Math.min(SEARCH_LIMIT, sitesWithoutWikipedia.length)} unnamed sites...`);
    
    // Sort by name length (shorter names are more likely to be notable)
    const sortedSites = [...sitesWithoutWikipedia].sort((a, b) => a.name.length - b.name.length);
    
    for (let i = 0; i < Math.min(SEARCH_LIMIT, sortedSites.length); i++) {
      const site = sortedSites[i];
      
      // Skip generic names
      if (site.name.startsWith('Site ') || site.name.startsWith('osm-')) {
        enrichedSites.push({ ...site, enrichment_source: 'none' });
        continue;
      }
      
      const foundTitle = await searchWikipedia(site.name);
      await sleep(RATE_LIMIT_MS * 2); // More delay for searches
      
      if (foundTitle) {
        const wikiData = await fetchWikipediaSummary(foundTitle);
        await sleep(RATE_LIMIT_MS);
        
        if (wikiData && wikiData.extract) {
          const enriched: EnrichedSite = {
            ...site,
            summary: wikiData.extract,
            wikipedia_url: wikiData.content_urls?.desktop?.page,
            wikipedia_summary: wikiData.extract,
            wikipedia_description: wikiData.description,
            wikipedia_thumbnail: wikiData.thumbnail?.source,
            wikipedia_image_full: wikiData.originalimage?.source,
            image_url: wikiData.originalimage?.source || wikiData.thumbnail?.source,
            enrichment_source: 'wikipedia'
          };
          
          enrichedSites.push(enriched);
          enrichedCount++;
          if (enriched.image_url) imageCount++;
          continue;
        }
      }
      
      enrichedSites.push({ ...site, enrichment_source: 'none' });
      
      if ((i + 1) % 25 === 0) {
        console.log(`   Searched ${i + 1}/${Math.min(SEARCH_LIMIT, sortedSites.length)}`);
      }
    }
    
    // Add remaining sites without searching
    for (let i = SEARCH_LIMIT; i < sortedSites.length; i++) {
      enrichedSites.push({ ...sortedSites[i], enrichment_source: 'none' });
    }
  }
  
  // Save enriched data
  const outputDir = path.join(__dirname, 'data');
  const baseName = path.basename(inputPath, '.json');
  const outputPath = path.join(outputDir, `${baseName}-enriched.json`);
  
  fs.writeFileSync(outputPath, JSON.stringify({ sites: enrichedSites }, null, 2));
  console.log(`\n💾 Saved to ${outputPath}`);
  
  // Final stats
  const finalEnriched = enrichedSites.filter(s => s.enrichment_source === 'wikipedia').length;
  const finalWithImages = enrichedSites.filter(s => s.image_url).length;
  const finalWithSummaries = enrichedSites.filter(s => s.wikipedia_summary).length;
  
  console.log('\n📈 Final Statistics:');
  console.log(`   Total sites: ${enrichedSites.length}`);
  console.log(`   Enriched from Wikipedia: ${finalEnriched} (${Math.round(finalEnriched/enrichedSites.length*100)}%)`);
  console.log(`   With images: ${finalWithImages} (${Math.round(finalWithImages/enrichedSites.length*100)}%)`);
  console.log(`   With summaries: ${finalWithSummaries} (${Math.round(finalWithSummaries/enrichedSites.length*100)}%)`);
}

main().catch(console.error);
