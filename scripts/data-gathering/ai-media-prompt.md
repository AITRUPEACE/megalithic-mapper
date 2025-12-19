# AI Prompt: Find Media Content for Megalithic Sites

Use this prompt to gather media URLs (images, videos, external links) for existing sites.

---

## PROMPT FOR IMAGE DISCOVERY

```
You are helping to find Creative Commons licensed images for a megalithic sites database.

For each site listed below, provide:
1. **Wikimedia Commons category URL** (if exists)
2. **3-5 direct image URLs** from Wikimedia Commons (only CC-licensed)
3. **Image descriptions** for each

Output JSON format:
{
  "site_media": [
    {
      "site_slug": "stonehenge",
      "wikimedia_category": "https://commons.wikimedia.org/wiki/Category:Stonehenge",
      "images": [
        {
          "url": "https://upload.wikimedia.org/wikipedia/commons/3/3c/Stonehenge2007_07_30.jpg",
          "title": "Stonehenge at sunset",
          "license": "CC BY-SA 2.0",
          "author": "garethwiscombe"
        }
      ]
    }
  ]
}

**Sites to find images for:**
[LIST YOUR SITES HERE]
```

---

## PROMPT FOR YOUTUBE VIDEOS

```
You are helping to find educational YouTube videos about ancient megalithic sites.

For each site, suggest:
1. **Search terms** that would find relevant videos
2. **Types of content** to look for (documentaries, virtual tours, aerial footage, expert talks)
3. **Recommended channels** known for archaeological content

Output JSON format:
{
  "site_videos": [
    {
      "site_slug": "stonehenge",
      "search_terms": [
        "Stonehenge documentary",
        "Stonehenge archaeology",
        "Stonehenge aerial drone",
        "Stonehenge solstice"
      ],
      "recommended_channels": [
        "English Heritage",
        "Smithsonian Channel",
        "National Geographic"
      ],
      "video_types": ["documentary", "aerial", "solstice event", "archaeological dig"]
    }
  ]
}

**Sites to find videos for:**
[LIST YOUR SITES HERE]
```

---

## PROMPT FOR EXTERNAL REFERENCES

```
You are helping to compile academic and reference links for megalithic sites.

For each site, provide:
1. **Wikipedia URL** (English preferred)
2. **UNESCO URL** (if World Heritage)
3. **Official site URL** (museum, heritage organization)
4. **Academic references** (journal articles, books)

Output JSON format:
{
  "site_references": [
    {
      "site_slug": "stonehenge",
      "wikipedia_url": "https://en.wikipedia.org/wiki/Stonehenge",
      "unesco_url": "https://whc.unesco.org/en/list/373",
      "official_url": "https://www.english-heritage.org.uk/visit/places/stonehenge/",
      "academic_refs": [
        {
          "title": "Stonehenge: A Novel Interpretation",
          "author": "Mike Parker Pearson",
          "type": "book"
        }
      ]
    }
  ]
}

**Sites to find references for:**
[LIST YOUR SITES HERE]
```

---

## RECOMMENDED YOUTUBE CHANNELS FOR MEGALITHIC CONTENT

### Documentary/Educational
- **English Heritage** - UK heritage sites
- **Historic Environment Scotland** - Scottish sites
- **Smithsonian Channel** - General archaeology
- **National Geographic** - Wide coverage
- **Timeline - World History Documentaries** - Historical docs
- **World History Encyclopedia** - Educational content

### Alternative History / In-Depth Exploration
- **UnchartedX** (Ben van Kerkwyk) - Detailed site analysis
- **Bright Insight** (Jimmy Corsetti) - Alternative perspectives
- **Ancient Architects** - Architectural analysis
- **Mystery History** - Site compilations
- **Brien Foerster** - South American focus

### Aerial / Drone Footage
- **Above Ancient Places** - Drone footage
- **Aerial Scotland** - Scottish sites
- **DJI** - Sometimes features heritage sites

### Academic / Lecture
- **Oriental Institute** - Lectures
- **Archaeological Institute of America** - Lectures
- **The British Museum** - Expert talks

---

## BATCH PROCESSING EXAMPLE

### Step 1: Export site slugs
```sql
SELECT slug FROM megalithic.sites ORDER BY slug;
```

### Step 2: Request media in batches
```
Find Wikimedia Commons images for these 20 sites:
stonehenge, avebury, newgrange, carnac, gobekli-tepe, 
giza-great-pyramid, machu-picchu, angkor-wat, easter-island,
petra, chichen-itza, teotihuacan, tikal, monte-alban,
tiwanaku, puma-punku, sacsayhuaman, ollantaytambo,
chavin-huantar, san-agustin
```

### Step 3: Validate and import
- Check image URLs are accessible
- Verify licenses are CC-compatible
- Import to `media_assets` table

---

## WIKIMEDIA COMMONS SEARCH TIPS

1. **Category pages** are goldmines:
   - `Category:Stonehenge` has hundreds of images
   - `Category:Megalithic monuments in France` for regional coverage

2. **Use Commons Search**:
   - https://commons.wikimedia.org/w/index.php?search=stonehenge

3. **License filters**:
   - CC BY-SA 4.0 and CC BY-SA 3.0 are best
   - CC0 (public domain) also good
   - Avoid "All rights reserved"

4. **High-resolution images**:
   - Look for files > 2000px width
   - Useful for hero images

---

## AUTOMATED APPROACHES (FUTURE)

### Wikipedia API
```javascript
// Fetch Wikipedia summary and images
const wikiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${siteName}`;
const response = await fetch(wikiUrl);
const data = await response.json();
// data.extract = summary
// data.thumbnail.source = image URL
```

### Wikimedia Commons API
```javascript
// Search for images in a category
const commonsUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=categorymembers&cmtitle=Category:${categoryName}&cmtype=file&format=json`;
```

### YouTube Data API
```javascript
// Search for videos (requires API key)
const ytUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${searchTerm}&type=video&key=${API_KEY}`;
```








