/**
 * Import Sites Script
 * 
 * Imports megalithic site data from JSON files into Supabase.
 * 
 * Usage:
 *   npx tsx scripts/data-gathering/import-sites.ts ./data/new-sites.json
 *   npx tsx scripts/data-gathering/import-sites.ts ./data/*.json --dry-run
 * 
 * Options:
 *   --dry-run    Validate without importing
 *   --force      Skip confirmation prompts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Types
interface Coordinates {
  lat: number;
  lng: number;
}

interface SiteInput {
  slug: string;
  name: string;
  summary: string;
  site_type: string;
  category?: string;
  coordinates: Coordinates;
  layer?: 'official' | 'community';
  verification_status?: 'verified' | 'under_review' | 'community';
  trust_tier?: string | null;
  media_count?: number;
  tags?: {
    culture?: string[];
    era?: string[];
    theme?: string[];
  };
  external_links?: {
    wikipedia?: string;
    wikimedia_commons?: string;
    unesco?: string;
    official?: string;
  };
}

interface ImportFile {
  sites: SiteInput[];
  tags?: Record<string, { culture?: string[]; era?: string[]; theme?: string[] }>;
}

// Initialize Supabase client
function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  }

  return createClient(supabaseUrl, supabaseKey);
}

// Validate a single site
function validateSite(site: SiteInput, index: number): string[] {
  const errors: string[] = [];
  const prefix = `Site ${index + 1} (${site.slug || 'no slug'})`;

  if (!site.slug || typeof site.slug !== 'string') {
    errors.push(`${prefix}: Missing or invalid slug`);
  } else if (!/^[a-z0-9-]+$/.test(site.slug)) {
    errors.push(`${prefix}: Slug must be lowercase with dashes only`);
  }

  if (!site.name || typeof site.name !== 'string') {
    errors.push(`${prefix}: Missing or invalid name`);
  }

  if (!site.summary || typeof site.summary !== 'string') {
    errors.push(`${prefix}: Missing or invalid summary`);
  } else if (site.summary.length < 50) {
    errors.push(`${prefix}: Summary too short (min 50 chars)`);
  }

  if (!site.site_type || typeof site.site_type !== 'string') {
    errors.push(`${prefix}: Missing or invalid site_type`);
  }

  if (!site.coordinates || typeof site.coordinates !== 'object') {
    errors.push(`${prefix}: Missing coordinates`);
  } else {
    if (typeof site.coordinates.lat !== 'number' || site.coordinates.lat < -90 || site.coordinates.lat > 90) {
      errors.push(`${prefix}: Invalid latitude (must be -90 to 90)`);
    }
    if (typeof site.coordinates.lng !== 'number' || site.coordinates.lng < -180 || site.coordinates.lng > 180) {
      errors.push(`${prefix}: Invalid longitude (must be -180 to 180)`);
    }
  }

  return errors;
}

// Load and parse JSON file
function loadJsonFile(filePath: string): ImportFile {
  const absolutePath = path.resolve(filePath);
  
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`File not found: ${absolutePath}`);
  }

  const content = fs.readFileSync(absolutePath, 'utf-8');
  return JSON.parse(content);
}

// Import sites to Supabase
async function importSites(sites: SiteInput[], dryRun: boolean = false) {
  const supabase = getSupabaseClient();
  const results = {
    inserted: 0,
    updated: 0,
    failed: 0,
    errors: [] as string[],
  };

  for (const site of sites) {
    const siteData = {
      slug: site.slug,
      name: site.name,
      summary: site.summary,
      site_type: site.site_type,
      category: site.category || 'site',
      coordinates: site.coordinates,
      layer: site.layer || 'official',
      verification_status: site.verification_status || 'verified',
      trust_tier: site.trust_tier || null,
      media_count: site.media_count || 0,
    };

    if (dryRun) {
      console.log(`[DRY RUN] Would upsert: ${site.slug}`);
      results.inserted++;
      continue;
    }

    // Upsert site
    const { data, error } = await supabase
      .from('sites')
      .upsert(siteData, { onConflict: 'slug' })
      .select('id')
      .single();

    if (error) {
      results.failed++;
      results.errors.push(`${site.slug}: ${error.message}`);
      continue;
    }

    results.inserted++;

    // Insert tags if provided
    if (site.tags && data?.id) {
      const tagInserts = [];

      for (const [tagType, tags] of Object.entries(site.tags)) {
        for (const tag of tags || []) {
          tagInserts.push({
            site_id: data.id,
            tag: tag,
            tag_type: tagType,
          });
        }
      }

      if (tagInserts.length > 0) {
        const { error: tagError } = await supabase
          .from('site_tags')
          .upsert(tagInserts, { onConflict: 'site_id,tag,tag_type', ignoreDuplicates: true });

        if (tagError) {
          console.warn(`  Warning: Could not insert tags for ${site.slug}: ${tagError.message}`);
        }
      }
    }

    console.log(`  ✓ Imported: ${site.slug}`);
  }

  return results;
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const force = args.includes('--force');
  const files = args.filter(arg => !arg.startsWith('--'));

  if (files.length === 0) {
    console.log(`
Usage: npx tsx scripts/data-gathering/import-sites.ts <file.json> [options]

Options:
  --dry-run    Validate without importing
  --force      Skip confirmation prompts

Example:
  npx tsx scripts/data-gathering/import-sites.ts ./data/british-sites.json
  npx tsx scripts/data-gathering/import-sites.ts ./data/*.json --dry-run
`);
    process.exit(1);
  }

  console.log('\n=== Megalithic Sites Import ===\n');
  console.log(`Mode: ${dryRun ? 'DRY RUN (no changes)' : 'LIVE IMPORT'}`);
  console.log(`Files: ${files.length}\n`);

  let allSites: SiteInput[] = [];
  let allErrors: string[] = [];

  // Load and validate all files
  for (const file of files) {
    console.log(`Loading: ${file}`);
    
    try {
      const data = loadJsonFile(file);
      
      if (!data.sites || !Array.isArray(data.sites)) {
        allErrors.push(`${file}: Missing 'sites' array`);
        continue;
      }

      // Validate each site
      for (let i = 0; i < data.sites.length; i++) {
        const site = data.sites[i];
        const errors = validateSite(site, i);
        
        if (errors.length > 0) {
          allErrors.push(...errors);
        } else {
          // Merge tags from separate tags object if present
          if (data.tags && data.tags[site.slug]) {
            site.tags = { ...site.tags, ...data.tags[site.slug] };
          }
          allSites.push(site);
        }
      }

      console.log(`  Found ${data.sites.length} sites`);
    } catch (err) {
      allErrors.push(`${file}: ${(err as Error).message}`);
    }
  }

  console.log(`\nTotal sites to import: ${allSites.length}`);

  // Report validation errors
  if (allErrors.length > 0) {
    console.log(`\n❌ Validation Errors (${allErrors.length}):`);
    for (const error of allErrors) {
      console.log(`  - ${error}`);
    }

    if (!force && !dryRun) {
      console.log('\nFix errors or use --force to skip invalid entries.');
      process.exit(1);
    }
  }

  if (allSites.length === 0) {
    console.log('\nNo valid sites to import.');
    process.exit(0);
  }

  // Confirm import
  if (!dryRun && !force) {
    console.log('\nProceed with import? (Ctrl+C to cancel, Enter to continue)');
    await new Promise(resolve => {
      process.stdin.once('data', resolve);
    });
  }

  // Import
  console.log('\nImporting...\n');
  const results = await importSites(allSites, dryRun);

  // Summary
  console.log('\n=== Import Summary ===');
  console.log(`  Inserted/Updated: ${results.inserted}`);
  console.log(`  Failed: ${results.failed}`);

  if (results.errors.length > 0) {
    console.log('\nErrors:');
    for (const error of results.errors) {
      console.log(`  - ${error}`);
    }
  }

  console.log('\nDone!');
}

main().catch(console.error);








