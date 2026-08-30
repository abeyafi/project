"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import ScrollReveal from "../../../components/ScrollReveal";

function estimateReadMinutes(text) {
  if (!text) return 0;
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200)); // ~200 kata/menit
}

export default function ArticleDetailClient({ slug }) {
  const [article, setArticle] = useState(undefined); // undefined = loading, null = not found
  const [authorName, setAuthorName] = useState(null);

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

      if (data?.author_id) {
        const { data: author } = await supabase
          .from("admins")
          .select("name, email")
          .eq("id", data.author_id)
          .maybeSingle();
        if (author) setAuthorName(author.name || author.email);
      }
    }
    load();
  }, [slug]);

  const paragraphs = (article?.content || "")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  const readMinutes = estimateReadMinutes(article?.content);

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

              <span className="section-eyebrow on-paper">{article.category || "Berita"}</span>
              <h1 className="section-title on-paper reveal berita-detail-title">{article.title}</h1>

              <div className="berita-byline">
                {authorName && <span className="berita-byline-author">{authorName}</span>}
                {article.published_at && (
                  <span>
                    {new Date(article.published_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                )}
                {readMinutes > 0 && <span>{readMinutes} menit baca</span>}
              </div>

              {article.thumbnail_url && (
                <div className="berita-detail-thumb reveal">
                  <img src={article.thumbnail_url} alt={article.title} draggable="false" />
                </div>
              )}

              {article.excerpt && (
                <p className="berita-detail-lead reveal">{article.excerpt}</p>
              )}

              {paragraphs.length > 0 ? (
                <div className="berita-detail-content reveal">
                  {paragraphs.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              ) : (
                <p className="admin-empty-note berita-detail-content-empty">
                  Isi artikel ini belum ditambahkan. Buka <b>/admin/berita</b>{" "}
                  untuk melengkapi bagian "Isi Berita".
                </p>
              )}
            </>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
}
