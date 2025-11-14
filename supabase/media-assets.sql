-- Supabase schema for media assets captured from field uploads and references.
-- The table stores both storage-backed files and external embeds so the UI
-- can render consistent galleries across sites, artifacts, expeditions, and
-- survey zones.

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('site','artifact','text','expedition','zone')),
  entity_id uuid not null,
  type text not null check (type in ('image','video','audio','document','link','text')), 
  storage_bucket text default 'media-assets',
  storage_path text,
  uri text not null,
  thumbnail_uri text,
  attribution jsonb default '{}'::jsonb,
  metadata jsonb default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

comment on column public.media_assets.entity_type is 'Target entity (site, artifact, text, expedition, survey zone).';
comment on column public.media_assets.storage_path is 'Relative path inside the storage bucket when the asset is uploaded.';
comment on column public.media_assets.uri is 'Canonical URI for rendering (public storage URL or external embed link).';
comment on column public.media_assets.attribution is 'JSON blob storing contributor, license, and source credits.';

alter table public.media_assets enable row level security;

create policy "Allow owners to manage media" on public.media_assets
  for all
  using (auth.uid() = created_by)
  with check (auth.uid() = created_by);

create policy "Allow read access to verified content" on public.media_assets
  for select
  using (true);

-- Storage bucket recommended defaults for Supabase Storage.
insert into storage.buckets (id, name, public)
  values ('media-assets', 'media-assets', true)
  on conflict (id) do nothing;

-- Allow authenticated users to upload into the bucket.
create policy if not exists "Allow authenticated uploads"
  on storage.objects for insert
  with check (
    bucket_id = 'media-assets' and auth.role() = 'authenticated'
  );

create policy if not exists "Allow public reads"
  on storage.objects for select
  using (bucket_id = 'media-assets');
