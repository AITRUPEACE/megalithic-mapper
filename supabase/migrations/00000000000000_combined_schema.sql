-- ============================================================================
-- Megalithic Mapper - Combined Schema Setup
-- ============================================================================
-- Run this in Supabase SQL Editor to create all tables at once
-- Or apply via: npx supabase db push (if using local dev)
-- ============================================================================

-- Extensions
create extension if not exists "uuid-ossp";

-- Schema
create schema if not exists megalithic;

-- ============================================================================
-- CORE MAP TABLES
-- ============================================================================

-- Zones (geographic regions)
create table if not exists megalithic.zones (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  description text,
  color text not null default '#2563eb',
  bounds jsonb not null,
  centroid jsonb not null,
  culture_focus text[] not null default '{}',
  era_focus text[] not null default '{}',
  verification_state text not null default 'draft',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  -- Generated columns for bounding-box filtering
  bounds_min_lat double precision generated always as ((bounds->>'minLat')::double precision) stored,
  bounds_min_lng double precision generated always as ((bounds->>'minLng')::double precision) stored,
  bounds_max_lat double precision generated always as ((bounds->>'maxLat')::double precision) stored,
  bounds_max_lng double precision generated always as ((bounds->>'maxLng')::double precision) stored
);

-- Sites (megalithic locations)
create table if not exists megalithic.sites (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  summary text not null,
  site_type text not null,
  category text not null,
  coordinates jsonb not null,
  layer text not null default 'community',
  verification_status text not null default 'under_review',
  trust_tier text,
  media_count integer not null default 0,
  related_research_ids text[] not null default '{}',
  zone_ids uuid[] not null default '{}',
  updated_at timestamptz not null default timezone('utc', now()),
  updated_by uuid references auth.users(id) on delete set null,
  -- Generated columns for coordinate filtering
  coordinates_lat double precision generated always as ((coordinates->>'lat')::double precision) stored,
  coordinates_lng double precision generated always as ((coordinates->>'lng')::double precision) stored,
  constraint sites_zone_ids_check check (zone_ids is not null)
);

-- Site tags (culture, era, theme)
create table if not exists megalithic.site_tags (
  site_id uuid references megalithic.sites(id) on delete cascade,
  tag text not null,
  tag_type text not null check (tag_type in ('culture','era','theme')),
  created_at timestamptz not null default timezone('utc', now()),
  primary key (site_id, tag, tag_type)
);

-- Site-zone join table
create table if not exists megalithic.site_zones (
  site_id uuid references megalithic.sites(id) on delete cascade,
  zone_id uuid references megalithic.zones(id) on delete cascade,
  assigned_by uuid references auth.users(id) on delete set null,
  assigned_at timestamptz not null default timezone('utc', now()),
  primary key (site_id, zone_id)
);

-- ============================================================================
-- MEDIA ASSETS
-- ============================================================================

create table if not exists megalithic.media_assets (
  id uuid primary key default uuid_generate_v4(),
  site_id uuid references megalithic.sites(id) on delete set null,
  title text not null,
  description text,
  asset_type text not null check (asset_type in ('image','video','model','document')),
  url text not null,
  thumbnail_url text,
  storage_path text,
  contributor_id uuid references auth.users(id) on delete set null,
  contributor_name text not null,
  civilization text,
  tags text[] not null default '{}',
  metadata jsonb not null default '{}',
  visibility text not null default 'public' check (visibility in ('public','team','private')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- ============================================================================
-- USER PROFILES & AUTH
-- ============================================================================

create table if not exists megalithic.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique,
  full_name text,
  headline text,
  bio text,
  avatar_url text,
  location text,
  website_url text,
  social_links jsonb default '{}',
  role text not null default 'user' check (role in ('user', 'contributor', 'researcher', 'expert', 'admin')),
  is_verified boolean default false,
  expertise_tags text[] default '{}',
  contribution_intent text,
  collaboration_focus text,
  notify_research_activity boolean default true,
  notify_product_updates boolean default true,
  onboarding_completed boolean default false,
  default_viewport jsonb,
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now())
);

-- Badges system
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

