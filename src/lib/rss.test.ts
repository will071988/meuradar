// @vitest-environment node
import { describe, expect, it } from "vitest";
import { parseRss } from "@/lib/rss";

describe("parseRss", () => {
  it("extrai título, link, descrição CDATA e data", () => {
    const xml = `<rss><channel><item>
      <title>Notícia &amp; Importante</title>
      <link>https://exemplo.com/a</link>
      <description><![CDATA[<p>Texto com <b>negrito</b></p>]]></description>
      <pubDate>Sun, 22 Nov 2026 19:00:00 GMT</pubDate>
    </item></channel></rss>`;

    expect(parseRss(xml)).toEqual([
      {
        title: "Notícia & Importante",
        link: "https://exemplo.com/a",
        description: "Texto com negrito",
        publishedAt: "2026-11-22T19:00:00.000Z",
      },
    ]);
  });

  it("ignora itens sem título e limita a quantidade", () => {
    const xml = `<rss><channel>
      <item><description>sem título</description></item>
      <item><title>A</title></item>
      <item><title>B</title></item>
      <item><title>C</title></item>
    </channel></rss>`;

    expect(parseRss(xml, 2).map((i) => i.title)).toEqual(["A", "B"]);
  });

  it("aceita entry (Atom) e data inválida", () => {
    const xml = `<feed><entry>
      <title>Atom</title><link href="https://exemplo.com/b" />
      <summary>Resumo</summary><published>data-invalida</published>
    </entry></feed>`;

    expect(parseRss(xml)[0]).toMatchObject({
      title: "Atom",
      link: "https://exemplo.com/b",
      description: "Resumo",
      publishedAt: null,
    });
  });
});
