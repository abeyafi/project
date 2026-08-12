"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAdmin } from "../hooks/useAdmin";
import EditableText from "./EditableText";
import EditablePhoto from "./EditablePhoto";
import SectionSkeleton from "./SectionSkeleton";

export default function Divisi() {
  const { isAdmin } = useAdmin();
  const [pimpinan, setPimpinan] = useState([]);
  const [bidangList, setBidangList] = useState([]);
  const [anggotaMap, setAnggotaMap] = useState({});
  const [loading, setLoading] = useState(true);

  async function load() {
    const [{ data: p }, { data: b }, { data: a }] = await Promise.all([
      supabase.from("pimpinan_inti").select("*").order("sort_order"),
      supabase.from("bidang").select("*").order("sort_order"),
      supabase.from("bidang_anggota").select("*").order("sort_order"),
    ]);
    setPimpinan(p || []);
    setBidangList(b || []);
    const map = {};
    (a || []).forEach((row) => {
      map[row.bidang_id] = map[row.bidang_id] || [];
      map[row.bidang_id].push(row);
    });
    setAnggotaMap(map);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function updatePimpinan(id, field, value) {
    await supabase.from("pimpinan_inti").update({ [field]: value }).eq("id", id);
    setPimpinan((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  }
  async function addPimpinan() {
    const { data } = await supabase
      .from("pimpinan_inti")
      .insert({ name: "Nama", role: "Jabatan", sort_order: pimpinan.length })
      .select()
      .single();
    if (data) setPimpinan((prev) => [...prev, data]);
  }
  async function removePimpinan(id) {
    if (!confirm("Hapus dari pimpinan inti?")) return;
    await supabase.from("pimpinan_inti").delete().eq("id", id);
    setPimpinan((prev) => prev.filter((p) => p.id !== id));
  }

  async function updateBidang(id, field, value) {
    await supabase.from("bidang").update({ [field]: value }).eq("id", id);
    setBidangList((prev) => prev.map((b) => (b.id === id ? { ...b, [field]: value } : b)));
  }

  async function addAnggota(bidangId) {
    const { data } = await supabase
      .from("bidang_anggota")
      .insert({ bidang_id: bidangId, name: "Nama anggota", sort_order: (anggotaMap[bidangId]?.length || 0) })
      .select()
      .single();
    if (data) {
      setAnggotaMap((prev) => ({
        ...prev,
        [bidangId]: [...(prev[bidangId] || []), data],
      }));
    }
  }
  async function updateAnggota(bidangId, id, value) {
    await supabase.from("bidang_anggota").update({ name: value }).eq("id", id);
    setAnggotaMap((prev) => ({
      ...prev,
      [bidangId]: prev[bidangId].map((m) => (m.id === id ? { ...m, name: value } : m)),
    }));
  }
  async function removeAnggota(bidangId, id) {
    await supabase.from("bidang_anggota").delete().eq("id", id);
    setAnggotaMap((prev) => ({
      ...prev,
      [bidangId]: prev[bidangId].filter((m) => m.id !== id),
    }));
  }

  if (loading) return <SectionSkeleton theme="paper" minHeight={640} />;

  return (
    <section className="divisi" id="divisi">
      <div className="divisi-inner">
        <div className="bso-head">
          <span className="section-eyebrow on-paper">Struktur</span>
          <h2 className="section-title on-paper reveal">Pengurus dan bidang</h2>
          <p className="section-sub on-paper reveal reveal-delay-1">
            Tiga bidang menjalankan program kerja RISPI di bawah koordinasi
            pimpinan inti.
          </p>
        </div>

        <div className="anggota-sub" style={{ marginTop: 0 }}>
          <div className="anggota-head">
            <h3 className="reveal">Pimpinan inti</h3>
            <span className="reveal">Periode 2026/2027</span>
          </div>
          <div className="anggota-grid reveal">
            {pimpinan.map((m) => (
              <div className="anggota-card" key={m.id}>
                <div className="anggota-avatar">
                  <EditablePhoto
                    className="avatar-photo-inner"
                    url={m.photo_url}
                    alt={m.name}
                    isAdmin={isAdmin}
                    pathPrefix="members"
                    aspect={1}
                    entityType="pimpinan_inti"
                    entityId={m.id}
                    onSaved={(url) => updatePimpinan(m.id, "photo_url", url)}
                  />
                  <span className="initial-badge">{(m.name || "?")[0]}</span>
                </div>
                <EditableText
                  as="div"
                  className="anggota-name"
                  value={m.name}
                  isAdmin={isAdmin}
                  onSave={(v) => updatePimpinan(m.id, "name", v)}
                />
                <EditableText
                  as="div"
                  className="anggota-role"
                  value={m.role}
                  isAdmin={isAdmin}
                  onSave={(v) => updatePimpinan(m.id, "role", v)}
                />
                {isAdmin && (
                  <button className="edit-btn small danger" onClick={() => removePimpinan(m.id)}>
                    Hapus
                  </button>
                )}
              </div>
            ))}
          </div>
          {isAdmin && (
            <div className="admin-add-card">
              <button className="edit-btn" onClick={addPimpinan}>
                + Tambah pimpinan inti
              </button>
            </div>
          )}
        </div>

        <div className="anggota-sub">
          <div className="anggota-head">
            <h3 className="reveal">Bidang</h3>
          </div>
          <div className="div-grid reveal">
            {bidangList.map((b) => (
              <div className="div-card" key={b.id}>
                <div className="div-top">
                  <div className="div-index">{b.index_no}</div>
                  <EditablePhoto
                    className="div-photo"
                    url={b.photo_url}
                    alt={b.title}
                    isAdmin={isAdmin}
                    pathPrefix="bidang"
                    aspect={1}
                    entityType="bidang"
                    entityId={b.id}
                    onSaved={(url) => updateBidang(b.id, "photo_url", url)}
                  />
                </div>
                <EditableText
                  as="div"
                  className="div-title"
                  value={b.title}
                  isAdmin={isAdmin}
                  onSave={(v) => updateBidang(b.id, "title", v)}
                />
                <EditableText
                  as="div"
                  className="div-desc"
                  value={b.description}
                  isAdmin={isAdmin}
                  multiline
                  onSave={(v) => updateBidang(b.id, "description", v)}
                />
                <div className="div-ketua">
                  <span className="k-label">Ketua bidang</span>
                  <EditableText
                    className="k-name"
                    value={b.ketua}
                    isAdmin={isAdmin}
                    onSave={(v) => updateBidang(b.id, "ketua", v)}
                  />
                </div>
                <div className="div-anggota">
                  <span className="k-label">Anggota</span>
                  <ul>
                    {(anggotaMap[b.id] || []).map((m) => (
                      <li key={m.id}>
                        <EditableText
                          value={m.name}
                          isAdmin={isAdmin}
                          onSave={(v) => updateAnggota(b.id, m.id, v)}
                        />
                        {isAdmin && (
                          <button
                            className="edit-btn small danger"
                            style={{ marginLeft: 8 }}
                            onClick={() => removeAnggota(b.id, m.id)}
                          >
                            &times;
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                  {isAdmin && (
                    <button className="edit-btn small outline" onClick={() => addAnggota(b.id)}>
                      + Tambah anggota
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
