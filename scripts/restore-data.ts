/**
 * Restore script for Megalithic Mapper data
 * 
 * Usage: npx tsx scripts/restore-data.ts ./backups/YYYY-MM-DDTHH-MM-SS
 * 
 * Restores data from a backup created by backup-data.ts.
 * Use this after schema migrations to re-seed the database.
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

// Tables to restore in order (respecting foreign keys)
const TABLES_TO_RESTORE = [
  'badges',           // No dependencies
  'zones',            // No dependencies
  // Note: profiles are created by auth trigger, skip
  'user_badges',      // Depends on profiles, badges
  'sites',            // Depends on zones
  'site_tags',        // Depends on sites
  'site_zones',       // Depends on sites, zones
  'media_assets',     // Depends on sites
  'posts',            // Depends on profiles, sites
  'comments',         // Depends on posts, profiles
  'reactions',        // Depends on posts, comments, profiles
  'follows',          // Depends on profiles
  'notifications',    // Depends on profiles
  'bookmarks',        // Depends on profiles, sites, posts
  'site_follows',     // Depends on profiles, sites
  'site_votes',       // Depends on profiles, sites
  // activity_feed is auto-generated, skip
];

interface TransformOptions {
  table: string;
  data: any[];
}

// Transform data if schema changed
function transformData({ table, data }: TransformOptions): any[] {
  return data.map(row => {
    // Add any transformations needed for new schema
    switch (table) {
      case 'sites':
        return {
          ...row,
          // Add new columns with defaults if missing
          votes_approve: row.votes_approve ?? 0,
          votes_reject: row.votes_reject ?? 0,
          votes_needs_info: row.votes_needs_info ?? 0,
          created_by: row.created_by ?? row.updated_by,
          created_at: row.created_at ?? row.updated_at,
        };
      
      case 'posts':
        return {
          ...row,
          // Add external_links if missing
          external_links: row.external_links ?? [],
        };
      
      default:
        return row;
    }
  });
}

async function restoreTable(tableName: string, data: any[]): Promise<void> {
  if (data.length === 0) {
    console.log(`  Skipping ${tableName} (empty)`);
    return;
  }
  
  console.log(`  Restoring ${tableName} (${data.length} rows)...`);
  
  // Transform data for any schema changes
  const transformedData = transformData({ table: tableName, data });
  
  // Insert in batches of 100
  const batchSize = 100;
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < transformedData.length; i += batchSize) {
    const batch = transformedData.slice(i, i + batchSize);
    
    const { error } = await supabase
      .from(tableName)
      .upsert(batch, { 
        onConflict: 'id',
        ignoreDuplicates: false 
      });
    
    if (error) {
      console.warn(`    Warning: Batch ${i / batchSize + 1} failed: ${error.message}`);
      errorCount += batch.length;
    } else {
      successCount += batch.length;
    }
  }
  
  if (errorCount > 0) {
    console.log(`  ⚠ ${tableName}: ${successCount} succeeded, ${errorCount} failed`);
  } else {
    console.log(`  ✓ ${tableName}: ${successCount} rows restored`);
  }
}

async function main() {
  const backupDir = process.argv[2];
  
  if (!backupDir) {
    console.error('Usage: npx tsx scripts/restore-data.ts ./backups/YYYY-MM-DDTHH-MM-SS');
    process.exit(1);
  }
  
  // Check backup exists
  if (!fs.existsSync(backupDir)) {
    console.error(`Backup directory not found: ${backupDir}`);
    process.exit(1);
  }
  
  // Read metadata
  const metadataPath = path.join(backupDir, '_metadata.json');
  if (!fs.existsSync(metadataPath)) {
    console.error('Invalid backup: _metadata.json not found');
    process.exit(1);
  }
  
  const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
  
  console.log('='.repeat(60));
  console.log('Megalithic Mapper Data Restore');
  console.log('='.repeat(60));
  console.log(`Backup timestamp: ${metadata.timestamp}`);
  console.log(`Source URL: ${metadata.supabaseUrl}`);
  console.log(`Target URL: ${supabaseUrl}`);
  console.log('');
  
  // Confirm if different URLs
  if (metadata.supabaseUrl !== supabaseUrl) {
    console.log('WARNING: Backup is from a different Supabase instance!');
    console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...');
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  
  // Load all data
  const allDataPath = path.join(backupDir, '_all_tables.json');
  const allData = JSON.parse(fs.readFileSync(allDataPath, 'utf-8'));
  
  console.log('Restoring tables...');
  console.log('');
  
  // Restore in order
  for (const table of TABLES_TO_RESTORE) {
    const data = allData[table] || [];
    await restoreTable(table, data);
  }
  
  console.log('');
  console.log('='.repeat(60));
  console.log('Restore complete!');
  console.log('='.repeat(60));
  console.log('');
  console.log('Note: Activity feed entries are auto-generated by triggers.');
  console.log('You may need to run migrations to regenerate them:');
  console.log('  SELECT megalithic.update_feed_engagement_scores();');
}

main().catch(console.error);



