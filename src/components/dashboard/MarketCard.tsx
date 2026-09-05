import { TrendingDown, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { marketMock } from "@/data/mock";
import { cn } from "@/lib/utils";

export function MarketCard() {
  return (
    <Card>
      <SectionHeader title="Mercado" />
      <ul className="space-y-3">
        {marketMock.map((item) => {
          const up = item.trend === "up";
          return (
            <li
              key={item.id}
              className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5"
            >
              <div>
                <p className="text-sm font-bold text-[#0B2D5B]">{item.name}</p>
                <p className="text-sm font-semibold text-slate-600">{item.value}</p>
              </div>
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold",
                  up ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                )}
              >
                {up ? (
                  <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                {item.variation}
              </span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
