"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAdmin } from "../hooks/useAdmin";
import EditableText from "./EditableText";
import { logActivity } from "../lib/activityLog";

export default function Publikasi() {
  const { isAdmin } = useAdmin();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    // RLS sudah membatasi: penonton hanya dapat baris status='published',
    // admin (session login) dapat melihat semuanya termasuk draft/archived.
    const { data } = await supabase
      .from("publikasi")
      .select("*")
      .order("sort_order", { ascending: true });
    setRows(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateField(id, field, value) {
    await supabase.from("publikasi").update({ [field]: value }).eq("id", id);
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  }

  async function addRow() {
    const { data } = await supabase
      .from("publikasi")
      .insert({
        title: "Judul naskah baru",
        meta: "Tim Penelitian & Keilmiahan · 2026",
        badge: "SINTA 3",
        status: "draft",
        sort_order: rows.length,
      })
      .select()
      .single();
    if (data) {
      setRows((prev) => [...prev, data]);
      logActivity({ action: "create", entityType: "publikasi", entityId: data.id, description: "Menambah draft publikasi baru" });
    }
  }

  async function setStatus(row, status) {
    const patch = { status };
    if (status === "published") patch.published_at = new Date().toISOString();
    await supabase.from("publikasi").update(patch).eq("id", row.id);
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, ...patch } : r)));
    logActivity({
      action: status === "published" ? "publish" : status === "archived" ? "archive" : "unpublish",
      entityType: "publikasi",
      entityId: row.id,
      description: `${status === "published" ? "Mempublish" : status === "archived" ? "Mengarsipkan" : "Unpublish"} publikasi: ${row.title}`,
    });
  }

  async function removeRow(id) {
    if (!confirm("Hapus naskah ini?")) return;
    await supabase.from("publikasi").delete().eq("id", id);
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  if (loading) return null;

  return (
    <section className="publikasi" id="publikasi">
      <div className="publikasi-inner">
        <div className="publikasi-head">
          <div>
            <span className="section-eyebrow on-navy">Publikasi</span>
            <h2 className="section-title reveal">Naskah yang telah kami dampingi</h2>
          </div>
          <p className="section-sub publikasi-sub reveal reveal-delay-1">
            Sebagian karya anggota RISPI yang lolos publikasi dan kompetisi
            nasional.
          </p>
        </div>

        <div className="pub-list">
          {rows.map((row, i) => (
            <article
              className={`pub-entry reveal${i ? ` reveal-delay-${Math.min(i, 3)}` : ""}`}
              key={row.id}
            >
              <div className="pub-index">{String(i + 1).padStart(2, "0")}</div>
              <div>
                {isAdmin && row.status && row.status !== "published" && (
                  <span className={`status-badge ${row.status}`} style={{ marginBottom: 6, display: "inline-block" }}>
                    {row.status}
                  </span>
                )}
                <EditableText
                  as="div"
                  className="pub-title"
                  value={row.title}
                  isAdmin={isAdmin}
                  multiline
                  onSave={(v) => updateField(row.id, "title", v)}
                />
                <EditableText
                  as="div"
                  className="pub-meta"
                  value={row.meta}
                  isAdmin={isAdmin}
                  onSave={(v) => updateField(row.id, "meta", v)}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                <EditableText
                  as="div"
                  className="pub-badge"
                  value={row.badge}
                  isAdmin={isAdmin}
                  onSave={(v) => updateField(row.id, "badge", v)}
                />
                {isAdmin && (
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
                    {row.status !== "published" && (
                      <button className="edit-btn small" onClick={() => setStatus(row, "published")}>
                        Publish
                      </button>
                    )}
                    {row.status === "published" && (
                      <button className="edit-btn small outline" onClick={() => setStatus(row, "draft")}>
                        Unpublish
                      </button>
                    )}
                    <button className="edit-btn small danger" onClick={() => removeRow(row.id)}>
                      Hapus
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>

        {isAdmin && (
          <div className="admin-add-card">
            <button className="edit-btn" onClick={addRow}>
              + Tambah publikasi
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
