"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import type { UserResponse } from "@/types";
import styles from "../login/auth.module.css";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "user" as "user" | "ranger" | "admin",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post<UserResponse>("/auth/signup", form);
      router.push("/login");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Signup failed");
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
        <h1 className={styles.authTitle}>Create Account</h1>
        <p className={styles.authSubtitle}>Join the WARMS platform</p>

        <form onSubmit={handleSubmit} className={styles.authForm}>
          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-group">
            <label className="form-label" htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              value={form.username}
              onChange={handleChange}
              placeholder="john_doe"
              required
              minLength={3}
              maxLength={50}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Min. 8 characters"
              required
              minLength={8}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="role">Role</label>
            <select id="role" name="role" value={form.role} onChange={handleChange}>
              <option value="user">Visitor</option>
              <option value="ranger">Ranger</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            id="signup-submit"
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: "100%", padding: "13px" }}
          >
            {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : "Create Account"}
          </button>
        </form>

        <p className={styles.authFooter}>
          Already have an account?{" "}
          <Link href="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
