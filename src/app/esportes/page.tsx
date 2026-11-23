"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Activity, CalendarClock, CheckCircle2, Radio, Trophy } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { SourceBadge } from "@/components/data/SourceBadge";
import { MatchTracker } from "@/components/esportes/MatchTracker";
import { useApi } from "@/lib/useApi";
import { cn } from "@/lib/utils";
import type { EsportsOverview, SportMatch } from "@/types";

function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function StatusBadge({ match }: { match: SportMatch }) {
  if (match.status === "live") {
    return (
      <span className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2 py-1 text-[11px] font-extrabold text-red-600 ring-1 ring-inset ring-red-200">
        <Radio className="h-3 w-3" aria-hidden="true" /> AO VIVO
      </span>
    );
  }
  if (match.status === "post") {
    return (
      <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-extrabold text-slate-500">
        <CheckCircle2 className="h-3 w-3" aria-hidden="true" /> Encerrado
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-lg bg-sky-50 px-2 py-1 text-[11px] font-extrabold text-sky-700">
      <CalendarClock className="h-3 w-3" aria-hidden="true" /> {match.startTime ?? match.time}
    </span>
  );
}

function MatchRow({
  m,
  selected,
  onTrack,
}: {
  m: SportMatch;
  selected: boolean;
  onTrack: (id: string) => void;
}) {
  return (
    <li className={`rounded-2xl border bg-white p-4 shadow-[0_2px_16px_rgba(11,45,91,0.05)] ${
      selected ? "border-[#00C2D7] ring-1 ring-[#00C2D7]" : "border-slate-100"
    }`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          {m.competition}
        </p>
        <StatusBadge match={m} />
      </div>
      <div className="mt-2 flex items-center justify-between gap-3">
        <span className="flex min-w-0 items-center gap-2 text-sm font-bold text-[#0B2D5B]">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0B2D5B] text-[11px] font-extrabold text-white"
          >
            {initials(m.home)}
          </span>
          <span className="truncate">{m.home}</span>
          {m.status !== "pre" && (
            <span className="shrink-0 rounded-lg bg-[#EAF2F8] px-2 py-0.5 text-sm font-extrabold text-[#0B2D5B]">
              {m.homeScore ?? "–"} x {m.awayScore ?? "–"}
            </span>
          )}
          <span className="truncate">{m.away}</span>
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#00C2D7] text-[11px] font-extrabold text-white"
          >
            {initials(m.away)}
          </span>
        </span>
        <button
          type="button"
          onClick={() => onTrack(m.id)}
          aria-label={`Abrir rastreador tático de ${m.home} x ${m.away}`}
          className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-[#0B2D5B] px-2.5 py-1 text-[11px] font-bold text-white hover:bg-[#123e7a]"
        >
          <Activity className="h-3.5 w-3.5" aria-hidden="true" />
          Campo
        </button>
      </div>
    </li>
  );
}

function MatchSection({
  title,
  icon,
  matches,
  emptyText,
  selectedEventId,
  onTrack,
}: {
  title: string;
  icon: ReactNode;
  matches: SportMatch[];
  emptyText: string;
  selectedEventId: string | null;
  onTrack: (id: string) => void;
}) {
  return (
    <Card>
      <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-[#0B2D5B]">
        {icon}
        {title}
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-500">
          {matches.length}
        </span>
      </h2>
      {matches.length === 0 ? (
        <p className="text-sm text-slate-500">{emptyText}</p>
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {matches.map((m) => (
            <MatchRow
              key={m.id}
              m={m}
              selected={m.id === selectedEventId}
              onTrack={onTrack}
            />
          ))}
        </ul>
      )}
    </Card>
  );
}

export default function EsportesPage() {
  const { data, source, loading } = useApi<EsportsOverview>("/api/esportes");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [league, setLeague] = useState("all");

  const filter = (matches: SportMatch[] | undefined) =>
    (matches ?? []).filter((m) => league === "all" || m.leagueId === league);

  const live = filter(data?.live);
  const upcoming = filter(data?.upcoming);
  const finished = filter(data?.finished);
  const standings = (data?.standings ?? []).filter(
    (table) => league === "all" || table.leagueId === league
  );

  const leagueOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const table of data?.standings ?? []) map.set(table.leagueId, table.name);
    for (const list of [data?.live, data?.upcoming, data?.finished]) {
      for (const match of list ?? []) {
        if (match.leagueId) map.set(match.leagueId, match.competition);
      }
    }
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1], "pt-BR"));
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#0B2D5B] sm:text-3xl">
            Esportes
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Jogos ao vivo, próximas partidas, resultados e classificações nacionais e internacionais.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {source && <SourceBadge source={source} />}
          <select
            aria-label="Filtrar campeonato"
            value={league}
            onChange={(e) => setLeague(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-[#0B2D5B]"
          >
            <option value="all">Todos os campeonatos</option>
            {leagueOptions.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedEventId && (
        <div>
          <button
            type="button"
            onClick={() => setSelectedEventId(null)}
            className="mb-2 text-xs font-bold text-slate-500 hover:text-[#0B2D5B]"
          >
            ← Fechar rastreador
          </button>
          <MatchTracker eventId={selectedEventId} />
        </div>
      )}

      {loading && !data && (
        <div className="space-y-3" aria-label="Carregando jogos">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      )}

      {data && (
        <>
          <MatchSection
            title="Ao vivo"
            icon={<Radio className="h-5 w-5 text-red-500" aria-hidden="true" />}
            matches={live}
            emptyText="Nenhuma partida ao vivo no momento."
            selectedEventId={selectedEventId}
            onTrack={(id) => setSelectedEventId((current) => (current === id ? null : id))}
          />

          <MatchSection
            title="Próximos jogos"
            icon={<CalendarClock className="h-5 w-5 text-sky-600" aria-hidden="true" />}
            matches={upcoming}
            emptyText="Nenhuma partida agendada nos próximos 7 dias."
            selectedEventId={selectedEventId}
            onTrack={(id) => setSelectedEventId((current) => (current === id ? null : id))}
          />

          <MatchSection
            title="Resultados"
            icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden="true" />}
            matches={finished}
            emptyText="Nenhum resultado recente."
            selectedEventId={selectedEventId}
            onTrack={(id) => setSelectedEventId((current) => (current === id ? null : id))}
          />

          <Card>
            <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-[#0B2D5B]">
              <Trophy className="h-5 w-5 text-[#FF8A3D]" aria-hidden="true" />
              Classificações
            </h2>
            {standings.length === 0 ? (
              <p className="text-sm text-slate-500">Nenhuma classificação disponível.</p>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {standings.map((table) => (
                  <div key={table.leagueId} className="rounded-2xl border border-slate-100 p-4">
                    <h3 className="text-sm font-extrabold text-[#0B2D5B]">{table.name}</h3>
                    {table.groups.map((group) => (
                      <div key={group.name} className="mt-3">
                        {table.groups.length > 1 && (
                          <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            {group.name}
                          </p>
                        )}
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400">
                              <th className="py-1 font-bold">#</th>
                              <th className="py-1 font-bold">Time</th>
                              <th className="py-1 text-right font-bold">Pts</th>
                              <th className="py-1 text-right font-bold">J</th>
                            </tr>
                          </thead>
                          <tbody>
                            {group.entries.map((entry) => (
                              <tr key={`${group.name}-${entry.team}`} className="border-t border-slate-100">
                                <td className="py-1.5 font-bold text-[#0B2D5B]">{entry.pos}</td>
                                <td className="py-1.5 font-semibold text-slate-700">{entry.team}</td>
                                <td className="py-1.5 text-right font-extrabold text-[#0B2D5B]">{entry.pts}</td>
                                <td className="py-1.5 text-right text-slate-500">{entry.games}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="border-dashed">
            <p className="text-sm text-slate-500">
              <span className="mr-2 inline-flex rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-bold text-cyan-700">
                Ao vivo
              </span>
              Jogos e classificações de 15 campeonatos fornecidos pela ESPN, sem chave de API.
              Horários convertidos para Brasília.
            </p>
          </Card>
        </>
      )}
    </div>
  );
}
