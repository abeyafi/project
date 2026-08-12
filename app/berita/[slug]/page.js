import { supabase } from "../../../lib/supabaseClient";
import ArticleDetailClient from "./ArticleDetailClient";

export async function generateMetadata({ params }) {
  const { data: article } = await supabase
    .from("articles")
    .select("title, excerpt, thumbnail_url, category")
    .eq("slug", params.slug)
    .eq("status", "published")
    .maybeSingle();

  if (!article) {
    return { title: "Berita" };
  }

  const description = article.excerpt || undefined;

  return {
    title: article.title,
    description,
    openGraph: {
      type: "article",
      title: article.title,
      description,
      images: article.thumbnail_url ? [{ url: article.thumbnail_url }] : undefined,
    },
    twitter: {
      card: article.thumbnail_url ? "summary_large_image" : "summary",
      title: article.title,
      description,
      images: article.thumbnail_url ? [article.thumbnail_url] : undefined,
    },
  };
}

export default function ArticleDetailPage({ params }) {
  return <ArticleDetailClient slug={params.slug} />;
}
