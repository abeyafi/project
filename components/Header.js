"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

// Menu utama navbar (tetap tampil langsung, sesuai urutan yang diminta)
const MAIN_LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/#visimisi", label: "Visi Misi" },
  { href: "/#tentang", label: "Tentang" },
  { href: "/#kalender", label: "Kalender" },
  { href: "/#divisi", label: "Divisi" },
  { href: "/#kontak", label: "Kontak" },
];

// Digabung ke dropdown "Lainnya" — tetap mengarah ke section/route yang
// sama seperti sebelumnya, cuma dikelompokkan di navbar.
const MORE_LINKS = [
  { href: "/#bso", label: "BSO" },
  { href: "/#galeri", label: "Galeri" },
  { href: "/#prestasi", label: "Prestasi" },
  { href: "/#publikasi", label: "Publikasi" },
  { href: "/berita", label: "Berita" },
];

const DESKTOP_BREAKPOINT = 880;

export default function Header() {
  const [open, setOpen] = useState(false); // drawer mobile
  const [moreOpen, setMoreOpen] = useState(false); // dropdown "Lainnya" desktop
  const pathname = usePathname();
  const moreRef = useRef(null);

  const closeMenu = () => setOpen(false);

  function isActive(href) {
    if (href === "/") return pathname === "/";
    if (href.startsWith("/berita")) return pathname?.startsWith("/berita");
    return false; // anchor links (/#section) tidak punya pathname sendiri
  }

  // Sinkronkan state hamburger ke breakpoint: kalau drawer mobile masih
  // terbuka lalu layar di-resize melewati batas desktop, tutup otomatis.
  // Ini akar penyebab bug "blank space" saat mobile -> desktop -- state
  // React yang tidak ikut berubah saat breakpoint berubah, bukan soal CSS.
  useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT + 1}px)`);
    function handleChange(e) {
      if (e.matches) {
        setOpen(false);
        setMoreOpen(false);
      }
    }
    mql.addEventListener("change", handleChange);
    // Cek juga sekali di awal, kalau-kalau komponen mount saat sudah desktop.
    if (mql.matches) setOpen(false);
    return () => mql.removeEventListener("change", handleChange);
  }, []);

  // Tutup dropdown "Lainnya" kalau klik di luar area-nya.
  useEffect(() => {
    function handleClickOutside(e) {
      if (moreRef.current && !moreRef.current.contains(e.target)) {
        setMoreOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const moreActive = MORE_LINKS.some((l) => isActive(l.href));

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
          {MAIN_LINKS.map((link) => (
            <a key={link.label} href={link.href} className={isActive(link.href) ? "active" : ""}>
              {link.label}
            </a>
          ))}

          <div className="nav-dropdown" ref={moreRef}>
            <button
              type="button"
              className={`nav-dropdown-trigger${moreActive ? " active" : ""}`}
              aria-expanded={moreOpen}
              aria-haspopup="true"
              onClick={() => setMoreOpen((v) => !v)}
            >
              Lainnya
              <span className={`nav-dropdown-caret${moreOpen ? " is-open" : ""}`}>&#9662;</span>
            </button>
            <div className={`nav-dropdown-menu${moreOpen ? " is-open" : ""}`}>
              {MORE_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className={isActive(link.href) ? "active" : ""}
                  onClick={() => setMoreOpen(false)}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
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
          {MAIN_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={isActive(link.href) ? "active" : ""}
              onClick={closeMenu}
            >
              {link.label}
            </a>
          ))}
          <div className="mobile-panel-divider">Lainnya</div>
          {MORE_LINKS.map((link) => (
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
