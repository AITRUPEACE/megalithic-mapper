/**
 * Fetch images from Wikimedia Commons for megalithic sites
 * 
 * Searches for CC-licensed images by:
 * - Site name search
 * - Known Commons categories
 * - Related search terms
 * 
 * Usage: npx tsx scripts/data-gathering/fetch-images.ts [input-file]
 */

import * as fs from 'fs';
import * as path from 'path';

const COMMONS_API = 'https://commons.wikimedia.org/w/api.php';
const RATE_LIMIT_MS = 200;

interface CommonsImage {
  title: string;
  url: string;
  thumbUrl: string;
  width: number;
  height: number;
  license?: string;
  author?: string;
  description?: string;
}

interface InputSite {
  slug: string;
  name: string;
  site_type: string;
  coordinates: { lat: number; lng: number };
  image_url?: string;
  wikipedia_url?: string;
  [key: string]: unknown;
}

interface SiteWithImages extends InputSite {
  images: CommonsImage[];
  primary_image?: CommonsImage;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function searchCommonsImages(query: string, limit: number = 5): Promise<CommonsImage[]> {
  try {
    const searchUrl = `${COMMONS_API}?` + new URLSearchParams({
      action: 'query',
      generator: 'search',
      gsrnamespace: '6', // File namespace
      gsrsearch: `${query} filetype:bitmap`,
      gsrlimit: limit.toString(),
      prop: 'imageinfo',
      iiprop: 'url|extmetadata|size',
      iiurlwidth: '800',
      format: 'json',
      origin: '*'
    });
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'MegalithicMapper/1.0 (https://github.com/megalithic-mapper)'
      }
    });
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    
    if (!data.query?.pages) {
      return [];
    }
    
    const images: CommonsImage[] = [];
    
    for (const page of Object.values(data.query.pages) as any[]) {
      if (!page.imageinfo?.[0]) continue;
      
      const info = page.imageinfo[0];
      const metadata = info.extmetadata || {};
      
      // Skip non-CC images
      const license = metadata.LicenseShortName?.value || '';
      if (!license.includes('CC') && !license.includes('Public domain')) {
        continue;
      }
      
      images.push({
        title: page.title.replace('File:', ''),
        url: info.url,
        thumbUrl: info.thumburl || info.url,
        width: info.width,
        height: info.height,
        license,
        author: metadata.Artist?.value?.replace(/<[^>]*>/g, ''),
        description: metadata.ImageDescription?.value?.replace(/<[^>]*>/g, '')
      });
    }
    
    return images;
  } catch (error) {
    console.error(`  ⚠️ Commons search failed for "${query}":`, (error as Error).message);
    return [];
  }
}

async function fetchCategoryImages(category: string, limit: number = 10): Promise<CommonsImage[]> {
  try {
    const url = `${COMMONS_API}?` + new URLSearchParams({
      action: 'query',
      generator: 'categorymembers',
      gcmtitle: category.startsWith('Category:') ? category : `Category:${category}`,
      gcmtype: 'file',
      gcmlimit: limit.toString(),
      prop: 'imageinfo',
      iiprop: 'url|extmetadata|size',
      iiurlwidth: '800',
      format: 'json',
      origin: '*'
    });
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'MegalithicMapper/1.0 (https://github.com/megalithic-mapper)'
      }
    });
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    
    if (!data.query?.pages) {
      return [];
    }
    
    const images: CommonsImage[] = [];
    
    for (const page of Object.values(data.query.pages) as any[]) {
      if (!page.imageinfo?.[0]) continue;
      
      const info = page.imageinfo[0];
      const metadata = info.extmetadata || {};
      
      const license = metadata.LicenseShortName?.value || '';
      if (!license.includes('CC') && !license.includes('Public domain')) {
        continue;
      }
      
      images.push({
        title: page.title.replace('File:', ''),
        url: info.url,
        thumbUrl: info.thumburl || info.url,
        width: info.width,
        height: info.height,
        license,
        author: metadata.Artist?.value?.replace(/<[^>]*>/g, ''),
        description: metadata.ImageDescription?.value?.replace(/<[^>]*>/g, '')
      });
    }
    
    return images;
  } catch {
    return [];
  }
}

// Common Wikimedia Commons categories for megalithic sites
const MEGALITHIC_CATEGORIES = [
  'Megalithic_monuments',
  'Stone_circles',
  'Dolmens',
  'Menhirs',
  'Passage_graves',
  'Cairns',
  'Standing_stones',
  'Henges',
  'Long_barrows',
  'Nuraghi',
  'Archaeological_sites_in_Ireland',
  'Archaeological_sites_in_Scotland',
  'Archaeological_sites_in_Wales',
  'Archaeological_sites_in_England',
  'Archaeological_sites_in_France',
  'Archaeological_sites_in_Spain',
  'Archaeological_sites_in_Portugal',
];

