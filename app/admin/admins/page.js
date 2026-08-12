"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useAdmin } from "../../../hooks/useAdmin";
import { logActivity } from "../../../lib/activityLog";

export default function AdminAdminsPage() {
  const { session } = useAdmin();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("admin");
  const [inviteError, setInviteError] = useState("");
  const [inviteBusy, setInviteBusy] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null); // { admin, action, nextValue }

  async function load() {
    const { data } = await supabase.from("admins").select("*").order("created_at", { ascending: true });
    setAdmins(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleInvite(e) {
    e.preventDefault();
    setInviteError("");
    setInviteBusy(true);
    const { data, error } = await supabase.rpc("add_admin_by_email", {
      p_email: inviteEmail.trim(),
      p_role: inviteRole,
    });
    setInviteBusy(false);
    if (error) {
      setInviteError(error.message);
      return;
    }
    setAdmins((prev) => {
      const exists = prev.some((a) => a.id === data.id);
      return exists ? prev.map((a) => (a.id === data.id ? data : a)) : [...prev, data];
    });
    logActivity({
      action: "role_change",
      entityType: "admins",
      entityId: data.id,
      description: `Menambahkan admin baru: ${data.email} (role: ${data.role})`,
    });
    setShowInvite(false);
    setInviteEmail("");
    setInviteRole("admin");
  }

  function askConfirm(admin, action, nextValue) {
    setConfirmTarget({ admin, action, nextValue });
  }

  async function runConfirmed() {
    const { admin, action, nextValue } = confirmTarget;
    setConfirmTarget(null);

    if (action === "role") {
      const { data, error } = await supabase
        .from("admins")
        .update({ role: nextValue, updated_at: new Date().toISOString() })
        .eq("id", admin.id)
        .select()
        .single();
      if (error) return alert(error.message);
      setAdmins((prev) => prev.map((a) => (a.id === admin.id ? data : a)));
      logActivity({
        action: "role_change",
        entityType: "admins",
        entityId: admin.id,
        description: `Role admin diubah dari ${admin.role} menjadi ${nextValue} (${admin.email})`,
      });
    } else if (action === "active") {
      const { data, error } = await supabase
        .from("admins")
        .update({ is_active: nextValue, updated_at: new Date().toISOString() })
        .eq("id", admin.id)
        .select()
        .single();
      if (error) return alert(error.message);
      setAdmins((prev) => prev.map((a) => (a.id === admin.id ? data : a)));
      logActivity({
        action: nextValue ? "update" : "update",
        entityType: "admins",
        entityId: admin.id,
        description: `${nextValue ? "Mengaktifkan" : "Menonaktifkan"} admin: ${admin.email}`,
      });
    } else if (action === "delete") {
      const { error } = await supabase.from("admins").delete().eq("id", admin.id);
      if (error) return alert(error.message);
      setAdmins((prev) => prev.filter((a) => a.id !== admin.id));
      logActivity({
        action: "delete",
        entityType: "admins",
        entityId: admin.id,
        description: `Menghapus admin: ${admin.email}`,
      });
    }
  }

  if (loading) return <div className="admin-loading">Memuat...</div>;

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <h1>Kelola Admin</h1>
        <p>Hanya Super Admin yang dapat mengelola akun admin lain.</p>
      </div>

      <button className="edit-btn" onClick={() => setShowInvite(true)} style={{ marginBottom: 24 }}>
        + Tambah Admin
      </button>

      <div className="admin-list-table-wrap">
        <table className="admin-log-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Dibuat</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((a) => {
              const isSelf = a.id === session?.user?.id;
              return (
                <tr key={a.id}>
                  <td>{a.email}</td>
                  <td>
                    <span className={`role-badge ${a.role === "super_admin" ? "super" : "admin"}`}>
                      {a.role === "super_admin" ? "Super Admin" : "Admin"}
                    </span>
                  </td>
                  <td>
                    <span className={`status-dot ${a.is_active ? "on" : "off"}`}></span>
                    {a.is_active ? "Aktif" : "Nonaktif"}
                  </td>
                  <td>{new Date(a.created_at).toLocaleDateString("id-ID")}</td>
                  <td>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <button
                        className="edit-btn small outline"
                        disabled={isSelf}
                        title={isSelf ? "Tidak bisa mengubah role sendiri" : ""}
                        onClick={() =>
                          askConfirm(a, "role", a.role === "super_admin" ? "admin" : "super_admin")
                        }
                      >
                        Jadikan {a.role === "super_admin" ? "Admin" : "Super Admin"}
                      </button>
                      <button
                        className="edit-btn small outline"
                        disabled={isSelf}
                        title={isSelf ? "Tidak bisa mengubah status sendiri" : ""}
                        onClick={() => askConfirm(a, "active", !a.is_active)}
                      >
                        {a.is_active ? "Nonaktifkan" : "Aktifkan"}
                      </button>
                      <button
                        className="edit-btn small danger"
                        disabled={isSelf}
                        title={isSelf ? "Tidak bisa menghapus akun sendiri" : ""}
                        onClick={() => askConfirm(a, "delete", null)}
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showInvite && (
        <div className="cropper-backdrop">
          <div className="cropper-modal admin-invite-modal">
            <div className="cropper-header">Tambah Admin</div>
            <form onSubmit={handleInvite} className="admin-invite-form">
              <label>
                Email
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="nama@contoh.com"
                />
              </label>
              <p className="admin-invite-note">
                Orang ini harus sudah punya akun (dibuat lewat Authentication
                → Add User di Supabase). Kalau belum ada, buat dulu di sana
                sebelum diundang di sini.
              </p>
              <label>
                Role
                <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </label>
              {inviteError && <div className="login-error">{inviteError}</div>}
              <div className="cropper-actions" style={{ padding: "16px 0 0" }}>
                <button
                  type="button"
                  className="edit-btn outline"
                  onClick={() => setShowInvite(false)}
                  disabled={inviteBusy}
                >
                  Batal
                </button>
                <button type="submit" className="edit-btn" disabled={inviteBusy}>
                  {inviteBusy ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmTarget && (
        <div className="cropper-backdrop">
          <div className="cropper-modal admin-confirm-modal">
            <div className="cropper-header">Konfirmasi</div>
            <div className="admin-confirm-body">
              {confirmTarget.action === "role" && (
                <p>
                  Anda akan menjadikan <b>{confirmTarget.admin.email}</b>{" "}
                  sebagai <b>{confirmTarget.nextValue === "super_admin" ? "Super Admin" : "Admin"}</b>.
                  {confirmTarget.nextValue === "super_admin" && (
                    <> Super Admin memiliki akses penuh terhadap website dan sistem administrasi.</>
                  )}{" "}
                  Lanjutkan?
                </p>
              )}
              {confirmTarget.action === "active" && (
                <p>
                  {confirmTarget.nextValue ? "Aktifkan kembali" : "Nonaktifkan"} akun{" "}
                  <b>{confirmTarget.admin.email}</b>?
                  {!confirmTarget.nextValue && " Mereka tidak akan bisa mengakses dashboard admin sampai diaktifkan lagi."}
                </p>
              )}
              {confirmTarget.action === "delete" && (
                <p>
                  Hapus permanen akun admin <b>{confirmTarget.admin.email}</b>? Tindakan ini
                  tidak bisa dibatalkan.
                </p>
              )}
            </div>
            <div className="cropper-actions">
              <button className="edit-btn outline" onClick={() => setConfirmTarget(null)}>
                Batal
              </button>
              <button className="edit-btn danger" onClick={runConfirmed}>
                Konfirmasi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
