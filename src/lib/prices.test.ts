import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  appendPrice,
  createTrack,
  discountPct,
  formatBRLTrack,
  loadTracks,
  parseBRL,
  saveTracks,
  totalSavings,
  tracksOnTarget,
} from "@/lib/prices";
import type { PriceTrack } from "@/types";

describe("parseBRL", () => {
  it.each([
    ["R$ 1.899,00", 1899],
    ["1.899,00", 1899],
    ["1899", 1899],
    ["1899,90", 1899.9],
    ["1899.90", 1899.9],
    ["1,899.90", 1899.9],
    ["R$ 2.249,00", 2249],
    ["1,899", 1899],
    ["1.899", 1899],
    ["127.846", 127846],
  ])("lê %s como %d", (input, expected) => {
    expect(parseBRL(input)).toBe(expected);
  });

  it("rejeita valores inválidos", () => {
    expect(parseBRL("")).toBeNull();
    expect(parseBRL("abc")).toBeNull();
    expect(parseBRL("0")).toBeNull();
    expect(parseBRL("-5")).toBeNull();
  });
});

describe("formatBRLTrack", () => {
  it("formata em real brasileiro", () => {
    // Intl usa non-breaking space (U+00A0) entre R$ e o valor
    expect(formatBRLTrack(1899).replace(/\u00a0/g, " ")).toBe("R$ 1.899,00");
    expect(formatBRLTrack(1899.9).replace(/\u00a0/g, " ")).toBe("R$ 1.899,90");
  });

  it("é inversa de parseBRL para valores inteiros", () => {
    expect(parseBRL(formatBRLTrack(2249))).toBe(2249);
  });
});

describe("discountPct", () => {
  it("calcula desconto arredondado", () => {
    expect(discountPct(1899, 2249)).toBe("-16%");
    expect(discountPct(1899, 1899)).toBe("-0%");
    expect(discountPct(2000, 1899)).toBe("-0%");
    expect(discountPct(1500, 2000)).toBe("-25%");
  });

  it("não divide por zero", () => {
    expect(discountPct(100, 0)).toBe("-0%");
  });
});

describe("appendPrice", () => {
  it("adiciona ponto ao histórico e atualiza preço", () => {
    const track = createTrack({
      product: "Monitor",
      store: "Loja X",
      targetPrice: 1899,
      currentPrice: 2249,
    });
    const next = appendPrice(track, 1999);

    expect(next.currentPrice).toBe(1999);
    expect(next.history).toHaveLength(2);
    expect(next.history[1]).toMatchObject({ price: 1999 });
  });

  it("mantém apenas os últimos 30 pontos", () => {
    let track = createTrack({
      product: "Monitor",
      store: "Loja X",
      targetPrice: 100,
      currentPrice: 100,
    });
    for (let i = 0; i < 40; i++) track = appendPrice(track, 100 + i);

    expect(track.history).toHaveLength(30);
    expect(track.currentPrice).toBe(139);
  });
});

describe("tracksOnTarget", () => {
  const base = (): PriceTrack => ({
    id: "t1",
    product: "Monitor",
    store: "Loja",
    targetPrice: 1900,
    currentPrice: 2000,
    history: [],
    active: true,
    createdAt: "2026-01-01T00:00:00.000Z",
  });

  it("marca quando preço atual atinge o alvo", () => {
    const hit = { ...base(), currentPrice: 1899 };
    expect(tracksOnTarget([hit])).toHaveLength(1);
    expect(tracksOnTarget([{ ...base(), currentPrice: 1901 }])).toHaveLength(0);
  });

  it("ignora trilhas pausadas", () => {
    expect(tracksOnTarget([{ ...base(), currentPrice: 100, active: false }])).toHaveLength(0);
  });
});

describe("totalSavings", () => {
  it("soma a economia das trilhas ativas", () => {
    const tracks: PriceTrack[] = [
      {
        id: "a",
        product: "A",
        store: "X",
        targetPrice: 2000,
        currentPrice: 1500,
        history: [{ at: "2026-01-01T00:00:00.000Z", price: 2000 }],
        active: true,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
      {
        id: "b",
        product: "B",
        store: "Y",
        targetPrice: 1000,
        currentPrice: 1000,
        history: [],
        active: false,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    ];
    expect(totalSavings(tracks)).toBe(500);
  });

  it("retorna 0 sem trilhas", () => {
    expect(totalSavings([])).toBe(0);
  });
});

describe("armazenamento local (offline-first)", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.spyOn(Date, "now").mockReturnValue(1_700_000_000_000);
  });

  it("semeia o produto de exemplo na primeira carga", () => {
    const first = loadTracks();
    expect(first).toHaveLength(1);
    expect(first[0]?.product).toContain("Monitor LG");
    expect(window.localStorage.getItem("meuradar-prices-v1")).not.toBeNull();
  });

  it("é idempotente: reconciliar duas vezes não duplica", () => {
    const first = loadTracks();
    const second = loadTracks();

    expect(second).toEqual(first);
    expect(second).toHaveLength(1);

    const ids = second.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("preserva alterações salvas entre cargas", () => {
    const track = createTrack({
      product: "Teclado",
      store: "Kabum",
      targetPrice: 300,
      currentPrice: 450,
    });
    saveTracks([track]);
    expect(loadTracks()).toHaveLength(1);
    expect(loadTracks()[0]?.product).toBe("Teclado");
  });

  it("descarta dados corrompidos e volta ao seed seguro", () => {
    window.localStorage.setItem("meuradar-prices-v1", "{corrompido");
    const list = loadTracks();
    expect(list).toHaveLength(1);
    expect(list[0]?.product).toContain("Monitor LG");
  });

  it("remove entradas sem campos obrigatórios", () => {
    window.localStorage.setItem(
      "meuradar-prices-v1",
      JSON.stringify([{ id: "x" }, { id: "y", product: "", currentPrice: 1 }, "lixo"])
    );
    expect(loadTracks()).toHaveLength(0);
  });
});
