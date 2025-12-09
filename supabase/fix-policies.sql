-- ============================================================================
-- ONE-TIME FIX: Run this directly in Supabase SQL Editor
-- ============================================================================
-- This drops and recreates all RLS policies to fix migration conflicts
-- ============================================================================

-- Drop existing policies (ignore errors if they don't exist)
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
  
  -- Posts (if table exists)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'megalithic' AND table_name = 'posts') THEN
    DROP POLICY IF EXISTS "Public posts are viewable by everyone" ON megalithic.posts;
    DROP POLICY IF EXISTS "Authors can view own posts" ON megalithic.posts;
    DROP POLICY IF EXISTS "Followers can view follower-only posts" ON megalithic.posts;
    DROP POLICY IF EXISTS "Users can create posts" ON megalithic.posts;
    DROP POLICY IF EXISTS "Authors can update own posts" ON megalithic.posts;
    DROP POLICY IF EXISTS "Authors can delete own posts" ON megalithic.posts;
  END IF;
  
  -- Comments (if table exists)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'megalithic' AND table_name = 'comments') THEN
    DROP POLICY IF EXISTS "Comments are viewable by everyone" ON megalithic.comments;
    DROP POLICY IF EXISTS "Authors can view own hidden comments" ON megalithic.comments;
    DROP POLICY IF EXISTS "Users can create comments" ON megalithic.comments;
    DROP POLICY IF EXISTS "Authors can update own comments" ON megalithic.comments;
    DROP POLICY IF EXISTS "Authors can delete own comments" ON megalithic.comments;
  END IF;
  
  -- Reactions (if table exists)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'megalithic' AND table_name = 'reactions') THEN
    DROP POLICY IF EXISTS "Reactions are viewable by everyone" ON megalithic.reactions;
    DROP POLICY IF EXISTS "Users can add reactions" ON megalithic.reactions;
    DROP POLICY IF EXISTS "Users can remove own reactions" ON megalithic.reactions;
  END IF;
  
  -- Notifications (if table exists)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'megalithic' AND table_name = 'notifications') THEN
    DROP POLICY IF EXISTS "Users can view own notifications" ON megalithic.notifications;
    DROP POLICY IF EXISTS "Users can update own notifications" ON megalithic.notifications;
  END IF;
  
  -- Bookmarks (if table exists)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'megalithic' AND table_name = 'bookmarks') THEN
    DROP POLICY IF EXISTS "Users can view own bookmarks" ON megalithic.bookmarks;
    DROP POLICY IF EXISTS "Users can create bookmarks" ON megalithic.bookmarks;
    DROP POLICY IF EXISTS "Users can delete own bookmarks" ON megalithic.bookmarks;
  END IF;
  
  -- Lookup tables (if they exist)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'megalithic' AND table_name = 'roles') THEN
    DROP POLICY IF EXISTS "Roles are viewable by everyone" ON megalithic.roles;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'megalithic' AND table_name = 'site_types') THEN
    DROP POLICY IF EXISTS "Site types are viewable by everyone" ON megalithic.site_types;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'megalithic' AND table_name = 'tags') THEN
    DROP POLICY IF EXISTS "Tags are viewable by everyone" ON megalithic.tags;
  END IF;
  
  -- Site votes (if table exists)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'megalithic' AND table_name = 'site_votes') THEN
    DROP POLICY IF EXISTS "Site votes are viewable by everyone" ON megalithic.site_votes;
    DROP POLICY IF EXISTS "Users can vote on sites" ON megalithic.site_votes;
    DROP POLICY IF EXISTS "Users can update own votes" ON megalithic.site_votes;
    DROP POLICY IF EXISTS "Users can remove own votes" ON megalithic.site_votes;
  END IF;
  
  -- Site follows (if table exists)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'megalithic' AND table_name = 'site_follows') THEN
    DROP POLICY IF EXISTS "Site follows are viewable by everyone" ON megalithic.site_follows;
    DROP POLICY IF EXISTS "Users can follow sites" ON megalithic.site_follows;
    DROP POLICY IF EXISTS "Users can unfollow sites" ON megalithic.site_follows;
    DROP POLICY IF EXISTS "Users can update follow settings" ON megalithic.site_follows;
  END IF;
  
  -- Activity feed (if table exists)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'megalithic' AND table_name = 'activity_feed') THEN
    DROP POLICY IF EXISTS "Activity feed is viewable by everyone" ON megalithic.activity_feed;
  END IF;
END $$;

-- ============================================================================
-- RECREATE ALL POLICIES (MVP-friendly - allow any authenticated user)
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

-- Site tags (MVP: Allow any authenticated user)
CREATE POLICY "Site tags are viewable by everyone" ON megalithic.site_tags
  FOR SELECT USING (true);
CREATE POLICY "Anyone can add site tags" ON megalithic.site_tags
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Site zones
CREATE POLICY "Site zones are viewable by everyone" ON megalithic.site_zones
  FOR SELECT USING (true);

