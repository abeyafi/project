"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import EditableText from "../../../components/EditableText";
import EditablePhoto from "../../../components/EditablePhoto";
import { logActivity } from "../../../lib/activityLog";
import { slugify, uniqueSlugSuffix } from "../../../lib/slugify";

const FILTERS = [
  { key: "all", label: "Semua" },
  { key: "draft", label: "Draft" },
  { key: "published", label: "Published" },
  { key: "archived", label: "Archived" },
];

export default function AdminProgramPage() {
  const [divisions, setDivisions] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  async function load() {
    const [{ data: div }, { data: progs }] = await Promise.all([
      supabase.from("bidang").select("id, title, slug").order("sort_order"),
      supabase.from("programs").select("*").order("sort_order").order("created_at"),
    ]);
    setDivisions(div || []);
    setPrograms(progs || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function divisionTitle(id) {
    return divisions.find((d) => d.id === id)?.title || "(pilih divisi)";
  }

  async function updateField(id, field, value) {
    await supabase.from("programs").update({ [field]: value, updated_at: new Date().toISOString() }).eq("id", id);
    setPrograms((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  }

  async function addProgram() {
    if (divisions.length === 0) {
      alert("Belum ada data Divisi/Bidang. Tambahkan dulu di section Divisi.");
      return;
    }
    const title = "Nama program baru";
    const { data, error } = await supabase
      .from("programs")
      .insert({
        division_id: divisions[0].id,
        title,
        slug: `${slugify(title)}-${uniqueSlugSuffix()}`,
        status: "draft",
        sort_order: programs.length,
      })
      .select()
      .single();
    if (error) return alert(error.message);
    setPrograms((prev) => [...prev, data]);
    logActivity({ action: "create_program", entityType: "programs", entityId: data.id, description: `Membuat draft program: ${title}` });
  }

  async function setStatus(program, status) {
    await supabase.from("programs").update({ status, updated_at: new Date().toISOString() }).eq("id", program.id);
    setPrograms((prev) => prev.map((p) => (p.id === program.id ? { ...p, status } : p)));
    const actionMap = { published: "publish_program", draft: "unpublish_program", archived: "archive_program" };
    logActivity({
      action: actionMap[status] || "update_program",
      entityType: "programs",
      entityId: program.id,
      description: `Program "${program.title}" diubah status ke ${status}`,
    });
  }

  async function removeProgram(program) {
    if (!confirm(`Hapus program "${program.title}"? Program ini akan dihapus dari sistem.`)) return;
    await supabase.from("programs").delete().eq("id", program.id);
    setPrograms((prev) => prev.filter((p) => p.id !== program.id));
    logActivity({ action: "delete_program", entityType: "programs", entityId: program.id, description: `Menghapus program: ${program.title}` });
  }

  const filtered = filter === "all" ? programs : programs.filter((p) => p.status === filter);

  if (loading) return <div className="admin-loading">Memuat...</div>;

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <h1>Program Kerja</h1>
        <p>Kelola program kerja tiap divisi/bidang. Belum ada data dummy — isi setelah rapat kerja resmi.</p>
      </div>

      <button className="edit-btn" onClick={addProgram} style={{ marginBottom: 20 }}>
        + Tambah Program
      </button>

      <div className="admin-filter-row">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={`admin-filter-chip${filter === f.key ? " active" : ""}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="admin-section-block">
          <p className="admin-empty-note">Belum ada program kerja.</p>
        </div>
      ) : (
        <div className="admin-article-list">
          {filtered.map((p) => (
            <div className="admin-article-card" key={p.id}>
              <EditablePhoto
                className="admin-article-thumb"
                url={p.image_url}
                alt={p.title}
                isAdmin={true}
                pathPrefix="programs"
                aspect={16 / 9}
                cornerButton
                entityType="programs"
                entityId={p.id}
                onSaved={(url) => updateField(p.id, "image_url", url)}
              />
              <div className="admin-article-body">
                <div className="admin-article-top">
                  <span className={`status-badge ${p.status}`}>{p.status}</span>
                  {divisions.length > 0 && (
                    <a
                      href={`/program/${divisions.find((d) => d.id === p.division_id)?.slug || ""}/${p.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="admin-preview-link"
                    >
                      Preview &#8599;
                    </a>
                  )}
                </div>

                <EditableText
                  as="div"
                  className="admin-article-title"
                  value={p.title}
                  isAdmin={true}
                  onSave={(v) => updateField(p.id, "title", v)}
                />

                <label className="admin-select-label">
                  Divisi
                  <select
                    className="admin-select"
                    value={p.division_id || ""}
                    onChange={(e) => updateField(p.id, "division_id", e.target.value)}
                  >
                    {divisions.map((d) => (
                      <option key={d.id} value={d.id}>{d.title}</option>
                    ))}
                  </select>
                </label>

                <EditableText
                  as="div"
                  className="admin-article-excerpt"
                  value={p.description}
                  isAdmin={true}
                  multiline
                  placeholder="(deskripsi program)"
                  onSave={(v) => updateField(p.id, "description", v)}
                />
                <EditableText
                  as="div"
                  className="admin-article-excerpt"
                  value={p.objective}
                  isAdmin={true}
                  multiline
                  placeholder="(tujuan program)"
                  onSave={(v) => updateField(p.id, "objective", v)}
                />

                <div className="admin-article-meta-row" style={{ flexWrap: "wrap" }}>
                  <EditableText
                    value={p.person_in_charge}
                    isAdmin={true}
                    placeholder="(penanggung jawab)"
                    onSave={(v) => updateField(p.id, "person_in_charge", v)}
                  />
                  <label className="admin-date-label">
                    Mulai
                    <input
                      type="date"
                      className="admin-select"
                      value={p.start_date || ""}
                      onChange={(e) => updateField(p.id, "start_date", e.target.value)}
                    />
                  </label>
                  <label className="admin-date-label">
                    Selesai
                    <input
                      type="date"
                      className="admin-select"
                      value={p.end_date || ""}
                      onChange={(e) => updateField(p.id, "end_date", e.target.value)}
                    />
                  </label>
                </div>

                <div className="admin-article-actions">
                  {p.status !== "draft" && (
                    <button className="edit-btn small outline" onClick={() => setStatus(p, "draft")}>Jadikan Draft</button>
                  )}
                  {p.status !== "published" && (
                    <button className="edit-btn small" onClick={() => setStatus(p, "published")}>Publish</button>
                  )}
                  {p.status !== "archived" && (
                    <button className="edit-btn small outline" onClick={() => setStatus(p, "archived")}>Arsipkan</button>
                  )}
                  <button className="edit-btn small danger" onClick={() => removeProgram(p)}>Hapus</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
