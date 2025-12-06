-- Fix permissions for megalithic schema
-- This grants the necessary permissions for the API to access the schema

-- Grant USAGE on the schema (required to access any objects in it)
GRANT USAGE ON SCHEMA megalithic TO anon, authenticated;

-- Grant SELECT on all existing tables
GRANT SELECT ON ALL TABLES IN SCHEMA megalithic TO anon, authenticated;

-- Grant SELECT on future tables (for migrations)
ALTER DEFAULT PRIVILEGES IN SCHEMA megalithic 
GRANT SELECT ON TABLES TO anon, authenticated;

-- For authenticated users who need to insert/update (contributors)
GRANT INSERT, UPDATE ON megalithic.sites TO authenticated;
GRANT INSERT, UPDATE ON megalithic.site_tags TO authenticated;
GRANT INSERT, UPDATE ON megalithic.zones TO authenticated;

-- Grant sequence usage for auto-increment columns if any
GRANT USAGE ON ALL SEQUENCES IN SCHEMA megalithic TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA megalithic 
GRANT USAGE ON SEQUENCES TO authenticated;

