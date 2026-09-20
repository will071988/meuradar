"use client";

import { Newspaper, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SourceBadge } from "@/components/data/SourceBadge";
import { useApi } from "@/lib/useApi";
import type { NewsItem } from "@/types";

export default function NoticiasPage() {
  const { data, source, updatedAt, loading, error, refresh } =
    useApi<NewsItem[]>("/api/noticias");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#0B2D5B] sm:text-3xl">
            Notícias
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manchetes do Brasil. Sem chave, exibimos seleção demo.
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
        <div className="space-y-3" aria-label="Carregando notícias">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-100" />
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
          <div className="grid gap-4 md:grid-cols-2">
            {data.map((n) => (
              <Card key={n.id}>
                <article className="flex gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF2F8] text-[#0B2D5B]">
                    <Newspaper className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#00C2D7]">
                      {n.category}
                    </p>
                    <h2 className="text-sm font-bold leading-snug text-[#0B2D5B]">{n.title}</h2>
                    <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{n.description}</p>
                    <p className="mt-1 text-[11px] font-medium text-slate-400">{n.time}</p>
                  </div>
                </article>
              </Card>
            ))}
          </div>
          {updatedAt && (
            <p className="text-xs text-slate-400">
              Atualizado em {new Date(updatedAt).toLocaleString("pt-BR")} •{" "}
              {source === "live"
                ? "Fonte: NewsAPI"
                : "Sem NEWS_API_KEY — defina no .env.local para ao vivo"}
            </p>
          )}
        </>
      )}
    </div>
  );
}
