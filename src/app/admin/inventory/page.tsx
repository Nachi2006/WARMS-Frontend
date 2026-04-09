"use client";
import { useState } from "react";
import { useInventory } from "@/hooks/useInventory";
import { api } from "@/lib/api";
import type { InventoryItemCreate, InventoryItemUpdate, InventoryItemResponse, ItemCategory, ItemStatus } from "@/types";
import styles from "./inventory.module.css";

const CATEGORIES: ItemCategory[] = ["vehicle", "radio", "trap", "other"];
const STATUSES: ItemStatus[] = ["available", "in_use", "maintenance", "decommissioned"];
const STATUS_CLASS: Record<string, string> = {
  available: "badge-success",
  in_use: "badge-info",
  maintenance: "badge-warning",
  decommissioned: "badge-danger",
};

const EMPTY_FORM: InventoryItemCreate = {
  name: "", category: "other", quantity: 1, status: "available", location: ""
};

export default function InventoryPage() {
  const { items, isLoading, mutate } = useInventory();
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editTarget, setEditTarget] = useState<InventoryItemResponse | null>(null);
  const [form, setForm] = useState<InventoryItemCreate>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function openCreate() {
    setForm(EMPTY_FORM);
    setEditTarget(null);
    setError("");
    setModal("create");
  }

  function openEdit(item: InventoryItemResponse) {
    setForm({ name: item.name, category: item.category, quantity: item.quantity, status: item.status, location: item.location ?? "" });
    setEditTarget(item);
    setError("");
    setModal("edit");
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (modal === "create") {
        await api.post("/inventory", form);
      } else if (editTarget) {
        const update: InventoryItemUpdate = { ...form };
        await api.put(`/inventory/${editTarget.id}`, update);
      }
      mutate();
      setModal(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this inventory item permanently?")) return;
    try {
      await api.delete(`/inventory/${id}`);
      mutate();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 className="page-title">Inventory Control</h1>
            <p className="page-subtitle">Manage reserve equipment, vehicles, and field assets</p>
          </div>
          <button id="add-item-btn" className="btn-primary" onClick={openCreate}>+ Add Item</button>
        </div>
      </div>

      {isLoading && <div className="loading-state"><div className="spinner" /><span>Loading inventory…</span></div>}

      {!isLoading && items.length === 0 && (
        <div className="empty-state">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          </svg>
          <p>No inventory items. Add your first item.</p>
        </div>
      )}

      {!isLoading && items.length > 0 && (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Qty</th>
                <th>Status</th>
                <th>Location</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 600 }}>{item.name}</td>
                  <td>
                    <span className="tag">{item.category}</span>
                  </td>
                  <td style={{ fontFamily: "Outfit", fontSize: 16, fontWeight: 700 }}>{item.quantity}</td>
                  <td>
                    <span className={`badge ${STATUS_CLASS[item.status] ?? "badge-neutral"}`}>
                      {item.status.replace("_", " ")}
                    </span>
                  </td>
                  <td style={{ color: "var(--text-muted)", fontSize: 13 }}>{item.location ?? "—"}</td>
                  <td>
                    <div className={styles.actions}>
                      <button id={`edit-item-${item.id}`} className="btn-icon" onClick={() => openEdit(item)}>✏ Edit</button>
                      <button id={`delete-item-${item.id}`} className="btn-icon" onClick={() => handleDelete(item.id)} style={{ color: "var(--danger)" }}>🗑 Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{modal === "create" ? "Add Item" : "Edit Item"}</h2>
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              {error && <div className="alert alert-error">{error}</div>}
              <div className="form-group">
                <label className="form-label">Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value as ItemCategory }))}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as ItemStatus }))}>
                    {STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Quantity</label>
                  <input type="number" min={0} value={form.quantity} onChange={(e) => setForm((p) => ({ ...p, quantity: parseInt(e.target.value) }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input type="text" value={form.location ?? ""} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setModal(null)}>Cancel</button>
                <button id="save-item-btn" type="submit" className="btn-primary" style={{ flex: 1 }} disabled={saving}>
                  {saving ? <span className="spinner" style={{ width: 16, height: 16 }} /> : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
