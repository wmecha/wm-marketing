import Link from 'next/link'
import type { Metadata } from 'next'
import { StatusBadge } from '@/components/marketing/StatusBadge'
import { EmptyState } from '@/components/marketing/EmptyState'
import { requireUser } from '@/lib/auth'
import { listCampaigns } from '@/lib/marketing/campaigns'

export const metadata: Metadata = { title: 'Campaigns' }
export const dynamic = 'force-dynamic'

const VENTURE_LABELS: Record<string, string> = {
  WMCO: 'WM & Co',
  WMDES: 'WM Design',
  LEO: 'Leo',
  SHAWN: 'SHAWN Apparel',
  WMSOC: 'WM Social',
  AIVID: 'AI Video',
  GROC: 'Groceries',
}

export default async function CampaignsPage() {
  await requireUser()
  const { data: campaigns, error } = await listCampaigns()

  return (
    <div>
      <div className="mk-page-header">
        <div>
          <h1 className="mk-page-title">Campaigns</h1>
          <p className="mk-page-sub">{campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''}</p>
        </div>
        <Link href="/campaigns/new" className="mk-btn-primary">
          New campaign
        </Link>
      </div>

      {error && (
        <div className="mk-alert-error">
          Could not load campaigns: {error.message}
        </div>
      )}

      {!error && campaigns.length === 0 && (
        <EmptyState
          title="No campaigns yet"
          description="Create the first campaign to start organising your content."
          action={{ label: 'Create campaign', href: '/campaigns/new' }}
        />
      )}

      {campaigns.length > 0 && (
        <div className="mk-card-grid">
          {campaigns.map((c) => {
            const brand = (c as unknown as { marketing_brands?: { name: string } | null }).marketing_brands
            return (
              <Link href={`/campaigns/${c.id}`} key={c.id} className="mk-card">
                <div className="mk-card-header">
                  <span className="mk-card-title">{c.title}</span>
                  <StatusBadge status={c.status} kind="campaign" />
                </div>
                {c.description && (
                  <p className="mk-card-body">{c.description}</p>
                )}
                <dl className="mk-card-meta">
                  {c.venture_code && (
                    <>
                      <dt>Venture</dt>
                      <dd>{VENTURE_LABELS[c.venture_code] ?? c.venture_code}</dd>
                    </>
                  )}
                  {brand && (
                    <>
                      <dt>Brand</dt>
                      <dd>{brand.name}</dd>
                    </>
                  )}
                  {c.starts_on && (
                    <>
                      <dt>Start</dt>
                      <dd>{c.starts_on}</dd>
                    </>
                  )}
                  {c.ends_on && (
                    <>
                      <dt>End</dt>
                      <dd>{c.ends_on}</dd>
                    </>
                  )}
                </dl>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
