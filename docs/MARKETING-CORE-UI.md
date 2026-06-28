# Marketing Core UI

## Routes implemented

| Route | Description |
|-------|-------------|
| `/campaigns` | Campaign list with status filter |
| `/campaigns/new` | Create a campaign (server action) |
| `/campaigns/[id]` | Campaign detail with content summary |
| `/content` | Content list with status filter chips |
| `/content/new` | Create a content item (server action) |
| `/content/[id]` | Content detail with pillars, media, sidebar |
| `/calendar` | Agenda / week / month calendar |

All routes are behind `requireUser()` in the `(marketing)` layout.

## Data sources

All reads and writes use the `marketing_*` tables in the shared Supabase project (`bzpeyrhkfjbdjojkaetr`).

The legacy `intel_marketing_*` tables are not touched by any new route.

## Repository modules

| Module | Purpose |
|--------|---------|
| `lib/marketing/campaigns.ts` | CRUD for `marketing_campaigns` |
| `lib/marketing/content-items.ts` | CRUD for `marketing_content_items` |
| `lib/marketing/calendar.ts` | Calendar entries, brands, platforms, pillars |

All modules use the authenticated server Supabase client (`lib/supabase/server.ts`). RLS enforces access at the database level.

## Shared components

| Component | Location |
|-----------|----------|
| `StatusBadge` | `components/marketing/StatusBadge.tsx` |
| `EmptyState` | `components/marketing/EmptyState.tsx` |
| `CalendarNav` | `app/(marketing)/calendar/CalendarNav.tsx` |

## Auth

`lib/auth.ts` → `requireUser()` → `createClient()` → `supabase.auth.getUser()`. Redirects to `/auth/login` if no session.

No Marketing-specific user table. Identity comes from Supabase Auth session.

## What is deliberately NOT done

- Run AI button (blocked on S0-B live verification)
- Task Ops reference live link (blocked on INT-M1)
- Finance budget real link (blocked on finance campaign profile mapping)
- CRM, episodes, social credentials, publishing integrations (out of scope for this milestone)

## Mobile

- Single-column forms with sticky footer buttons
- Agenda is the default calendar view (not month grid)
- Detail grids stack to single column below 768px
- Filter bar wraps at narrow widths
