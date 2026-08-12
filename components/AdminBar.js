"use client";

import { usePathname } from "next/navigation";
import { useAdmin } from "../hooks/useAdmin";

export default function AdminBar() {
  const { session, isAdmin, loading, logout } = useAdmin();
  const pathname = usePathname();

  // Sidebar /admin sudah punya info login sendiri — jangan tampilkan
  // bar duplikat di atasnya.
  if (pathname?.startsWith("/admin")) return null;

  if (loading) return null;

  if (!session || !isAdmin) {
    return (
      <div className="admin-bar">
        <span>UKK RISPI</span>
        <a href="/login">Login Admin</a>
      </div>
    );
  }

  return (
    <div className="admin-bar">
      <span>
        <span className="dot"></span>Mode admin aktif — {session.user.email}
      </span>
      <span style={{ display: "flex", gap: 16 }}>
        <a href="/admin">Buka Dashboard</a>
        <button onClick={logout}>Keluar</button>
      </span>
    </div>
  );
}
