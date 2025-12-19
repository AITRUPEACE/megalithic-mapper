/**
 * Fetch images for megalithic sites from Wikimedia Commons
 * 
 * For each site, fetches 3-6 CC-licensed images with:
 * - Thumbnail URL (primary image)
 * - Full-size URL
 * - License info
 * - Author attribution
 * 
 * Usage: npx tsx scripts/data-gathering/fetch-site-images.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const COMMONS_API = 'https://commons.wikimedia.org/w/api.php';
const WIKIPEDIA_API = 'https://en.wikipedia.org/w/api.php';
const RATE_LIMIT_MS = 300;

interface SiteImage {
  url: string;           // Full image URL
  thumb_url: string;     // Thumbnail (800px width)
  title: string;         // Image file name
  license?: string;      // License type
  author?: string;       // Attribution
  width: number;
  height: number;
}

interface Site {
  slug: string;
  name: string;
  summary: string;
  site_type: string;
  coordinates: { lat: number; lng: number };
  wikipedia_url?: string;
  image_url?: string;
  country?: string;
  source: string;
  images?: SiteImage[];
  thumbnail?: string;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Extract Wikipedia page title from URL
function getWikiTitle(url: string): string | null {
  const match = url.match(/wikipedia\.org\/wiki\/(.+?)(?:#|$)/);
  return match ? decodeURIComponent(match[1]) : null;
}

// Fetch images used in a Wikipedia article
async function fetchWikipediaImages(pageTitle: string): Promise<SiteImage[]> {
  try {
    const url = `${WIKIPEDIA_API}?` + new URLSearchParams({
      action: 'query',
      titles: pageTitle,
      prop: 'images',
      imlimit: '20',
      format: 'json',
      origin: '*'
    });
    
    const response = await fetch(url, {
      headers: { 'User-Agent': 'MegalithicMapper/1.0' }
    });
    
    if (!response.ok) return [];
    
    const data = await response.json();
    const pages = data.query?.pages;
    if (!pages) return [];
    
    const page = Object.values(pages)[0] as any;
    const images = page?.images || [];
    
    // Filter to actual photos (not icons, maps, etc.)
    const photoImages = images
      .map((img: any) => img.title)
      .filter((title: string) => {
        const lower = title.toLowerCase();
        return (lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.png')) &&
               !lower.includes('icon') && 
               !lower.includes('logo') && 
               !lower.includes('flag') &&
               !lower.includes('map') &&
               !lower.includes('commons-logo') &&
               !lower.includes('wikidata') &&
               !lower.includes('edit-') &&
               !lower.includes('disambig');
      });
    
    // Get image info for filtered images
    if (photoImages.length === 0) return [];
    
    return await fetchImageInfo(photoImages.slice(0, 8));
  } catch (error) {
    return [];
  }
}

// Search Wikimedia Commons for images
async function searchCommonsImages(siteName: string, siteType: string): Promise<SiteImage[]> {
  try {
    // Try multiple search terms
    const searchTerms = [
      siteName,
      `${siteName} ${siteType}`,
      `${siteName} megalith`
    ];
    
    for (const term of searchTerms) {
      const url = `${COMMONS_API}?` + new URLSearchParams({
        action: 'query',
        generator: 'search',
        gsrnamespace: '6',
        gsrsearch: `${term} filetype:bitmap`,
        gsrlimit: '10',
        prop: 'imageinfo',
        iiprop: 'url|extmetadata|size',
        iiurlwidth: '800',
        format: 'json',
        origin: '*'
      });
      
      const response = await fetch(url, {
        headers: { 'User-Agent': 'MegalithicMapper/1.0' }
      });
      
      if (!response.ok) continue;
      
      const data = await response.json();
      const pages = data.query?.pages;
      if (!pages) continue;
      
      const images = extractImagesFromPages(pages);
      if (images.length >= 2) return images;
    }
    
    return [];
  } catch (error) {
    return [];
  }
}

// Get detailed info for a list of image titles
async function fetchImageInfo(titles: string[]): Promise<SiteImage[]> {
  try {
    const url = `${COMMONS_API}?` + new URLSearchParams({
      action: 'query',
      titles: titles.join('|'),
      prop: 'imageinfo',
      iiprop: 'url|extmetadata|size',
      iiurlwidth: '800',
      format: 'json',
      origin: '*'
    });
    
    const response = await fetch(url, {
      headers: { 'User-Agent': 'MegalithicMapper/1.0' }
    });
    
    if (!response.ok) return [];
    
    const data = await response.json();
    const pages = data.query?.pages;
    if (!pages) return [];
    
    return extractImagesFromPages(pages);
  } catch (error) {
    return [];
  }
}

// Extract image data from API response
function extractImagesFromPages(pages: Record<string, any>): SiteImage[] {
  const images: SiteImage[] = [];
  
  for (const page of Object.values(pages)) {
    const info = (page as any).imageinfo?.[0];
    if (!info) continue;
    
    const metadata = info.extmetadata || {};
    const license = metadata.LicenseShortName?.value || '';
    
    // Only include CC or public domain images
    if (!license.includes('CC') && !license.toLowerCase().includes('public domain')) {
      continue;
    }
    
    // Skip small images
    if (info.width < 400 || info.height < 300) continue;
    
    images.push({
      url: info.url,
      thumb_url: info.thumburl || info.url,
      title: (page as any).title?.replace('File:', '') || '',
      license,
      author: metadata.Artist?.value?.replace(/<[^>]*>/g, '').substring(0, 100),
      width: info.width,
      height: info.height
    });
  }
  
  // Sort by size (larger first) and limit to 6
  return images
    .sort((a, b) => (b.width * b.height) - (a.width * a.height))
    .slice(0, 6);
}

async function main() {
  const dataPath = path.join(__dirname, 'data', 'launch-dataset.json');
  
  if (!fs.existsSync(dataPath)) {
    console.error('❌ Dataset not found. Run create-launch-dataset.ts first.');
    process.exit(1);
  }
  
  console.log('📖 Loading sites...');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  const sites: Site[] = data.sites;
  
  console.log(`🖼️ Fetching images for ${sites.length} sites...\n`);
  
  let sitesWithImages = 0;
  let totalImages = 0;
  
  for (let i = 0; i < sites.length; i++) {
    const site = sites[i];
    let images: SiteImage[] = [];
    
    // Try Wikipedia first if we have a URL
    if (site.wikipedia_url) {
      const title = getWikiTitle(site.wikipedia_url);
      if (title) {
        images = await fetchWikipediaImages(title);
        await sleep(RATE_LIMIT_MS);
      }
    }
    
    // If not enough images, try Commons search
    if (images.length < 3) {
      const searchImages = await searchCommonsImages(site.name, site.site_type);
      await sleep(RATE_LIMIT_MS);
      
      // Merge, avoiding duplicates
      const existingUrls = new Set(images.map(img => img.url));
      for (const img of searchImages) {
        if (!existingUrls.has(img.url)) {
          images.push(img);
          if (images.length >= 6) break;
        }
      }
    }
    
    if (images.length > 0) {
      site.images = images;
      site.thumbnail = images[0].thumb_url;
      sitesWithImages++;
      totalImages += images.length;
    }
    
    // Progress
    if ((i + 1) % 10 === 0 || i === sites.length - 1) {
      const pct = Math.round((i + 1) / sites.length * 100);
      console.log(`   [${pct}%] Processed ${i + 1}/${sites.length} - ${sitesWithImages} sites with images (${totalImages} total)`);
    }
  }
  
  // Save updated dataset
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  console.log(`\n💾 Saved to ${dataPath}`);
  
  // Generate image manifest
  const manifest = sites
    .filter(s => s.images && s.images.length > 0)
    .map(s => ({
      site_slug: s.slug,
      site_name: s.name,
      thumbnail: s.thumbnail,
      image_count: s.images!.length,
      images: s.images
    }));
  
  const manifestPath = path.join(__dirname, 'data', 'site-images.json');
  fs.writeFileSync(manifestPath, JSON.stringify({ sites: manifest }, null, 2));
  console.log(`📋 Saved image manifest to ${manifestPath}`);
  
  // Stats
  const avgImages = sitesWithImages > 0 ? (totalImages / sitesWithImages).toFixed(1) : 0;
  
  console.log('\n📈 Results:');
  console.log(`   Sites with images: ${sitesWithImages}/${sites.length} (${Math.round(sitesWithImages/sites.length*100)}%)`);
  console.log(`   Total images: ${totalImages}`);
  console.log(`   Average per site: ${avgImages}`);
  
  // Show sample
  console.log('\n📷 Sample sites with images:');
  sites.filter(s => s.images && s.images.length >= 3).slice(0, 5).forEach(s => {
    console.log(`   ${s.name}: ${s.images!.length} images`);
    console.log(`      Thumbnail: ${s.thumbnail?.substring(0, 80)}...`);
  });
}

main().catch(console.error);
