"use client";
import { useState } from "react";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { api } from "@/lib/api";
import type { UserRole } from "@/types";
import styles from "./users.module.css";

const ROLES: UserRole[] = ["user", "ranger", "admin"];

export default function UsersPage() {
  const { users, isLoading, mutate } = useAdminUsers();
  const [roleUpdating, setRoleUpdating] = useState<number | null>(null);

  async function handleRoleChange(userId: number, role: UserRole) {
    setRoleUpdating(userId);
    try {
      await api.patch(`/admin/users/${userId}/role`, { role });
      mutate();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to update role");
    } finally {
      setRoleUpdating(null);
    }
  }

  async function handleUnlock(userId: number) {
    if (!confirm("Unlock this account?")) return;
    try {
      await api.patch(`/admin/users/${userId}/unlock`, {});
      mutate();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to unlock");
    }
  }

  async function handleDeactivate(userId: number) {
    if (!confirm("Deactivate this account? The user will lose access.")) return;
    try {
      await api.patch(`/admin/users/${userId}/deactivate`, {});
      mutate();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to deactivate");
    }
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">User Management</h1>
        <p className="page-subtitle">Manage roles, unlock accounts, and control access</p>
      </div>

      {isLoading && (
        <div className="loading-state"><div className="spinner" /><span>Loading users…</span></div>
      )}

      {!isLoading && (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td style={{ color: "var(--text-muted)" }}>#{u.id}</td>
                  <td style={{ fontWeight: 600 }}>{u.username}</td>
                  <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>{u.email}</td>
                  <td>
                    <select
                      id={`role-select-${u.id}`}
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                      disabled={roleUpdating === u.id}
                      className={styles.roleSelect}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <div className={styles.statusWrap}>
                      {!u.is_active && <span className="badge badge-danger">Inactive</span>}
                      {u.is_locked && <span className="badge badge-warning">Locked</span>}
                      {u.is_active && !u.is_locked && <span className="badge badge-success">Active</span>}
                    </div>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      {u.is_locked && (
                        <button
                          id={`unlock-${u.id}`}
                          className="btn-icon"
                          onClick={() => handleUnlock(u.id)}
                          title="Unlock Account"
                        >
                          🔓 Unlock
                        </button>
                      )}
                      {u.is_active && (
                        <button
                          id={`deactivate-${u.id}`}
                          className="btn-icon"
                          onClick={() => handleDeactivate(u.id)}
                          title="Deactivate Account"
                          style={{ color: "var(--danger)" }}
                        >
                          🚫 Deactivate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
