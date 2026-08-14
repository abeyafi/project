import "./globals.css";
import { AdminProvider } from "../hooks/useAdmin";
import AdminBar from "../components/AdminBar";
import SecurityGuard from "../components/SecurityGuard";
import BackToTop from "../components/BackToTop";

// Ganti NEXT_PUBLIC_SITE_URL di .env.local / Vercel env vars begitu
// domain final sudah ada (vercel.app atau domain custom) — dipakai
// untuk URL kanonik, sitemap, dan link Open Graph.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ukk-rispi.vercel.app";
const SITE_NAME = "UKK RISPI — UIN Ar-Raniry";
const SITE_DESCRIPTION =
  "UKK RISPI (Unit Kegiatan Khusus Riset dan Publikasi Ilmiah) menumbuhkan budaya berpikir ilmiah di kalangan mahasiswa UIN Ar-Raniry melalui pendampingan riset, penulisan karya ilmiah, kompetisi, dan publikasi terindeks SINTA/Scopus.";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: "%s — UKK RISPI",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "UKK RISPI",
    "UIN Ar-Raniry",
    "riset mahasiswa",
    "publikasi ilmiah",
    "karya tulis ilmiah",
    "PKM",
    "organisasi riset kampus",
    "Banda Aceh",
  ],
  authors: [{ name: "UKK RISPI" }],
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "QZKjSkVFcubzxn0JZeHWNnAZ_fpwKcfSOiXKG71y-n4",
  },
  // Favicon & apple-touch-icon otomatis dipakai Next.js dari
  // app/icon.png dan app/apple-icon.png -- tidak perlu didaftarkan
  // manual di sini.
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [{ url: "/logo-rispi.png", width: 180, height: 180, alt: "Logo UKK RISPI" }],
  },
  twitter: {
    card: "summary",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: ["/logo-rispi.png"],
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "UKK RISPI",
  alternateName: "Unit Kegiatan Khusus Riset dan Publikasi Ilmiah",
  url: SITE_URL,
  logo: `${SITE_URL}/logo-rispi.png`,
  description: SITE_DESCRIPTION,
  parentOrganization: {
    "@type": "CollegeOrUniversity",
    name: "UIN Ar-Raniry Banda Aceh",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body>
        <SecurityGuard />
        <AdminProvider>
          <AdminBar />
          {children}
          <BackToTop />
        </AdminProvider>
      </body>
    </html>
  );
}

