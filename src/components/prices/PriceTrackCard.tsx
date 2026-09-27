"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { BellRing, Pause, Play, Trash2 } from "lucide-react";
import type { PriceTrack } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { discountPct, formatBRLTrack, parseBRL } from "@/lib/prices";
import { PriceSparkline } from "./PriceSparkline";
import { cn } from "@/lib/utils";

interface PriceTrackCardProps {
  track: PriceTrack;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdatePrice: (id: string, price: number) => void;
}

export function PriceTrackCard({ track, onToggle, onDelete, onUpdatePrice }: PriceTrackCardProps) {
  const [price, setPrice] = useState("");
  const [error, setError] = useState<string | null>(null);

  const ref = Math.max(track.targetPrice, ...track.history.map((h) => h.price));
  const onTarget = track.active && track.currentPrice <= track.targetPrice;

  function handleUpdate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = parseBRL(price);
    if (value === null) {
      setError("Preço inválido.");
      return;
    }
    setError(null);
    setPrice("");
    onUpdatePrice(track.id, value);
  }

  return (
    <article
      className={cn(
        "rounded-2xl border bg-white p-4 shadow-[0_2px_16px_rgba(11,45,91,0.06)]",
        track.active ? "border-slate-100" : "border-dashed border-slate-200 opacity-75"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-bold text-[#0B2D5B]" title={track.product}>
            {track.product}
          </h3>
          <p className="text-xs text-slate-500">{track.store}</p>
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            onClick={() => onToggle(track.id)}
            aria-label={track.active ? `Pausar ${track.product}` : `Ativar ${track.product}`}
            aria-pressed={track.active}
            className="rounded-xl p-2 text-[#0B2D5B] hover:bg-slate-100"
          >
            {track.active ? (
              <Pause className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Play className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
          <button
            type="button"
            onClick={() => onDelete(track.id)}
            aria-label={`Excluir ${track.product}`}
            className="rounded-xl p-2 text-red-500 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <p className="text-xl font-extrabold text-[#0B2D5B]">
          {formatBRLTrack(track.currentPrice)}
        </p>
        <p className="text-xs text-slate-400">
          alvo {formatBRLTrack(track.targetPrice)}
        </p>
        <Badge tone={onTarget ? "up" : "hot"}>{discountPct(track.currentPrice, ref)}</Badge>
      </div>

      <div className="mt-2">
        <PriceSparkline history={track.history} />
      </div>

      {onTarget && (
        <div className="mt-2 flex items-start gap-2 rounded-xl bg-emerald-50 p-3 ring-1 ring-inset ring-emerald-200">
          <BellRing className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
          <p className="text-xs font-semibold text-emerald-800">
            No alvo! Por {formatBRLTrack(track.currentPrice)} (alvo {formatBRLTrack(track.targetPrice)}).
          </p>
        </div>
      )}

      <form onSubmit={handleUpdate} className="mt-3 flex gap-2">
        <label htmlFor={`price-${track.id}`} className="sr-only">
          Atualizar preço de {track.product}
        </label>
        <input
          id={`price-${track.id}`}
          type="text"
          inputMode="decimal"
          value={price}
          onChange={(e) => {
            setPrice(e.target.value);
            setError(null);
          }}
          placeholder="Novo preço R$"
          className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-[#00C2D7] focus:outline-none"
        />
        <button
          type="submit"
          className="shrink-0 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-[#0B2D5B] hover:bg-slate-50"
        >
          Atualizar
        </button>
      </form>
      {error && (
        <p role="alert" className="mt-1 text-xs font-semibold text-red-600">
          {error}
        </p>
      )}
    </article>
  );
}
