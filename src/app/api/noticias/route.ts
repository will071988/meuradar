import { NextResponse } from "next/server";
import type { ApiResponse, NewsItem } from "@/types";
import { newsMock } from "@/data/mock";
import { fetchWithTimeout, getCache, setCache } from "@/lib/cache";
import { timeAgo } from "@/lib/format";
import { parseRss } from "@/lib/rss";

export const dynamic = "force-dynamic";

const TTL_MS = 15 * 60 * 1000;
const KEY = "noticias:v1";

/** Feeds públicos — nenhuma chave de API necessária. */
const FEEDS = [
  { url: "https://g1.globo.com/rss/g1/", category: "G1", prefix: "g1", take: 4 },
  { url: "https://ge.globo.com/rss/ge/", category: "Esportes", prefix: "ge", take: 2 },
] as const;

function demo(): NextResponse<ApiResponse<NewsItem[]>> {
  return NextResponse.json({
    source: "demo",
    updatedAt: new Date().toISOString(),
    data: newsMock,
  });
}

export async function GET(): Promise<NextResponse<ApiResponse<NewsItem[]>>> {
  const cached = getCache<ApiResponse<NewsItem[]>>(KEY);
  if (cached) return NextResponse.json(cached);

  const results = await Promise.allSettled(
    FEEDS.map(async (feed) => {
      const res = await fetchWithTimeout(feed.url, 9000, {
        headers: { "User-Agent": "MeuRadar/1.0" },
      });
      if (!res.ok) throw new Error(`RSS ${res.status}`);
      return { feed, items: parseRss(await res.text(), feed.take) };
    })
  );

  const data: NewsItem[] = [];
  for (const result of results) {
    if (result.status !== "fulfilled") continue;
    const { feed, items } = result.value;
    items.forEach((item, index) => {
      data.push({
        id: `${feed.prefix}-${index}`,
        category: feed.category,
        title: item.title,
        description: (item.description || "Leia a cobertura completa.").slice(0, 160),
        time: item.publishedAt ? timeAgo(item.publishedAt) : "Agora",
      });
    });
  }

  if (data.length === 0) return demo();

  const payload: ApiResponse<NewsItem[]> = {
    source: "live",
    updatedAt: new Date().toISOString(),
    data,
  };
  setCache(KEY, payload, TTL_MS);
  return NextResponse.json(payload);
}
