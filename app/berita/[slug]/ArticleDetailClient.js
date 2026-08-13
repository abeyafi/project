"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import ScrollReveal from "../../../components/ScrollReveal";

export default function ArticleDetailClient({ slug }) {
  const [article, setArticle] = useState(undefined); // undefined = loading, null = not found

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("articles")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      // Tidak perlu filter status di query — RLS sudah menangani ini:
      // penonton biasa hanya dapat baris published, admin bisa lihat
      // draft juga (dipakai fitur "Preview" di /admin/berita).
      setArticle(data || null);
    }
    load();
  }, [slug]);

  return (
    <>
      <ScrollReveal />
      <Header />
      <section className="berita-detail">
        <div className="berita-detail-inner">
          {article === undefined && <p className="admin-empty-note">Memuat...</p>}
          {article === null && (
            <p className="admin-empty-note">Berita tidak ditemukan atau belum dipublikasikan.</p>
          )}
          {article && (
            <>
              {article.status !== "published" && (
                <div className="draft-preview-banner">
                  Ini pratinjau — status berita ini masih{" "}
                  <b>{article.status}</b>, belum tampil untuk pengunjung
                  umum.
                </div>
              )}
              <span className="section-eyebrow on-paper">{article.category}</span>
              <h1 className="section-title on-paper reveal">{article.title}</h1>
              <div className="berita-detail-meta">
                {article.published_at &&
                  new Date(article.published_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
              </div>
              {article.thumbnail_url && (
                <div className="berita-detail-thumb reveal">
                  <img src={article.thumbnail_url} alt={article.title}  draggable="false"/>
                </div>
              )}
              <div className="berita-detail-content reveal">{article.content}</div>
            </>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
}
