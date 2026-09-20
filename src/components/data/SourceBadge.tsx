import { cn } from "@/lib/utils";
import type { DataSource } from "@/types";

export function SourceBadge({ source }: { source: DataSource }) {
  const live = source === "live";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider ring-1 ring-inset",
        live
          ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
          : "bg-amber-50 text-amber-700 ring-amber-200"
      )}
    >
      <span
        aria-hidden="true"
        className={cn("h-1.5 w-1.5 rounded-full", live ? "bg-emerald-500" : "bg-amber-500")}
      />
      {live ? "Ao vivo" : "Demo"}
    </span>
  );
}
