-- ============================================================================
-- STEP 1: Fix Base Policies (for tables that already exist)
-- ============================================================================
-- Run this FIRST in Supabase SQL Editor
-- Then run the MVP additions migration
-- ============================================================================

-- Drop existing policies on BASE tables only
DO $$ 
BEGIN
  -- Profiles
  DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON megalithic.profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON megalithic.profiles;
  DROP POLICY IF EXISTS "Users can insert own profile" ON megalithic.profiles;
  
  -- Badges
  DROP POLICY IF EXISTS "Badges are viewable by everyone" ON megalithic.badges;
  
  -- User badges
  DROP POLICY IF EXISTS "User badges are viewable by everyone" ON megalithic.user_badges;
  
  -- Follows
  DROP POLICY IF EXISTS "Follows are viewable by everyone" ON megalithic.follows;
  DROP POLICY IF EXISTS "Authenticated users can follow" ON megalithic.follows;
  DROP POLICY IF EXISTS "Users can unfollow" ON megalithic.follows;
  
  -- Sites
  DROP POLICY IF EXISTS "Sites are viewable by everyone" ON megalithic.sites;
  DROP POLICY IF EXISTS "Contributors can insert sites" ON megalithic.sites;
  DROP POLICY IF EXISTS "Contributors can update sites" ON megalithic.sites;
  DROP POLICY IF EXISTS "Anyone can add sites" ON megalithic.sites;
  DROP POLICY IF EXISTS "Anyone can update sites" ON megalithic.sites;
  
  -- Zones
  DROP POLICY IF EXISTS "Zones are viewable by everyone" ON megalithic.zones;
  
  -- Site tags
  DROP POLICY IF EXISTS "Site tags are viewable by everyone" ON megalithic.site_tags;
  DROP POLICY IF EXISTS "Anyone can add site tags" ON megalithic.site_tags;
  
  -- Site zones
  DROP POLICY IF EXISTS "Site zones are viewable by everyone" ON megalithic.site_zones;
  
  -- Media assets
  DROP POLICY IF EXISTS "Public media assets are viewable by everyone" ON megalithic.media_assets;
  DROP POLICY IF EXISTS "Contributors can insert media" ON megalithic.media_assets;
  DROP POLICY IF EXISTS "Contributors can update own media" ON megalithic.media_assets;
  DROP POLICY IF EXISTS "Anyone can add media" ON megalithic.media_assets;
END $$;

-- ============================================================================
-- RECREATE BASE POLICIES
-- ============================================================================

-- Profiles
CREATE POLICY "Profiles are viewable by everyone" ON megalithic.profiles
  FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON megalithic.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON megalithic.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Badges
CREATE POLICY "Badges are viewable by everyone" ON megalithic.badges
  FOR SELECT USING (true);

-- User badges
CREATE POLICY "User badges are viewable by everyone" ON megalithic.user_badges
  FOR SELECT USING (true);

-- Follows
CREATE POLICY "Follows are viewable by everyone" ON megalithic.follows
  FOR SELECT USING (true);
CREATE POLICY "Authenticated users can follow" ON megalithic.follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow" ON megalithic.follows
  FOR DELETE USING (auth.uid() = follower_id);

-- Sites (MVP: Allow any authenticated user to add/edit)
CREATE POLICY "Sites are viewable by everyone" ON megalithic.sites
  FOR SELECT USING (true);
CREATE POLICY "Anyone can add sites" ON megalithic.sites
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Anyone can update sites" ON megalithic.sites
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Zones
CREATE POLICY "Zones are viewable by everyone" ON megalithic.zones
  FOR SELECT USING (true);

-- Site tags
CREATE POLICY "Site tags are viewable by everyone" ON megalithic.site_tags
  FOR SELECT USING (true);
CREATE POLICY "Anyone can add site tags" ON megalithic.site_tags
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Site zones
CREATE POLICY "Site zones are viewable by everyone" ON megalithic.site_zones
  FOR SELECT USING (true);

-- Media assets
CREATE POLICY "Public media assets are viewable by everyone" ON megalithic.media_assets
  FOR SELECT USING (visibility = 'public' OR contributor_id = auth.uid());
CREATE POLICY "Anyone can add media" ON megalithic.media_assets
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Contributors can update own media" ON megalithic.media_assets
  FOR UPDATE USING (auth.uid() = contributor_id);

SELECT 'Base policies fixed successfully!' as status;

