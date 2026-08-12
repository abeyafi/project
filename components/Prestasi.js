"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAdmin } from "../hooks/useAdmin";
import EditableText from "./EditableText";

const RANK_CLASSES = ["gold", "silver", "outline"];

export default function Prestasi() {
  const { isAdmin } = useAdmin();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const { data } = await supabase
      .from("prestasi")
      .select("*")
      .order("sort_order", { ascending: true });
    setRows(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateField(id, field, value) {
    await supabase.from("prestasi").update({ [field]: value }).eq("id", id);
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  }

  function cycleRankClass(id, current) {
    const idx = RANK_CLASSES.indexOf(current);
    const next = RANK_CLASSES[(idx + 1) % RANK_CLASSES.length];
    updateField(id, "rank_class", next);
  }

  async function addRow() {
    const { data } = await supabase
      .from("prestasi")
      .insert({
        year: "2026",
        rank: "Juara 1",
        rank_class: "gold",
        title: "Nama prestasi",
        competition: "Nama kompetisi",
        level: "Nasional",
        sort_order: rows.length,
      })
      .select()
      .single();
    if (data) setRows((prev) => [...prev, data]);
  }

  async function removeRow(id) {
    if (!confirm("Hapus baris prestasi ini?")) return;
    await supabase.from("prestasi").delete().eq("id", id);
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  if (loading) return null;

  return (
    <section className="prestasi" id="prestasi">
      <div className="prestasi-inner">
        <div className="bso-head">
          <span className="section-eyebrow on-paper">Prestasi</span>
          <h2 className="section-title on-paper reveal">Rekam jejak juara RISPI</h2>
          <p className="section-sub on-paper reveal reveal-delay-1">
            Catatan pencapaian anggota di kompetisi karya tulis, debat, dan
            pendanaan riset.
          </p>
        </div>

        <div className="ledger reveal">
          <div className="ledger-head">
            <span>Tahun</span>
            <span>Prestasi</span>
            <span>Kompetisi</span>
            <span>Tingkat</span>
          </div>
          {rows.map((row) => (
            <div className={`ledger-row${isAdmin ? " admin-row" : ""}`} key={row.id}>
              <EditableText
                as="div"
                className="ledger-year"
                value={row.year}
                isAdmin={isAdmin}
                onSave={(v) => updateField(row.id, "year", v)}
              />
              <div className="ledger-title">
                <span className={`rank-badge ${row.rank_class}`}>
                  {isAdmin ? (
                    <>
                      <button
                        type="button"
                        className="rank-color-dot"
                        onClick={() => cycleRankClass(row.id, row.rank_class)}
                        title="Klik untuk ganti warna badge"
                        aria-label="Ganti warna badge"
                      />
                      <EditableText
                        value={row.rank}
                        isAdmin={isAdmin}
                        onSave={(v) => updateField(row.id, "rank", v)}
                      />
                    </>
                  ) : (
                    row.rank
                  )}
                </span>
                <EditableText
                  value={row.title}
                  isAdmin={isAdmin}
                  onSave={(v) => updateField(row.id, "title", v)}
                />
              </div>
              <EditableText
                as="div"
                className="ledger-comp"
                value={row.competition}
                isAdmin={isAdmin}
                onSave={(v) => updateField(row.id, "competition", v)}
              />
              <EditableText
                as="div"
                className="ledger-level"
                value={row.level}
                isAdmin={isAdmin}
                onSave={(v) => updateField(row.id, "level", v)}
              />
              {isAdmin && (
                <button
                  className="edit-btn small danger"
                  onClick={() => removeRow(row.id)}
                >
                  Hapus
                </button>
              )}
            </div>
          ))}
        </div>

        {isAdmin && (
          <div className="admin-add-card">
            <button className="edit-btn" onClick={addRow}>
              + Tambah prestasi
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
