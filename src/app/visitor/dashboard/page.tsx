"use client";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import styles from "./dashboard.module.css";

function formatDate(dt: string) {
  return new Date(dt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&q=80",
  "https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=800&q=80",
  "https://images.unsplash.com/photo-1577175889968-f551f5944abd?w=800&q=80",
];

export default function VisitorDashboard() {
  const { announcements, isLoading } = useAnnouncements();

  return (
    <div className="fade-in">
      <div className={styles.hero}>
        <div className={styles.heroImages}>
          {HERO_IMAGES.map((src, i) => (
            <div key={i} className={styles.heroImgWrap} style={{ animationDelay: `${i * 0.1}s` }}>
              <img src={src} alt="wildlife" className={styles.heroImg} />
            </div>
          ))}
        </div>
        <div className={styles.heroOverlay}>
          <h1 className={styles.heroTitle}>Welcome to the Reserve</h1>
          <p className={styles.heroSub}>
            Explore wildlife, book your visit, and join us in protecting nature.
          </p>
        </div>
      </div>

      <div className="page-header" style={{ marginTop: 32 }}>
        <h2 className="page-title">Quick Actions</h2>
        <p className="page-subtitle">Easily access important portals</p>
      </div>

      <div className={styles.announcementsGrid} style={{ marginBottom: 32 }}>
        <a href="/visitor/bookings" className={`card ${styles.annCard}`} style={{ textDecoration: 'none', display: 'block' }}>
          <h3 className={styles.annTitle}>🎫 Book a Safari</h3>
          <p className={styles.annBody}>Reserve your visit slots and view your active bookings.</p>
        </a>
        <a href="/visitor/map" className={`card ${styles.annCard}`} style={{ textDecoration: 'none', display: 'block' }}>
          <h3 className={styles.annTitle}>🗺️ View Map</h3>
          <p className={styles.annBody}>Explore the reserve hotspots and wildlife sightings.</p>
        </a>
        <a href="/visitor/species" className={`card ${styles.annCard}`} style={{ textDecoration: 'none', display: 'block' }}>
          <h3 className={styles.annTitle}>🔍 Identify Species</h3>
          <p className={styles.annBody}>Upload an image or describe a bird/animal to identify it.</p>
        </a>
        <a href="/visitor/complaints" className={`card ${styles.annCard}`} style={{ textDecoration: 'none', display: 'block' }}>
          <h3 className={styles.annTitle}>⚠️ Report an Issue</h3>
          <p className={styles.annBody}>File complaints or report lost items to the administration.</p>
        </a>
      </div>

      <div className="page-header">
        <h2 className="page-title">Announcements</h2>
        <p className="page-subtitle">Latest updates from the reserve</p>
      </div>

      {isLoading && (
        <div className="loading-state">
          <div className="spinner" />
          <span>Loading announcements…</span>
        </div>
      )}

      {!isLoading && announcements.length === 0 && (
        <div className="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <p>No announcements at this time.</p>
        </div>
      )}

      <div className={styles.announcementsGrid}>
        {announcements.map((ann, i) => (
          <div key={ann.id} className={`card ${styles.annCard}`} style={{ animationDelay: `${i * 0.05}s` }}>
            <div className={styles.annHeader}>
              <span className="badge badge-success">Active</span>
              <span className={styles.annDate}>{formatDate(ann.created_at)}</span>
            </div>
            <h3 className={styles.annTitle}>{ann.title}</h3>
            <p className={styles.annBody}>{ann.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
