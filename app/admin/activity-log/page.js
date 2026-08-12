"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

const FILTERS = [
  { key: "all", label: "Semua" },
  { key: "create", label: "Create" },
  { key: "update", label: "Update" },
  { key: "delete", label: "Delete" },
  { key: "publish", label: "Publish" },
  { key: "login", label: "Login" },
  { key: "upload", label: "Upload" },
];

export default function ActivityLogPage() {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      setLogs(data || []);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = filter === "all" ? logs : logs.filter((l) => l.action === filter);

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <h1>Activity Log</h1>
        <p>Riwayat aksi seluruh admin. Log tidak dapat diubah atau dihapus.</p>
      </div>

      <div className="admin-filter-row">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={`admin-filter-chip${filter === f.key ? " active" : ""}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="admin-empty-note">Memuat...</p>
      ) : filtered.length === 0 ? (
        <p className="admin-empty-note">Tidak ada aktivitas untuk filter ini.</p>
      ) : (
        <div className="admin-list-table-wrap">
          <table className="admin-log-table">
            <thead>
              <tr>
                <th>Waktu</th>
                <th>Admin</th>
                <th>Aksi</th>
                <th>Jenis konten</th>
                <th>Deskripsi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => (
                <tr key={log.id}>
                  <td>{new Date(log.created_at).toLocaleString("id-ID")}</td>
                  <td>{log.actor_email}</td>
                  <td>
                    <span className="admin-action-badge">{log.action}</span>
                  </td>
                  <td>{log.entity_type}</td>
                  <td>{log.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
