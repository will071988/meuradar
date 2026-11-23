"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, Pause, Play, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { SourceBadge } from "@/components/data/SourceBadge";
import { useApi } from "@/lib/useApi";
import { formationCoordinates } from "@/lib/tracker";
import type { MatchTrackerData, TrackerEvent, TrackerPlayer } from "@/types";

const STEP_MS = 1200;

function PlayerDot({ player }: { player: TrackerPlayer }) {
  const { x, y } = formationCoordinates(player.formationPlace, player.homeAway);
  const isKeeper = player.position === "G" || player.formationPlace === 1;
  const color = isKeeper ? "#FACC15" : player.homeAway === "home" ? "#0B2D5B" : "#FF8A3D";

  return (
    <g transform={`translate(${x} ${y})`} aria-label={`${player.name} (${player.jersey})`}>
      <circle r="2.7" fill={color} stroke="white" strokeWidth="0.5" />
      <text
        y="0.95"
        textAnchor="middle"
        fontSize="2.6"
        fontWeight="700"
        fill={isKeeper ? "#0B2D5B" : "white"}
      >
        {player.jersey}
      </text>
      <text y="5" textAnchor="middle" fontSize="2.1" fill="white" paintOrder="stroke" stroke="#0f172a" strokeWidth="0.5">
        {player.name}
      </text>
    </g>
  );
}

function PitchLines() {
  return (
    <g stroke="rgba(255,255,255,0.75)" strokeWidth="0.35" fill="none">
      <rect x="0.4" y="0.4" width="99.2" height="63.2" />
      <line x1="50" y1="0.4" x2="50" y2="63.6" />
      <circle cx="50" cy="32" r="9" />
      <circle cx="50" cy="32" r="0.6" fill="rgba(255,255,255,0.75)" />
      <rect x="0.4" y="13" width="16" height="38" />
      <rect x="83.6" y="13" width="16" height="38" />
      <rect x="0.4" y="23.5" width="5" height="17" />
      <rect x="94.6" y="23.5" width="5" height="17" />
      <circle cx="11" cy="32" r="0.6" fill="rgba(255,255,255,0.75)" />
      <circle cx="89" cy="32" r="0.6" fill="rgba(255,255,255,0.75)" />
      <path d="M 11 26 A 8 8 0 0 1 11 38" />
      <path d="M 89 26 A 8 8 0 0 0 89 38" />
    </g>
  );
}

function EventMarker({ event, active }: { event: TrackerEvent; active: boolean }) {
  if (event.x === undefined || event.y === undefined) return null;
  const isGoal = /goal/i.test(event.type);
  const isCard = /card/i.test(event.type);
  const color = isGoal ? "#22c55e" : isCard ? "#FACC15" : "white";

  return (
    <g transform={`translate(${event.x} ${event.y})`} opacity={active ? 1 : 0.55}>
      <circle r={active ? 2.1 : 1.5} fill={color} stroke="#0f172a" strokeWidth="0.4" />
      <text y="0.85" textAnchor="middle" fontSize="2.1" fontWeight="800" fill="#0f172a">
        {isGoal ? "G" : isCard ? "C" : "•"}
      </text>
    </g>
  );
}

