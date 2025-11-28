# Database Design Critique & Recommendations

## Current Schema Analysis

### ✅ What's Good

1. **Proper schema isolation** - Everything in `megalithic` schema
2. **UUID primary keys** - Good for distributed systems
3. **Timestamps** - `created_at`/`updated_at` on most tables
4. **RLS enabled** - Row-level security on all tables
5. **Generated columns** - Smart use for lat/lng filtering
6. **Indexes** - Good coverage for common queries

### ⚠️ Issues & Recommendations

---

## 1. Enum Values: CHECK Constraints vs Lookup Tables

**Current approach**: Using `CHECK` constraints with inline strings

```sql
role text check (role in ('user', 'contributor', 'researcher', 'expert', 'admin'))
asset_type text check (asset_type in ('image','video','model','document'))
```

**Problems**:
- Adding new values requires `ALTER TABLE` (migration)
- No metadata (descriptions, icons, sort order)
- Can't query "all possible values" easily
- Typos in application code aren't caught at compile time

**Recommendation**: Use **lookup tables** for values that:
- May grow over time
- Need metadata (icon, description, color)
- Are user-facing (need i18n support)

**Keep CHECK constraints** for values that:
- Are truly fixed (e.g., `visibility: public/private`)
- Are internal/technical (e.g., `status: pending/active/deleted`)

### Proposed Lookup Tables

```sql
-- Roles with metadata
create table megalithic.roles (
  slug text primary key,           -- 'contributor', 'researcher', etc.
  name text not null,              -- Display name
  description text,
  permissions jsonb default '{}',  -- Feature flags
  badge_icon text,                 -- Icon for UI
  sort_order int default 0,
  created_at timestamptz default now()
);

-- Site types (dolmen, menhir, stone circle, etc.)
create table megalithic.site_types (
  slug text primary key,
  name text not null,
  description text,
  icon text,
  category text,  -- 'megalithic', 'petroglyph', 'earthwork', etc.
  sort_order int default 0
);

-- Asset types
create table megalithic.asset_types (
  slug text primary key,
  name text not null,
  mime_types text[],  -- ['image/jpeg', 'image/png']
  max_size_mb int,
  icon text
);
```

---

## 2. Missing: Posts & Activity Feed

For a community platform, you need a posts/activity system:

```sql
-- Posts (research notes, site updates, discussions)
create table megalithic.posts (
  id uuid primary key default uuid_generate_v4(),
  author_id uuid references megalithic.profiles(id) on delete cascade not null,
  
  -- Polymorphic association (post can be about a site, zone, or standalone)
  target_type text check (target_type in ('site', 'zone', 'general', 'research')),
  target_id uuid,  -- FK to sites or zones (nullable for general posts)
  
  -- Content
  title text,
  body text not null,
  body_format text default 'markdown' check (body_format in ('markdown', 'html', 'plain')),
  
  -- Media attachments (references to media_assets)
  media_ids uuid[] default '{}',
  
  -- Metadata
  visibility text default 'public' check (visibility in ('public', 'followers', 'private')),
  is_pinned boolean default false,
  
  -- Engagement counts (denormalized for performance)
  likes_count int default 0,
  comments_count int default 0,
  shares_count int default 0,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  published_at timestamptz,  -- null = draft
  
  -- Full-text search
  search_vector tsvector generated always as (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(body, '')), 'B')
  ) stored
);

create index idx_posts_author on megalithic.posts(author_id);
create index idx_posts_target on megalithic.posts(target_type, target_id);
create index idx_posts_published on megalithic.posts(published_at desc) where published_at is not null;
create index idx_posts_search on megalithic.posts using gin(search_vector);
```

---

## 3. Missing: Comments (Threaded)

```sql
create table megalithic.comments (
  id uuid primary key default uuid_generate_v4(),
  author_id uuid references megalithic.profiles(id) on delete cascade not null,
  
  -- Polymorphic: comment on post, site, media, or another comment
  target_type text not null check (target_type in ('post', 'site', 'media', 'comment')),
  target_id uuid not null,
  
  -- For threaded comments
  parent_id uuid references megalithic.comments(id) on delete cascade,
  root_id uuid references megalithic.comments(id) on delete cascade,  -- Top-level comment
  depth int default 0,
  path ltree,  -- For efficient tree queries (requires ltree extension)
  
  -- Content
  body text not null,
  
  -- Engagement
  likes_count int default 0,
  
  -- Moderation
  is_hidden boolean default false,
  hidden_reason text,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_comments_target on megalithic.comments(target_type, target_id);
create index idx_comments_author on megalithic.comments(author_id);
create index idx_comments_parent on megalithic.comments(parent_id);
create index idx_comments_path on megalithic.comments using gist(path);
```

---

## 4. Missing: Reactions/Likes (Polymorphic)

Instead of separate like tables for each entity:

