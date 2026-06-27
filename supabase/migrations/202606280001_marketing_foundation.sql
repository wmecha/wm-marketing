-- WM Marketing — MK-002 Foundation Schema
-- Creates marketing_* tables in the shared Supabase project.
-- Does NOT rename, delete or modify any intel_marketing_* legacy tables.
-- All tables include organisation_id + venture_id for Cognexa actor scoping.
-- Backfill from intel_marketing_* happens in 202606280002_marketing_backfill.sql.
-- Idempotent: safe to re-run.

-- ─── Enums ───────────────────────────────────────────────────────────────────

create type if not exists public.marketing_campaign_status as enum (
  'draft', 'planned', 'active', 'paused', 'completed', 'archived'
);

create type if not exists public.marketing_content_status as enum (
  'idea', 'brief', 'draft', 'review', 'approved', 'scheduled', 'published', 'reported', 'archived'
);

create type if not exists public.marketing_channel as enum (
  'linkedin', 'instagram', 'x', 'tiktok', 'youtube', 'threads',
  'whatsapp_status', 'whatsapp_channel', 'email', 'blog', 'podcast', 'other'
);

-- ─── Brands ──────────────────────────────────────────────────────────────────

create table if not exists public.marketing_brands (
  id               uuid primary key default gen_random_uuid(),
  organisation_id  text not null,
  venture_code     text,
  code             text not null unique,
  name             text not null,
  status           text not null default 'active',
  legacy_brand_code text,           -- links back to intel_marketing_brands.code
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists marketing_brands_org_idx on public.marketing_brands(organisation_id);
create index if not exists marketing_brands_venture_idx on public.marketing_brands(venture_code);

-- ─── Content Pillars ─────────────────────────────────────────────────────────

create table if not exists public.marketing_content_pillars (
  id               uuid primary key default gen_random_uuid(),
  organisation_id  text not null,
  venture_code     text,
  brand_id         uuid references public.marketing_brands(id) on delete set null,
  name             text not null,
  description      text,
  colour           text,
  status           text not null default 'active',
  legacy_pillar_id uuid,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists marketing_pillars_org_idx on public.marketing_content_pillars(organisation_id);
create index if not exists marketing_pillars_brand_idx on public.marketing_content_pillars(brand_id);

-- ─── Platforms ───────────────────────────────────────────────────────────────

create table if not exists public.marketing_platforms (
  id               uuid primary key default gen_random_uuid(),
  organisation_id  text not null,
  brand_id         uuid references public.marketing_brands(id) on delete cascade,
  channel          public.marketing_channel not null,
  handle           text,
  display_name     text,
  status           text not null default 'active',
  legacy_platform_id uuid,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (brand_id, channel, handle)
);

create index if not exists marketing_platforms_brand_idx on public.marketing_platforms(brand_id);

-- ─── Campaigns ───────────────────────────────────────────────────────────────

create table if not exists public.marketing_campaigns (
  id                  uuid primary key default gen_random_uuid(),
  organisation_id     text not null,
  venture_code        text,
  brand_id            uuid references public.marketing_brands(id) on delete set null,
  created_by_user_id  uuid,
  title               text not null,
  description         text,
  objective           text,
  status              public.marketing_campaign_status not null default 'draft',
  starts_on           date,
  ends_on             date,
  budget_kes          numeric(18,2),
  target_audience     text,
  channels            public.marketing_channel[],
  task_ops_project_id text,         -- external reference to Task Ops project
  finance_campaign_id text,         -- external reference to finance_campaign_profiles
  legacy_campaign_id  uuid,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists marketing_campaigns_org_idx on public.marketing_campaigns(organisation_id);
create index if not exists marketing_campaigns_venture_idx on public.marketing_campaigns(venture_code);
create index if not exists marketing_campaigns_status_idx on public.marketing_campaigns(status);
create index if not exists marketing_campaigns_dates_idx on public.marketing_campaigns(starts_on, ends_on);

-- ─── Content Items ────────────────────────────────────────────────────────────

create table if not exists public.marketing_content_items (
  id                  uuid primary key default gen_random_uuid(),
  organisation_id     text not null,
  venture_code        text,
  campaign_id         uuid references public.marketing_campaigns(id) on delete set null,
  brand_id            uuid references public.marketing_brands(id) on delete set null,
  created_by_user_id  uuid,

  -- Content identity
  title               text not null,
  hook                text,
  body                text,
  hashtags            text[],
  status              public.marketing_content_status not null default 'idea',

  -- Classification
  channels            public.marketing_channel[],
  production_format   text,         -- 'short_video', 'carousel', 'static_image', 'long_form', etc.
  production_spec     jsonb,        -- format-specific spec fields

  -- Scheduling
  scheduled_for       timestamptz,
  published_at        timestamptz,

  -- Pillar links (M:M via junction)
  -- Media stored in marketing_content_media

  -- Task Ops integration
  task_ops_task_id    text,         -- cached external reference
  task_ops_status     text,         -- cached display status only; Task Ops is authoritative
  task_ops_project_id text,

  -- Source tracking
  legacy_content_id   uuid,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists marketing_content_org_idx on public.marketing_content_items(organisation_id);
create index if not exists marketing_content_campaign_idx on public.marketing_content_items(campaign_id);
create index if not exists marketing_content_status_idx on public.marketing_content_items(status);
create index if not exists marketing_content_scheduled_idx on public.marketing_content_items(scheduled_for);

-- ─── Content ↔ Pillar junction ────────────────────────────────────────────────

create table if not exists public.marketing_content_pillar_links (
  content_id  uuid not null references public.marketing_content_items(id) on delete cascade,
  pillar_id   uuid not null references public.marketing_content_pillars(id) on delete cascade,
  primary key (content_id, pillar_id)
);

-- ─── Content Media ────────────────────────────────────────────────────────────

create table if not exists public.marketing_content_media (
  id                uuid primary key default gen_random_uuid(),
  content_id        uuid not null references public.marketing_content_items(id) on delete cascade,
  media_type        text not null check (media_type in ('image', 'video', 'audio', 'document', 'other')),
  url               text not null,
  storage_path      text,
  alt_text          text,
  mime_type         text,
  file_size_bytes   bigint,
  sort_order        integer not null default 0,
  created_at        timestamptz not null default now()
);

create index if not exists marketing_content_media_content_idx on public.marketing_content_media(content_id);

-- ─── Calendar Entries ─────────────────────────────────────────────────────────

create table if not exists public.marketing_calendar_entries (
  id                uuid primary key default gen_random_uuid(),
  organisation_id   text not null,
  venture_code      text,
  content_id        uuid references public.marketing_content_items(id) on delete cascade,
  campaign_id       uuid references public.marketing_campaigns(id) on delete set null,
  platform_id       uuid references public.marketing_platforms(id) on delete set null,
  channel           public.marketing_channel,
  scheduled_for     timestamptz not null,
  published_at      timestamptz,
  status            text not null default 'scheduled'
    check (status in ('scheduled', 'published', 'failed', 'skipped', 'draft')),
  notes             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists marketing_calendar_org_idx on public.marketing_calendar_entries(organisation_id);
create index if not exists marketing_calendar_scheduled_idx on public.marketing_calendar_entries(scheduled_for);
create index if not exists marketing_calendar_content_idx on public.marketing_calendar_entries(content_id);

-- ─── Creative Briefs ──────────────────────────────────────────────────────────

create table if not exists public.marketing_creative_briefs (
  id                uuid primary key default gen_random_uuid(),
  organisation_id   text not null,
  content_id        uuid references public.marketing_content_items(id) on delete cascade,
  campaign_id       uuid references public.marketing_campaigns(id) on delete set null,
  title             text not null,
  brief_type        text not null default 'content_production',
  body              jsonb not null default '{}'::jsonb,
  task_ops_brief_id text,
  status            text not null default 'draft',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists marketing_briefs_content_idx on public.marketing_creative_briefs(content_id);

-- ─── Task Ops Integration Log ─────────────────────────────────────────────────
-- Marketing stores only the external reference and display cache.
-- Task Ops is authoritative for task status and artifacts.

create table if not exists public.marketing_task_ops_events (
  id                uuid primary key default gen_random_uuid(),
  organisation_id   text not null,
  source_entity_type text not null check (source_entity_type in (
    'campaign', 'content_item', 'creative_brief', 'calendar_entry'
  )),
  source_entity_id  uuid not null,
  event_type        text not null,  -- 'task.created', 'task.completed', 'artifact.ready', etc.
  task_ops_task_id  text,
  task_ops_status   text,
  correlation_id    text,
  payload           jsonb not null default '{}'::jsonb,
  created_at        timestamptz not null default now()
);

create index if not exists marketing_task_ops_events_source_idx
  on public.marketing_task_ops_events(source_entity_type, source_entity_id);
create index if not exists marketing_task_ops_events_task_idx
  on public.marketing_task_ops_events(task_ops_task_id);

-- ─── RLS (service role access; user policies added in subsequent migration) ───

alter table public.marketing_brands              enable row level security;
alter table public.marketing_content_pillars     enable row level security;
alter table public.marketing_platforms           enable row level security;
alter table public.marketing_campaigns           enable row level security;
alter table public.marketing_content_items       enable row level security;
alter table public.marketing_content_pillar_links enable row level security;
alter table public.marketing_content_media       enable row level security;
alter table public.marketing_calendar_entries    enable row level security;
alter table public.marketing_creative_briefs     enable row level security;
alter table public.marketing_task_ops_events     enable row level security;

grant all on public.marketing_brands              to service_role;
grant all on public.marketing_content_pillars     to service_role;
grant all on public.marketing_platforms           to service_role;
grant all on public.marketing_campaigns           to service_role;
grant all on public.marketing_content_items       to service_role;
grant all on public.marketing_content_pillar_links to service_role;
grant all on public.marketing_content_media       to service_role;
grant all on public.marketing_calendar_entries    to service_role;
grant all on public.marketing_creative_briefs     to service_role;
grant all on public.marketing_task_ops_events     to service_role;
