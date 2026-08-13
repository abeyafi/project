/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  async headers() {
    return [
      {
        // Berlaku di semua halaman
        source: "/:path*",
        headers: [
          {
            // Cegah situs ini dibuka di dalam <iframe> milik situs lain
            // (proteksi clickjacking).
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            // Cegah browser "menebak" tipe file yang salah dari isi
            // konten (proteksi terhadap sebagian trik upload berbahaya).
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            // Kurangi info URL asal yang dikirim ke situs lain saat
            // pengunjung klik keluar dari situs ini.
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            // Matikan akses ke fitur browser yang tidak dipakai situs
            // ini sama sekali (kamera, mikrofon, lokasi).
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            // Paksa browser selalu pakai HTTPS untuk domain ini ke
            // depannya (Vercel sudah otomatis HTTPS, ini header
            // tambahan supaya browser mengingatnya sendiri).
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
