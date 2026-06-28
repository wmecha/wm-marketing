import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { requireUser } from '@/lib/auth'
import { createCampaign } from '@/lib/marketing/campaigns'
import { listBrands } from '@/lib/marketing/calendar'

export const metadata: Metadata = { title: 'New Campaign' }

const VENTURES = [
  { code: 'WMCO', name: 'WM & Co' },
  { code: 'WMDES', name: 'WM Design' },
  { code: 'LEO', name: 'Leo' },
  { code: 'SHAWN', name: 'SHAWN Apparel' },
  { code: 'WMSOC', name: 'WM Social' },
  { code: 'AIVID', name: 'AI Video' },
  { code: 'GROC', name: 'Groceries' },
]

const STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'planned', label: 'Planned' },
  { value: 'active', label: 'Active' },
]

const ORG_ID = process.env.NEXT_PUBLIC_COGNEXA_ORG_ID ?? 'cognexa'

export default async function NewCampaignPage() {
  const user = await requireUser()
  const brands = await listBrands()

  async function handleCreate(formData: FormData) {
    'use server'
    const title = String(formData.get('title') ?? '').trim()
    if (!title) return

    const { data, error } = await createCampaign({
      organisation_id: ORG_ID,
      title,
      description: String(formData.get('description') ?? '') || null,
      objective: String(formData.get('objective') ?? '') || null,
      venture_code: String(formData.get('venture_code') ?? '') || null,
      brand_id: String(formData.get('brand_id') ?? '') || null,
      starts_on: String(formData.get('starts_on') ?? '') || null,
      ends_on: String(formData.get('ends_on') ?? '') || null,
      status: (String(formData.get('status') ?? 'draft') as 'draft' | 'planned' | 'active'),
      target_audience: String(formData.get('target_audience') ?? '') || null,
    })

    if (!error && data?.id) redirect(`/campaigns/${data.id}`)
  }

  return (
    <div className="mk-form-page">
      <div className="mk-page-header">
        <div>
          <h1 className="mk-page-title">New campaign</h1>
          <p className="mk-page-sub">Create a campaign to group content around a shared objective.</p>
        </div>
      </div>

      <form action={handleCreate} className="mk-form">
        <div className="mk-form-section">
          <h2 className="mk-form-section-title">Campaign details</h2>

          <div className="mk-field">
            <label htmlFor="title">Campaign name <span aria-hidden="true">*</span></label>
            <input id="title" name="title" type="text" required placeholder="e.g. Q3 Leo launch" />
          </div>

          <div className="mk-field">
            <label htmlFor="objective">Objective</label>
            <input id="objective" name="objective" type="text" placeholder="What should this campaign achieve?" />
          </div>

          <div className="mk-field">
            <label htmlFor="description">Description</label>
            <textarea id="description" name="description" rows={3} placeholder="Context, strategy notes, background…" />
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
            <label htmlFor="status">Status</label>
            <select id="status" name="status" defaultValue="draft">
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mk-form-section">
          <h2 className="mk-form-section-title">Schedule</h2>

          <div className="mk-field-row">
            <div className="mk-field">
              <label htmlFor="starts_on">Start date</label>
              <input id="starts_on" name="starts_on" type="date" />
            </div>

            <div className="mk-field">
              <label htmlFor="ends_on">End date</label>
              <input id="ends_on" name="ends_on" type="date" />
            </div>
          </div>
        </div>

        <div className="mk-form-section">
          <h2 className="mk-form-section-title">Audience</h2>

          <div className="mk-field">
            <label htmlFor="target_audience">Target audience</label>
            <textarea id="target_audience" name="target_audience" rows={2} placeholder="Who is this campaign for?" />
          </div>
        </div>

        <div className="mk-form-footer">
          <button type="submit" className="mk-btn-primary">Create campaign</button>
          <a href="/campaigns" className="mk-btn-ghost">Cancel</a>
        </div>

        <div className="mk-future-section">
          <p>Finance budget reference — available after campaign is linked to a Finance campaign profile.</p>
          <p>Task Ops project reference — available after INT-M1 is shipped.</p>
        </div>
      </form>
    </div>
  )
}
