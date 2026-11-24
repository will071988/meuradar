import type {
  ConcursoItem,
  LeagueStandings,
  MarketItem,
  WeatherData,
} from "@/types";

export interface Insight {
  id: string;
  title: string;
  detail: string;
  tone: "info" | "warning" | "up" | "down";
}

export interface InsightsContext {
  weather: WeatherData | null;
  market: MarketItem[] | null;
  concursos: ConcursoItem[] | null;
  standings: LeagueStandings[] | null;
}

function variationValue(item: MarketItem): number {
  return Number(item.variation.replace(",", ".").replace(/[^\d.-]/g, "")) || 0;
}

/** Gera insights deterministicamente a partir de dados reais — sem modelo externo. */
export function buildInsights(ctx: InsightsContext): Insight[] {
  const insights: Insight[] = [];

  if (ctx.weather?.alertTitle) {
    insights.push({
      id: "clima",
      title: ctx.weather.alertTitle,
      detail: `${ctx.weather.city} • ${ctx.weather.temperature}°C`,
      tone: "warning",
    });
  }

  const market = ctx.market ?? [];
  if (market.length > 0) {
    const top = market.reduce((best, item) =>
      Math.abs(variationValue(item)) > Math.abs(variationValue(best)) ? item : best
    );
    const value = variationValue(top);
    insights.push({
      id: "mercado",
      title: `${top.name}: ${top.value}`,
      detail: `Variação de ${top.variation} no período`,
      tone: value >= 0 ? "up" : "down",
    });
  }

  const brasil = (ctx.standings ?? []).find((table) => table.leagueId === "bra.1");
  const leader = brasil?.groups[0]?.entries[0];
  if (leader) {
    insights.push({
      id: "classificacao",
      title: `${leader.team} lidera o Brasileirão`,
      detail: `${leader.pts} pontos em ${leader.games} jogos`,
      tone: "info",
    });
  }

  const concursos = ctx.concursos ?? [];
  if (concursos.length > 0) {
    insights.push({
      id: "concursos",
      title: `${concursos.length} concursos em destaque`,
      detail: concursos[0]?.title ?? "",
      tone: "info",
    });
  }

  return insights;
}
