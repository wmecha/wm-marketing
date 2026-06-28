import clsx from 'clsx'

const CAMPAIGN_COLOURS: Record<string, string> = {
  draft: 'badge-neutral',
  planned: 'badge-blue',
  active: 'badge-green',
  paused: 'badge-amber',
  completed: 'badge-muted',
  archived: 'badge-muted',
}

const CONTENT_COLOURS: Record<string, string> = {
  idea: 'badge-neutral',
  brief: 'badge-blue',
  draft: 'badge-blue',
  review: 'badge-amber',
  approved: 'badge-green',
  scheduled: 'badge-green',
  published: 'badge-gold',
  reported: 'badge-muted',
  archived: 'badge-muted',
}

const CALENDAR_COLOURS: Record<string, string> = {
  scheduled: 'badge-blue',
  published: 'badge-gold',
  failed: 'badge-red',
  skipped: 'badge-muted',
  draft: 'badge-neutral',
}

type StatusBadgeProps = {
  status: string
  kind?: 'campaign' | 'content' | 'calendar'
}

const LABEL_OVERRIDES: Record<string, string> = {
  publish_failed: 'Publish failed',
}

export function StatusBadge({ status, kind = 'content' }: StatusBadgeProps) {
  const map = kind === 'campaign' ? CAMPAIGN_COLOURS : kind === 'calendar' ? CALENDAR_COLOURS : CONTENT_COLOURS
  const cls = map[status] ?? 'badge-neutral'
  const label = LABEL_OVERRIDES[status] ?? status.replace(/_/g, ' ')
  return <span className={clsx('status-badge', cls)}>{label}</span>
}
