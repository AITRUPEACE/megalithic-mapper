# Megalithic Mapper - Database Migrations

## ⚠️ IMPORTANT: Shared Database

This Supabase project contains multiple schemas for different projects.
**Only touch the `megalithic` schema!**

## Safe Workflow

### Applying Migrations

**DO NOT use `supabase db push` or `supabase db reset`** - these can affect other schemas!

Instead:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard) → Your Project → SQL Editor
2. Copy the contents of the migration file you want to apply
3. Paste and run in the SQL Editor
4. Verify the tables were created in the `megalithic` schema

### Generating Types

This is safe - it only reads from the `megalithic` schema:

```bash
npm run types:generate
```

### Creating New Migrations

When creating new migrations:

1. Always prefix table names with `megalithic.` (e.g., `megalithic.my_table`)
2. Use `CREATE TABLE IF NOT EXISTS` to make migrations idempotent
3. Never use `DROP SCHEMA` or commands that affect other schemas

### Migration Files

| File                                              | Description                        |
| ------------------------------------------------- | ---------------------------------- |
| `00000000000000_combined_schema.sql`              | Full schema setup (run this first) |
| `20241014120000_create_map_tables.sql`            | Original map tables                |
| `20241107000000_extend_map_entities.sql`          | Map entity extensions              |
| `20241201090000_create_media_assets.sql`          | Media assets table                 |
| `20251125000000_user_profiles_badges_follows.sql` | User profiles & social             |

### Checking What Exists

To see what's in the megalithic schema, run this in SQL Editor:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'megalithic'
ORDER BY table_name;
```

### Dropping Tables (If Needed)

If you need to reset just the megalithic schema:

```sql
-- ⚠️ DESTRUCTIVE - Only run if you want to start fresh
DROP SCHEMA IF EXISTS megalithic CASCADE;
CREATE SCHEMA megalithic;
```

Then re-run the `00000000000000_combined_schema.sql` migration.



