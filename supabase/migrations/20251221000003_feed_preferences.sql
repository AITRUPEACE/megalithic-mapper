-- ============================================================================
-- Feed Preferences & Content Priority
-- ============================================================================
-- Adds user-configurable feed preferences to control content priority order
-- Default: YouTube videos from verified users > Forum posts > Research > Sites
-- ============================================================================

-- Add feed_preferences column to profiles
ALTER TABLE megalithic.profiles
ADD COLUMN IF NOT EXISTS feed_preferences JSONB DEFAULT '{
  "priority_order": ["youtube", "forum", "research", "sites", "comments"],
  "show_community": true,
  "show_low_engagement": true,
  "youtube_first": true,
  "official_boost": 1.5
}'::jsonb;

-- Add onboarding columns for world tour
ALTER TABLE megalithic.profiles
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamptz,
ADD COLUMN IF NOT EXISTS onboarding_skipped BOOLEAN DEFAULT FALSE;

-- Create index for feed queries that need preferences
CREATE INDEX IF NOT EXISTS idx_profiles_feed_preferences 
ON megalithic.profiles USING gin(feed_preferences);

-- Function to get default feed preferences
CREATE OR REPLACE FUNCTION megalithic.get_default_feed_preferences()
RETURNS JSONB AS $$
BEGIN
  RETURN '{
    "priority_order": ["youtube", "forum", "research", "sites", "comments"],
    "show_community": true,
    "show_low_engagement": true,
    "youtube_first": true,
    "official_boost": 1.5
  }'::jsonb;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to calculate priority score for feed items
-- This can be used in feed queries for personalization
CREATE OR REPLACE FUNCTION megalithic.calculate_feed_priority(
  p_user_id uuid,
  p_item_type text,
  p_is_official boolean,
  p_is_verified_author boolean,
  p_engagement_score float
)
RETURNS float AS $$
DECLARE
  v_prefs JSONB;
  v_base_score float := 0;
  v_priority_order text[];
  v_position int;
  v_official_boost float;
BEGIN
  -- Get user preferences or use defaults
  SELECT COALESCE(feed_preferences, megalithic.get_default_feed_preferences())
  INTO v_prefs
  FROM megalithic.profiles
  WHERE id = p_user_id;
  
  IF v_prefs IS NULL THEN
    v_prefs := megalithic.get_default_feed_preferences();
  END IF;
  
  -- Extract priority order
  SELECT array_agg(elem::text)
  INTO v_priority_order
  FROM jsonb_array_elements_text(v_prefs->'priority_order') elem;
  
  -- Find position in priority order (lower = higher priority)
  SELECT array_position(v_priority_order, p_item_type) INTO v_position;
  IF v_position IS NULL THEN v_position := 5; END IF;
  
  -- Base score from position (higher for earlier positions)
  v_base_score := (6 - v_position) * 20;
  
  -- Official boost
  v_official_boost := COALESCE((v_prefs->>'official_boost')::float, 1.5);
  IF p_is_official OR p_is_verified_author THEN
    v_base_score := v_base_score * v_official_boost;
  END IF;
  
  -- YouTube first bonus
  IF (v_prefs->>'youtube_first')::boolean = true AND p_item_type = 'youtube' THEN
    v_base_score := v_base_score + 50;
  END IF;
  
  -- Add engagement score component
  v_base_score := v_base_score + (p_engagement_score * 0.5);
  
  RETURN v_base_score;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION megalithic.calculate_feed_priority TO authenticated;
GRANT EXECUTE ON FUNCTION megalithic.get_default_feed_preferences TO authenticated;

-- Comment on the function
COMMENT ON FUNCTION megalithic.calculate_feed_priority IS 
'Calculates a priority score for feed items based on user preferences.
Higher scores = higher priority in feed.
Takes into account: item type priority, official/verified status, engagement, and user preferences.';


