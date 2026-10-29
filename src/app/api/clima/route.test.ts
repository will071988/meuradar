// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/cache", () => ({
  getCache: () => null,
  setCache: () => undefined,
  fetchWithTimeout: (url: string) => globalThis.fetch(url),
}));

const GEO = "geocoding-api.open-meteo.com";
const FORECAST = "api.open-meteo.com";

const geoOk = {
  results: [{ latitude: -22.9, longitude: -43.2, name: "Rio de Janeiro" }],
};

const forecastOk = {
  current: { temperature_2m: 31, apparent_temperature: 34, weather_code: 0 },
  daily: {
    time: ["2026-01-01", "2026-01-02", "2026-01-03", "2026-01-04"],
    temperature_2m_max: [33, 30, 28, 29],
    temperature_2m_min: [24, 23, 22, 23],
    weather_code: [0, 1, 61, 3],
  },
};

function stub(routes: Record<string, () => Response | Promise<Response>>) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      for (const [host, handler] of Object.entries(routes)) {
        if (url.includes(host)) return handler();
      }
      return new Response("not found", { status: 404 });
    })
  );
}

afterEach(() => vi.unstubAllGlobals());

describe("GET /api/clima", () => {
  it("retorna dados ao vivo quando Open-Meteo responde", async () => {
    stub({
      [GEO]: () => new Response(JSON.stringify(geoOk)),
      [FORECAST]: () => new Response(JSON.stringify(forecastOk)),
    });

    const { GET } = await import("@/app/api/clima/route");
    const res = await GET(new Request("http://localhost/api/clima?city=Rio de Janeiro"));
    const body = (await res.json()) as {
      source: string;
      data: { temperature: number; condition: string; forecast: unknown[]; alertTitle: string };
    };

    expect(body.source).toBe("live");
    expect(body.data.temperature).toBe(31);
    expect(body.data.condition).toBe("Ensolarado");
    expect(body.data.forecast).toHaveLength(4);
    expect(body.data.alertTitle).toBe("Alerta de calor intenso");
  });

  it("detecta alerta de chuva pelo weather_code", async () => {
    stub({
      [GEO]: () => new Response(JSON.stringify(geoOk)),
      [FORECAST]: () =>
        new Response(
          JSON.stringify({
            ...forecastOk,
            current: { temperature_2m: 24, apparent_temperature: 24, weather_code: 61 },
            daily: { ...forecastOk.daily, temperature_2m_max: [26, 25, 24, 25] },
          })
        ),
    });

    const { GET } = await import("@/app/api/clima/route");
    const body = (await (
      await GET(new Request("http://localhost/api/clima?city=São Paulo"))
    ).json()) as { data: { condition: string; alertTitle: string } };

    expect(body.data.condition).toBe("Chuva");
    expect(body.data.alertTitle).toBe("Alerta de chuva");
  });

  it("fallback demo quando o geocoding falha", async () => {
    stub({
      [GEO]: () => new Response("erro", { status: 500 }),
    });

    const { GET } = await import("@/app/api/clima/route");
    const res = await GET(new Request("http://localhost/api/clima?city=Recife"));
    const body = (await res.json()) as { source: string; data: { city: string } };

    expect(res.status).toBe(200);
    expect(body.source).toBe("demo");
    expect(body.data.city).toBe("Recife");
  });

  it("fallback demo quando a forecast responde inválida", async () => {
    stub({
      [GEO]: () => new Response(JSON.stringify(geoOk)),
      [FORECAST]: () => new Response("<html>erro</html>", { status: 200 }),
    });

    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const { GET } = await import("@/app/api/clima/route");
    const body = (await (
      await GET(new Request("http://localhost/api/clima?city=Curitiba"))
    ).json()) as { source: string; data: { city: string; temperature: number } };

    expect(body.source).toBe("demo");
    expect(body.data.city).toBe("Curitiba");
    expect(body.data.temperature).toBeGreaterThan(0);
  });

  it("timeout/erro de rede vira demo sem exceção", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("ETIMEDOUT");
      })
    );

    const { GET } = await import("@/app/api/clima/route");
    const res = await GET(new Request("http://localhost/api/clima"));
    const body = (await res.json()) as { source: string; data: { temperature: number } };

    expect(res.status).toBe(200);
    expect(body.source).toBe("demo");
    expect(body.data.temperature).toBe(28);
  });
});
