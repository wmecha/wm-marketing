# wm-marketing

WM & Co Marketing Hub — standalone Next.js 15 app deploying to `marketing.wallacemecha.com`.

Extracted from `wallacemecha` per the MK-001 through MK-007 plan in
`wm-task-ops/docs/M003A-marketing-extraction-plan.md`.

## Tech stack
- Next.js 15 (App Router)
- Supabase (shared project with wm-task-ops: `bzpeyrhkfjbdjojkaetr`)
- Tailwind CSS v4
- Vercel deployment

## Current status: MK-001 scaffold
Pages are stubs. Full migration in MK-002 (content/calendar), MK-003 (Task Ops), MK-004 (Run AI).

## Commands
```
npm install
npm run dev       # http://localhost:3001
npm run build
npm run type-check
```

## Auth
Magic-link via Supabase Auth. All routes behind middleware session check.
Configure `Site URL` and `Redirect URLs` in Supabase Auth settings to include
`https://marketing.wallacemecha.com` and `http://localhost:3001`.

## Deployment
Vercel project: `wm-marketing`
Domain: `marketing.wallacemecha.com`
Branch: `main` → auto-deploy
