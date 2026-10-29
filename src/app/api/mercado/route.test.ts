// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/cache", () => ({
  getCache: () => null,
  setCache: () => undefined,
  fetchWithTimeout: (url: string) => globalThis.fetch(url),
}));

const AWESOME = "economia.awesomeapi.com.br";
const FRANKFURTER = "api.frankfurter.app";
const COINGECKO = "api.coingecko.com";

const awesomeOk = {
  USDBRL: { bid: "5.02", pctChange: "0.38" },
  EURBRL: { bid: "5.45", pctChange: "0.21" },
  BTCBRL: { bid: "312450", pctChange: "-1.12" },
};

function stub(routes: Record<string, Response>) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      for (const [host, res] of Object.entries(routes)) {
        if (url.includes(host)) return res.clone();
      }
      return new Response("not found", { status: 404 });
    })
  );
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

afterEach(() => vi.unstubAllGlobals());

describe("GET /api/mercado", () => {
  it("AwesomeAPI ok → 4 ativos ao vivo com tendência", async () => {
    stub({ [AWESOME]: json(awesomeOk) });

    const { GET } = await import("@/app/api/mercado/route");
    const body = (await (await GET()).json()) as {
      source: string;
      data: { id: string; value: string; trend: string }[];
    };

    expect(body.source).toBe("live");
    expect(body.data).toHaveLength(4);
    expect(body.data.map((i) => i.id)).toEqual(["usd", "eur", "btc", "ibov"]);
    expect(body.data[0]?.value).toContain("5,02");
    expect(body.data[0]?.trend).toBe("up");
    expect(body.data[2]?.trend).toBe("down"); // BTC -1,12%
  });

  it("AwesomeAPI fora → Frankfurter + CoinGecko → ainda live", async () => {
    stub({
      [AWESOME]: new Response("erro", { status: 503 }),
      [FRANKFURTER]: json({ rates: { USD: 0.2, EUR: 0.18 } }),
      [COINGECKO]: json({ bitcoin: { brl: 310000 } }),
    });

    const { GET } = await import("@/app/api/mercado/route");
    const body = (await (await GET()).json()) as {
      source: string;
      data: { id: string; value: string }[];
    };

    expect(body.source).toBe("live");
    expect(body.data).toHaveLength(4);
    // 1 / 0.2 = 5.00 BRL por dólar
    expect(body.data[0]?.value).toContain("5,00");
    expect(body.data[2]?.value).toContain("310.000");
  });

  it("todas as fontes caem → demo com os mocks", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("off", { status: 500 }))
    );

    const { GET } = await import("@/app/api/mercado/route");
    const res = await GET();
    const body = (await res.json()) as { source: string; data: { id: string }[] };

    expect(res.status).toBe(200);
    expect(body.source).toBe("demo");
    expect(body.data).toHaveLength(4);
    expect(body.data.map((i) => i.id)).toContain("ibov");
  });

  it("resposta malformada cai para demo", async () => {
    stub({ [AWESOME]: new Response("nao-e-json", { status: 200 }) });

    const { GET } = await import("@/app/api/mercado/route");
    const body = (await (await GET()).json()) as { source: string };

    expect(body.source).toBe("demo");
  });

  it("cotação sem bid usa o valor de fallback do mock", async () => {
    stub({
      [AWESOME]: json({
        USDBRL: { bid: "5.10", pctChange: "0.5" },
        EURBRL: {},
        BTCBRL: { bid: "abc", pctChange: "-1" },
      }),
    });

    const { GET } = await import("@/app/api/mercado/route");
    const body = (await (await GET()).json()) as {
      data: { id: string; value: string }[];
    };

    expect(body.data[1]?.value).toContain("5,45"); // mock do euro
    expect(body.data[2]?.value).toContain("312.450"); // mock do BTC
  });
});
