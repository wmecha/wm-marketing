import 'server-only'
import { createClient } from '@/lib/supabase/server'

export async function listCalendarEntries(filters?: {
  ventureCode?: string
  campaignId?: string
  brandId?: string
  channel?: string
  status?: string
  from?: string
  to?: string
}) {
  const supabase = await createClient()
  let q = supabase
    .from('marketing_calendar_entries')
    .select(`
      id, scheduled_for, published_at, status, channel, notes,
      venture_code,
      content_id,
      campaign_id,
      platform_id,
      marketing_content_items (
        id, title, hook, status, production_format,
        brand_id,
        marketing_brands ( id, code, name )
      ),
      marketing_campaigns ( id, title ),
      marketing_platforms ( id, channel, handle, display_name )
    `)
    .order('scheduled_for', { ascending: true })

  if (filters?.from) q = q.gte('scheduled_for', filters.from)
  if (filters?.to) q = q.lte('scheduled_for', filters.to)
  if (filters?.ventureCode) q = q.eq('venture_code', filters.ventureCode)
  if (filters?.campaignId) q = q.eq('campaign_id', filters.campaignId)
  if (filters?.channel) q = q.eq('channel', filters.channel)
  if (filters?.status) q = q.eq('status', filters.status)

  const { data, error } = await q
  return { data: data ?? [], error }
}

export async function listBrands() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('marketing_brands')
    .select('id, code, name, venture_code, status')
    .eq('status', 'active')
    .order('name')
  return data ?? []
}

export async function listPlatforms(brandId?: string) {
  const supabase = await createClient()
  let q = supabase
    .from('marketing_platforms')
    .select('id, brand_id, channel, handle, display_name, status')
    .eq('status', 'active')
    .order('channel')
  if (brandId) q = q.eq('brand_id', brandId)
  const { data } = await q
  return data ?? []
}

export async function listPillars() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('marketing_content_pillars')
    .select('id, name, colour, status, venture_code, brand_id')
    .eq('status', 'active')
    .order('name')
  return data ?? []
}
