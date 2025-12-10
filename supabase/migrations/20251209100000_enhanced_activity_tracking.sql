-- ============================================================================
-- Megalithic Mapper - Enhanced Activity Tracking
-- ============================================================================
-- Adds: source_type (official/community), change_type, change_magnitude
-- Enables smart feed prioritization and filtering
-- ============================================================================

-- Add source_type to track official vs community activity
ALTER TABLE megalithic.activity_feed
ADD COLUMN IF NOT EXISTS source_type TEXT DEFAULT 'community' 
  CHECK (source_type IN ('official', 'community', 'system'));

-- Add change_type for more granular activity categorization
-- This replaces the generic "site_updated" with specific change types
ALTER TABLE megalithic.activity_feed
ADD COLUMN IF NOT EXISTS change_type TEXT
  CHECK (change_type IN (
    -- Site changes (ordered by importance/magnitude)
    'new_site',              -- Highest priority: brand new site added
    'site_verified',         -- Site verified by official or community
    'video_added',           -- Videos are high-value content
    'photos_added',          -- Photo uploads (count matters)
    'document_added',        -- Research documents, papers, external 3D scans
    'description_updated',   -- Text updates (lowest for site updates)
    'coordinates_updated',   -- Location corrections
    'metadata_updated',      -- Tags, categories, etc.
    
    -- Engagement-driven
    'trending',              -- Site/content is trending
    'milestone',             -- Engagement milestone reached
    
    -- Social
    'post_created',          -- New discussion/post
    'research_published',    -- Research paper or analysis
    'event_announced',       -- Events, tours, etc.
    'connection_proposed'    -- New site connection theory
  ));

-- Add change_magnitude to rank importance of changes
-- Higher = more important, affects feed ranking
ALTER TABLE megalithic.activity_feed
ADD COLUMN IF NOT EXISTS change_magnitude INT DEFAULT 50
  CHECK (change_magnitude >= 0 AND change_magnitude <= 100);

-- Add media counts for "X photos added" style descriptions
ALTER TABLE megalithic.activity_feed
ADD COLUMN IF NOT EXISTS media_count INT DEFAULT 0;

-- Add fields to track what specifically changed (for update activities)
ALTER TABLE megalithic.activity_feed
ADD COLUMN IF NOT EXISTS change_details JSONB DEFAULT '{}';
-- Format: {"fields_changed": ["description", "coordinates"], "old_values": {...}, "new_values": {...}}

-- Indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_activity_feed_source 
  ON megalithic.activity_feed(source_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_activity_feed_change_type 
  ON megalithic.activity_feed(change_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_activity_feed_magnitude 
  ON megalithic.activity_feed(change_magnitude DESC, created_at DESC);

-- Composite index for smart feed sorting (official first, then by magnitude)
CREATE INDEX IF NOT EXISTS idx_activity_feed_smart_sort 
  ON megalithic.activity_feed(source_type, change_magnitude DESC, engagement_score DESC, created_at DESC);

-- ============================================================================
-- UPDATE MAGNITUDE VALUES FOR EXISTING RECORDS
-- ============================================================================

-- Set default magnitudes based on activity type
UPDATE megalithic.activity_feed
SET 
  change_type = CASE activity_type
    WHEN 'site_added' THEN 'new_site'
    WHEN 'site_verified' THEN 'site_verified'
    WHEN 'media_added' THEN 'photos_added'
    WHEN 'post_created' THEN 'post_created'
    WHEN 'comment_added' THEN 'post_created'
    ELSE 'metadata_updated'
  END,
  change_magnitude = CASE activity_type
    WHEN 'site_added' THEN 100
    WHEN 'site_verified' THEN 90
    WHEN 'media_added' THEN 70
    WHEN 'post_created' THEN 60
    WHEN 'comment_added' THEN 40
    ELSE 30
  END,
  source_type = 'community'
WHERE change_type IS NULL;

-- ============================================================================
-- UPDATED ACTIVITY TRIGGERS WITH CHANGE TRACKING
-- ============================================================================

-- Enhanced site activity creation with change type detection
CREATE OR REPLACE FUNCTION megalithic.create_site_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO megalithic.activity_feed (
    activity_type, actor_id, target_type, target_id, site_id, 
    title, description, source_type, change_type, change_magnitude
  ) VALUES (
    'site_added',
    NEW.created_by,
    'site',
    NEW.id,
    NEW.id,
    'New site: ' || NEW.name,
    NEW.summary,
    CASE 
      WHEN NEW.verification_status = 'verified' THEN 'official'
      ELSE 'community'
    END,
    'new_site',
    100  -- New sites have maximum magnitude
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced media activity with video vs photo detection
CREATE OR REPLACE FUNCTION megalithic.create_media_activity()
RETURNS TRIGGER AS $$
DECLARE
  site_name TEXT;
  v_change_type TEXT;
  v_magnitude INT;
  v_title TEXT;
BEGIN
  IF NEW.site_id IS NOT NULL THEN
    SELECT name INTO site_name FROM megalithic.sites WHERE id = NEW.site_id;
  END IF;

  -- Determine change type and magnitude based on media type
  IF NEW.asset_type = 'video' OR NEW.asset_type = 'youtube' THEN
    v_change_type := 'video_added';
    v_magnitude := 85;
    v_title := 'New video: ' || COALESCE(NEW.title, site_name);
  ELSIF NEW.asset_type = 'document' OR NEW.asset_type = 'pdf' THEN
    v_change_type := 'document_added';
    v_magnitude := 75;
    v_title := 'New document: ' || COALESCE(NEW.title, site_name);
  ELSE
    v_change_type := 'photos_added';
    v_magnitude := 70;
    v_title := 'New photos: ' || COALESCE(NEW.title, site_name);
  END IF;

  INSERT INTO megalithic.activity_feed (
    activity_type, actor_id, target_type, target_id, site_id, 
    title, description, thumbnail_url, 
    source_type, change_type, change_magnitude, media_count
  ) VALUES (
    'media_added',
    NEW.contributor_id,
    'media',
    NEW.id,
    NEW.site_id,
    v_title,
    NEW.description,
    NEW.thumbnail_url,
    'community',  -- Media additions are always community sourced
    v_change_type,
    v_magnitude,
    1  -- Single media item
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SITE UPDATE TRACKING TRIGGER (Detects what changed)
-- ============================================================================

CREATE OR REPLACE FUNCTION megalithic.track_site_update()
RETURNS TRIGGER AS $$
DECLARE
  v_changes JSONB := '{}';
  v_change_type TEXT;
  v_magnitude INT := 30;  -- Default low magnitude for minor updates
  v_description TEXT := '';
  changed_fields TEXT[] := '{}';
BEGIN
  -- Skip if this is just a vote count update or timestamps
  IF (OLD.votes_approve != NEW.votes_approve OR
      OLD.votes_reject != NEW.votes_reject OR
      OLD.votes_needs_info != NEW.votes_needs_info) AND
     OLD.name = NEW.name AND
     OLD.summary = NEW.summary AND
     OLD.description = NEW.description THEN
    RETURN NEW;
  END IF;

  -- Track what changed
  IF OLD.description IS DISTINCT FROM NEW.description THEN
    changed_fields := array_append(changed_fields, 'description');
    v_change_type := 'description_updated';
    v_magnitude := GREATEST(v_magnitude, 50);
    v_description := 'Description updated';
  END IF;

  IF OLD.name IS DISTINCT FROM NEW.name THEN
    changed_fields := array_append(changed_fields, 'name');
    v_magnitude := GREATEST(v_magnitude, 40);
  END IF;

  IF OLD.latitude IS DISTINCT FROM NEW.latitude OR 
     OLD.longitude IS DISTINCT FROM NEW.longitude THEN
    changed_fields := array_append(changed_fields, 'coordinates');
    v_change_type := COALESCE(v_change_type, 'coordinates_updated');
    v_magnitude := GREATEST(v_magnitude, 45);
    v_description := CASE 
      WHEN v_description = '' THEN 'Coordinates corrected'
      ELSE v_description || ', coordinates corrected'
    END;
  END IF;

  IF OLD.summary IS DISTINCT FROM NEW.summary THEN
    changed_fields := array_append(changed_fields, 'summary');
    v_change_type := COALESCE(v_change_type, 'description_updated');
    v_magnitude := GREATEST(v_magnitude, 45);
  END IF;

  IF OLD.site_type IS DISTINCT FROM NEW.site_type THEN
    changed_fields := array_append(changed_fields, 'site_type');
    v_change_type := COALESCE(v_change_type, 'metadata_updated');
    v_magnitude := GREATEST(v_magnitude, 35);
  END IF;

  -- Verification status change is high priority
  IF OLD.verification_status IS DISTINCT FROM NEW.verification_status THEN
    IF NEW.verification_status = 'verified' THEN
      v_change_type := 'site_verified';
      v_magnitude := 90;
      v_description := 'Site has been verified';
    END IF;
    changed_fields := array_append(changed_fields, 'verification_status');
  END IF;

  -- Only create activity if something meaningful changed
  IF array_length(changed_fields, 1) > 0 THEN
    v_changes := jsonb_build_object('fields_changed', changed_fields);
    
    INSERT INTO megalithic.activity_feed (
      activity_type, actor_id, target_type, target_id, site_id,
      title, description, source_type, change_type, change_magnitude, change_details
    ) VALUES (
      'site_updated',
      NEW.verified_by,  -- Use verified_by if available, otherwise NULL
      'site',
      NEW.id,
      NEW.id,
      NEW.name || ' updated',
      CASE 
        WHEN v_description != '' THEN v_description
        ELSE 'Site information updated: ' || array_to_string(changed_fields, ', ')
      END,
      CASE 
        WHEN NEW.verified_by IS NOT NULL THEN 'official'
        ELSE 'community'
      END,
      COALESCE(v_change_type, 'metadata_updated'),
      v_magnitude,
      v_changes
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger (don't overwrite on every update, only track meaningful changes)
DROP TRIGGER IF EXISTS sites_track_update ON megalithic.sites;
CREATE TRIGGER sites_track_update
  AFTER UPDATE ON megalithic.sites
  FOR EACH ROW
  WHEN (
    OLD.name IS DISTINCT FROM NEW.name OR
    OLD.description IS DISTINCT FROM NEW.description OR
    OLD.summary IS DISTINCT FROM NEW.summary OR
    OLD.latitude IS DISTINCT FROM NEW.latitude OR
    OLD.longitude IS DISTINCT FROM NEW.longitude OR
    OLD.verification_status IS DISTINCT FROM NEW.verification_status OR
    OLD.site_type IS DISTINCT FROM NEW.site_type
  )
  EXECUTE FUNCTION megalithic.track_site_update();

-- ============================================================================
-- SMART FEED FUNCTION - Prioritized by magnitude and official status
-- ============================================================================

CREATE OR REPLACE FUNCTION megalithic.get_smart_feed(
  p_user_id uuid DEFAULT NULL,
  p_source_filter TEXT DEFAULT 'all',  -- 'all', 'official', 'community'
  p_limit INT DEFAULT 50,
  p_offset INT DEFAULT 0
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
  source_type text,
  change_type text,
  change_magnitude int,
  media_count int,
  change_details jsonb,
  smart_score float
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
    af.source_type,
    af.change_type,
    af.change_magnitude,
    af.media_count,
    af.change_details,
    -- Smart score calculation
    (
      af.change_magnitude * 1.0 +
      af.engagement_score * 0.5 +
      -- Official sources get a boost
      CASE WHEN af.source_type = 'official' THEN 20 ELSE 0 END +
      -- Recency decay (lose 1 point per hour, max 48)
      GREATEST(0, 48 - EXTRACT(EPOCH FROM (NOW() - af.created_at)) / 3600)
    )::float as smart_score
  FROM megalithic.activity_feed af
  WHERE 
    -- Source filter
    (p_source_filter = 'all' OR af.source_type = p_source_filter)
    -- Exclude very low magnitude changes from community unless they have engagement
    AND (
      af.source_type = 'official' 
      OR af.change_magnitude >= 40 
      OR af.engagement_score >= 5
    )
  ORDER BY 
    -- Official sources first when showing all
    CASE WHEN p_source_filter = 'all' AND af.source_type = 'official' THEN 0 ELSE 1 END,
    -- Then by smart score
    (
      af.change_magnitude * 1.0 +
      af.engagement_score * 0.5 +
      CASE WHEN af.source_type = 'official' THEN 20 ELSE 0 END +
      GREATEST(0, 48 - EXTRACT(EPOCH FROM (NOW() - af.created_at)) / 3600)
    ) DESC,
    af.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION megalithic.get_smart_feed TO authenticated, anon;

-- ============================================================================
-- HELPER: Get human-readable change description
-- ============================================================================

CREATE OR REPLACE FUNCTION megalithic.get_activity_label(
  p_change_type TEXT,
  p_media_count INT DEFAULT 1
)
RETURNS TEXT AS $$
BEGIN
  RETURN CASE p_change_type
    WHEN 'new_site' THEN 'New site added'
    WHEN 'site_verified' THEN 'Site verified'
    WHEN 'video_added' THEN 'Video added'
    WHEN 'photos_added' THEN 
      CASE WHEN p_media_count > 1 
        THEN p_media_count || ' photos added'
        ELSE 'Photo added'
      END
    WHEN 'document_added' THEN 'Document added'
    WHEN 'description_updated' THEN 'Description updated'
    WHEN 'coordinates_updated' THEN 'Location corrected'
    WHEN 'metadata_updated' THEN 'Details updated'
    WHEN 'trending' THEN 'Trending'
    WHEN 'milestone' THEN 'Milestone reached'
    WHEN 'post_created' THEN 'New discussion'
    WHEN 'research_published' THEN 'Research published'
    WHEN 'event_announced' THEN 'Event announced'
    WHEN 'connection_proposed' THEN 'Connection discovered'
    ELSE 'Updated'
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

