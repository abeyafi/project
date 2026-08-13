"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useAdmin } from "../../../hooks/useAdmin";
import EditableText from "../../../components/EditableText";
import EditablePhoto from "../../../components/EditablePhoto";
import { logActivity } from "../../../lib/activityLog";
import { slugify, uniqueSlugSuffix } from "../../../lib/slugify";
import { useConfirm } from "../../../hooks/useConfirm";

export default function AdminBeritaPage() {
  const { session } = useAdmin();
  const { confirm, ConfirmDialog } = useConfirm();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const { data } = await supabase
      .from("articles")
      .select("*")
      .order("created_at", { ascending: false });
    setArticles(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateField(id, field, value) {
    await supabase.from("articles").update({ [field]: value, updated_at: new Date().toISOString() }).eq("id", id);
    setArticles((prev) => prev.map((a) => (a.id === id ? { ...a, [field]: value } : a)));
  }

  async function createArticle() {
    const title = "Judul berita baru";
    const slug = `${slugify(title)}-${uniqueSlugSuffix()}`;
    const { data } = await supabase
      .from("articles")
      .insert({
        title,
        slug,
        excerpt: "",
        content: "",
        category: "Umum",
        status: "draft",
        author_id: session?.user?.id || null,
      })
      .select()
      .single();
    if (data) {
      setArticles((prev) => [data, ...prev]);
      logActivity({ action: "create", entityType: "articles", entityId: data.id, description: `Membuat draft berita: ${title}` });
    }
  }

  async function setStatus(article, status) {
    const patch = { status, updated_at: new Date().toISOString() };
    if (status === "published") patch.published_at = new Date().toISOString();
    await supabase.from("articles").update(patch).eq("id", article.id);
    setArticles((prev) => prev.map((a) => (a.id === article.id ? { ...a, ...patch } : a)));
    logActivity({
      action: status === "published" ? "publish" : status === "archived" ? "archive" : "unpublish",
      entityType: "articles",
      entityId: article.id,
      description: `${status === "published" ? "Mempublish" : status === "archived" ? "Mengarsipkan" : "Unpublish"} berita: ${article.title}`,
    });
  }

  async function removeArticle(article) {
    if (!(await confirm(`Hapus berita "${article.title}"?`))) return;
    await supabase.from("articles").delete().eq("id", article.id);
    setArticles((prev) => prev.filter((a) => a.id !== article.id));
    logActivity({ action: "delete", entityType: "articles", entityId: article.id, description: `Menghapus berita: ${article.title}` });
  }

  if (loading) return <div className="admin-loading">Memuat...</div>;

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <h1>Berita</h1>
        <p>Kelola artikel/berita RISPI — draft tidak tampil di website publik.</p>
      </div>

      <button className="edit-btn" onClick={createArticle} style={{ marginBottom: 24 }}>
        + Artikel Baru
      </button>

      <div className="admin-article-list">
        {articles.map((a) => (
          <div className="admin-article-card" key={a.id}>
            <EditablePhoto
              className="admin-article-thumb"
              url={a.thumbnail_url}
              alt={a.title}
              isAdmin={true}
              pathPrefix="articles"
              aspect={16 / 9}
              cornerButton
              entityType="articles"
              entityId={a.id}
              onSaved={(url) => updateField(a.id, "thumbnail_url", url)}
            />
            <div className="admin-article-body">
              <div className="admin-article-top">
                <span className={`status-badge ${a.status}`}>{a.status}</span>
                {a.slug && (
                  <a href={`/berita/${a.slug}`} target="_blank" rel="noreferrer" className="admin-preview-link">
                    Preview &#8599;
                  </a>
                )}
              </div>
              <EditableText
                as="div"
                className="admin-article-title"
                value={a.title}
                isAdmin={true}
                onSave={(v) => updateField(a.id, "title", v)}
              />
              <EditableText
                as="div"
                className="admin-article-excerpt"
                value={a.excerpt}
                isAdmin={true}
                multiline
                placeholder="(ringkasan singkat)"
                onSave={(v) => updateField(a.id, "excerpt", v)}
              />
              <EditableText
                as="div"
                className="admin-article-content"
                value={a.content}
                isAdmin={true}
                multiline
                placeholder="(isi berita)"
                onSave={(v) => updateField(a.id, "content", v)}
              />
              <div className="admin-article-meta-row">
                <EditableText
                  className="admin-article-category"
                  value={a.category}
                  isAdmin={true}
                  onSave={(v) => updateField(a.id, "category", v)}
                />
                <EditableText
                  className="admin-article-slug"
                  value={a.slug}
                  isAdmin={true}
                  onSave={(v) => updateField(a.id, "slug", slugify(v))}
                />
              </div>
              <div className="admin-article-actions">
                {a.status !== "draft" && (
                  <button className="edit-btn small outline" onClick={() => setStatus(a, "draft")}>
                    Jadikan Draft
                  </button>
                )}
                {a.status !== "published" && (
                  <button className="edit-btn small" onClick={() => setStatus(a, "published")}>
                    Publish
                  </button>
                )}
                {a.status === "published" && (
                  <button className="edit-btn small outline" onClick={() => setStatus(a, "draft")}>
                    Unpublish
                  </button>
                )}
                {a.status !== "archived" && (
                  <button className="edit-btn small outline" onClick={() => setStatus(a, "archived")}>
                    Arsipkan
                  </button>
                )}
                <button className="edit-btn small danger" onClick={() => removeArticle(a)}>
                  Hapus
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {ConfirmDialog}
    </div>
  );
}
