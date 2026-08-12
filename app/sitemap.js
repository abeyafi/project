import { supabase } from "../lib/supabaseClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ukk-rispi.vercel.app";

// Selalu ambil data terbaru saat sitemap diminta (bukan cuma snapshot
// waktu build), supaya artikel baru langsung ikut muncul tanpa perlu
// redeploy.
export const dynamic = "force-dynamic";

export default async function sitemap() {
  const staticRoutes = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/berita`, changeFrequency: "daily", priority: 0.8 },
  ].map((r) => ({ ...r, lastModified: new Date() }));

  let articleRoutes = [];
  try {
    const { data } = await supabase
      .from("articles")
      .select("slug, updated_at")
      .eq("status", "published");
    articleRoutes = (data || []).map((a) => ({
      url: `${SITE_URL}/berita/${a.slug}`,
      lastModified: a.updated_at ? new Date(a.updated_at) : new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    }));
  } catch (err) {
    // Kalau Supabase belum siap / env var belum diisi saat build,
    // sitemap tetap jalan dengan rute statis saja, tidak sampai gagal.
  }

  return [...staticRoutes, ...articleRoutes];
}
