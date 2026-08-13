"use client";

import { useEffect } from "react";

export default function Lightbox({ url, title, onClose, onPrev, onNext }) {
  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && onPrev) onPrev();
      if (e.key === "ArrowRight" && onNext) onNext();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, onPrev, onNext]);

  if (!url) return null;

  return (
    <div className="lightbox-backdrop" onClick={onClose}>
      <button className="lightbox-close" onClick={onClose} aria-label="Tutup">
        &times;
      </button>

      {onPrev && (
        <button
          className="lightbox-nav lightbox-nav-prev"
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          aria-label="Foto sebelumnya"
        >
          &#8249;
        </button>
      )}

      <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
        <img src={url} alt={title || ""} draggable="false" />
        {title && <div className="lightbox-caption">{title}</div>}
      </div>

      {onNext && (
        <button
          className="lightbox-nav lightbox-nav-next"
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          aria-label="Foto berikutnya"
        >
          &#8250;
        </button>
      )}
    </div>
  );
}
