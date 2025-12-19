# AI Prompt: Generate Megalithic Site Data

Use this prompt with Claude, ChatGPT, or another AI to generate site data.

---

## PROMPT

```
You are a research assistant helping to build a database of ancient megalithic and archaeological sites. Generate detailed data for megalithic sites in the following JSON format.

**Requirements:**
1. Only include sites with verified coordinates (use Wikipedia or reliable sources)
2. Include a mix of well-known and lesser-known sites
3. All summaries should be factual and archaeological in tone
4. Tag sites appropriately with culture, era, and themes

**Output JSON Schema:**

{
  "sites": [
    {
      "slug": "site-name-lowercase-dashes",
      "name": "Site Name",
      "summary": "2-3 sentence archaeological description. Include key features, approximate age, and significance.",
      "site_type": "stone circle | passage tomb | dolmen | menhir | pyramid | temple complex | fortress | cairn | megalithic cemetery | rock-cut temple | earthwork | standing stones | etc.",
      "category": "site",
      "coordinates": {
        "lat": 51.1789,
        "lng": -1.8262
      },
      "layer": "official",
      "verification_status": "verified",
      "trust_tier": null,
      "culture_tags": ["Neolithic British", "Celtic", "etc."],
      "era_tags": ["Neolithic", "Bronze Age", "Iron Age", "etc."],
      "theme_tags": ["astronomy", "UNESCO", "solstice", "megalithic art", "engineering", "etc."],
      "wikipedia_url": "https://en.wikipedia.org/wiki/Site_Name",
      "media_suggestions": {
        "wikimedia_commons_category": "Category:Stonehenge",
        "youtube_search_terms": ["Stonehenge documentary", "Stonehenge aerial"],
        "recommended_images": [
          "https://upload.wikimedia.org/wikipedia/commons/..."
        ]
      }
    }
  ]
}

**Site Types to Include:**
- Stone circles and henges
- Passage tombs and chambered cairns
- Dolmens and portal tombs
- Standing stones (menhirs)
- Stone alignments
- Pyramids and step pyramids
- Temple complexes
- Megalithic cemeteries
- Rock-cut monuments
- Earthworks and mounds
- Nuraghi (Sardinia)
- Taulas (Menorca)
- Navetas (Balearics)

**Regions to Cover:**
- British Isles (England, Scotland, Wales, Ireland)
- France (Brittany, Normandy)
- Iberian Peninsula (Spain, Portugal)
- Mediterranean (Malta, Sardinia, Corsica)
- Scandinavia
- Central Europe
- Turkey/Anatolia
- Egypt and North Africa
- Sub-Saharan Africa
- India and Southeast Asia
- Korea and Japan
- South America (Peru, Bolivia, Colombia)
- Mesoamerica (Mexico, Guatemala)
- Pacific Islands
- North America

**Now generate data for [REGION/NUMBER] sites:**
[Example: "Generate 25 sites from the British Isles that are NOT already in this list: Stonehenge, Avebury, West Kennet, Silbury Hill, Callanish, Ring of Brodgar, Skara Brae, Maeshowe, Castlerigg, Bryn Celli Ddu"]
```

---

## EXAMPLE USAGE

### Request 1: British Isles Sites
```
Generate 25 megalithic sites from the British Isles that are NOT in this list:
Stonehenge, Avebury, West Kennet Long Barrow, Silbury Hill, Callanish Stones, 
Ring of Brodgar, Skara Brae, Maeshowe, Castlerigg, Bryn Celli Ddu
```

### Request 2: French Sites
```
Generate 20 megalithic sites from France, focusing on:
- Brittany alignments and dolmens
- Normandy passage tombs
- Southern France dolmens
NOT including: Carnac, Gavrinis, Locmariaquer, Barnenez
```

### Request 3: Lesser-Known Sites
```
Generate 30 lesser-known megalithic sites from around the world. 
Focus on sites that are archaeologically significant but less famous than:
Stonehenge, Pyramids, Machu Picchu, Angkor Wat, etc.
Include sites from Africa, Asia, and the Pacific.
```

### Request 4: Sites with Astronomical Alignments
```
Generate 20 sites known for astronomical alignments (solstice, equinox, lunar).
Include the specific alignment details in the summary.
```

---

## VALIDATION CHECKLIST

Before importing, verify:
- [ ] Coordinates are correct (check on map)
- [ ] No duplicate slugs
- [ ] Summary is factual (spot-check with Wikipedia)
- [ ] Site type is appropriate
- [ ] Tags are accurate

---

## TIPS FOR BEST RESULTS

1. **Be specific about regions** - "25 sites from Scotland" works better than "some UK sites"
2. **Exclude known sites** - List sites already in database to avoid duplicates
3. **Request verification** - Ask the AI to include Wikipedia URLs for fact-checking
4. **Request in batches** - 20-30 sites per request works well
5. **Cross-reference** - Verify coordinates match Wikipedia/OSM








