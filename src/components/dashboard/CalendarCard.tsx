import { Plus } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { calendarMock } from "@/data/mock";

export function CalendarCard() {
  return (
    <Card>
      <SectionHeader title="Seu Calendário" />
      <div className="flex items-center gap-3">
        <span className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-[#0B2D5B] text-white">
          <span className="text-xl font-extrabold leading-none">21</span>
          <span className="text-[11px] font-bold tracking-wider text-[#00C2D7]">MAI</span>
        </span>
        <p className="text-sm font-semibold text-slate-500">
          3 compromissos
          <span className="block text-xs font-normal">Organize seu dia sem stress.</span>
        </p>
      </div>
      <ul className="mt-4 space-y-2.5">
        {calendarMock.map((e) => (
          <li key={e.id} className="flex items-center gap-3">
            <span className="w-12 shrink-0 text-xs font-bold text-[#00C2D7]">{e.time}</span>
            <span className="flex-1 truncate rounded-xl bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-700">
              {e.title}
            </span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 px-3 py-2.5 text-sm font-bold text-[#0B2D5B] hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00C2D7]"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        Adicionar lembrete
      </button>
    </Card>
  );
}
