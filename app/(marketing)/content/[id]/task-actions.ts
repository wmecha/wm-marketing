"use server";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { getContentItem } from "@/lib/marketing/content-items";
import { createMarketingTask, getTaskStatus } from "@/src/lib/task-ops-integration";
import { saveTaskLink, refreshTaskLinkStatus } from "@/lib/marketing/task-links";

const ORG_ID = process.env.NEXT_PUBLIC_COGNEXA_ORG_ID ?? "cognexa";
const TASK_OPS_URL = process.env.TASK_OPS_BASE_URL ?? "";

export type TaskActionResult =
  | { ok: true; taskId: string; message: string }
  | { ok: false; error: string };

function inferSkill(productionFormat: string | null | undefined): string {
  if (!productionFormat) return "content_production";
  const t = productionFormat.toLowerCase();
  if (t.includes("blog") || t.includes("article")) return "blog_post";
  if (t.includes("caption") || t.includes("social")) return "social_caption";
  if (t.includes("video") || t.includes("script")) return "video_script";
  if (t.includes("image") || t.includes("graphic")) return "image_generation";
  return "content_production";
}

export async function sendContentToTask(
  contentId: string
): Promise<TaskActionResult> {
  const user = await requireUser();

  const { data: item, error } = await getContentItem(contentId);
  if (!item || error) {
    return { ok: false, error: "Content item not found." };
  }

  // Determine venture from brand or item directly
  const brand = (item as unknown as { marketing_brands?: { venture_code?: string | null } | null })
    .marketing_brands;
  const ventureCode = brand?.venture_code ?? null;

  if (!ventureCode) {
    return {
      ok: false,
      error: "Content item has no venture code — assign a brand with a venture first.",
    };
  }

  if (!TASK_OPS_URL) {
    return { ok: false, error: "Task Ops integration is not configured." };
  }

  const idempotencyKey = `content_item:${contentId}`;
  const skill = inferSkill(item.production_format);

  const result = await createMarketingTask({
    idempotencyKey,
    sourceApplication: "wm-marketing",
    ventureCode,
    marketingEntityType: "content_item",
    marketingEntityId: contentId,
    requestedSkill: skill as never,
    title: `[Content] ${item.title}`,
    description: [item.hook, item.body].filter(Boolean).join("\n\n"),
    requestedDueDate: item.scheduled_for
      ? (item.scheduled_for as string).slice(0, 10)
      : undefined,
    productionBrief: {
      format: item.production_format ?? "content",
      objective: item.hook ?? undefined,
    },
  });

  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  await saveTaskLink({
    organisationId: ORG_ID,
    ventureCode,
    entityType: "content_item",
    entityId: contentId,
    taskOpTaskId: result.data.taskExternalId,
    idempotencyKey,
    createdBy: user.id,
  });

  revalidatePath(`/content/${contentId}`);
  return {
    ok: true,
    taskId: result.data.taskExternalId,
    message: result.data.idempotent
      ? `Already sent — task ${result.data.taskExternalId} exists.`
      : `Task ${result.data.taskExternalId} created in Task Ops.`,
  };
}

export async function refreshContentTaskStatus(
  linkId: string,
  taskId: string,
  contentId: string
): Promise<TaskActionResult> {
  await requireUser();

  const statusResult = await getTaskStatus(taskId);
  if (!statusResult.ok) {
    return { ok: false, error: statusResult.error };
  }

  await refreshTaskLinkStatus(linkId, statusResult.data.status);
  revalidatePath(`/content/${contentId}`);
  return { ok: true, taskId, message: `Status: ${statusResult.data.status}` };
}
