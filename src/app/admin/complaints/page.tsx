"use client";
import { useAllComplaints } from "@/hooks/useComplaints";
import { api } from "@/lib/api";
import type { ComplaintStatus } from "@/types";
import styles from "./complaints.module.css";

const STATUSES: ComplaintStatus[] = ["open", "in_progress", "resolved"];

const STATUS_CLASS: Record<string, string> = {
  open: "badge-warning",
  in_progress: "badge-info",
  resolved: "badge-success",
};

function formatDate(dt: string) {
  return new Date(dt).toLocaleDateString("en-IN", { dateStyle: "medium" });
}

export default function AdminComplaintsPage() {
  const { complaints, isLoading, mutate } = useAllComplaints();

  async function handleStatusChange(id: number, status: ComplaintStatus) {
    try {
      await api.patch(`/complaints/${id}/status`, { status });
      mutate();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Update failed");
    }
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 className="page-title">Complaints</h1>
            <p className="page-subtitle">All visitor-submitted complaints with geo-tags and status management</p>
          </div>
          <button className="btn-secondary" onClick={() => mutate()}>↻ Refresh</button>
        </div>
      </div>

      <div className={styles.statsRow}>
        {STATUSES.map((s) => (
          <div key={s} className="card" style={{ padding: "14px 20px" }}>
            <div className={styles.statNum}>{complaints.filter((c) => c.status === s).length}</div>
            <div className={styles.statLabel}>{s.replace("_", " ")}</div>
          </div>
        ))}
      </div>

      {isLoading && <div className="loading-state"><div className="spinner" /><span>Loading…</span></div>}

      {!isLoading && complaints.length === 0 && (
        <div className="empty-state">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <p>No complaints submitted yet.</p>
        </div>
      )}

      {!isLoading && complaints.length > 0 && (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Description</th>
                <th>Location</th>
                <th>Submitted</th>
                <th>Status</th>
                <th>Update</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((c) => (
                <tr key={c.id}>
                  <td style={{ color: "var(--text-muted)" }}>#{c.id}</td>
                  <td style={{ color: "var(--text-secondary)" }}>User #{c.user_id}</td>
                  <td style={{ maxWidth: 240, fontSize: 13 }}>{c.description}</td>
                  <td style={{ fontFamily: "monospace", fontSize: 12, color: "var(--text-muted)" }}>
                    {c.latitude.toFixed(4)}, {c.longitude.toFixed(4)}
                  </td>
                  <td style={{ fontSize: 12, color: "var(--text-muted)" }}>{formatDate(c.created_at)}</td>
                  <td>
                    <span className={`badge ${STATUS_CLASS[c.status] ?? "badge-neutral"}`}>
                      {c.status.replace("_", " ")}
                    </span>
                  </td>
                  <td>
                    <select
                      id={`complaint-status-${c.id}`}
                      value={c.status}
                      onChange={(e) => handleStatusChange(c.id, e.target.value as ComplaintStatus)}
                      className={styles.statusSelect}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s.replace("_", " ")}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
