"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAdmin } from "../../hooks/useAdmin";

function buildNavGroups(isSuperAdmin) {
  return [
    {
      label: "Overview",
      items: [{ href: "/admin", label: "Dashboard" }],
    },
    {
      label: "Content",
      items: [
        { href: "/admin/berita", label: "Berita" },
        { href: "/admin/program", label: "Program Kerja" },
        { href: "/#publikasi", label: "Publikasi" },
        { href: "/#galeri", label: "Galeri" },
        { href: "/#kalender", label: "Agenda" },
        { href: "/#prestasi", label: "Prestasi" },
      ],
    },
    {
      label: "Organization",
      items: [
        { href: "/#divisi", label: "Organisasi" },
        { href: "/#bidang", label: "Divisi" },
        { href: "/#bso", label: "BSO" },
        { href: "/#pimpinan", label: "Pimpinan" },
      ],
    },
    {
      label: "System",
      items: [
        { href: "/admin/activity-log", label: "Activity Log" },
        ...(isSuperAdmin ? [{ href: "/admin/admins", label: "Admin" }] : []),
      ],
    },
  ];
}

export default function AdminLayout({ children }) {
  const { session, isAdmin, isSuperAdmin, adminProfile, loading, logout } = useAdmin();
  const router = useRouter();
  const pathname = usePathname();
  const activeLinkRef = useRef(null);

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

  // Kalau menu aktif ada di luar area terlihat sidebar (karena sedang
  // di-scroll), bawa masuk ke pandangan -- tapi cuma di dalam kotak
  // sidebar itu sendiri, tidak menggeser scroll halaman utama.
  useEffect(() => {
    activeLinkRef.current?.scrollIntoView({ block: "nearest" });
  }, [pathname]);

  function isActivePath(href) {
    return pathname === href;
  }

  if (loading || !session || !isAdmin) {
    return <div className="admin-guard-loading">Memuat...</div>;
  }
  if (pathname?.startsWith("/admin/admins") && !isSuperAdmin) {
    return <div className="admin-guard-loading">Memuat...</div>;
  }

  const navGroups = buildNavGroups(isSuperAdmin);

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">ADMIN RISPI</div>
        <div className="admin-sidebar-scroll">
          {navGroups.map((group) => (
            <div className="admin-nav-group" key={group.label}>
              <div className="admin-sidebar-divider">{group.label}</div>
              <nav className="admin-sidebar-nav">
                {group.items.map((item) => (
                  <a
                    key={item.href + item.label}
                    href={item.href}
                    className={isActivePath(item.href) ? "active" : ""}
                    ref={isActivePath(item.href) ? activeLinkRef : undefined}
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
          ))}
        </div>
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
