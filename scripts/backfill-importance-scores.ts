/**
 * Backfill Importance Scores Script
 * 
 * Calculates and sets importance_score for existing sites based on:
 * - Site characteristics (type, verification status, tier)
 * - Engagement signals (media_count, votes)
 * - Name recognition (famous sites like Stonehenge, Giza, etc.)
 * 
 * Usage:
 *   npx tsx scripts/backfill-importance-scores.ts
 *   npx tsx scripts/backfill-importance-scores.ts --dry-run
 * 
 * Options:
 *   --dry-run    Show what would be updated without making changes
 *   --reset      Reset all scores to recalculate from scratch
 */

import { createClient } from '@supabase/supabase-js';

// Famous sites that should have maximum importance (90-100)
const LANDMARK_SITES = [
  // Egypt
  'giza', 'pyramid', 'sphinx', 'karnak', 'luxor', 'abu-simbel', 'valley-of-the-kings',
  // UK
  'stonehenge', 'avebury', 'skara-brae', 'newgrange', 'ring-of-brodgar',
  // Americas  
  'machu-picchu', 'teotihuacan', 'chichen-itza', 'nazca', 'tiwanaku', 'sacsayhuaman',
  // Europe
  'carnac', 'gobekli-tepe', 'gobeklitepe', 'malta', 'mnajdra', 'hagar-qim',
  // Asia
  'angkor', 'borobudur', 'mohenjo-daro', 'sanchi',
  // Pacific
  'easter-island', 'moai', 'nan-madol',
  // Other famous
  'petra', 'baalbek', 'ollantaytambo', 'puma-punku'
];

// Major sites that should have high importance (80-89)
const MAJOR_SITES = [
  'callanish', 'knowth', 'dowth', 'silbury', 'west-kennet',
  'castlerigg', 'bryn-celli-ddu', 'carrowmore', 'poulnabrone',
  'dolmen', 'passage-tomb', 'tumulus', 'ziggurat',
  'antequera', 'almendres', 'externsteine', 'ales-stenar'
];

