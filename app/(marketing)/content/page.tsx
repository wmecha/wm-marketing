import Link from 'next/link'
import type { Metadata } from 'next'
import { StatusBadge } from '@/components/marketing/StatusBadge'
import { EmptyState } from '@/components/marketing/EmptyState'
import { requireUser } from '@/lib/auth'
import { listContentItems } from '@/lib/marketing/content-items'

export const metadata: Metadata = { title: 'Content' }
export const dynamic = 'force-dynamic'

type Props = { searchParams?: Promise<Record<string, string>> }

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'idea', label: 'Idea' },
  { value: 'draft', label: 'Draft' },
  { value: 'review', label: 'Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'published', label: 'Published' },
]

export default async function ContentPage({ searchParams }: Props) {
  await requireUser()
  const sp = await searchParams
  const status = sp?.status ?? ''
  const campaignId = sp?.campaign_id ?? undefined

  const { data: items, error } = await listContentItems({ status: status || undefined, campaignId })

  return (
    <div>
      <div className="mk-page-header">
        <div>
          <h1 className="mk-page-title">Content</h1>
          <p className="mk-page-sub">{items.length} item{items.length !== 1 ? 's' : ''}</p>
        </div>
        <Link href="/content/new" className="mk-btn-primary">
          New content
        </Link>
      </div>

      <div className="mk-filter-bar">
        {STATUS_OPTIONS.map((opt) => (
          <Link
            key={opt.value}
            href={`/content?status=${opt.value}${campaignId ? `&campaign_id=${campaignId}` : ''}`}
            className={`mk-filter-chip${status === opt.value ? ' active' : ''}`}
          >
            {opt.label}
          </Link>
        ))}
      </div>

      {error && <div className="mk-alert-error">Could not load content: {error.message}</div>}

      {!error && items.length === 0 && (
        <EmptyState
          title="No content"
          description={status ? `No ${status} content items.` : 'Create the first content item.'}
          action={{ label: 'Create content', href: '/content/new' }}
        />
      )}

      {items.length > 0 && (
        <div className="mk-list">
          {items.map((item) => {
            const brand = (item as unknown as { marketing_brands?: { name: string } | null }).marketing_brands
            const campaign = (item as unknown as { marketing_campaigns?: { title: string } | null }).marketing_campaigns
            return (
              <Link href={`/content/${item.id}`} key={item.id} className="mk-list-row">
                <div className="mk-list-primary">
                  <span className="mk-list-title">{item.title}</span>
                  {item.hook && <span className="mk-list-sub">{item.hook}</span>}
                  <div className="mk-list-tags">
                    {brand && <span className="mk-tag">{brand.name}</span>}
                    {campaign && <span className="mk-tag">{campaign.title}</span>}
                    {item.production_format && (
                      <span className="mk-tag">{String(item.production_format).replace(/_/g, ' ')}</span>
                    )}
                  </div>
                </div>
                <div className="mk-list-meta">
                  {item.scheduled_for && (
                    <span className="mk-list-date">
                      {new Date(item.scheduled_for as string).toLocaleDateString()}
                    </span>
                  )}
                  <StatusBadge status={item.status} kind="content" />
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
