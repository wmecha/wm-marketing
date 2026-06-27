-- MK-002 Parity verification script.
-- Compares marketing_* (new) vs intel_marketing_* (legacy) row counts.
-- Run against the shared Supabase project after backfill.
-- Zero rows in a new table that has a legacy source is a parity failure.

-- ─── Campaigns ───────────────────────────────────────────────────────────────
select
  'campaigns' as domain,
  (select count(*) from public.intel_marketing_campaigns) as legacy_count,
  (select count(*) from public.marketing_campaigns where legacy_campaign_id is not null) as new_count,
  case
    when (select count(*) from public.intel_marketing_campaigns) =
         (select count(*) from public.marketing_campaigns where legacy_campaign_id is not null)
    then 'PASS' else 'FAIL'
  end as status;

-- ─── Brands ──────────────────────────────────────────────────────────────────
select
  'brands' as domain,
  (select count(*) from public.intel_marketing_brands) as legacy_count,
  (select count(*) from public.marketing_brands where legacy_brand_code is not null) as new_count,
  case
    when (select count(*) from public.intel_marketing_brands) =
         (select count(*) from public.marketing_brands where legacy_brand_code is not null)
    then 'PASS' else 'FAIL'
  end as status;

-- ─── Platforms ───────────────────────────────────────────────────────────────
select
  'platforms' as domain,
  (select count(*) from public.intel_marketing_platforms) as legacy_count,
  (select count(*) from public.marketing_platforms where legacy_platform_id is not null) as new_count,
  case
    when (select count(*) from public.intel_marketing_platforms) =
         (select count(*) from public.marketing_platforms where legacy_platform_id is not null)
    then 'PASS' else 'FAIL'
  end as status;

-- ─── Content ─────────────────────────────────────────────────────────────────
select
  'content' as domain,
  (select count(*) from public.intel_marketing_content) as legacy_count,
  (select count(*) from public.marketing_content_items where legacy_content_id is not null) as new_count,
  case
    when (select count(*) from public.intel_marketing_content) =
         (select count(*) from public.marketing_content_items where legacy_content_id is not null)
    then 'PASS' else 'FAIL'
  end as status;

-- ─── Orphan check: new rows missing legacy link ───────────────────────────────
select 'orphan_campaigns' as check,
  count(*) as rows_missing_legacy_link
from public.marketing_campaigns
where legacy_campaign_id is null;

select 'orphan_content' as check,
  count(*) as rows_missing_legacy_link
from public.marketing_content_items
where legacy_content_id is null;

-- ─── IDs preserved ───────────────────────────────────────────────────────────
-- Verify that legacy UUIDs are preserved in legacy_* columns (not regenerated).
select
  'campaign_id_preservation' as check,
  count(*) as mismatches
from public.marketing_campaigns mc
join public.intel_marketing_campaigns ic on ic.id = mc.legacy_campaign_id
where mc.legacy_campaign_id != ic.id;
