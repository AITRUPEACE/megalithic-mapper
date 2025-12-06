-- ============================================================================
-- Megalithic Mapper - Social Features Migration
-- ============================================================================
-- Adds: posts, comments, reactions, notifications, follow requests
-- Run AFTER the base schema (00000000000000_combined_schema.sql)
-- ============================================================================

-- Enable ltree extension for threaded comments
create extension if not exists ltree;

-- ============================================================================
-- LOOKUP TABLES (for extensible enums)
-- ============================================================================

-- Roles with metadata
create table if not exists megalithic.roles (
  slug text primary key,
  name text not null,
  description text,
  permissions jsonb default '{}',
  color text,
  icon text,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- Seed roles
insert into megalithic.roles (slug, name, description, permissions, sort_order) values
  ('user', 'User', 'Standard community member', '{"canComment": true}', 0),
  ('contributor', 'Contributor', 'Can add sites and media', '{"canComment": true, "canAddSites": true, "canAddMedia": true}', 1),
  ('researcher', 'Researcher', 'Verified researcher with edit access', '{"canComment": true, "canAddSites": true, "canAddMedia": true, "canEditSites": true}', 2),
  ('expert', 'Expert', 'Domain expert with verification abilities', '{"canComment": true, "canAddSites": true, "canAddMedia": true, "canEditSites": true, "canVerify": true}', 3),
  ('admin', 'Admin', 'Full administrative access', '{"canComment": true, "canAddSites": true, "canAddMedia": true, "canEditSites": true, "canVerify": true, "canModerate": true, "canManageUsers": true}', 4)
on conflict (slug) do nothing;

-- Site types
create table if not exists megalithic.site_types (
  slug text primary key,
  name text not null,
  description text,
  icon text,
  category text,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- Seed site types
insert into megalithic.site_types (slug, name, category, sort_order) values
  ('dolmen', 'Dolmen', 'megalithic', 1),
  ('menhir', 'Menhir / Standing Stone', 'megalithic', 2),
  ('stone-circle', 'Stone Circle', 'megalithic', 3),
  ('passage-tomb', 'Passage Tomb', 'megalithic', 4),
  ('cairn', 'Cairn', 'megalithic', 5),
  ('henge', 'Henge', 'earthwork', 6),
  ('hill-fort', 'Hill Fort', 'earthwork', 7),
  ('petroglyph', 'Petroglyph', 'rock-art', 8),
  ('pictograph', 'Pictograph', 'rock-art', 9),
  ('temple', 'Temple / Sanctuary', 'structure', 10),
  ('alignment', 'Alignment', 'megalithic', 11),
  ('other', 'Other', 'misc', 99)
on conflict (slug) do nothing;

-- Canonical tags
create table if not exists megalithic.tags (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  description text,
  category text check (category in ('culture', 'era', 'technique', 'material', 'theme', 'expertise')),
  usage_count int default 0,
  created_at timestamptz default now()
);

-- ============================================================================
-- POSTS (Research notes, updates, discussions)
-- ============================================================================

create table if not exists megalithic.posts (
  id uuid primary key default uuid_generate_v4(),
  author_id uuid references megalithic.profiles(id) on delete cascade not null,
  
  -- What is this post about? (polymorphic)
  target_type text check (target_type in ('site', 'zone', 'general', 'research')),
  target_id uuid,
  
  -- Content
  title text,
  body text not null,
  body_format text default 'markdown' check (body_format in ('markdown', 'html', 'plain')),
  excerpt text,  -- Auto-generated or manual summary
  
  -- Media (array of media_asset IDs)
  media_ids uuid[] default '{}',
  
  -- Metadata
  post_type text default 'discussion' check (post_type in ('discussion', 'research', 'update', 'question', 'announcement')),
  visibility text default 'public' check (visibility in ('public', 'followers', 'private', 'draft')),
  is_pinned boolean default false,
  allow_comments boolean default true,
  
  -- Engagement (denormalized for performance)
  likes_count int default 0,
  comments_count int default 0,
  shares_count int default 0,
  views_count int default 0,
  
  -- Timestamps
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  published_at timestamptz,
  deleted_at timestamptz,
  
  -- Full-text search
  search_vector tsvector generated always as (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(body, '')), 'B')
  ) stored
);

-- Post indexes
create index if not exists idx_posts_author on megalithic.posts(author_id);
create index if not exists idx_posts_target on megalithic.posts(target_type, target_id) where target_id is not null;
create index if not exists idx_posts_published on megalithic.posts(published_at desc nulls last) where deleted_at is null;
create index if not exists idx_posts_type on megalithic.posts(post_type);
create index if not exists idx_posts_search on megalithic.posts using gin(search_vector);

-- ============================================================================
-- COMMENTS (Threaded)
-- ============================================================================

