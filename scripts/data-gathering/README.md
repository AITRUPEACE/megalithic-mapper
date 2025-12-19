# Megalithic Sites Data Gathering Toolkit

This folder contains automated scripts and prompts to gather rich content for megalithic sites from public APIs and databases.

## 🚀 Quick Start - Automated Data Gathering

```bash
# 1. Fetch from Wikidata (fastest, ~5,000+ sites with coordinates & images)
npx tsx scripts/data-gathering/fetch-wikidata.ts

# 2. Fetch from OpenStreetMap (largest, ~15,000+ sites)
npx tsx scripts/data-gathering/fetch-osm.ts

# 3. Merge and deduplicate sources
npx tsx scripts/data-gathering/merge-sources.ts

# 4. Enrich with Wikipedia summaries & images
npx tsx scripts/data-gathering/enrich-wikipedia.ts data/merged-sites.json

# 5. Fetch additional images from Wikimedia Commons
npx tsx scripts/data-gathering/fetch-images.ts data/merged-sites-enriched.json

# 6. Import to database
npx tsx scripts/data-gathering/import-sites.ts data/import-ready.json
```

## 📊 Data Sources Comparison

| Source                | Sites          | Images         | Text            | Coordinates | Access        |
| --------------------- | -------------- | -------------- | --------------- | ----------- | ------------- |
| **Wikidata**          | ~10,000+       | ✅             | ✅ Descriptions | ✅          | SPARQL API    |
| **OpenStreetMap**     | ~15,000+       | ❌             | Tags only       | ✅          | Overpass API  |
| **Wikipedia**         | ~5,000+        | ✅             | ✅ Rich         | ✅          | REST API      |
| **Wikimedia Commons** | 50,000+ images | ✅ CC Licensed | ✅ Captions     | ❌          | MediaWiki API |
| **Megalithic Portal** | ~50,000        | ✅             | ✅              | ✅          | Manual/KML    |

See `DATA_SOURCES.md` for detailed API documentation and SPARQL queries.

## 📁 Files in This Folder

### Automated Scripts

| File                  | Purpose                                        |
| --------------------- | ---------------------------------------------- |
| `fetch-wikidata.ts`   | Fetch sites from Wikidata SPARQL API           |
| `fetch-osm.ts`        | Fetch sites from OpenStreetMap Overpass API    |
| `enrich-wikipedia.ts` | Enrich sites with Wikipedia summaries & images |
| `fetch-images.ts`     | Find CC images from Wikimedia Commons          |
| `merge-sources.ts`    | Merge and deduplicate from multiple sources    |
| `import-sites.ts`     | Import final data to Supabase                  |

### Documentation

| File                 | Purpose                             |
| -------------------- | ----------------------------------- |
| `DATA_SOURCES.md`    | Complete API docs & SPARQL queries  |
| `QUICK_START.md`     | AI-assisted data generation guide   |
| `ai-data-prompt.md`  | Prompt for AI to generate site data |
| `ai-media-prompt.md` | Prompt for finding media content    |
| `site-template.json` | JSON template for site data         |

### Data Directory (created by scripts)

| File                       | Contents                   |
| -------------------------- | -------------------------- |
| `data/wikidata-sites.json` | Raw Wikidata export        |
| `data/osm-sites.json`      | Raw OSM export             |
| `data/merged-sites.json`   | Deduplicated combined data |
| `data/import-ready.json`   | Database-ready format      |
| `data/media-import.json`   | Image URLs for media table |

## 📋 MVP Data Requirements

| Field                 | Required      | Source Priority          |
| --------------------- | ------------- | ------------------------ |
| `name`                | ✅ Yes        | Wikidata, OSM, Wikipedia |
| `slug`                | ✅ Yes        | Auto-generated           |
| `coordinates`         | ✅ Yes        | Wikidata, OSM            |
| `summary`             | ✅ Yes        | Wikipedia API            |
| `site_type`           | ✅ Yes        | Wikidata types, OSM tags |
| `verification_status` | ✅ Yes        | 'verified' for all       |
| Images                | High priority | Wikimedia Commons (CC)   |

## 🔢 Expected Results

After running all scripts:

- **5,000-10,000 unique sites** from Wikidata + OSM
- **60-70% with images** from Wikidata P18 property
- **40-50% with rich summaries** from Wikipedia
- **100% with coordinates** (required for all sources)

## 📜 Data Licensing

| Source            | License    | Attribution                              |
| ----------------- | ---------- | ---------------------------------------- |
| Wikidata          | CC0        | Not required                             |
| OpenStreetMap     | ODbL       | Required: "© OpenStreetMap contributors" |
| Wikipedia         | CC BY-SA   | Required                                 |
| Wikimedia Commons | Various CC | Check per image                          |
