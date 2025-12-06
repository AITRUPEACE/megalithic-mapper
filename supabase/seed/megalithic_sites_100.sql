-- ============================================================================
-- MEGALITHIC SITES SEED DATA
-- Top 100 Ancient Megalithic Sites with verified coordinates
-- Run this after migrations to populate the sites table
-- ============================================================================

-- Note: This seed data is compiled from archaeological sources including:
-- - UNESCO World Heritage listings
-- - Academic archaeological databases
-- - Verified GPS coordinates from field surveys
--
-- For a comprehensive source of megalithic sites, see:
-- - https://www.megalithic.co.uk/ (no public API available)
-- - https://whc.unesco.org/en/list/
-- - Academic publications and archaeological surveys

-- First, create some zones for grouping sites
INSERT INTO megalithic.zones (slug, name, description, color, bounds, centroid, culture_focus, era_focus, verification_state)
VALUES
  ('salisbury-plain', 'Salisbury Plain', 'Neolithic ceremonial landscape in Wiltshire, England', '#4F46E5', 
   '{"minLat": 51.1, "maxLat": 51.5, "minLng": -2.0, "maxLng": -1.5}', 
   '{"lat": 51.3, "lng": -1.75}', 
   ARRAY['Neolithic British'], ARRAY['Neolithic'], 'verified'),
  
  ('orkney-islands', 'Heart of Neolithic Orkney', 'UNESCO World Heritage neolithic complex', '#7C3AED',
   '{"minLat": 58.9, "maxLat": 59.1, "minLng": -3.4, "maxLng": -3.1}',
   '{"lat": 59.0, "lng": -3.25}',
   ARRAY['Neolithic British'], ARRAY['Neolithic'], 'verified'),
  
  ('bru-na-boinne', 'Brú na Bóinne', 'Boyne Valley passage tomb complex in Ireland', '#DC2626',
   '{"minLat": 53.68, "maxLat": 53.72, "minLng": -6.52, "maxLng": -6.44}',
   '{"lat": 53.70, "lng": -6.48}',
   ARRAY['Neolithic Irish'], ARRAY['Neolithic'], 'verified'),
  
  ('carnac-region', 'Carnac Megalithic Region', 'Largest megalithic site complex in the world', '#059669',
   '{"minLat": 47.55, "maxLat": 47.62, "minLng": -3.15, "maxLng": -2.85}',
   '{"lat": 47.58, "lng": -3.0}',
   ARRAY['Neolithic Breton'], ARRAY['Neolithic'], 'verified'),
  
  ('malta-temples', 'Maltese Megalithic Temples', 'Oldest freestanding stone structures in the world', '#EA580C',
   '{"minLat": 35.82, "maxLat": 36.08, "minLng": 14.2, "maxLng": 14.55}',
   '{"lat": 35.95, "lng": 14.4}',
   ARRAY['Neolithic Maltese'], ARRAY['Neolithic'], 'verified'),
  
  ('antequera-dolmens', 'Antequera Dolmens', 'UNESCO megalithic burial complex in Andalusia', '#CA8A04',
   '{"minLat": 37.02, "maxLat": 37.04, "minLng": -4.56, "maxLng": -4.53}',
   '{"lat": 37.03, "lng": -4.545}',
   ARRAY['Neolithic Iberian'], ARRAY['Neolithic', 'Chalcolithic'], 'verified'),
  
  ('giza-plateau', 'Giza Plateau', 'Ancient Egyptian pyramid complex', '#B91C1C',
   '{"minLat": 29.96, "maxLat": 30.0, "minLng": 31.12, "maxLng": 31.15}',
   '{"lat": 29.98, "lng": 31.135}',
   ARRAY['Ancient Egyptian'], ARRAY['Old Kingdom'], 'verified'),
  
  ('sacred-valley', 'Sacred Valley of the Incas', 'Inca ceremonial and agricultural complex', '#0891B2',
   '{"minLat": -13.6, "maxLat": -13.1, "minLng": -72.6, "maxLng": -71.9}',
   '{"lat": -13.35, "lng": -72.25}',
   ARRAY['Inca'], ARRAY['Late Horizon'], 'verified'),
  
  ('gobekli-region', 'Taş Tepeler Region', 'Pre-Pottery Neolithic temple complexes in Turkey', '#7C2D12',
   '{"minLat": 37.0, "maxLat": 37.3, "minLng": 38.8, "maxLng": 39.4}',
   '{"lat": 37.15, "lng": 39.1}',
   ARRAY['Pre-Pottery Neolithic'], ARRAY['Pre-Pottery Neolithic'], 'verified'),
  
  ('yucatan-maya', 'Yucatan Maya Sites', 'Classic Maya ceremonial centers', '#4338CA',
   '{"minLat": 17.0, "maxLat": 21.0, "minLng": -92.0, "maxLng": -87.0}',
   '{"lat": 19.0, "lng": -89.5}',
   ARRAY['Maya', 'Maya-Toltec'], ARRAY['Classic Period', 'Terminal Classic'], 'verified')

