import 'server-only'
import { createClient } from '@/lib/supabase/server'

export type NewCampaign = {
  title: string
  description?: string | null
  objective?: string | null
  venture_code?: string | null
  brand_id?: string | null
  starts_on?: string | null
  ends_on?: string | null
  status?: 'draft' | 'planned' | 'active' | 'paused' | 'completed' | 'archived'
  target_audience?: string | null
  channels?: string[]
  organisation_id: string
}

export async function listCampaigns() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('marketing_campaigns')
    .select(`
      id, title, description, objective, status, venture_code,
      starts_on, ends_on, budget_kes, created_at, updated_at,
      brand_id,
      marketing_brands ( id, code, name )
    `)
    .order('created_at', { ascending: false })
  return { data: data ?? [], error }
}

export async function getCampaign(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('marketing_campaigns')
    .select(`
      id, title, description, objective, status, venture_code,
      starts_on, ends_on, budget_kes, target_audience, channels,
      task_ops_project_id, finance_campaign_id,
      created_by_user_id, created_at, updated_at,
      brand_id,
      marketing_brands ( id, code, name )
    `)
    .eq('id', id)
    .maybeSingle()
  return { data, error }
}

export async function getCampaignContentCount(campaignId: string) {
  const supabase = await createClient()
  const { count } = await supabase
    .from('marketing_content_items')
    .select('id', { count: 'exact', head: true })
    .eq('campaign_id', campaignId)
  return count ?? 0
}

export async function createCampaign(input: NewCampaign) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('marketing_campaigns')
    .insert(input)
    .select('id')
    .single()
  return { data, error }
}

export async function updateCampaign(id: string, input: Partial<Omit<NewCampaign, 'organisation_id'>>) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('marketing_campaigns')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('id')
    .single()
  return { data, error }
}
