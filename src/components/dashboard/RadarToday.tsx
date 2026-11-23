"use client";

import { useMemo } from "react";
import { Bell, CloudRain, Package, Tag, Trophy } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useApi } from "@/lib/useApi";
import type {
  MarketItem,
  NewsItem,
  RadarFeedItem,
  RemoteJob,
  EsportsOverview,
  WeatherData,
} from "@/types";

const icons = {
  "cloud-rain": CloudRain,
  tag: Tag,
  trophy: Trophy,
  package: Package,
  bell: Bell,
} as const;

export function RadarToday() {
  const { data: weather } = useApi<WeatherData>(
    `/api/clima?city=${encodeURIComponent("Rio de Janeiro, RJ")}`
  );
  const { data: market } = useApi<MarketItem[]>("/api/mercado");
  const { data: news } = useApi<NewsItem[]>("/api/noticias");
  const { data: sports } = useApi<EsportsOverview>("/api/esportes");
  const { data: jobs } = useApi<RemoteJob[]>("/api/vagas");

  const items = useMemo<RadarFeedItem[]>(() => {
    const feed: RadarFeedItem[] = [];

    if (weather) {
      feed.push({
        id: "clima",
        icon: "cloud-rain",
        text: weather.alertTitle || `Em ${weather.city}, ${weather.temperature}°C`,
      });
    }

    const quote = market?.[0];
    if (quote) {
      feed.push({
        id: "mercado",
        icon: "tag",
        text: `${quote.name}: ${quote.value} (${quote.variation})`,
      });
    }

    const games = [...(sports?.live ?? []), ...(sports?.upcoming ?? [])];
    const liveMatch = games.find((m) => m.live) ?? games[0];
    if (liveMatch) {
      feed.push({
        id: "esporte",
        icon: "trophy",
        text: `${liveMatch.home} x ${liveMatch.away} — ${liveMatch.live ? "ao vivo" : liveMatch.time}`,
      });
    }

    const topNews = news?.[0];
    if (topNews) {
      feed.push({ id: "noticia", icon: "bell", text: topNews.title });
    }

    const topJob = jobs?.[0];
    if (topJob) {
      feed.push({ id: "vaga", icon: "package", text: `Vaga: ${topJob.title}` });
    }

    return feed.slice(0, 5);
  }, [weather, market, sports, news, jobs]);

  return (
    <Card className="bg-white">
      <div className="mb-4">
        <h2 className="text-base font-bold text-[#0B2D5B] sm:text-lg">Seu Radar de Hoje</h2>
        <p className="text-sm text-slate-500">
          O que você realmente precisa saber hoje, em um só lugar.
        </p>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-slate-500">Carregando seu radar...</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {items.map((item) => {
            const Icon = icons[item.icon];
            return (
              <li
                key={item.id}
                className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-[#EAF2F8]/60 p-3.5"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#0B2D5B] shadow-sm">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="text-[13px] font-semibold leading-snug text-[#0B2D5B]">
                  {item.text}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
