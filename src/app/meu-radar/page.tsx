"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Cloud, CloudOff, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { RadarForm } from "@/components/radars/RadarForm";
import { RadarCard } from "@/components/radars/RadarCard";
import { SourceBadge } from "@/components/data/SourceBadge";
import { useAuth } from "@/components/auth/AuthProvider";
import { INTERESTS, loadPreferences } from "@/lib/preferences";
import { createRadar, evaluateRadars, loadRadars, saveRadars } from "@/lib/radars";
import {
  canSyncCloud,
  deleteCloudRadar,
  fetchCloudRadars,
  insertCloudRadar,
  updateCloudRadar,
} from "@/lib/radarsCloud";
import type { ApiResponse, MarketItem, Radar, RadarAlert, UserPreferences, WeatherData } from "@/types";
import { DEFAULT_PREFERENCES } from "@/lib/preferences";

export default function MeuRadarPage() {
  const { user, loading: authLoading } = useAuth();
  const [prefs, setPrefs] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [radars, setRadars] = useState<Radar[]>([]);
  const [alerts, setAlerts] = useState<RadarAlert[]>([]);
  const [source, setSource] = useState<"live" | "demo" | null>(null);
  const [checking, setChecking] = useState(false);
  const [cloudState, setCloudState] = useState<"off" | "syncing" | "on" | "error">("off");
  const syncedOnce = useRef(false);

  useEffect(() => {
    setPrefs(loadPreferences());
    setRadars(loadRadars());
  }, []);

  // Sync nuvem (Sprint 5): busca na nuvem quando logado; migra local se nuvem vazia.
  useEffect(() => {
    if (authLoading || syncedOnce.current) return;
    if (!user || !canSyncCloud()) {
      setCloudState(user ? "error" : "off");
      return;
    }
    syncedOnce.current = true;
    setCloudState("syncing");

    fetchCloudRadars(user.id)
      .then((cloud) => {
        if (cloud === null) {
          setCloudState("error");
          return;
        }
        if (cloud.length > 0) {
          setRadars(cloud);
          saveRadars(cloud);
          setCloudState("on");
        } else {
          const local = loadRadars();
          if (local.length === 0) {
            setCloudState("on");
            return;
          }
          Promise.all(local.map((r) => insertCloudRadar(user.id, r))).then((ids) => {
            const merged = local.map((r, i) => (ids[i] ? { ...r, cloudId: ids[i] as string } : r));
            setRadars(merged);
            saveRadars(merged);
            setCloudState("on");
          });
        }
      })
      .catch(() => setCloudState("error"));
  }, [authLoading, user]);

  const check = useCallback(() => {
    const active = radars.filter((r) => r.active);
    if (active.length === 0) {
      setAlerts([]);
      setSource(null);
      return;
    }
    setChecking(true);
    const city = prefs.city || "Rio de Janeiro, RJ";

    Promise.all([
      fetch(`/api/clima?city=${encodeURIComponent(city)}`, { cache: "no-store" })
        .then((r) => (r.ok ? (r.json() as Promise<ApiResponse<WeatherData>>) : null))
        .catch(() => null),
      fetch("/api/mercado", { cache: "no-store" })
        .then((r) => (r.ok ? (r.json() as Promise<ApiResponse<MarketItem[]>>) : null))
        .catch(() => null),
    ])
      .then(([w, m]) => {
        setAlerts(evaluateRadars(active, { weather: w?.data ?? null, market: m?.data ?? null }));
        setSource(w?.source === "live" || m?.source === "live" ? "live" : "demo");
      })
      .finally(() => setChecking(false));
  }, [radars, prefs.city]);

  useEffect(() => {
    if (radars.length > 0) check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [radars.length]);

  function persist(next: Radar[]) {
    setRadars(next);
    saveRadars(next);
  }

  function handleCreate(input: { title: string; type: Radar["type"]; target: string; city: string }) {
    const radar = createRadar(input);
    persist([...radars, radar]);
    if (user && canSyncCloud()) {
      void insertCloudRadar(user.id, radar).then((id) => {
        if (!id) return;
        setRadars((prev) => {
          const next = prev.map((r) => (r.id === radar.id ? { ...r, cloudId: id } : r));
          saveRadars(next);
          return next;
        });
      });
    }
  }

  function handleToggle(id: string) {
    const target = radars.find((r) => r.id === id);
    const next = radars.map((r) => (r.id === id ? { ...r, active: !r.active } : r));
    persist(next);
    if (target?.cloudId && canSyncCloud()) {
      void updateCloudRadar(target.cloudId, { active: !target.active });
    }
  }

  function handleDelete(id: string) {
    const target = radars.find((r) => r.id === id);
    persist(radars.filter((r) => r.id !== id));
    if (target?.cloudId && canSyncCloud()) {
      void deleteCloudRadar(target.cloudId);
    }
  }

  const labels = INTERESTS.filter((o) => prefs.interests.includes(o.id));
  const alertByRadar = new Map(alerts.map((a) => [a.radarId, a]));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#0B2D5B] sm:text-3xl">
            Meu Radar
          </h1>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500 sm:text-base">
            {user ? `Radar de ${user.name} • ${prefs.city}` : "Seus monitoramentos personalizados e alertas inteligentes."}
            {user && cloudState === "on" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                <Cloud className="h-3 w-3" aria-hidden="true" /> Nuvem ativa
              </span>
            )}
            {user && cloudState === "syncing" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500">
                Sincronizando...
              </span>
            )}
            {user && cloudState === "error" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700 ring-1 ring-inset ring-amber-200">
                <CloudOff className="h-3 w-3" aria-hidden="true" /> Somente local
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {source && <SourceBadge source={source} />}
          <Button type="button" variant="outline" onClick={check} disabled={checking}>
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            {checking ? "Verificando..." : "Verificar agora"}
          </Button>
        </div>
      </div>

      {!authLoading && !user && (
        <Card className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-base font-bold text-[#0B2D5B]">Entre para sincronizar na nuvem</p>
            <p className="text-sm text-slate-500">
              Sem conta, seus radares ficam só neste navegador.
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

      {alerts.length > 0 && (
        <Card className="border-emerald-200 bg-emerald-50/50">
          <h2 className="text-base font-bold text-[#0B2D5B]">
            {alerts.length} alerta{alerts.length > 1 ? "s" : ""} agora
          </h2>
          <ul className="mt-2 space-y-2">
            {alerts.map((a) => (
              <li key={a.radarId} className="rounded-xl bg-white p-3 text-sm">
                <span className="font-bold text-[#0B2D5B]">{a.title}: </span>
                <span className="text-slate-600">{a.message}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <RadarForm onCreate={handleCreate} />

      <div>
        <h2 className="mb-3 text-base font-bold text-[#0B2D5B]">
          Seus radares ({radars.filter((r) => r.active).length} ativos de {radars.length})
        </h2>
        {radars.length === 0 ? (
          <Card>
            <p className="text-sm text-slate-500">
              Nenhum radar ainda. Crie o primeiro acima — ex.: “Notebook gamer abaixo de R$ 4.000”.
            </p>
          </Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {radars.map((radar) => (
              <RadarCard
                key={radar.id}
                radar={radar}
                alert={alertByRadar.get(radar.id)}
                onToggle={handleToggle}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

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
    </div>
  );
}
