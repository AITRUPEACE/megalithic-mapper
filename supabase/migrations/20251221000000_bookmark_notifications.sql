-- ============================================================================
-- Bookmark Notifications Enhancement
-- ============================================================================
-- Adds notification support to bookmarks so users can be notified
-- when bookmarked content has new activity
-- ============================================================================

-- Add notification columns to bookmarks table
ALTER TABLE megalithic.bookmarks
ADD COLUMN IF NOT EXISTS notify_on_update BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS last_seen_at timestamptz DEFAULT now(),
ADD COLUMN IF NOT EXISTS has_new_activity BOOLEAN DEFAULT FALSE;

-- Index for efficient lookup of bookmarks with new activity
CREATE INDEX IF NOT EXISTS idx_bookmarks_new_activity 
ON megalithic.bookmarks(user_id, has_new_activity) 
WHERE has_new_activity = TRUE;

-- Function to mark bookmarks as having new activity
-- Called when content is updated (post edited, new comment, etc.)
CREATE OR REPLACE FUNCTION megalithic.notify_bookmark_holders()
RETURNS TRIGGER AS $$
BEGIN
  -- Mark all bookmarks for this content as having new activity
  UPDATE megalithic.bookmarks
  SET has_new_activity = TRUE
  WHERE target_type = TG_ARGV[0]
    AND target_id = NEW.id
    AND notify_on_update = TRUE
    AND user_id != COALESCE(NEW.author_id, NEW.user_id, NEW.created_by);
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for post updates
DROP TRIGGER IF EXISTS notify_bookmarks_on_post_update ON megalithic.posts;
CREATE TRIGGER notify_bookmarks_on_post_update
  AFTER UPDATE ON megalithic.posts
  FOR EACH ROW
  WHEN (OLD.updated_at IS DISTINCT FROM NEW.updated_at)
  EXECUTE FUNCTION megalithic.notify_bookmark_holders('post');

-- Trigger for new comments (notify bookmarked post holders)
CREATE OR REPLACE FUNCTION megalithic.notify_bookmark_holders_on_comment()
RETURNS TRIGGER AS $$
BEGIN
  -- Mark bookmarks for the parent post as having new activity
  IF NEW.target_type = 'post' THEN
    UPDATE megalithic.bookmarks
    SET has_new_activity = TRUE
    WHERE target_type = 'post'
      AND target_id = NEW.target_id
      AND notify_on_update = TRUE
      AND user_id != NEW.author_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS notify_bookmarks_on_new_comment ON megalithic.comments;
CREATE TRIGGER notify_bookmarks_on_new_comment
  AFTER INSERT ON megalithic.comments
  FOR EACH ROW
  EXECUTE FUNCTION megalithic.notify_bookmark_holders_on_comment();

-- Function to clear new activity flag when user views content
CREATE OR REPLACE FUNCTION megalithic.clear_bookmark_new_activity(
  p_user_id uuid,
  p_target_type text,
  p_target_id uuid
)
RETURNS void AS $$
BEGIN
  UPDATE megalithic.bookmarks
  SET 
    has_new_activity = FALSE,
    last_seen_at = now()
  WHERE user_id = p_user_id
    AND target_type = p_target_type
    AND target_id = p_target_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION megalithic.clear_bookmark_new_activity TO authenticated;