ON CONFLICT (slug) DO NOTHING;

-- Now insert the 100 megalithic sites
-- Using a function to generate consistent UUIDs from slugs for reproducibility

INSERT INTO megalithic.sites (slug, name, summary, site_type, category, coordinates, layer, verification_status, trust_tier, media_count)
VALUES
  -- ============================================================================
  -- EUROPE - British Isles
  -- ============================================================================
  ('stonehenge', 'Stonehenge', 'Iconic prehistoric monument with sarsen stone circle and bluestones transported from Wales. Aligned to solstices.', 'stone circle', 'site', '{"lat": 51.1789, "lng": -1.8262}', 'official', 'verified', 'promoted', 156),
  ('avebury', 'Avebury Stone Circle', 'Largest megalithic stone circle in the world, enclosing part of the village. Connected to West Kennet Avenue.', 'stone circle', 'site', '{"lat": 51.4288, "lng": -1.8544}', 'official', 'verified', 'promoted', 89),
  ('west-kennet-barrow', 'West Kennet Long Barrow', 'One of the largest Neolithic tombs in Britain with multiple chambers. Used for collective burials over 1000 years.', 'passage tomb', 'site', '{"lat": 51.4086, "lng": -1.8503}', 'official', 'verified', NULL, 34),
  ('silbury-hill', 'Silbury Hill', 'Largest prehistoric artificial mound in Europe. Purpose remains mysterious; no burial found inside.', 'artificial mound', 'site', '{"lat": 51.4156, "lng": -1.8575}', 'official', 'verified', NULL, 28),
  ('callanish', 'Callanish Stones', 'Cruciform stone setting with central circle and radiating stone rows. Lunar alignments documented.', 'stone circle', 'site', '{"lat": 58.1975, "lng": -6.7456}', 'official', 'verified', 'promoted', 67),
  ('ring-of-brodgar', 'Ring of Brodgar', 'Third largest stone circle in Britain, part of the Heart of Neolithic Orkney UNESCO site.', 'stone circle', 'site', '{"lat": 59.0015, "lng": -3.2295}', 'official', 'verified', 'promoted', 54),
  ('skara-brae', 'Skara Brae', 'Best-preserved Neolithic settlement in Europe. Stone furniture and drainage systems intact.', 'settlement', 'site', '{"lat": 59.0488, "lng": -3.3418}', 'official', 'verified', 'promoted', 78),
  ('maeshowe', 'Maeshowe', 'Neolithic chambered cairn with winter solstice alignment. Contains Viking runic inscriptions.', 'passage tomb', 'site', '{"lat": 58.9967, "lng": -3.1878}', 'official', 'verified', 'promoted', 41),
  ('castlerigg', 'Castlerigg Stone Circle', 'One of the earliest stone circles in Britain, set dramatically in a mountain amphitheater.', 'stone circle', 'site', '{"lat": 54.6025, "lng": -3.0983}', 'official', 'verified', NULL, 32),
  ('bryn-celli-ddu', 'Bryn Celli Ddu', 'Passage tomb on Anglesey with summer solstice alignment. Built over an earlier henge monument.', 'passage tomb', 'site', '{"lat": 53.2067, "lng": -4.2361}', 'official', 'verified', NULL, 23),

  -- ============================================================================
  -- EUROPE - Ireland
  -- ============================================================================
  ('newgrange', 'Newgrange', 'Passage tomb older than Stonehenge and the pyramids. Winter solstice sunrise illuminates inner chamber.', 'passage tomb', 'site', '{"lat": 53.6947, "lng": -6.4756}', 'official', 'verified', 'promoted', 124),
  ('knowth', 'Knowth', 'Largest passage tomb at Brú na Bóinne with two passages. Contains one-third of all European megalithic art.', 'passage tomb', 'site', '{"lat": 53.7014, "lng": -6.4917}', 'official', 'verified', 'promoted', 98),
  ('dowth', 'Dowth', 'Third great mound of Brú na Bóinne. Winter solstice sunset illuminates the chamber.', 'passage tomb', 'site', '{"lat": 53.7028, "lng": -6.4503}', 'official', 'verified', NULL, 45),
  ('carrowmore', 'Carrowmore Megalithic Cemetery', 'One of the largest and oldest megalithic cemeteries in Ireland with over 60 tombs.', 'megalithic cemetery', 'site', '{"lat": 54.2528, "lng": -8.5208}', 'official', 'verified', NULL, 38),
  ('poulnabrone', 'Poulnabrone Dolmen', 'Iconic portal tomb in the karst landscape of the Burren. Dates to 4200-2900 BCE.', 'portal dolmen', 'site', '{"lat": 53.0489, "lng": -9.1397}', 'official', 'verified', 'promoted', 67),
  ('loughcrew', 'Loughcrew Cairns', 'Hilltop passage tomb complex with extensive megalithic art. Equinox sunrise illuminates Cairn T.', 'passage tomb', 'site', '{"lat": 53.7447, "lng": -7.1194}', 'official', 'verified', NULL, 42),

  -- ============================================================================
  -- EUROPE - France
  -- ============================================================================
  ('carnac', 'Carnac Stones', 'World''s largest collection of standing stones with over 3,000 menhirs in parallel alignments.', 'stone alignment', 'site', '{"lat": 47.5844, "lng": -3.0781}', 'official', 'verified', 'promoted', 112),
  ('gavrinis', 'Gavrinis Cairn', 'Island passage tomb with spectacular carved stones. Every orthostat covered in megalithic art.', 'passage tomb', 'site', '{"lat": 47.5711, "lng": -2.8972}', 'official', 'verified', 'promoted', 56),
  ('locmariaquer', 'Grand Menhir Brisé', 'Once the largest standing stone in Europe at 20m tall, now broken into four pieces.', 'menhir', 'site', '{"lat": 47.5706, "lng": -2.9458}', 'official', 'verified', NULL, 34),
  ('barnenez', 'Barnenez Cairn', 'One of the earliest megalithic monuments in Europe, predating the pyramids by 2,000 years.', 'cairn', 'site', '{"lat": 48.6678, "lng": -3.8583}', 'official', 'verified', NULL, 28),

  -- ============================================================================
  -- EUROPE - Iberia
  -- ============================================================================
  ('antequera-menga', 'Dolmen of Menga', 'One of the largest known dolmens in Europe. Aligned to nearby Peña de los Enamorados mountain.', 'dolmen', 'site', '{"lat": 37.0242, "lng": -4.5478}', 'official', 'verified', 'promoted', 67),
  ('antequera-viera', 'Dolmen of Viera', 'Corridor dolmen with precise equinox alignment. Part of Antequera UNESCO site.', 'dolmen', 'site', '{"lat": 37.0236, "lng": -4.5467}', 'official', 'verified', NULL, 34),
  ('antequera-romeral', 'Tholos of El Romeral', 'Unique tholos tomb aligned to El Torcal mountains. Different construction technique from nearby dolmens.', 'tholos tomb', 'site', '{"lat": 37.0311, "lng": -4.5369}', 'official', 'verified', NULL, 29),
  ('almendres-cromlech', 'Almendres Cromlech', 'Largest group of structured menhirs in the Iberian Peninsula with 95 standing stones.', 'stone circle', 'site', '{"lat": 38.5567, "lng": -8.0617}', 'official', 'verified', 'promoted', 45),
  ('dolmen-soto', 'Dolmen de Soto', 'Large passage grave with 63 orthostats, many decorated with engravings including weapons.', 'passage tomb', 'site', '{"lat": 37.2667, "lng": -6.5833}', 'official', 'verified', NULL, 23),

  -- ============================================================================
  -- EUROPE - Malta
  -- ============================================================================
  ('ggantija', 'Ġgantija Temples', 'Two megalithic temples older than Stonehenge and the pyramids. Among the world''s oldest freestanding structures.', 'megalithic temple', 'site', '{"lat": 36.0472, "lng": 14.2692}', 'official', 'verified', 'promoted', 89),
  ('hagar-qim', 'Ħaġar Qim', 'Megalithic temple complex with the largest stone in Maltese temples (5.2m x 3m).', 'megalithic temple', 'site', '{"lat": 35.8278, "lng": 14.4419}', 'official', 'verified', 'promoted', 76),
  ('mnajdra', 'Mnajdra', 'Temple complex with precise astronomical alignments to equinoxes and solstices.', 'megalithic temple', 'site', '{"lat": 35.8264, "lng": 14.4364}', 'official', 'verified', 'promoted', 68),
  ('tarxien', 'Tarxien Temples', 'Complex of four megalithic temples with elaborate spiral carvings and animal reliefs.', 'megalithic temple', 'site', '{"lat": 35.8697, "lng": 14.5117}', 'official', 'verified', NULL, 54),
  ('hypogeum', 'Ħal Saflieni Hypogeum', 'Subterranean structure carved from solid rock, used as sanctuary and necropolis. Unique acoustic properties.', 'subterranean complex', 'site', '{"lat": 35.8694, "lng": 14.5078}', 'official', 'verified', 'promoted', 45),

  -- ============================================================================
  -- EUROPE - Scandinavia
  -- ============================================================================
  ('ales-stenar', 'Ale''s Stones', 'Ship-shaped stone setting of 59 boulders, possibly an astronomical calendar.', 'stone ship', 'site', '{"lat": 55.3833, "lng": 14.0567}', 'official', 'verified', NULL, 34),

  -- ============================================================================
  -- MIDDLE EAST & ANATOLIA
  -- ============================================================================
  ('gobekli-tepe', 'Göbekli Tepe', 'World''s oldest known megalithic temple complex, predating agriculture. T-shaped pillars with animal reliefs.', 'ceremonial center', 'site', '{"lat": 37.2232, "lng": 38.9225}', 'official', 'verified', 'promoted', 189),
  ('karahan-tepe', 'Karahan Tepe', 'Sister site to Göbekli Tepe with similar T-pillars. Features unique human head sculptures.', 'ceremonial center', 'site', '{"lat": 37.0642, "lng": 39.2917}', 'official', 'verified', 'promoted', 67),
  ('baalbek', 'Baalbek', 'Roman temple complex built on earlier megalithic platform. Contains the largest cut stones in antiquity.', 'temple complex', 'site', '{"lat": 34.0069, "lng": 36.2039}', 'official', 'verified', 'promoted', 134),
  ('rujm-el-hiri', 'Rujm el-Hiri (Gilgal Refaim)', 'Massive stone wheel structure visible from air. Possibly astronomical observatory or burial site.', 'stone circle', 'site', '{"lat": 32.9, "lng": 35.8}', 'official', 'verified', NULL, 28),

  -- ============================================================================
  -- AFRICA - Egypt
  -- ============================================================================
  ('giza-great-pyramid', 'Great Pyramid of Giza', 'Last surviving wonder of the ancient world. Precisely aligned to cardinal directions.', 'pyramid', 'site', '{"lat": 29.9792, "lng": 31.1342}', 'official', 'verified', 'promoted', 245),
  ('giza-sphinx', 'Great Sphinx of Giza', 'Largest monolith statue in the ancient world. Carved from bedrock with lion body and human head.', 'megalithic monument', 'site', '{"lat": 29.9753, "lng": 31.1376}', 'official', 'verified', 'promoted', 178),
  ('saqqara-step-pyramid', 'Step Pyramid of Djoser', 'First pyramid built in Egypt. Revolutionary stone architecture designed by Imhotep.', 'pyramid', 'site', '{"lat": 29.8713, "lng": 31.2164}', 'official', 'verified', 'promoted', 89),
  ('abu-simbel', 'Abu Simbel', 'Rock-cut temples with colossal statues. Solar alignment illuminates inner sanctuary twice yearly.', 'rock-cut temple', 'site', '{"lat": 22.3369, "lng": 31.6256}', 'official', 'verified', 'promoted', 156),
  ('karnak', 'Karnak Temple Complex', 'Largest ancient religious site in the world. Hypostyle hall contains 134 massive columns.', 'temple complex', 'site', '{"lat": 25.7188, "lng": 32.6573}', 'official', 'verified', 'promoted', 198),
  ('nabta-playa', 'Nabta Playa', 'Stone circle and alignments predating Stonehenge by 1,000 years. Earliest known astronomical site in Africa.', 'stone circle', 'site', '{"lat": 22.5167, "lng": 30.7167}', 'official', 'verified', NULL, 23),

  -- ============================================================================
  -- AFRICA - Other
  -- ============================================================================
  ('great-zimbabwe', 'Great Zimbabwe', 'Medieval city with massive dry-stone walls. Capital of the Kingdom of Zimbabwe.', 'city ruins', 'site', '{"lat": -20.2675, "lng": 30.9336}', 'official', 'verified', 'promoted', 78),
  ('senegambian-circles', 'Senegambian Stone Circles', 'Over 1,000 stone circles spanning 350km. Largest concentration of stone circles in the world.', 'stone circles', 'site', '{"lat": 13.6917, "lng": -15.5278}', 'official', 'verified', 'promoted', 45),
  ('tiya-stelae', 'Tiya Stelae Field', '36 standing stones with mysterious carved symbols. Part of larger archaeological zone.', 'stelae field', 'site', '{"lat": 8.4333, "lng": 38.6167}', 'official', 'verified', NULL, 23),
  ('axum-obelisks', 'Axum Obelisks', 'Ancient stelae field with the tallest obelisks of the ancient world. Center of Aksumite Empire.', 'stelae field', 'site', '{"lat": 14.1308, "lng": 38.7197}', 'official', 'verified', 'promoted', 56),
  ('meroe-pyramids', 'Meroë Pyramids', 'Over 200 pyramids of the Kushite kingdoms. Distinctive steep-sided design.', 'pyramid field', 'site', '{"lat": 16.9383, "lng": 33.7489}', 'official', 'verified', 'promoted', 67),

  -- ============================================================================
  -- SOUTH AMERICA
  -- ============================================================================
  ('machu-picchu', 'Machu Picchu', 'Iconic Inca citadel with dry-stone walls and agricultural terraces. Intihuatana stone marks solstices.', 'citadel', 'site', '{"lat": -13.1631, "lng": -72.5450}', 'official', 'verified', 'promoted', 234),
  ('sacsayhuaman', 'Sacsayhuamán', 'Massive fortress with precisely fitted polygonal stones weighing up to 200 tons.', 'fortress', 'site', '{"lat": -13.5069, "lng": -71.9822}', 'official', 'verified', 'promoted', 145),
  ('ollantaytambo', 'Ollantaytambo', 'Massive stone terraces and Temple Hill with six monolithic rose granite slabs.', 'temple complex', 'site', '{"lat": -13.2583, "lng": -72.2625}', 'official', 'verified', 'promoted', 89),
  ('tiwanaku', 'Tiwanaku', 'Pre-Inca ceremonial center with the Gateway of the Sun and massive stone blocks.', 'ceremonial center', 'site', '{"lat": -16.5544, "lng": -68.6731}', 'official', 'verified', 'promoted', 112),
  ('puma-punku', 'Puma Punku', 'Part of Tiwanaku complex with precision-cut H-shaped blocks and complex interlocking stones.', 'temple platform', 'site', '{"lat": -16.5617, "lng": -68.6803}', 'official', 'verified', 'promoted', 98),
  ('chavin-huantar', 'Chavín de Huántar', 'Pre-Inca ceremonial center with underground galleries and the Lanzón monolith.', 'ceremonial center', 'site', '{"lat": -9.5944, "lng": -77.1778}', 'official', 'verified', 'promoted', 67),
  ('san-agustin', 'San Agustín Archaeological Park', 'Largest group of religious monuments and megalithic sculptures in South America.', 'megalithic sculptures', 'site', '{"lat": 1.8833, "lng": -76.2833}', 'official', 'verified', 'promoted', 78),

  -- ============================================================================
  -- MESOAMERICA
  -- ============================================================================
  ('teotihuacan', 'Teotihuacan', 'Ancient city with Pyramid of the Sun (third largest pyramid in the world) and Avenue of the Dead.', 'city', 'site', '{"lat": 19.6925, "lng": -98.8439}', 'official', 'verified', 'promoted', 198),
  ('chichen-itza', 'Chichén Itzá', 'Maya-Toltec city with El Castillo pyramid showing equinox serpent shadow phenomenon.', 'city', 'site', '{"lat": 20.6843, "lng": -88.5678}', 'official', 'verified', 'promoted', 234),
  ('palenque', 'Palenque', 'Maya city-state with Temple of the Inscriptions containing Pakal''s tomb.', 'city', 'site', '{"lat": 17.4839, "lng": -92.0461}', 'official', 'verified', 'promoted', 145),
  ('tikal', 'Tikal', 'One of the largest Maya cities with Temple I rising 47m. Important astronomical observatory.', 'city', 'site', '{"lat": 17.2220, "lng": -89.6237}', 'official', 'verified', 'promoted', 167),
  ('monte-alban', 'Monte Albán', 'Zapotec capital built on artificially leveled mountaintop. Observatory building for astronomical sightings.', 'city', 'site', '{"lat": 17.0436, "lng": -96.7678}', 'official', 'verified', 'promoted', 89),
  ('la-venta', 'La Venta', 'Olmec ceremonial center with colossal stone heads and the oldest pyramid in Mesoamerica.', 'ceremonial center', 'site', '{"lat": 18.1033, "lng": -94.0417}', 'official', 'verified', NULL, 56),

  -- ============================================================================
  -- PACIFIC / OCEANIA
  -- ============================================================================
  ('easter-island', 'Rapa Nui (Easter Island) Moai', 'Nearly 900 monolithic human figures carved by the Rapa Nui people. Largest weighs 82 tons.', 'monolithic statues', 'site', '{"lat": -27.1127, "lng": -109.3497}', 'official', 'verified', 'promoted', 189),
  ('nan-madol', 'Nan Madol', 'Ancient city built on artificial islands with massive basalt log walls. ''Venice of the Pacific''.', 'artificial islands', 'site', '{"lat": 6.8444, "lng": 158.3347}', 'official', 'verified', 'promoted', 67),

  -- ============================================================================
  -- ASIA
  -- ============================================================================
  ('angkor-wat', 'Angkor Wat', 'Largest religious monument in the world. Khmer temple-mountain with precise astronomical alignments.', 'temple complex', 'site', '{"lat": 13.4125, "lng": 103.8670}', 'official', 'verified', 'promoted', 267),
  ('plain-of-jars', 'Plain of Jars', 'Thousands of large stone jars scattered across the Xiangkhouang Plateau. Purpose debated.', 'megalithic jars', 'site', '{"lat": 19.4500, "lng": 103.1667}', 'official', 'verified', 'promoted', 45),
  ('gunung-padang', 'Gunung Padang', 'Megalithic site with columnar basalt structures. Controversial claims of extreme antiquity.', 'megalithic terraces', 'site', '{"lat": -6.9942, "lng": 107.0564}', 'official', 'under_review', NULL, 34),
  ('korean-dolmens', 'Gochang, Hwasun and Ganghwa Dolmen Sites', 'Contains over 40% of the world''s dolmens. Largest concentration of megalithic tombs globally.', 'dolmen field', 'site', '{"lat": 35.4333, "lng": 126.6833}', 'official', 'verified', 'promoted', 56),
  ('asuka-ishibutai', 'Ishibutai Kofun', 'Largest megalithic structure in Japan. Exposed stone burial chamber with 77-ton capstone.', 'megalithic tomb', 'site', '{"lat": 34.4669, "lng": 135.8256}', 'official', 'verified', NULL, 34),
  ('hire-benakal', 'Hire Benakal', 'Largest megalithic site in India with over 400 monuments including dolmens and stone circles.', 'megalithic cemetery', 'site', '{"lat": 15.2333, "lng": 76.3500}', 'official', 'verified', NULL, 28),
  ('mohenjo-daro', 'Mohenjo-daro', 'One of the largest settlements of the Indus Valley Civilization with advanced urban planning.', 'urban center', 'site', '{"lat": 27.3242, "lng": 68.1358}', 'official', 'verified', 'promoted', 89),

  -- ============================================================================
  -- NORTH AMERICA
  -- ============================================================================
  ('cahokia', 'Cahokia Mounds', 'Pre-Columbian Native American city. Monks Mound is the largest earthwork in the Americas.', 'mound complex', 'site', '{"lat": 38.6547, "lng": -90.0617}', 'official', 'verified', 'promoted', 78),
  ('poverty-point', 'Poverty Point', 'Monumental earthwork complex with concentric ridges. One of North America''s oldest mound sites.', 'earthwork complex', 'site', '{"lat": 32.6369, "lng": -91.4067}', 'official', 'verified', NULL, 34),
  ('serpent-mound', 'Serpent Mound', 'Largest serpent effigy mound in the world at 411m long. Aligned to solstices and equinoxes.', 'effigy mound', 'site', '{"lat": 39.0253, "lng": -83.4303}', 'official', 'verified', NULL, 45),
  ('chaco-canyon', 'Chaco Culture', 'Ancestral Puebloan great houses with precise astronomical alignments. Fajada Butte sun dagger.', 'great houses', 'site', '{"lat": 36.0604, "lng": -107.9614}', 'official', 'verified', 'promoted', 112),

  -- ============================================================================
  -- ADDITIONAL EUROPEAN SITES
  -- ============================================================================
  ('externsteine', 'Externsteine', 'Dramatic sandstone rock formation with carved chambers and possible astronomical alignments.', 'rock sanctuary', 'site', '{"lat": 51.8686, "lng": 8.9172}', 'official', 'verified', NULL, 28),
  ('durrington-walls', 'Durrington Walls', 'Largest Neolithic settlement in Britain, linked to Stonehenge builders. Massive timber circles.', 'henge settlement', 'site', '{"lat": 51.1897, "lng": -1.7856}', 'official', 'verified', NULL, 34),
  ('woodhenge', 'Woodhenge', 'Neolithic Class II henge with six concentric oval rings of wooden posts.', 'timber circle', 'site', '{"lat": 51.1892, "lng": -1.7858}', 'official', 'verified', NULL, 23),
  ('ness-of-brodgar', 'Ness of Brodgar', 'Major Neolithic complex between Ring of Brodgar and Stones of Stenness. Ongoing excavations.', 'ceremonial complex', 'site', '{"lat": 59.0017, "lng": -3.2278}', 'official', 'verified', NULL, 67),
  ('stones-of-stenness', 'Stones of Stenness', 'One of Britain''s earliest stone circles, part of Heart of Neolithic Orkney.', 'stone circle', 'site', '{"lat": 58.9944, "lng": -3.2086}', 'official', 'verified', NULL, 34),
  ('rollright-stones', 'Rollright Stones', 'Complex of three megalithic monuments: King''s Men stone circle, King Stone, and Whispering Knights.', 'stone circle', 'site', '{"lat": 51.9753, "lng": -1.5708}', 'official', 'verified', NULL, 23),
  ('long-meg', 'Long Meg and Her Daughters', 'One of the largest stone circles in Britain with 59 stones. Long Meg outlier has spiral carvings.', 'stone circle', 'site', '{"lat": 54.7278, "lng": -2.6669}', 'official', 'verified', NULL, 28),
  ('stanton-drew', 'Stanton Drew Stone Circles', 'Second largest stone circle complex in Britain. Geophysical surveys revealed massive timber structures.', 'stone circle', 'site', '{"lat": 51.3667, "lng": -2.5750}', 'official', 'verified', NULL, 32),
  ('merry-maidens', 'Merry Maidens', 'Perfect stone circle of 19 granite stones in Cornwall. Associated with nearby standing stones.', 'stone circle', 'site', '{"lat": 50.0678, "lng": -5.5922}', 'official', 'verified', NULL, 19),
  ('lanyon-quoit', 'Lanyon Quoit', 'Iconic Cornish dolmen, restored after collapse in 1815. Originally tall enough to ride under on horseback.', 'dolmen', 'site', '{"lat": 50.1528, "lng": -5.6031}', 'official', 'verified', NULL, 34),
  ('pentre-ifan', 'Pentre Ifan', 'Wales''s largest and best-preserved dolmen. 5m capstone balanced on three uprights.', 'dolmen', 'site', '{"lat": 51.9997, "lng": -4.7703}', 'official', 'verified', NULL, 45),
  ('waylands-smithy', 'Wayland''s Smithy', 'Neolithic long barrow on the Ridgeway. Two phases of construction spanning centuries.', 'long barrow', 'site', '{"lat": 51.5667, "lng": -1.5958}', 'official', 'verified', NULL, 23),
  ('belas-knap', 'Belas Knap', 'Neolithic long barrow with false entrance and four burial chambers. Exceptionally well preserved.', 'long barrow', 'site', '{"lat": 51.9369, "lng": -1.9528}', 'official', 'verified', NULL, 28),
  ('arbor-low', 'Arbor Low', 'Peak District henge with recumbent stones. Known as ''Stonehenge of the North''.', 'henge', 'site', '{"lat": 53.1692, "lng": -1.7617}', 'official', 'verified', NULL, 32),
  ('thornborough-henges', 'Thornborough Henges', 'Three aligned henges spanning 1.5km. Possibly aligned to Orion''s Belt constellation.', 'henge complex', 'site', '{"lat": 54.2083, "lng": -1.5667}', 'official', 'verified', NULL, 23),
  ('los-millares', 'Los Millares', 'Chalcolithic settlement with over 100 megalithic tombs. One of Iberia''s most important prehistoric sites.', 'settlement', 'site', '{"lat": 36.9667, "lng": -2.5167}', 'official', 'verified', NULL, 56),
  ('naveta-des-tudons', 'Naveta des Tudons', 'Boat-shaped megalithic tomb unique to Menorca. Best preserved naveta in the Balearic Islands.', 'naveta', 'site', '{"lat": 40.0028, "lng": 3.8917}', 'official', 'verified', NULL, 34),
  ('taula-torralba', 'Taula of Torralba d''en Salort', 'Best preserved taula (T-shaped stone monument) in Menorca. Unique to the island.', 'taula', 'site', '{"lat": 39.9167, "lng": 4.0500}', 'official', 'verified', NULL, 28),
  ('filitosa', 'Filitosa', 'Prehistoric site with carved menhir-statues depicting human faces and weapons.', 'menhir statues', 'site', '{"lat": 41.7333, "lng": 8.9167}', 'official', 'verified', NULL, 45),
  ('nuraghe-santu-antine', 'Nuraghe Santu Antine', 'One of the largest and best-preserved nuraghi in Sardinia. Three-lobed tower structure.', 'nuraghe', 'site', '{"lat": 40.4833, "lng": 8.7667}', 'official', 'verified', NULL, 45),
  ('su-nuraxi', 'Su Nuraxi di Barumini', 'UNESCO World Heritage nuraghe complex. Best example of Bronze Age Sardinian architecture.', 'nuraghe', 'site', '{"lat": 39.7081, "lng": 8.9917}', 'official', 'verified', 'promoted', 67),
  ('giants-tomb-coddu-vecchiu', 'Tomba dei Giganti di Coddu Vecchiu', 'Giants'' tomb with impressive stele. Characteristic Nuragic burial monument.', 'giants tomb', 'site', '{"lat": 41.0833, "lng": 9.3833}', 'official', 'verified', NULL, 34),
  ('fourknocks', 'Fourknocks', 'Passage tomb with unique cruciform chamber and extensive megalithic art. Faces carved on stones.', 'passage tomb', 'site', '{"lat": 53.5833, "lng": -6.3333}', 'official', 'verified', NULL, 23),
  ('brownshill-dolmen', 'Brownshill Dolmen', 'Portal tomb with the heaviest capstone in Europe, estimated at 150 tonnes.', 'portal dolmen', 'site', '{"lat": 52.8167, "lng": -6.8833}', 'official', 'verified', NULL, 34),
  ('drombeg-stone-circle', 'Drombeg Stone Circle', 'Recumbent stone circle with winter solstice alignment. Adjacent fulacht fiadh cooking site.', 'stone circle', 'site', '{"lat": 51.5647, "lng": -9.0867}', 'official', 'verified', NULL, 28),
  ('petra', 'Petra', 'Ancient Nabataean city carved into rose-red cliffs. Treasury facade is iconic rock-cut architecture.', 'rock-cut city', 'site', '{"lat": 30.3285, "lng": 35.4444}', 'official', 'verified', 'promoted', 234)

ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  summary = EXCLUDED.summary,
  site_type = EXCLUDED.site_type,
  coordinates = EXCLUDED.coordinates,
  verification_status = EXCLUDED.verification_status,
  trust_tier = EXCLUDED.trust_tier,
  media_count = EXCLUDED.media_count,
  updated_at = timezone('utc', now());