-- Social follows
create table if not exists megalithic.follows (
  follower_id uuid references megalithic.profiles(id) on delete cascade,
  following_id uuid references megalithic.profiles(id) on delete cascade,
  created_at timestamptz default timezone('utc', now()),
  primary key (follower_id, following_id),
  constraint cant_follow_self check (follower_id != following_id)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Map indexes
create index if not exists idx_sites_coordinates_lat_lng on megalithic.sites (coordinates_lat, coordinates_lng);
create index if not exists idx_zones_bounds_range on megalithic.zones (bounds_min_lat, bounds_max_lat, bounds_min_lng, bounds_max_lng);
create index if not exists idx_site_tags_by_type on megalithic.site_tags (tag_type, tag);

-- Media indexes
create index if not exists idx_media_assets_site_id on megalithic.media_assets (site_id);
create index if not exists idx_media_assets_tags on megalithic.media_assets using gin (tags);
create index if not exists idx_media_assets_civilization on megalithic.media_assets (civilization);

-- Profile indexes
create index if not exists idx_profiles_username on megalithic.profiles(username);
create index if not exists idx_profiles_role on megalithic.profiles(role);
create index if not exists idx_user_badges_user on megalithic.user_badges(user_id);
create index if not exists idx_follows_follower on megalithic.follows(follower_id);
create index if not exists idx_follows_following on megalithic.follows(following_id);

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Default badges
insert into megalithic.badges (slug, name, description, category) values
  ('site-scout', 'Site Scout', 'Contributed a new site to the map', 'contribution'),
  ('knowledge-keeper', 'Knowledge Keeper', 'Contributed documentation or research', 'contribution'),
  ('community-voice', 'Community Voice', 'Active in discussions', 'community'),
  ('verified-expert', 'Verified Expert', 'Recognized domain expert', 'expert')
on conflict (slug) do nothing;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
alter table megalithic.profiles enable row level security;
alter table megalithic.badges enable row level security;
alter table megalithic.user_badges enable row level security;
alter table megalithic.follows enable row level security;
alter table megalithic.sites enable row level security;
alter table megalithic.zones enable row level security;
alter table megalithic.site_tags enable row level security;
alter table megalithic.site_zones enable row level security;
alter table megalithic.media_assets enable row level security;

-- Profiles: Public read, owner update
create policy "Profiles are viewable by everyone" on megalithic.profiles
  for select using (true);

create policy "Users can update own profile" on megalithic.profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on megalithic.profiles
  for insert with check (auth.uid() = id);

-- Badges: Public read
create policy "Badges are viewable by everyone" on megalithic.badges
  for select using (true);

-- User badges: Public read
create policy "User badges are viewable by everyone" on megalithic.user_badges
  for select using (true);

-- Follows: Public read, authenticated insert/delete own
create policy "Follows are viewable by everyone" on megalithic.follows
  for select using (true);

create policy "Authenticated users can follow" on megalithic.follows
  for insert with check (auth.uid() = follower_id);

create policy "Users can unfollow" on megalithic.follows
  for delete using (auth.uid() = follower_id);

-- Sites: Public read, contributor+ can insert/update
create policy "Sites are viewable by everyone" on megalithic.sites
  for select using (true);

create policy "Contributors can insert sites" on megalithic.sites
  for insert with check (
    exists (
      select 1 from megalithic.profiles 
      where id = auth.uid() 
      and role in ('contributor', 'researcher', 'expert', 'admin')
    )
  );

create policy "Contributors can update sites" on megalithic.sites
  for update using (
    exists (
      select 1 from megalithic.profiles 
      where id = auth.uid() 
      and role in ('contributor', 'researcher', 'expert', 'admin')
    )
  );

-- Zones: Public read
create policy "Zones are viewable by everyone" on megalithic.zones
  for select using (true);

-- Site tags: Public read
create policy "Site tags are viewable by everyone" on megalithic.site_tags
  for select using (true);

-- Site zones: Public read
create policy "Site zones are viewable by everyone" on megalithic.site_zones
  for select using (true);

-- Media assets: Public read for public assets
create policy "Public media assets are viewable by everyone" on megalithic.media_assets
  for select using (visibility = 'public' or contributor_id = auth.uid());

create policy "Contributors can insert media" on megalithic.media_assets
  for insert with check (auth.uid() = contributor_id);

create policy "Contributors can update own media" on megalithic.media_assets
  for update using (auth.uid() = contributor_id);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Auto-create profile on user signup
create or replace function megalithic.handle_new_user()
returns trigger as $$
begin
  insert into megalithic.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists, then create
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure megalithic.handle_new_user();

-- Update timestamp trigger
create or replace function megalithic.update_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

-- Apply to tables with updated_at
drop trigger if exists profiles_updated_at on megalithic.profiles;
create trigger profiles_updated_at
  before update on megalithic.profiles
  for each row execute procedure megalithic.update_updated_at();

drop trigger if exists sites_updated_at on megalithic.sites;
create trigger sites_updated_at
  before update on megalithic.sites
  for each row execute procedure megalithic.update_updated_at();

drop trigger if exists media_assets_updated_at on megalithic.media_assets;
create trigger media_assets_updated_at
  before update on megalithic.media_assets
  for each row execute procedure megalithic.update_updated_at();

