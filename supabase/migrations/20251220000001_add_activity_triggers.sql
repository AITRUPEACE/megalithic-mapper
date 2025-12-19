-- ============================================================================
-- Megalithic Mapper - Activity Score Triggers
-- ============================================================================
-- Auto-updates activity_score when contributions happen
-- This enables trending/hot sites to bubble up based on recent engagement
-- ============================================================================

-- ============================================================================
-- HELPER FUNCTION TO INCREMENT ACTIVITY SCORE
-- ============================================================================

CREATE OR REPLACE FUNCTION megalithic.increment_site_activity(
  p_site_id UUID,
  p_points INTEGER DEFAULT 5
)
RETURNS VOID AS $$
BEGIN
  UPDATE megalithic.sites
  SET
    activity_score = COALESCE(activity_score, 0) + p_points,
    activity_updated_at = NOW()
  WHERE id = p_site_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users (triggers run as definer)
GRANT EXECUTE ON FUNCTION megalithic.increment_site_activity TO authenticated;

-- ============================================================================
-- TRIGGER: MEDIA UPLOADS (+10 points)
-- ============================================================================

CREATE OR REPLACE FUNCTION megalithic.on_media_activity_insert()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.site_id IS NOT NULL THEN
    PERFORM megalithic.increment_site_activity(NEW.site_id, 10);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop if exists to avoid conflicts
DROP TRIGGER IF EXISTS trg_media_site_activity ON megalithic.media_assets;

CREATE TRIGGER trg_media_site_activity
  AFTER INSERT ON megalithic.media_assets
  FOR EACH ROW 
  WHEN (NEW.site_id IS NOT NULL)
  EXECUTE FUNCTION megalithic.on_media_activity_insert();

-- ============================================================================
-- TRIGGER: POSTS/COMMENTS (+5 points)
-- ============================================================================

CREATE OR REPLACE FUNCTION megalithic.on_post_activity_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- Posts can be linked to sites via target_type='site' and target_id
  IF NEW.target_type = 'site' AND NEW.target_id IS NOT NULL THEN
    PERFORM megalithic.increment_site_activity(NEW.target_id, 5);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_post_site_activity ON megalithic.posts;

CREATE TRIGGER trg_post_site_activity
  AFTER INSERT ON megalithic.posts
  FOR EACH ROW 
  WHEN (NEW.target_type = 'site' AND NEW.target_id IS NOT NULL)
  EXECUTE FUNCTION megalithic.on_post_activity_insert();

-- ============================================================================
-- TRIGGER: COMMENTS (+3 points)
-- ============================================================================

CREATE OR REPLACE FUNCTION megalithic.on_comment_activity_insert()
RETURNS TRIGGER AS $$
DECLARE
  v_site_id UUID;
BEGIN
  -- Comments can be on sites directly, or on posts about sites
  IF NEW.target_type = 'site' THEN
    v_site_id := NEW.target_id;
  ELSIF NEW.target_type = 'post' THEN
    -- Get site_id from the parent post if it's about a site
    SELECT target_id INTO v_site_id 
    FROM megalithic.posts 
    WHERE id = NEW.target_id AND target_type = 'site';
  END IF;
  
  IF v_site_id IS NOT NULL THEN
    PERFORM megalithic.increment_site_activity(v_site_id, 3);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_comment_site_activity ON megalithic.comments;

CREATE TRIGGER trg_comment_site_activity
  AFTER INSERT ON megalithic.comments
  FOR EACH ROW 
  EXECUTE FUNCTION megalithic.on_comment_activity_insert();

-- ============================================================================
-- TRIGGER: SITE VOTES (+2 points)
-- ============================================================================

CREATE OR REPLACE FUNCTION megalithic.on_site_vote_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Only increment on insert (not on vote changes)
  IF TG_OP = 'INSERT' THEN
    PERFORM megalithic.increment_site_activity(NEW.site_id, 2);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_site_vote_activity ON megalithic.site_votes;

CREATE TRIGGER trg_site_vote_activity
  AFTER INSERT ON megalithic.site_votes
  FOR EACH ROW 
  EXECUTE FUNCTION megalithic.on_site_vote_activity();

-- ============================================================================
-- TRIGGER: SITE FOLLOWS (+1 point)
-- ============================================================================

CREATE OR REPLACE FUNCTION megalithic.on_site_follow_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM megalithic.increment_site_activity(NEW.site_id, 1);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_site_follow_activity ON megalithic.site_follows;

CREATE TRIGGER trg_site_follow_activity
  AFTER INSERT ON megalithic.site_follows
  FOR EACH ROW 
  EXECUTE FUNCTION megalithic.on_site_follow_activity();

-- ============================================================================
-- TRIGGER: REACTIONS ON SITE CONTENT (+1 point)
-- ============================================================================

CREATE OR REPLACE FUNCTION megalithic.on_reaction_activity()
RETURNS TRIGGER AS $$
DECLARE
  v_site_id UUID;
BEGIN
  -- Reactions can be on sites, media, or posts
  IF NEW.target_type = 'site' THEN
    v_site_id := NEW.target_id;
  ELSIF NEW.target_type = 'media' THEN
    SELECT site_id INTO v_site_id FROM megalithic.media_assets WHERE id = NEW.target_id;
  ELSIF NEW.target_type = 'post' THEN
    SELECT target_id INTO v_site_id 
    FROM megalithic.posts 
    WHERE id = NEW.target_id AND target_type = 'site';
  END IF;
  
  IF v_site_id IS NOT NULL THEN
    PERFORM megalithic.increment_site_activity(v_site_id, 1);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_reaction_site_activity ON megalithic.reactions;

CREATE TRIGGER trg_reaction_site_activity
  AFTER INSERT ON megalithic.reactions
  FOR EACH ROW 
  EXECUTE FUNCTION megalithic.on_reaction_activity();

-- ============================================================================
-- TRIGGER: SITE EDITS (+8 points for significant updates)
-- ============================================================================

CREATE OR REPLACE FUNCTION megalithic.on_site_edit_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Only count meaningful edits (not just vote count updates)
  IF OLD.name IS DISTINCT FROM NEW.name OR
     OLD.summary IS DISTINCT FROM NEW.summary OR
     OLD.site_type IS DISTINCT FROM NEW.site_type THEN
    -- Update activity score directly (not using helper to avoid recursion)
    UPDATE megalithic.sites
    SET
      activity_score = COALESCE(activity_score, 0) + 8,
      activity_updated_at = NOW()
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_site_edit_activity ON megalithic.sites;

CREATE TRIGGER trg_site_edit_activity
  AFTER UPDATE ON megalithic.sites
  FOR EACH ROW 
  WHEN (
    OLD.name IS DISTINCT FROM NEW.name OR
    OLD.summary IS DISTINCT FROM NEW.summary OR
    OLD.site_type IS DISTINCT FROM NEW.site_type
  )
  EXECUTE FUNCTION megalithic.on_site_edit_activity();

-- ============================================================================
-- ACTIVITY POINT VALUES REFERENCE
-- ============================================================================
-- Media upload:     +10 points  (high value content)
-- Site edit:        +8 points   (significant contribution)  
-- Post created:     +5 points   (discussion starter)
-- Comment:          +3 points   (engagement)
-- Site vote:        +2 points   (verification participation)
-- Site follow:      +1 point    (interest signal)
-- Reaction:         +1 point    (low-effort engagement)
-- ============================================================================
