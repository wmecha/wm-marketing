"use client";
import { useTransition } from "react";
import type { MarketingTaskLink } from "@/lib/marketing/task-links";

type Props = {
  links: MarketingTaskLink[];
  canSend: boolean;
  taskOpsBaseUrl: string;
  onSend: () => Promise<{ ok: boolean; taskId?: string; message?: string; error?: string }>;
  onRefresh: (linkId: string, taskId: string) => Promise<{ ok: boolean; message?: string; error?: string }>;
};

export function TaskOpsCard({ links, canSend, taskOpsBaseUrl, onSend, onRefresh }: Props) {
  const [sending, startSend] = useTransition();
  const [refreshing, startRefresh] = useTransition();
  const [feedback, setFeedback] = React.useState<string | null>(null);

  function handleSend() {
    startSend(async () => {
      const r = await onSend();
      setFeedback(r.ok ? (r.message ?? "Task created.") : `Error: ${r.error}`);
    });
  }

  function handleRefresh(linkId: string, taskId: string) {
    startRefresh(async () => {
      const r = await onRefresh(linkId, taskId);
      setFeedback(r.ok ? (r.message ?? "Refreshed.") : `Error: ${r.error}`);
    });
  }

  const taskUrl = (taskId: string) =>
    taskOpsBaseUrl ? `${taskOpsBaseUrl}/tasks?highlight=${taskId}` : "#";

  return (
    <div className="mk-sidebar-card">
      <h3>Task Ops</h3>

      {links.length === 0 ? (
        <p className="mk-muted">No tasks linked yet.</p>
      ) : (
        <ul className="mk-task-link-list">
          {links.map((link) => (
            <li key={link.id} className="mk-task-link-row">
              <div className="mk-task-link-id">
                <a
                  href={taskUrl(link.task_ops_task_id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mk-link"
                >
                  {link.task_ops_task_id}
                </a>
              </div>
              <div className="mk-task-link-meta">
                <span className="badge badge-neutral">{link.cached_status}</span>
                <button
                  type="button"
                  className="mk-btn-ghost-xs"
                  disabled={refreshing}
                  onClick={() => handleRefresh(link.id, link.task_ops_task_id)}
                >
                  {refreshing ? "…" : "↻"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {canSend && (
        <button
          type="button"
          className="mk-btn-small mt-2"
          disabled={sending}
          onClick={handleSend}
        >
          {sending ? "Sending…" : links.length > 0 ? "Send again" : "Send to Task Ops"}
        </button>
      )}

      {feedback && <p className="mk-task-feedback">{feedback}</p>}
    </div>
  );
}

// Needs React import for useState
import React from "react";
