# Megalithic Mapper MVP Plan

## Executive Summary

The core database schema is **already quite solid**. This document identifies:
1. What's already working
2. What needs to be added for MVP
3. What can be deferred
4. Migration/backup strategy

---

## ✅ Already Implemented (Database)

| Feature | Table | Status |
|---------|-------|--------|
| Sites with coordinates | `megalithic.sites` | ✅ Ready |
| Site verification status | `sites.verification_status` | ✅ Ready |
| Site tags (culture, era, theme) | `megalithic.site_tags` | ✅ Ready |
| Geographic zones | `megalithic.zones` | ✅ Ready |
| User profiles | `megalithic.profiles` | ✅ Ready |
| Role-based permissions | `profiles.role` | ✅ Ready |
| Verified users | `profiles.is_verified` | ✅ Ready |
| Posts (discussion, research, etc.) | `megalithic.posts` | ✅ Ready |
| Post types | `posts.post_type` | ✅ Ready |
| Threaded comments | `megalithic.comments` | ✅ Ready |
| Reactions (likes, bookmarks) | `megalithic.reactions` | ✅ Ready |
| User follows | `megalithic.follows` | ✅ Ready |
| Notifications | `megalithic.notifications` | ✅ Ready |
| Bookmarks | `megalithic.bookmarks` | ✅ Ready |
| Media assets | `megalithic.media_assets` | ✅ Ready |
| Badges | `megalithic.badges` | ✅ Ready |

---

## 🔧 MVP Additions Needed

### 1. Site Contribution Tracking
Track who contributed what and when.

```sql
-- Add contribution tracking to sites
ALTER TABLE megalithic.sites 
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
ADD COLUMN IF NOT EXISTS verified_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS verified_at timestamptz;
```

### 2. Site Follows (Watch List)
Users can follow sites to get updates.

```sql
CREATE TABLE IF NOT EXISTS megalithic.site_follows (
  user_id uuid REFERENCES megalithic.profiles(id) ON DELETE CASCADE,
  site_id uuid REFERENCES megalithic.sites(id) ON DELETE CASCADE,
  notify_updates BOOLEAN DEFAULT TRUE,
  notify_media BOOLEAN DEFAULT TRUE,
  notify_comments BOOLEAN DEFAULT TRUE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, site_id)
);
```

### 3. Community Votes (Site Verification)
Community votes to boost visibility and verify contributions.

```sql
CREATE TABLE IF NOT EXISTS megalithic.site_votes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES megalithic.profiles(id) ON DELETE CASCADE NOT NULL,
  site_id uuid REFERENCES megalithic.sites(id) ON DELETE CASCADE NOT NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('approve', 'reject', 'needs_info')),
  reason TEXT,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT unique_site_vote UNIQUE(user_id, site_id)
);

-- Track vote counts on sites
ALTER TABLE megalithic.sites
ADD COLUMN IF NOT EXISTS votes_approve INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS votes_reject INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS votes_needs_info INT DEFAULT 0;
```

### 4. External Links in Posts
For YouTube videos, articles, etc.

```sql
-- Already supported via posts.body (markdown) and posts.media_ids
-- Add explicit external link support
ALTER TABLE megalithic.posts
ADD COLUMN IF NOT EXISTS external_links jsonb DEFAULT '[]';
-- Format: [{"url": "https://youtube.com/...", "type": "youtube", "title": "...", "thumbnail": "..."}]
```

### 5. Activity Feed Table
Pre-computed activity feed for performance.

