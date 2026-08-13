"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import ScrollReveal from "../../../components/ScrollReveal";

export default function DivisionProgramsPage({ params }) {
  const { divisionSlug } = params;
  const [division, setDivision] = useState(undefined);
  const [programs, setPrograms] = useState([]);

  useEffect(() => {
    async function load() {
      const { data: div } = await supabase
        .from("bidang")
        .select("*")
        .eq("slug", divisionSlug)
        .maybeSingle();
      setDivision(div || null);
      if (div) {
        const { data: progs } = await supabase
          .from("programs")
          .select("*")
          .eq("division_id", div.id)
          .eq("status", "published")
          .order("sort_order");
        setPrograms(progs || []);
      }
    }
    load();
  }, [divisionSlug]);

  return (
    <>
      <ScrollReveal />
      <Header />
      <section className="berita-page">
        <div className="berita-page-inner">
          {division === undefined && <p className="admin-empty-note">Memuat...</p>}
          {division === null && (
            <p className="admin-empty-note">Divisi tidak ditemukan.</p>
          )}
          {division && (
            <>
              <span className="section-eyebrow on-paper">Program Kerja</span>
              <h1 className="section-title on-paper reveal">{division.title}</h1>
              <p className="section-sub" style={{ marginTop: 10, maxWidth: 560 }}>{division.description}</p>

              {programs.length === 0 ? (
                <div className="program-empty-state reveal">
                  <span>&mdash;</span>
                  <div>
                    <b>Belum ada program kerja</b>
                    <p>Program kerja divisi ini belum dipublikasikan.</p>
                  </div>
                </div>
              ) : (
                <div className="berita-grid reveal">
                  {programs.map((p) => (
                    <a className="berita-card" href={`/program/${divisionSlug}/${p.slug}`} key={p.id}>
                      <div className="berita-card-thumb">
                        {p.image_url && <img src={p.image_url} alt={p.title} />}
                      </div>
                      <div className="berita-card-body">
                        <span className="berita-card-category">
                          {p.person_in_charge || division.title}
                        </span>
                        <div className="berita-card-title">{p.title}</div>
                        <p className="berita-card-excerpt">{p.description}</p>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
}
