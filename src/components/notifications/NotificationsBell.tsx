"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import type { ApiResponse, MarketItem, RadarAlert, WeatherData } from "@/types";
import { evaluateRadars, loadRadars } from "@/lib/radars";
import { loadPreferences } from "@/lib/preferences";

const READ_KEY = "meuradar-read-v1";

function readDismissed(): string[] {
  try {
    const raw = window.localStorage.getItem(READ_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function NotificationsBell() {
  const [alerts, setAlerts] = useState<RadarAlert[]>([]);
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState<string[]>([]);

  const refresh = useCallback(() => {
    const radars = loadRadars().filter((r) => r.active);
    if (radars.length === 0) {
      setAlerts([]);
      return;
    }
    const city = loadPreferences().city || "Rio de Janeiro, RJ";

    Promise.all([
      fetch(`/api/clima?city=${encodeURIComponent(city)}`, { cache: "no-store" })
        .then((r) => (r.ok ? (r.json() as Promise<ApiResponse<WeatherData>>) : null))
        .catch(() => null),
      fetch("/api/mercado", { cache: "no-store" })
        .then((r) => (r.ok ? (r.json() as Promise<ApiResponse<MarketItem[]>>) : null))
        .catch(() => null),
    ]).then(([w, m]) => {
      setAlerts(
        evaluateRadars(radars, { weather: w?.data ?? null, market: m?.data ?? null })
      );
    });
  }, []);

  useEffect(() => {
    setDismissed(readDismissed());
    refresh();
    const timer = setInterval(refresh, 5 * 60 * 1000);
    return () => clearInterval(timer);
  }, [refresh]);

  const visible = alerts.filter((a) => !dismissed.includes(a.radarId));

  function dismissAll() {
    const ids = alerts.map((a) => a.radarId);
    setDismissed(ids);
    window.localStorage.setItem(READ_KEY, JSON.stringify(ids));
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          refresh();
        }}
        aria-label={`Notificações${visible.length > 0 ? `, ${visible.length} não lidas` : ""}`}
        aria-expanded={open}
        className="relative rounded-full border border-slate-200 p-2.5 text-[#0B2D5B] hover:bg-slate-50"
      >
        <Bell className="h-5 w-5" aria-hidden="true" />
        {visible.length > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#FF8A3D] px-1 text-[11px] font-extrabold text-white">
            {visible.length}
          </span>
        )}
      </button>

      {open && (
        <>
          <button
            aria-label="Fechar notificações"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-30 cursor-default bg-transparent"
          />
          <div className="absolute right-0 z-40 mt-2 w-80 max-w-[85vw] rounded-2xl border border-slate-100 bg-white p-3 shadow-2xl">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-[#0B2D5B]">Alertas dos seus radares</p>
              {visible.length > 0 && (
                <button
                  type="button"
                  onClick={dismissAll}
                  className="text-xs font-bold text-[#00C2D7] hover:underline"
                >
                  Marcar lidas
                </button>
              )}
            </div>
            {visible.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">
                Nenhum alerta agora. Crie radares em{" "}
                <Link href="/meu-radar" onClick={() => setOpen(false)} className="font-bold text-[#00C2D7] hover:underline">
                  Meu Radar
                </Link>
                .
              </p>
            ) : (
              <ul className="mt-2 max-h-80 space-y-2 overflow-y-auto">
                {visible.map((a) => (
                  <li key={a.radarId} className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs font-bold text-[#0B2D5B]">{a.title}</p>
                    <p className="mt-0.5 text-xs leading-snug text-slate-600">{a.message}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
