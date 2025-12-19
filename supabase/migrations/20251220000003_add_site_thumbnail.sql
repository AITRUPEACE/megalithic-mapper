-- Add thumbnail_url column to sites table
-- This stores the primary image URL for each site (from Wikimedia Commons)

ALTER TABLE megalithic.sites 
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- Add index for sites that have thumbnails (useful for filtering)
CREATE INDEX IF NOT EXISTS idx_sites_has_thumbnail 
ON megalithic.sites ((thumbnail_url IS NOT NULL));

-- Comment for documentation
COMMENT ON COLUMN megalithic.sites.thumbnail_url IS 
  'Primary image URL for the site, typically from Wikimedia Commons. Used in map tooltips, list views, and cards.';
