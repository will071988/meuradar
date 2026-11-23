// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

const isoOffset = (days: number, hour = 19) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  d.setUTCHours(hour, 0, 0, 0);
  return d.toISOString();
};

const event = (id: string, state: string, date: string, scores?: [string, string]) => ({
  id,
  date,
  competitions: [{
    status: { type: { state, shortDetail: state === "post" ? "FT" : state === "in" ? "70'" : "Scheduled" } },
    competitors: [
      { homeAway: "home", team: { displayName: "Casa" }, score: scores?.[0] },
      { homeAway: "away", team: { displayName: "Fora" }, score: scores?.[1] },
    ],
  }],
});

const fetchMock = vi.fn(async (url: string) => {
  if (url.includes("/standings")) {
    return new Response(JSON.stringify({ children: [
      { name: "Group A", standings: { entries: [
        { team: { displayName: "Casa" }, stats: [{ name: "rank", value: 1 }, { name: "points", value: 6 }, { name: "gamesPlayed", value: 2 }] },
      ] } },
    ] }), { status: 200 });
  }
  return new Response(JSON.stringify({ events: [
    event("live", "in", isoOffset(0)),
    event("next", "pre", isoOffset(3)),
    event("done", "post", isoOffset(-1), ["2", "1"]),
  ] }), { status: 200 });
});

vi.mock("@/lib/cache", () => ({
  getCache: () => null,
  setCache: () => undefined,
  fetchWithTimeout: (url: string) => fetchMock(url),
}));

afterEach(() => fetchMock.mockClear());

describe("GET /api/esportes", () => {
  it("agrupa jogos ao vivo, próximos, encerrados e classificações", async () => {
    const { GET } = await import("@/app/api/esportes/route");
    const res = await GET();
    const body = (await res.json()) as {
      source: string;
      data: { live: unknown[]; upcoming: unknown[]; finished: { homeScore: number; awayScore: number }[]; standings: unknown[] };
    };

    expect(res.status).toBe(200);
    expect(body.source).toBe("live");
    expect(body.data.live.length).toBeGreaterThan(0);
    expect(body.data.upcoming.length).toBeGreaterThan(0);
    expect(body.data.finished[0]).toMatchObject({ homeScore: 2, awayScore: 1 });
    expect(body.data.standings.length).toBeGreaterThan(0);
  });

  it("consulta as 15 ligas em scoreboard e as com tabela em standings", async () => {
    const { GET } = await import("@/app/api/esportes/route");
    await GET();
    const urls = fetchMock.mock.calls.map((call) => call[0]!);
    const scoreboards = urls.filter((u) => u.includes("/scoreboard"));
    const standings = urls.filter((u) => u.includes("/standings"));
    expect(scoreboards.length).toBe(30); // 15 ligas × 2 meses
    expect(standings.length).toBeGreaterThan(0);
    expect(standings.length).toBeLessThan(30);
  });
});
