"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearToken } from "@/lib/auth";
import styles from "./ranger-layout.module.css";

const tabs = [
  {
    href: "/ranger/dashboard",
    label: "Sync",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="1 4 1 10 7 10" />
        <polyline points="23 20 23 14 17 14" />
        <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15" />
      </svg>
    ),
  },
  {
    href: "/ranger/incidents",
    label: "Incidents",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  {
    href: "/ranger/sos",
    label: "SOS",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
];

export default function RangerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    clearToken();
    document.cookie = "warms_token=; path=/; max-age=0";
    router.push("/login");
  }

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerBrand}>
          <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="24" fill="rgba(45,125,79,0.25)" />
            <path d="M24 10C24 10 14 18 14 27C14 32.5 18.5 37 24 37C29.5 37 34 32.5 34 27C34 18 24 10 24 10Z" fill="#3da066" opacity="0.9" />
            <path d="M24 14C24 14 20 20 20 26C20 28.8 21.8 31 24 31C26.2 31 28 28.8 28 26C28 20 24 14 24 14Z" fill="#5bbf84" />
          </svg>
          <span className={styles.headerTitle}>WARMS Ranger</span>
        </div>
        <button className={styles.logoutBtn} onClick={handleLogout} id="ranger-logout">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </header>

      <main className={styles.main}>{children}</main>

      <nav className={styles.bottomNav}>
        {tabs.map((t) => {
          const active = pathname.startsWith(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`${styles.tabItem} ${active ? styles.tabActive : ""} ${t.label === "SOS" ? styles.tabSos : ""}`}
            >
              {t.icon}
              <span className={styles.tabLabel}>{t.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
