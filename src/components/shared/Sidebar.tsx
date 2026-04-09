"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearToken } from "@/lib/auth";
import styles from "./Sidebar.module.css";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  title: string;
  subtitle: string;
  navItems: NavItem[];
  accentClass?: string;
}

export default function Sidebar({ title, subtitle, navItems, accentClass }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    clearToken();
    document.cookie = "warms_token=; path=/; max-age=0";
    router.push("/login");
  }

  return (
    <aside className={`${styles.sidebar} ${accentClass ?? ""}`}>
      <div className={styles.brand}>
        <div className={styles.brandIcon}>
          <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="24" fill="rgba(45,125,79,0.25)" />
            <path d="M24 10C24 10 14 18 14 27C14 32.5 18.5 37 24 37C29.5 37 34 32.5 34 27C34 18 24 10 24 10Z" fill="#3da066" opacity="0.9" />
            <path d="M24 14C24 14 20 20 20 26C20 28.8 21.8 31 24 31C26.2 31 28 28.8 28 26C28 20 24 14 24 14Z" fill="#5bbf84" />
          </svg>
        </div>
        <div>
          <div className={styles.brandName}>{title}</div>
          <div className={styles.brandRole}>{subtitle}</div>
        </div>
      </div>

      <nav className={styles.nav}>
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${active ? styles.navItemActive : ""}`}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <button className={styles.logoutBtn} onClick={handleLogout} id="logout-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        Sign Out
      </button>
    </aside>
  );
}
