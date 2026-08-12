"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAdmin } from "../../hooks/useAdmin";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/berita", label: "Berita" },
  { href: "/admin/activity-log", label: "Activity Log" },
];

const SUPER_ADMIN_NAV = [{ href: "/admin/admins", label: "Admin" }];

const PUBLIC_SECTIONS = [
  { href: "/#publikasi", label: "Publikasi" },
  { href: "/#galeri", label: "Galeri" },
  { href: "/#kalender", label: "Agenda" },
  { href: "/#prestasi", label: "Prestasi" },
  { href: "/#divisi", label: "Organisasi" },
];

export default function AdminLayout({ children }) {
  const { session, isAdmin, isSuperAdmin, adminProfile, loading, logout } = useAdmin();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!session) {
      router.replace("/login");
      return;
    }
    if (!isAdmin) {
      router.replace("/unauthorized");
      return;
    }
    if (pathname?.startsWith("/admin/admins") && !isSuperAdmin) {
      router.replace("/unauthorized");
    }
  }, [loading, session, isAdmin, isSuperAdmin, pathname, router]);

  if (loading || !session || !isAdmin) {
    return <div className="admin-guard-loading">Memuat...</div>;
  }
  if (pathname?.startsWith("/admin/admins") && !isSuperAdmin) {
    return <div className="admin-guard-loading">Memuat...</div>;
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">ADMIN RISPI</div>
        <nav className="admin-sidebar-nav">
          {NAV.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
          {isSuperAdmin &&
            SUPER_ADMIN_NAV.map((item) => (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
        </nav>
        <div className="admin-sidebar-divider">Kelola konten section</div>
        <nav className="admin-sidebar-nav">
          {PUBLIC_SECTIONS.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <div className="admin-sidebar-email">{session.user.email}</div>
          <span className={`role-badge ${isSuperAdmin ? "super" : "admin"}`}>
            {isSuperAdmin ? "Super Admin" : "Admin"}
          </span>
          <a href="/" className="admin-sidebar-link">
            &larr; Lihat website
          </a>
          <button onClick={logout} className="admin-sidebar-logout">
            Keluar
          </button>
        </div>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}
