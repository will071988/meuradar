"use client";

import { useMemo, useState } from "react";
import { Briefcase, ExternalLink, RefreshCw, Search } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SourceBadge } from "@/components/data/SourceBadge";
import { useApi } from "@/lib/useApi";
import { jobsMock } from "@/data/mock";
import type { RemoteJob } from "@/types";

export default function VagasPage() {
  const { data, source, updatedAt, loading, error, refresh } = useApi<RemoteJob[]>("/api/vagas");
  const [query, setQuery] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data ?? []).filter((j) => {
      if (remoteOnly && !j.remote) return false;
      if (!q) return true;
      return (
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.location.toLowerCase().includes(q)
      );
    });
  }, [data, query, remoteOnly]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#0B2D5B] sm:text-3xl">
            Vagas
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Vagas remotas e internacionais ao vivo. Concursos em destaque abaixo.
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

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por cargo, empresa, local..."
            aria-label="Buscar vagas"
            className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm focus:border-[#00C2D7] focus:outline-none"
          />
        </div>
        <label className="flex cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600">
          <input
            type="checkbox"
            checked={remoteOnly}
            onChange={(e) => setRemoteOnly(e.target.checked)}
            className="h-4 w-4 accent-[#0B2D5B]"
          />
          Só remotas
        </label>
      </div>

      {loading && (
        <div className="space-y-3" aria-label="Carregando vagas">
          {[0, 1, 2].map((i) => (
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
          <ul className="space-y-3">
            {filtered.map((j) => (
              <li key={j.id}>
                <Card className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF2F8] text-[#0B2D5B]">
                    <Briefcase className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-bold text-[#0B2D5B]">{j.title}</p>
                      {j.remote && <Badge tone="new">Remota</Badge>}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {j.company} • {j.location} • {j.postedAt}
                    </p>
                  </div>
                  <a
                    href={j.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Candidatar-se a ${j.title}`}
                    className="flex shrink-0 items-center gap-1 rounded-xl bg-[#0B2D5B] px-3 py-2 text-xs font-bold text-white hover:bg-[#123e7a]"
                  >
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    Ver vaga
                  </a>
                </Card>
              </li>
            ))}
          </ul>
          {filtered.length === 0 && (
            <Card>
              <p className="text-sm text-slate-500">
                Nenhuma vaga para essa busca. Tente outro termo.
              </p>
            </Card>
          )}
          {updatedAt && (
            <p className="text-xs text-slate-400">
              Atualizado em {new Date(updatedAt).toLocaleString("pt-BR")} • Fontes: Arbeitnow +
              Remotive{source === "demo" ? " (fallback demo)" : ""}
            </p>
          )}
        </>
      )}

      <Card>
        <h2 className="text-base font-bold text-[#0B2D5B]">Concursos em destaque</h2>
        <p className="text-xs text-slate-400">Curadoria demo — API de concursos em breve.</p>
        <ul className="mt-3 space-y-2">
          {jobsMock
            .filter((j) => /concurso/i.test(j.title))
            .map((j) => (
              <li
                key={j.id}
                className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2.5"
              >
                <div>
                  <p className="text-sm font-bold text-[#0B2D5B]">{j.title}</p>
                  <p className="text-xs text-slate-500">
                    {j.detail}
                    {j.extra ? ` • ${j.extra}` : ""}
                  </p>
                </div>
                <Badge tone={j.badgeTone}>{j.badge}</Badge>
              </li>
            ))}
        </ul>
      </Card>
    </div>
  );
}
