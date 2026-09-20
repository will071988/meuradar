"use client";

import { useEffect, useState } from "react";
import { CloudSun, MapPin, RefreshCw, TriangleAlert } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SourceBadge } from "@/components/data/SourceBadge";
import { useApi } from "@/lib/useApi";
import { loadPreferences } from "@/lib/preferences";
import type { WeatherData } from "@/types";

export default function ClimaPage() {
  const [city, setCity] = useState("Rio de Janeiro, RJ");
  const [query, setQuery] = useState("Rio de Janeiro, RJ");

  useEffect(() => {
    const prefs = loadPreferences();
    if (prefs.city) {
      setCity(prefs.city);
      setQuery(prefs.city);
    }
  }, []);

  const { data, source, updatedAt, loading, error, refresh } = useApi<WeatherData>(
    `/api/clima?city=${encodeURIComponent(city)}`
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#0B2D5B] sm:text-3xl">
            Clima
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Previsão ao vivo via Open-Meteo, com fallback demo.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {source && <SourceBadge source={source} />}
          <Button type="button" variant="outline" onClick={refresh} disabled={loading}>
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Atualizar
          </Button>
        </div>
      </div>

      <form
        className="flex flex-col gap-2 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          if (query.trim()) setCity(query.trim());
        }}
      >
        <label htmlFor="city-search" className="sr-only">
          Cidade
        </label>
        <input
          id="city-search"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ex.: São Paulo, SP"
          className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-[#00C2D7] focus:outline-none"
        />
        <Button type="submit">Buscar</Button>
      </form>

      {loading && (
        <div className="space-y-3" aria-label="Carregando clima">
          <div className="h-56 animate-pulse rounded-2xl bg-slate-100" />
          <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
        </div>
      )}

      {error && !loading && (
        <Card>
          <p role="alert" className="text-sm font-semibold text-red-600">
            {error}
          </p>
        </Card>
      )}

      {data && !loading && (
        <>
          <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0B2D5B] via-[#1450A0] to-[#00C2D7] p-5 text-white">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="flex items-center gap-1.5 text-sm text-white/80">
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                  {data.city}
                </p>
                <p className="mt-2 text-5xl font-extrabold tracking-tight">
                  {data.temperature}°C
                </p>
                <p className="mt-1 text-sm font-semibold text-white/90">
                  {data.condition} • Sensação {data.feelsLike}°C
                </p>
              </div>
              <span className="rounded-2xl bg-white/15 p-3">
                <CloudSun className="h-10 w-10" aria-hidden="true" />
              </span>
            </div>

            <div className="mt-5 grid grid-cols-4 gap-2 text-center">
              {data.forecast.map((d) => (
                <div key={d.label} className="rounded-xl bg-white/10 px-2 py-2.5">
                  <p className="text-xs font-semibold text-white/70">{d.label}</p>
                  <p className="mt-1 text-sm font-bold">
                    {d.max}° <span className="font-medium text-white/60">{d.min}°</span>
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-start gap-3 rounded-2xl bg-black/15 p-3 ring-1 ring-inset ring-white/20">
              <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-[#FF8A3D]" aria-hidden="true" />
              <div>
                <p className="text-sm font-bold">{data.alertTitle}</p>
                <p className="text-xs text-white/80">{data.alertDescription}</p>
              </div>
            </div>
          </section>

          {updatedAt && (
            <p className="text-xs text-slate-400">
              Atualizado em {new Date(updatedAt).toLocaleString("pt-BR")} • Fonte: Open-Meteo
              {source === "demo" ? " (fallback demo)" : ""}
            </p>
          )}
        </>
      )}
    </div>
  );
}
