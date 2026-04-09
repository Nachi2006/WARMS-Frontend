"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { saveToken } from "@/lib/auth";
import { jwtDecode } from "jwt-decode";
import type { Token } from "@/types";
import styles from "./auth.module.css";

interface JwtPayload {
  sub: string;
  role: string;
  exp: number;
}

const ROLE_HOME: Record<string, string> = {
  admin: "/admin/dashboard",
  ranger: "/ranger/dashboard",
  user: "/visitor/dashboard",
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api.post<Token>("/auth/login", { email, password });
      saveToken(data.access_token);
      document.cookie = `warms_token=${data.access_token}; path=/; max-age=${60 * 60 * 8}; SameSite=Lax`;
      const payload = jwtDecode<JwtPayload>(data.access_token);
      router.replace(ROLE_HOME[payload.role] ?? "/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <div className={styles.authLogo}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="24" fill="rgba(45,125,79,0.2)" />
            <path d="M24 10C24 10 14 18 14 27C14 32.5 18.5 37 24 37C29.5 37 34 32.5 34 27C34 18 24 10 24 10Z" fill="#3da066" opacity="0.8" />
            <path d="M24 14C24 14 20 20 20 26C20 28.8 21.8 31 24 31C26.2 31 28 28.8 28 26C28 20 24 14 24 14Z" fill="#5bbf84" />
          </svg>
        </div>
        <h1 className={styles.authTitle}>Welcome to WARMS</h1>
        <p className={styles.authSubtitle}>
          Wildlife Administration & Reserve Management System
        </p>

        <form onSubmit={handleSubmit} className={styles.authForm}>
          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          <button
            id="login-submit"
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: "100%", padding: "13px" }}
          >
            {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : "Sign In"}
          </button>
        </form>

        <p className={styles.authFooter}>
          Don&apos;t have an account?{" "}
          <Link href="/signup">Create one</Link>
        </p>
      </div>
    </div>
  );
}
