"use client";

import { useEffect } from "react";

// Blokir klik kanan (context menu) dan Ctrl+U (lihat source).
// Catatan jujur: ini cuma penghalang ringan, bukan keamanan sesungguhnya —
// orang yang paham masih bisa buka DevTools lewat menu browser atau
// shortcut lain. Data sensitif tetap harus dilindungi lewat RLS Supabase
// (yang sudah ada), bukan mengandalkan ini.
export default function SecurityGuard() {
  useEffect(() => {
    function blockContextMenu(e) {
      e.preventDefault();
    }
    function blockViewSource(e) {
      const key = e.key?.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && key === "u") {
        e.preventDefault();
      }
    }

    document.addEventListener("contextmenu", blockContextMenu);
    document.addEventListener("keydown", blockViewSource);

    return () => {
      document.removeEventListener("contextmenu", blockContextMenu);
      document.removeEventListener("keydown", blockViewSource);
    };
  }, []);

  return null;
}
