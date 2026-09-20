"use client";

import { BellRing, Pause, Play, Trash2 } from "lucide-react";
import type { Radar, RadarAlert } from "@/types";
import { RADAR_TYPES } from "@/lib/radars";
import { cn } from "@/lib/utils";

interface RadarCardProps {
  radar: Radar;
  alert?: RadarAlert;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function RadarCard({ radar, alert, onToggle, onDelete }: RadarCardProps) {
  const typeLabel = RADAR_TYPES.find((t) => t.id === radar.type)?.label ?? radar.type;

  return (
    <article
      className={cn(
        "rounded-2xl border bg-white p-4 shadow-[0_2px_16px_rgba(11,45,91,0.06)]",
        radar.active ? "border-slate-100" : "border-dashed border-slate-200 opacity-75"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="inline-block rounded-full bg-[#EAF2F8] px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[#0B2D5B]">
            {typeLabel}
          </span>
          <h3 className="mt-2 truncate text-sm font-bold text-[#0B2D5B]" title={radar.title}>
            {radar.title}
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            {radar.target ? `Alvo: ${radar.target}` : "Sem alvo definido"}
            {radar.type === "clima" && radar.city ? ` • ${radar.city}` : ""}
          </p>
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            onClick={() => onToggle(radar.id)}
            aria-label={radar.active ? `Pausar ${radar.title}` : `Ativar ${radar.title}`}
            aria-pressed={radar.active}
            className="rounded-xl p-2 text-[#0B2D5B] hover:bg-slate-100"
          >
            {radar.active ? (
              <Pause className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Play className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
          <button
            type="button"
            onClick={() => onDelete(radar.id)}
            aria-label={`Excluir ${radar.title}`}
            className="rounded-xl p-2 text-red-500 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {radar.active && alert && (
        <div className="mt-3 flex items-start gap-2 rounded-xl bg-emerald-50 p-3 ring-1 ring-inset ring-emerald-200">
          <BellRing className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
          <p className="text-xs font-semibold leading-snug text-emerald-800">{alert.message}</p>
        </div>
      )}

      {radar.active && !alert && (
        <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500">
          Monitorando. Avisaremos aqui quando a condição for atendida.
        </p>
      )}
    </article>
  );
}
