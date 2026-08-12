import { supabase } from "./supabaseClient";

// Catat satu baris aktivitas admin. Gagal diam-diam (tidak melempar error)
// supaya logging tidak pernah menggagalkan aksi utama (simpan/upload/dst).
export async function logActivity({ action, entityType, entityId, description }) {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData?.session?.user;
    if (!user) return;

    await supabase.from("activity_logs").insert({
      user_id: user.id,
      actor_email: user.email,
      action,
      entity_type: entityType,
      entity_id: entityId ? String(entityId) : null,
      description,
    });
  } catch (err) {
    console.warn("Gagal mencatat activity log:", err);
  }
}
