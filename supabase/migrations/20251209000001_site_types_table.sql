-- Create standardized site_types table
-- This provides consistent categorization for filtering, icons, and colors

CREATE TABLE IF NOT EXISTS megalithic.site_types (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL DEFAULT 'default',
  color TEXT NOT NULL DEFAULT '#64748b',
  sort_order INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE megalithic.site_types ENABLE ROW LEVEL SECURITY;

-- Everyone can read site types
DROP POLICY IF EXISTS "Site types are viewable by everyone" ON megalithic.site_types;
CREATE POLICY "Site types are viewable by everyone" 
  ON megalithic.site_types FOR SELECT 
  USING (true);

-- Insert standard site types
INSERT INTO megalithic.site_types (id, name, description, icon, color, sort_order) VALUES
  ('pyramid', 'Pyramid', 'Pyramidal structures including step pyramids and true pyramids', 'pyramid', '#f59e0b', 1),
  ('temple', 'Temple', 'Religious and spiritual buildings, shrines, sanctuaries', 'temple', '#8b5cf6', 2),
  ('megalith', 'Megalith', 'Standing stones, dolmens, menhirs, and megalithic monuments', 'megalith', '#6366f1', 3),
  ('stone_circle', 'Stone Circle', 'Circular stone arrangements, henges, and ring monuments', 'stone-circle', '#06b6d4', 4),
  ('mound', 'Mound', 'Burial mounds, tumuli, barrows, and earthen structures', 'mound', '#84cc16', 5),
  ('tomb', 'Tomb', 'Burial chambers, passage tombs, crypts, and catacombs', 'tomb', '#10b981', 6),
  ('fortress', 'Fortress', 'Defensive walls, forts, citadels, and hillforts', 'wall', '#78716c', 7),
  ('city', 'Ancient City', 'Ancient cities, settlements, and urban complexes', 'city', '#14b8a6', 8),
  ('cave', 'Cave', 'Caves, rock shelters, grottos with cultural significance', 'cave', '#92400e', 9),
  ('underwater', 'Underwater', 'Submerged sites, sunken cities, underwater ruins', 'underwater', '#0891b2', 10),
  ('geoglyph', 'Geoglyph', 'Ground drawings, Nazca lines, effigies, and land art', 'geoglyph', '#f97316', 11),
  ('observatory', 'Observatory', 'Astronomical alignments, calendar sites, solar markers', 'observatory', '#3b82f6', 12),
  ('statue', 'Statue', 'Monumental sculptures, moai, colossi, carved figures', 'statue', '#ec4899', 13),
  ('ruins', 'Ruins', 'General archaeological ruins and unspecified sites', 'ruins', '#a1a1aa', 14),
  ('unknown', 'Unknown', 'Unclassified or mysterious sites awaiting categorization', 'unknown', '#64748b', 15)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  sort_order = EXCLUDED.sort_order;

-- Add site_type_id to sites table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'megalithic' 
    AND table_name = 'sites' 
    AND column_name = 'site_type_id'
  ) THEN
    ALTER TABLE megalithic.sites ADD COLUMN site_type_id TEXT REFERENCES megalithic.site_types(id);
  END IF;
END $$;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_sites_site_type_id ON megalithic.sites(site_type_id);

-- Function to normalize legacy site_type text to new site_type_id
CREATE OR REPLACE FUNCTION megalithic.normalize_site_type(legacy_type TEXT)
RETURNS TEXT AS $$
DECLARE
  normalized TEXT;
BEGIN
  normalized := LOWER(TRIM(legacy_type));
  
  -- Pyramid variations
  IF normalized LIKE '%pyramid%' THEN RETURN 'pyramid'; END IF;
  
  -- Temple variations
  IF normalized LIKE '%temple%' OR normalized LIKE '%shrine%' OR normalized LIKE '%sanctuary%' THEN RETURN 'temple'; END IF;
  
  -- Stone circle variations
  IF normalized LIKE '%circle%' OR normalized LIKE '%henge%' OR normalized LIKE '%ring%' THEN RETURN 'stone_circle'; END IF;
  
  -- Megalith variations
  IF normalized LIKE '%megalith%' OR normalized LIKE '%dolmen%' OR normalized LIKE '%menhir%' OR normalized LIKE '%standing stone%' THEN RETURN 'megalith'; END IF;
  
  -- Mound variations
  IF normalized LIKE '%mound%' OR normalized LIKE '%tumulus%' OR normalized LIKE '%barrow%' OR normalized LIKE '%cairn%' THEN RETURN 'mound'; END IF;
  
  -- Tomb variations
  IF normalized LIKE '%tomb%' OR normalized LIKE '%burial%' OR normalized LIKE '%crypt%' OR normalized LIKE '%passage%' THEN RETURN 'tomb'; END IF;
  
  -- Fortress variations
  IF normalized LIKE '%wall%' OR normalized LIKE '%fort%' OR normalized LIKE '%citadel%' OR normalized LIKE '%hillfort%' THEN RETURN 'fortress'; END IF;
  
  -- City variations
  IF normalized LIKE '%city%' OR normalized LIKE '%settlement%' OR normalized LIKE '%complex%' THEN RETURN 'city'; END IF;
  
  -- Cave variations
  IF normalized LIKE '%cave%' OR normalized LIKE '%grotto%' OR normalized LIKE '%rock%' OR normalized LIKE '%shelter%' THEN RETURN 'cave'; END IF;
  
  -- Underwater variations
  IF normalized LIKE '%underwater%' OR normalized LIKE '%submerged%' OR normalized LIKE '%sunken%' THEN RETURN 'underwater'; END IF;
  
  -- Geoglyph variations
  IF normalized LIKE '%geoglyph%' OR normalized LIKE '%nazca%' OR normalized LIKE '%lines%' OR normalized LIKE '%effigy%' THEN RETURN 'geoglyph'; END IF;
  
  -- Observatory variations
  IF normalized LIKE '%observ%' OR normalized LIKE '%astronomical%' OR normalized LIKE '%align%' THEN RETURN 'observatory'; END IF;
  
  -- Statue variations
  IF normalized LIKE '%statue%' OR normalized LIKE '%moai%' OR normalized LIKE '%sculpture%' OR normalized LIKE '%coloss%' THEN RETURN 'statue'; END IF;
  
  -- Ruins
  IF normalized LIKE '%ruin%' THEN RETURN 'ruins'; END IF;
  
  -- Default to unknown
  RETURN 'unknown';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Migrate existing sites to use normalized site_type_id
UPDATE megalithic.sites 
SET site_type_id = megalithic.normalize_site_type(site_type)
WHERE site_type_id IS NULL AND site_type IS NOT NULL;

COMMENT ON TABLE megalithic.site_types IS 'Standardized site type categories for consistent classification';



