"use client";
import { useState, useRef } from "react";
import { api } from "@/lib/api";
import type { SpeciesResult } from "@/types";
import styles from "./species.module.css";

export default function SpeciesPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<SpeciesResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(f: File) {
    setFile(f);
    setResult(null);
    setError("");
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  async function handleIdentify() {
    if (!file) return;
    setLoading(true);
    setError("");
    setResult(null);
    const fd = new FormData();
    fd.append("image", file);
    try {
      const data = await api.postForm<SpeciesResult>("/species/identify-species", fd);
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Identification failed");
    } finally {
      setLoading(false);
    }
  }

  const confidence = result ? Math.round(result.confidence * 100) : 0;

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Species Identification</h1>
        <p className="page-subtitle">Upload a wildlife photo to identify the species using AI</p>
      </div>

      <div className={styles.layout}>
        <div className="card">
          <div
            id="species-drop-zone"
            className={`${styles.dropZone} ${dragging ? styles.dragging : ""} ${preview ? styles.hasPreview : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            {preview ? (
              <img src={preview} alt="preview" className={styles.previewImg} />
            ) : (
              <>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <p className={styles.dropText}>Drag & drop an image here</p>
                <p className={styles.dropSub}>or click to browse — JPEG, PNG, WEBP</p>
              </>
            )}
          </div>

          <input
            ref={inputRef}
            id="species-file-input"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            style={{ display: "none" }}
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />

          {file && (
            <p className={styles.fileName}>📎 {file.name}</p>
          )}

          {error && <div className="alert alert-error">{error}</div>}

          <button
            id="identify-species-btn"
            className="btn-primary"
            onClick={handleIdentify}
            disabled={!file || loading}
            style={{ width: "100%", marginTop: 12, padding: "13px" }}
          >
            {loading ? (
              <>
                <span className="spinner" style={{ width: 16, height: 16, display: "inline-block", marginRight: 8 }} />
                Analyzing…
              </>
            ) : "Identify Species"}
          </button>
        </div>

        <div>
          {!result && !loading && (
            <div className={styles.placeholder}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <p>Upload an image and click Identify to see results</p>
            </div>
          )}

          {loading && (
            <div className={styles.placeholder}>
              <div className="spinner" style={{ width: 40, height: 40 }} />
              <p>Running AI inference… this may take up to 30s</p>
            </div>
          )}

          {result && (
            <div className={`card ${styles.resultCard} fade-in`}>
              <div className={styles.resultHeader}>
                <span className="badge badge-success">Identified</span>
              </div>
              <h2 className={styles.speciesName}>{result.species}</h2>
              <p className={styles.speciesSub}>Filename: {result.filename}</p>

              <div className={styles.confidenceWrap}>
                <div className={styles.confidenceLabel}>
                  <span>Confidence</span>
                  <span className={styles.confidenceVal}>{confidence}%</span>
                </div>
                <div className={styles.confidenceBar}>
                  <div
                    className={styles.confidenceFill}
                    style={{
                      width: `${confidence}%`,
                      background: confidence > 70
                        ? "linear-gradient(90deg, var(--forest-600), var(--forest-400))"
                        : confidence > 40
                        ? "linear-gradient(90deg, var(--gold-500), var(--gold-300))"
                        : "linear-gradient(90deg, var(--danger-dark), var(--danger))",
                    }}
                  />
                </div>
              </div>

              {confidence < 40 && (
                <div className="alert alert-error" style={{ marginTop: 16 }}>
                  Low confidence result — consider retaking the photo in better lighting.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
