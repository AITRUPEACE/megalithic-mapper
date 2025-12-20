-- ============================================================================
-- Research Categories System
-- ============================================================================
-- Allows verified users to create research categories (e.g., Acoustics,
-- Chemical Analysis, Archaeoastronomy) that can be applied to sites and posts.
-- ============================================================================

-- Create research categories table
CREATE TABLE IF NOT EXISTS megalithic.research_categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT, -- emoji or icon name (e.g., '🔊' or 'sound-wave')
  color TEXT DEFAULT '#6366f1', -- hex color for UI
  created_by uuid REFERENCES megalithic.profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  post_count INT DEFAULT 0,
  site_count INT DEFAULT 0,
  is_official BOOLEAN DEFAULT FALSE -- admin-created categories
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_research_categories_slug ON megalithic.research_categories(slug);
CREATE INDEX IF NOT EXISTS idx_research_categories_created_by ON megalithic.research_categories(created_by);

-- Enable RLS
ALTER TABLE megalithic.research_categories ENABLE ROW LEVEL SECURITY;

-- Everyone can view categories
CREATE POLICY "Research categories are viewable by everyone" 
ON megalithic.research_categories FOR SELECT USING (true);

-- Only verified users can create categories
CREATE POLICY "Verified users can create categories" 
ON megalithic.research_categories FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM megalithic.profiles 
    WHERE id = auth.uid() 
    AND (is_verified = true OR role IN ('admin', 'moderator', 'researcher'))
  )
);

-- Creators can update their own categories
CREATE POLICY "Users can update own categories" 
ON megalithic.research_categories FOR UPDATE 
USING (created_by = auth.uid() OR EXISTS (
  SELECT 1 FROM megalithic.profiles 
  WHERE id = auth.uid() 
  AND role IN ('admin', 'moderator')
));

-- Junction table for sites and research categories
CREATE TABLE IF NOT EXISTS megalithic.site_research_categories (
  site_id uuid REFERENCES megalithic.sites(id) ON DELETE CASCADE,
  category_id uuid REFERENCES megalithic.research_categories(id) ON DELETE CASCADE,
  added_by uuid REFERENCES megalithic.profiles(id) ON DELETE SET NULL,
  added_at timestamptz DEFAULT now(),
  PRIMARY KEY (site_id, category_id)
);

-- Enable RLS
ALTER TABLE megalithic.site_research_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site categories viewable by everyone" 
ON megalithic.site_research_categories FOR SELECT USING (true);

CREATE POLICY "Authenticated users can tag sites" 
ON megalithic.site_research_categories FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can remove own category tags" 
ON megalithic.site_research_categories FOR DELETE 
USING (added_by = auth.uid() OR EXISTS (
  SELECT 1 FROM megalithic.profiles 
  WHERE id = auth.uid() 
  AND role IN ('admin', 'moderator')
));

-- Junction table for posts and research categories
CREATE TABLE IF NOT EXISTS megalithic.post_research_categories (
  post_id uuid REFERENCES megalithic.posts(id) ON DELETE CASCADE,
  category_id uuid REFERENCES megalithic.research_categories(id) ON DELETE CASCADE,
  added_by uuid REFERENCES megalithic.profiles(id) ON DELETE SET NULL,
  added_at timestamptz DEFAULT now(),
  PRIMARY KEY (post_id, category_id)
);

-- Enable RLS
ALTER TABLE megalithic.post_research_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Post categories viewable by everyone" 
ON megalithic.post_research_categories FOR SELECT USING (true);

CREATE POLICY "Authenticated users can tag posts" 
ON megalithic.post_research_categories FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can remove own post category tags" 
ON megalithic.post_research_categories FOR DELETE 
USING (added_by = auth.uid() OR EXISTS (
  SELECT 1 FROM megalithic.profiles 
  WHERE id = auth.uid() 
  AND role IN ('admin', 'moderator')
));

-- Trigger to update category counts
CREATE OR REPLACE FUNCTION megalithic.update_category_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF TG_TABLE_NAME = 'site_research_categories' THEN
      UPDATE megalithic.research_categories 
      SET site_count = site_count + 1 
      WHERE id = NEW.category_id;
    ELSIF TG_TABLE_NAME = 'post_research_categories' THEN
      UPDATE megalithic.research_categories 
      SET post_count = post_count + 1 
      WHERE id = NEW.category_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF TG_TABLE_NAME = 'site_research_categories' THEN
      UPDATE megalithic.research_categories 
      SET site_count = GREATEST(0, site_count - 1) 
      WHERE id = OLD.category_id;
    ELSIF TG_TABLE_NAME = 'post_research_categories' THEN
      UPDATE megalithic.research_categories 
      SET post_count = GREATEST(0, post_count - 1) 
      WHERE id = OLD.category_id;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS update_site_category_counts ON megalithic.site_research_categories;
CREATE TRIGGER update_site_category_counts
  AFTER INSERT OR DELETE ON megalithic.site_research_categories
  FOR EACH ROW EXECUTE FUNCTION megalithic.update_category_counts();

DROP TRIGGER IF EXISTS update_post_category_counts ON megalithic.post_research_categories;
CREATE TRIGGER update_post_category_counts
  AFTER INSERT OR DELETE ON megalithic.post_research_categories
  FOR EACH ROW EXECUTE FUNCTION megalithic.update_category_counts();

-- Seed default categories
INSERT INTO megalithic.research_categories (slug, name, description, icon, color, is_official) VALUES
  ('acoustics', 'Acoustics', 'Sound resonance, frequencies, and acoustic properties of ancient structures', '🔊', '#8b5cf6', true),
  ('chemical-analysis', 'Chemical Analysis', 'Material composition, dating methods, and geochemical studies', '🧪', '#10b981', true),
  ('archaeoastronomy', 'Archaeoastronomy', 'Astronomical alignments, celestial observations, and calendar systems', '⭐', '#f59e0b', true),
  ('construction', 'Construction Techniques', 'Building methods, tool marks, engineering, and logistics', '🏗️', '#6366f1', true),
  ('geology', 'Geology', 'Rock types, quarrying, geological context, and landscape formation', '🪨', '#78716c', true),
  ('mythology', 'Mythology & Symbolism', 'Cultural significance, legends, iconography, and oral traditions', '📜', '#ec4899', true),
  ('underwater', 'Underwater Archaeology', 'Submerged sites, sea level changes, and marine exploration', '🌊', '#0ea5e9', true),
  ('dating-methods', 'Dating Methods', 'Radiocarbon, luminescence, and other chronological techniques', '📅', '#f97316', true),
  ('3d-scanning', '3D Scanning & Photogrammetry', 'Digital documentation, modeling, and preservation', '📐', '#14b8a6', true),
  ('comparative', 'Comparative Studies', 'Cross-cultural connections, global patterns, and diffusion theories', '🌍', '#8b5cf6', true)
ON CONFLICT (slug) DO NOTHING;


