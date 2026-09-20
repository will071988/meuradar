"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { RadarToday } from "@/components/dashboard/RadarToday";
import { useAuth } from "@/components/auth/AuthProvider";
import { INTERESTS, loadPreferences } from "@/lib/preferences";
import type { UserPreferences } from "@/types";
import { DEFAULT_PREFERENCES } from "@/lib/preferences";

export default function MeuRadarPage() {
  const { user, loading } = useAuth();
  const [prefs, setPrefs] = useState<UserPreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    setPrefs(loadPreferences());
  }, []);

  const labels = INTERESTS.filter((o) => prefs.interests.includes(o.id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#0B2D5B] sm:text-3xl">
          Meu Radar
        </h1>
        <p className="mt-1 text-sm text-slate-500 sm:text-base">
          {user
            ? `Radar de ${user.name} • ${prefs.city}`
            : "Seus monitoramentos personalizados e alertas inteligentes."}
        </p>
      </div>

      {!loading && !user && (
        <Card className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-base font-bold text-[#0B2D5B]">Entre para salvar seu radar</p>
            <p className="text-sm text-slate-500">
              Sem conta, suas preferências ficam só neste navegador.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/login"
              className="rounded-xl bg-[#0B2D5B] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#123e7a]"
            >
              Entrar
            </Link>
            <Link
              href="/conta"
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-[#0B2D5B] hover:bg-slate-50"
            >
              Personalizar
            </Link>
          </div>
        </Card>
      )}

      <Card>
        <h2 className="text-base font-bold text-[#0B2D5B]">Interesses ativos</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {labels.length === 0 && (
            <span className="text-sm text-slate-500">Nenhum interesse selecionado.</span>
          )}
          {labels.map((l) => (
            <span
              key={l.id}
              className="rounded-full bg-[#EAF2F8] px-3 py-1.5 text-xs font-bold text-[#0B2D5B]"
            >
              {l.label}
            </span>
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Cidade: {prefs.city} • Time: {prefs.team} •{" "}
          <Link href="/conta" className="font-bold text-[#00C2D7] hover:underline">
            Editar em Conta
          </Link>
        </p>
      </Card>

      <RadarToday />

      <Card className="text-center">
        <p className="text-base font-bold text-[#0B2D5B]">Radares personalizados chegam na Sprint 4</p>
        <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
          Em breve você poderá criar alertas como “Notebook gamer abaixo de R$ 4.000” e receber
          notificações automáticas.
        </p>
      </Card>
    </div>
  );
}
