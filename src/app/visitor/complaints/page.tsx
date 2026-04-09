"use client";
import { useState } from "react";
import { useMyComplaints } from "@/hooks/useComplaints";
import { api } from "@/lib/api";
import styles from "./complaints.module.css";

const STATUS_CLASS: Record<string, string> = {
  open: "badge-warning",
  in_progress: "badge-info",
  resolved: "badge-success",
};

function formatDate(dt: string) {
  return new Date(dt).toLocaleDateString("en-IN", { dateStyle: "medium" });
}

export default function ComplaintsPage() {
  const { complaints, isLoading, mutate } = useMyComplaints();
  const [form, setForm] = useState({ description: "", latitude: "", longitude: "" });
  const [locLoading, setLocLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function getLocation() {
    if (!navigator.geolocation) return alert("Geolocation not supported");
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((p) => ({
          ...p,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        }));
        setLocLoading(false);
      },
      () => {
        setLocLoading(false);
        alert("Could not get location. Please enter manually.");
      }
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSuccess("");
    setSubmitting(true);
    try {
      await api.post("/complaints", {
        description: form.description,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
      });
      setSuccess("Complaint submitted successfully!");
      setForm({ description: "", latitude: "", longitude: "" });
      mutate();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Complaints</h1>
        <p className="page-subtitle">Report issues at the reserve and track your submissions</p>
      </div>

      <div className={styles.layout}>
        <div className="card">
          <h2 style={{ fontFamily: "Outfit", fontWeight: 700, fontSize: 18, marginBottom: 20 }}>
            Submit a Complaint
          </h2>
          <form onSubmit={handleSubmit}>
            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                rows={4}
                placeholder="Describe the issue in detail…"
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                required
                style={{ resize: "vertical" }}
              />
            </div>

            <div className={styles.coordRow}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Latitude</label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 20.5937"
                  value={form.latitude}
                  onChange={(e) => setForm((p) => ({ ...p, latitude: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Longitude</label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 78.9629"
                  value={form.longitude}
                  onChange={(e) => setForm((p) => ({ ...p, longitude: e.target.value }))}
                  required
                />
              </div>
            </div>

            <button
              id="get-location-btn"
              type="button"
              className="btn-secondary"
              onClick={getLocation}
              disabled={locLoading}
              style={{ width: "100%", marginTop: 8, marginBottom: 16 }}
            >
              {locLoading ? (
                <span className="spinner" style={{ width: 14, height: 14, display: "inline-block", marginRight: 6 }} />
              ) : "📍"}{" "}
              Auto-detect My Location
            </button>

            <button
              id="submit-complaint-btn"
              type="submit"
              className="btn-primary"
              style={{ width: "100%" }}
              disabled={submitting}
            >
              {submitting ? (
                <span className="spinner" style={{ width: 16, height: 16 }} />
              ) : "Submit Complaint"}
            </button>
          </form>
        </div>

        <div>
          <h2 style={{ fontFamily: "Outfit", fontWeight: 700, fontSize: 18, marginBottom: 16 }}>
            My Submissions
          </h2>
          {isLoading && (
            <div className="loading-state"><div className="spinner" /><span>Loading…</span></div>
          )}
          {!isLoading && complaints.length === 0 && (
            <div className="empty-state">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <p>No complaints submitted yet.</p>
            </div>
          )}
          <div className={styles.complaintList}>
            {complaints.map((c) => (
              <div key={c.id} className={`card ${styles.complaintCard}`}>
                <div className={styles.complaintHeader}>
                  <span className={`badge ${STATUS_CLASS[c.status] ?? "badge-neutral"}`}>{c.status.replace("_", " ")}</span>
                  <span className={styles.complaintDate}>{formatDate(c.created_at)}</span>
                </div>
                <p className={styles.complaintDesc}>{c.description}</p>
                <div className={styles.complaintCoords}>
                  📍 {c.latitude.toFixed(4)}, {c.longitude.toFixed(4)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
