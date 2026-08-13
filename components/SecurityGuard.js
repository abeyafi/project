"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Penghalang ringan (deterrence) khusus PUBLIC WEBSITE:
//  - klik kanan diblokir HANYA pada gambar/aset visual (bukan seluruh
//    halaman -- teks tetap bisa diklik-kanan/di-select seperti biasa)
//  - Ctrl+U (lihat source) & shortcut DevTools umum diblokir
//
// TIDAK aktif di /admin -- admin butuh akses normal ke klik kanan,
// DevTools, dan Ctrl+S untuk kerja & debugging sehari-hari.
//
// Catatan jujur: ini murni penghalang untuk pengunjung awam, BUKAN
// batas keamanan sesungguhnya -- siapa pun yang paham masih bisa buka
// DevTools lewat menu browser. Data sensitif tetap dilindungi lewat
// Supabase RLS di level database, bukan lewat trik di browser ini.
export default function SecurityGuard() {
  const pathname = usePathname();
  const isAdminArea = pathname?.startsWith("/admin");

  useEffect(() => {
    if (isAdminArea) return; // admin: tidak ada pembatasan apa pun

    function blockAssetContextMenu(e) {
      const target = e.target;
      if (target.tagName === "IMG" || target.closest("[data-protected-asset]")) {
        e.preventDefault();
      }
    }

    function blockShortcuts(e) {
      const key = e.key?.toLowerCase();
      const ctrlOrCmd = e.ctrlKey || e.metaKey;

      const isViewSource = ctrlOrCmd && key === "u";
      const isDevToolsKey = key === "f12";
      const isDevToolsCombo =
        ctrlOrCmd && e.shiftKey && ["i", "j", "c"].includes(key);
      const isSaveCombo = ctrlOrCmd && key === "s";

      if (isViewSource || isDevToolsKey || isDevToolsCombo || isSaveCombo) {
        e.preventDefault();
      }
    }

    document.addEventListener("contextmenu", blockAssetContextMenu);
    document.addEventListener("keydown", blockShortcuts);

    return () => {
      document.removeEventListener("contextmenu", blockAssetContextMenu);
      document.removeEventListener("keydown", blockShortcuts);
    };
  }, [isAdminArea]);

  return null;
}
