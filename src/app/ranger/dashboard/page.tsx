"use client";
import { useState, useEffect } from "react";
import { getPendingSightings, getPendingRoutes, saveSighting, clearPendingSightings, clearPendingRoutes } from "@/lib/idb";
import { api } from "@/lib/api";
import type { SightingLogEntry, SyncResult } from "@/types";
import styles from "./dashboard.module.css";

export default function RangerDashboard() {
  const [online, setOnline] = useState(true);
  const [pendingSightings, setPendingSightings] = useState(0);
  const [pendingRoutes, setPendingRoutes] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [sightingForm, setSightingForm] = useState({ species: "", latitude: "", longitude: "" });
  const [savingLocal, setSavingLocal] = useState(false);
  const [localMsg, setLocalMsg] = useState("");

  async function refreshCounts() {
    const s = await getPendingSightings();
    const r = await getPendingRoutes();
    setPendingSightings(s.length);
    setPendingRoutes(r.length);
  }

  useEffect(() => {
    setOnline(navigator.onLine);
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    refreshCounts();
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  async function handleSaveLocal(e: React.FormEvent) {
    e.preventDefault();
    setSavingLocal(true);
    const entry: SightingLogEntry = {
      species: sightingForm.species,
      latitude: parseFloat(sightingForm.latitude),
      longitude: parseFloat(sightingForm.longitude),
      observed_at: new Date().toISOString(),
    };
    await saveSighting(entry);
    setSightingForm({ species: "", latitude: "", longitude: "" });
    setLocalMsg("Sighting saved locally!");
    await refreshCounts();
    setSavingLocal(false);
    setTimeout(() => setLocalMsg(""), 3000);
  }

  function getLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      setSightingForm((p) => ({
        ...p,
        latitude: pos.coords.latitude.toFixed(6),
        longitude: pos.coords.longitude.toFixed(6),
      }));
    });
  }

  async function handleSync() {
    setSyncing(true);
    setSyncResult(null);
    try {
      const sightings = await getPendingSightings();
      const patrol_routes = await getPendingRoutes();
      const result = await api.post<SyncResult>("/ranger/sync-logs", {
        sightings,
        patrol_routes,
      });
      await clearPendingSightings();
      await clearPendingRoutes();
      await refreshCounts();
      setSyncResult(result);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="fade-in">
      <div className={`${styles.statusBanner} ${online ? styles.online : styles.offline}`}>
        <span className={styles.statusDot} />
        {online ? "Online — ready to sync" : "Offline — data will be saved locally"}
      </div>

      <div className={styles.counters}>
        <div className={`card ${styles.counterCard}`}>
          <div className={styles.counterNum}>{pendingSightings}</div>
          <div className={styles.counterLabel}>Pending Sightings</div>
        </div>
        <div className={`card ${styles.counterCard}`}>
          <div className={styles.counterNum}>{pendingRoutes}</div>
          <div className={styles.counterLabel}>Pending Routes</div>
        </div>
      </div>

      {syncResult && (
        <div className="alert alert-success">
          ✓ Synced — {syncResult.sightings_synced} sightings, {syncResult.routes_synced} routes, {syncResult.conflicts_resolved} conflicts resolved
        </div>
      )}

      <button
        id="sync-btn"
        className={`btn-primary ${styles.syncBtn}`}
        onClick={handleSync}
        disabled={!online || syncing || (pendingSightings + pendingRoutes === 0)}
      >
        {syncing ? (
          <>
            <span className="spinner" style={{ width: 16, height: 16, display: "inline-block", marginRight: 8 }} />
            Syncing…
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 8, display: "inline" }}>
              <polyline points="1 4 1 10 7 10" />
              <polyline points="23 20 23 14 17 14" />
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15" />
            </svg>
            Sync to Server
          </>
        )}
      </button>

      <div className={styles.sectionTitle}>Log Wildlife Sighting</div>
      <div className="card">
        <form onSubmit={handleSaveLocal}>
          {localMsg && <div className="alert alert-success">{localMsg}</div>}
          <div className="form-group">
            <label className="form-label">Species</label>
            <input
              type="text"
              placeholder="e.g. Bengal Tiger"
              value={sightingForm.species}
              onChange={(e) => setSightingForm((p) => ({ ...p, species: e.target.value }))}
              required
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div className="form-group">
              <label className="form-label">Latitude</label>
              <input
                type="number"
                step="any"
                value={sightingForm.latitude}
                onChange={(e) => setSightingForm((p) => ({ ...p, latitude: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Longitude</label>
              <input
                type="number"
                step="any"
                value={sightingForm.longitude}
                onChange={(e) => setSightingForm((p) => ({ ...p, longitude: e.target.value }))}
                required
              />
            </div>
          </div>
          <button
            type="button"
            className="btn-secondary"
            onClick={getLocation}
            style={{ width: "100%", marginBottom: 10 }}
          >
            📍 Use GPS
          </button>
          <button
            id="save-sighting-btn"
            type="submit"
            className="btn-primary"
            style={{ width: "100%" }}
            disabled={savingLocal}
          >
            {savingLocal ? <span className="spinner" style={{ width: 14, height: 14 }} /> : "Save Locally"}
          </button>
        </form>
      </div>
    </div>
  );
}
