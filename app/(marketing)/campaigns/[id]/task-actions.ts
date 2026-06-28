"use server";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { getCampaign } from "@/lib/marketing/campaigns";
import { createMarketingTask, getTaskStatus } from "@/src/lib/task-ops-integration";
import { saveTaskLink, refreshTaskLinkStatus } from "@/lib/marketing/task-links";

const ORG_ID = process.env.NEXT_PUBLIC_COGNEXA_ORG_ID ?? "cognexa";
const TASK_OPS_URL = process.env.TASK_OPS_BASE_URL ?? "";

export type TaskActionResult =
  | { ok: true; taskId: string; message: string }
  | { ok: false; error: string };

export async function sendCampaignToTask(
  campaignId: string
): Promise<TaskActionResult> {
  const user = await requireUser();

  // Fetch campaign and check access
  const { data: campaign, error } = await getCampaign(campaignId);
  if (!campaign || error) {
    return { ok: false, error: "Campaign not found." };
  }

  if (!campaign.venture_code) {
    return { ok: false, error: "Campaign has no venture code — cannot route to Task Ops." };
  }

  if (!TASK_OPS_URL) {
    return { ok: false, error: "Task Ops integration is not configured." };
  }

  // Idempotency key: one task per campaign (use campaign ID as the stable key)
  const idempotencyKey = `campaign:${campaignId}`;

  const result = await createMarketingTask({
    idempotencyKey,
    sourceApplication: "wm-marketing",
    ventureCode: campaign.venture_code,
    marketingEntityType: "campaign",
    marketingEntityId: campaignId,
    requestedSkill: "campaign_brief",
    title: `[Campaign] ${campaign.title}`,
    description: [campaign.objective, campaign.description].filter(Boolean).join("\n\n"),
    requestedDueDate: campaign.ends_on ?? undefined,
    productionBrief: {
      objective: campaign.objective ?? undefined,
      format: "campaign_brief",
    },
  });

  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  // Store the link in marketing_task_links
  await saveTaskLink({
    organisationId: ORG_ID,
    ventureCode: campaign.venture_code,
    entityType: "campaign",
    entityId: campaignId,
    taskOpTaskId: result.data.taskExternalId,
    idempotencyKey,
    createdBy: user.id,
  });

  revalidatePath(`/campaigns/${campaignId}`);
  return {
    ok: true,
    taskId: result.data.taskExternalId,
    message: result.data.idempotent
      ? `Already sent — task ${result.data.taskExternalId} exists.`
      : `Task ${result.data.taskExternalId} created in Task Ops.`,
  };
}

export async function refreshCampaignTaskStatus(
  linkId: string,
  taskId: string,
  campaignId: string
): Promise<TaskActionResult> {
  await requireUser();

  const statusResult = await getTaskStatus(taskId);
  if (!statusResult.ok) {
    return { ok: false, error: statusResult.error };
  }

  await refreshTaskLinkStatus(linkId, statusResult.data.status);
  revalidatePath(`/campaigns/${campaignId}`);
  return { ok: true, taskId, message: `Status: ${statusResult.data.status}` };
}
