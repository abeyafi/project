"use client";

import { useEffect, useRef, useState } from "react";

export default function CountUpStat({ value, duration = 1000 }) {
  const ref = useRef(null);
  const [display, setDisplay] = useState(value);
  const hasRun = useRef(false);

  useEffect(() => {
    setDisplay(value); // kalau admin ganti angkanya, langsung ikut update
    hasRun.current = false;

    const match = String(value || "").match(/^(\d+)(.*)$/);
    if (!match) return; // bukan angka di depan (mis. teks bebas) -- tampilkan apa adanya

    const target = parseInt(match[1], 10);
    const suffix = match[2] || "";

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasRun.current) {
            hasRun.current = true;
            const start = performance.now();
            function tick(now) {
              const progress = Math.min((now - start) / duration, 1);
              const current = Math.round(progress * target);
              setDisplay(current + suffix);
              if (progress < 1) {
                requestAnimationFrame(tick);
              } else {
                setDisplay(target + suffix);
              }
            }
            requestAnimationFrame(tick);
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value, duration]);

  return (
    <div className="num" ref={ref}>
      {display}
    </div>
  );
}
