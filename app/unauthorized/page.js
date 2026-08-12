"use client";

import { useAdmin } from "../../hooks/useAdmin";

export default function UnauthorizedPage() {
  const { isAdmin } = useAdmin();

  return (
    <div className="unauthorized-page">
      <div className="unauthorized-card">
        <span className="section-eyebrow on-paper">403</span>
        <h1>Akses Ditolak</h1>
        <p>Anda tidak memiliki izin untuk mengakses halaman ini.</p>
        <a href={isAdmin ? "/admin" : "/"} className="edit-btn">
          {isAdmin ? "Kembali ke Dashboard" : "Kembali ke Beranda"}
        </a>
      </div>
    </div>
  );
}
