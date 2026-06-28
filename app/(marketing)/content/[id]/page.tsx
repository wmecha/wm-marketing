import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { StatusBadge } from '@/components/marketing/StatusBadge'
import { requireUser } from '@/lib/auth'
import { getContentItem } from '@/lib/marketing/content-items'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const { data } = await getContentItem(id)
  return { title: data?.title ?? 'Content' }
}

export default async function ContentDetailPage({ params }: Props) {
  const { id } = await params
  await requireUser()

  const { data: item, error } = await getContentItem(id)
  if (!item || error) notFound()

  const brand = (item as unknown as { marketing_brands?: { name: string } | null }).marketing_brands
  const campaign = (item as unknown as { marketing_campaigns?: { id: string; title: string } | null }).marketing_campaigns
  const pillars = (
    item as unknown as {
      marketing_content_pillar_links?: Array<{
        marketing_content_pillars: { name: string; colour: string } | null
      }>
    }
  ).marketing_content_pillar_links ?? []
  const media = (
    item as unknown as { marketing_content_media?: Array<{ id: string; url: string; alt_text: string | null; media_type: string }> }
  ).marketing_content_media ?? []

  return (
    <div>
      <div className="mk-page-header">
        <div>
          <p className="mk-breadcrumb">
            <Link href="/content">Content</Link>{' '}
            {campaign && (
              <>
                / <Link href={`/campaigns/${campaign.id}`}>{campaign.title}</Link>
              </>
            )}{' '}
            / {item.title}
          </p>
          <h1 className="mk-page-title">{item.title}</h1>
        </div>
        <StatusBadge status={item.status} kind="content" />
      </div>

      <div className="mk-detail-grid">
        <div className="mk-detail-main">
          {item.hook && (
            <div className="mk-detail-section">
              <h2>Hook</h2>
              <p className="mk-hook">{item.hook}</p>
            </div>
          )}

          {item.body && (
            <div className="mk-detail-section">
              <h2>Caption / Script</h2>
              <pre className="mk-body-text">{item.body}</pre>
            </div>
          )}

          {pillars.length > 0 && (
            <div className="mk-detail-section">
              <h2>Pillars</h2>
              <div className="mk-pillar-list">
                {pillars.map((pl, i) => {
                  const p = pl.marketing_content_pillars
                  if (!p) return null
                  return (
                    <span
                      key={i}
                      className="mk-pillar-chip"
                      style={{ borderColor: p.colour ?? '#666' }}
                    >
                      {p.name}
                    </span>
                  )
                })}
              </div>
            </div>
          )}

          {media.length > 0 && (
            <div className="mk-detail-section">
              <h2>Media</h2>
              <div className="mk-media-list">
                {media.map((m) => (
                  <a key={m.id} href={m.url} target="_blank" rel="noreferrer" className="mk-media-item">
                    {m.media_type === 'image' ? '🖼 ' : '📎 '}
                    {m.alt_text ?? m.media_type}
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="mk-detail-section mk-future-section">
            <h2>Run AI</h2>
            <p className="mk-muted">
              AI production execution will be available here after live runner verification (S0-B) is complete and INT-M1 ships.
              This area is reserved for the future Run AI workflow.
            </p>
          </div>
        </div>

        <aside className="mk-detail-sidebar">
          <div className="mk-sidebar-card">
            <h3>Content info</h3>
            <dl className="mk-def-list">
              {brand && (
                <>
                  <dt>Brand</dt>
                  <dd>{brand.name}</dd>
                </>
              )}
              {campaign && (
                <>
                  <dt>Campaign</dt>
                  <dd><Link href={`/campaigns/${campaign.id}`}>{campaign.title}</Link></dd>
                </>
              )}
              {item.venture_code && (
                <>
                  <dt>Venture</dt>
                  <dd>{item.venture_code}</dd>
                </>
              )}
              {item.production_format && (
                <>
                  <dt>Format</dt>
                  <dd>{String(item.production_format).replace(/_/g, ' ')}</dd>
                </>
              )}
              {item.scheduled_for && (
                <>
                  <dt>Scheduled</dt>
                  <dd>{new Date(item.scheduled_for as string).toLocaleString()}</dd>
                </>
              )}
              {item.published_at && (
                <>
                  <dt>Published</dt>
                  <dd>{new Date(item.published_at as string).toLocaleString()}</dd>
                </>
              )}
              <dt>Created</dt>
              <dd>{new Date(item.created_at).toLocaleDateString()}</dd>
            </dl>
          </div>

          {item.task_ops_task_id ? (
            <div className="mk-sidebar-card">
              <h3>Task Ops</h3>
              <dl className="mk-def-list">
                <dt>Task ID</dt>
                <dd><code>{item.task_ops_task_id}</code></dd>
                {item.task_ops_status && (
                  <>
                    <dt>Status</dt>
                    <dd>{item.task_ops_status}</dd>
                  </>
                )}
              </dl>
            </div>
          ) : (
            <div className="mk-sidebar-card mk-future-card">
              <h3>Task Ops</h3>
              <p className="mk-muted">Task Ops reference available after INT-M1 ships.</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
