# Database Scripts

## Backup & Restore

Before making any breaking schema changes, backup your data:

```bash
# Set environment variables
export NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Create backup
npx tsx scripts/backup-data.ts

# Backups are saved to ./backups/YYYY-MM-DDTHH-MM-SS/
```

After schema migration, restore the data:

```bash
npx tsx scripts/restore-data.ts ./backups/2024-12-08T10-30-00
```

## Migration Workflow

1. **Backup current data**
   ```bash
   npx tsx scripts/backup-data.ts
   ```

2. **Apply new migration**
   ```bash
   npx supabase db push
   # or
   npx supabase migration up
   ```

3. **If migration fails, restore**
   ```bash
   npx tsx scripts/restore-data.ts ./backups/LATEST
   ```

4. **If data needs transformation**
   - Edit `scripts/restore-data.ts`
   - Add transformation logic to `transformData()` function
   - Run restore script

## Data Transformations

When schema changes, the restore script can transform data. Edit the `transformData()` function:

```typescript
case 'sites':
  return {
    ...row,
    // Add new columns with defaults
    new_column: row.new_column ?? 'default_value',
    // Rename columns
    new_name: row.old_name,
    // Transform data
    status: row.old_status === 'pending' ? 'under_review' : row.old_status,
  };
```

## Tables Backed Up

- `profiles` - User accounts
- `badges` - Achievement definitions
- `user_badges` - Awarded badges
- `zones` - Geographic regions
- `sites` - Megalithic sites
- `site_tags` - Site categorization
- `site_zones` - Site-zone relationships
- `media_assets` - Images, videos, documents
- `posts` - User posts/discussions
- `comments` - Threaded comments
- `reactions` - Likes, bookmarks
- `follows` - User follows
- `notifications` - User notifications
- `bookmarks` - Saved items
- `site_follows` - Site subscriptions
- `site_votes` - Community verification votes
- `activity_feed` - Pre-computed feed (auto-regenerated)



