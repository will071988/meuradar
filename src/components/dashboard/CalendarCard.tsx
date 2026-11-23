"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { CalendarEvent } from "@/types";

export function CalendarCard() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("meuradar:events");
      if (raw) setEvents(JSON.parse(raw) as CalendarEvent[]);
    } catch {
      setEvents([]);
    }
  }, []);

  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = today.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "").toUpperCase();

  return (
    <Card>
      <SectionHeader title="Seu Calendário" />
      <div className="flex items-center gap-3">
        <span className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-[#0B2D5B] text-white">
          <span className="text-xl font-extrabold leading-none">{day}</span>
          <span className="text-[11px] font-bold tracking-wider text-[#00C2D7]">{month}</span>
        </span>
        <p className="text-sm font-semibold text-slate-500">
          {events.length > 0 ? `${events.length} compromisso(s) salvo(s)` : "Nenhum lembrete salvo"}
          <span className="block text-xs font-normal">Seus eventos ficam neste navegador.</span>
        </p>
      </div>
      {events.length > 0 && (
        <ul className="mt-4 space-y-2.5">
          {events.map((e) => (
            <li key={e.id} className="flex items-center gap-3">
              <span className="w-12 shrink-0 text-xs font-bold text-[#00C2D7]">{e.time}</span>
              <span className="flex-1 truncate rounded-xl bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-700">
                {e.title}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
