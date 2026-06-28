'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

type CalendarNavProps = {
  view: 'month' | 'week' | 'agenda'
  year: number
  month: number
  ventures: string[]
  brands: Array<{ id: string; name: string }>
  campaigns: Array<{ id: string; title: string }>
  currentVenture: string
  currentCampaign: string
  currentChannel: string
  currentStatus: string
}

const CHANNELS = [
  'linkedin', 'instagram', 'x', 'tiktok', 'youtube', 'threads',
  'whatsapp_status', 'whatsapp_channel', 'email', 'blog', 'podcast',
]

const VENTURE_LABELS: Record<string, string> = {
  WMCO: 'WM & Co', WMDES: 'WM Design', LEO: 'Leo',
  SHAWN: 'SHAWN Apparel', WMSOC: 'WM Social', AIVID: 'AI Video', GROC: 'Groceries',
}

export function CalendarNav({
  view, year, month, ventures, brands, campaigns,
  currentVenture, currentCampaign, currentChannel, currentStatus,
}: CalendarNavProps) {
  const router = useRouter()
  const sp = useSearchParams()

  const nav = useCallback((updates: Record<string, string>) => {
    const params = new URLSearchParams(sp.toString())
    for (const [k, v] of Object.entries(updates)) {
      if (v) params.set(k, v)
      else params.delete(k)
    }
    router.push(`/calendar?${params.toString()}`)
  }, [router, sp])

  const prevMonth = () => {
    if (month === 1) nav({ view: 'month', year: String(year - 1), month: '12' })
    else nav({ view: 'month', year: String(year), month: String(month - 1) })
  }

  const nextMonth = () => {
    if (month === 12) nav({ view: 'month', year: String(year + 1), month: '1' })
    else nav({ view: 'month', year: String(year), month: String(month + 1) })
  }

  return (
    <div className="mk-cal-toolbar">
      <div className="mk-cal-views">
        {(['agenda', 'week', 'month'] as const).map((v) => (
          <button
            key={v}
            className={`mk-cal-view-btn${view === v ? ' active' : ''}`}
            onClick={() => nav({ view: v })}
            type="button"
          >
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>

      {view === 'month' && (
        <div className="mk-cal-month-nav">
          <button onClick={prevMonth} type="button" aria-label="Previous month">‹</button>
          <span>{year}/{String(month).padStart(2, '0')}</span>
          <button onClick={nextMonth} type="button" aria-label="Next month">›</button>
        </div>
      )}

      <div className="mk-cal-filters">
        <select
          value={currentVenture}
          onChange={(e) => nav({ venture: e.target.value })}
          aria-label="Filter by venture"
        >
          <option value="">All ventures</option>
          {ventures.map((v) => (
            <option key={v} value={v}>{VENTURE_LABELS[v] ?? v}</option>
          ))}
        </select>

        <select
          value={currentCampaign}
          onChange={(e) => nav({ campaign_id: e.target.value })}
          aria-label="Filter by campaign"
        >
          <option value="">All campaigns</option>
          {campaigns.map((c) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>

        <select
          value={currentChannel}
          onChange={(e) => nav({ channel: e.target.value })}
          aria-label="Filter by channel"
        >
          <option value="">All channels</option>
          {CHANNELS.map((ch) => (
            <option key={ch} value={ch}>{ch.replace(/_/g, ' ')}</option>
          ))}
        </select>

        <select
          value={currentStatus}
          onChange={(e) => nav({ status: e.target.value })}
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          <option value="scheduled">Scheduled</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="failed">Failed</option>
        </select>
      </div>
    </div>
  )
}
