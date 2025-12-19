-- ============================================================================
-- Megalithic Mapper - Posts Tags Migration
-- ============================================================================
-- Adds tags array column to posts for hashtag support
-- ============================================================================

-- Add tags column for hashtags extracted from post body
ALTER TABLE megalithic.posts
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- GIN index for efficient tag queries
CREATE INDEX IF NOT EXISTS idx_posts_tags ON megalithic.posts USING gin(tags);

-- Index for filtering posts by tag
CREATE INDEX IF NOT EXISTS idx_posts_tags_array ON megalithic.posts USING gin(tags array_ops);
