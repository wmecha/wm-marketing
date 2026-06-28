import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { StatusBadge } from '@/components/marketing/StatusBadge'
import { EmptyState } from '@/components/marketing/EmptyState'
import { TaskOpsCard } from '@/components/marketing/TaskOpsCard'
import { requireUser } from '@/lib/auth'
import { getCampaign, getCampaignContentCount } from '@/lib/marketing/campaigns'
import { listContentItems } from '@/lib/marketing/content-items'
import { getTaskLinksForEntity } from '@/lib/marketing/task-links'
import { sendCampaignToTask, refreshCampaignTaskStatus } from './task-actions'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const { data } = await getCampaign(id)
  return { title: data?.title ?? 'Campaign' }
}

const VENTURE_LABELS: Record<string, string> = {
  WMCO: 'WM & Co', WMDES: 'WM Design', LEO: 'Leo',
  SHAWN: 'SHAWN Apparel', WMSOC: 'WM Social', AIVID: 'AI Video', GROC: 'Groceries',
}

export default async function CampaignDetailPage({ params }: Props) {
  const { id } = await params
  await requireUser()

  const { data: campaign, error } = await getCampaign(id)
  if (!campaign || error) notFound()

  const [contentCount, { data: contentItems }, taskLinks] = await Promise.all([
    getCampaignContentCount(id),
    listContentItems({ campaignId: id, limit: 10 }),
    getTaskLinksForEntity('campaign', id),
  ])

  const brand = (campaign as unknown as { marketing_brands?: { name: string } | null }).marketing_brands

  return (
    <div>
      <div className="mk-page-header">
        <div>
          <p className="mk-breadcrumb">
            <Link href="/campaigns">Campaigns</Link> / {campaign.title}
          </p>
          <h1 className="mk-page-title">{campaign.title}</h1>
        </div>
        <StatusBadge status={campaign.status} kind="campaign" />
      </div>

      <div className="mk-detail-grid">
        <div className="mk-detail-main">
          {campaign.objective && (
            <div className="mk-detail-section">
              <h2>Objective</h2>
              <p>{campaign.objective}</p>
            </div>
          )}

          {campaign.description && (
            <div className="mk-detail-section">
              <h2>Description</h2>
              <p>{campaign.description}</p>
            </div>
          )}

          <div className="mk-detail-section">
            <div className="mk-section-header">
              <h2>Content ({contentCount})</h2>
              <Link
                href={`/content/new?campaign_id=${id}`}
                className="mk-btn-small"
              >
                Add content
              </Link>
            </div>

            {contentItems.length === 0 ? (
              <EmptyState
                title="No content yet"
                description="Add the first piece of content to this campaign."
                action={{ label: 'Add content', href: `/content/new?campaign_id=${id}` }}
              />
            ) : (
              <div className="mk-list">
                {contentItems.map((item) => (
                  <Link href={`/content/${item.id}`} key={item.id} className="mk-list-row">
                    <div>
                      <span className="mk-list-title">{item.title}</span>
                      {item.hook && <span className="mk-list-sub">{item.hook}</span>}
                    </div>
                    <div className="mk-list-meta">
                      {item.scheduled_for && (
                        <span>{new Date(item.scheduled_for).toLocaleDateString()}</span>
                      )}
                      <StatusBadge status={item.status} kind="content" />
                    </div>
                  </Link>
                ))}
                {contentCount > 10 && (
                  <Link href={`/content?campaign_id=${id}`} className="mk-see-all">
                    See all {contentCount} content items →
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        <aside className="mk-detail-sidebar">
          <div className="mk-sidebar-card">
            <h3>Campaign info</h3>
            <dl className="mk-def-list">
              {campaign.venture_code && (
                <>
                  <dt>Venture</dt>
                  <dd>{VENTURE_LABELS[campaign.venture_code] ?? campaign.venture_code}</dd>
                </>
              )}
              {brand && (
                <>
                  <dt>Brand</dt>
                  <dd>{brand.name}</dd>
                </>
              )}
              {campaign.starts_on && (
                <>
                  <dt>Start</dt>
                  <dd>{campaign.starts_on}</dd>
                </>
              )}
              {campaign.ends_on && (
                <>
                  <dt>End</dt>
                  <dd>{campaign.ends_on}</dd>
                </>
              )}
              {campaign.budget_kes != null && (
                <>
                  <dt>Budget</dt>
                  <dd>KSh {Number(campaign.budget_kes).toLocaleString()}</dd>
                </>
              )}
              <dt>Created</dt>
              <dd>{new Date(campaign.created_at).toLocaleDateString()}</dd>
            </dl>
          </div>

          <div className="mk-sidebar-card mk-future-card">
            <h3>Finance</h3>
            <p className="mk-muted">Budget reference will be available after campaign is linked to a Finance campaign profile.</p>
          </div>

          <TaskOpsCard
            links={taskLinks}
            canSend={!!campaign.venture_code}
            taskOpsBaseUrl={process.env.NEXT_PUBLIC_TASK_OPS_URL ?? ''}
            onSend={() => sendCampaignToTask(id)}
            onRefresh={(linkId, taskId) => refreshCampaignTaskStatus(linkId, taskId, id)}
          />
        </aside>
      </div>
    </div>
  )
}
