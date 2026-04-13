"use client";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { useRangerIncidents } from "@/hooks/useRangerIncidents";
import { useInventory } from "@/hooks/useInventory";
import { useAllComplaints } from "@/hooks/useComplaints";
import styles from "./dashboard.module.css";

interface StatCardProps {
  value: number | string;
  label: string;
  icon: React.ReactNode;
  color: string;
  sub?: string;
  href?: string;
}

function StatCard({ value, label, icon, color, sub, href }: StatCardProps) {
  const content = (
    <>
      <div className={styles.statIcon} style={{ background: `${color}20`, color }}>{icon}</div>
      <div className={styles.statNum}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
      {sub && <div className={styles.statSub}>{sub}</div>}
    </>
  );

  return href ? (
    <a href={href} className={`card ${styles.statCard}`} style={{ borderTopColor: color, textDecoration: 'none', display: 'block', cursor: 'pointer' }}>
      {content}
    </a>
  ) : (
    <div className={`card ${styles.statCard}`} style={{ borderTopColor: color }}>
      {content}
    </div>
  );
}

export default function AdminDashboard() {
  const { users } = useAdminUsers();
  const { incidents } = useRangerIncidents();
  const { items } = useInventory();
  const { complaints } = useAllComplaints();

  const openIncidents = incidents.filter((i) => i.status === "open").length;
  const pendingComplaints = complaints.filter((c) => c.status === "open").length;
  const availableItems = items.filter((i) => i.status === "available").length;

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">System overview — Wildlife Administration & Reserve Management</p>
      </div>

      <div className="grid-4" style={{ marginBottom: 32 }}>
        <StatCard
          value={users.length}
          label="Total Users"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /></svg>}
          color="#3da066"
          sub={`${users.filter((u) => u.role === "ranger").length} rangers`}
          href="/admin/users"
        />
        <StatCard
          value={openIncidents}
          label="Open Incidents"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /></svg>}
          color="#e05252"
          sub={`${incidents.length} total`}
          href="/admin/incidents"
        />
        <StatCard
          value={availableItems}
          label="Available Equipment"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>}
          color="#c9872f"
          sub={`${items.length} total items`}
          href="/admin/inventory"
        />
        <StatCard
          value={pendingComplaints}
          label="Open Complaints"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>}
          color="#3d8fa0"
          sub={`${complaints.length} total`}
          href="/admin/complaints"
        />
      </div>

      <div className={styles.recentGrid}>
        <div className="card">
          <h3 className={styles.cardTitle}>Recent Incidents</h3>
          {incidents.slice(0, 5).map((inc) => (
            <div key={inc.id} className={styles.recentRow}>
              <div>
                <span className={styles.recentPrimary}>{inc.type.replace("_", " ")}</span>
                <span className={styles.recentSub}> — Reporter #{inc.reporter_id}</span>
              </div>
              <span className={`badge ${inc.status === "open" ? "badge-danger" : inc.status === "investigating" ? "badge-warning" : "badge-success"}`}>
                {inc.status}
              </span>
            </div>
          ))}
          {incidents.length === 0 && <p className={styles.empty}>No incidents reported.</p>}
        </div>

        <div className="card">
          <h3 className={styles.cardTitle}>User Roles Breakdown</h3>
          {(["admin", "ranger", "user"] as const).map((role) => {
            const count = users.filter((u) => u.role === role).length;
            const pct = users.length > 0 ? Math.round((count / users.length) * 100) : 0;
            const colors: Record<string, string> = { admin: "#e05252", ranger: "#c9872f", user: "#3da066" };
            return (
              <div key={role} className={styles.roleBar}>
                <div className={styles.roleLabel}>
                  <span style={{ textTransform: "capitalize" }}>{role}</span>
                  <span className={styles.roleCount}>{count}</span>
                </div>
                <div className={styles.roleTrack}>
                  <div
                    className={styles.roleFill}
                    style={{ width: `${pct}%`, background: colors[role] }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
