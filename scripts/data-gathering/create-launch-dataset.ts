/**
 * Create Launch Dataset
 * 
 * Merges:
 * 1. Existing hand-curated seed sites (100+ sites)
 * 2. Verified Wikidata sites (92 sites)
 * 
 * Deduplicates by name/coordinates and outputs a clean SQL file
 * 
 * Usage: npx tsx scripts/data-gathering/create-launch-dataset.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface SiteImage {
  url: string;
  thumb_url: string;
  title: string;
  license?: string;
  author?: string;
  width: number;
  height: number;
}

interface Site {
  slug: string;
  name: string;
  summary: string;
  site_type: string;
  coordinates: { lat: number; lng: number };
  image_url?: string;
  wikipedia_url?: string;
  country?: string;
  source: 'seed' | 'wikidata';
  images?: SiteImage[];
  thumbnail?: string;
}

// Parse the existing seed SQL file
function parseSeedSQL(sqlContent: string): Site[] {
  const sites: Site[] = [];
  
  // Match each site row - format: ('slug', 'name', 'summary', 'site_type', 'category', '{"lat": X, "lng": Y}', 'layer', 'status', ...)
  // Handle multi-line and comments
  const siteRegex = /\('([^']+)',\s*'([^']+)',\s*'((?:[^']|'')*)',\s*'([^']+)',\s*'site',\s*'\{"lat":\s*([\d.-]+),\s*"lng":\s*([\d.-]+)\}'/g;
  
  let match;
  while ((match = siteRegex.exec(sqlContent)) !== null) {
    const [, slug, name, summary, site_type, lat, lng] = match;
    sites.push({
      slug,
      name,
      summary: summary.replace(/''/g, "'"), // Unescape SQL quotes
      site_type,
      coordinates: { lat: parseFloat(lat), lng: parseFloat(lng) },
      source: 'seed'
    });
  }
  
  return sites;
}

// Haversine distance in meters
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// Normalize name for comparison
function normalizeName(name: string): string {
  return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
}

// Escape string for SQL
function sqlEscape(str: string): string {
  return str.replace(/'/g, "''");
}

async function main() {
  const dataDir = path.join(__dirname, 'data');
  const seedPath = path.join(__dirname, '../../supabase/seed/megalithic_sites_100.sql');
  const wikidataPath = path.join(dataDir, 'verified-megaliths.json');
  
  // Check files exist
  if (!fs.existsSync(seedPath)) {
    console.error('❌ Seed file not found:', seedPath);
    process.exit(1);
  }
  
  if (!fs.existsSync(wikidataPath)) {
    console.error('❌ Wikidata file not found. Run: npx tsx scripts/data-gathering/fetch-verified-megaliths.ts');
    process.exit(1);
  }
  
  console.log('📖 Loading existing seed sites...');
  const seedSQL = fs.readFileSync(seedPath, 'utf-8');
  const seedSites = parseSeedSQL(seedSQL);
  console.log(`   Found ${seedSites.length} seed sites`);
  
  console.log('📖 Loading verified Wikidata sites...');
  const wikidataData = JSON.parse(fs.readFileSync(wikidataPath, 'utf-8'));
  const wikidataSites: Site[] = wikidataData.sites.map((s: any) => ({
    ...s,
    source: 'wikidata' as const
  }));
  console.log(`   Found ${wikidataSites.length} Wikidata sites`);
  
  // Create lookup maps for deduplication
  const seedByNormalizedName = new Map<string, Site>();
  const seedCoords: { lat: number; lng: number; site: Site }[] = [];
  
  for (const site of seedSites) {
    seedByNormalizedName.set(normalizeName(site.name), site);
    seedCoords.push({ lat: site.coordinates.lat, lng: site.coordinates.lng, site });
  }
  
  // Merge: add Wikidata sites that aren't duplicates
  const merged: Site[] = [...seedSites];
  const usedSlugs = new Set(seedSites.map(s => s.slug));
  let duplicates = 0;
  let added = 0;
  
  for (const wdSite of wikidataSites) {
    const normalizedName = normalizeName(wdSite.name);
    
    // Check name match
    if (seedByNormalizedName.has(normalizedName)) {
      duplicates++;
      continue;
    }
    
    // Check coordinate proximity (within 500m)
    const isDuplicate = seedCoords.some(sc => 
      haversineDistance(sc.lat, sc.lng, wdSite.coordinates.lat, wdSite.coordinates.lng) < 500
    );
    
    if (isDuplicate) {
      duplicates++;
      continue;
    }
    
    // Generate unique slug
    let slug = wdSite.slug;
    let counter = 1;
    while (usedSlugs.has(slug)) {
      slug = `${wdSite.slug}-${counter}`;
      counter++;
    }
    usedSlugs.add(slug);
    
    merged.push({ ...wdSite, slug });
    added++;
  }
  
  console.log(`\n🔀 Merge results:`);
  console.log(`   Seed sites: ${seedSites.length}`);
  console.log(`   Wikidata sites: ${wikidataSites.length}`);
  console.log(`   Duplicates skipped: ${duplicates}`);
  console.log(`   New sites added: ${added}`);
  console.log(`   Total merged: ${merged.length}`);
  
  // Stats
  const byType = new Map<string, number>();
  const byCountry = new Map<string, number>();
  const bySource = new Map<string, number>();
  
  merged.forEach(s => {
    byType.set(s.site_type, (byType.get(s.site_type) || 0) + 1);
    byCountry.set(s.country || 'Unknown', (byCountry.get(s.country || 'Unknown') || 0) + 1);
    bySource.set(s.source, (bySource.get(s.source) || 0) + 1);
  });
  
  console.log('\n📊 By source:');
  [...bySource.entries()].forEach(([s, n]) => console.log(`   ${s}: ${n}`));
  
  console.log('\n🏛️ By type (top 10):');
  [...byType.entries()].sort((a,b) => b[1]-a[1]).slice(0,10).forEach(([t, n]) => console.log(`   ${t}: ${n}`));
  
  console.log('\n📍 By country (top 15):');
  [...byCountry.entries()].sort((a,b) => b[1]-a[1]).slice(0,15).forEach(([c, n]) => console.log(`   ${c}: ${n}`));
  
  // Save merged JSON
  const jsonPath = path.join(dataDir, 'launch-dataset.json');
  fs.writeFileSync(jsonPath, JSON.stringify({ sites: merged }, null, 2));
  console.log(`\n💾 Saved JSON to ${jsonPath}`);
  
  // Generate SQL for new sites only (to append to seed)
  const newSites = merged.filter(s => s.source === 'wikidata');
  
  if (newSites.length > 0) {
    const sqlLines = newSites.map(s => {
      const coordsJson = `{"lat": ${s.coordinates.lat}, "lng": ${s.coordinates.lng}}`;
      const thumbnailValue = s.thumbnail ? `'${sqlEscape(s.thumbnail)}'` : 'NULL';
      const mediaCount = s.images?.length || (s.image_url ? 1 : 0);
      return `  ('${sqlEscape(s.slug)}', '${sqlEscape(s.name)}', '${sqlEscape(s.summary)}', '${sqlEscape(s.site_type)}', 'site', '${coordsJson}', 'official', 'verified', NULL, ${mediaCount}, ${thumbnailValue})`;
    });
    
    // Count sites with images
    const sitesWithImages = newSites.filter(s => s.thumbnail).length;
    const totalImages = newSites.reduce((sum, s) => sum + (s.images?.length || 0), 0);
    
    const sqlContent = `-- Additional megalithic sites (verified)
-- Generated: ${new Date().toISOString()}
-- Includes: ${newSites.length} sites with ${totalImages} images

INSERT INTO megalithic.sites (slug, name, summary, site_type, category, coordinates, layer, verification_status, trust_tier, media_count, thumbnail_url)
VALUES
${sqlLines.join(',\n')}
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  summary = EXCLUDED.summary,
  site_type = EXCLUDED.site_type,
  coordinates = EXCLUDED.coordinates,
  verification_status = EXCLUDED.verification_status,
  media_count = EXCLUDED.media_count,
  thumbnail_url = EXCLUDED.thumbnail_url,
  updated_at = timezone('utc', now());
`;
    
    const sqlPath = path.join(dataDir, 'additional-sites.sql');
    fs.writeFileSync(sqlPath, sqlContent);
    console.log(`📝 Saved SQL for ${newSites.length} new sites (${sitesWithImages} with thumbnails) to ${sqlPath}`);
  }
  
  // Also generate SQL to update ALL sites with thumbnails (including seed sites)
  const sitesWithThumbnails = merged.filter(s => s.thumbnail);
  if (sitesWithThumbnails.length > 0) {
    const updateLines = sitesWithThumbnails.map(s => 
      `  UPDATE megalithic.sites SET thumbnail_url = '${sqlEscape(s.thumbnail!)}', media_count = ${s.images?.length || 0} WHERE slug = '${sqlEscape(s.slug)}';`
    );
    
    const updateSql = `-- Update thumbnails for all sites
-- Generated: ${new Date().toISOString()}
-- Updates ${sitesWithThumbnails.length} sites with thumbnail URLs

${updateLines.join('\n')}
`;
    
    const updatePath = path.join(dataDir, 'update-thumbnails.sql');
    fs.writeFileSync(updatePath, updateSql);
    console.log(`📝 Saved thumbnail updates for ${sitesWithThumbnails.length} sites to ${updatePath}`);
  }
  
  // Generate CSV for review
  const csvHeader = 'slug,name,site_type,lat,lng,country,source,has_image\n';
  const csvRows = merged.map(s => 
    `"${s.slug}","${s.name.replace(/"/g, '""')}","${s.site_type}",${s.coordinates.lat},${s.coordinates.lng},"${s.country || ''}","${s.source}","${s.image_url ? 'yes' : 'no'}"`
  ).join('\n');
  
  const csvPath = path.join(dataDir, 'launch-dataset.csv');
  fs.writeFileSync(csvPath, csvHeader + csvRows);
  console.log(`📄 Saved CSV to ${csvPath}`);
  
  console.log('\n✅ Done! Launch dataset ready.');
  console.log(`\n📋 Next steps:`);
  console.log(`   1. Review: ${csvPath}`);
  console.log(`   2. Import new sites: psql -f ${path.join(dataDir, 'additional-sites.sql')}`);
}

main().catch(console.error);
