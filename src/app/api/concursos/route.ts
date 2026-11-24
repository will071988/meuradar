import { NextResponse } from "next/server";
import type { ApiResponse, ConcursoItem } from "@/types";
import { fetchWithTimeout, getCache, setCache } from "@/lib/cache";
import { timeAgo } from "@/lib/format";
import { parseRss } from "@/lib/rss";
import { classifyConcurso } from "@/lib/concursos";

export const dynamic = "force-dynamic";

const TTL_MS = 15 * 60 * 1000;
const KEY = "concursos:v1";
// O feed /concursos/ do G1 está congelado em 2018; /trabalho/ é atualizado diariamente.
const FEED = "https://g1.globo.com/rss/g1/trabalho/";

export async function GET(): Promise<NextResponse<ApiResponse<ConcursoItem[]>>> {
  const cached = getCache<ApiResponse<ConcursoItem[]>>(KEY);
  if (cached) return NextResponse.json(cached);

  const demo = (): NextResponse<ApiResponse<ConcursoItem[]>> =>
    NextResponse.json({ source: "demo", updatedAt: new Date().toISOString(), data: [] });

  try {
    const res = await fetchWithTimeout(FEED, 9000, {
      headers: { "User-Agent": "MeuRadar/1.0" },
    });
    if (!res.ok) throw new Error(`RSS ${res.status}`);

    const data: ConcursoItem[] = parseRss(await res.text(), 40)
      .map((item, index) => {
        const category = classifyConcurso(item.title);
        if (!category) return null;
        return {
          id: `concurso-${index}`,
          title: item.title,
          description: (item.description || "Acesse a reportagem para mais detalhes.").slice(0, 160),
          time: item.publishedAt ? timeAgo(item.publishedAt) : "Agora",
          category,
        } satisfies ConcursoItem;
      })
      .filter((item): item is ConcursoItem => item !== null)
      .slice(0, 8);

    if (data.length === 0) return demo();

    const payload: ApiResponse<ConcursoItem[]> = {
      source: "live",
      updatedAt: new Date().toISOString(),
      data,
    };
    setCache(KEY, payload, TTL_MS);
    return NextResponse.json(payload);
  } catch {
    return demo();
  }
}
