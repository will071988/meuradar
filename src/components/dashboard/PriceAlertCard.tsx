import { Monitor } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { priceAlertMock } from "@/data/mock";

export function PriceAlertCard() {
  const p = priceAlertMock;

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
          <p className="mt-1 text-lg font-extrabold text-[#0B2D5B]">{p.currentPrice}</p>
          <p className="text-xs text-slate-400 line-through">{p.oldPrice}</p>
          <Badge tone="hot" className="mt-2">
            {p.discount}
          </Badge>
        </div>
      </div>
    </Card>
  );
}