create table if not exists megalithic.comments (
  id uuid primary key default uuid_generate_v4(),
  author_id uuid references megalithic.profiles(id) on delete cascade not null,
  
  -- What is this comment on? (polymorphic)
  target_type text not null check (target_type in ('post', 'site', 'media')),
  target_id uuid not null,
  
  -- Threading
  parent_id uuid references megalithic.comments(id) on delete cascade,
  root_id uuid,  -- Top-level comment in thread (self if top-level)
  depth int default 0 check (depth >= 0 and depth <= 10),  -- Limit nesting
  
  -- Content
  body text not null,
  
  -- Engagement
  likes_count int default 0,
  
  -- Moderation
  is_hidden boolean default false,
  hidden_reason text,
  hidden_by uuid references megalithic.profiles(id),
  
  -- Timestamps
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

-- Set root_id to self if top-level
create or replace function megalithic.set_comment_root()
returns trigger as $$
begin
  if new.parent_id is null then
    new.root_id := new.id;
    new.depth := 0;
  else
    select root_id, depth + 1 into new.root_id, new.depth
    from megalithic.comments where id = new.parent_id;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists comments_set_root on megalithic.comments;
create trigger comments_set_root
  before insert on megalithic.comments
  for each row execute function megalithic.set_comment_root();

-- Comment indexes
create index if not exists idx_comments_target on megalithic.comments(target_type, target_id);
create index if not exists idx_comments_author on megalithic.comments(author_id);
create index if not exists idx_comments_parent on megalithic.comments(parent_id) where parent_id is not null;
create index if not exists idx_comments_root on megalithic.comments(root_id);
create index if not exists idx_comments_created on megalithic.comments(created_at desc) where deleted_at is null;

-- ============================================================================
-- REACTIONS (Polymorphic likes/reactions)
-- ============================================================================

create table if not exists megalithic.reactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references megalithic.profiles(id) on delete cascade not null,
  
  -- What are we reacting to?
  target_type text not null check (target_type in ('post', 'comment', 'site', 'media')),
  target_id uuid not null,
  
  -- Reaction type
  reaction_type text default 'like' check (reaction_type in ('like', 'love', 'insightful', 'helpful', 'bookmark')),
  
  created_at timestamptz default now(),
  
  constraint unique_reaction unique(user_id, target_type, target_id, reaction_type)
);

-- Reaction indexes
create index if not exists idx_reactions_target on megalithic.reactions(target_type, target_id);
create index if not exists idx_reactions_user on megalithic.reactions(user_id);
create index if not exists idx_reactions_type on megalithic.reactions(reaction_type);

-- ============================================================================
-- FOLLOW REQUESTS (Upgrade follows table)
-- ============================================================================

-- Add status to existing follows table
alter table megalithic.follows 
  add column if not exists status text default 'accepted' 
    check (status in ('pending', 'accepted', 'rejected', 'blocked'));

alter table megalithic.follows
  add column if not exists message text;

alter table megalithic.follows
  add column if not exists responded_at timestamptz;

-- Index for pending requests
create index if not exists idx_follows_pending on megalithic.follows(following_id, status) 
  where status = 'pending';

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================

create table if not exists megalithic.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references megalithic.profiles(id) on delete cascade not null,
  
  -- What happened?
  type text not null check (type in (
    'follow', 'follow_request', 'follow_accepted',
    'like', 'comment', 'reply', 'mention',
    'badge', 'site_update', 'post_published',
    'system'
  )),
  
  -- Who triggered it?
  actor_id uuid references megalithic.profiles(id) on delete set null,
  
  -- What's it about?
  target_type text,
  target_id uuid,
  
  -- Display
  title text not null,
  body text,
  image_url text,
  action_url text,
  
  -- Grouping (for "X and 5 others liked your post")
  group_key text,
  
  -- State
  is_read boolean default false,
  read_at timestamptz,
  is_seen boolean default false,  -- Seen in notification list but not clicked
  seen_at timestamptz,
  
  created_at timestamptz default now()
);

-- Notification indexes
create index if not exists idx_notifications_user on megalithic.notifications(user_id, created_at desc);
create index if not exists idx_notifications_unread on megalithic.notifications(user_id, is_read, created_at desc) 
  where is_read = false;
create index if not exists idx_notifications_group on megalithic.notifications(group_key) 
  where group_key is not null;

-- ============================================================================
-- BOOKMARKS / SAVED ITEMS
-- ============================================================================

create table if not exists megalithic.bookmarks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references megalithic.profiles(id) on delete cascade not null,
  
  target_type text not null check (target_type in ('site', 'post', 'media', 'zone')),
  target_id uuid not null,
  
  -- Organization
  collection text,  -- User-defined collection name
  notes text,
  
  created_at timestamptz default now(),
  
  constraint unique_bookmark unique(user_id, target_type, target_id)
);

create index if not exists idx_bookmarks_user on megalithic.bookmarks(user_id, created_at desc);
create index if not exists idx_bookmarks_collection on megalithic.bookmarks(user_id, collection) 
  where collection is not null;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Posts
alter table megalithic.posts enable row level security;

create policy "Public posts are viewable by everyone" on megalithic.posts
  for select using (
    visibility = 'public' 
    and published_at is not null 
    and deleted_at is null
  );

create policy "Authors can view own posts" on megalithic.posts
  for select using (author_id = auth.uid());

