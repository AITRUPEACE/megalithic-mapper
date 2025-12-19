-- ============================================================================
-- Badge System Implementation
-- ============================================================================
-- Implements a badge/tier system based on user contributions and engagement
-- 
-- Scoring:
--   upvotes_received * 1
--   sites_contributed * 10
--   posts_created * 5
--   comments_made * 2
--   verified_contributions * 25
--
-- Tiers:
--   Explorer: 0-49 points
--   Contributor: 50-199 points
--   Researcher: 200-499 points
--   Expert: 500-999 points
--   Legend: 1000+ points
-- ============================================================================

-- Add badge columns to profiles if they don't exist
ALTER TABLE megalithic.profiles
ADD COLUMN IF NOT EXISTS badge_score INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS badge_tier TEXT DEFAULT 'explorer',
ADD COLUMN IF NOT EXISTS badge_updated_at timestamptz DEFAULT now();

-- Create enum type for badge tiers (for type safety)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'badge_tier_type') THEN
    CREATE TYPE badge_tier_type AS ENUM ('explorer', 'contributor', 'researcher', 'expert', 'legend');
  END IF;
END $$;

-- Function to calculate badge score for a user
CREATE OR REPLACE FUNCTION megalithic.calculate_badge_score(p_user_id uuid)
RETURNS TABLE (score INT, tier TEXT) AS $$
DECLARE
  v_score INT := 0;
  v_tier TEXT;
  v_upvotes INT := 0;
  v_sites INT := 0;
  v_posts INT := 0;
  v_comments INT := 0;
  v_verified INT := 0;
BEGIN
  -- Count sites contributed
  SELECT COUNT(*) INTO v_sites
  FROM megalithic.sites
  WHERE created_by = p_user_id;

  -- Count verified sites
  SELECT COUNT(*) INTO v_verified
  FROM megalithic.sites
  WHERE created_by = p_user_id
    AND verification_status = 'verified';

  -- Count posts created
  SELECT COUNT(*) INTO v_posts
  FROM megalithic.posts
  WHERE author_id = p_user_id
    AND deleted_at IS NULL;

  -- Count comments made
  SELECT COUNT(*) INTO v_comments
  FROM megalithic.comments
  WHERE author_id = p_user_id
    AND deleted_at IS NULL;

  -- Count upvotes received on posts
  SELECT COALESCE(SUM(p.likes_count), 0) INTO v_upvotes
  FROM megalithic.posts p
  WHERE p.author_id = p_user_id;

  -- Also count approve votes on sites
  SELECT v_upvotes + COALESCE(SUM(s.votes_approve), 0) INTO v_upvotes
  FROM megalithic.sites s
  WHERE s.created_by = p_user_id;

  -- Calculate total score
  v_score := (v_upvotes * 1) + 
             (v_sites * 10) + 
             (v_posts * 5) + 
             (v_comments * 2) +
             (v_verified * 25);

  -- Determine tier
  v_tier := CASE
    WHEN v_score >= 1000 THEN 'legend'
    WHEN v_score >= 500 THEN 'expert'
    WHEN v_score >= 200 THEN 'researcher'
    WHEN v_score >= 50 THEN 'contributor'
    ELSE 'explorer'
  END;

  RETURN QUERY SELECT v_score, v_tier;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update a user's badge (call on demand or via cron)
CREATE OR REPLACE FUNCTION megalithic.update_user_badge(p_user_id uuid)
RETURNS void AS $$
DECLARE
  v_result RECORD;
BEGIN
  SELECT * INTO v_result FROM megalithic.calculate_badge_score(p_user_id);
  
  UPDATE megalithic.profiles
  SET 
    badge_score = v_result.score,
    badge_tier = v_result.tier,
    badge_updated_at = now()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update all user badges (for cron job)
CREATE OR REPLACE FUNCTION megalithic.update_all_badges()
RETURNS INT AS $$
DECLARE
  v_count INT := 0;
  v_user_id uuid;
BEGIN
  FOR v_user_id IN SELECT id FROM megalithic.profiles LOOP
    PERFORM megalithic.update_user_badge(v_user_id);
    v_count := v_count + 1;
  END LOOP;
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update badge when user creates a site
CREATE OR REPLACE FUNCTION megalithic.update_badge_on_contribution()
RETURNS TRIGGER AS $$
BEGIN
  -- Queue badge update (async in production, sync here for simplicity)
  PERFORM megalithic.update_user_badge(
    COALESCE(NEW.created_by, NEW.author_id)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply trigger to sites
DROP TRIGGER IF EXISTS update_badge_on_site_create ON megalithic.sites;
CREATE TRIGGER update_badge_on_site_create
  AFTER INSERT ON megalithic.sites
  FOR EACH ROW
  WHEN (NEW.created_by IS NOT NULL)
  EXECUTE FUNCTION megalithic.update_badge_on_contribution();

-- Apply trigger to posts
DROP TRIGGER IF EXISTS update_badge_on_post_create ON megalithic.posts;
CREATE TRIGGER update_badge_on_post_create
  AFTER INSERT ON megalithic.posts
  FOR EACH ROW
  WHEN (NEW.author_id IS NOT NULL)
  EXECUTE FUNCTION megalithic.update_badge_on_contribution();

-- Create index for badge leaderboard queries
CREATE INDEX IF NOT EXISTS idx_profiles_badge_score 
ON megalithic.profiles(badge_score DESC);

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION megalithic.calculate_badge_score TO authenticated;
GRANT EXECUTE ON FUNCTION megalithic.update_user_badge TO authenticated;

-- View for leaderboard
CREATE OR REPLACE VIEW megalithic.badge_leaderboard AS
SELECT 
  p.id,
  p.username,
  p.full_name,
  p.avatar_url,
  p.badge_score,
  p.badge_tier,
  p.is_verified,
  RANK() OVER (ORDER BY p.badge_score DESC) as rank
FROM megalithic.profiles p
WHERE p.badge_score > 0
ORDER BY p.badge_score DESC;

