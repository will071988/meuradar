import { NextRequest, NextResponse } from "next/server";
import type { ApiResponse, MatchTrackerData } from "@/types";
import { fetchWithTimeout, getCache, setCache } from "@/lib/cache";
import { normalizeSummary } from "@/lib/tracker";

export const dynamic = "force-dynamic";

const BASE = "https://site.api.espn.com/apis/site/v2/sports/soccer/bra.1/summary";
const LIVE_TTL = 10_000;
const FINAL_TTL = 5 * 60 * 1000;

function empty(eventId: string): NextResponse<ApiResponse<MatchTrackerData>> {
  return NextResponse.json({
    source: "demo",
    updatedAt: new Date().toISOString(),
    data: { eventId, home: emptyTeam(), away: emptyTeam(), status: "pre", clock: "—", events: [] },
  });
}

function emptyTeam(): MatchTrackerData["home"] {
  return { id: "", name: "—", abbreviation: "—", color: "#94a3b8", score: 0, players: [] };
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<MatchTrackerData> | { error: string }>> {
  const eventId = request.nextUrl.searchParams.get("event")?.trim() ?? "";
  if (!/^\d+$/.test(eventId)) {
    return NextResponse.json({ error: "event inválido" }, { status: 400 });
  }

  const key = `tracker:${eventId}`;
  const cached = getCache<ApiResponse<MatchTrackerData>>(key);
  if (cached) return NextResponse.json(cached);

  try {
    const res = await fetchWithTimeout(`${BASE}?event=${eventId}`, 9000, {
      headers: { "User-Agent": "MeuRadar/1.0" },
    });
    if (!res.ok) throw new Error(`ESPN ${res.status}`);

    const data = normalizeSummary(await res.json(), eventId);
    const payload: ApiResponse<MatchTrackerData> = {
      source: "live",
      updatedAt: new Date().toISOString(),
      data,
    };
    setCache(key, payload, data.status === "in" ? LIVE_TTL : FINAL_TTL);
    return NextResponse.json(payload);
  } catch {
    return empty(eventId);
  }
}
