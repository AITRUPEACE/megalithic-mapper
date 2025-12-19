/**
 * Merge megalithic site data from multiple sources
 * 
 * Combines and deduplicates sites from:
 * - Wikidata
 * - OpenStreetMap
 * - Manual curation
 * 
 * Usage: npx tsx scripts/data-gathering/merge-sources.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface Site {
  slug: string;
  name: string;
  summary: string;
  site_type: string;
  category: 'site';
  coordinates: { lat: number; lng: number };
  layer: 'official';
  verification_status: 'verified';
  trust_tier: null | 'promoted';
  media_count: number;
  image_url?: string;
  wikipedia_url?: string;
  wikidata_id?: string;
  osm_id?: string;
  country?: string;
  source: 'wikidata' | 'osm' | 'manual' | 'merged';
  [key: string]: unknown;
}

interface SourceFile {
  sites: Site[];
}

// Haversine distance in meters
function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}

// Normalize site name for comparison
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
    .replace(/^(the|le|la|les|el|los|das|die|der)/i, '');
}

// Score a site for quality (higher is better)
function scoreSite(site: Site): number {
  let score = 0;
  
  // Has image
  if (site.image_url) score += 20;
  
  // Has Wikipedia
  if (site.wikipedia_url) score += 15;
  
  // Has Wikidata (structured data source)
  if (site.wikidata_id) score += 10;
  
  // Has good summary (not generic)
  if (site.summary && site.summary.length > 50 && !site.summary.includes('a megalithic site.')) {
    score += 15;
  }
  
  // Has proper name (not generic)
  if (site.name && !site.name.startsWith('Site ') && !site.name.startsWith('osm-')) {
    score += 10;
  }
  
  // Source preference
  if (site.source === 'wikidata') score += 5;
  if (site.source === 'manual') score += 8;
  
  return score;
}

// Merge two sites, keeping the best data from each
function mergeSites(primary: Site, secondary: Site): Site {
  const merged: Site = { ...primary };
  
  // Keep the better summary
  if (!merged.summary || merged.summary.includes('a megalithic site.')) {
    if (secondary.summary && !secondary.summary.includes('a megalithic site.')) {
      merged.summary = secondary.summary;
    }
  }
  
  // Keep image if missing
  if (!merged.image_url && secondary.image_url) {
    merged.image_url = secondary.image_url;
  }
  
  // Keep wikipedia if missing
  if (!merged.wikipedia_url && secondary.wikipedia_url) {
    merged.wikipedia_url = secondary.wikipedia_url;
  }
  
  // Keep wikidata_id
  if (!merged.wikidata_id && secondary.wikidata_id) {
    merged.wikidata_id = secondary.wikidata_id;
  }
  
  // Keep osm_id
  if (!merged.osm_id && secondary.osm_id) {
    merged.osm_id = secondary.osm_id;
  }
  
  // Keep country
  if (!merged.country && secondary.country) {
    merged.country = secondary.country;
  }
  
  merged.source = 'merged';
  
  return merged;
}

async function main() {
  const dataDir = path.join(__dirname, 'data');
  
  // Check what source files exist
  const wikidataPath = path.join(dataDir, 'wikidata-sites.json');
  const wikidataEnrichedPath = path.join(dataDir, 'wikidata-sites-enriched.json');
  const osmPath = path.join(dataDir, 'osm-sites.json');
  
  const sources: { name: string; sites: Site[] }[] = [];
  
  // Load Wikidata (prefer enriched version)
  if (fs.existsSync(wikidataEnrichedPath)) {
    console.log('📖 Loading enriched Wikidata sites...');
    const data: SourceFile = JSON.parse(fs.readFileSync(wikidataEnrichedPath, 'utf-8'));
    sources.push({ name: 'wikidata', sites: data.sites.map(s => ({ ...s, source: 'wikidata' as const })) });
  } else if (fs.existsSync(wikidataPath)) {
    console.log('📖 Loading Wikidata sites...');
    const data: SourceFile = JSON.parse(fs.readFileSync(wikidataPath, 'utf-8'));
    sources.push({ name: 'wikidata', sites: data.sites.map(s => ({ ...s, source: 'wikidata' as const })) });
  }
  
  // Load OSM
  if (fs.existsSync(osmPath)) {
    console.log('📖 Loading OSM sites...');
    const data: SourceFile = JSON.parse(fs.readFileSync(osmPath, 'utf-8'));
    sources.push({ name: 'osm', sites: data.sites.map(s => ({ ...s, source: 'osm' as const })) });
  }
  
  if (sources.length === 0) {
    console.error('❌ No source files found in data directory.');
    console.log('\nRun these scripts first:');
    console.log('  npx tsx scripts/data-gathering/fetch-wikidata.ts');
    console.log('  npx tsx scripts/data-gathering/fetch-osm.ts');
    process.exit(1);
  }
  
  // Log what we're working with
  console.log('\n📊 Sources loaded:');
  for (const source of sources) {
    console.log(`   ${source.name}: ${source.sites.length} sites`);
  }
  
  // Combine all sites
  const allSites: Site[] = [];
  for (const source of sources) {
    allSites.push(...source.sites);
  }
  
  console.log(`\n🔍 Processing ${allSites.length} total sites...`);
  
  // Sort by quality score (best first)
  allSites.sort((a, b) => scoreSite(b) - scoreSite(a));
  
  // Deduplicate by proximity and name similarity
  const PROXIMITY_THRESHOLD = 100; // meters
  const merged: Site[] = [];
  const usedIndices = new Set<number>();
  
  for (let i = 0; i < allSites.length; i++) {
    if (usedIndices.has(i)) continue;
    
    const site = allSites[i];
    usedIndices.add(i);
    
    // Find potential duplicates
    const duplicates: number[] = [];
    const normalizedName = normalizeName(site.name);
    
    for (let j = i + 1; j < allSites.length; j++) {
      if (usedIndices.has(j)) continue;
      
      const other = allSites[j];
      
      // Check proximity
      const distance = haversineDistance(
        site.coordinates.lat, site.coordinates.lng,
        other.coordinates.lat, other.coordinates.lng
      );
      
      if (distance < PROXIMITY_THRESHOLD) {
        // Check name similarity
        const otherNormalized = normalizeName(other.name);
        
        // Same name or very similar
        if (normalizedName === otherNormalized ||
            normalizedName.includes(otherNormalized) ||
            otherNormalized.includes(normalizedName)) {
          duplicates.push(j);
          usedIndices.add(j);
        }
        // Even without name match, if within 50m, likely same site
        else if (distance < 50) {
          duplicates.push(j);
          usedIndices.add(j);
        }
      }
    }
    
    // Merge duplicates into primary site
    let finalSite = site;
    for (const dupIndex of duplicates) {
      finalSite = mergeSites(finalSite, allSites[dupIndex]);
    }
    
    merged.push(finalSite);
    
    // Progress
    if (merged.length % 500 === 0) {
      console.log(`   Processed ${merged.length} merged sites...`);
    }
  }
  
  console.log(`\n✅ Merged to ${merged.length} unique sites`);
  
  // Regenerate unique slugs
  const slugs = new Set<string>();
  for (const site of merged) {
    let baseSlug = site.slug;
    let slug = baseSlug;
    let counter = 1;
    while (slugs.has(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    slugs.add(slug);
    site.slug = slug;
  }
  
  // Analyze merged dataset
  const withImages = merged.filter(s => s.image_url).length;
  const withWikipedia = merged.filter(s => s.wikipedia_url).length;
  const withGoodSummaries = merged.filter(s => s.summary && s.summary.length > 50 && !s.summary.includes('a megalithic site.')).length;
  
  console.log('\n📈 Merged Dataset Statistics:');
  console.log(`   Total unique sites: ${merged.length}`);
  console.log(`   With images: ${withImages} (${Math.round(withImages/merged.length*100)}%)`);
  console.log(`   With Wikipedia: ${withWikipedia} (${Math.round(withWikipedia/merged.length*100)}%)`);
  console.log(`   With good summaries: ${withGoodSummaries} (${Math.round(withGoodSummaries/merged.length*100)}%)`);
  
  // Sites by type
  const byType = new Map<string, number>();
  for (const site of merged) {
    byType.set(site.site_type, (byType.get(site.site_type) || 0) + 1);
  }
  
  console.log('\n🏛️ By site type:');
  const sortedTypes = [...byType.entries()].sort((a, b) => b[1] - a[1]);
  for (const [type, count] of sortedTypes.slice(0, 10)) {
    console.log(`   ${type}: ${count}`);
  }
  
  // Save merged data
  const outputPath = path.join(dataDir, 'merged-sites.json');
  fs.writeFileSync(outputPath, JSON.stringify({ sites: merged }, null, 2));
  console.log(`\n💾 Saved merged data to ${outputPath}`);
  
  // Create import-ready file (just the fields needed for database)
  const importReady = merged.map(site => ({
    slug: site.slug,
    name: site.name,
    summary: site.summary,
    site_type: site.site_type,
    category: 'site',
    coordinates: site.coordinates,
    layer: 'official',
    verification_status: 'verified',
    trust_tier: null,
    media_count: site.image_url ? 1 : 0
  }));
  
  const importPath = path.join(dataDir, 'import-ready.json');
  fs.writeFileSync(importPath, JSON.stringify({ sites: importReady }, null, 2));
  console.log(`📦 Saved import-ready data to ${importPath}`);
  
  // Create separate media file
  const media = merged
    .filter(s => s.image_url)
    .map(s => ({
      site_slug: s.slug,
      url: s.image_url,
      type: 'image',
      source: s.wikipedia_url ? 'wikipedia' : 'wikimedia_commons',
      is_primary: true
    }));
  
  const mediaPath = path.join(dataDir, 'media-import.json');
  fs.writeFileSync(mediaPath, JSON.stringify({ media }, null, 2));
  console.log(`🖼️ Saved media data to ${mediaPath}`);
}

main().catch(console.error);
