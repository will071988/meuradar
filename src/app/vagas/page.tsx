"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Briefcase, ExternalLink, KeyRound, RefreshCw, Search } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SourceBadge } from "@/components/data/SourceBadge";
import { useApi } from "@/lib/useApi";
import { jobsMock } from "@/data/mock";
import type { RemoteJob } from "@/types";

export default function VagasPage() {
  const [apiUrl, setApiUrl] = useState("/api/vagas");
  const { data, source, updatedAt, loading, error, refresh } = useApi<RemoteJob[]>(apiUrl);
  const [query, setQuery] = useState("");
  const [where, setWhere] = useState("Rio de Janeiro");
  const [remoteOnly, setRemoteOnly] = useState(false);

  function handleSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (where.trim()) params.set("where", where.trim());
    const qs = params.toString();
    setApiUrl(qs ? `/api/vagas?${qs}` : "/api/vagas");
  }

  const filtered = useMemo(() => {
    return (data ?? []).filter((j) => !remoteOnly || j.remote);
  }, [data, remoteOnly]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#0B2D5B] sm:text-3xl">
            Vagas
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Busque no Rio e no Brasil (Adzuna) ou explore vagas remotas globais.
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

      <Card>
        <form onSubmit={handleSearch} className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cargo ou palavra-chave..."
              aria-label="Buscar vagas"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm focus:border-[#00C2D7] focus:outline-none"
            />
          </div>
          <input
            type="text"
            value={where}
            onChange={(e) => setWhere(e.target.value)}
            placeholder="Onde? Ex.: Rio de Janeiro"
            aria-label="Local"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-[#00C2D7] focus:outline-none sm:w-48"
          />
          <Button type="submit">Buscar</Button>
        </form>
        <label className="mt-2 flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-600">
          <input
            type="checkbox"
            checked={remoteOnly}
            onChange={(e) => setRemoteOnly(e.target.checked)}
            className="h-4 w-4 accent-[#0B2D5B]"
          />
          Só remotas
        </label>
      </Card>

      {source === "demo" && !loading && (
        <Card className="border-amber-200 bg-amber-50/60">
          <p className="flex items-start gap-2 text-sm text-amber-800">
            <KeyRound className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              Vagas do Rio/InfoJobs/Indeed exigem chaves gratuitas do Adzuna
              (`ADZUNA_APP_ID` + `ADZUNA_APP_KEY` em https://developer.adzuna.com).
              Sem elas, exibimos vagas remotas globais ao vivo. Scraping direto desses
              sites é bloqueado por anti-bot — por isso usamos o agregador oficial.
            </span>
          </p>
        </Card>
      )}

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
                      {j.company} • {j.location}
                      {j.salary ? ` • ${j.salary}` : ""} • {j.postedAt}
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
              Atualizado em {new Date(updatedAt).toLocaleString("pt-BR")} • Fontes: Adzuna BR,
              Arbeitnow, Remotive{source === "demo" ? " (fallback demo)" : ""}
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