async function main() {
  // Determine input file
  const inputArg = process.argv[2];
  let inputPath: string;
  
  if (inputArg) {
    inputPath = path.isAbsolute(inputArg) ? inputArg : path.join(process.cwd(), inputArg);
  } else {
    // Default to enriched wikidata sites
    const enrichedPath = path.join(__dirname, 'data', 'wikidata-sites-enriched.json');
    const basePath = path.join(__dirname, 'data', 'wikidata-sites.json');
    inputPath = fs.existsSync(enrichedPath) ? enrichedPath : basePath;
  }
  
  if (!fs.existsSync(inputPath)) {
    console.error(`❌ Input file not found: ${inputPath}`);
    console.log('\nUsage: npx tsx scripts/data-gathering/fetch-images.ts [input-file]');
    process.exit(1);
  }
  
  console.log(`📖 Reading ${inputPath}...`);
  const data = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
  const sites: InputSite[] = data.sites;
  
  // Filter to sites without images (or with low-quality images)
  const sitesNeedingImages = sites.filter(s => !s.image_url);
  const sitesWithImages = sites.filter(s => s.image_url);
  
  console.log(`📷 ${sitesWithImages.length} sites already have images`);
  console.log(`🔍 Searching for images for ${sitesNeedingImages.length} sites...`);
  
  // Limit how many to process (Commons can be slow)
  const PROCESS_LIMIT = 200;
  const toProcess = sitesNeedingImages.slice(0, PROCESS_LIMIT);
  
  const results: SiteWithImages[] = [];
  let foundImages = 0;
  
  for (let i = 0; i < toProcess.length; i++) {
    const site = toProcess[i];
    
    // Skip sites with generic names
    if (site.name.startsWith('Site ') || site.name.startsWith('osm-')) {
      results.push({ ...site, images: [] });
      continue;
    }
    
    // Search Commons for images
    const searchTerms = [
      site.name,
      `${site.name} ${site.site_type}`,
      `${site.name} megalith`
    ];
    
    let images: CommonsImage[] = [];
    
    for (const term of searchTerms) {
      const found = await searchCommonsImages(term, 3);
      await sleep(RATE_LIMIT_MS);
      
      if (found.length > 0) {
        images = found;
        break;
      }
    }
    
    const siteWithImages: SiteWithImages = {
      ...site,
      images,
      primary_image: images[0]
    };
    
    if (images.length > 0) {
      siteWithImages.image_url = images[0].thumbUrl;
      foundImages++;
    }
    
    results.push(siteWithImages);
    
    // Progress
    if ((i + 1) % 25 === 0) {
      console.log(`   Processed ${i + 1}/${toProcess.length} (found images for ${foundImages})`);
    }
  }
  
  // Add remaining sites that weren't processed
  for (let i = PROCESS_LIMIT; i < sitesNeedingImages.length; i++) {
    results.push({ ...sitesNeedingImages[i], images: [] });
  }
  
  // Add sites that already had images
  for (const site of sitesWithImages) {
    results.push({ ...site, images: site.image_url ? [{ 
      title: 'Primary image',
      url: site.image_url,
      thumbUrl: site.image_url,
      width: 0,
      height: 0
    }] : [] });
  }
  
  // Save results
  const outputDir = path.join(__dirname, 'data');
  const baseName = path.basename(inputPath, '.json').replace('-enriched', '');
  const outputPath = path.join(outputDir, `${baseName}-with-images.json`);
  
  fs.writeFileSync(outputPath, JSON.stringify({ sites: results }, null, 2));
  console.log(`\n💾 Saved to ${outputPath}`);
  
  // Create a media manifest for easy import
  const mediaManifest = results
    .filter(s => s.images.length > 0)
    .flatMap(s => s.images.map(img => ({
      site_slug: s.slug,
      image_url: img.url,
      thumb_url: img.thumbUrl,
      title: img.title,
      license: img.license,
      author: img.author,
      width: img.width,
      height: img.height
    })));
  
  const manifestPath = path.join(outputDir, 'media-manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify({ media: mediaManifest }, null, 2));
  console.log(`📋 Saved media manifest to ${manifestPath}`);
  
  // Stats
  const totalWithImages = results.filter(s => s.image_url).length;
  const totalImages = results.reduce((sum, s) => sum + s.images.length, 0);
  
  console.log('\n📈 Statistics:');
  console.log(`   Total sites: ${results.length}`);
  console.log(`   Sites with images: ${totalWithImages} (${Math.round(totalWithImages/results.length*100)}%)`);
  console.log(`   Total images found: ${totalImages}`);
  console.log(`   New images found: ${foundImages}`);
}

main().catch(console.error);
