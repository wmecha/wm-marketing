-- WM Marketing — MK-003 Task Ops Link Table
-- Stores the external Task Ops task references created from marketing entities.
-- This is the Marketing side of the marketing_integration_requests table in wm-task-ops.
-- Marketing stores only the external reference and a cached display status.
-- The canonical status lives in Task Ops; Marketing polls to refresh the cached value.
-- Idempotent: safe to re-run.

create table if not exists public.marketing_task_links (
  id                  uuid        primary key default gen_random_uuid(),
  organisation_id     text        not null,
  venture_code        text,
  -- The marketing entity this task was sent for
  entity_type         text        not null
                        check (entity_type in ('campaign', 'content_item', 'creative_brief', 'calendar_entry')),
  entity_id           uuid        not null,
  -- The Task Ops task identifier (e.g. TASK-0042)
  task_ops_task_id    text        not null,
  -- The idempotency key used when creating the task (mirrors what was sent to Task Ops)
  idempotency_key     text        not null,
  -- Cached display status — refreshed by polling GET /api/integrations/marketing/tasks/[taskId]
  cached_status       text        not null default 'Not Started',
  status_refreshed_at timestamptz,
  -- Who triggered the send
  created_by          uuid        references auth.users(id) on delete set null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  -- One task per (entity_type, entity_id, idempotency_key) — prevents duplicate sends
  constraint marketing_task_links_idempotency
    unique (entity_type, entity_id, idempotency_key)
);

create index if not exists marketing_task_links_entity_idx
  on public.marketing_task_links (entity_type, entity_id);

create index if not exists marketing_task_links_venture_idx
  on public.marketing_task_links (venture_code);

-- RLS: authenticated users can read task links; service role manages writes
alter table public.marketing_task_links enable row level security;

create policy "Authenticated users can read task links"
  on public.marketing_task_links
  for select
  to authenticated
  using (true);

create policy "Service role has full access to task links"
  on public.marketing_task_links
  for all
  to service_role
  using (true)
  with check (true);

comment on table public.marketing_task_links is
  'Records the Task Ops task references created from marketing campaigns and content items. '
  'task_ops_task_id stores the TASK-XXXX identifier. '
  'cached_status is a display-only snapshot; Task Ops is the canonical status source.';
