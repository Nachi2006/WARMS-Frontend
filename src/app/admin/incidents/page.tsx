"use client";
import { useRangerIncidents } from "@/hooks/useRangerIncidents";
import { api } from "@/lib/api";
import type { IncidentStatus } from "@/types";
import styles from "./incidents.module.css";

const STATUSES: IncidentStatus[] = ["open", "investigating", "resolved"];
const STATUS_CLASS: Record<string, string> = {
  open: "badge-danger",
  investigating: "badge-warning",
  resolved: "badge-success",
};

function formatDT(dt: string) {
  return new Date(dt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

export default function AdminIncidentsPage() {
  const { incidents, isLoading, mutate } = useRangerIncidents();

  async function handleStatusChange(id: number, status: IncidentStatus) {
    try {
      await api.patch(`/ranger/incidents/${id}/status?new_status=${status}`, {});
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
            <h1 className="page-title">Incident Management</h1>
            <p className="page-subtitle">Monitor and update field incidents reported by rangers</p>
          </div>
          <button className="btn-secondary" onClick={() => mutate()}>↻ Refresh</button>
        </div>
      </div>

      {isLoading && <div className="loading-state"><div className="spinner" /><span>Loading incidents…</span></div>}

      {!isLoading && incidents.length === 0 && (
        <div className="empty-state">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          </svg>
          <p>No incidents on record.</p>
        </div>
      )}

      {!isLoading && incidents.length > 0 && (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Reporter</th>
                <th>Location</th>
                <th>Reported At</th>
                <th>Status</th>
                <th>Update Status</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map((inc) => (
                <tr key={inc.id}>
                  <td style={{ color: "var(--text-muted)" }}>#{inc.id}</td>
                  <td>
                    <span className="tag" style={{ textTransform: "capitalize" }}>
                      {inc.type === "fence_break" ? "Fence Break" : inc.type === "poaching" ? "🚨 Poaching" : "Other"}
                    </span>
                  </td>
                  <td style={{ color: "var(--text-secondary)" }}>Ranger #{inc.reporter_id}</td>
                  <td style={{ fontSize: 12, fontFamily: "monospace", color: "var(--text-muted)" }}>
                    {inc.latitude.toFixed(4)}, {inc.longitude.toFixed(4)}
                  </td>
                  <td style={{ fontSize: 12, color: "var(--text-muted)" }}>{formatDT(inc.created_at)}</td>
                  <td>
                    <span className={`badge ${STATUS_CLASS[inc.status]}`}>{inc.status}</span>
                  </td>
                  <td>
                    <select
                      id={`inc-status-${inc.id}`}
                      value={inc.status}
                      onChange={(e) => handleStatusChange(inc.id, e.target.value as IncidentStatus)}
                      className={styles.statusSelect}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
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