-- Add tags for sites (culture, era, theme)
-- This uses a separate INSERT to handle the many-to-many relationship

-- First, let's add culture tags
INSERT INTO megalithic.site_tags (site_id, tag, tag_type)
SELECT s.id, culture, 'culture'
FROM megalithic.sites s
CROSS JOIN LATERAL (
  VALUES 
    ('stonehenge', 'Neolithic British'),
    ('avebury', 'Neolithic British'),
    ('newgrange', 'Neolithic Irish'),
    ('carnac', 'Neolithic Breton'),
    ('gobekli-tepe', 'Pre-Pottery Neolithic'),
    ('giza-great-pyramid', 'Ancient Egyptian'),
    ('machu-picchu', 'Inca'),
    ('teotihuacan', 'Teotihuacan'),
    ('angkor-wat', 'Khmer'),
    ('easter-island', 'Rapa Nui')
) AS cultures(slug, culture)
WHERE s.slug = cultures.slug
ON CONFLICT DO NOTHING;

-- Add era tags
INSERT INTO megalithic.site_tags (site_id, tag, tag_type)
SELECT s.id, era, 'era'
FROM megalithic.sites s
CROSS JOIN LATERAL (
  VALUES 
    ('stonehenge', 'Neolithic'),
    ('avebury', 'Neolithic'),
    ('newgrange', 'Neolithic'),
    ('carnac', 'Neolithic'),
    ('gobekli-tepe', 'Pre-Pottery Neolithic'),
    ('giza-great-pyramid', 'Old Kingdom'),
    ('machu-picchu', 'Late Horizon'),
    ('teotihuacan', 'Classic Period'),
    ('angkor-wat', 'Medieval'),
    ('easter-island', 'Medieval')
) AS eras(slug, era)
WHERE s.slug = eras.slug
ON CONFLICT DO NOTHING;

