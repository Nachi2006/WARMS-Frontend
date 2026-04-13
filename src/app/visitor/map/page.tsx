"use client";
import dynamic from "next/dynamic";
import { useHotspots } from "@/hooks/useHotspots";
import styles from "./map.module.css";

const HotspotMap = dynamic(() => import("@/components/visitor/HotspotMap"), {
  ssr: false,
  loading: () => (
    <div className={styles.mapLoading}>
      <div className="spinner" style={{ width: 32, height: 32 }} />
      <p>Loading map…</p>
    </div>
  ),
});

export default function MapPage() {
  const { hotspots, isLoading } = useHotspots();

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Wildlife Hotspot Map</h1>
        <p className="page-subtitle">
          Approximate locations of recent animal sightings — coordinates are geomasked for species safety
        </p>
      </div>

      <div className={styles.legendRow}>
        <div className={styles.legendItem}>
          <div className={styles.legendDot} style={{ background: "#3da066" }} />
          <span>Wildlife Hotspot</span>
        </div>
        <div className={styles.legendItem}>
          <span className="badge badge-warning">⚠ Geomasked</span>
          <span style={{ color: "var(--text-muted)", fontSize: 12 }}>Exact locations are offset to protect animals</span>
        </div>
      </div>

      {isLoading ? (
        <div className={styles.mapLoading}>
          <div className="spinner" style={{ width: 32, height: 32 }} />
          <p>Fetching hotspot data…</p>
        </div>
      ) : hotspots.length === 0 ? (
        <div className="empty-state card" style={{ padding: 60, marginBottom: 20 }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
          </svg>
          <h3>No Hotspots Detected</h3>
          <p>We have not recorded any wildlife activity in the reserve recently.</p>
        </div>
      ) : (
        <div className={styles.mapWrapper}>
          <HotspotMap hotspots={hotspots} />
        </div>
      )}

      <div className={styles.statsRow}>
        <div className="card" style={{ padding: "16px 24px" }}>
          <div className={styles.statNum}>{hotspots.length}</div>
          <div className={styles.statLabel}>Active Hotspots</div>
        </div>
        <div className="card" style={{ padding: "16px 24px" }}>
          <div className={styles.statNum}>
            {[...new Set(hotspots.map((h) => h.species))].length}
          </div>
          <div className={styles.statLabel}>Unique Species</div>
        </div>
      </div>
    </div>
  );
}