```sql
create table megalithic.reactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references megalithic.profiles(id) on delete cascade not null,
  
  -- What are we reacting to?
  target_type text not null check (target_type in ('post', 'comment', 'site', 'media')),
  target_id uuid not null,
  
  -- Reaction type (extensible)
  reaction_type text default 'like' check (reaction_type in ('like', 'love', 'insightful', 'helpful')),
  
  created_at timestamptz default now(),
  
  unique(user_id, target_type, target_id)  -- One reaction per user per target
);

create index idx_reactions_target on megalithic.reactions(target_type, target_id);
create index idx_reactions_user on megalithic.reactions(user_id);
```

---

## 5. Follow Requests (for private profiles)

Current `follows` table assumes instant follow. For follow requests:

```sql
-- Rename current table or add status
alter table megalithic.follows add column if not exists status text 
  default 'accepted' check (status in ('pending', 'accepted', 'rejected', 'blocked'));

-- Or create a separate requests table
create table megalithic.follow_requests (
  id uuid primary key default uuid_generate_v4(),
  requester_id uuid references megalithic.profiles(id) on delete cascade not null,
  target_id uuid references megalithic.profiles(id) on delete cascade not null,
  status text default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  message text,  -- Optional request message
  created_at timestamptz default now(),
  responded_at timestamptz,
  
  unique(requester_id, target_id)
);
```

---

## 6. Notifications

```sql
create table megalithic.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references megalithic.profiles(id) on delete cascade not null,
  
  -- What happened?
  type text not null,  -- 'follow', 'like', 'comment', 'mention', 'badge', etc.
  
  -- Who triggered it?
  actor_id uuid references megalithic.profiles(id) on delete set null,
  
  -- What's it about?
  target_type text,
  target_id uuid,
  
  -- Display
  title text not null,
  body text,
  url text,  -- Deep link
  
  -- State
  is_read boolean default false,
  read_at timestamptz,
  
  created_at timestamptz default now()
);

create index idx_notifications_user_unread on megalithic.notifications(user_id, is_read, created_at desc);
```

---

## 7. Tags: Array vs Join Table

**Current**: Using `text[]` arrays for tags

```sql
expertise_tags text[] default '{}'
tags text[] not null default '{}'
```

**Pros of arrays**:
- Simple queries: `WHERE 'archaeology' = ANY(tags)`
- No joins needed
- GIN index support

**Cons**:
- No tag metadata (description, count, synonyms)
- Hard to enforce consistency (typos create new "tags")
- Can't easily get "all tags" or "popular tags"

**Recommendation**: Hybrid approach

```sql
-- Canonical tags table
create table megalithic.tags (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  description text,
  category text,  -- 'culture', 'era', 'technique', 'material'
  usage_count int default 0,  -- Denormalized for sorting
  created_at timestamptz default now()
);

-- Keep arrays for quick filtering, but validate against tags table
-- Use a trigger to auto-create tags or reject unknown ones
```

---

## 8. Soft Deletes

Consider adding soft delete support for auditing:

```sql
-- Add to relevant tables
alter table megalithic.posts add column if not exists deleted_at timestamptz;
alter table megalithic.comments add column if not exists deleted_at timestamptz;

-- Update RLS policies to exclude deleted
create policy "Posts are viewable" on megalithic.posts
  for select using (deleted_at is null and visibility = 'public');
```

---

## 9. Audit Log

For compliance and debugging:

```sql
create table megalithic.audit_log (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id),
  action text not null,  -- 'create', 'update', 'delete'
  table_name text not null,
  record_id uuid,
  old_data jsonb,
  new_data jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz default now()
);

-- Trigger function for automatic auditing
create or replace function megalithic.audit_trigger()
returns trigger as $$
begin
  insert into megalithic.audit_log (user_id, action, table_name, record_id, old_data, new_data)
  values (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    coalesce(new.id, old.id),
    case when TG_OP in ('UPDATE', 'DELETE') then to_jsonb(old) end,
    case when TG_OP in ('INSERT', 'UPDATE') then to_jsonb(new) end
  );
  return coalesce(new, old);
end;
$$ language plpgsql security definer;
```

---

## Summary: Recommended Changes

### High Priority (Add Now)
1. ✅ `posts` table - Core content
2. ✅ `comments` table - Engagement
3. ✅ `reactions` table - Likes/engagement
4. ✅ `notifications` table - User alerts

### Medium Priority
5. 🔄 Add `status` to `follows` for requests
6. 🔄 `tags` lookup table
7. 🔄 `roles` lookup table with permissions

### Lower Priority
8. 📋 `audit_log` for compliance
9. 📋 Soft deletes on content tables
10. 📋 `site_types` and `asset_types` lookup tables

---

## Migration Strategy

1. Create new tables alongside existing ones
2. Add foreign keys carefully (nullable at first)
3. Migrate data if needed
4. Update application code
5. Add NOT NULL constraints after data is clean