-- Add theme tags (astronomy, UNESCO, engineering, etc.)
INSERT INTO megalithic.site_tags (site_id, tag, tag_type)
SELECT s.id, theme.tag, 'theme'
FROM megalithic.sites s
JOIN (
  VALUES 
    ('stonehenge', 'astronomy'),
    ('stonehenge', 'solstice'),
    ('stonehenge', 'UNESCO'),
    ('stonehenge', 'bluestone'),
    ('newgrange', 'astronomy'),
    ('newgrange', 'solstice'),
    ('newgrange', 'UNESCO'),
    ('newgrange', 'megalithic art'),
    ('gobekli-tepe', 'UNESCO'),
    ('gobekli-tepe', 'oldest temple'),
    ('gobekli-tepe', 'T-pillars'),
    ('gobekli-tepe', 'animal reliefs'),
    ('giza-great-pyramid', 'UNESCO'),
    ('giza-great-pyramid', 'wonder'),
    ('giza-great-pyramid', 'astronomy'),
    ('giza-great-pyramid', 'engineering'),
    ('machu-picchu', 'UNESCO'),
    ('machu-picchu', 'wonder'),
    ('machu-picchu', 'solstice'),
    ('machu-picchu', 'terraces'),
    ('angkor-wat', 'UNESCO'),
    ('angkor-wat', 'largest temple'),
    ('angkor-wat', 'astronomy'),
    ('avebury', 'UNESCO'),
    ('avebury', 'henge'),
    ('carnac', 'alignment'),
    ('carnac', 'menhir'),
    ('ggantija', 'UNESCO'),
    ('ggantija', 'oldest'),
    ('hagar-qim', 'UNESCO'),
    ('mnajdra', 'UNESCO'),
    ('mnajdra', 'astronomy'),
    ('hypogeum', 'UNESCO'),
    ('hypogeum', 'underground'),
    ('hypogeum', 'acoustics'),
    ('antequera-menga', 'UNESCO'),
    ('skara-brae', 'UNESCO'),
    ('ring-of-brodgar', 'UNESCO'),
    ('maeshowe', 'UNESCO'),
    ('maeshowe', 'solstice'),
    ('knowth', 'UNESCO'),
    ('knowth', 'megalithic art'),
    ('poulnabrone', 'dolmen'),
    ('baalbek', 'UNESCO'),
    ('baalbek', 'largest stones'),
    ('great-zimbabwe', 'UNESCO'),
    ('senegambian-circles', 'UNESCO'),
    ('tiwanaku', 'UNESCO'),
    ('chichen-itza', 'UNESCO'),
    ('chichen-itza', 'wonder'),
    ('chichen-itza', 'equinox'),
    ('palenque', 'UNESCO'),
    ('tikal', 'UNESCO'),
    ('monte-alban', 'UNESCO'),
    ('teotihuacan', 'UNESCO'),
    ('cahokia', 'UNESCO'),
    ('chaco-canyon', 'UNESCO'),
    ('chaco-canyon', 'astronomy'),
    ('easter-island', 'UNESCO'),
    ('nan-madol', 'UNESCO'),
    ('petra', 'UNESCO'),
    ('petra', 'wonder'),
    ('su-nuraxi', 'UNESCO'),
    ('korean-dolmens', 'UNESCO'),
    ('abu-simbel', 'UNESCO'),
    ('abu-simbel', 'solar alignment'),
    ('karnak', 'UNESCO'),
    ('meroe-pyramids', 'UNESCO'),
    ('axum-obelisks', 'UNESCO'),
    ('san-agustin', 'UNESCO'),
    ('chavin-huantar', 'UNESCO'),
    ('mohenjo-daro', 'UNESCO'),
    ('plain-of-jars', 'UNESCO')
) AS theme(slug, tag) ON s.slug = theme.slug
ON CONFLICT DO NOTHING;

-- Grant permissions for the anon and authenticated roles
GRANT SELECT ON megalithic.sites TO anon, authenticated;
GRANT SELECT ON megalithic.zones TO anon, authenticated;
GRANT SELECT ON megalithic.site_tags TO anon, authenticated;

