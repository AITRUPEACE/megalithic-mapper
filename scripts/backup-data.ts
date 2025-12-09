/**
 * Backup script for Megalithic Mapper data
 * 
 * Usage: npx tsx scripts/backup-data.ts
 * 
 * Creates a timestamped backup directory with JSON exports of all tables.
 * Use this before any schema migrations that might require re-seeding.
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  console.error('Set these in your .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

// Tables to backup in order (respecting foreign keys)
const TABLES_TO_BACKUP = [
  'profiles',
  'badges',
  'user_badges',
  'zones',
  'sites',
  'site_tags',
  'site_zones',
  'media_assets',
  'posts',
  'comments',
  'reactions',
  'follows',
  'notifications',
  'bookmarks',
  'site_follows',
  'site_votes',
  'activity_feed',
];

async function backupTable(tableName: string): Promise<any[]> {
  console.log(`  Backing up ${tableName}...`);
  
  const { data, error } = await supabase
    .from(tableName)
    .select('*');
  
  if (error) {
    console.warn(`  Warning: Could not backup ${tableName}: ${error.message}`);
    return [];
  }
  
  console.log(`  ✓ ${tableName}: ${data?.length || 0} rows`);
  return data || [];
}

async function main() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const backupDir = path.join(process.cwd(), 'backups', timestamp);
  
  console.log('='.repeat(60));
  console.log('Megalithic Mapper Data Backup');
  console.log('='.repeat(60));
  console.log(`Backup directory: ${backupDir}`);
  console.log('');
  
  // Create backup directory
  fs.mkdirSync(backupDir, { recursive: true });
  
  const allData: Record<string, any[]> = {};
  
  // Backup each table
  for (const table of TABLES_TO_BACKUP) {
    const data = await backupTable(table);
    allData[table] = data;
    
    // Save individual table file
    fs.writeFileSync(
      path.join(backupDir, `${table}.json`),
      JSON.stringify(data, null, 2)
    );
  }
  
  // Save combined backup
  fs.writeFileSync(
    path.join(backupDir, '_all_tables.json'),
    JSON.stringify(allData, null, 2)
  );
  
  // Save metadata
  const metadata = {
    timestamp,
    supabaseUrl,
    tables: TABLES_TO_BACKUP,
    rowCounts: Object.fromEntries(
      Object.entries(allData).map(([table, rows]) => [table, rows.length])
    ),
  };
  
  fs.writeFileSync(
    path.join(backupDir, '_metadata.json'),
    JSON.stringify(metadata, null, 2)
  );
  
  console.log('');
  console.log('='.repeat(60));
  console.log('Backup complete!');
  console.log('='.repeat(60));
  console.log('');
  console.log('Summary:');
  for (const [table, rows] of Object.entries(allData)) {
    console.log(`  ${table}: ${rows.length} rows`);
  }
  console.log('');
  console.log(`Files saved to: ${backupDir}`);
  console.log('');
  console.log('To restore, run:');
  console.log(`  npx tsx scripts/restore-data.ts ${backupDir}`);
}

main().catch(console.error);



