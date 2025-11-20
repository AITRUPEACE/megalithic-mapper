-- Media assets table to link uploads and embeds to entities
create table if not exists public.media_assets (
  id uuid primary key default uuid_generate_v4(),
  entity_type text not null check (entity_type in ('site','zone','artifact','expedition','text')),
  entity_id uuid not null,
  type text not null check (type in ('image','video','document','external_video','link','text')),
  uri text not null,
  storage_path text,
  title text,
  description text,
  attribution text,
  mime_type text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists media_assets_entity_idx on public.media_assets (entity_type, entity_id);

-- Public bucket for uploaded assets; client rules enforced in Supabase dashboard
insert into storage.buckets (id, name, public)
values ('media-assets', 'media-assets', true)
on conflict (id) do nothing;
