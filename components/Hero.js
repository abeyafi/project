"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAdmin } from "../hooks/useAdmin";
import EditableText from "./EditableText";

const DEFAULT_STATS = {
  stat1_value: "50+",
  stat1_label: "Anggota aktif",
  stat2_value: "12",
  stat2_label: "Naskah terpublikasi",
  stat3_value: "4",
  stat3_label: "Divisi riset",
};

export default function Hero() {
  const { isAdmin } = useAdmin();
  const [stats, setStats] = useState(DEFAULT_STATS);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("hero_stats")
        .select("*")
        .eq("id", 1)
        .maybeSingle();
      if (data) setStats(data);
    }
    load();
  }, []);

  async function updateStat(field, value) {
    await supabase.from("hero_stats").update({ [field]: value }).eq("id", 1);
    setStats((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <section className="hero">
      <div>
        <div className="eyebrow reveal">
          Unit Kegiatan Khusus &mdash; Riset &amp; Publikasi Ilmiah
        </div>
        <h1 className="headline reveal reveal-delay-1">
          Setiap riset bermula dari <em>satu pertanyaan</em> yang berani diajukan.
        </h1>
        <p className="abstract reveal reveal-delay-2">
          UKK RISPI menumbuhkan budaya berpikir ilmiah di kalangan mahasiswa UIN
          Ar-Raniry melalui pendampingan riset, penulisan karya ilmiah, dan
          publikasi yang terindeks &mdash; dari gagasan awal hingga naskah yang
          layak terbit.
        </p>
        <div className="hero-ctas reveal reveal-delay-2">
          <a href="/berita" className="btn-primary">
            Lihat Berita
          </a>
          <a href="/#kalender" className="btn-outline">
            Kalender Kegiatan
          </a>
        </div>
        <div className="hero-meta reveal reveal-delay-3">
          <div>
            <EditableText
              as="div"
              className="num"
              value={stats.stat1_value}
              isAdmin={isAdmin}
              onSave={(v) => updateStat("stat1_value", v)}
            />
            <EditableText
              as="div"
              className="lbl"
              value={stats.stat1_label}
              isAdmin={isAdmin}
              onSave={(v) => updateStat("stat1_label", v)}
            />
          </div>
          <div>
            <EditableText
              as="div"
              className="num"
              value={stats.stat2_value}
              isAdmin={isAdmin}
              onSave={(v) => updateStat("stat2_value", v)}
            />
            <EditableText
              as="div"
              className="lbl"
              value={stats.stat2_label}
              isAdmin={isAdmin}
              onSave={(v) => updateStat("stat2_label", v)}
            />
          </div>
          <div>
            <EditableText
              as="div"
              className="num"
              value={stats.stat3_value}
              isAdmin={isAdmin}
              onSave={(v) => updateStat("stat3_value", v)}
            />
            <EditableText
              as="div"
              className="lbl"
              value={stats.stat3_label}
              isAdmin={isAdmin}
              onSave={(v) => updateStat("stat3_label", v)}
            />
          </div>
        </div>
      </div>
      <div className="hero-visual reveal reveal-delay-1">
        <div className="card-stack">
          <div className="stamp-card c1"></div>
          <div className="stamp-card c2"></div>
          <div className="stamp-card c3">
            <div className="stamp-seal">
              <img src="/logo-rispi.png" alt="Logo RISPI" />
            </div>
            <div className="stamp-caption">
              UKK &middot; <b>RISPI</b>
              <br />
              Terverifikasi 2026
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
