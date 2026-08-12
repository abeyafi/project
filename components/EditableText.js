"use client";

import { useState } from "react";

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
          rows={3}
          value={draft}
          autoFocus
          onChange={(e) => setDraft(e.target.value)}
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
