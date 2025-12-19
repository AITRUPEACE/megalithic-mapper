-- ============================================================================
-- Megalithic Mapper - Importance & Activity Scoring
-- ============================================================================
-- Adds: importance_score, activity_score, activity_updated_at
-- Enables smart site filtering and prioritization on the map
-- ============================================================================

-- Base importance score (0-100) - static, based on site characteristics
-- Used for inherent site significance (UNESCO, major monuments, etc.)
ALTER TABLE megalithic.sites 
ADD COLUMN IF NOT EXISTS importance_score INTEGER DEFAULT 50
  CHECK (importance_score >= 0 AND importance_score <= 100);

-- Activity score - dynamic, incremented by triggers on contributions
-- Tracks recent engagement (uploads, comments, votes, edits)
ALTER TABLE megalithic.sites 
ADD COLUMN IF NOT EXISTS activity_score INTEGER DEFAULT 0
  CHECK (activity_score >= 0);

-- Timestamp of last activity - used for time-weighted decay calculation
ALTER TABLE megalithic.sites 
ADD COLUMN IF NOT EXISTS activity_updated_at TIMESTAMPTZ;

-- ============================================================================
-- INDEXES FOR FAST SORTING
-- ============================================================================

-- Index for sorting by importance
CREATE INDEX IF NOT EXISTS idx_sites_importance 
  ON megalithic.sites(importance_score DESC);

-- Index for sorting by activity
CREATE INDEX IF NOT EXISTS idx_sites_activity 
  ON megalithic.sites(activity_score DESC);

-- Index for activity recency
CREATE INDEX IF NOT EXISTS idx_sites_activity_updated 
  ON megalithic.sites(activity_updated_at DESC NULLS LAST);

-- Composite index for geo + scoring queries (main map query)
-- This is the primary index used for smart site loading
CREATE INDEX IF NOT EXISTS idx_sites_geo_scoring 
  ON megalithic.sites(
    coordinates_lat, 
    coordinates_lng, 
    importance_score DESC, 
    activity_score DESC
  );

-- ============================================================================
-- SET INITIAL IMPORTANCE SCORES FOR EXISTING SITES
-- ============================================================================

-- Set base importance based on existing data signals
-- This is a reasonable initial estimate; can be refined later with backfill script
UPDATE megalithic.sites
SET importance_score = 
  CASE
    -- Verified official sites get high base score
    WHEN layer = 'official' AND verification_status = 'verified' THEN 
      LEAST(100, 70 + COALESCE(media_count, 0) * 2)
    -- Promoted community sites
    WHEN trust_tier = 'promoted' THEN 
      LEAST(90, 60 + COALESCE(media_count, 0) * 2)
    -- Gold tier community sites  
    WHEN trust_tier = 'gold' THEN 
      LEAST(80, 55 + COALESCE(media_count, 0) * 2)
    -- Verified community sites
    WHEN verification_status = 'verified' THEN 
      LEAST(75, 50 + COALESCE(media_count, 0) * 2)
    -- Silver tier
    WHEN trust_tier = 'silver' THEN 
      LEAST(60, 45 + COALESCE(media_count, 0))
    -- Under review with some media
    WHEN verification_status = 'under_review' AND COALESCE(media_count, 0) > 0 THEN 
      LEAST(50, 35 + COALESCE(media_count, 0))
    -- Under review, no media
    WHEN verification_status = 'under_review' THEN 30
    -- Unverified
    ELSE 20
  END
WHERE importance_score = 50; -- Only update if still at default

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON COLUMN megalithic.sites.importance_score IS 
  'Base importance (0-100). UNESCO=90-100, Major=80-89, Notable=60-79, Minor=20-59';

COMMENT ON COLUMN megalithic.sites.activity_score IS 
  'Dynamic activity points. Incremented by triggers on contributions (media +10, post +5, vote +2)';

COMMENT ON COLUMN megalithic.sites.activity_updated_at IS 
  'Last activity timestamp. Used with activity_score for time-weighted decay calculation';
