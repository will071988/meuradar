"use client";

import { useMemo, useState } from "react";
import { Radio, Trophy } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SourceBadge } from "@/components/data/SourceBadge";
import { sportsScheduleMock, standingsMock } from "@/data/mock";
import { cn } from "@/lib/utils";
import type { SportMatch } from "@/types";

const tabs = ["Hoje", "Amanhã", "Em alta"] as const;
type Tab = (typeof tabs)[number];

function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function MatchRow({ m }: { m: SportMatch }) {
  return (
    <li className="rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_2px_16px_rgba(11,45,91,0.05)]">
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
        {m.competition}
      </p>
      <div className="mt-2 flex items-center justify-between gap-3">
        <span className="flex min-w-0 items-center gap-2 text-sm font-bold text-[#0B2D5B]">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0B2D5B] text-[11px] font-extrabold text-white"
          >
            {initials(m.home)}
          </span>
          <span className="truncate">{m.home}</span>
          <span className="text-slate-300">x</span>
          <span className="truncate">{m.away}</span>
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#00C2D7] text-[11px] font-extrabold text-white"
          >
            {initials(m.away)}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-2">
          {m.live && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2 py-1 text-[11px] font-extrabold text-red-600 ring-1 ring-inset ring-red-200">
              <Radio className="h-3 w-3" aria-hidden="true" /> AO VIVO
            </span>
          )}
          <span className="rounded-lg bg-[#FF8A3D]/10 px-2.5 py-1 text-xs font-bold text-[#FF8A3D]">
            {m.time}
          </span>
        </span>
      </div>
    </li>
  );
}

export default function EsportesPage() {
  const [tab, setTab] = useState<Tab>("Hoje");

  const matches = useMemo(() => {
    if (tab === "Amanhã") {
      return sportsScheduleMock.filter((m) => m.day === "amanha");
    }
    if (tab === "Em alta") {
      // destaques: jogos ao vivo primeiro, depois os demais
      return [...sportsScheduleMock].sort((a, b) => Number(b.live ?? false) - Number(a.live ?? false));
    }
    // "Hoje" inclui os jogos sem dia explícito (mock do dashboard).
    return sportsScheduleMock.filter((m) => m.day === undefined || m.day === "hoje");
  }, [tab]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#0B2D5B] sm:text-3xl">
            Esportes
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Jogos, transmissões e classificação do Brasileirão em um só lugar.
          </p>
        </div>
        <SourceBadge source="demo" />
      </div>

      <div role="tablist" aria-label="Seções de esportes" className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00C2D7]",
              tab === t
                ? "bg-[#0B2D5B] text-white"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <ul className="space-y-3">
        {matches.map((m) => (
          <MatchRow key={m.id} m={m} />
        ))}
        {matches.length === 0 && (
          <li className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
            Nenhum jogo para esta aba.
          </li>
        )}
      </ul>

      {tab === "Em alta" && (
        <Card>
          <h2 className="flex items-center gap-2 text-base font-bold text-[#0B2D5B]">
            <Trophy className="h-5 w-5 text-[#FF8A3D]" aria-hidden="true" />
            Brasileirão Série A — topo
          </h2>
          <table className="mt-3 w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-slate-400">
                <th scope="col" className="py-2 font-bold">
                  #
                </th>
                <th scope="col" className="py-2 font-bold">
                  Time
                </th>
                <th scope="col" className="py-2 text-right font-bold">
                  Pts
                </th>
                <th scope="col" className="py-2 text-right font-bold">
                  J
                </th>
              </tr>
            </thead>
            <tbody>
              {standingsMock.map((s) => (
                <tr key={s.team} className="border-t border-slate-100">
                  <td className="py-2.5 font-bold text-[#0B2D5B]">{s.pos}</td>
                  <td className="py-2.5 font-semibold text-slate-700">{s.team}</td>
                  <td className="py-2.5 text-right font-extrabold text-[#0B2D5B]">{s.pts}</td>
                  <td className="py-2.5 text-right text-slate-500">{s.games}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Card className="border-dashed">
        <p className="text-sm text-slate-500">
          <Badge tone="hot" className="mr-2">
            Em breve
          </Badge>
          Placares ao vivo e alertas de gols exigem provedor esportivo com chave (ex. API-Football).
          Hoje os dados são curadoria demonstrativa.
        </p>
      </Card>
    </div>
  );
}
