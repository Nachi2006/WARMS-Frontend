"use client";
import { useState } from "react";
import { api } from "@/lib/api";
import type { SosResponse } from "@/types";
import styles from "./sos.module.css";

export default function SOSPage() {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<SosResponse | null>(null);
  const [error, setError] = useState("");

  async function handleSOS() {
    if (!confirm("🚨 Send emergency SOS alert? This will notify all admins and rangers immediately.")) return;
    setSending(true);
    setError("");
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 })
      );
      const data = await api.post<SosResponse>("/ranger/sos", {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
      setSent(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "SOS failed — check GPS permissions");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Emergency SOS</h1>
        <p className={styles.subtitle}>
          Press the button to broadcast your GPS location to all rangers and administrators instantly
        </p>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: 24, width: "100%" }}>
          {error}
        </div>
      )}

      {sent ? (
        <div className={`card ${styles.sentCard} fade-in`}>
          <div className={styles.sentIcon}>✓</div>
          <h2 className={styles.sentTitle}>SOS Alert Sent!</h2>
          <p className={styles.sentSub}>Alert #{sent.id} · Help is on the way</p>
          <div className={styles.sentCoords}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
            </svg>
            {sent.latitude.toFixed(5)}, {sent.longitude.toFixed(5)}
          </div>
          <button
            className="btn-secondary"
            style={{ marginTop: 16, width: "100%" }}
            onClick={() => setSent(null)}
          >
            Send Another Alert
          </button>
        </div>
      ) : (
        <div className={styles.btnWrap}>
          <div className={styles.sosRings}>
            {!sending && (
              <>
                <div className={styles.sosRing} />
                <div className={styles.sosRing} />
                <div className={styles.sosRing} />
              </>
            )}
            <button
              id="sos-btn"
              className={`${styles.sosBtn} ${sending ? styles.sending : "pulse-sos"}`}
              onClick={handleSOS}
              disabled={sending}
              aria-label="Send Emergency SOS"
            >
              {sending ? (
                <div
                  className="spinner"
                  style={{
                    width: 44,
                    height: 44,
                    borderColor: "rgba(255,255,255,0.25)",
                    borderTopColor: "white",
                    borderWidth: 3,
                  }}
                />
              ) : (
                <>
                  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span className={styles.sosBtnText}>SOS</span>
                  <span className={styles.sosBtnSub}>Emergency</span>
                </>
              )}
            </button>
          </div>

          <p className={styles.sosHint}>
            {sending ? (
              <>📡 Getting your GPS location…</>
            ) : (
              <>Tap to activate emergency alert</>
            )}
          </p>
        </div>
      )}

      <div className={styles.infoCards}>
        <div className={`card ${styles.infoCard}`}>
          <div className={styles.infoIcon}>📡</div>
          <div>
            <div className={styles.infoTitle}>GPS Required</div>
            <div className={styles.infoSub}>Allow location access before sending alert</div>
          </div>
        </div>
        <div className={`card ${styles.infoCard}`}>
          <div className={styles.infoIcon}>📢</div>
          <div>
            <div className={styles.infoTitle}>Instant Broadcast</div>
            <div className={styles.infoSub}>All rangers and admins notified immediately</div>
          </div>
        </div>
        <div className={`card ${styles.infoCard}`}>
          <div className={styles.infoIcon}>🔒</div>
          <div>
            <div className={styles.infoTitle}>Confirmation Required</div>
            <div className={styles.infoSub}>You&apos;ll be asked to confirm before sending</div>
          </div>
        </div>
      </div>
    </div>
  );
}
