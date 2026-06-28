import "server-only";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";

function adminClient() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export type MarketingTaskLink = {
  id: string;
  entity_type: string;
  entity_id: string;
  task_ops_task_id: string;
  idempotency_key: string;
  cached_status: string;
  status_refreshed_at: string | null;
  created_at: string;
};

export async function getTaskLinksForEntity(
  entityType: "campaign" | "content_item",
  entityId: string
): Promise<MarketingTaskLink[]> {
  const sb = adminClient();
  const { data, error } = await sb
    .from("marketing_task_links")
    .select("*")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data ?? []) as MarketingTaskLink[];
}

export async function saveTaskLink(params: {
  organisationId: string;
  ventureCode: string | null;
  entityType: "campaign" | "content_item";
  entityId: string;
  taskOpTaskId: string;
  idempotencyKey: string;
  createdBy: string;
}): Promise<{ ok: true; link: MarketingTaskLink } | { ok: false; error: string }> {
  const sb = adminClient();
  const { data, error } = await sb
    .from("marketing_task_links")
    .upsert(
      {
        organisation_id: params.organisationId,
        venture_code: params.ventureCode,
        entity_type: params.entityType,
        entity_id: params.entityId,
        task_ops_task_id: params.taskOpTaskId,
        idempotency_key: params.idempotencyKey,
        created_by: params.createdBy,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "entity_type,entity_id,idempotency_key", ignoreDuplicates: false }
    )
    .select()
    .single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, link: data as MarketingTaskLink };
}

export async function refreshTaskLinkStatus(
  linkId: string,
  newStatus: string
): Promise<void> {
  const sb = adminClient();
  await sb
    .from("marketing_task_links")
    .update({
      cached_status: newStatus,
      status_refreshed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", linkId);
}
