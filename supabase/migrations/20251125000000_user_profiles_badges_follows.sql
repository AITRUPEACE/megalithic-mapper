-- Ensure profiles table exists with base columns (idempotent)
create table if not exists megalithic.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now())
);

-- Add existing columns from codebase if they don't exist
alter table megalithic.profiles add column if not exists full_name text;
alter table megalithic.profiles add column if not exists headline text;
alter table megalithic.profiles add column if not exists location text;
alter table megalithic.profiles add column if not exists expertise_tags text[] default '{}';
alter table megalithic.profiles add column if not exists contribution_intent text;
alter table megalithic.profiles add column if not exists collaboration_focus text;
alter table megalithic.profiles add column if not exists notify_research_activity boolean default true;
alter table megalithic.profiles add column if not exists notify_product_updates boolean default true;
alter table megalithic.profiles add column if not exists onboarding_completed boolean default false;
alter table megalithic.profiles add column if not exists default_viewport jsonb;

-- Add NEW columns for User Profile & Expert Flair
alter table megalithic.profiles add column if not exists username text unique;
alter table megalithic.profiles add column if not exists bio text; -- "About" section
alter table megalithic.profiles add column if not exists avatar_url text;
alter table megalithic.profiles add column if not exists website_url text;
alter table megalithic.profiles add column if not exists social_links jsonb default '{}';
alter table megalithic.profiles add column if not exists is_verified boolean default false;
alter table megalithic.profiles add column if not exists role text default 'user' check (role in ('user', 'contributor', 'researcher', 'expert', 'admin'));

-- Badges
create table if not exists megalithic.badges (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  description text,
  icon_url text,
  category text not null check (category in ('contribution', 'expert', 'community', 'achievement')),
  created_at timestamptz default timezone('utc', now())
);

create table if not exists megalithic.user_badges (
  user_id uuid references megalithic.profiles(id) on delete cascade,
  badge_id uuid references megalithic.badges(id) on delete cascade,
  awarded_at timestamptz default timezone('utc', now()),
  primary key (user_id, badge_id)
);

-- Follows
create table if not exists megalithic.follows (
  follower_id uuid references megalithic.profiles(id) on delete cascade,
  following_id uuid references megalithic.profiles(id) on delete cascade,
  created_at timestamptz default timezone('utc', now()),
  primary key (follower_id, following_id),
  constraint cant_follow_self check (follower_id != following_id)
);

-- Indexes
create index if not exists idx_profiles_username on megalithic.profiles(username);
create index if not exists idx_profiles_role on megalithic.profiles(role);
create index if not exists idx_user_badges_user on megalithic.user_badges(user_id);
create index if not exists idx_follows_follower on megalithic.follows(follower_id);
create index if not exists idx_follows_following on megalithic.follows(following_id);

-- Seed some default badges
insert into megalithic.badges (slug, name, description, category) values
  ('site-scout', 'Site Scout', 'Contributed a new site to the map', 'contribution'),
  ('knowledge-keeper', 'Knowledge Keeper', 'Contributed documentation or research', 'contribution'),
  ('community-voice', 'Community Voice', 'Active in discussions', 'community'),
  ('verified-expert', 'Verified Expert', 'Recognized domain expert', 'expert')
on conflict (slug) do nothing;

