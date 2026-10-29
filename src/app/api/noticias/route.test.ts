// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/cache", () => ({
  getCache: () => null,
  setCache: () => undefined,
  fetchWithTimeout: (url: string) => globalThis.fetch(url),
}));

const NEWSAPI = "newsapi.org";

const article = (title: string, extra: Record<string, unknown> = {}) => ({
  title,
  description: "Descrição.",
  publishedAt: "2026-01-01T10:00:00Z",
  source: { name: "G1" },
  ...extra,
});

function stubFetch(res: Response) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL) => {
      expect(String(input)).toContain(NEWSAPI);
      return res.clone();
    })
  );
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

beforeEach(() => {
  delete process.env.NEWS_API_KEY;
});

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.NEWS_API_KEY;
});

describe("GET /api/noticias", () => {
  it("sem chave → demo com curadoria local", async () => {
    const { GET } = await import("@/app/api/noticias/route");
    const res = await GET();
    const body = (await res.json()) as { source: string; data: unknown[] };

    expect(res.status).toBe(200);
    expect(body.source).toBe("demo");
    expect(body.data.length).toBeGreaterThan(0);
  });

  it("sem chave não faz nenhuma chamada de rede", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const { GET } = await import("@/app/api/noticias/route");
    await GET();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("com chave → manchetes ao vivo normalizadas", async () => {
    process.env.NEWS_API_KEY = "chave-de-teste";
    stubFetch(
      json({
        status: "ok",
        articles: [
          article("Título principal"),
          article("[Removed]"),
          article("Segunda manchete", { description: null }),
        ],
      })
    );

    const { GET } = await import("@/app/api/noticias/route");
    const body = (await (await GET()).json()) as {
      source: string;
      data: { id: string; category: string; title: string; description: string }[];
    };

    expect(body.source).toBe("live");
    expect(body.data).toHaveLength(2); // "[Removed]" é filtrado
    expect(body.data[0]?.category).toBe("G1");
    expect(body.data[1]?.description).toBe("Leia a cobertura completa.");
  });

  it("erro upstream → demo, nunca exceção", async () => {
    process.env.NEWS_API_KEY = "chave-de-teste";
    stubFetch(new Response("rate limited", { status: 429 }));

    const { GET } = await import("@/app/api/noticias/route");
    const res = await GET();
    const body = (await res.json()) as { source: string };

    expect(res.status).toBe(200);
    expect(body.source).toBe("demo");
  });

  it("resposta sem artigos → demo", async () => {
    process.env.NEWS_API_KEY = "chave-de-teste";
    stubFetch(json({ status: "ok", articles: [] }));

    const { GET } = await import("@/app/api/noticias/route");
    const body = (await (await GET()).json()) as { source: string };
    expect(body.source).toBe("demo");
  });

  it("a chave nunca é exposta na resposta", async () => {
    process.env.NEWS_API_KEY = "segredo-ultra-secreto-123";
    stubFetch(json({ status: "ok", articles: [article("Ok")] }));

    const { GET } = await import("@/app/api/noticias/route");
    const text = JSON.stringify(await (await GET()).json());
    expect(text).not.toContain("segredo-ultra-secreto-123");
  });
});
