// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const fetchMock = vi.fn(async (_url: string) => new Response("{}", { status: 200 }));

vi.mock("@/lib/cache", () => ({
  getCache: () => null,
  setCache: () => undefined,
  fetchWithTimeout: (url: string) => fetchMock(url),
}));

afterEach(() => {
  fetchMock.mockReset();
  fetchMock.mockResolvedValue(new Response("{}", { status: 200 }));
});

function request(url = "http://localhost/api/esportes/tracker?event=401841321") {
  return new NextRequest(url);
}

describe("GET /api/esportes/tracker", () => {
  it("rejeita event inválido", async () => {
    const { GET } = await import("@/app/api/esportes/tracker/route");
    const res = await GET(request("http://localhost/api/esportes/tracker?event=abc"));
    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("retorna o rastreador normalizado em modo live", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({
      header: { competitions: [{ status: { type: { state: "in", shortDetail: "70'" } }, competitors: [] }] },
      rosters: [{ homeAway: "home", team: { id: "1", displayName: "Casa" }, roster: [
        { starter: true, jersey: "9", formationPlace: "9", athlete: { shortName: "Atacante" } },
      ] }],
      keyEvents: [],
    }), { status: 200 }));

    const { GET } = await import("@/app/api/esportes/tracker/route");
    const res = await GET(request());
    const body = (await res.json()) as { source: string; data: { status: string; home: { players: unknown[] } } };

    expect(res.status).toBe(200);
    expect(body.source).toBe("live");
    expect(body.data.status).toBe("in");
    expect(body.data.home.players).toHaveLength(1);
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("event=401841321");
  });

  it("falha upstream → resposta demo sem exceção", async () => {
    fetchMock.mockResolvedValue(new Response("forbidden", { status: 403 }));
    const { GET } = await import("@/app/api/esportes/tracker/route");
    const res = await GET(request());
    const body = (await res.json()) as { source: string };
    expect(res.status).toBe(200);
    expect(body.source).toBe("demo");
  });
});
