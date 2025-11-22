create schema if not exists megalithic;
create extension if not exists "uuid-ossp";

create table if not exists megalithic.media_assets (
  id uuid primary key default uuid_generate_v4(),
  site_id uuid references megalithic.sites(id) on delete set null,
  title text not null,
  description text,
  asset_type text not null check (asset_type in ('image','video','model','document')),
  url text not null,
  thumbnail_url text,
  storage_path text,
  contributor text not null,
  civilization text,
  tags text[] not null default '{}',
  metadata jsonb not null default '{}',
  visibility text not null default 'public' check (visibility in ('public','team','private')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_media_assets_site_id on megalithic.media_assets (site_id);
create index if not exists idx_media_assets_tags on megalithic.media_assets using gin (tags);
create index if not exists idx_media_assets_civilization on megalithic.media_assets (civilization);
