"use client";

import { useEffect, useState } from "react";
import { Monitor } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { useApi } from "@/lib/useApi";
import { discountPct, formatBRLTrack, loadTracks, tracksOnTarget } from "@/lib/prices";
import type { MarketItem } from "@/types";

interface Highlight {
  product: string;
  current: string;
  old?: string;
  discount?: string;
}

export function PriceAlertCard() {
  const [best, setBest] = useState<Highlight | null>(null);
  const { data: market } = useApi<MarketItem[]>("/api/mercado");

  useEffect(() => {
    const hits = tracksOnTarget(loadTracks());
    if (hits.length === 0) return;
    const top = [...hits].sort((a, b) => a.currentPrice - b.currentPrice)[0];
    if (!top) return;
    const ref = Math.max(top.targetPrice, ...top.history.map((h) => h.price));
    setBest({
      product: top.product,
      current: formatBRLTrack(top.currentPrice),
      old: formatBRLTrack(ref),
      discount: discountPct(top.currentPrice, ref),
    });
  }, []);

  const quote = market?.[0];
  const p: Highlight = best ?? {
    product: quote ? `${quote.name} · cotação ao vivo` : "Carregando cotação...",
    current: quote?.value ?? "—",
    old: undefined,
    discount: quote?.variation,
  };

  return (
    <Card>
      <SectionHeader title="Alerta de Preços" />
      <div className="flex gap-4">
        <span
          aria-hidden="true"
          className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[#0B2D5B] text-white"
        >
          <Monitor className="h-9 w-9" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-[#0B2D5B]">{p.product}</p>
          <p className="mt-1 text-lg font-extrabold text-[#0B2D5B]">{p.current}</p>
          {p.old && <p className="text-xs text-slate-400 line-through">{p.old}</p>}
          {p.discount && (
            <Badge tone="hot" className="mt-2">
              {p.discount}
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
}
