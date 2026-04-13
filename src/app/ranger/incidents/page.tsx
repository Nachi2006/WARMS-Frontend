"use client";
import { useState, useRef } from "react";
import { api } from "@/lib/api";
import type { IncidentResponse, IncidentType } from "@/types";
import styles from "./incidents.module.css";

const INCIDENT_TYPES: { value: IncidentType; label: string; emoji: string }[] = [
  { value: "poaching", label: "Poaching", emoji: "🚨" },
  { value: "fence_break", label: "Fence Break", emoji: "⚡" },
  { value: "other", label: "Other", emoji: "📋" },
];

const STATUS_CLASS: Record<string, string> = {
  open: "badge-danger",
  investigating: "badge-warning",
  resolved: "badge-success",
};

export default function IncidentsPage() {
  const [type, setType] = useState<IncidentType>("other");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [gettingLocation, setGettingLocation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<IncidentResponse | null>(null);
  const [error, setError] = useState("");
  const photoRef = useRef<HTMLInputElement>(null);

  function getLocation() {
    if (!navigator.geolocation) return;
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(6));
        setLng(pos.coords.longitude.toFixed(6));
        setGettingLocation(false);
      },
      () => setGettingLocation(false)
    );
  }

  function handlePhoto(f: File) {
    setPhoto(f);
    const reader = new FileReader();
    reader.onload = (e) => setPhotoPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!photo) { setError("Please capture a photo"); return; }
    setError(""); setSubmitting(true);
    const fd = new FormData();
    fd.append("type", type);
    fd.append("latitude", lat);
    fd.append("longitude", lng);
    fd.append("photo", photo);
    try {
      const data = await api.postForm<IncidentResponse>("/ranger/incidents", fd);
      setResult(data);
      setPhoto(null); setPhotoPreview(null);
      setLat(""); setLng("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to report incident");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "Outfit, sans-serif", fontSize: 24, fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>
          Report Incident
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
          Field reporting with GPS coordinates and photo evidence
        </p>
      </div>

      {result && (
        <div className={`card ${styles.successCard} fade-in`}>
          <div className={styles.successIcon}>✓</div>
          <div className={styles.successText}>Incident #{result.id} Reported!</div>
          <span className={`badge ${STATUS_CLASS[result.status]}`}>{result.status}</span>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
            Your report has been logged and will be reviewed.
          </p>
          <button
            className="btn-secondary"
            style={{ marginTop: 12, width: "100%" }}
            onClick={() => setResult(null)}
          >
            Report Another
          </button>
        </div>
      )}

      {!result && (
        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert-error">{error}</div>}

          {/* Incident Type */}
          <p style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.6px", fontWeight: 600, marginBottom: 10 }}>
            Incident Type
          </p>
          <div className={styles.typeGrid}>
            {INCIDENT_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                id={`type-${t.value}`}
                className={`${styles.typeBtn} ${type === t.value ? styles.typeBtnActive : ""}`}
                onClick={() => setType(t.value)}
              >
                <span className={styles.typeEmoji}>{t.emoji}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          {/* Photo Capture */}
          <p style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.6px", fontWeight: 600, marginBottom: 10 }}>
            Photo Evidence
          </p>
          <div className={styles.photoSection}>
            {photoPreview ? (
              <div className={styles.photoPreview}>
                <img src={photoPreview} alt="captured" className={styles.photoImg} />
                <button
                  type="button"
                  className={styles.retakeBtn}
                  onClick={() => { setPhoto(null); setPhotoPreview(null); photoRef.current?.click(); }}
                >
                  📷 Retake
                </button>
              </div>
            ) : (
              <button
                id="capture-photo-btn"
                type="button"
                className={styles.captureBtn}
                onClick={() => photoRef.current?.click()}
              >
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                <span className={styles.captureBtnLabel}>Tap to Capture Photo</span>
                <span className={styles.captureBtnSub}>Camera or gallery</span>
              </button>
            )}
            <input
              ref={photoRef}
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: "none" }}
              onChange={(e) => e.target.files?.[0] && handlePhoto(e.target.files[0])}
            />
          </div>

          {/* GPS */}
          <p style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.6px", fontWeight: 600, marginBottom: 10 }}>
            Location
          </p>

          {lat && lng && (
            <div className={styles.gpsCoords}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
              </svg>
              {parseFloat(lat).toFixed(5)}, {parseFloat(lng).toFixed(5)}
            </div>
          )}

          <div className={styles.gpsGrid}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Latitude</label>
              <input
                type="number"
                step="any"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                placeholder="0.000000"
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Longitude</label>
              <input
                type="number"
                step="any"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                placeholder="0.000000"
                required
              />
            </div>
          </div>

          <button
            id="get-gps-btn"
            type="button"
            className={`btn-secondary ${styles.gpsBtn}`}
            onClick={getLocation}
            disabled={gettingLocation}
            style={{ marginTop: 12 }}
          >
            {gettingLocation ? (
              <span className="spinner" style={{ width: 14, height: 14, borderColor: "rgba(61,160,102,0.3)", borderTopColor: "var(--forest-400)" }} />
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
              </svg>
            )}
            {gettingLocation ? "Getting GPS…" : "Auto-detect GPS"}
          </button>

          {/* Submit */}
          <button
            id="report-incident-btn"
            type="submit"
            className={`btn-danger ${styles.submitBtn}`}
            disabled={submitting}
          >
            {submitting ? (
              <span className="spinner" style={{ width: 16, height: 16, borderColor: "rgba(255,255,255,0.3)", borderTopColor: "white" }} />
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              </svg>
            )}
            {submitting ? "Reporting…" : "Submit Incident Report"}
          </button>
        </form>
      )}
    </div>
  );
}
