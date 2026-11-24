// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { classifyConcurso } from "@/lib/concursos";

const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss><channel>
  <item>
    <title>Concurso para professor no Ceará tem 2,5 mil vagas</title>
    <link>https://g1.globo.com/concurso.ghtml</link>
    <description><![CDATA[<p>Salários de até R$ 3,5 mil.</p>]]></description>
    <pubDate>Sun, 22 Nov 2026 19:00:00 GMT</pubDate>
  </item>
  <item>
    <title>Resultado final do concurso do CRN é divulgado</title>
    <link>https://g1.globo.com/resultado.ghtml</link>
    <description>Confira o resultado.</description>
    <pubDate>Sun, 22 Nov 2026 18:00:00 GMT</pubDate>
  </item>
  <item>
    <title>Notícia sem relação com seleção</title>
    <link>https://g1.globo.com/outro.ghtml</link>
    <description>Outra coisa.</description>
    <pubDate>Sun, 22 Nov 2026 17:00:00 GMT</pubDate>
  </item>
</channel></rss>`;

const fetchMock = vi.fn(async (_url: string) => new Response(rss, { status: 200 }));

vi.mock("@/lib/cache", () => ({
  getCache: () => null,
  setCache: () => undefined,
  fetchWithTimeout: (url: string) => fetchMock(url),
}));

afterEach(() => fetchMock.mockClear());

describe("classifyConcurso", () => {
  it("classifica concursos, processos seletivos e resultados", () => {
    expect(classifyConcurso("Prefeitura abre concurso com 93 vagas")).toBe("Concurso");
    expect(classifyConcurso("Aberto processo seletivo com 53 vagas")).toBe("Processo seletivo");
    expect(classifyConcurso("Resultado final divulgado")).toBe("Resultado");
    expect(classifyConcurso("Shopping abre 90 vagas de emprego")).toBeNull();
    expect(classifyConcurso("Notícia qualquer")).toBeNull();
  });
});

describe("GET /api/concursos", () => {
  it("retorna apenas itens relevantes do RSS em modo live", async () => {
    const { GET } = await import("@/app/api/concursos/route");
    const res = await GET();
    const body = (await res.json()) as {
      source: string;
      data: { id: string; title: string; category: string; time: string }[];
    };

    expect(res.status).toBe(200);
    expect(body.source).toBe("live");
    expect(body.data).toHaveLength(2); // terceiro item é ignorado
    expect(body.data[0]).toMatchObject({ id: "concurso-0", category: "Concurso" });
    expect(body.data[1]).toMatchObject({ category: "Resultado" });
    expect(body.data[0]?.time).toMatch(/^Há \d+ (min|horas?|dias?)/);
  });

  it("falha upstream → demo sem exceção", async () => {
    fetchMock.mockResolvedValueOnce(new Response("forbidden", { status: 403 }));
    const { GET } = await import("@/app/api/concursos/route");
    const res = await GET();
    const body = (await res.json()) as { source: string; data: unknown[] };
    expect(res.status).toBe(200);
    expect(body.source).toBe("demo");
    expect(body.data).toEqual([]);
  });
});
