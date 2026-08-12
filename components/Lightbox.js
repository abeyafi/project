"use client";

import { useEffect } from "react";

export default function Lightbox({ url, title, onClose }) {
  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!url) return null;

  return (
    <div className="lightbox-backdrop" onClick={onClose}>
      <button className="lightbox-close" onClick={onClose} aria-label="Tutup">
        &times;
      </button>
      <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
        <img src={url} alt={title || ""} />
        {title && <div className="lightbox-caption">{title}</div>}
      </div>
    </div>
  );
}