export function MatchTracker({ eventId }: { eventId: string }) {
  const { data, source, loading, refresh } = useApi<MatchTrackerData>(
    `/api/esportes/tracker?event=${encodeURIComponent(eventId)}`
  );
  const [cursor, setCursor] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);

  const events = useMemo(
    () => [...(data?.events ?? [])].sort((a, b) => a.minute - b.minute),
    [data]
  );
  const positional = useMemo(
    () => events.filter((e) => e.x !== undefined && e.y !== undefined),
    [events]
  );
  const active = positional[cursor % Math.max(positional.length, 1)];

  useEffect(() => {
    if (data?.status !== "in") return;
    const timer = window.setInterval(() => refresh(), 10_000);
    return () => window.clearInterval(timer);
  }, [data?.status, refresh]);

  useEffect(() => {
    setCursor(0);
  }, [eventId]);

  useEffect(() => {
    if (!playing || positional.length === 0) return;
    if (cursor >= positional.length - 1) {
      setPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => setCursor((c) => c + 1), STEP_MS / speed);
    return () => window.clearTimeout(timer);
  }, [cursor, playing, positional.length, speed]);

  const ballX = active?.x ?? 50;
  const ballY = active?.y ?? 32;

  if (loading && !data) {
    return (
      <Card>
        <p className="text-sm text-slate-500">Carregando rastreador tático...</p>
      </Card>
    );
  }

  if (!data || (data.home.players.length === 0 && data.away.players.length === 0)) {
    return (
      <Card>
        <p className="text-sm text-slate-500">
          Escalação não disponível para esta partida na fonte de dados.
        </p>
      </Card>
    );
  }

  const lastEvents = events.slice(-6).reverse();

  return (
    <Card>
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-base font-bold text-[#0B2D5B]">
            <Activity className="h-5 w-5 text-[#00C2D7]" aria-hidden="true" />
            Rastreador tático
            {data.status === "in" && (
              <span className="rounded-md bg-red-50 px-2 py-0.5 text-[11px] font-extrabold text-red-600">
                AO VIVO
              </span>
            )}
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            {data.home.name} {data.home.score} x {data.away.score} {data.away.name} • {data.clock}
          </p>
        </div>
        {source && <SourceBadge source={source} />}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
        <div>
          <svg
            viewBox="0 0 100 64"
            className="w-full rounded-2xl shadow-inner"
            role="img"
            aria-label={`Campo tático: ${data.home.name} versus ${data.away.name}`}
          >
            <defs>
              <pattern id="stripes" width="10" height="64" patternUnits="userSpaceOnUse">
                <rect width="10" height="64" fill="#15803d" />
                <rect width="5" height="64" fill="#166534" />
              </pattern>
            </defs>
            <rect width="100" height="64" fill="url(#stripes)" />
            <PitchLines />
            {positional.map((event) => (
              <EventMarker
                key={event.id}
                event={event}
                active={event.id === active?.id}
              />
            ))}
            {[...data.home.players, ...data.away.players].map((player) => (
              <PlayerDot key={player.id} player={player} />
            ))}
            <g
              style={{
                transform: `translate(${ballX}px, ${ballY}px)`,
                transition: "transform 900ms ease-in-out",
              }}
            >
              <circle r="1.7" fill="white" stroke="#0f172a" strokeWidth="0.5" />
              <circle r="0.6" fill="#0f172a" />
            </g>
          </svg>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B2D5B] px-3 py-1.5 text-xs font-bold text-white"
            >
              {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              {playing ? "Pausar" : "Reproduzir"}
            </button>
            <button
              type="button"
              onClick={() => {
                setCursor(0);
                setPlaying(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-[#0B2D5B]"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reiniciar
            </button>
            <button
              type="button"
              onClick={() => setSpeed((s) => (s === 1 ? 2 : 1))}
              className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-[#0B2D5B]"
            >
              {speed}x
            </button>
            {active && (
              <span className="text-xs font-semibold text-slate-500">
                {active.minute}&apos; • {active.text}
              </span>
            )}
          </div>
        </div>

        <div>
          <h4 className="mb-2 text-xs font-extrabold uppercase tracking-wider text-slate-400">
            Lances com coordenadas
          </h4>
          {positional.length === 0 ? (
            <p className="text-xs text-slate-500">
              A fonte ainda não publicou coordenadas de lances para esta partida.
            </p>
          ) : (
            <ol className="space-y-1.5" aria-label="Linha do tempo de lances">
              {positional.map((event, index) => (
                <li key={event.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setCursor(index);
                      setPlaying(false);
                    }}
                    className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs ${
                      index === cursor ? "bg-[#EAF2F8] font-bold text-[#0B2D5B]" : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span className="w-8 shrink-0 font-extrabold text-[#00C2D7]">{event.minute}&apos;</span>
                    <span className="truncate">{event.text}</span>
                  </button>
                </li>
              ))}
            </ol>
          )}

          <h4 className="mb-2 mt-4 text-xs font-extrabold uppercase tracking-wider text-slate-400">
            Últimos eventos
          </h4>
          <ul className="space-y-1">
            {lastEvents.map((event) => (
              <li key={event.id} className="flex gap-2 text-xs text-slate-600">
                <span className="w-8 shrink-0 font-bold text-[#0B2D5B]">{event.minute}&apos;</span>
                <span className="truncate">{event.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="mt-3 text-[11px] text-slate-400">
        Formação e coordenadas reais da ESPN. Rastreamento óptico (EPTS 25 Hz) exige dados
        proprietários de clubes/ligas e não está disponível em APIs públicas.
      </p>
    </Card>
  );
}
