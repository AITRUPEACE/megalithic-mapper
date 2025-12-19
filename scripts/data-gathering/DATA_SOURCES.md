# Megalithic Sites Data Sources & Crawling Strategy

## Executive Summary

**Best Sources for Initial Dataset:**

| Source                | Sites Available | Images         | Text            | Coordinates | API/Crawl        |
| --------------------- | --------------- | -------------- | --------------- | ----------- | ---------------- |
| **Wikidata**          | ~10,000+        | ✅ (via P18)   | ✅ Descriptions | ✅ P625     | ✅ SPARQL API    |
| **OpenStreetMap**     | ~15,000+        | ❌             | ✅ Tags only    | ✅          | ✅ Overpass API  |
| **Wikipedia**         | ~5,000+         | ✅             | ✅ Rich         | ✅ Infobox  | ✅ REST API      |
| **Wikimedia Commons** | 50,000+ images  | ✅ CC Licensed | ✅ Captions     | ❌          | ✅ MediaWiki API |
| **Megalithic Portal** | ~50,000         | ✅             | ✅              | ✅          | ⚠️ Manual/KML    |

---

## 1. Wikidata (RECOMMENDED - START HERE)

**What it has:**

- Structured data for 10,000+ megalithic sites
- Coordinates (property P625)
- Images (property P18)
- Wikipedia article links
- Site type classifications
- UNESCO World Heritage status

**SPARQL Query for ALL Megalithic Sites:**

```sparql
# Get ALL megalithic monuments with coordinates, images, and descriptions
SELECT DISTINCT ?site ?siteLabel ?siteDescription ?coord ?image ?wikipedia WHERE {
  # Get sites that are any type of megalithic monument
  VALUES ?type {
    wd:Q8205328   # megalithic monument
    wd:Q1935728   # stone circle
    wd:Q180846    # dolmen
    wd:Q189539    # menhir
    wd:Q2518569   # passage grave
    wd:Q194195    # cairn
    wd:Q816116    # chambered cairn
    wd:Q12090     # henge
    wd:Q1535671   # long barrow
    wd:Q5503563   # stone row
    wd:Q210548    # cromlech
    wd:Q181916    # pyramid
  }

  ?site wdt:P31 ?type .

  # Get coordinates (required)
  ?site wdt:P625 ?coord .

  # Get image (optional)
  OPTIONAL { ?site wdt:P18 ?image . }

  # Get Wikipedia article (optional)
  OPTIONAL {
    ?wikipedia schema:about ?site ;
               schema:isPartOf <https://en.wikipedia.org/> .
  }

  SERVICE wikibase:label {
    bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en,fr,de,es,it" .
  }
}
ORDER BY ?siteLabel
```

**Run this at:** https://query.wikidata.org/

**Export Format:** JSON or CSV (click Download → JSON)

---

## 2. OpenStreetMap via Overpass API

**What it has:**

- 15,000+ archaeological sites tagged as megaliths
- Accurate GPS coordinates
- Site type tags (dolmen, menhir, stone_circle, etc.)
- Names in local languages

**Overpass Query for Worldwide Megalithic Sites:**

```overpass
[out:json][timeout:180];
(
  // All megalithic sites
  node["archaeological_site"="megalith"];
  way["archaeological_site"="megalith"];
  relation["archaeological_site"="megalith"];

  // Stone circles
  node["historic"="stone_circle"];
  way["historic"="stone_circle"];

  // Standing stones
  node["historic"="standing_stone"];

  // Archaeological sites with megalith subtypes
  node["historic"="archaeological_site"]["site_type"~"megalith|dolmen|menhir|stone_circle"];
  way["historic"="archaeological_site"]["site_type"~"megalith|dolmen|menhir|stone_circle"];
);
out body;
>;
out skel qt;
```

**Run this at:** https://overpass-turbo.eu/

**Export:** Click Export → GeoJSON

---

## 3. Wikipedia REST API

**For rich descriptions and images for known sites:**

```javascript
// Get summary, coordinates, and thumbnail for a site
const siteName = "Stonehenge";
const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(siteName)}`;

const response = await fetch(url);
const data = await response.json();

// Returns:
// - data.extract (summary text)
// - data.coordinates (lat/lon)
// - data.thumbnail.source (image URL)
// - data.content_urls.desktop.page (Wikipedia link)
```

---

## 4. Wikimedia Commons API

**For CC-licensed images:**

```javascript
// Search for images in a category
const category = "Category:Stone_circles_in_England";
const url =
	`https://commons.wikimedia.org/w/api.php?` +
	new URLSearchParams({
		action: "query",
		generator: "categorymembers",
		gcmtitle: category,
		gcmtype: "file",
		gcmlimit: "50",
		prop: "imageinfo",
		iiprop: "url|extmetadata",
		iiurlwidth: "800",
		format: "json",
		origin: "*",
	});

const response = await fetch(url);
const data = await response.json();
// Returns image URLs and license info
```

**Useful Categories:**

- `Category:Megalithic_monuments`
- `Category:Stone_circles`
- `Category:Dolmens`
- `Category:Menhirs`
- `Category:Passage_graves`
- `Category:Cairns`

---

## 5. Megalithic Portal (megalithic.co.uk)

**What it has:**

- 50,000 sites (largest database)
- User photos
- Detailed descriptions
- GPS coordinates

**Access methods:**

1. **KML Downloads** - Available on site for Google Earth
2. **Pocket Guide App** - Data available in iOS app
3. **Manual curation** - Browse by region

**Note:** No public API. Contact them for data partnership.

---

## Recommended Crawling Order

### Phase 1: Core Dataset (Day 1)

1. Run Wikidata SPARQL query → Export JSON
2. Run Overpass query → Export GeoJSON
3. Merge and deduplicate by coordinates

### Phase 2: Enrich with Wikipedia (Day 2-3)

1. For each site, fetch Wikipedia summary via REST API
2. Get thumbnail images
3. Extract additional metadata

### Phase 3: Media Assets (Day 4-5)

1. For top 200 sites, fetch Wikimedia Commons images
2. Search YouTube for documentary links
3. Store media references

---

## Data Licensing

| Source            | License    | Attribution Required                 |
| ----------------- | ---------- | ------------------------------------ |
| Wikidata          | CC0        | No (but nice to do)                  |
| OpenStreetMap     | ODbL       | Yes - "© OpenStreetMap contributors" |
| Wikipedia         | CC BY-SA   | Yes                                  |
| Wikimedia Commons | Various CC | Check per image                      |

---

## Quick Start Commands

```bash
# 1. Create data directory
mkdir -p scripts/data-gathering/data

# 2. Run the Wikidata fetch script
npx tsx scripts/data-gathering/fetch-wikidata.ts

# 3. Run the OSM fetch script
npx tsx scripts/data-gathering/fetch-osm.ts

# 4. Merge and deduplicate
npx tsx scripts/data-gathering/merge-sources.ts

# 5. Enrich with Wikipedia
npx tsx scripts/data-gathering/enrich-wikipedia.ts

# 6. Fetch images
npx tsx scripts/data-gathering/fetch-images.ts
```
