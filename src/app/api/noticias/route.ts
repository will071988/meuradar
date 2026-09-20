import { NextResponse } from "next/server";
import type { ApiResponse, NewsItem } from "@/types";
import { newsMock } from "@/data/mock";
import { fetchWithTimeout, getCache, setCache } from "@/lib/cache";
import { timeAgo } from "@/lib/format";

export const dynamic = "force-dynamic";

const TTL_MS = 15 * 60 * 1000;
const KEY = "noticias:v1";

interface NewsApiArticle {
  title?: string;
  description?: string | null;
  publishedAt?: string;
  source?: { name?: string };
}

interface NewsApiResponse {
  status?: string;
  articles?: NewsApiArticle[];
}

export async function GET(): Promise<NextResponse<ApiResponse<NewsItem[]>>> {
  const cached = getCache<ApiResponse<NewsItem[]>>(KEY);
  if (cached) return NextResponse.json(cached);

  const apiKey = process.env.NEWS_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json({
      source: "demo",
      updatedAt: new Date().toISOString(),
      data: newsMock,
    });
  }

  try {
    const res = await fetchWithTimeout(
      `https://newsapi.org/v2/top-headlines?country=br&pageSize=8&apiKey=${encodeURIComponent(apiKey)}`
    );
    if (!res.ok) throw new Error("news");
    const json = (await res.json()) as NewsApiResponse;
    const articles = (json.articles ?? []).filter((a) => a.title && a.title !== "[Removed]");

    if (articles.length === 0) throw new Error("empty");

    const data: NewsItem[] = articles.slice(0, 6).map((a, i) => ({
      id: `live-${i}`,
      category: a.source?.name?.toUpperCase().slice(0, 24) || "BRASIL",
      title: a.title as string,
      description: (a.description || "Leia a cobertura completa.").slice(0, 160),
      time: a.publishedAt ? timeAgo(a.publishedAt) : "Agora",
    }));

    const payload: ApiResponse<NewsItem[]> = {
      source: "live",
      updatedAt: new Date().toISOString(),
      data,
    };
    setCache(KEY, payload, TTL_MS);
    return NextResponse.json(payload);
  } catch {
    return NextResponse.json({
      source: "demo",
      updatedAt: new Date().toISOString(),
      data: newsMock,
    });
  }
}
