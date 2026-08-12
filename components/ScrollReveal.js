"use client";

import { useEffect } from "react";

export default function ScrollReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    function observeAll() {
      document.querySelectorAll(".reveal:not(.is-visible)").forEach((el) => {
        io.observe(el);
      });
    }

    // Tangkap elemen .reveal yang sudah ada saat mount...
    observeAll();

    // ...dan pantau terus DOM untuk elemen .reveal baru yang muncul
    // belakangan (misalnya section yang datanya di-fetch dari Supabase).
    const mo = new MutationObserver(() => {
      observeAll();
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return null;
}
