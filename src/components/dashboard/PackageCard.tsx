import { Package } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { packageMock } from "@/data/mock";
import { cn } from "@/lib/utils";

export function PackageCard() {
  const pkg = packageMock;

  return (
    <Card>
      <SectionHeader title="Rastreio de Encomendas" />
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-[#FF8A3D]">
          <Package className="h-6 w-6" aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-bold text-[#0B2D5B]">{pkg.status}</p>
          <p className="text-xs font-semibold text-emerald-600">{pkg.eta}</p>
        </div>
      </div>

      <ol className="mt-5 space-y-0" aria-label="Progresso da entrega">
        {pkg.steps.map((step, idx) => {
          const done = idx < pkg.currentStepIndex;
          const active = idx === pkg.currentStepIndex;
          return (
            <li key={step.id} className="relative flex gap-3 pb-5 last:pb-0">
              {idx < pkg.steps.length - 1 && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute left-[7px] top-5 h-[calc(100%-1rem)] w-0.5",
                    done || active ? "bg-[#00C2D7]" : "bg-slate-200"
                  )}
                />
              )}
              <span
                aria-hidden="true"
                className={cn(
                  "z-10 mt-1 h-4 w-4 shrink-0 rounded-full border-2",
                  done && "border-[#00C2D7] bg-[#00C2D7]",
                  active && "border-[#FF8A3D] bg-[#FF8A3D]",
                  !done && !active && "border-slate-300 bg-white"
                )}
              />
              <span
                className={cn(
                  "text-sm",
                  active ? "font-bold text-[#0B2D5B]" : done ? "font-semibold text-slate-600" : "text-slate-400"
                )}
              >
                {step.label}
                {active && (
                  <span className="ml-2 rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-bold text-[#FF8A3D]">
                    atual
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
