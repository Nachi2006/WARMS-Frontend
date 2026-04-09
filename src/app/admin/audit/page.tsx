"use client";
import { useState } from "react";
import { useAuditLogs } from "@/hooks/useAuditLogs";
import styles from "./audit.module.css";

const PAGE_SIZE = 50;

export default function AuditPage() {
  const [offset, setOffset] = useState(0);
  const { logs, isLoading, mutate } = useAuditLogs(PAGE_SIZE, offset);

  function formatDT(dt: string) {
    return new Date(dt).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "medium" });
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 className="page-title">Audit Logs</h1>
            <p className="page-subtitle">Security event history — all authentication and system actions</p>
          </div>
          <button className="btn-secondary" onClick={() => mutate()}>↻ Refresh</button>
        </div>
      </div>

      {isLoading && (
        <div className="loading-state"><div className="spinner" /><span>Loading logs…</span></div>
      )}

      {!isLoading && (
        <>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>User ID</th>
                  <th>Action</th>
                  <th>IP Address</th>
                  <th>Result</th>
                  <th>Detail</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ fontSize: 12, fontFamily: "monospace", color: "var(--text-muted)" }}>
                      {formatDT(log.timestamp)}
                    </td>
                    <td style={{ color: "var(--text-secondary)" }}>
                      {log.user_id ?? <span style={{ color: "var(--text-muted)" }}>—</span>}
                    </td>
                    <td>
                      <span className="tag">{log.action}</span>
                    </td>
                    <td style={{ fontFamily: "monospace", fontSize: 13 }}>{log.ip_address}</td>
                    <td>
                      <span className={`badge ${log.success ? "badge-success" : "badge-danger"}`}>
                        {log.success ? "✓ Success" : "✗ Failed"}
                      </span>
                    </td>
                    <td style={{ color: "var(--text-muted)", fontSize: 12, maxWidth: 200 }}>
                      {log.detail ?? "—"}
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
                      No audit logs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className={styles.pagination}>
            <button
              className="btn-secondary"
              onClick={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))}
              disabled={offset === 0}
              id="audit-prev"
            >
              ← Previous
            </button>
            <span className={styles.pageInfo}>
              Showing {offset + 1}–{offset + logs.length}
            </span>
            <button
              className="btn-secondary"
              onClick={() => setOffset((o) => o + PAGE_SIZE)}
              disabled={logs.length < PAGE_SIZE}
              id="audit-next"
            >
              Next →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
