"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function LoginPage() {
  const [mode, setMode] = useState("login"); // "login" | "forgot"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (signInError) {
      const msg = signInError.message || "";
      if (msg.toLowerCase().includes("email not confirmed")) {
        setError(
          "Email akun ini belum dikonfirmasi. Konfirmasi dulu lewat Supabase → Authentication → Users → klik akunnya → cari opsi konfirmasi email."
        );
      } else if (msg.toLowerCase().includes("invalid login credentials")) {
        setError("Email atau password salah.");
      } else {
        setError(msg || "Gagal masuk. Coba lagi.");
      }
      return;
    }
    router.push("/");
  }

  async function handleForgot(e) {
    e.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setNotice(
      "Kalau email itu terdaftar sebagai admin, tautan untuk membuat password baru sudah dikirim. Cek inbox (dan folder spam)."
    );
  }

  if (mode === "forgot") {
    return (
      <div className="login-page">
        <form className="login-card" onSubmit={handleForgot}>
          <div className="login-eyebrow">UKK RISPI</div>
          <h1>Lupa Password</h1>
          <p className="login-sub">
            Masukkan email admin kamu, kami kirim tautan untuk membuat
            password baru.
          </p>
          <label>
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@contoh.com"
            />
          </label>
          {error && <div className="login-error">{error}</div>}
          {notice && <div className="login-notice">{notice}</div>}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Mengirim..." : "Kirim Tautan Reset"}
          </button>
          <button
            type="button"
            className="login-back-link"
            onClick={() => {
              setMode("login");
              setError("");
              setNotice("");
            }}
          >
            &larr; Kembali ke halaman masuk
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-eyebrow">UKK RISPI</div>
        <h1>Masuk sebagai Admin</h1>
        <p className="login-sub">
          Login untuk mengelola konten website. Bukan admin? Kembali ke{" "}
          <a href="/">beranda</a>.
        </p>
        <label>
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@contoh.com"
          />
        </label>
        <label>
          Password
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </label>
        {error && <div className="login-error">{error}</div>}
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Memproses..." : "Masuk"}
        </button>
        <button
          type="button"
          className="login-back-link"
          onClick={() => {
            setMode("forgot");
            setError("");
            setNotice("");
          }}
        >
          Lupa password?
        </button>
      </form>
    </div>
  );
}
