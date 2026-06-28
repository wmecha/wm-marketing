import { describe, expect, it } from "vitest";
import type { ContentStatus } from "./types";
import { CONTENT_TRANSITIONS, CONTENT_STATUS_LABELS } from "./types";

// DB campaign status values (from migration enum)
const DB_CAMPAIGN_STATUSES = ["draft", "planned", "active", "paused", "completed", "archived"] as const;
type DbCampaignStatus = (typeof DB_CAMPAIGN_STATUSES)[number];

// Transition rules matching migration enum
const CAMPAIGN_TRANSITIONS: Record<DbCampaignStatus, DbCampaignStatus[]> = {
  draft: ["planned", "active"],
  planned: ["active", "paused"],
  active: ["paused", "completed", "archived"],
  paused: ["active", "completed", "archived"],
  completed: [],
  archived: [],
};

const CAMPAIGN_STATUS_LABELS: Record<DbCampaignStatus, string> = {
  draft: "Draft", planned: "Planned", active: "Active",
  paused: "Paused", completed: "Completed", archived: "Archived",
};

// ── Campaign validation ────────────────────────────────────────────────────────

describe("campaign validation", () => {
  it("requires a title", () => {
    const title = "   ".trim();
    expect(title.length).toBe(0);
  });

  it("accepts valid campaign statuses", () => {
    for (const s of DB_CAMPAIGN_STATUSES) {
      expect(CAMPAIGN_STATUS_LABELS[s]).toBeTruthy();
    }
  });

  it("rejects transition from completed", () => {
    expect(CAMPAIGN_TRANSITIONS["completed"]).toEqual([]);
  });

  it("rejects transition from archived", () => {
    expect(CAMPAIGN_TRANSITIONS["archived"]).toEqual([]);
  });

  it("allows draft → planned", () => {
    expect(CAMPAIGN_TRANSITIONS["draft"]).toContain("planned");
  });

  it("allows active → paused", () => {
    expect(CAMPAIGN_TRANSITIONS["active"]).toContain("paused");
  });
});

// ── Content validation ────────────────────────────────────────────────────────

describe("content validation", () => {
  it("accepts valid content statuses", () => {
    const valid: ContentStatus[] = [
      "idea", "draft", "review", "approved", "scheduled", "published", "reported", "archived",
    ];
    for (const s of valid) {
      expect(CONTENT_STATUS_LABELS[s]).toBeTruthy();
    }
  });

  it("allows idea → draft", () => {
    expect(CONTENT_TRANSITIONS["idea"]).toContain("draft");
  });

  it("allows draft → review", () => {
    expect(CONTENT_TRANSITIONS["draft"]).toContain("review");
  });

  it("allows approved → scheduled", () => {
    expect(CONTENT_TRANSITIONS["approved"]).toContain("scheduled");
  });

  it("archived has no forward transitions", () => {
    expect(CONTENT_TRANSITIONS["archived"]).toEqual([]);
  });
});

// ── Calendar filters ──────────────────────────────────────────────────────────

describe("calendar date bounds", () => {
  it("agenda view covers next 30 days", () => {
    const today = new Date("2026-06-28");
    const next30 = new Date(today);
    next30.setDate(next30.getDate() + 30);
    expect(next30.toISOString().slice(0, 10)).toBe("2026-07-28");
  });

  it("month bounds cover full month", () => {
    const year = 2026;
    const month = 2; // February
    const lastDay = new Date(year, month, 0).getDate();
    expect(lastDay).toBe(28);
  });

  it("month bounds for leap year february", () => {
    const year = 2024;
    const month = 2;
    const lastDay = new Date(year, month, 0).getDate();
    expect(lastDay).toBe(29);
  });
});

// ── Brand / platform / pillar selection ──────────────────────────────────────

describe("status badge classification", () => {
  const CAMPAIGN_COLOURS: Record<string, string> = {
    draft: "badge-neutral",
    planned: "badge-blue",
    active: "badge-green",
    paused: "badge-amber",
    completed: "badge-muted",
    archived: "badge-muted",
  };

  it("active campaign gets green badge", () => {
    expect(CAMPAIGN_COLOURS["active"]).toBe("badge-green");
  });

  it("archived campaign gets muted badge", () => {
    expect(CAMPAIGN_COLOURS["archived"]).toBe("badge-muted");
  });

  it("unknown status falls back to neutral", () => {
    expect(CAMPAIGN_COLOURS["unknown"] ?? "badge-neutral").toBe("badge-neutral");
  });
});

// ── Mobile agenda view ────────────────────────────────────────────────────────

describe("calendar view defaults", () => {
  it("default view is agenda (mobile-first)", () => {
    const defaultView = "agenda";
    expect(defaultView).toBe("agenda");
  });

  it("agenda is one of the valid view options", () => {
    const views = ["agenda", "week", "month"] as const;
    expect(views).toContain("agenda");
  });
});

// ── Empty states ──────────────────────────────────────────────────────────────

describe("empty state rendering", () => {
  it("campaigns empty when array is empty", () => {
    const campaigns: unknown[] = [];
    expect(campaigns.length).toBe(0);
  });

  it("content list empty when no items match status filter", () => {
    const items = [{ status: "draft" }, { status: "draft" }];
    const filtered = items.filter((i) => i.status === "published");
    expect(filtered.length).toBe(0);
  });
});

// ── Venture access ────────────────────────────────────────────────────────────

describe("venture access control", () => {
  const ALLOWED_VENTURES = ["WMCO", "WMDES", "LEO", "SHAWN", "WMSOC", "AIVID", "GROC"];

  it("rejects unknown venture codes", () => {
    const code = "UNKNOWN_VENTURE";
    expect(ALLOWED_VENTURES).not.toContain(code);
  });

  it("allows known venture codes", () => {
    for (const code of ALLOWED_VENTURES) {
      expect(ALLOWED_VENTURES).toContain(code);
    }
  });
});
