"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../../lib/supabaseClient";
import { useAdmin } from "../../../../hooks/useAdmin";
import Header from "../../../../components/Header";
import Footer from "../../../../components/Footer";
import ScrollReveal from "../../../../components/ScrollReveal";

function formatDate(d) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

export default function ProgramDetailPage() {
  const { divisionSlug, programSlug } = useParams();
  const { isAdmin } = useAdmin();
  const [division, setDivision] = useState(undefined);
  const [program, setProgram] = useState(undefined);

  useEffect(() => {
    async function load() {
      const { data: div } = await supabase
        .from("bidang")
        .select("*")
        .eq("slug", divisionSlug)
        .maybeSingle();
      setDivision(div || null);
      if (div) {
        const { data: prog } = await supabase
          .from("programs")
          .select("*")
          .eq("division_id", div.id)
          .eq("slug", programSlug)
          .maybeSingle();
        setProgram(prog || null);
      } else {
        setProgram(null);
      }
    }
    load();
  }, [divisionSlug, programSlug]);

  const notFound = division === null || program === null;
  const loading = division === undefined || program === undefined;
  const period = program && (formatDate(program.start_date) || formatDate(program.end_date))
    ? `${formatDate(program.start_date) || "?"} — ${formatDate(program.end_date) || "sekarang"}`
    : null;

  return (
    <>
      <ScrollReveal />
      <Header />
      <section className="berita-detail">
        <div className="berita-detail-inner">
          {loading && <p className="admin-empty-note">Memuat...</p>}
          {!loading && notFound && (
            <p className="admin-empty-note">Program tidak ditemukan atau belum dipublikasikan.</p>
          )}
          {!loading && !notFound && (
            <>
              {program.status !== "published" && isAdmin && (
                <div className="draft-preview-banner">
                  Ini pratinjau — status program ini masih <b>{program.status}</b>, belum tampil untuk pengunjung umum.
                </div>
              )}
              <span className="section-eyebrow on-paper">{division.title}</span>
              <h1 className="section-title on-paper reveal">{program.title}</h1>
              {period && <div className="berita-detail-meta">{period}</div>}

              {program.image_url && (
                <div className="berita-detail-thumb reveal">
                  <img src={program.image_url} alt={program.title} />
                </div>
              )}

              {program.description && (
                <div className="berita-detail-content reveal">{program.description}</div>
              )}

              {(program.objective || program.person_in_charge) && (
                <div className="program-detail-meta-card reveal">
                  {program.objective && (
                    <div>
                      <div className="k-label">Tujuan</div>
                      <p>{program.objective}</p>
                    </div>
                  )}
                  {program.person_in_charge && (
                    <div>
                      <div className="k-label">Penanggung Jawab</div>
                      <p>{program.person_in_charge}</p>
                    </div>
                  )}
                </div>
              )}

              <a href={`/program/${divisionSlug}`} className="btn-outline" style={{ marginTop: 28, display: "inline-block" }}>
                &larr; Semua program {division.title}
              </a>
            </>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
}
