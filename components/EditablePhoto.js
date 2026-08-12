"use client";

import { useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import ImageCropper from "./ImageCropper";
import { logActivity } from "../lib/activityLog";

export default function EditablePhoto({
  url,
  onSaved,
  isAdmin,
  className = "",
  alt = "",
  pathPrefix = "misc",
  children,
  cornerButton = false,
  onImageClick,
  aspect = 1,
  entityType = "media",
  entityId = null,
}) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);

  function handlePick(e) {
    const file = e.target.files?.[0];
    e.target.value = ""; // supaya pilih file yang sama lagi tetap trigger onChange
    if (!file) return;
    setPendingFile(file);
  }

  async function handleCropConfirm(blob) {
    setPendingFile(null);
    setUploading(true);

    const path = `${pathPrefix}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.webp`;

    const { error: uploadError } = await supabase.storage
      .from("media")
      .upload(path, blob, { upsert: false, contentType: "image/webp" });

    if (uploadError) {
      alert("Gagal upload foto: " + uploadError.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("media").getPublicUrl(path);
    await onSaved(data.publicUrl);
    logActivity({
      action: "upload",
      entityType,
      entityId,
      description: `Mengunggah foto baru (${pathPrefix})`,
    });
    setUploading(false);
  }

  const fileInput = (
    <input ref={inputRef} type="file" accept="image/*" onChange={handlePick} />
  );

  return (
    <div
      className={className + " editable-photo"}
      onClick={onImageClick && url ? onImageClick : undefined}
      style={onImageClick && url ? { cursor: "zoom-in" } : undefined}
    >
      {url ? <img src={url} alt={alt} /> : children}

      {isAdmin && !cornerButton && (
        <div
          className="upload-overlay"
          onClick={(e) => {
            e.stopPropagation();
            inputRef.current?.click();
          }}
        >
          <span>{uploading ? "Mengunggah..." : "Ganti foto"}</span>
          {fileInput}
        </div>
      )}

      {isAdmin && cornerButton && (
        <button
          type="button"
          className="edit-btn small photo-corner-btn"
          onClick={(e) => {
            e.stopPropagation();
            inputRef.current?.click();
          }}
        >
          {uploading ? "..." : "Ganti"}
          {fileInput}
        </button>
      )}

      {pendingFile && (
        <ImageCropper
          file={pendingFile}
          aspect={aspect}
          onCancel={() => setPendingFile(null)}
          onConfirm={handleCropConfirm}
        />
      )}
    </div>
  );
}
