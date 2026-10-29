import { afterEach, describe, expect, it, vi } from "vitest";
import { formatBRL, formatPct, timeAgo } from "@/lib/format";

describe("formatBRL", () => {
  it("formata com 2 casas por padrão", () => {
    expect(formatBRL(1899).replace(/\u00a0/g, " ")).toBe("R$ 1.899,00");
  });

  it("respeita casas personalizadas", () => {
    expect(formatBRL(312450, 0).replace(/\u00a0/g, " ")).toBe("R$ 312.450");
  });
});

describe("formatPct", () => {
  it("sinaliza positivo", () => {
    expect(formatPct(0.38)).toBe("+0,38%");
  });

  it("mantém negativo sem sinal extra", () => {
    expect(formatPct(-1.12)).toBe("-1,12%");
  });

  it("zero sem sinal", () => {
    expect(formatPct(0)).toBe("0,00%");
  });
});

describe("timeAgo", () => {
  afterEach(() => vi.useRealTimers());

  it("minutos, horas e dias", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-10T12:00:00.000Z"));

    expect(timeAgo("2026-01-10T11:45:00.000Z")).toBe("Há 15 min");
    expect(timeAgo("2026-01-10T08:00:00.000Z")).toBe("Há 4 horas");
    expect(timeAgo("2026-01-10T07:00:00.000Z")).toBe("Há 5 horas");
    expect(timeAgo("2026-01-08T12:00:00.000Z")).toBe("Há 2 dias");
  });

  it("singular para 1 hora", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-10T12:00:00.000Z"));
    expect(timeAgo("2026-01-10T11:30:00.000Z")).toBe("Há 30 min");
    expect(timeAgo("2026-01-10T11:00:00.000Z")).toBe("Há 1 hora");
  });
});
