import { NextResponse } from "next/server";
import type { ApiResponse, EsportsOverview, LeagueStandings, SportMatch } from "@/types";
import { fetchWithTimeout, getCache, setCache } from "@/lib/cache";
import {
  LEAGUES,
  normalizeScoreboard,
  normalizeStandings,
} from "@/lib/esports";

export const dynamic = "force-dynamic";

const TTL_MS = 5 * 60 * 1000;
const KEY = "esportes:v2";
const BASE = "https://site.api.espn.com/apis";
const HEADERS = { "User-Agent": "MeuRadar/1.0" };
const DAY = 86400000;

function monthKeys(): string[] {
  const now = new Date();
  const keys = [`${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, "0")}`];
  const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  keys.push(`${next.getUTCFullYear()}${String(next.getUTCMonth() + 1).padStart(2, "0")}`);
  return keys;
}

function within(match: SportMatch, from: number, to: number): boolean {
  if (!match.startsAt) return false;
  const time = new Date(match.startsAt).getTime();
  return time >= from && time <= to;
}

function classify(matches: SportMatch[]): Pick<EsportsOverview, "live" | "upcoming" | "finished"> {
  const now = Date.now();
  const withDate = matches.filter((m) => m.startsAt || m.status !== "pre");
  const live = withDate.filter((m) => m.status === "live");
  const upcoming = withDate
    .filter((m) => m.status === "pre" && within(m, now, now + 7 * DAY))
    .sort((a, b) => new Date(a.startsAt!).getTime() - new Date(b.startsAt!).getTime());
  const finished = withDate
    .filter((m) => m.status === "post" && within(m, now - 3 * DAY, now))
    .sort((a, b) => new Date(b.startsAt!).getTime() - new Date(a.startsAt!).getTime());

  return {
    live: live.slice(0, 12),
    upcoming: upcoming.slice(0, 15),
    finished: finished.slice(0, 12),
  };
}

async function loadScoreboards(months: string[]): Promise<SportMatch[]> {
  const settled = await Promise.allSettled(
    LEAGUES.flatMap((league) =>
      months.map(async (month) => {
        const res = await fetchWithTimeout(
          `${BASE}/site/v2/sports/soccer/${league.id}/scoreboard?dates=${month}&limit=200`,
          8000,
          { headers: HEADERS }
        );
        if (!res.ok) throw new Error(`${league.id} ${res.status}`);
        return normalizeScoreboard(await res.json(), league);
      })
    )
  );

  const seen = new Set<string>();
  const matches: SportMatch[] = [];
  for (const result of settled) {
    if (result.status !== "fulfilled") continue;
    for (const match of result.value) {
      if (seen.has(match.id)) continue;
      seen.add(match.id);
      matches.push(match);
    }
  }
  return matches;
}

async function loadStandings(season: number): Promise<LeagueStandings[]> {
  const withTable = LEAGUES.filter((league) => league.standings);
  const settled = await Promise.allSettled(
    withTable.map(async (league): Promise<LeagueStandings> => {
      const url = `${BASE}/v2/sports/soccer/${league.id}/standings?season=${season}`;
      let res = await fetchWithTimeout(url, 8000, { headers: HEADERS });
      let table = res.ok ? normalizeStandings(await res.json(), league) : { leagueId: league.id, name: league.name, groups: [] };

      if (table.groups.length === 0 && league.fallbackSeason) {
        const fallback = await fetchWithTimeout(
          `${BASE}/v2/sports/soccer/${league.id}/standings?season=${league.fallbackSeason}`,
          8000,
          { headers: HEADERS }
        );
        if (fallback.ok) {
          const previous = normalizeStandings(await fallback.json(), league);
          if (previous.groups.length > 0) table = previous;
        }
      }
      if (table.groups.length === 0) throw new Error(`${league.id} sem tabela`);
      return table;
    })
  );

  return settled
    .filter((result): result is PromiseFulfilledResult<LeagueStandings> => result.status === "fulfilled")
    .map((result) => result.value)
    .filter((table) => table.groups.length > 0);
}

function empty(): NextResponse<ApiResponse<EsportsOverview>> {
  return NextResponse.json({
    source: "demo",
    updatedAt: new Date().toISOString(),
    data: { live: [], upcoming: [], finished: [], standings: [] },
  });
}

export async function GET(): Promise<NextResponse<ApiResponse<EsportsOverview>>> {
  const cached = getCache<ApiResponse<EsportsOverview>>(KEY);
  if (cached) return NextResponse.json(cached);

  const season = new Date().getUTCFullYear();
  const [matches, standings] = await Promise.all([
    loadScoreboards(monthKeys()),
    loadStandings(season),
  ]);

  if (matches.length === 0 && standings.length === 0) return empty();

  const payload: ApiResponse<EsportsOverview> = {
    source: "live",
    updatedAt: new Date().toISOString(),
    data: { ...classify(matches), standings },
  };
  setCache(KEY, payload, TTL_MS);
  return NextResponse.json(payload);
}
