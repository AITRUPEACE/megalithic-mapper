-- Add site zone join table for explicit memberships
create table if not exists megalithic.site_zones (
  site_id uuid references megalithic.sites(id) on delete cascade,
  zone_id uuid references megalithic.zones(id) on delete cascade,
  assigned_by text,
  assigned_at timestamptz not null default timezone('utc', now()),
  primary key (site_id, zone_id)
);

-- Generated columns to support bounding-box filtering on json coordinates
alter table megalithic.sites
  add column if not exists coordinates_lat double precision generated always as ((coordinates->>'lat')::double precision) stored
,
  add column if not exists coordinates_lng double precision generated always as ((coordinates->>'lng')::double precision) stored
;

alter table megalithic.zones
  add column if not exists bounds_min_lat double precision generated always as ((bounds->>'minLat')::double precision) stored,
  add column if not exists bounds_min_lng double precision generated always as ((bounds->>'minLng')::double precision) stored,
  add column if not exists bounds_max_lat double precision generated always as ((bounds->>'maxLat')::double precision) stored,
  add column if not exists bounds_max_lng double precision generated always as ((bounds->>'maxLng')::double precision) stored;

-- Helpful indexes for viewport queries and tag lookups
create index if not exists idx_sites_coordinates_lat_lng on megalithic.sites (coordinates_lat, coordinates_lng);
create index if not exists idx_zones_bounds_range on megalithic.zones (bounds_min_lat, bounds_max_lat, bounds_min_lng, bounds_max_lng);
create index if not exists idx_site_tags_by_type on megalithic.site_tags (tag_type, tag);
