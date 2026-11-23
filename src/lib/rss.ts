/** Parser mínimo de feeds RSS/Atom, sem dependências externas. */

export interface RssFeedItem {
  title: string;
  link: string;
  description: string;
  publishedAt: string | null;
}

function decodeEntities(input: string): string {
  return input
    .replace(/&nbsp;|&#xa0;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#0*39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCharCode(parseInt(code, 16)));
}

function stripTags(input: string): string {
  return decodeEntities(input.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
}

function tagValue(block: string, tag: string): string {
  const match = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i").exec(block);
  if (!match?.[1]) return "";
  let value = match[1].trim();
  if (value.startsWith("<![CDATA[") && value.includes("]]>")) {
    value = value.slice(9, value.indexOf("]]>")).trim();
  }
  return stripTags(value);
}

/** Extrai os itens de um XML RSS. Atom usa <entry>, tratado da mesma forma. */
export function parseRss(xml: string, limit = 20): RssFeedItem[] {
  const blocks = xml.match(/<(?:item|entry)\b[\s\S]*?<\/(?:item|entry)>/gi) ?? [];
  const items: RssFeedItem[] = [];

  for (const block of blocks) {
    const title = tagValue(block, "title");
    if (!title) continue;

    const linkMatch = /<link\b[^>]*>([\s\S]*?)<\/link>/i.exec(block) ??
      /<link\b[^>]*href=["']([^"']+)["']/i.exec(block);
    const rawDate = tagValue(block, "pubDate") || tagValue(block, "published") ||
      tagValue(block, "updated");
    const parsedDate = rawDate ? new Date(rawDate) : null;

    items.push({
      title,
      link: stripTags(linkMatch?.[1] ?? ""),
      description: tagValue(block, "description") || tagValue(block, "summary"),
      publishedAt: parsedDate && !Number.isNaN(parsedDate.getTime())
        ? parsedDate.toISOString()
        : null,
    });
  }

  return items.slice(0, limit);
}
