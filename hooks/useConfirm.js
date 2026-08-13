"use client";

import { useCallback, useRef, useState } from "react";

// Hook: const { confirm, ConfirmDialog } = useConfirm();
// Panggil `await confirm("Pesan konfirmasi...")` -- mengembalikan
// Promise<boolean> (true kalau user klik Konfirmasi), menggantikan
// window.confirm() bawaan browser dengan modal yang sesuai desain
// situs ini.
export function useConfirm() {
  const [state, setState] = useState(null); // { message, danger }
  const resolveRef = useRef(null);

  const confirm = useCallback((message, opts = {}) => {
    setState({ message, danger: opts.danger !== false });
    return new Promise((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  function handle(result) {
    setState(null);
    if (resolveRef.current) {
      resolveRef.current(result);
      resolveRef.current = null;
    }
  }

  const ConfirmDialog = state ? (
    <div className="cropper-backdrop" role="alertdialog" aria-modal="true">
      <div className="cropper-modal admin-confirm-modal">
        <div className="cropper-header">Konfirmasi</div>
        <div className="admin-confirm-body">
          <p>{state.message}</p>
        </div>
        <div className="cropper-actions">
          <button className="edit-btn outline" onClick={() => handle(false)}>
            Batal
          </button>
          <button
            className={`edit-btn${state.danger ? " danger" : ""}`}
            onClick={() => handle(true)}
            autoFocus
          >
            Konfirmasi
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return { confirm, ConfirmDialog };
}
