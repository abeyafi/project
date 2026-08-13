"use client";

import { useEffect, useRef, useState } from "react";

export default function EditableText({
  value,
  onSave,
  isAdmin,
  as: Tag = "span",
  multiline = false,
  className = "",
  placeholder = "",
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || "");
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef(null);

  // Auto-grow: tinggi textarea mengikuti isi teksnya (seperti editor
  // Blogger) -- pendek untuk teks pendek, memanjang otomatis sampai
  // batas wajar untuk naskah panjang, baru scrollbar internal muncul.
  function resizeTextarea() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const max = 480;
    if (el.scrollHeight > max) {
      el.style.height = max + "px";
      el.style.overflowY = "auto";
    } else {
      el.style.height = el.scrollHeight + "px";
      el.style.overflowY = "hidden";
    }
  }

  useEffect(() => {
    if (editing && multiline) resizeTextarea();
  }, [editing, multiline]);

  if (!isAdmin) {
    return <Tag className={className}>{value || placeholder}</Tag>;
  }

  if (!editing) {
    return (
      <Tag
        className={className + " editable-field"}
        onClick={() => {
          setDraft(value || "");
          setEditing(true);
        }}
        title="Klik untuk edit"
      >
        {value || placeholder || "(kosong — klik untuk isi)"}
      </Tag>
    );
  }

  async function handleSave() {
    setSaving(true);
    await onSave(draft);
    setSaving(false);
    setEditing(false);
  }

  return (
    <div className={className + " editable-field is-editing"}>
      {multiline ? (
        <textarea
          ref={textareaRef}
          rows={3}
          value={draft}
          autoFocus
          onChange={(e) => {
            setDraft(e.target.value);
            resizeTextarea();
          }}
          className="editable-autogrow"
        />
      ) : (
        <input
          type="text"
          value={draft}
          autoFocus
          onChange={(e) => setDraft(e.target.value)}
        />
      )}
      <div className="editable-field-actions">
        <button className="edit-btn small" onClick={handleSave} disabled={saving}>
          {saving ? "Menyimpan..." : "Simpan"}
        </button>
        <button
          className="edit-btn small outline"
          onClick={() => setEditing(false)}
          disabled={saving}
        >
          Batal
        </button>
      </div>
    </div>
  );
}
