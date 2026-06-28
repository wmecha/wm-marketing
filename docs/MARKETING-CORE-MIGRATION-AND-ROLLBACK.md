# Marketing Core — Migration and Rollback

## New schema

Ten `marketing_*` tables were added to the shared Supabase project (`bzpeyrhkfjbdjojkaetr`) via:

- `supabase/migrations/202606280001_marketing_foundation.sql`
- `supabase/migrations/202606280002_marketing_backfill.sql`

Applied via Management API. Not tracked in the Supabase migration history table.

## Legacy preservation

All `intel_marketing_*` tables are **untouched**. They remain the source of truth for:
- Legacy wallacemecha marketing routes
- CRM contacts and deals
- Episodes
- Social credentials
- Publishing integrations
- WhatsApp flows
- Metric reports

The new `wm-marketing` application reads only from `marketing_*` tables. No writes go to `intel_marketing_*`.

## Backfill parity (verified 2026-06-28)

| Entity | Legacy | New | Status |
|--------|--------|-----|--------|
| Brands | 2 | 2 | ✅ |
| Platforms | 10 | 10 | ✅ |
| Campaigns | 1 | 1 | ✅ |
| Content items | 50 | 50 | ✅ |
| Orphans | — | 0 | ✅ |
| Campaign ID mismatches | — | 0 | ✅ |

Parity is verified by `scripts/verify-parity.sql`. Run this after any bulk operation.

## New records after cutover

New content items created in `wm-marketing` after cutover write to `marketing_content_items` only. They do **not** appear in `intel_marketing_content`. This is intentional.

The `legacy_content_id` column on `marketing_content_items` is `NULL` for new records; it is only populated for backfilled items.

If the legacy wallacemecha content list needs to show new records temporarily, a union view can be created — but this is not planned.

## Rollback

If `wm-marketing` needs to be rolled back:

1. The Vercel deployment can be reverted to the previous build.
2. The `marketing_*` tables remain in Supabase — they do not need to be dropped to restore legacy operation.
3. The `intel_marketing_*` tables are unaffected and continue working for wallacemecha.
4. Any new records written to `marketing_*` after cutover would be lost on rollback of the application, but the tables themselves persist.

To fully roll back the schema (only if required and approved):
```sql
-- Drop in reverse dependency order
drop table if exists public.marketing_task_ops_events;
drop table if exists public.marketing_creative_briefs;
drop table if exists public.marketing_calendar_entries;
drop table if exists public.marketing_content_media;
drop table if exists public.marketing_content_pillar_links;
drop table if exists public.marketing_content_items;
drop table if exists public.marketing_campaigns;
drop table if exists public.marketing_platforms;
drop table if exists public.marketing_content_pillars;
drop table if exists public.marketing_brands;
drop type if exists public.marketing_campaign_status;
drop type if exists public.marketing_content_status;
drop type if exists public.marketing_channel;
```

**Do not run this unless explicitly approved. All new post-cutover content would be permanently lost.**

## Why redirects are not yet enabled

The `wallacemecha` legacy routes at `/marketing/content`, `/marketing/campaigns` etc. remain active and are not redirected to `wm-marketing`. Reasons:

1. DNS and auth are separate (wallacemecha uses NextAuth; wm-marketing uses Supabase magic-link).
2. Legacy routes serve in-progress WIP content (dirty working tree with form enhancements in wallacemecha).
3. The new domain (`marketing.wallacemecha.com`) is not yet published as the primary marketing URL.
4. Redirects should be enabled deliberately after users are migrated and the new domain is verified.
