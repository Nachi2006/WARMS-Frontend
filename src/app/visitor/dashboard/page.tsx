"use client";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { useHotspots } from "@/hooks/useHotspots";
import { useBookings } from "@/hooks/useBookings";
import styles from "./dashboard.module.css";

function formatDate(dt: string) {
  return new Date(dt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=900&q=80",
  "https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=500&q=80",
  "https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=500&q=80",
];

const QUICK_ACTIONS = [
  {
    href: "/visitor/bookings",
    icon: "🎫",
    iconClass: styles.actionIconGreen,
    title: "Book a Safari",
    desc: "Reserve your visit slots and manage active bookings",
    delay: "0s",
  },
  {
    href: "/visitor/map",
    icon: "🗺️",
    iconClass: styles.actionIconBlue,
    title: "Wildlife Map",
    desc: "Explore hotspots and recent animal sightings",
    delay: "0.05s",
  },
  {
    href: "/visitor/species",
    icon: "🔍",
    iconClass: styles.actionIconGold,
    title: "Identify Species",
    desc: "Upload a photo or describe an animal to identify it",
    delay: "0.1s",
  },
  {
    href: "/visitor/complaints",
    icon: "⚠️",
    iconClass: styles.actionIconRed,
    title: "Report Issue",
    desc: "File complaints or report problems to administration",
    delay: "0.15s",
  },
];

const VISITOR_TIPS = [
  "Stay on marked trails and follow ranger instructions.",
  "Keep noise levels low to avoid disturbing wildlife.",
  "Carry water and wear sun protection for outdoor visits.",
  "Photography is welcome — do not use flash near animals.",
];

export default function VisitorDashboard() {
  const { announcements, isLoading: annLoading } = useAnnouncements();
  const { hotspots } = useHotspots();
  const { bookings } = useBookings();

  const activeBookings = bookings.filter(
    (b) => b.status === "confirmed" || b.status === "pending"
  ).length;
  const uniqueSpecies = [...new Set(hotspots.map((h) => h.species))].length;
  const hotspotCount = hotspots.length;

  return (
    <div className="fade-in">
      {/* ── Hero ── */}
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

      {/* ── Stats Strip ── */}
      <div className={styles.statsStrip}>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>🦁</span>
          <div className={styles.statNum}>{hotspotCount}</div>
          <div className={styles.statLabel}>Hotspots</div>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>🌿</span>
          <div className={styles.statNum}>{uniqueSpecies}</div>
          <div className={styles.statLabel}>Species</div>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>🎫</span>
          <div className={styles.statNum}>{activeBookings}</div>
          <div className={styles.statLabel}>My Bookings</div>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className={styles.sectionHead} style={{ marginBottom: 16 }}>
        <h2 className={styles.sectionTitle}>Quick Actions</h2>
        <span className={styles.sectionBadge}>Explore</span>
      </div>

      <div className={styles.actionsGrid}>
        {QUICK_ACTIONS.map((action) => (
          <a
            key={action.href}
            href={action.href}
            className={`${styles.actionCard} ${styles.actionCardAccent}`}
            style={{ animationDelay: action.delay }}
          >
            <div className={`${styles.actionIconBox} ${action.iconClass}`}>
              {action.icon}
            </div>
            <div>
              <div className={styles.actionTitle}>{action.title}</div>
              <div className={styles.actionDesc}>{action.desc}</div>
            </div>
            <svg
              className={styles.actionArrow}
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </a>
        ))}
      </div>

      {/* ── Visitor Tips ── */}
      <div className={styles.tipsBanner}>
        <div className={styles.tipsIcon}>💡</div>
        <div className={styles.tipsList}>
          <div className={styles.tipsTitle}>Reserve Guidelines</div>
          {VISITOR_TIPS.map((tip, i) => (
            <div key={i} className={styles.tipItem}>
              <span className={styles.tipDot}>▸</span>
              <span>{tip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Announcements ── */}
      <div className={styles.sectionHead}>
        <h2 className={styles.sectionTitle}>Announcements</h2>
        {announcements.length > 0 && (
          <span className={styles.sectionBadge}>{announcements.length} active</span>
        )}
      </div>

      {annLoading && (
        <div className="loading-state">
          <div className="spinner" />
          <span>Loading announcements…</span>
        </div>
      )}

      {!annLoading && announcements.length === 0 && (
        <div className="empty-state card" style={{ padding: 48 }}>
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.35 }}>
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <p style={{ color: "var(--text-muted)", marginTop: 12 }}>No announcements at this time.</p>
        </div>
      )}

      <div className={styles.announcementsGrid}>
        {announcements.map((ann, i) => (
          <div
            key={ann.id}
            className={`card ${styles.annCard}`}
            style={{ animationDelay: `${i * 0.05}s` }}
          >
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