interface SiteData {
  id: string;
  slug: string;
  name: string;
  site_type: string;
  layer: string;
  verification_status: string;
  trust_tier: string | null;
  media_count: number;
  votes_approve: number;
  votes_reject: number;
  importance_score: number | null;
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

// Check if site name/slug matches famous site patterns
function isLandmarkSite(site: SiteData): boolean {
  const slug = site.slug.toLowerCase();
  const name = site.name.toLowerCase();
  
  return LANDMARK_SITES.some(landmark => 
    slug.includes(landmark) || name.includes(landmark.replace(/-/g, ' '))
  );
}

function isMajorSite(site: SiteData): boolean {
  const slug = site.slug.toLowerCase();
  const name = site.name.toLowerCase();
  
  return MAJOR_SITES.some(major => 
    slug.includes(major) || name.includes(major.replace(/-/g, ' '))
  );
}

// Calculate importance score for a site
function calculateImportanceScore(site: SiteData): number {
  let score = 50; // Base score
  
  // Famous site recognition (highest priority)
  if (isLandmarkSite(site)) {
    score = 95;
  } else if (isMajorSite(site)) {
    score = 85;
  } else {
    // Calculate based on site characteristics
    
    // Layer and verification
    if (site.layer === 'official') {
      score += 15;
    }
    if (site.verification_status === 'verified') {
      score += 10;
    } else if (site.verification_status === 'under_review') {
      score += 0;
    } else {
      score -= 10;
    }
    
    // Trust tier
    switch (site.trust_tier) {
      case 'promoted': score += 15; break;
      case 'gold': score += 10; break;
      case 'silver': score += 5; break;
      case 'bronze': score += 0; break;
    }
    
    // Media count (engagement signal)
    if (site.media_count >= 50) {
      score += 15;
    } else if (site.media_count >= 20) {
      score += 10;
    } else if (site.media_count >= 5) {
      score += 5;
    } else if (site.media_count >= 1) {
      score += 2;
    }
    
    // Community votes (if approved)
    if (site.votes_approve > 0 && site.votes_reject === 0) {
      score += Math.min(10, site.votes_approve * 2);
    }
    
    // Site type bonuses (some types are inherently more significant)
    const siteType = site.site_type.toLowerCase();
    if (siteType.includes('pyramid')) {
      score += 10;
    } else if (siteType.includes('temple') || siteType.includes('observatory')) {
      score += 5;
    } else if (siteType.includes('city') || siteType.includes('settlement')) {
      score += 5;
    }
  }
  
  // Clamp to valid range
  return Math.max(10, Math.min(100, score));
}

// Get importance tier label
function getImportanceTier(score: number): string {
  if (score >= 80) return 'LANDMARK';
  if (score >= 60) return 'MAJOR';
  if (score >= 40) return 'NOTABLE';
  return 'MINOR';
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const reset = args.includes('--reset');
  
  console.log('🏛️  Backfill Importance Scores\n');
  console.log(`Mode: ${dryRun ? 'DRY RUN (no changes)' : 'LIVE'}`);
  if (reset) console.log('Reset mode: Will recalculate ALL scores');
  console.log('');
  
  const supabase = getSupabaseClient();
  
  // Fetch all sites
  console.log('📥 Fetching sites...');
  const { data: sites, error } = await supabase
    .schema('megalithic')
    .from('sites')
    .select('id, slug, name, site_type, layer, verification_status, trust_tier, media_count, votes_approve, votes_reject, importance_score')
    .order('name');
  
  if (error) {
    console.error('❌ Error fetching sites:', error.message);
    process.exit(1);
  }
  
  if (!sites || sites.length === 0) {
    console.log('⚠️  No sites found');
    process.exit(0);
  }
  
  console.log(`   Found ${sites.length} sites\n`);
  
  // Calculate scores
  const updates: { id: string; slug: string; oldScore: number | null; newScore: number; tier: string }[] = [];
  
  for (const site of sites) {
    const oldScore = site.importance_score;
    
    // Skip if already has a score and not in reset mode
    if (oldScore !== null && oldScore !== 50 && !reset) {
      continue;
    }
    
    const newScore = calculateImportanceScore(site);
    
    // Only update if score changed
    if (newScore !== oldScore) {
      updates.push({
        id: site.id,
        slug: site.slug,
        oldScore,
        newScore,
        tier: getImportanceTier(newScore)
      });
    }
  }
  
  if (updates.length === 0) {
    console.log('✅ All sites already have importance scores. Nothing to update.');
    console.log('   Use --reset to recalculate all scores.');
    process.exit(0);
  }
  
  // Display summary by tier
  const byTier = {
    LANDMARK: updates.filter(u => u.tier === 'LANDMARK'),
    MAJOR: updates.filter(u => u.tier === 'MAJOR'),
    NOTABLE: updates.filter(u => u.tier === 'NOTABLE'),
    MINOR: updates.filter(u => u.tier === 'MINOR'),
  };
  
  console.log('📊 Score Distribution:\n');
  console.log(`   🏛️  LANDMARK (80-100): ${byTier.LANDMARK.length} sites`);
  for (const site of byTier.LANDMARK.slice(0, 5)) {
    console.log(`      - ${site.slug}: ${site.newScore}`);
  }
  if (byTier.LANDMARK.length > 5) console.log(`      ... and ${byTier.LANDMARK.length - 5} more`);
  
  console.log(`\n   ⭐ MAJOR (60-79): ${byTier.MAJOR.length} sites`);
  for (const site of byTier.MAJOR.slice(0, 3)) {
    console.log(`      - ${site.slug}: ${site.newScore}`);
  }
  if (byTier.MAJOR.length > 3) console.log(`      ... and ${byTier.MAJOR.length - 3} more`);
  
  console.log(`\n   📍 NOTABLE (40-59): ${byTier.NOTABLE.length} sites`);
  console.log(`\n   🔸 MINOR (10-39): ${byTier.MINOR.length} sites`);
  
  console.log(`\n   Total updates: ${updates.length}\n`);
  
  if (dryRun) {
    console.log('🔍 DRY RUN - No changes made');
    console.log('   Run without --dry-run to apply changes');
    process.exit(0);
  }
  
  // Apply updates in batches
  console.log('📤 Applying updates...');
  const batchSize = 50;
  let updated = 0;
  let errors = 0;
  
  for (let i = 0; i < updates.length; i += batchSize) {
    const batch = updates.slice(i, i + batchSize);
    
    for (const update of batch) {
      const { error: updateError } = await supabase
        .schema('megalithic')
        .from('sites')
        .update({ importance_score: update.newScore })
        .eq('id', update.id);
      
      if (updateError) {
        console.error(`   ❌ Failed to update ${update.slug}: ${updateError.message}`);
        errors++;
      } else {
        updated++;
      }
    }
    
    // Progress indicator
    const progress = Math.min(i + batchSize, updates.length);
    process.stdout.write(`   Progress: ${progress}/${updates.length}\r`);
  }
  
  console.log(`\n\n✅ Complete!`);
  console.log(`   Updated: ${updated} sites`);
  if (errors > 0) {
    console.log(`   Errors: ${errors}`);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

