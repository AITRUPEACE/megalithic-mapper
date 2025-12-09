-- ============================================================================
-- STEP 2: Add MVP Tables (run AFTER fix-base-policies.sql)
-- ============================================================================
-- Run this in Supabase SQL Editor after fixing base policies
-- ============================================================================

-- 1. Add columns to sites table for contribution tracking
ALTER TABLE megalithic.sites 
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
ADD COLUMN IF NOT EXISTS verified_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS verified_at timestamptz,
ADD COLUMN IF NOT EXISTS votes_approve INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS votes_reject INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS votes_needs_info INT DEFAULT 0;

-- 2. Site follows (watch list)
CREATE TABLE IF NOT EXISTS megalithic.site_follows (
  user_id uuid REFERENCES megalithic.profiles(id) ON DELETE CASCADE,
  site_id uuid REFERENCES megalithic.sites(id) ON DELETE CASCADE,
  notify_updates BOOLEAN DEFAULT TRUE,
  notify_media BOOLEAN DEFAULT TRUE,
  notify_comments BOOLEAN DEFAULT TRUE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, site_id)
);

CREATE INDEX IF NOT EXISTS idx_site_follows_user ON megalithic.site_follows(user_id);
CREATE INDEX IF NOT EXISTS idx_site_follows_site ON megalithic.site_follows(site_id);

-- RLS for site follows
ALTER TABLE megalithic.site_follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Site follows are viewable by everyone" ON megalithic.site_follows;
DROP POLICY IF EXISTS "Users can follow sites" ON megalithic.site_follows;
DROP POLICY IF EXISTS "Users can unfollow sites" ON megalithic.site_follows;
DROP POLICY IF EXISTS "Users can update follow settings" ON megalithic.site_follows;

CREATE POLICY "Site follows are viewable by everyone" ON megalithic.site_follows
  FOR SELECT USING (true);
CREATE POLICY "Users can follow sites" ON megalithic.site_follows
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unfollow sites" ON megalithic.site_follows
  FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can update follow settings" ON megalithic.site_follows
  FOR UPDATE USING (auth.uid() = user_id);

-- 3. Site votes (community verification)
CREATE TABLE IF NOT EXISTS megalithic.site_votes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES megalithic.profiles(id) ON DELETE CASCADE NOT NULL,
  site_id uuid REFERENCES megalithic.sites(id) ON DELETE CASCADE NOT NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('approve', 'reject', 'needs_info')),
  reason TEXT,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT unique_site_vote UNIQUE(user_id, site_id)
);

CREATE INDEX IF NOT EXISTS idx_site_votes_site ON megalithic.site_votes(site_id);
CREATE INDEX IF NOT EXISTS idx_site_votes_user ON megalithic.site_votes(user_id);

-- RLS for site votes
ALTER TABLE megalithic.site_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site votes are viewable by everyone" ON megalithic.site_votes
  FOR SELECT USING (true);
CREATE POLICY "Users can vote on sites" ON megalithic.site_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own votes" ON megalithic.site_votes
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can remove own votes" ON megalithic.site_votes
  FOR DELETE USING (auth.uid() = user_id);

