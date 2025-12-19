/**
 * Regenerate SQL from launch-dataset.json
 * 
 * Creates SQL files with thumbnail URLs from the enriched dataset
 * 
 * Usage: npx tsx scripts/data-gathering/regenerate-sql.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface Site {
  slug: string;
  name: string;
  summary: string;
  site_type: string;
  coordinates: { lat: number; lng: number };
  source: string;
  images?: { url: string; thumb_url: string }[];
  thumbnail?: string;
}

function sqlEscape(str: string): string {
  return str.replace(/'/g, "''");
}

async function main() {
  const dataPath = path.join(__dirname, 'data', 'launch-dataset.json');
  
  if (!fs.existsSync(dataPath)) {
    console.error('❌ Dataset not found:', dataPath);
    process.exit(1);
  }
  
  console.log('📖 Loading dataset...');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  const sites: Site[] = data.sites;
  
  console.log(`   Found ${sites.length} sites`);
  
  // Stats
  const sitesWithThumbnails = sites.filter(s => s.thumbnail);
  const totalImages = sites.reduce((sum, s) => sum + (s.images?.length || 0), 0);
  console.log(`   ${sitesWithThumbnails.length} sites with thumbnails`);
  console.log(`   ${totalImages} total images\n`);
  
  // Generate SQL for new (wikidata) sites
  const newSites = sites.filter(s => s.source === 'wikidata');
  
  if (newSites.length > 0) {
    const sqlLines = newSites.map(s => {
      const coordsJson = `{"lat": ${s.coordinates.lat}, "lng": ${s.coordinates.lng}}`;
      const thumbnailValue = s.thumbnail ? `'${sqlEscape(s.thumbnail)}'` : 'NULL';
      const mediaCount = s.images?.length || 0;
      return `  ('${sqlEscape(s.slug)}', '${sqlEscape(s.name)}', '${sqlEscape(s.summary)}', '${sqlEscape(s.site_type)}', 'site', '${coordsJson}', 'official', 'verified', NULL, ${mediaCount}, ${thumbnailValue})`;
    });
    
    const newSitesWithImages = newSites.filter(s => s.thumbnail).length;
    const newSitesTotalImages = newSites.reduce((sum, s) => sum + (s.images?.length || 0), 0);
    
    const sqlContent = `-- Additional megalithic sites (verified)
-- Generated: ${new Date().toISOString()}
-- Includes: ${newSites.length} sites with ${newSitesTotalImages} images

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
    
    const sqlPath = path.join(__dirname, 'data', 'additional-sites.sql');
    fs.writeFileSync(sqlPath, sqlContent);
    console.log(`✅ Saved ${newSites.length} new sites (${newSitesWithImages} with thumbnails) to additional-sites.sql`);
  }
  
  // Generate SQL to update ALL sites with thumbnails
  if (sitesWithThumbnails.length > 0) {
    const updateLines = sitesWithThumbnails.map(s => 
      `UPDATE megalithic.sites SET thumbnail_url = '${sqlEscape(s.thumbnail!)}', media_count = ${s.images?.length || 0} WHERE slug = '${sqlEscape(s.slug)}';`
    );
    
    const updateSql = `-- Update thumbnails for all sites
-- Generated: ${new Date().toISOString()}
-- Updates ${sitesWithThumbnails.length} sites with thumbnail URLs

${updateLines.join('\n')}
`;
    
    const updatePath = path.join(__dirname, 'data', 'update-thumbnails.sql');
    fs.writeFileSync(updatePath, updateSql);
    console.log(`✅ Saved thumbnail updates for ${sitesWithThumbnails.length} sites to update-thumbnails.sql`);
  }
  
  console.log('\n📋 Files generated:');
  console.log('   data/additional-sites.sql - INSERT for new sites');
  console.log('   data/update-thumbnails.sql - UPDATE existing sites with thumbnails');
}

main().catch(console.error);
