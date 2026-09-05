import { Newspaper } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { newsMock } from "@/data/mock";

export function NewsCard() {
  return (
    <Card>
      <SectionHeader title="Notícias para você" />
      <div className="space-y-4">
        {newsMock.map((n) => (
          <article key={n.id} className="flex gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF2F8] text-[#0B2D5B]">
              <Newspaper className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#00C2D7]">
                {n.category}
              </p>
              <h3 className="text-sm font-bold leading-snug text-[#0B2D5B]">{n.title}</h3>
              <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{n.description}</p>
              <p className="mt-1 text-[11px] font-medium text-slate-400">{n.time}</p>
            </div>
          </article>
        ))}
      </div>
    </Card>
  );
}