create policy "Followers can view follower-only posts" on megalithic.posts
  for select using (
    visibility = 'followers'
    and published_at is not null
    and deleted_at is null
    and exists (
      select 1 from megalithic.follows 
      where follower_id = auth.uid() 
      and following_id = megalithic.posts.author_id
      and status = 'accepted'
    )
  );

create policy "Users can create posts" on megalithic.posts
  for insert with check (auth.uid() = author_id);

create policy "Authors can update own posts" on megalithic.posts
  for update using (auth.uid() = author_id);

create policy "Authors can delete own posts" on megalithic.posts
  for delete using (auth.uid() = author_id);

-- Comments
alter table megalithic.comments enable row level security;

create policy "Comments are viewable by everyone" on megalithic.comments
  for select using (deleted_at is null and is_hidden = false);

create policy "Authors can view own hidden comments" on megalithic.comments
  for select using (author_id = auth.uid());

create policy "Users can create comments" on megalithic.comments
  for insert with check (auth.uid() = author_id);

create policy "Authors can update own comments" on megalithic.comments
  for update using (auth.uid() = author_id);

create policy "Authors can delete own comments" on megalithic.comments
  for delete using (auth.uid() = author_id);

-- Reactions
alter table megalithic.reactions enable row level security;

create policy "Reactions are viewable by everyone" on megalithic.reactions
  for select using (true);

create policy "Users can add reactions" on megalithic.reactions
  for insert with check (auth.uid() = user_id);

create policy "Users can remove own reactions" on megalithic.reactions
  for delete using (auth.uid() = user_id);

-- Notifications
alter table megalithic.notifications enable row level security;

create policy "Users can view own notifications" on megalithic.notifications
  for select using (auth.uid() = user_id);

create policy "Users can update own notifications" on megalithic.notifications
  for update using (auth.uid() = user_id);

-- Bookmarks
alter table megalithic.bookmarks enable row level security;

create policy "Users can view own bookmarks" on megalithic.bookmarks
  for select using (auth.uid() = user_id);

create policy "Users can create bookmarks" on megalithic.bookmarks
  for insert with check (auth.uid() = user_id);

create policy "Users can delete own bookmarks" on megalithic.bookmarks
  for delete using (auth.uid() = user_id);

-- Lookup tables (public read)
alter table megalithic.roles enable row level security;
alter table megalithic.site_types enable row level security;
alter table megalithic.tags enable row level security;

create policy "Roles are viewable by everyone" on megalithic.roles for select using (true);
create policy "Site types are viewable by everyone" on megalithic.site_types for select using (true);
create policy "Tags are viewable by everyone" on megalithic.tags for select using (true);

-- ============================================================================
-- TRIGGERS: Update engagement counts
-- ============================================================================

-- Update post likes count
create or replace function megalithic.update_post_likes_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' and new.target_type = 'post' then
    update megalithic.posts set likes_count = likes_count + 1 where id = new.target_id;
  elsif TG_OP = 'DELETE' and old.target_type = 'post' then
    update megalithic.posts set likes_count = greatest(0, likes_count - 1) where id = old.target_id;
  end if;
  return coalesce(new, old);
end;
$$ language plpgsql security definer;

drop trigger if exists reactions_update_post_count on megalithic.reactions;
create trigger reactions_update_post_count
  after insert or delete on megalithic.reactions
  for each row execute function megalithic.update_post_likes_count();

-- Update post comments count
create or replace function megalithic.update_post_comments_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' and new.target_type = 'post' then
    update megalithic.posts set comments_count = comments_count + 1 where id = new.target_id;
  elsif TG_OP = 'DELETE' and old.target_type = 'post' then
    update megalithic.posts set comments_count = greatest(0, comments_count - 1) where id = old.target_id;
  end if;
  return coalesce(new, old);
end;
$$ language plpgsql security definer;

drop trigger if exists comments_update_post_count on megalithic.comments;
create trigger comments_update_post_count
  after insert or delete on megalithic.comments
  for each row execute function megalithic.update_post_comments_count();

-- Update comment likes count
create or replace function megalithic.update_comment_likes_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' and new.target_type = 'comment' then
    update megalithic.comments set likes_count = likes_count + 1 where id = new.target_id;
  elsif TG_OP = 'DELETE' and old.target_type = 'comment' then
    update megalithic.comments set likes_count = greatest(0, likes_count - 1) where id = old.target_id;
  end if;
  return coalesce(new, old);
end;
$$ language plpgsql security definer;

drop trigger if exists reactions_update_comment_count on megalithic.reactions;
create trigger reactions_update_comment_count
  after insert or delete on megalithic.reactions
  for each row execute function megalithic.update_comment_likes_count();

-- ============================================================================
-- UPDATED_AT TRIGGERS
-- ============================================================================

drop trigger if exists posts_updated_at on megalithic.posts;
create trigger posts_updated_at
  before update on megalithic.posts
  for each row execute procedure megalithic.update_updated_at();

drop trigger if exists comments_updated_at on megalithic.comments;
create trigger comments_updated_at
  before update on megalithic.comments
  for each row execute procedure megalithic.update_updated_at();








