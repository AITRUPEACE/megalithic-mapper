-- ============================================================================
-- Megalithic Mapper - MVP Additions
-- ============================================================================
-- Adds: site contribution tracking, site follows, community voting,
--       activity feed generation
-- Run AFTER social features migration
-- ============================================================================

-- 1. Site contribution tracking
ALTER TABLE megalithic.sites 
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
ADD COLUMN IF NOT EXISTS verified_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS verified_at timestamptz;

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

-- Add vote counts to sites
ALTER TABLE megalithic.sites
ADD COLUMN IF NOT EXISTS votes_approve INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS votes_reject INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS votes_needs_info INT DEFAULT 0;

-- Trigger to update vote counts
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

-- 4. External links in posts (for YouTube, articles, etc.)
ALTER TABLE megalithic.posts
ADD COLUMN IF NOT EXISTS external_links jsonb DEFAULT '[]';
-- Format: [{"url": "...", "type": "youtube|article|image", "title": "...", "thumbnail": "...", "metadata": {...}}]

-- 5. Activity feed table (pre-computed for performance)
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
  created_at timestamptz DEFAULT now(),
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B')
  ) STORED
);

CREATE INDEX IF NOT EXISTS idx_activity_feed_created ON megalithic.activity_feed(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_feed_type ON megalithic.activity_feed(activity_type);
CREATE INDEX IF NOT EXISTS idx_activity_feed_site ON megalithic.activity_feed(site_id) WHERE site_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_activity_feed_actor ON megalithic.activity_feed(actor_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_engagement ON megalithic.activity_feed(engagement_score DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_feed_search ON megalithic.activity_feed USING gin(search_vector);

-- RLS for activity feed
ALTER TABLE megalithic.activity_feed ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Activity feed is viewable by everyone" ON megalithic.activity_feed
  FOR SELECT USING (true);

-- ============================================================================
-- AUTO-VERIFICATION SYSTEM
-- ============================================================================

-- Auto-verify sites with enough community approval
CREATE OR REPLACE FUNCTION megalithic.auto_verify_site()
RETURNS TRIGGER AS $$
DECLARE
  approve_threshold INT := 5;
  site_record RECORD;
BEGIN
  SELECT * INTO site_record FROM megalithic.sites WHERE id = NEW.site_id;
  
  -- Auto-verify if enough approvals and no rejections
  IF site_record.votes_approve >= approve_threshold 
     AND site_record.votes_reject = 0 
     AND site_record.verification_status = 'under_review' THEN
    UPDATE megalithic.sites 
    SET verification_status = 'verified',
        verified_at = now()
    WHERE id = NEW.site_id;
    
    -- Create activity feed entry
    INSERT INTO megalithic.activity_feed (
      activity_type, actor_id, target_type, target_id, site_id, title, description
    ) VALUES (
      'site_verified', 
      NULL,
      'site', 
      NEW.site_id, 
      NEW.site_id,
      'Site verified: ' || site_record.name,
      'Community has verified this site with ' || site_record.votes_approve || ' approvals.'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS site_votes_auto_verify ON megalithic.site_votes;
CREATE TRIGGER site_votes_auto_verify
  AFTER INSERT OR UPDATE ON megalithic.site_votes
  FOR EACH ROW EXECUTE FUNCTION megalithic.auto_verify_site();

-- ============================================================================
-- ACTIVITY FEED GENERATION TRIGGERS
-- ============================================================================

-- On new site
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

-- On new post (only public, published posts)
CREATE OR REPLACE FUNCTION megalithic.create_post_activity()
RETURNS TRIGGER AS $$
DECLARE
  site_name TEXT;
BEGIN
  -- Get site name if linked to a site
  IF NEW.target_type = 'site' AND NEW.target_id IS NOT NULL THEN
    SELECT name INTO site_name FROM megalithic.sites WHERE id = NEW.target_id;
  END IF;

  INSERT INTO megalithic.activity_feed (
    activity_type, actor_id, target_type, target_id, site_id, title, description
  ) VALUES (
    'post_created',
    NEW.author_id,
    'post',
    NEW.id,
    CASE WHEN NEW.target_type = 'site' THEN NEW.target_id ELSE NULL END,
    COALESCE(NEW.title, 'New post'),
    COALESCE(NEW.excerpt, LEFT(NEW.body, 200))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS posts_create_activity ON megalithic.posts;
CREATE TRIGGER posts_create_activity
  AFTER INSERT ON megalithic.posts
  FOR EACH ROW 
  WHEN (NEW.visibility = 'public' AND NEW.published_at IS NOT NULL)
  EXECUTE FUNCTION megalithic.create_post_activity();

-- On new media
CREATE OR REPLACE FUNCTION megalithic.create_media_activity()
RETURNS TRIGGER AS $$
DECLARE
  site_name TEXT;
BEGIN
  IF NEW.site_id IS NOT NULL THEN
    SELECT name INTO site_name FROM megalithic.sites WHERE id = NEW.site_id;
  END IF;

  INSERT INTO megalithic.activity_feed (
    activity_type, actor_id, target_type, target_id, site_id, title, description, thumbnail_url
  ) VALUES (
    'media_added',
    NEW.contributor_id,
    'media',
    NEW.id,
    NEW.site_id,
    'New ' || NEW.asset_type || ': ' || NEW.title,
    NEW.description,
    NEW.thumbnail_url
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS media_create_activity ON megalithic.media_assets;
CREATE TRIGGER media_create_activity
  AFTER INSERT ON megalithic.media_assets
  FOR EACH ROW 
  WHEN (NEW.visibility = 'public')
  EXECUTE FUNCTION megalithic.create_media_activity();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to update engagement score (call periodically via cron)
CREATE OR REPLACE FUNCTION megalithic.update_feed_engagement_scores()
RETURNS void AS $$
BEGIN
  UPDATE megalithic.activity_feed af
  SET engagement_score = (
    SELECT COALESCE(
      (SELECT COUNT(*) FROM megalithic.reactions r 
       WHERE r.target_type = af.target_type AND r.target_id = af.target_id) * 1.0 +
      (SELECT COUNT(*) FROM megalithic.comments c 
       WHERE c.target_type = af.target_type AND c.target_id = af.target_id) * 2.0 +
      (SELECT COUNT(*) FROM megalithic.bookmarks b 
       WHERE b.target_type = af.target_type AND b.target_id = af.target_id) * 1.5,
      0
    )
  )
  WHERE af.created_at > NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get personalized feed
CREATE OR REPLACE FUNCTION megalithic.get_personalized_feed(
  p_user_id uuid,
  p_limit int DEFAULT 50,
  p_offset int DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  activity_type text,
  actor_id uuid,
  target_type text,
  target_id uuid,
  site_id uuid,
  title text,
  description text,
  thumbnail_url text,
  metadata jsonb,
  engagement_score float,
  created_at timestamptz,
  is_from_following boolean,
  is_from_followed_site boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    af.id,
    af.activity_type,
    af.actor_id,
    af.target_type,
    af.target_id,
    af.site_id,
    af.title,
    af.description,
    af.thumbnail_url,
    af.metadata,
    af.engagement_score,
    af.created_at,
    EXISTS (
      SELECT 1 FROM megalithic.follows f 
      WHERE f.follower_id = p_user_id 
      AND f.following_id = af.actor_id 
      AND f.status = 'accepted'
    ) as is_from_following,
    EXISTS (
      SELECT 1 FROM megalithic.site_follows sf 
      WHERE sf.user_id = p_user_id 
      AND sf.site_id = af.site_id
    ) as is_from_followed_site
  FROM megalithic.activity_feed af
  ORDER BY 
    -- Boost content from followed users/sites
    CASE 
      WHEN EXISTS (
        SELECT 1 FROM megalithic.follows f 
        WHERE f.follower_id = p_user_id 
        AND f.following_id = af.actor_id 
        AND f.status = 'accepted'
      ) THEN 1.5
      WHEN EXISTS (
        SELECT 1 FROM megalithic.site_follows sf 
        WHERE sf.user_id = p_user_id 
        AND sf.site_id = af.site_id
      ) THEN 1.3
      ELSE 1.0
    END * (af.engagement_score + 1) DESC,
    af.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;