-- Media assets (MVP: Allow any authenticated user)
CREATE POLICY "Public media assets are viewable by everyone" ON megalithic.media_assets
  FOR SELECT USING (visibility = 'public' OR contributor_id = auth.uid());
CREATE POLICY "Anyone can add media" ON megalithic.media_assets
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Contributors can update own media" ON megalithic.media_assets
  FOR UPDATE USING (auth.uid() = contributor_id);

-- Posts (if table exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'megalithic' AND table_name = 'posts') THEN
    CREATE POLICY "Public posts are viewable by everyone" ON megalithic.posts
      FOR SELECT USING (
        visibility = 'public' 
        AND published_at IS NOT NULL 
        AND deleted_at IS NULL
      );
    CREATE POLICY "Authors can view own posts" ON megalithic.posts
      FOR SELECT USING (author_id = auth.uid());
    CREATE POLICY "Users can create posts" ON megalithic.posts
      FOR INSERT WITH CHECK (auth.uid() = author_id);
    CREATE POLICY "Authors can update own posts" ON megalithic.posts
      FOR UPDATE USING (auth.uid() = author_id);
    CREATE POLICY "Authors can delete own posts" ON megalithic.posts
      FOR DELETE USING (auth.uid() = author_id);
  END IF;
END $$;

-- Comments (if table exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'megalithic' AND table_name = 'comments') THEN
    CREATE POLICY "Comments are viewable by everyone" ON megalithic.comments
      FOR SELECT USING (deleted_at IS NULL AND is_hidden = false);
    CREATE POLICY "Authors can view own hidden comments" ON megalithic.comments
      FOR SELECT USING (author_id = auth.uid());
    CREATE POLICY "Users can create comments" ON megalithic.comments
      FOR INSERT WITH CHECK (auth.uid() = author_id);
    CREATE POLICY "Authors can update own comments" ON megalithic.comments
      FOR UPDATE USING (auth.uid() = author_id);
    CREATE POLICY "Authors can delete own comments" ON megalithic.comments
      FOR DELETE USING (auth.uid() = author_id);
  END IF;
END $$;

-- Reactions (if table exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'megalithic' AND table_name = 'reactions') THEN
    CREATE POLICY "Reactions are viewable by everyone" ON megalithic.reactions
      FOR SELECT USING (true);
    CREATE POLICY "Users can add reactions" ON megalithic.reactions
      FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Users can remove own reactions" ON megalithic.reactions
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Notifications (if table exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'megalithic' AND table_name = 'notifications') THEN
    CREATE POLICY "Users can view own notifications" ON megalithic.notifications
      FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users can update own notifications" ON megalithic.notifications
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Bookmarks (if table exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'megalithic' AND table_name = 'bookmarks') THEN
    CREATE POLICY "Users can view own bookmarks" ON megalithic.bookmarks
      FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users can create bookmarks" ON megalithic.bookmarks
      FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Users can delete own bookmarks" ON megalithic.bookmarks
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Site votes (if table exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'megalithic' AND table_name = 'site_votes') THEN
    CREATE POLICY "Site votes are viewable by everyone" ON megalithic.site_votes
      FOR SELECT USING (true);
    CREATE POLICY "Users can vote on sites" ON megalithic.site_votes
      FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Users can update own votes" ON megalithic.site_votes
      FOR UPDATE USING (auth.uid() = user_id);
    CREATE POLICY "Users can remove own votes" ON megalithic.site_votes
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Site follows (if table exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'megalithic' AND table_name = 'site_follows') THEN
    CREATE POLICY "Site follows are viewable by everyone" ON megalithic.site_follows
      FOR SELECT USING (true);
    CREATE POLICY "Users can follow sites" ON megalithic.site_follows
      FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Users can unfollow sites" ON megalithic.site_follows
      FOR DELETE USING (auth.uid() = user_id);
    CREATE POLICY "Users can update follow settings" ON megalithic.site_follows
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Activity feed (if table exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'megalithic' AND table_name = 'activity_feed') THEN
    CREATE POLICY "Activity feed is viewable by everyone" ON megalithic.activity_feed
      FOR SELECT USING (true);
  END IF;
END $$;

-- Lookup tables (if they exist)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'megalithic' AND table_name = 'roles') THEN
    CREATE POLICY "Roles are viewable by everyone" ON megalithic.roles FOR SELECT USING (true);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'megalithic' AND table_name = 'site_types') THEN
    CREATE POLICY "Site types are viewable by everyone" ON megalithic.site_types FOR SELECT USING (true);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'megalithic' AND table_name = 'tags') THEN
    CREATE POLICY "Tags are viewable by everyone" ON megalithic.tags FOR SELECT USING (true);
  END IF;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

-- Success message
SELECT 'All policies have been recreated successfully!' as status;

