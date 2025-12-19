/**
 * Fetch megalithic sites from OpenStreetMap via Overpass API
 * 
 * This script queries OSM for archaeological sites tagged as megaliths:
 * - Stone circles, dolmens, menhirs
 * - Standing stones, cairns
 * - Archaeological sites with megalith tags
 * 
 * Usage: npx tsx scripts/data-gathering/fetch-osm.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const OVERPASS_API = 'https://overpass-api.de/api/interpreter';

// Overpass QL query for megalithic sites worldwide
const OVERPASS_QUERY = `
[out:json][timeout:300];
(
  // Megalithic archaeological sites
  node["archaeological_site"="megalith"];
  way["archaeological_site"="megalith"];
  
  // Stone circles
  node["historic"="stone_circle"];
  way["historic"="stone_circle"];
  
  // Standing stones / Menhirs
  node["historic"="standing_stone"];
  node["historic"="menhir"];
  
  // Dolmens
  node["historic"="dolmen"];
  way["historic"="dolmen"];
  node["megalith_type"="dolmen"];
  
  // Cairns
  node["historic"="cairn"];
  way["historic"="cairn"];
  node["archaeological_site"="cairn"];
  
  // Passage graves
  node["archaeological_site"="passage_grave"];
  way["archaeological_site"="passage_grave"];
  node["historic"="passage_grave"];
  
  // Chambered tombs
  node["archaeological_site"="chambered_tomb"];
  way["archaeological_site"="chambered_tomb"];
  
  // Tumulus / Barrows
  node["historic"="tumulus"];
  way["historic"="tumulus"];
  node["archaeological_site"="tumulus"];
  
  // Henges
  node["historic"="henge"];
  way["historic"="henge"];
  
  // Nuraghe (Sardinia)
  node["historic"="nuraghe"];
  way["historic"="nuraghe"];
  
  // Ring forts
  node["historic"="ringfort"];
  way["historic"="ringfort"];
  
  // Generic archaeological sites with megalith subtypes
  node["historic"="archaeological_site"]["site_type"~"megalith|dolmen|menhir|stone_circle|cairn|passage_grave"];
  way["historic"="archaeological_site"]["site_type"~"megalith|dolmen|menhir|stone_circle|cairn|passage_grave"];
);
out center tags;
`;

interface OSMElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

interface OSMResponse {
  elements: OSMElement[];
}

interface MegalithicSite {
  osm_id: string;
  osm_type: string;
  slug: string;
  name: string;
  summary: string;
  site_type: string;
  category: 'site';
  coordinates: { lat: number; lng: number };
  layer: 'official';
  verification_status: 'verified';
  trust_tier: null;
  media_count: number;
  tags: Record<string, string>;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
}

function determineSiteType(tags: Record<string, string>): string {
  // Check specific tags first
  if (tags.megalith_type) {
    const typeMap: Record<string, string> = {
      'dolmen': 'dolmen',
      'menhir': 'menhir',
      'stone_circle': 'stone circle',
      'cromlech': 'stone circle',
      'stone_row': 'stone alignment',
      'standing_stone': 'standing stone',
      'chamber': 'chambered cairn',
      'passage_grave': 'passage tomb',
      'gallery_grave': 'passage tomb',
      'portal_dolmen': 'portal dolmen',
      'wedge_tomb': 'wedge tomb',
      'court_tomb': 'court tomb',
      'cist': 'cist',
    };
    if (typeMap[tags.megalith_type]) {
      return typeMap[tags.megalith_type];
    }
  }
  
  // Check historic tag
  if (tags.historic) {
    const historicMap: Record<string, string> = {
      'stone_circle': 'stone circle',
      'standing_stone': 'standing stone',
      'menhir': 'menhir',
      'dolmen': 'dolmen',
      'cairn': 'cairn',
      'tumulus': 'artificial mound',
      'henge': 'henge',
      'nuraghe': 'nuraghe',
      'ringfort': 'ring fort',
      'passage_grave': 'passage tomb',
    };
    if (historicMap[tags.historic]) {
      return historicMap[tags.historic];
    }
  }
  
  // Check archaeological_site tag
  if (tags.archaeological_site) {
    const siteMap: Record<string, string> = {
      'megalith': 'megalithic monument',
      'cairn': 'cairn',
      'passage_grave': 'passage tomb',
      'chambered_tomb': 'chambered cairn',
      'tumulus': 'artificial mound',
    };
    if (siteMap[tags.archaeological_site]) {
      return siteMap[tags.archaeological_site];
    }
  }
  
  // Check site_type tag
  if (tags.site_type) {
    return tags.site_type.replace(/_/g, ' ');
  }
  
  return 'megalithic monument';
}

function generateSummary(tags: Record<string, string>, siteType: string): string {
  const parts: string[] = [];
  
  // Start with description if available
  if (tags.description) {
    return tags.description;
  }
  
  // Build summary from available tags
  const name = tags.name || 'This site';
  parts.push(`${name} is a ${siteType}`);
  
  if (tags['historic:civilization']) {
    parts.push(`associated with the ${tags['historic:civilization']} culture`);
  }
  
  if (tags.start_date || tags['archaeological_site:period']) {
    const period = tags.start_date || tags['archaeological_site:period'];
    parts.push(`dating to ${period}`);
  }
  
  if (tags.wikidata) {
    parts.push('(see Wikidata for more details)');
  }
  
  return parts.join(' ') + '.';
}

async function fetchOSMSites(): Promise<OSMElement[]> {
  console.log('🔍 Fetching megalithic sites from OpenStreetMap...');
  console.log('⏳ This may take 1-2 minutes for a worldwide query...');
  
  const response = await fetch(OVERPASS_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `data=${encodeURIComponent(OVERPASS_QUERY)}`,
  });
  
  if (!response.ok) {
    throw new Error(`Overpass API failed: ${response.status} ${response.statusText}`);
  }
  
  const data: OSMResponse = await response.json();
  return data.elements;
}

async function main() {
  try {
    const elements = await fetchOSMSites();
    console.log(`✅ Found ${elements.length} elements from OpenStreetMap`);
    
    // Convert to our site format
    const sites: MegalithicSite[] = [];
    const slugs = new Set<string>();
    const seenCoords = new Set<string>();
    
    for (const element of elements) {
      // Get coordinates
      let lat: number, lng: number;
      if (element.type === 'node' && element.lat && element.lon) {
        lat = element.lat;
        lng = element.lon;
      } else if (element.center) {
        lat = element.center.lat;
        lng = element.center.lon;
      } else {
        continue; // Skip elements without coordinates
      }
      
      // Skip duplicates at same location (within ~10m)
      const coordKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
      if (seenCoords.has(coordKey)) continue;
      seenCoords.add(coordKey);
      
      const tags = element.tags || {};
      const name = tags.name || tags['name:en'] || `Site ${element.id}`;
      
      // Generate unique slug
      let baseSlug = slugify(name);
      if (!baseSlug || baseSlug === `site-${element.id}`) {
        baseSlug = `osm-${element.type}-${element.id}`;
      }
      let slug = baseSlug;
      let counter = 1;
      while (slugs.has(slug)) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      slugs.add(slug);
      
      const siteType = determineSiteType(tags);
      
      const site: MegalithicSite = {
        osm_id: `${element.type}/${element.id}`,
        osm_type: element.type,
        slug,
        name,
        summary: generateSummary(tags, siteType),
        site_type: siteType,
        category: 'site',
        coordinates: { lat, lng },
        layer: 'official',
        verification_status: 'verified',
        trust_tier: null,
        media_count: 0,
        tags: tags
      };
      
      sites.push(site);
    }
    
    console.log(`✅ Processed ${sites.length} unique sites`);
    
    // Analyze site types
    const byType = new Map<string, number>();
    for (const site of sites) {
      byType.set(site.site_type, (byType.get(site.site_type) || 0) + 1);
    }
    
    console.log('\n🏛️ Sites by type:');
    const sortedTypes = [...byType.entries()].sort((a, b) => b[1] - a[1]);
    for (const [type, count] of sortedTypes.slice(0, 15)) {
      console.log(`   ${type}: ${count}`);
    }
    
    // Geographic distribution (rough regions)
    const regions = {
      'Europe': 0,
      'Africa': 0,
      'Asia': 0,
      'North America': 0,
      'South America': 0,
      'Oceania': 0,
    };
    
    for (const site of sites) {
      const { lat, lng } = site.coordinates;
      if (lat > 35 && lng > -30 && lng < 60) regions['Europe']++;
      else if (lat < 35 && lat > -35 && lng > -20 && lng < 55) regions['Africa']++;
      else if (lat > 0 && lng > 60) regions['Asia']++;
      else if (lat > 0 && lng < -30) regions['North America']++;
      else if (lat < 0 && lng < -30) regions['South America']++;
      else regions['Oceania']++;
    }
    
    console.log('\n🌍 Geographic distribution (approximate):');
    for (const [region, count] of Object.entries(regions)) {
      if (count > 0) console.log(`   ${region}: ${count}`);
    }
    
    // Save to file
    const outputDir = path.join(__dirname, 'data');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const outputPath = path.join(outputDir, 'osm-sites.json');
    fs.writeFileSync(outputPath, JSON.stringify({ sites }, null, 2));
    console.log(`\n💾 Saved to ${outputPath}`);
    
    // Save as GeoJSON for mapping
    const geojson = {
      type: 'FeatureCollection',
      features: sites.map(site => ({
        type: 'Feature',
        properties: {
          name: site.name,
          slug: site.slug,
          site_type: site.site_type,
          osm_id: site.osm_id,
        },
        geometry: {
          type: 'Point',
          coordinates: [site.coordinates.lng, site.coordinates.lat]
        }
      }))
    };
    
    const geojsonPath = path.join(outputDir, 'osm-sites.geojson');
    fs.writeFileSync(geojsonPath, JSON.stringify(geojson, null, 2));
    console.log(`🗺️ Saved GeoJSON to ${geojsonPath}`);
    
    // Stats
    const withNames = sites.filter(s => !s.name.startsWith('Site ') && !s.name.startsWith('osm-')).length;
    const withWikidata = sites.filter(s => s.tags.wikidata).length;
    const withWikipedia = sites.filter(s => s.tags.wikipedia).length;
    
    console.log('\n📈 Statistics:');
    console.log(`   Total sites: ${sites.length}`);
    console.log(`   With names: ${withNames} (${Math.round(withNames/sites.length*100)}%)`);
    console.log(`   With Wikidata link: ${withWikidata} (${Math.round(withWikidata/sites.length*100)}%)`);
    console.log(`   With Wikipedia link: ${withWikipedia} (${Math.round(withWikipedia/sites.length*100)}%)`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
