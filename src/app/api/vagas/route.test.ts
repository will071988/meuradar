// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Cache anulado: cada teste parte do zero (sem estado compartilhado).
vi.mock("@/lib/cache", () => ({
  getCache: () => null,
  setCache: () => undefined,
  fetchWithTimeout: (url: string, _timeout?: number, init?: RequestInit) =>
    globalThis.fetch(url, init),
}));

type Json = Record<string, unknown>;

function jsonResponse(body: Json, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("GET /api/vagas", () => {
  beforeEach(() => vi.resetModules());

  it("normaliza vagas de fontes múltiplas e deduplica", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.includes("arbeitnow")) {
          return jsonResponse({
            data: [
              {
                slug: "dev-1",
                title: "Dev Front",
                company_name: "Acme",
                location: "Remoto",
                remote: true,
                url: "https://exemplo.com/1",
                created_at: 1700000000,
              },
            ],
          });
        }
        if (url.includes("remotive")) {
          return jsonResponse({
            jobs: [
              {
                id: 99,
                title: "Dev Back",
                company_name: "Beta",
                candidate_required_location: "Worldwide",
                url: "https://exemplo.com/2",
                publication_date: "2026-01-01T00:00:00Z",
              },
              // duplicata vinda da outra fonte
              {
                id: 100,
                title: "Dev Front",
                company_name: "Acme",
                candidate_required_location: "Remoto",
                url: "https://exemplo.com/3",
                publication_date: "2026-01-01T00:00:00Z",
              },
            ],
          });
        }
        return jsonResponse({});
      })
    );

    const { GET } = await import("@/app/api/vagas/route");
    const res = await GET(new Request("http://localhost/api/vagas"));
    const body = (await res.json()) as { source: string; data: { title: string }[] };

    expect(body.source).toBe("live");
    expect(body.data).toHaveLength(2);
    expect(body.data.map((j) => j.title).sort()).toEqual(["Dev Back", "Dev Front"]);
  });

  it("retorna demo quando todas as fontes falham", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("offline");
      })
    );

    const { GET } = await import("@/app/api/vagas/route");
    const res = await GET(new Request("http://localhost/api/vagas"));
    const body = (await res.json()) as { source: string; data: unknown[] };

    expect(res.status).toBe(200);
    expect(body.source).toBe("demo");
    expect(body.data.length).toBeGreaterThan(0);
  });

  it("retorna demo quando as fontes respondem vazio", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse({ data: [], jobs: [] })));

    const { GET } = await import("@/app/api/vagas/route");
    const body = (await (await GET(new Request("http://localhost/api/vagas"))).json()) as {
      source: string;
    };
    expect(body.source).toBe("demo");
  });

  it("sem chave Adzuna não chama a API paga", async () => {
    delete process.env.ADZUNA_APP_ID;
    delete process.env.ADZUNA_APP_KEY;
    const fetchMock = vi.fn(async (_input: RequestInfo | URL) =>
      jsonResponse({ data: [], jobs: [] })
    );
    vi.stubGlobal("fetch", fetchMock);

    const { GET } = await import("@/app/api/vagas/route");
    await GET(new Request("http://localhost/api/vagas?q=dev&where=Rio"));

    const called = fetchMock.mock.calls.map((c) => String(c[0]));
    expect(called.some((u) => u.includes("adzuna"))).toBe(false);
  });

  it("com chave Adzuna consulta o agregador BR com q/where", async () => {
    process.env.ADZUNA_APP_ID = "id-teste";
    process.env.ADZUNA_APP_KEY = "key-teste";
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("adzuna")) {
        return jsonResponse({
          results: [
            {
              id: "az1",
              title: "Suporte Técnico",
              company: { display_name: "Empresa BR" },
              location: { display_name: "Rio de Janeiro" },
              redirect_url: "https://exemplo.com/az",
              created: "2026-01-01",
              salary_min: 3000,
              salary_max: 5000,
            },
          ],
        });
      }
      return jsonResponse({ data: [], jobs: [] });
    });
    vi.stubGlobal("fetch", fetchMock);

    try {
      const { GET } = await import("@/app/api/vagas/route");
      const body = (await (
        await GET(new Request("http://localhost/api/vagas?q=suporte&where=Rio de Janeiro"))
      ).json()) as { source: string; data: { title: string; salary?: string }[] };

      const adzunaCall = fetchMock.mock.calls
        .map((c) => String(c[0]))
        .find((u) => u.includes("adzuna"));
      expect(adzunaCall).toBeDefined();
      expect(adzunaCall).toContain("what=suporte");
      expect(adzunaCall).toContain("/jobs/br/");

      expect(body.source).toBe("live");
      expect(body.data[0]?.title).toBe("Suporte Técnico");
      expect(body.data[0]?.salary).toContain("R$");
    } finally {
      delete process.env.ADZUNA_APP_ID;
      delete process.env.ADZUNA_APP_KEY;
    }
  });
});
