"use client";

import { RefreshCw, TrendingDown, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SourceBadge } from "@/components/data/SourceBadge";
import { useApi } from "@/lib/useApi";
import type { MarketItem } from "@/types";
import { cn } from "@/lib/utils";

export default function MercadoPage() {
  const { data, source, updatedAt, loading, error, refresh } = useApi<MarketItem[]>("/api/mercado");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#0B2D5B] sm:text-3xl">
            Mercado
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Dólar, euro e Bitcoin ao vivo. Ibovespa ainda demo.
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

      {loading && (
        <div className="grid gap-3 sm:grid-cols-2" aria-label="Carregando mercado">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-100" />
          ))}
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
          <div className="grid gap-3 sm:grid-cols-2">
            {data.map((item) => {
              const up = item.trend === "up";
              return (
                <Card key={item.id}>
                  <p className="text-sm font-bold text-[#0B2D5B]">{item.name}</p>
                  <p className="mt-1 text-2xl font-extrabold text-[#0B2D5B]">{item.value}</p>
                  <span
                    className={cn(
                      "mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold",
                      up ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                    )}
                  >
                    {up ? (
                      <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                    {item.variation}
                  </span>
                </Card>
              );
            })}
          </div>
          {updatedAt && (
            <p className="text-xs text-slate-400">
              Atualizado em {new Date(updatedAt).toLocaleString("pt-BR")} • Fonte: AwesomeAPI
              {source === "demo" ? " (fallback demo)" : ""}
            </p>
          )}
        </>
      )}
    </div>
  );
}