```sql
CREATE TABLE IF NOT EXISTS megalithic.activity_feed (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- What happened?
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'site_added', 'site_verified', 'site_updated',
    'media_added', 'post_created', 'comment_added',
    'user_joined', 'badge_earned', 'connection_proposed'
  )),
  
  -- Who did it?
  actor_id uuid REFERENCES megalithic.profiles(id) ON DELETE SET NULL,
  
  -- What's it about?
  target_type TEXT NOT NULL CHECK (target_type IN ('site', 'post', 'media', 'user', 'zone')),
  target_id uuid NOT NULL,
  
  -- Related site (for feed filtering)
  site_id uuid REFERENCES megalithic.sites(id) ON DELETE CASCADE,
  
  -- Denormalized display data
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  metadata jsonb DEFAULT '{}',
  
  -- Engagement (computed)
  engagement_score FLOAT DEFAULT 0,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  
  -- Full-text search
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B')
  ) STORED
);

-- Indexes for feed queries
CREATE INDEX IF NOT EXISTS idx_activity_feed_created ON megalithic.activity_feed(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_feed_type ON megalithic.activity_feed(activity_type);
CREATE INDEX IF NOT EXISTS idx_activity_feed_site ON megalithic.activity_feed(site_id) WHERE site_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_activity_feed_actor ON megalithic.activity_feed(actor_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_engagement ON megalithic.activity_feed(engagement_score DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_feed_search ON megalithic.activity_feed USING gin(search_vector);
```

---

## 📋 MVP Feature Checklist

### Phase 1: Core Functionality (Week 1-2)

#### Sites
- [ ] **Add Site Form** - Name, coordinates, summary, site_type, tags
- [ ] **Site Detail Page** - View site info, media, posts
- [ ] **Site Verification Flow** - Submit → Review → Verified
- [ ] **Site Voting** - Community approves/rejects new sites
- [ ] **My Contributions** - View sites you've added

#### Posts
- [ ] **Create Post Form** - Title, body (markdown), attach to site
- [ ] **Add External Links** - YouTube URL parser, thumbnail fetch
- [ ] **Upload Images** - Attach images to posts
- [ ] **Post Feed** - View posts, sorted by hot/new/top
- [ ] **Post Detail Page** - View post, comments

#### Comments
- [ ] **Add Comment** - Comment on posts, sites
- [ ] **Reply to Comment** - Threaded replies
- [ ] **Like/React** - React to comments

### Phase 2: Social Features (Week 2-3)

#### Profiles
- [ ] **Profile Setup** - Username, bio, avatar
- [ ] **Profile Page** - View user's contributions
- [ ] **Follow Users** - Follow/unfollow users
- [ ] **Following Feed** - Posts from people you follow

#### Feed
- [ ] **Activity Feed** - All site/post activity
- [ ] **Personalized Feed** - Based on follows, interests
- [ ] **Site Updates Feed** - Updates to sites you follow
- [ ] **Hot/New/Top Sorting** - Already implemented in UI

### Phase 3: Verification System (Week 3-4)

- [ ] **Expert Verification** - Verified users can mark sites verified
- [ ] **Community Voting** - Vote to approve/reject sites
- [ ] **Verification Badges** - Show verified status on sites
- [ ] **Contributor Reputation** - Track contribution quality

---

## 🗄️ Database Migration Script

Create this as a new migration file:

```sql
-- File: supabase/migrations/20251208000000_mvp_additions.sql

-- ============================================================================
-- MVP ADDITIONS - Expandable Schema
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

-- 4. External links in posts
ALTER TABLE megalithic.posts
ADD COLUMN IF NOT EXISTS external_links jsonb DEFAULT '[]';

-- 5. Activity feed table
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

-- 6. Auto-verify sites with enough community approval
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
      NULL, -- Community verified
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

-- 7. Trigger to create activity feed entries

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

-- On new post
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
```

---

## 🔄 Data Backup & Migration Scripts

### Export Script (Run before any destructive changes)

```bash
#!/bin/bash
# scripts/backup-data.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups/$DATE"
mkdir -p $BACKUP_DIR

# Export each table
supabase db dump --data-only --schema megalithic | grep -A 9999 "INSERT INTO megalithic.sites" > "$BACKUP_DIR/sites.sql"
supabase db dump --data-only --schema megalithic | grep -A 9999 "INSERT INTO megalithic.profiles" > "$BACKUP_DIR/profiles.sql"
supabase db dump --data-only --schema megalithic | grep -A 9999 "INSERT INTO megalithic.posts" > "$BACKUP_DIR/posts.sql"
supabase db dump --data-only --schema megalithic | grep -A 9999 "INSERT INTO megalithic.media_assets" > "$BACKUP_DIR/media.sql"

echo "Backup complete: $BACKUP_DIR"
```