-- 4. Trigger to update vote counts
CREATE OR REPLACE FUNCTION megalithic.update_site_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.vote_type = 'approve' THEN
      UPDATE megalithic.sites SET votes_approve = votes_approve + 1 WHERE id = NEW.site_id;
    ELSIF NEW.vote_type = 'reject' THEN
      UPDATE megalithic.sites SET votes_reject = votes_reject + 1 WHERE id = NEW.site_id;
    ELSIF NEW.vote_type = 'needs_info' THEN
      UPDATE megalithic.sites SET votes_needs_info = votes_needs_info + 1 WHERE id = NEW.site_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.vote_type = 'approve' THEN
      UPDATE megalithic.sites SET votes_approve = GREATEST(0, votes_approve - 1) WHERE id = OLD.site_id;
    ELSIF OLD.vote_type = 'reject' THEN
      UPDATE megalithic.sites SET votes_reject = GREATEST(0, votes_reject - 1) WHERE id = OLD.site_id;
    ELSIF OLD.vote_type = 'needs_info' THEN
      UPDATE megalithic.sites SET votes_needs_info = GREATEST(0, votes_needs_info - 1) WHERE id = OLD.site_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Remove old vote
    IF OLD.vote_type = 'approve' THEN
      UPDATE megalithic.sites SET votes_approve = GREATEST(0, votes_approve - 1) WHERE id = OLD.site_id;
    ELSIF OLD.vote_type = 'reject' THEN
      UPDATE megalithic.sites SET votes_reject = GREATEST(0, votes_reject - 1) WHERE id = OLD.site_id;
    ELSIF OLD.vote_type = 'needs_info' THEN
      UPDATE megalithic.sites SET votes_needs_info = GREATEST(0, votes_needs_info - 1) WHERE id = OLD.site_id;
    END IF;
    -- Add new vote
    IF NEW.vote_type = 'approve' THEN
      UPDATE megalithic.sites SET votes_approve = votes_approve + 1 WHERE id = NEW.site_id;
    ELSIF NEW.vote_type = 'reject' THEN
      UPDATE megalithic.sites SET votes_reject = votes_reject + 1 WHERE id = NEW.site_id;
    ELSIF NEW.vote_type = 'needs_info' THEN
      UPDATE megalithic.sites SET votes_needs_info = votes_needs_info + 1 WHERE id = NEW.site_id;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS site_votes_update_counts ON megalithic.site_votes;
CREATE TRIGGER site_votes_update_counts
  AFTER INSERT OR UPDATE OR DELETE ON megalithic.site_votes
  FOR EACH ROW EXECUTE FUNCTION megalithic.update_site_vote_counts();

-- 5. Add external_links to posts table (if posts table exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'megalithic' AND table_name = 'posts') THEN
    ALTER TABLE megalithic.posts ADD COLUMN IF NOT EXISTS external_links jsonb DEFAULT '[]';
  END IF;
END $$;

-- 6. Activity feed table
CREATE TABLE IF NOT EXISTS megalithic.activity_feed (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'site_added', 'site_verified', 'site_updated',
    'media_added', 'post_created', 'comment_added',
    'user_joined', 'badge_earned', 'connection_proposed'
  )),
  actor_id uuid REFERENCES megalithic.profiles(id) ON DELETE SET NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('site', 'post', 'media', 'user', 'zone')),
  target_id uuid NOT NULL,
  site_id uuid REFERENCES megalithic.sites(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  metadata jsonb DEFAULT '{}',
  engagement_score FLOAT DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_feed_created ON megalithic.activity_feed(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_feed_type ON megalithic.activity_feed(activity_type);
CREATE INDEX IF NOT EXISTS idx_activity_feed_site ON megalithic.activity_feed(site_id) WHERE site_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_activity_feed_actor ON megalithic.activity_feed(actor_id);

-- RLS for activity feed
ALTER TABLE megalithic.activity_feed ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Activity feed is viewable by everyone" ON megalithic.activity_feed
  FOR SELECT USING (true);

-- 7. Trigger to create activity on new site
CREATE OR REPLACE FUNCTION megalithic.create_site_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO megalithic.activity_feed (
    activity_type, actor_id, target_type, target_id, site_id, title, description
  ) VALUES (
    'site_added',
    NEW.created_by,
    'site',
    NEW.id,
    NEW.id,
    'New site: ' || NEW.name,
    NEW.summary
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS sites_create_activity ON megalithic.sites;
CREATE TRIGGER sites_create_activity
  AFTER INSERT ON megalithic.sites
  FOR EACH ROW EXECUTE FUNCTION megalithic.create_site_activity();

SELECT 'MVP tables and policies created successfully!' as status;



