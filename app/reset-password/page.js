"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function ResetPasswordPage() {
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Link recovery dari email otomatis membuat sesi sementara begitu
    // halaman ini dibuka. Kita cukup tunggu event PASSWORD_RECOVERY /
    // sesi aktif sebelum menampilkan form.
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        setReady(true);
      }
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }
    if (password !== confirm) {
      setError("Konfirmasi password tidak sama.");
      return;
    }
    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/admin"), 2000);
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-eyebrow">UKK RISPI</div>
        <h1>Buat Password Baru</h1>

        {!ready && !done && (
          <p className="login-sub">
            Memuat tautan reset... Kalau halaman ini terbuka langsung tanpa
            lewat email, tautannya mungkin sudah kedaluwarsa — minta kirim
            ulang dari halaman{" "}
            <a href="/login">masuk &rarr; lupa password</a>.
          </p>
        )}

        {ready && !done && (
          <form onSubmit={handleSubmit}>
            <p className="login-sub">Masukkan password baru untuk akunmu.</p>
            <label>
              Password baru
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </label>
            <label>
              Ulangi password baru
              <input
                type="password"
                required
                minLength={6}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
              />
            </label>
            {error && <div className="login-error">{error}</div>}
            <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 6 }}>
              {loading ? "Menyimpan..." : "Simpan Password Baru"}
            </button>
          </form>
        )}

        {done && (
          <p className="login-notice">
            Password berhasil diganti. Mengarahkan ke dashboard...
          </p>
        )}
      </div>
    </div>
  );
}
