-- MK-002 Backfill: copies intel_marketing_* data into marketing_* tables.
-- Non-destructive: legacy tables are NOT modified, renamed or dropped.
-- Run AFTER 202606280001_marketing_foundation.sql.
-- Idempotent: on-conflict upserts prevent duplicates.
-- Rollback: truncate marketing_* tables; all data remains in intel_marketing_*.
--
-- Column mapping (actual legacy schema discovered 2026-06-28):
--   intel_marketing_brands.slug  → marketing_brands.code / legacy_brand_code
--   intel_marketing_brands.is_active → status
--   intel_marketing_campaigns.name → title, .budget_kes → budget_kes, no .description
--   intel_marketing_content.body_markdown → body, .hashtags (text) → hashtags (text[])
--   intel_marketing_content.scheduled_at → scheduled_for
--   intel_marketing_platforms: no display_name, no status column (use is_active)

-- ─── Brands ──────────────────────────────────────────────────────────────────
insert into public.marketing_brands (
  id, organisation_id, venture_code, code, name, status, legacy_brand_code, created_at
)
select
  gen_random_uuid(),
  'COGNEXA',
  null,
  b.slug,                                              -- slug used as stable code
  b.name,
  case when b.is_active then 'active' else 'inactive' end,
  b.slug,
  coalesce(b.created_at, now())
from public.intel_marketing_brands b
where b.slug is not null
on conflict (code) do update set
  name              = excluded.name,
  status            = excluded.status,
  legacy_brand_code = excluded.legacy_brand_code;

-- ─── Platforms ───────────────────────────────────────────────────────────────
-- Only migrate platforms whose platform value maps to our enum
insert into public.marketing_platforms (
  id, organisation_id, brand_id, channel, handle, display_name, status,
  legacy_platform_id, created_at
)
select
  p.id,
  'COGNEXA',
  mb.id,
  p.platform::public.marketing_channel,
  coalesce(p.handle, ''),
  p.handle,                                            -- use handle as display_name
  case when p.is_active then 'active' else 'inactive' end,
  p.id,
  coalesce(p.created_at, now())
from public.intel_marketing_platforms p
join public.intel_marketing_brands ib on ib.id = p.brand_id
join public.marketing_brands mb on mb.legacy_brand_code = ib.slug
where p.platform in (
  'linkedin','instagram','x','tiktok','youtube','threads',
  'whatsapp_status','whatsapp_channel','email','blog','podcast','other'
)
on conflict (brand_id, channel, handle) do update set
  display_name       = excluded.display_name,
  status             = excluded.status,
  legacy_platform_id = excluded.legacy_platform_id;

-- ─── Campaigns ───────────────────────────────────────────────────────────────
insert into public.marketing_campaigns (
  id, organisation_id, venture_code, brand_id, title, description, objective,
  status, starts_on, ends_on, budget_kes, legacy_campaign_id, created_at, updated_at
)
select
  c.id,
  'COGNEXA',
  null,
  mb.id,
  c.name,
  c.audience_summary,                                  -- best available description field
  c.goal,
  case c.status
    when 'draft'     then 'draft'::public.marketing_campaign_status
    when 'planned'   then 'planned'::public.marketing_campaign_status
    when 'active'    then 'active'::public.marketing_campaign_status
    when 'paused'    then 'paused'::public.marketing_campaign_status
    when 'completed' then 'completed'::public.marketing_campaign_status
    when 'archived'  then 'archived'::public.marketing_campaign_status
    else 'draft'::public.marketing_campaign_status
  end,
  c.start_date,
  c.end_date,
  c.budget_kes,
  c.id,
  coalesce(c.created_at, now()),
  coalesce(c.updated_at, now())
from public.intel_marketing_campaigns c
left join public.intel_marketing_brands ib on ib.id = c.brand_id
left join public.marketing_brands mb on mb.legacy_brand_code = ib.slug
on conflict (id) do update set
  title              = excluded.title,
  description        = excluded.description,
  status             = excluded.status,
  starts_on          = excluded.starts_on,
  ends_on            = excluded.ends_on,
  legacy_campaign_id = excluded.legacy_campaign_id;

-- ─── Content items ────────────────────────────────────────────────────────────
-- hashtags in legacy is plain text; split on space into array
-- body_markdown → body
-- scheduled_at  → scheduled_for
-- channels not available per-content; skipped (null)
insert into public.marketing_content_items (
  id, organisation_id, venture_code, campaign_id, brand_id,
  title, hook, body, hashtags, status,
  production_format, production_spec,
  scheduled_for, published_at,
  task_ops_task_id, task_ops_project_id,
  legacy_content_id, created_at, updated_at
)
select
  ci.id,
  'COGNEXA',
  null,
  mc.id,
  mb.id,
  coalesce(ci.title, '(untitled)'),
  ci.hook,
  ci.body_markdown,
  case
    when ci.hashtags is null or trim(ci.hashtags) = '' then null
    else string_to_array(trim(ci.hashtags), ' ')
  end,
  case ci.status
    when 'idea'      then 'idea'::public.marketing_content_status
    when 'brief'     then 'brief'::public.marketing_content_status
    when 'draft'     then 'draft'::public.marketing_content_status
    when 'review'    then 'review'::public.marketing_content_status
    when 'approved'  then 'approved'::public.marketing_content_status
    when 'scheduled' then 'scheduled'::public.marketing_content_status
    when 'published' then 'published'::public.marketing_content_status
    when 'reported'  then 'reported'::public.marketing_content_status
    when 'archived'  then 'archived'::public.marketing_content_status
    else 'idea'::public.marketing_content_status
  end,
  ci.production_format,
  ci.production_spec,
  ci.scheduled_at,
  ci.published_at,
  ci.task_ops_task_id,
  ci.task_ops_project_id,
  ci.id,
  coalesce(ci.created_at, now()),
  coalesce(ci.updated_at, now())
from public.intel_marketing_content ci
left join public.intel_marketing_campaigns ic on ic.id = ci.campaign_id
left join public.marketing_campaigns mc on mc.legacy_campaign_id = ic.id
left join public.intel_marketing_brands ib on ib.id = ci.brand_id
left join public.marketing_brands mb on mb.legacy_brand_code = ib.slug
on conflict (id) do update set
  title              = excluded.title,
  status             = excluded.status,
  scheduled_for      = excluded.scheduled_for,
  published_at       = excluded.published_at,
  production_format  = excluded.production_format,
  production_spec    = excluded.production_spec,
  legacy_content_id  = excluded.legacy_content_id;

-- ─── Content → Pillar links ───────────────────────────────────────────────────
-- Best-effort: only links where both content and pillar have been backfilled
insert into public.marketing_content_pillar_links (content_id, pillar_id)
select
  mci.id,
  mcp.id
from public.intel_marketing_content_pillars icp
join public.marketing_content_items mci on mci.legacy_content_id = icp.content_id
join public.marketing_content_pillars mcp on mcp.legacy_pillar_id = icp.pillar_id
on conflict do nothing;

-- ─── Verification counts ──────────────────────────────────────────────────────
-- Run scripts/verify-parity.sql after this migration to confirm counts match.
