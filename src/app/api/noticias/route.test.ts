// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/cache", () => ({
  getCache: () => null,
  setCache: () => undefined,
  fetchWithTimeout: (url: string) => globalThis.fetch(url),
}));

const rss = (titles: string[]) => `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
${titles.map((t, i) => `<item>
  <title>${t}</title>
  <link>https://g1.globo.com/noticia-${i}.ghtml</link>
  <description><![CDATA[<p>Descrição ${i}</p>]]></description>
  <pubDate>Sun, 22 Nov 2026 19:0${i}:00 GMT</pubDate>
</item>`).join("")}
</channel></rss>`;

function stubFetch(handler: (url: string) => Response | Promise<Response>) {
  vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => handler(String(input))));
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("GET /api/noticias", () => {
  it("busca RSS público sem chave e normaliza as manchetes", async () => {
    stubFetch((url) => new Response(rss(url.includes("ge.globo") ? ["Jogo decisivo"] : ["Manchete principal", "Outra notícia"]), { status: 200 }));

    const { GET } = await import("@/app/api/noticias/route");
    const res = await GET();
    const body = (await res.json()) as {
      source: string;
      data: { id: string; category: string; title: string; description: string; time: string }[];
    };

    expect(res.status).toBe(200);
    expect(body.source).toBe("live");
    expect(body.data).toHaveLength(3);
    expect(body.data[0]).toMatchObject({
      id: "g1-0",
      category: "G1",
      title: "Manchete principal",
      description: "Descrição 0",
    });
    expect(body.data[2]).toMatchObject({ id: "ge-0", category: "Esportes", title: "Jogo decisivo" });
    expect(body.data[0]?.time).toMatch(/^Há \d+ (min|horas?|dias?)/);
  });

  it("faz duas chamadas de rede (G1 e GE) sem nenhuma chave", async () => {
    const fetchMock = vi.fn(async (_input: RequestInfo | URL) => new Response(rss(["Título"]), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const { GET } = await import("@/app/api/noticias/route");
    await GET();

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("g1.globo.com/rss/g1");
    expect(String(fetchMock.mock.calls[1]?.[0])).toContain("ge.globo.com/rss/ge");
  });

  it("feed indisponível → demo, nunca exceção", async () => {
    stubFetch(() => new Response("forbidden", { status: 403 }));

    const { GET } = await import("@/app/api/noticias/route");
    const res = await GET();
    const body = (await res.json()) as { source: string; data: unknown[] };

    expect(res.status).toBe(200);
    expect(body.source).toBe("demo");
    expect(body.data.length).toBeGreaterThan(0);
  });

  it("feed vazio → demo", async () => {
    stubFetch(() => new Response("<rss><channel></channel></rss>", { status: 200 }));

    const { GET } = await import("@/app/api/noticias/route");
    const body = (await (await GET()).json()) as { source: string };
    expect(body.source).toBe("demo");
  });
});
