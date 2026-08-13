"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ScrollReveal from "../../components/ScrollReveal";

export default function BeritaListClient() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("articles")
        .select("*")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(60);
      setArticles(data || []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <>
      <ScrollReveal />
      <Header />
      <section className="berita-page">
        <div className="berita-page-inner">
          <span className="section-eyebrow on-paper">Berita</span>
          <h1 className="section-title on-paper reveal">Kabar dari RISPI</h1>

          {loading ? (
            <p className="admin-empty-note">Memuat...</p>
          ) : articles.length === 0 ? (
            <p className="admin-empty-note">Belum ada berita yang dipublikasikan.</p>
          ) : (
            <div className="berita-grid reveal">
              {articles.map((a) => (
                <a className="berita-card" href={`/berita/${a.slug}`} key={a.id}>
                  <div className="berita-card-thumb">
                    {a.thumbnail_url && <img src={a.thumbnail_url} alt={a.title}  draggable="false"/>}
                  </div>
                  <div className="berita-card-body">
                    <span className="berita-card-category">{a.category}</span>
                    <div className="berita-card-title">{a.title}</div>
                    <p className="berita-card-excerpt">{a.excerpt}</p>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
}
