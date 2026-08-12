"use client";

import { useCallback, useState } from "react";
import Cropper from "react-easy-crop";
import { getCroppedImageBlob } from "../lib/cropImage";

export default function ImageCropper({ file, aspect = 1, onCancel, onConfirm }) {
  const [imageSrc] = useState(() => URL.createObjectURL(file));
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [working, setWorking] = useState(false);

  // Sengaja TIDAK direvoke lewat useEffect cleanup — di React Strict Mode
  // (dev), efek di-mount/unmount/mount lagi secara sengaja, yang bikin URL
  // ini langsung ke-revoke sebelum gambarnya sempat termuat (layar jadi
  // hitam). Revoke manual saja persis di titik selesai dipakai (Batal atau
  // sesudah crop diterapkan).
  function cleanupAndCancel() {
    URL.revokeObjectURL(imageSrc);
    onCancel();
  }

  const onCropComplete = useCallback((_area, areaPixels) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  async function handleApply() {
    if (!croppedAreaPixels) return;
    setWorking(true);
    const blob = await getCroppedImageBlob(imageSrc, croppedAreaPixels, rotation);
    URL.revokeObjectURL(imageSrc);
    setWorking(false);
    onConfirm(blob);
  }

  return (
    <div className="cropper-backdrop">
      <div className="cropper-modal">
        <div className="cropper-header">Edit Foto</div>

        <div className="cropper-stage">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="cropper-controls">
          <label className="cropper-slider">
            Zoom
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
            />
          </label>
          <div className="cropper-rotate-btns">
            <button type="button" onClick={() => setRotation((r) => r - 90)}>
              &#8634; Putar
            </button>
            <button type="button" onClick={() => setRotation((r) => r + 90)}>
              &#8635; Putar
            </button>
          </div>
        </div>

        <div className="cropper-actions">
          <button className="edit-btn outline" onClick={cleanupAndCancel} disabled={working}>
            Batal
          </button>
          <button className="edit-btn" onClick={handleApply} disabled={working}>
            {working ? "Memproses..." : "Terapkan Crop"}
          </button>
        </div>
      </div>
    </div>
  );
}

