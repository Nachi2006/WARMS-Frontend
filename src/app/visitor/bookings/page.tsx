"use client";
import { useState } from "react";
import { useBookings } from "@/hooks/useBookings";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { QRCodeSVG } from "qrcode.react";
import type { BookingResponse } from "@/types";
import styles from "./bookings.module.css";

function formatDT(dt: string) {
  return new Date(dt).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "confirmed" ? "badge-success" :
    status === "cancelled" ? "badge-danger" : "badge-warning";
  return <span className={`badge ${cls}`}>{status}</span>;
}

export default function BookingsPage() {
  const { bookings, isLoading, mutate } = useBookings();
  const { user } = useAuth();
  const [qrTarget, setQrTarget] = useState<BookingResponse | null>(null);
  const [form, setForm] = useState({ location: "", start_time: "", end_time: "" });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!user) { setError("Could not load your profile — please refresh."); return; }
    setCreating(true);
    try {
      await api.post("/user/booking", {
        user_id: user.id,
        location: form.location,
        start_time: new Date(form.start_time).toISOString(),
        end_time: new Date(form.end_time).toISOString(),
      });
      setSuccess("Booking created!");
      setForm({ location: "", start_time: "", end_time: "" });
      mutate();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create booking");
    } finally {
      setCreating(false);
    }
  }

  async function handleCancel(id: number) {
    if (!confirm("Cancel this booking?")) return;
    try {
      await api.delete(`/user/booking/${id}`);
      mutate();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to cancel");
    }
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">My Bookings</h1>
        <p className="page-subtitle">Reserve your visit slot and track existing reservations</p>
      </div>

      <div className={styles.layout}>
        <div className="card">
          <h2 style={{ fontFamily: "Outfit", fontWeight: 700, fontSize: 18, marginBottom: 20 }}>
            New Reservation
          </h2>
          <form onSubmit={handleCreate}>
            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            <div className="form-group">
              <label className="form-label">Location</label>
              <input
                type="text"
                placeholder="e.g. North Gate, Safari Zone A"
                value={form.location}
                onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Start Date & Time</label>
              <input
                type="datetime-local"
                value={form.start_time}
                onChange={(e) => setForm((p) => ({ ...p, start_time: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">End Date & Time</label>
              <input
                type="datetime-local"
                value={form.end_time}
                onChange={(e) => setForm((p) => ({ ...p, end_time: e.target.value }))}
                required
              />
            </div>
            <button
              id="create-booking-btn"
              type="submit"
              className="btn-primary"
              style={{ width: "100%" }}
              disabled={creating || !user}
            >
              {creating ? <span className="spinner" style={{ width: 16, height: 16 }} /> : "Book Now"}
            </button>
          </form>
        </div>

        <div>
          {isLoading && (
            <div className="loading-state"><div className="spinner" /><span>Loading…</span></div>
          )}
          {!isLoading && bookings.length === 0 && (
            <div className="empty-state">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <p>No bookings yet. Create your first reservation!</p>
            </div>
          )}
          <div className={styles.bookingList}>
            {bookings.map((b) => (
              <div key={b.id} className={`card ${styles.bookingCard}`}>
                <div className={styles.bookingHeader}>
                  <span className={styles.bookingLocation}>{b.location}</span>
                  <StatusBadge status={b.status} />
                </div>
                <div className={styles.bookingTimes}>
                  <span>🗓 {formatDT(b.start_time)}</span>
                  <span>→</span>
                  <span>{formatDT(b.end_time)}</span>
                </div>
                <div className={styles.bookingActions}>
                  {b.qr_code_data && (
                    <button
                      id={`show-qr-${b.id}`}
                      className="btn-secondary"
                      onClick={() => setQrTarget(b)}
                    >
                      Show QR Code
                    </button>
                  )}
                  {b.status !== "cancelled" && (
                    <button
                      id={`cancel-booking-${b.id}`}
                      className="btn-danger"
                      onClick={() => handleCancel(b.id)}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {qrTarget && (
        <div className="modal-overlay" onClick={() => setQrTarget(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Entry QR Code</h2>
              <button className="modal-close" onClick={() => setQrTarget(null)}>✕</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <div style={{ background: "white", padding: 16, borderRadius: 12 }}>
                <QRCodeSVG
                  value={`${typeof window !== "undefined" ? window.location.origin : ""}/verify-booking?data=${encodeURIComponent(qrTarget.qr_code_data!)}`}
                  size={200}
                />
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: 13, textAlign: "center" }}>
                Present this QR code at {qrTarget.location} on{" "}
                {formatDT(qrTarget.start_time)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
