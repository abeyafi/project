"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAdmin } from "../hooks/useAdmin";
import EditableText from "./EditableText";

const DEFAULTS = {
  eyebrow_active: "Seulawah — Kompetisi & Lomba",
  eyebrow_soon: "Segera hadir",
  tagline: "Pusat Persiapan Kompetisi & Lomba",
  title: "Seulawah",
  description:
    "Menyiapkan anggota RISPI menghadapi kompetisi karya tulis, debat ilmiah, dan olimpiade tingkat nasional — mulai dari pematangan gagasan, simulasi lomba, hingga pendampingan hari-H.",
  tags: ["Karya Tulis Ilmiah", "Debat & Business Case", "Presentasi Ilmiah", "Simulasi Lomba"],
  cta_label: "Lihat Berita",
  medal_caption: "Seulawah · Divisi Kompetisi",
};

export default function Bso() {
  const { isAdmin } = useAdmin();
  const [data, setData] = useState(DEFAULTS);

  useEffect(() => {
    async function load() {
      const { data: row } = await supabase
        .from("bso_content")
        .select("*")
        .eq("id", 1)
        .maybeSingle();
      if (row) setData(row);
    }
    load();
  }, []);

  async function updateField(field, value) {
    await supabase.from("bso_content").update({ [field]: value }).eq("id", 1);
    setData((prev) => ({ ...prev, [field]: value }));
  }

  const tagsText = (data.tags || []).join(", ");

  return (
    <section className="bso" id="bso">
      <div className="bso-inner">
        <div className="bso-head">
          <span className="section-eyebrow on-paper">Badan Semi Otonom</span>
          <h2 className="section-title on-paper reveal">
            Wadah pengembangan minat dan bakat spesifik
          </h2>
          <p className="section-sub on-paper reveal reveal-delay-1">
            Setiap BSO fokus pada satu bidang pengembangan anggota di luar
            program inti RISPI.
          </p>
        </div>

        <div className="bso-selector reveal reveal-delay-2">
          <div className="bso-chip active">
            <span className="chip-dot"></span>
            <EditableText
              value={data.eyebrow_active}
              isAdmin={isAdmin}
              onSave={(v) => updateField("eyebrow_active", v)}
            />
          </div>
          <div className="bso-chip soon">
            <span className="chip-dot"></span>
            <EditableText
              value={data.eyebrow_soon}
              isAdmin={isAdmin}
              onSave={(v) => updateField("eyebrow_soon", v)}
            />
          </div>
        </div>

        <div className="bso-detail reveal">
          <div className="bso-visual">
            <div className="medal">
              <div className="medal-circle">
                <div className="medal-star"></div>
              </div>
              <div className="medal-ribbons">
                <span></span>
                <span></span>
              </div>
              <EditableText
                as="div"
                className="medal-caption"
                value={data.medal_caption}
                isAdmin={isAdmin}
                onSave={(v) => updateField("medal_caption", v)}
              />
            </div>
          </div>
          <div className="bso-content">
            <EditableText
              as="span"
              className="section-eyebrow on-paper"
              value={data.tagline}
              isAdmin={isAdmin}
              onSave={(v) => updateField("tagline", v)}
            />
            <EditableText
              as="h3"
              value={data.title}
              isAdmin={isAdmin}
              onSave={(v) => updateField("title", v)}
            />
            <EditableText
              as="p"
              value={data.description}
              isAdmin={isAdmin}
              multiline
              onSave={(v) => updateField("description", v)}
            />
            <div className="bso-tags">
              {isAdmin ? (
                <EditableText
                  className="bso-tag bso-tag-edit"
                  value={tagsText}
                  isAdmin={isAdmin}
                  placeholder="Tag dipisah koma"
                  onSave={(v) =>
                    updateField(
                      "tags",
                      v.split(",").map((t) => t.trim()).filter(Boolean)
                    )
                  }
                />
              ) : (
                (data.tags || []).map((tag) => (
                  <span className="bso-tag" key={tag}>
                    {tag}
                  </span>
                ))
              )}
            </div>
            <div className="hero-ctas">
              {isAdmin ? (
                <EditableText
                  className="btn-primary"
                  value={data.cta_label}
                  isAdmin={isAdmin}
                  onSave={(v) => updateField("cta_label", v)}
                />
              ) : (
                <a href="#" className="btn-primary">
                  {data.cta_label}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
