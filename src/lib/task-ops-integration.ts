// MK-003 — Marketing → Task Ops integration contract.
// Marketing ONLY calls this to create/query tasks.
// Task Ops is the authoritative source for task status and artifacts.
// Marketing stores only the external reference (task_ops_task_id) and a cached display status.
// This module never posts journals or calls wm-finance directly.

const TASK_OPS_BASE_URL = process.env.TASK_OPS_BASE_URL ?? "";
const TASK_OPS_API_KEY = process.env.TASK_OPS_API_KEY ?? "";

export type MarketingEntityType =
  | "campaign"
  | "content_item"
  | "creative_brief"
  | "calendar_entry";

export type RequestedSkill =
  | "content_production"
  | "social_caption"
  | "blog_post"
  | "image_generation"
  | "video_script"
  | "campaign_brief"
  | "custom";

export type CreateTaskRequest = {
  idempotencyKey: string;           // prevents duplicate task creation
  sourceApplication: "wm-marketing";
  ventureCode: string;
  marketingEntityType: MarketingEntityType;
  marketingEntityId: string;
  requestedSkill: RequestedSkill;
  artifactDestination?: string;     // Drive folder path or reference
  correlationId?: string;
  requestedDueDate?: string;        // ISO date
  title: string;
  description: string;
  productionBrief: ProductionBrief;
};

export type ProductionBrief = {
  format?: string;
  channels?: string[];
  audience?: string;
  objective?: string;
  tone?: string;
  keyMessages?: string[];
  references?: string[];
  deliverables?: string[];
  constraints?: string;
  [key: string]: unknown;
};

export type CreateTaskResponse = {
  taskExternalId: string;
  taskStatus: string;
  projectReference: string | null;
  executionEligible: boolean;
};

export type TaskStatusResponse = {
  taskExternalId: string;
  status: string;
  lastUpdatedAt: string;
  artifacts: Array<{ id: string; name: string; url?: string }>;
};

export type IntegrationResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; status?: number };

function headers() {
  return {
    "Content-Type": "application/json",
    "x-api-key": TASK_OPS_API_KEY,
    "x-source-app": "wm-marketing",
  };
}

export async function createMarketingTask(
  req: CreateTaskRequest
): Promise<IntegrationResult<CreateTaskResponse>> {
  if (!TASK_OPS_BASE_URL || !TASK_OPS_API_KEY) {
    return { ok: false, error: "Task Ops integration not configured." };
  }

  try {
    const res = await fetch(`${TASK_OPS_BASE_URL}/api/integrations/marketing/tasks`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(req),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { ok: false, error: `Task Ops returned ${res.status}: ${text}`, status: res.status };
    }

    const data = (await res.json()) as CreateTaskResponse;
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function getTaskStatus(
  taskExternalId: string
): Promise<IntegrationResult<TaskStatusResponse>> {
  if (!TASK_OPS_BASE_URL || !TASK_OPS_API_KEY) {
    return { ok: false, error: "Task Ops integration not configured." };
  }

  try {
    const res = await fetch(
      `${TASK_OPS_BASE_URL}/api/integrations/marketing/tasks/${taskExternalId}`,
      { headers: headers() }
    );

    if (!res.ok) {
      return { ok: false, error: `Task Ops returned ${res.status}`, status: res.status };
    }

    const data = (await res.json()) as TaskStatusResponse;
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

// Task Ops event types Marketing listens for (via polling or future webhook)
export const TASK_OPS_EVENTS = [
  "task.created",
  "task.started",
  "task.blocked",
  "task.completed",
  "artifact.ready",
  "approval.requested",
] as const;

export type TaskOpsEventType = (typeof TASK_OPS_EVENTS)[number];
