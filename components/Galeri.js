"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAdmin } from "../hooks/useAdmin";
import { useConfirm } from "../hooks/useConfirm";
import EditableText from "./EditableText";
import EditablePhoto from "./EditablePhoto";
import Lightbox from "./Lightbox";
import SectionSkeleton from "./SectionSkeleton";

export default function Galeri() {
  const { isAdmin } = useAdmin();
  const { confirm, ConfirmDialog } = useConfirm();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null); // { index }

  async function load() {
    const { data } = await supabase
      .from("galeri")
      .select("*")
      .order("sort_order", { ascending: true })
      .limit(100);
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
          <div className="admin-add-card">
            <button className="edit-btn" onClick={addItem}>
              + Tambah foto galeri
            </button>
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
