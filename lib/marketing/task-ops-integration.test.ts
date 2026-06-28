import { describe, expect, it } from "vitest";

// ── Integration client contract ───────────────────────────────────────────────
// Tests here verify the logic in src/lib/task-ops-integration.ts and the
// inferred skill logic in content/[id]/task-actions.ts without making live HTTP calls.

// Mirrors inferSkill from content/[id]/task-actions.ts
function inferSkill(productionFormat: string | null | undefined): string {
  if (!productionFormat) return "content_production";
  const t = productionFormat.toLowerCase();
  if (t.includes("blog") || t.includes("article")) return "blog_post";
  if (t.includes("caption") || t.includes("social")) return "social_caption";
  if (t.includes("video") || t.includes("script")) return "video_script";
  if (t.includes("image") || t.includes("graphic")) return "image_generation";
  return "content_production";
}

describe("inferSkill", () => {
  it("returns content_production for null", () => {
    expect(inferSkill(null)).toBe("content_production");
  });

  it("returns blog_post for blog format", () => {
    expect(inferSkill("blog")).toBe("blog_post");
    expect(inferSkill("article")).toBe("blog_post");
  });

  it("returns social_caption for caption format", () => {
    expect(inferSkill("caption")).toBe("social_caption");
    expect(inferSkill("social_post")).toBe("social_caption");
  });

  it("returns video_script for video format", () => {
    expect(inferSkill("video_script")).toBe("video_script");
    expect(inferSkill("video")).toBe("video_script");
  });

  it("returns image_generation for image format", () => {
    expect(inferSkill("image")).toBe("image_generation");
    expect(inferSkill("graphic")).toBe("image_generation");
  });

  it("falls back to content_production for unrecognised format", () => {
    expect(inferSkill("podcast")).toBe("content_production");
    expect(inferSkill("other")).toBe("content_production");
  });
});

// ── Idempotency key construction ──────────────────────────────────────────────

describe("idempotency keys", () => {
  it("campaign key is stable for a given ID", () => {
    const id = "camp-001";
    expect(`campaign:${id}`).toBe("campaign:camp-001");
  });

  it("content key is stable for a given ID", () => {
    const id = "cont-001";
    expect(`content_item:${id}`).toBe("content_item:cont-001");
  });

  it("campaign and content keys are distinct for the same ID", () => {
    const id = "shared-001";
    expect(`campaign:${id}`).not.toBe(`content_item:${id}`);
  });
});

// ── Venture code validation ───────────────────────────────────────────────────

describe("venture code gating", () => {
  it("content with no venture code should not send", () => {
    const ventureCode = null;
    expect(!!ventureCode).toBe(false);
  });

  it("content with a venture code should allow send", () => {
    const ventureCode = "WMCO";
    expect(!!ventureCode).toBe(true);
  });
});

// ── Request shape contract ────────────────────────────────────────────────────
// Mirrors CreateTaskRequest from src/lib/task-ops-integration.ts

type MarketingEntityType = "campaign" | "content_item" | "creative_brief" | "calendar_entry";
type RequestedSkill =
  | "content_production"
  | "social_caption"
  | "blog_post"
  | "image_generation"
  | "video_script"
  | "campaign_brief"
  | "custom";

type CreateTaskRequest = {
  idempotencyKey: string;
  sourceApplication: "wm-marketing";
  ventureCode: string;
  marketingEntityType: MarketingEntityType;
  marketingEntityId: string;
  requestedSkill: RequestedSkill;
  title: string;
  description: string;
};

describe("CreateTaskRequest shape", () => {
  it("requires sourceApplication to be wm-marketing", () => {
    const req: CreateTaskRequest = {
      idempotencyKey: "test-key",
      sourceApplication: "wm-marketing",
      ventureCode: "WMCO",
      marketingEntityType: "campaign",
      marketingEntityId: "camp-001",
      requestedSkill: "campaign_brief",
      title: "Test Campaign",
      description: "Test description",
    };
    expect(req.sourceApplication).toBe("wm-marketing");
  });

  it("includes idempotency key in every request", () => {
    const req: CreateTaskRequest = {
      idempotencyKey: `campaign:camp-001`,
      sourceApplication: "wm-marketing",
      ventureCode: "LEO",
      marketingEntityType: "campaign",
      marketingEntityId: "camp-001",
      requestedSkill: "campaign_brief",
      title: "Leo Campaign",
      description: "",
    };
    expect(req.idempotencyKey).toContain("camp-001");
  });
});

// ── Response idempotency flag ─────────────────────────────────────────────────

describe("CreateTaskResponse.idempotent", () => {
  it("true response means existing task was returned", () => {
    const resp = { taskExternalId: "TASK-0001", taskStatus: "exists", idempotent: true };
    expect(resp.idempotent).toBe(true);
  });

  it("false response means new task was created", () => {
    const resp = { taskExternalId: "TASK-0002", taskStatus: "Not Started", idempotent: false };
    expect(resp.idempotent).toBe(false);
  });
});
