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
  const [gettingGps, setGettingGps] = useState(false);

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
    setGettingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setSightingForm((p) => ({
          ...p,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        }));
        setGettingGps(false);
      },
      () => setGettingGps(false)
    );
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

  const totalPending = pendingSightings + pendingRoutes;

  return (
    <div className="fade-in">
      {/* Status Banner */}
      <div className={`${styles.statusBanner} ${online ? styles.online : styles.offline}`}>
        <span className={styles.statusDot} />
        {online ? "Connected · Ready to sync" : "Offline · Data saved locally"}
      </div>

      {/* Pending Counts */}
      <div className={styles.counters}>
        <div className={styles.counterCard}>
          <div className={styles.counterNum}>{pendingSightings}</div>
          <div className={styles.counterLabel}>Sightings</div>
        </div>
        <div className={styles.counterCard}>
          <div className={styles.counterNum}>{pendingRoutes}</div>
          <div className={styles.counterLabel}>Routes</div>
        </div>
      </div>

      {/* Sync Alert */}
      {syncResult && (
        <div className="alert alert-success">
          ✓ Synced — {syncResult.sightings_synced} sightings, {syncResult.routes_synced} routes
          {syncResult.conflicts_resolved > 0 && `, ${syncResult.conflicts_resolved} conflicts resolved`}
        </div>
      )}

      {/* Sync Button */}
      <button
        id="sync-btn"
        className={`btn-primary ${styles.syncBtn}`}
        onClick={handleSync}
        disabled={!online || syncing || totalPending === 0}
      >
        {syncing ? (
          <>
            <span className="spinner" style={{ width: 16, height: 16, borderColor: "rgba(255,255,255,0.3)", borderTopColor: "white" }} />
            Syncing…
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="1 4 1 10 7 10" />
              <polyline points="23 20 23 14 17 14" />
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15" />
            </svg>
            {totalPending > 0 ? `Sync ${totalPending} Record${totalPending > 1 ? "s" : ""}` : "Nothing to Sync"}
          </>
        )}
      </button>

      {/* Quick Actions */}
      <div className={styles.sectionTitle}>Quick Actions</div>
      <div className={styles.quickActions}>
        <a href="/ranger/incidents" className={styles.actionCard}>
          <div className={styles.actionIcon}>📋</div>
          <div>
            <p className={styles.actionTitle}>Incidents</p>
            <p className={styles.actionSub}>View & report</p>
          </div>
        </a>
        <a href="/ranger/sos" className={`${styles.actionCard} ${styles.actionCardSos}`}>
          <div className={`${styles.actionIcon} ${styles.actionIconSos}`}>🚨</div>
          <div>
            <p className={styles.actionTitle}>SOS Alert</p>
            <p className={styles.actionSub}>Emergency broadcast</p>
          </div>
        </a>
      </div>

      {/* Log Sighting Form */}
      <div className={styles.sectionTitle}>Log Wildlife Sighting</div>
      <div className={styles.formCard}>
        <form onSubmit={handleSaveLocal}>
          {localMsg && (
            <div className="alert alert-success" style={{ marginBottom: 16 }}>
              {localMsg}
            </div>
          )}

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

          <div className={styles.gpsRow}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Latitude</label>
              <input
                type="number"
                step="any"
                placeholder="0.000000"
                value={sightingForm.latitude}
                onChange={(e) => setSightingForm((p) => ({ ...p, latitude: e.target.value }))}
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Longitude</label>
              <input
                type="number"
                step="any"
                placeholder="0.000000"
                value={sightingForm.longitude}
                onChange={(e) => setSightingForm((p) => ({ ...p, longitude: e.target.value }))}
                required
              />
            </div>
          </div>

          <button
            type="button"
            className={`btn-secondary ${styles.gpsBtn}`}
            onClick={getLocation}
            disabled={gettingGps}
            style={{ marginTop: 12 }}
          >
            {gettingGps ? (
              <span className="spinner" style={{ width: 14, height: 14, borderColor: "rgba(61,160,102,0.3)", borderTopColor: "var(--forest-400)" }} />
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
              </svg>
            )}
            {gettingGps ? "Getting GPS…" : "Use GPS Location"}
          </button>

          <button
            id="save-sighting-btn"
            type="submit"
            className={`btn-primary ${styles.submitBtn}`}
            disabled={savingLocal}
          >
            {savingLocal ? (
              <span className="spinner" style={{ width: 14, height: 14, borderColor: "rgba(255,255,255,0.3)", borderTopColor: "white" }} />
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
            )}
            {savingLocal ? "Saving…" : "Save Locally"}
          </button>
        </form>
      </div>
    </div>
  );
}
