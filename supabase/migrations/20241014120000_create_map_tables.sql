create extension if not exists "uuid-ossp";

create schema if not exists megalithic;

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
  updated_at timestamptz not null default timezone('utc', now())
);

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
  updated_by text,
  constraint sites_zone_ids_check check (zone_ids is not null)
);

create table if not exists megalithic.site_tags (
  site_id uuid references megalithic.sites(id) on delete cascade,
  tag text not null,
  tag_type text not null check (tag_type in ('culture','era','theme')),
  created_at timestamptz not null default timezone('utc', now()),
  primary key (site_id, tag, tag_type)
);
