// @vitest-environment node
import { describe, expect, it } from "vitest";
import { buildInsights } from "@/lib/insights";

describe("buildInsights", () => {
  it("gera insights a partir de dados reais", () => {
    const result = buildInsights({
      weather: {
        city: "Rio de Janeiro, RJ", temperature: 28, condition: "Sol", feelsLike: 31,
        forecast: [], alertTitle: "Alerta de calor", alertDescription: "Calor intenso",
      },
      market: [
        { id: "usd", name: "Dólar", value: "R$ 5,02", variation: "+0,38%", trend: "up" },
        { id: "eur", name: "Euro", value: "R$ 5,45", variation: "-0,21%", trend: "down" },
      ],
      concursos: [
        { id: "c1", title: "Concurso com 93 vagas", description: "", time: "Há 2 horas", category: "Concurso" },
      ],
      standings: [{
        leagueId: "bra.1", name: "Série A",
        groups: [{ name: "Única", entries: [{ pos: 1, team: "Flamengo", pts: 80, games: 36 }] }],
      }],
    });

    expect(result.map((i) => i.id)).toEqual(["clima", "mercado", "classificacao", "concursos"]);
    expect(result[0]).toMatchObject({ title: "Alerta de calor", tone: "warning" });
    expect(result[1]).toMatchObject({ title: "Dólar: R$ 5,02", tone: "up" });
    expect(result[2]).toMatchObject({ title: "Flamengo lidera o Brasileirão", detail: "80 pontos em 36 jogos" });
    expect(result[3]).toMatchObject({ title: "1 concursos em destaque" });
  });

  it("detecta variação negativa", () => {
    const result = buildInsights({
      weather: null,
      market: [{ id: "eur", name: "Euro", value: "R$ 5,45", variation: "-0,21%", trend: "down" }],
      concursos: [],
      standings: [],
    });
    expect(result[0]).toMatchObject({ tone: "down" });
  });

  it("sem dados retorna lista vazia", () => {
    expect(buildInsights({ weather: null, market: [], concursos: [], standings: [] })).toEqual([]);
  });
});
