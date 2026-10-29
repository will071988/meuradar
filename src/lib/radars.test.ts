import { describe, expect, it } from "vitest";
import {
  RADAR_TYPES,
  createRadar,
  defaultRadars,
  evaluateRadars,
  loadRadars,
  saveRadars,
} from "@/lib/radars";
import { weatherMock } from "@/data/mock";
import type { Radar } from "@/types";

function radar(overrides: Partial<Radar>): Radar {
  return {
    id: "r-test",
    title: "Título",
    type: "custom",
    target: "",
    city: "Rio de Janeiro, RJ",
    active: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("RADAR_TYPES", () => {
  it("expõe os 8 tipos do produto", () => {
    expect(RADAR_TYPES).toHaveLength(8);
    expect(RADAR_TYPES.map((t) => t.id)).toContain("preco");
    expect(RADAR_TYPES.map((t) => t.id)).toContain("vaga");
  });
});

describe("createRadar", () => {
  it("cria radar ativo com dados normalizados", () => {
    const r = createRadar({
      title: "  Notebook barato  ",
      type: "preco",
      target: " 4000 ",
      city: "",
    });
    expect(r.title).toBe("Notebook barato");
    expect(r.target).toBe("4000");
    expect(r.city).toBe(weatherMock.city);
    expect(r.active).toBe(true);
    expect(r.id).toMatch(/^r-/);
  });
});

describe("evaluateRadars", () => {
  const ctx = { weather: weatherMock, market: null };

  it("não avalia radares inativos", () => {
    const alerts = evaluateRadars([radar({ type: "encomenda", active: false })], ctx);
    expect(alerts).toHaveLength(0);
  });

  it("preço dentro do alvo gera alerta", () => {
    const alerts = evaluateRadars([radar({ type: "preco", target: "4000" })], ctx);
    expect(alerts).toHaveLength(1);
    expect(alerts[0]?.message).toContain("1.899");
  });

  it("preço acima do alvo não gera alerta", () => {
    const alerts = evaluateRadars([radar({ type: "preco", target: "1000" })], ctx);
    expect(alerts).toHaveLength(0);
  });

  it("clima acima do limite gera alerta de calor", () => {
    const alerts = evaluateRadars(
      [radar({ type: "clima", target: "20", title: "Calor forte" })],
      ctx
    );
    expect(alerts).toHaveLength(1);
    expect(alerts[0]?.message).toContain("28°C");
  });

  it("clima abaixo do limite não gera alerta", () => {
    const alerts = evaluateRadars(
      [radar({ type: "clima", target: "40", title: "Calor extremo" })],
      ctx
    );
    expect(alerts).toHaveLength(0);
  });

  it("mercado BTC em queda gera alerta", () => {
    const alerts = evaluateRadars([radar({ type: "mercado", target: "BTC" })], ctx);
    expect(alerts).toHaveLength(1);
    expect(alerts[0]?.message).toContain("Bitcoin");
  });

  it("mercado sem queda não gera alerta", () => {
    const alerts = evaluateRadars([radar({ type: "mercado", target: "USD" })], ctx);
    expect(alerts).toHaveLength(0);
  });

  it("vaga sempre retorna resultados (fallback para as 3 vagas)", () => {
    const alerts = evaluateRadars(
      [radar({ type: "vaga", target: "termo-inexistente-zzz" })],
      ctx
    );
    expect(alerts).toHaveLength(1);
    expect(alerts[0]?.message.length).toBeGreaterThan(0);
  });

  it("esporte usa o time informado", () => {
    const alerts = evaluateRadars([radar({ type: "esporte", target: "Flamengo" })], ctx);
    expect(alerts[0]?.message).toContain("Flamengo");
  });

  it("encomenda reflete status e eta", () => {
    const alerts = evaluateRadars([radar({ type: "encomenda" })], ctx);
    expect(alerts[0]?.message).toContain("trânsito");
  });

  it("tipo personalizado cai no ramo genérico", () => {
    const alerts = evaluateRadars([radar({ type: "custom" })], ctx);
    expect(alerts[0]?.message).toContain("Monitoramento ativo");
  });

  it("avalia uma lista mista e preserva ordem", () => {
    const alerts = evaluateRadars(
      [
        radar({ id: "a", type: "preco", target: "4000" }),
        radar({ id: "b", type: "clima", target: "40" }),
        radar({ id: "c", type: "encomenda" }),
      ],
      ctx
    );
    expect(alerts.map((a) => a.radarId)).toEqual(["a", "c"]);
  });
});

describe("persistência local de radares", () => {
  it("semeia 3 exemplos na primeira carga", () => {
    window.localStorage.clear();
    const seeded = loadRadars();
    expect(seeded).toHaveLength(3);
    expect(defaultRadars()).toHaveLength(3);
  });

  it("roundtrip salvar → carregar devolve os mesmos radares", () => {
    window.localStorage.clear();
    const list = [
      radar({ id: "x1", title: "Passagem para Lisboa", type: "custom", target: "2500" }),
    ];
    saveRadars(list);
    expect(loadRadars()).toEqual(list);
  });

  it("descarta entradas com tipo inválido", () => {
    window.localStorage.setItem(
      "meuradar-radars-v1",
      JSON.stringify([
        { id: "ok", title: "Válido", type: "preco", target: "10" },
        { id: "bad", title: "Tipo errado", type: "hacker", target: "" },
        { id: "bad2", title: "", type: "preco", target: "" },
        "lixo",
      ])
    );
    const list = loadRadars();
    expect(list).toHaveLength(1);
    expect(list[0]?.id).toBe("ok");
    expect(list[0]?.city).toBe(weatherMock.city);
  });

  it("JSON inválido cai para o seed", () => {
    window.localStorage.setItem("meuradar-radars-v1", "not-json");
    expect(loadRadars()).toHaveLength(3);
  });
});
