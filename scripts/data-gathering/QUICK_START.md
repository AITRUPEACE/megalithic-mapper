# Quick Start: Generate 200+ Sites in 30 Minutes

Follow these steps to rapidly expand your site database using AI.

---

## Step 1: Copy the Master Prompt

Open `ai-data-prompt.md` and copy the JSON schema section.

---

## Step 2: Generate Sites by Region

Use these prompts with Claude or ChatGPT. Each should give you ~20-30 sites.

### Batch 1: British Isles (Scotland focus)
```
Generate 25 megalithic sites from Scotland. Include stone circles, chambered cairns, 
brochs, and standing stones. Focus on Orkney, Lewis, Aberdeenshire, and Kilmartin Glen.
Exclude: Callanish, Ring of Brodgar, Skara Brae, Maeshowe, Stones of Stenness, Ness of Brodgar
Output in the JSON format specified.
```

### Batch 2: British Isles (Wales & Cornwall)
```
Generate 20 megalithic sites from Wales and Cornwall. Include cromlechs, quoits, 
standing stones, and stone circles. Focus on Preseli Hills, Anglesey, West Penwith.
Exclude: Pentre Ifan, Bryn Celli Ddu, Lanyon Quoit, Merry Maidens
Output in the JSON format specified.
```

### Batch 3: Ireland
```
Generate 25 megalithic sites from Ireland. Include passage tombs, portal dolmens, 
court tombs, and stone circles. Cover all provinces.
Exclude: Newgrange, Knowth, Dowth, Carrowmore, Poulnabrone, Loughcrew, Fourknocks, Brownshill, Drombeg
Output in the JSON format specified.
```

### Batch 4: France (Brittany deep dive)
```
Generate 25 megalithic sites from Brittany, France. Include dolmens, menhirs, 
allées couvertes, and stone alignments. Cover Morbihan, Finistère, and Côtes-d'Armor.
Exclude: Carnac, Gavrinis, Locmariaquer, Barnenez
Output in the JSON format specified.
```

### Batch 5: Iberian Peninsula
```
Generate 20 megalithic sites from Spain and Portugal. Include dolmens, menhirs, 
and passage graves. Cover Alentejo, Galicia, Andalusia, and the Basque Country.
Exclude: Antequera Menga/Viera/Romeral, Almendres, Dolmen de Soto, Los Millares
Output in the JSON format specified.
```

### Batch 6: Mediterranean Islands
```
Generate 20 sites from Mediterranean islands. Include:
- Sardinia: nuraghi, giants' tombs
- Corsica: menhir statues, dolmens
- Balearics: talayots, taulas, navetas
- Sicily: rock-cut tombs
Exclude: Su Nuraxi, Ggantija, Hagar Qim, Mnajdra, Hypogeum, Naveta des Tudons, Filitosa
Output in the JSON format specified.
```

### Batch 7: Turkey & Middle East
```
Generate 15 megalithic and ancient monumental sites from Turkey, Syria, Lebanon, 
Jordan, and Israel. Include pre-pottery Neolithic sites, megaliths, and ancient temples.
Exclude: Göbekli Tepe, Karahan Tepe, Baalbek, Petra, Rujm el-Hiri
Output in the JSON format specified.
```

### Batch 8: Africa
```
Generate 20 ancient sites from Africa. Include:
- Egypt: temples, tombs beyond Giza
- Sudan: pyramids, temples
- Ethiopia: stelae, rock churches
- West Africa: stone circles
- Southern Africa: Great Zimbabwe region
Exclude: Giza, Saqqara, Abu Simbel, Karnak, Nabta Playa, Great Zimbabwe, 
Senegambian Circles, Tiya, Axum, Meroë
Output in the JSON format specified.
```

### Batch 9: Asia
```
Generate 20 megalithic and ancient sites from Asia. Include:
- India: dolmens, megaliths (focus on Karnataka, Kerala, Assam)
- Korea: dolmen fields
- Japan: kofun, stone circles
- Southeast Asia: temples, megaliths
Exclude: Angkor Wat, Plain of Jars, Gunung Padang, Mohenjo-daro, Korean Dolmens (Gochang), 
Ishibutai Kofun, Hire Benakal
Output in the JSON format specified.
```

### Batch 10: Americas
```
Generate 25 ancient sites from the Americas. Include:
- North America: mounds, effigy mounds, pueblo ruins
- Mesoamerica: Maya, Zapotec, Olmec sites
- South America: Inca, pre-Inca, Colombian megaliths
Exclude: Machu Picchu, Sacsayhuamán, Ollantaytambo, Tiwanaku, Puma Punku, 
Chichén Itzá, Teotihuacan, Palenque, Tikal, Cahokia, Chaco Canyon, 
Serpent Mound, Easter Island, Nan Madol
Output in the JSON format specified.
```

---

## Step 3: Save JSON Files

Save each batch as:
```
scripts/data-gathering/data/batch-01-scotland.json
scripts/data-gathering/data/batch-02-wales-cornwall.json
scripts/data-gathering/data/batch-03-ireland.json
... etc
```

---

## Step 4: Validate

```bash
# Check each file is valid JSON
npx tsx scripts/data-gathering/import-sites.ts ./scripts/data-gathering/data/*.json --dry-run
```

---

## Step 5: Spot-Check Coordinates

For each batch, pick 3-5 sites and verify coordinates on Google Maps:
1. Copy coordinates from JSON
2. Paste into Google Maps search
3. Verify it matches the site location
4. Fix any that are wrong

---

## Step 6: Import

```bash
# Import all validated files
npx tsx scripts/data-gathering/import-sites.ts ./scripts/data-gathering/data/*.json
```

---

## Expected Results

| Batch | Region | Expected Sites |
|-------|--------|----------------|
| 1 | Scotland | 25 |
| 2 | Wales/Cornwall | 20 |
| 3 | Ireland | 25 |
| 4 | France | 25 |
| 5 | Iberia | 20 |
| 6 | Mediterranean | 20 |
| 7 | Turkey/Middle East | 15 |
| 8 | Africa | 20 |
| 9 | Asia | 20 |
| 10 | Americas | 25 |
| **Total** | | **~215 new sites** |

Combined with existing 100 sites = **~315 sites for launch**

---

## Tips for Better Results

1. **Be specific** - Name the regions, provinces, or archaeological zones
2. **Give examples** - "Sites like X, Y, Z but not those exact ones"
3. **Request variety** - "Include both well-known and lesser-known sites"
4. **Ask for verification** - "Include Wikipedia URL for each site"
5. **Iterate** - If results are poor, refine the prompt and try again

---

## Next: Add Media Content

After importing sites, use `ai-media-prompt.md` to gather:
- Wikimedia Commons images
- YouTube video suggestions
- External reference links








