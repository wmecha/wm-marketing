import 'server-only'
import { createClient } from '@/lib/supabase/server'

export type NewContentItem = {
  organisation_id: string
  venture_code?: string | null
  brand_id?: string | null
  campaign_id?: string | null
  title: string
  hook?: string | null
  body?: string | null
  hashtags?: string[]
  status?: 'idea' | 'brief' | 'draft' | 'review' | 'approved' | 'scheduled' | 'published' | 'reported' | 'archived'
  channels?: string[]
  production_format?: string | null
  production_spec?: Record<string, unknown>
  scheduled_for?: string | null
  created_by_user_id?: string | null
}

export async function listContentItems(filters?: {
  campaignId?: string
  ventureCode?: string
  status?: string
  limit?: number
}) {
  const supabase = await createClient()
  let q = supabase
    .from('marketing_content_items')
    .select(`
      id, title, hook, status, venture_code, channels, production_format,
      scheduled_for, published_at, created_at, updated_at,
      campaign_id,
      brand_id,
      marketing_brands ( id, code, name ),
      marketing_campaigns ( id, title )
    `)
    .order('created_at', { ascending: false })

  if (filters?.campaignId) q = q.eq('campaign_id', filters.campaignId)
  if (filters?.ventureCode) q = q.eq('venture_code', filters.ventureCode)
  if (filters?.status) q = q.eq('status', filters.status)
  if (filters?.limit) q = q.limit(filters.limit)

  const { data, error } = await q
  return { data: data ?? [], error }
}

export async function getContentItem(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('marketing_content_items')
    .select(`
      id, title, hook, body, hashtags, status, venture_code, channels,
      production_format, production_spec, scheduled_for, published_at,
      task_ops_task_id, task_ops_status, task_ops_project_id,
      created_by_user_id, created_at, updated_at,
      campaign_id,
      brand_id,
      marketing_brands ( id, code, name ),
      marketing_campaigns ( id, title ),
      marketing_content_pillar_links (
        pillar_id,
        marketing_content_pillars ( id, name, colour )
      ),
      marketing_content_media ( id, media_type, url, alt_text, sort_order )
    `)
    .eq('id', id)
    .maybeSingle()
  return { data, error }
}

export async function createContentItem(input: NewContentItem) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('marketing_content_items')
    .insert(input)
    .select('id')
    .single()
  return { data, error }
}

export async function updateContentItem(
  id: string,
  input: Partial<Omit<NewContentItem, 'organisation_id'>>
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('marketing_content_items')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('id')
    .single()
  return { data, error }
}
