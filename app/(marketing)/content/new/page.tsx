import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { requireUser } from '@/lib/auth'
import { createContentItem } from '@/lib/marketing/content-items'
import { listCampaigns } from '@/lib/marketing/campaigns'
import { listBrands, listPillars } from '@/lib/marketing/calendar'

export const metadata: Metadata = { title: 'New Content' }

const VENTURES = [
  { code: 'WMCO', name: 'WM & Co' },
  { code: 'WMDES', name: 'WM Design' },
  { code: 'LEO', name: 'Leo' },
  { code: 'SHAWN', name: 'SHAWN Apparel' },
  { code: 'WMSOC', name: 'WM Social' },
  { code: 'AIVID', name: 'AI Video' },
  { code: 'GROC', name: 'Groceries' },
]

const CHANNELS = [
  'linkedin', 'instagram', 'x', 'tiktok', 'youtube', 'threads',
  'whatsapp_status', 'whatsapp_channel', 'email', 'blog', 'podcast', 'other',
]

const FORMATS = [
  { value: 'graphic', label: 'Single graphic' },
  { value: 'carousel', label: 'Carousel' },
  { value: 'motion_graphics', label: 'Motion graphics' },
  { value: 'talking_head', label: 'Talking head' },
  { value: 'hybrid_video', label: 'Talking head + motion graphics' },
  { value: 'written', label: 'Written / long-form' },
]

const ORG_ID = process.env.NEXT_PUBLIC_COGNEXA_ORG_ID ?? 'cognexa'

type Props = { searchParams?: Promise<Record<string, string>> }

export default async function NewContentPage({ searchParams }: Props) {
  const user = await requireUser()
  const sp = await searchParams
  const presetCampaignId = sp?.campaign_id ?? ''

  const [brands, { data: campaigns }, pillars] = await Promise.all([
    listBrands(),
    listCampaigns(),
    listPillars(),
  ])

  async function handleCreate(formData: FormData) {
    'use server'
    const title = String(formData.get('title') ?? '').trim()
    if (!title) return

    const { data, error } = await createContentItem({
      organisation_id: ORG_ID,
      title,
      hook: String(formData.get('hook') ?? '') || null,
      body: String(formData.get('body') ?? '') || null,
      venture_code: String(formData.get('venture_code') ?? '') || null,
      brand_id: String(formData.get('brand_id') ?? '') || null,
      campaign_id: String(formData.get('campaign_id') ?? '') || null,
      production_format: String(formData.get('production_format') ?? '') || null,
      scheduled_for: String(formData.get('scheduled_for') ?? '') || null,
      status: 'idea',
      created_by_user_id: user.id,
    })

    if (!error && data?.id) redirect(`/content/${data.id}`)
  }

  return (
    <div className="mk-form-page">
      <div className="mk-page-header">
        <div>
          <h1 className="mk-page-title">New content item</h1>
          <p className="mk-page-sub">Plan a piece of content before it goes to production.</p>
        </div>
      </div>

      <form action={handleCreate} className="mk-form">
        <div className="mk-form-section">
          <h2 className="mk-form-section-title">Content identity</h2>

          <div className="mk-field">
            <label htmlFor="title">Title <span aria-hidden="true">*</span></label>
            <input id="title" name="title" type="text" required placeholder="Internal reference title" />
          </div>

          <div className="mk-field">
            <label htmlFor="hook">Hook / opening line</label>
            <input id="hook" name="hook" type="text" placeholder="The first line or key hook" />
          </div>

          <div className="mk-field">
            <label htmlFor="body">Caption / script</label>
            <textarea id="body" name="body" rows={5} placeholder="Full caption, script or brief body…" />
          </div>
        </div>

        <div className="mk-form-section">
          <h2 className="mk-form-section-title">Classification</h2>

          <div className="mk-field-row">
            <div className="mk-field">
              <label htmlFor="venture_code">Venture</label>
              <select id="venture_code" name="venture_code">
                <option value="">— Select venture —</option>
                {VENTURES.map((v) => (
                  <option key={v.code} value={v.code}>{v.name}</option>
                ))}
              </select>
            </div>

            <div className="mk-field">
              <label htmlFor="brand_id">Brand</label>
              <select id="brand_id" name="brand_id">
                <option value="">— Select brand —</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mk-field">
            <label htmlFor="campaign_id">Campaign</label>
            <select id="campaign_id" name="campaign_id" defaultValue={presetCampaignId}>
              <option value="">— No campaign —</option>
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>

          <div className="mk-field">
            <label htmlFor="production_format">Production format</label>
            <select id="production_format" name="production_format">
              <option value="">— Select format —</option>
              {FORMATS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mk-form-section">
          <h2 className="mk-form-section-title">Schedule</h2>

          <div className="mk-field">
            <label htmlFor="scheduled_for">Planned date &amp; time</label>
            <input id="scheduled_for" name="scheduled_for" type="datetime-local" />
          </div>
        </div>

        <div className="mk-future-section">
          <p>Run AI — available after live runner verification (S0-B) is complete.</p>
          <p>Media uploads — available in a future milestone.</p>
          <p>Task Ops reference — available after INT-M1 ships.</p>
        </div>

        <div className="mk-form-footer">
          <button type="submit" className="mk-btn-primary">Create content</button>
          <a href="/content" className="mk-btn-ghost">Cancel</a>
        </div>
      </form>
    </div>
  )
}
