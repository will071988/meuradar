import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { sportsMock } from "@/data/mock";

function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function SportsCard() {
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
        {sportsMock.map((m) => (
          <li key={m.id} className="rounded-xl bg-slate-50 px-3 py-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {m.competition}
            </p>
            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-sm font-bold text-[#0B2D5B]">
                <span
                  aria-hidden="true"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0B2D5B] text-[11px] font-extrabold text-white"
                >
                  {initials(m.home)}
                </span>
                {m.home}
                <span className="text-slate-300">x</span>
                {m.away}
                <span
                  aria-hidden="true"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#00C2D7] text-[11px] font-extrabold text-white"
                >
                  {initials(m.away)}
                </span>
              </span>
              <span className="shrink-0 rounded-lg bg-white px-2 py-1 text-xs font-bold text-[#FF8A3D] ring-1 ring-inset ring-orange-100">
                {m.time}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
