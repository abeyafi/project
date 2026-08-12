"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/#visimisi", label: "Visi Misi" },
  { href: "/#tentang", label: "Tentang" },
  { href: "/#divisi", label: "Divisi" },
  { href: "/#kalender", label: "Kalender" },
  { href: "/#bso", label: "BSO" },
  { href: "/#prestasi", label: "Prestasi" },
  { href: "/#galeri", label: "Galeri" },
  { href: "/#publikasi", label: "Publikasi" },
  { href: "/berita", label: "Berita" },
  { href: "/#kontak", label: "Kontak" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const closeMenu = () => setOpen(false);
  const pathname = usePathname();

  function isActive(href) {
    if (href === "/") return pathname === "/";
    if (href.startsWith("/berita")) return pathname?.startsWith("/berita");
    return false; // anchor links (/#section) don't map to a pathname
  }

  return (
    <header className="masthead">
      <div className="masthead-rule"></div>
      <div className="nav-inner">
        <div className="brand">
          <div className="brand-logos">
            <div className="uin-mark">
              <img src="/logo-uin.png" alt="Logo UIN Ar-Raniry" />
            </div>
            <div className="brand-divider"></div>
          </div>
          <div className="brand-mark">
            <img src="/logo-rispi.png" alt="Logo RISPI" />
          </div>
          <div>
            <div className="brand-text">UKK RISPI</div>
            <div className="brand-sub">UIN Ar-Raniry</div>
          </div>
        </div>

        <nav className="links">
          {NAV_LINKS.map((link) => (
            <a key={link.label} href={link.href} className={isActive(link.href) ? "active" : ""}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="nav-right">
          <button
            className={`burger${open ? " is-open" : ""}`}
            aria-label="Buka menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      <div className={`mobile-panel${open ? " is-open" : ""}`}>
        <div className="mobile-panel-inner">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={isActive(link.href) ? "active" : ""}
              onClick={closeMenu}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </header>
  );
}
