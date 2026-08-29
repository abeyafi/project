"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAdmin } from "../hooks/useAdmin";
import { useConfirm } from "../hooks/useConfirm";
import EditableText from "./EditableText";
import EditablePhoto from "./EditablePhoto";
import Lightbox from "./Lightbox";
import SectionSkeleton from "./SectionSkeleton";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_BYTES = 8 * 1024 * 1024; // 8MB, sama seperti batas upload satuan

function monthYearLabel() {
  return new Date().toLocaleDateString("id-ID", { month: "long", year: "numeric" });
}

export default function Galeri() {
  const { isAdmin } = useAdmin();
  const { confirm, ConfirmDialog } = useConfirm();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null); // { index }
  const [bulkProgress, setBulkProgress] = useState(null); // { done, total }
  const bulkInputRef = useRef(null);

  async function load() {
    const { data } = await supabase
      .from("galeri")
      .select("*")
      .order("sort_order", { ascending: true })
      .limit(400);
    setItems(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateField(id, field, value) {
    await supabase.from("galeri").update({ [field]: value }).eq("id", id);
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, [field]: value } : it))
    );
  }

  async function addItem() {
    const { data } = await supabase
      .from("galeri")
      .insert({ title: "Judul baru", date_label: "2026", sort_order: items.length })
      .select()
      .single();
    if (data) setItems((prev) => [...prev, data]);
  }

  // Upload banyak foto sekaligus -- tanpa crop satu-satu (admin bisa
  // crop belakangan lewat tombol "Ganti" di tiap foto kalau perlu
  // presisi). Setiap file jadi satu baris galeri baru.
  async function handleBulkFiles(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (files.length === 0) return;

    const valid = [];
    const rejected = [];
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        rejected.push(`${file.name} (tipe file tidak didukung)`);
      } else if (file.size > MAX_SIZE_BYTES) {
        rejected.push(`${file.name} (lebih dari 8MB)`);
      } else {
        valid.push(file);
      }
    }
    if (rejected.length > 0) {
      alert("Sebagian file dilewati:\n" + rejected.join("\n"));
    }
    if (valid.length === 0) return;

    setBulkProgress({ done: 0, total: valid.length });
    const newRows = [];
    let sortOrder = items.length;

    for (const file of valid) {
      const ext = file.name.split(".").pop();
      const path = `galeri/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(path, file, { upsert: false, contentType: file.type });

      if (!uploadError) {
        const { data: urlData } = supabase.storage.from("media").getPublicUrl(path);
        const baseName = file.name.replace(/\.[^/.]+$/, "");
        const { data: row } = await supabase
          .from("galeri")
          .insert({
            title: baseName || "Foto kegiatan",
            date_label: monthYearLabel(),
            photo_url: urlData.publicUrl,
            sort_order: sortOrder++,
          })
          .select()
          .single();
        if (row) newRows.push(row);
      }
      setBulkProgress((prev) => ({ done: prev.done + 1, total: prev.total }));
    }

    setItems((prev) => [...prev, ...newRows]);
    setBulkProgress(null);
  }

  async function removeItem(id) {
    if (!(await confirm("Hapus foto ini dari galeri?"))) return;
    await supabase.from("galeri").delete().eq("id", id);
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  if (loading) return <SectionSkeleton theme="paper" minHeight={520} />;

  return (
    <section className="galeri" id="galeri">
      <div className="galeri-inner">
        <div className="bso-head">
          <span className="section-eyebrow on-paper">Galeri</span>
          <h2 className="section-title on-paper reveal">Momen kegiatan RISPI</h2>
          <p className="section-sub on-paper reveal reveal-delay-1">
            Dari kajian rutin, pelantikan, hingga simulasi lomba. Klik foto
            untuk lihat ukuran penuh.
          </p>
        </div>

        <div className="galeri-grid reveal">
          {items.map((item, i) => (
            <div className={`mount g${(i % 5) + 1}`} key={item.id}>
              <EditablePhoto
                className="mount-photo"
                url={item.photo_url}
                alt={item.title}
                isAdmin={isAdmin}
                pathPrefix="galeri"
                aspect={4 / 3}
                entityType="galeri"
                entityId={item.id}
                cornerButton
                onImageClick={() => setLightbox({ index: i })}
                onSaved={(url) => updateField(item.id, "photo_url", url)}
              />
              <div className="mount-cap">
                <EditableText
                  as="div"
                  className="t"
                  value={item.title}
                  isAdmin={isAdmin}
                  onSave={(v) => updateField(item.id, "title", v)}
                />
                <EditableText
                  as="div"
                  className="d"
                  value={item.date_label}
                  isAdmin={isAdmin}
                  onSave={(v) => updateField(item.id, "date_label", v)}
                />
                {isAdmin && (
                  <button
                    className="edit-btn small danger"
                    style={{ marginTop: 8 }}
                    onClick={() => removeItem(item.id)}
                  >
                    Hapus
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {isAdmin && (
          <div className="admin-add-card admin-add-card-row">
            <button className="edit-btn outline" onClick={addItem}>
              + Tambah satu foto (dengan crop)
            </button>
            <button
              className="edit-btn"
              onClick={() => bulkInputRef.current?.click()}
              disabled={Boolean(bulkProgress)}
            >
              {bulkProgress
                ? `Mengunggah ${bulkProgress.done}/${bulkProgress.total}...`
                : "+ Upload banyak foto sekaligus"}
            </button>
            <input
              ref={bulkInputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: "none" }}
              onChange={handleBulkFiles}
            />
          </div>
        )}
      </div>

      <Lightbox
        url={lightbox ? items[lightbox.index]?.photo_url : null}
        title={lightbox ? items[lightbox.index]?.title : null}
        onClose={() => setLightbox(null)}
        onPrev={
          lightbox && items.length > 1
            ? () =>
                setLightbox((prev) => ({
                  index: (prev.index - 1 + items.length) % items.length,
                }))
            : undefined
        }
        onNext={
          lightbox && items.length > 1
            ? () =>
                setLightbox((prev) => ({
                  index: (prev.index + 1) % items.length,
                }))
            : undefined
        }
      />
      {ConfirmDialog}
    </section>
  );
}