### Re-seed Script (After schema changes)

```typescript
// scripts/migrate-data.ts
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

async function migrateData() {
  const backupDir = process.argv[2];
  if (!backupDir) {
    console.error('Usage: npx tsx scripts/migrate-data.ts ./backups/YYYYMMDD_HHMMSS');
    process.exit(1);
  }

  // Read backup files
  const sitesData = JSON.parse(fs.readFileSync(`${backupDir}/sites.json`, 'utf-8'));
  const profilesData = JSON.parse(fs.readFileSync(`${backupDir}/profiles.json`, 'utf-8'));
  const postsData = JSON.parse(fs.readFileSync(`${backupDir}/posts.json`, 'utf-8'));

  // Migrate with transformations if needed
  for (const site of sitesData) {
    // Apply any transformations for new schema
    const transformed = {
      ...site,
      // Add new fields with defaults
      votes_approve: 0,
      votes_reject: 0,
      votes_needs_info: 0,
    };

    const { error } = await supabase
      .from('sites')
      .upsert(transformed, { onConflict: 'id' });

    if (error) {
      console.error(`Failed to migrate site ${site.id}:`, error);
    }
  }

  console.log('Migration complete!');
}

migrateData();
```

---

## 📊 Feed Query Examples

### Hot Feed (Engagement + Recency)
```sql
SELECT * FROM megalithic.activity_feed
WHERE created_at > NOW() - INTERVAL '7 days'
ORDER BY 
  (engagement_score * 0.7 + 
   EXTRACT(EPOCH FROM (NOW() - created_at)) / -86400 * 0.3) DESC
LIMIT 50;
```

### New Feed
```sql
SELECT * FROM megalithic.activity_feed
ORDER BY created_at DESC
LIMIT 50;
```

### Following Feed
```sql
SELECT af.* FROM megalithic.activity_feed af
WHERE af.actor_id IN (
  SELECT following_id FROM megalithic.follows 
  WHERE follower_id = $1 AND status = 'accepted'
)
OR af.site_id IN (
  SELECT site_id FROM megalithic.site_follows
  WHERE user_id = $1
)
ORDER BY af.created_at DESC
LIMIT 50;
```

### Site-specific Feed
```sql
SELECT * FROM megalithic.activity_feed
WHERE site_id = $1
ORDER BY created_at DESC
LIMIT 50;
```

---

## 🎯 MVP Launch Checklist

### Database
- [ ] Run MVP migration script
- [ ] Verify RLS policies work
- [ ] Test activity feed triggers

### API Routes
- [ ] `POST /api/sites` - Create new site
- [ ] `POST /api/sites/[id]/vote` - Vote on site
- [ ] `POST /api/posts` - Create new post
- [ ] `GET /api/feed` - Get activity feed
- [ ] `POST /api/sites/[id]/follow` - Follow site

### UI Components
- [ ] Site submission form
- [ ] Site voting UI
- [ ] Post creation form
- [ ] Activity feed cards
- [ ] Profile page

### Testing
- [ ] Add site as contributor
- [ ] Vote on pending sites
- [ ] Create post with YouTube link
- [ ] Comment on post
- [ ] Follow user and site
- [ ] Verify feed shows activity

---

## 🚀 Future Expansions (No Schema Changes Needed)

The current schema supports adding these features WITHOUT migrations:

1. **YouTube Integration** → Just add posts with `external_links` containing YouTube URLs
2. **AI Summaries** → Add to `posts.metadata` or `activity_feed.metadata`
3. **Events/Tours** → Use `posts.post_type = 'event'` with metadata for dates
4. **Research Projects** → Use `posts.target_type = 'research'` with grouping
5. **Connections** → Use `posts.post_type = 'connection'` linking two sites
6. **Expert Verification** → Already supported via `profiles.role` and `sites.verified_by`

The schema is **designed for expansion** - use the `metadata` JSONB columns for any additional data!



