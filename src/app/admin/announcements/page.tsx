"use client";
import { useState } from "react";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { api } from "@/lib/api";
import type { AnnouncementResponse } from "@/types";
import styles from "./announcements.module.css";

export default function AnnouncementsPage() {
  const { announcements, isLoading, mutate } = useAnnouncements();
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editTarget, setEditTarget] = useState<AnnouncementResponse | null>(null);
  const [form, setForm] = useState({ title: "", body: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function openCreate() {
    setForm({ title: "", body: "" });
    setEditTarget(null);
    setError("");
    setModal("create");
  }

  function openEdit(ann: AnnouncementResponse) {
    setForm({ title: ann.title, body: ann.body });
    setEditTarget(ann);
    setError("");
    setModal("edit");
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (modal === "create") {
        await api.post("/announcements", form);
      } else if (editTarget) {
        await api.patch(`/announcements/${editTarget.id}`, form);
      }
      mutate();
      setModal(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate(id: number) {
    if (!confirm("Deactivate this announcement?")) return;
    try {
      await api.patch(`/announcements/${id}`, { is_active: false });
      mutate();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this announcement?")) return;
    try {
      await api.delete(`/announcements/${id}`);
      mutate();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Delete failed");
    }
  }

  function formatDate(dt: string) {
    return new Date(dt).toLocaleDateString("en-IN", { dateStyle: "medium" });
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 className="page-title">Announcements</h1>
            <p className="page-subtitle">Publish and manage system-wide notices visible to all visitors</p>
          </div>
          <button id="create-announcement-btn" className="btn-primary" onClick={openCreate}>+ Publish</button>
        </div>
      </div>

      {isLoading && <div className="loading-state"><div className="spinner" /><span>Loading…</span></div>}

      <div className={styles.annGrid}>
        {announcements.map((ann) => (
          <div key={ann.id} className={`card ${styles.annCard}`}>
            <div className={styles.annHeader}>
              <span className={`badge ${ann.is_active ? "badge-success" : "badge-neutral"}`}>
                {ann.is_active ? "Active" : "Inactive"}
              </span>
              <span className={styles.annDate}>{formatDate(ann.created_at)}</span>
            </div>
            <h3 className={styles.annTitle}>{ann.title}</h3>
            <p className={styles.annBody}>{ann.body}</p>
            <div className={styles.annActions}>
              <button id={`edit-ann-${ann.id}`} className="btn-icon" onClick={() => openEdit(ann)}>✏ Edit</button>
              {ann.is_active && (
                <button id={`deactivate-ann-${ann.id}`} className="btn-icon" onClick={() => handleDeactivate(ann.id)} style={{ color: "var(--warning)" }}>
                  🔕 Deactivate
                </button>
              )}
              <button id={`delete-ann-${ann.id}`} className="btn-icon" onClick={() => handleDelete(ann.id)} style={{ color: "var(--danger)" }}>
                🗑 Delete
              </button>
            </div>
          </div>
        ))}
        {!isLoading && announcements.length === 0 && (
          <div className="empty-state">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <p>No announcements published yet.</p>
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{modal === "create" ? "Publish Announcement" : "Edit Announcement"}</h2>
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              {error && <div className="alert alert-error">{error}</div>}
              <div className="form-group">
                <label className="form-label">Title</label>
                <input type="text" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Body</label>
                <textarea rows={5} value={form.body} onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))} required style={{ resize: "vertical" }} />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setModal(null)}>Cancel</button>
                <button id="save-announcement-btn" type="submit" className="btn-primary" style={{ flex: 1 }} disabled={saving}>
                  {saving ? <span className="spinner" style={{ width: 16, height: 16 }} /> : modal === "create" ? "Publish" : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
