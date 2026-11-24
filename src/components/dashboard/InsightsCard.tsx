"use client";

import { useMemo } from "react";
import { Lightbulb, TrendingDown, TrendingUp, TriangleAlert } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useApi } from "@/lib/useApi";
import { buildInsights } from "@/lib/insights";
import type { ConcursoItem, EsportsOverview, MarketItem, WeatherData } from "@/types";

const toneClass = {
  info: "bg-[#EAF2F8] text-[#0B2D5B]",
  warning: "bg-amber-50 text-amber-700",
  up: "bg-emerald-50 text-emerald-700",
  down: "bg-red-50 text-red-600",
} as const;

export function InsightsCard() {
  const { data: weather } = useApi<WeatherData>(
    `/api/clima?city=${encodeURIComponent("Rio de Janeiro, RJ")}`
  );
  const { data: market } = useApi<MarketItem[]>("/api/mercado");
  const { data: concursos } = useApi<ConcursoItem[]>("/api/concursos");
  const { data: esportes } = useApi<EsportsOverview>("/api/esportes");

  const insights = useMemo(
    () =>
      buildInsights({
        weather: weather ?? null,
        market: market ?? null,
        concursos: concursos ?? null,
        standings: esportes?.standings ?? null,
      }),
    [weather, market, concursos, esportes]
  );

  return (
    <Card>
      <SectionHeader title="Insights para você" />
      {insights.length === 0 ? (
        <p className="text-sm text-slate-500">Carregando insights...</p>
      ) : (
        <ul className="space-y-2.5">
          {insights.map((item) => {
            const Icon = item.tone === "warning"
              ? TriangleAlert
              : item.tone === "up"
                ? TrendingUp
                : item.tone === "down"
                  ? TrendingDown
                  : Lightbulb;
            return (
              <li key={item.id} className="flex gap-3 rounded-xl bg-slate-50 p-3">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${toneClass[item.tone]}`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold leading-snug text-[#0B2D5B]">{item.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{item.detail}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <p className="mt-3 text-[11px] text-slate-400">
        Insights gerados por regras sobre dados públicos em tempo real — sem modelo externo.
      </p>
    </Card>
  );
}
