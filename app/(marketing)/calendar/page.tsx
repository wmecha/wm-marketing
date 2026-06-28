import Link from 'next/link'
import type { Metadata } from 'next'
import { StatusBadge } from '@/components/marketing/StatusBadge'
import { EmptyState } from '@/components/marketing/EmptyState'
import { requireUser } from '@/lib/auth'
import { listCalendarEntries, listBrands } from '@/lib/marketing/calendar'
import { listCampaigns } from '@/lib/marketing/campaigns'
import { CalendarNav } from './CalendarNav'

export const metadata: Metadata = { title: 'Calendar' }
export const dynamic = 'force-dynamic'

type Props = { searchParams?: Promise<Record<string, string>> }

function weekBounds(date: Date): { from: string; to: string } {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(d.setDate(diff))
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  return {
    from: monday.toISOString().slice(0, 10),
    to: sunday.toISOString().slice(0, 10) + 'T23:59:59',
  }
}

function monthBounds(year: number, month: number): { from: string; to: string } {
  const last = new Date(year, month, 0).getDate()
  return {
    from: `${year}-${String(month).padStart(2, '0')}-01`,
    to: `${year}-${String(month).padStart(2, '0')}-${last}T23:59:59`,
  }
}

function groupByDate<T extends { scheduled_for: string }>(entries: T[]) {
  const groups: Record<string, T[]> = {}
  for (const entry of entries) {
    const key = entry.scheduled_for.slice(0, 10)
    if (!groups[key]) groups[key] = []
    groups[key].push(entry)
  }
  return groups
}

export default async function CalendarPage({ searchParams }: Props) {
  await requireUser()
  const sp = await searchParams
  const view = (sp?.view ?? 'agenda') as 'month' | 'week' | 'agenda'
  const today = new Date()
  const targetYear = sp?.year ? Number(sp.year) : today.getFullYear()
  const targetMonth = sp?.month ? Number(sp.month) : today.getMonth() + 1

  let from: string
  let to: string

  if (view === 'week') {
    const bounds = weekBounds(new Date(targetYear, targetMonth - 1, sp?.day ? Number(sp.day) : today.getDate()))
    from = bounds.from
    to = bounds.to
  } else if (view === 'month') {
    const bounds = monthBounds(targetYear, targetMonth)
    from = bounds.from
    to = bounds.to
  } else {
    // Agenda: next 30 days
    from = today.toISOString().slice(0, 10)
    const next30 = new Date(today)
    next30.setDate(next30.getDate() + 30)
    to = next30.toISOString().slice(0, 10) + 'T23:59:59'
  }

  const [{ data: entries, error }, brands, { data: campaigns }] = await Promise.all([
    listCalendarEntries({
      from,
      to,
      ventureCode: sp?.venture || undefined,
      campaignId: sp?.campaign_id || undefined,
      channel: sp?.channel || undefined,
      status: sp?.status || undefined,
    }),
    listBrands(),
    listCampaigns(),
  ])

  const grouped = groupByDate(entries)
  const sortedDates = Object.keys(grouped).sort()

  return (
    <div>
      <div className="mk-page-header">
        <div>
          <h1 className="mk-page-title">Calendar</h1>
          <p className="mk-page-sub">
            {view === 'agenda' ? 'Next 30 days' : view === 'week' ? 'Week view' : `${targetYear}/${String(targetMonth).padStart(2, '0')}`}
          </p>
        </div>
        <Link href="/content/new" className="mk-btn-primary">
          New content
        </Link>
      </div>

      <CalendarNav
        view={view}
        year={targetYear}
        month={targetMonth}
        ventures={['WMCO', 'WMDES', 'LEO', 'SHAWN', 'WMSOC', 'AIVID', 'GROC']}
        brands={brands}
        campaigns={campaigns.map((c) => ({ id: c.id, title: c.title }))}
        currentVenture={sp?.venture ?? ''}
        currentCampaign={sp?.campaign_id ?? ''}
        currentChannel={sp?.channel ?? ''}
        currentStatus={sp?.status ?? ''}
      />

      {error && <div className="mk-alert-error">Could not load calendar: {error.message}</div>}

      {!error && entries.length === 0 && (
        <EmptyState
          title="Nothing scheduled"
          description="No content is scheduled for this period."
          action={{ label: 'Create content', href: '/content/new' }}
        />
      )}

      {entries.length > 0 && view !== 'month' && (
        <div className="mk-agenda">
          {sortedDates.map((date) => (
            <div key={date} className="mk-agenda-day">
              <div className="mk-agenda-date">
                <span className="mk-agenda-day-name">
                  {new Date(date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short' })}
                </span>
                <span className="mk-agenda-day-num">
                  {new Date(date + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
              </div>
              <div className="mk-agenda-entries">
                {grouped[date].map((entry) => {
                  const contentItem = (
                    entry as unknown as { marketing_content_items?: { id: string; title: string; status: string } | null }
                  ).marketing_content_items
                  const platform = (
                    entry as unknown as { marketing_platforms?: { channel: string; handle: string | null } | null }
                  ).marketing_platforms

                  return (
                    <div key={entry.scheduled_for} className="mk-agenda-entry">
                      {contentItem ? (
                        <Link href={`/content/${contentItem.id}`} className="mk-agenda-title">
                          {contentItem.title}
                        </Link>
                      ) : (
                        <span className="mk-agenda-title">Untitled</span>
                      )}
                      <div className="mk-agenda-meta">
                        {platform && (
                          <span className="mk-tag">
                            {platform.channel}{platform.handle ? ` · ${platform.handle}` : ''}
                          </span>
                        )}
                        <span className="mk-tag">
                          {new Date(entry.scheduled_for).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <StatusBadge status={entry.status} kind="calendar" />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {entries.length > 0 && view === 'month' && (
        <div className="mk-month-grid">
          {Array.from({ length: new Date(targetYear, targetMonth, 0).getDate() }, (_, i) => {
            const day = String(i + 1).padStart(2, '0')
            const key = `${targetYear}-${String(targetMonth).padStart(2, '0')}-${day}`
            const dayEntries = grouped[key] ?? []
            return (
              <div key={key} className="mk-month-cell">
                <span className="mk-month-day">{i + 1}</span>
                {dayEntries.slice(0, 3).map((entry, ei) => {
                  const ci = (entry as unknown as { marketing_content_items?: { id: string; title: string } | null }).marketing_content_items
                  return (
                    <div key={ei} className="mk-month-dot">
                      {ci ? (
                        <Link href={`/content/${ci.id}`} className="mk-month-event">
                          {ci.title}
                        </Link>
                      ) : (
                        <span className="mk-month-event">Entry</span>
                      )}
                    </div>
                  )
                })}
                {dayEntries.length > 3 && (
                  <span className="mk-month-more">+{dayEntries.length - 3} more</span>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
