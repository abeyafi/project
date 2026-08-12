const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ukk-rispi.vercel.app";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/login", "/reset-password", "/unauthorized"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
