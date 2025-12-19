/**
 * Remove junk entries from the dataset
 * 
 * Usage: npx tsx scripts/data-gathering/cleanup-junk.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// Slugs of junk entries to remove
const JUNK_SLUGS = [
  'arabella-station',
  'matthiae-s-cafe-and-bakery',
  'dom-zgromadzenia-majstrow-tkackich-w-odzi',
  'west-hall',
  'companhia-agricola-do-sanguinhal',
  'hoover-building',
];

// Additional patterns that indicate junk data
const JUNK_PATTERNS = [
  /cafe|bakery|restaurant|bar\b/i,
  /factory|warehouse|barn/i,
  /station\b.*(?!stone)/i, // "station" but not "stone"
  /company|corporation|ltd|inc\b/i,
  /supermarket|walmart|grocery/i,
  /hotel|motel|inn\b/i,
  /school|university|college/i,
  /church(?!yard)|cathedral|mosque|synagogue/i, // churches unless churchyard
  /hospital|clinic/i,
  /bank\b|insurance/i,
  /apartment|residential/i,
];

async function main() {
  const dataPath = path.join(__dirname, 'data', 'launch-dataset.json');
  
  console.log('📖 Loading dataset...');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  const originalCount = data.sites.length;
  
  // Remove by slug
  let removed: string[] = [];
  data.sites = data.sites.filter((site: any) => {
    if (JUNK_SLUGS.includes(site.slug)) {
      removed.push(`${site.name} (slug match)`);
      return false;
    }
    return true;
  });
  
  // Remove by pattern matching on name + summary
  data.sites = data.sites.filter((site: any) => {
    const text = `${site.name} ${site.summary}`.toLowerCase();
    for (const pattern of JUNK_PATTERNS) {
      if (pattern.test(text)) {
        // Don't remove if the site type itself is archaeological
        const validTypes = ['stone circle', 'dolmen', 'menhir', 'cairn', 'henge', 'barrow', 'nuraghe', 'megalith', 'sanctuary'];
        const hasValidType = validTypes.some(t => site.site_type?.toLowerCase().includes(t));
        
        // Check if summary mentions archaeological terms
        const archTerms = /megalith|prehistoric|ancient|bronze age|iron age|neolithic|archaeological|burial|tomb|monument/i;
        if (!archTerms.test(site.summary) && !site.name.toLowerCase().includes('stone')) {
          removed.push(`${site.name} (pattern: ${pattern.source})`);
          return false;
        }
      }
    }
    return true;
  });
  
  const newCount = data.sites.length;
  
  console.log(`\n🗑️ Removed ${removed.length} junk entries:`);
  removed.forEach(r => console.log(`   - ${r}`));
  
  console.log(`\n📊 Sites: ${originalCount} → ${newCount}`);
  
  // Save cleaned dataset
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  console.log(`\n💾 Saved cleaned dataset`);
  
  // Generate SQL to delete from database
  if (JUNK_SLUGS.length > 0) {
    const deleteSql = `-- Delete junk entries from database
-- Generated: ${new Date().toISOString()}

DELETE FROM megalithic.sites WHERE slug IN (
  ${JUNK_SLUGS.map(s => `'${s}'`).join(',\n  ')}
);
`;
    const sqlPath = path.join(__dirname, 'data', 'delete-junk.sql');
    fs.writeFileSync(sqlPath, deleteSql);
    console.log(`📝 Generated ${sqlPath}`);
  }
}

main().catch(console.error);

