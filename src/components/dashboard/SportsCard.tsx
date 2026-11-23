"use client";

import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useApi } from "@/lib/useApi";
import type { EsportsOverview } from "@/types";

function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function SportsCard() {
  const { data } = useApi<EsportsOverview>("/api/esportes");
  const matches = [...(data?.live ?? []), ...(data?.upcoming ?? [])].slice(0, 4);

  return (
    <Card>
      <SectionHeader title="Esportes" />
      <div className="mb-3 flex gap-2" role="tablist" aria-label="Filtro de jogos">
        {["Hoje", "Amanhã", "Em alta"].map((tab, i) => (
          <span
            key={tab}
            role="tab"
            aria-selected={i === 0}
            className={
              i === 0
                ? "rounded-full bg-[#0B2D5B] px-3 py-1.5 text-xs font-bold text-white"
                : "rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500"
            }
          >
            {tab}
          </span>
        ))}
      </div>
      <ul className="space-y-3">
        {matches.map((m) => (
          <li key={m.id} className="rounded-xl bg-slate-50 px-3 py-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {m.competition}
            </p>
            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="flex min-w-0 items-center gap-2 text-sm font-bold text-[#0B2D5B]">
                <span
                  aria-hidden="true"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0B2D5B] text-[11px] font-extrabold text-white"
                >
                  {initials(m.home)}
                </span>
                <span className="truncate">{m.home}</span>
                <span className="text-slate-300">x</span>
                <span className="truncate">{m.away}</span>
                <span
                  aria-hidden="true"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#00C2D7] text-[11px] font-extrabold text-white"
                >
                  {initials(m.away)}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-1.5">
                {m.live && (
                  <span className="rounded-md bg-red-50 px-1.5 py-0.5 text-[10px] font-extrabold text-red-600">
                    AO VIVO
                  </span>
                )}
                <span className="rounded-lg bg-white px-2 py-1 text-xs font-bold text-[#FF8A3D] ring-1 ring-inset ring-orange-100">
                  {m.time}
                </span>
              </span>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
