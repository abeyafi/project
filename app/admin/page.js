"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

const COUNT_TABLES = [
  { key: "publikasi", label: "Publikasi", table: "publikasi" },
  { key: "galeri", label: "Galeri", table: "galeri" },
  { key: "articles", label: "Berita", table: "articles" },
  { key: "programs", label: "Program Kerja", table: "programs" },
  { key: "calendar_events", label: "Agenda", table: "calendar_events" },
  { key: "prestasi", label: "Prestasi", table: "prestasi" },
  { key: "admins", label: "Admin", table: "admins" },
];

export default function AdminDashboardPage() {
  const [counts, setCounts] = useState({});
  const [draftPublished, setDraftPublished] = useState({ draft: 0, published: 0 });
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const results = {};
      for (const c of COUNT_TABLES) {
        const { count } = await supabase
          .from(c.table)
          .select("*", { count: "exact", head: true });
        results[c.key] = count || 0;
      }
      setCounts(results);

      const [{ count: draftPub }, { count: pubPub }, { count: draftArt }, { count: pubArt }] =
        await Promise.all([
          supabase.from("publikasi").select("*", { count: "exact", head: true }).eq("status", "draft"),
          supabase.from("publikasi").select("*", { count: "exact", head: true }).eq("status", "published"),
          supabase.from("articles").select("*", { count: "exact", head: true }).eq("status", "draft"),
          supabase.from("articles").select("*", { count: "exact", head: true }).eq("status", "published"),
        ]);
      setDraftPublished({
        draft: (draftPub || 0) + (draftArt || 0),
        published: (pubPub || 0) + (pubArt || 0),
      });

      const { data: logs } = await supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(8);
      setRecentLogs(logs || []);

      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className="admin-loading">Memuat dashboard...</div>;

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <h1>Dashboard</h1>
        <p>Ringkasan konten dan aktivitas UKK RISPI.</p>
      </div>

      <div className="admin-stat-grid">
        {COUNT_TABLES.map((c) => (
          <div className="admin-stat-card" key={c.key}>
            <div className="admin-stat-value">{counts[c.key] ?? "—"}</div>
            <div className="admin-stat-label">{c.label}</div>
          </div>
        ))}
        <div className="admin-stat-card">
          <div className="admin-stat-value">{draftPublished.draft}</div>
          <div className="admin-stat-label">Konten draft</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-value">{draftPublished.published}</div>
          <div className="admin-stat-label">Konten published</div>
        </div>
      </div>

      <div className="admin-quick-actions">
        <a href="/admin/berita" className="edit-btn">+ Tambah Berita</a>
        <a href="/admin/program" className="edit-btn outline">+ Tambah Program</a>
        <a href="/#publikasi" className="edit-btn outline">+ Tambah Publikasi</a>
        <a href="/#galeri" className="edit-btn outline">Upload Galeri</a>
        <a href="/#kalender" className="edit-btn outline">+ Tambah Agenda</a>
      </div>

      <div className="admin-section-block">
        <h2>Aktivitas terbaru</h2>
        {recentLogs.length === 0 ? (
          <p className="admin-empty-note">Belum ada aktivitas tercatat.</p>
        ) : (
          <ul className="admin-activity-list">
            {recentLogs.map((log) => (
              <li key={log.id}>
                <span className="admin-activity-time">
                  {new Date(log.created_at).toLocaleString("id-ID")}
                </span>
                <span className="admin-activity-desc">
                  <b>{log.actor_email}</b> — {log.description || log.action}
                </span>
              </li>
            ))}
          </ul>
        )}
        <a href="/admin/activity-log" className="admin-see-all">
          Lihat semua aktivitas &rarr;
        </a>
      </div>
    </div>
  );
}
