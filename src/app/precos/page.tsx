"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Cloud, CloudOff } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PriceTrackForm } from "@/components/prices/PriceTrackForm";
import { PriceTrackCard } from "@/components/prices/PriceTrackCard";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  appendPrice,
  createTrack,
  formatBRLTrack,
  loadTracks,
  saveTracks,
  totalSavings,
  tracksOnTarget,
} from "@/lib/prices";
import {
  canSyncPrices,
  deleteCloudTrack,
  fetchCloudTracks,
  insertCloudTrack,
  updateCloudTrack,
} from "@/lib/pricesCloud";
import type { PriceTrack } from "@/types";

export default function PrecosPage() {
  const { user, loading: authLoading } = useAuth();
  const [tracks, setTracks] = useState<PriceTrack[]>([]);
  const [cloudState, setCloudState] = useState<"off" | "syncing" | "on" | "error">("off");
  const syncedOnce = useRef(false);

  useEffect(() => {
    setTracks(loadTracks());
  }, []);

  useEffect(() => {
    if (authLoading || syncedOnce.current) return;
    if (!user || !canSyncPrices()) {
      setCloudState(user ? "error" : "off");
      return;
    }
    syncedOnce.current = true;
    setCloudState("syncing");

    fetchCloudTracks(user.id)
      .then((cloud) => {
        if (cloud === null) {
          setCloudState("error");
          return;
        }
        if (cloud.length > 0) {
          setTracks(cloud);
          saveTracks(cloud);
          setCloudState("on");
        } else {
          const local = loadTracks();
          if (local.length === 0) {
            setCloudState("on");
            return;
          }
          Promise.all(local.map((t) => insertCloudTrack(user.id, t))).then((ids) => {
            const merged = local.map((t, i) => (ids[i] ? { ...t, cloudId: ids[i] as string } : t));
            setTracks(merged);
            saveTracks(merged);
            setCloudState("on");
          });
        }
      })
      .catch(() => setCloudState("error"));
  }, [authLoading, user]);

  function persist(next: PriceTrack[]) {
    setTracks(next);
    saveTracks(next);
  }

  function handleCreate(input: {
    product: string;
    store: string;
    targetPrice: number;
    currentPrice: number;
  }) {
    const track = createTrack(input);
    persist([...tracks, track]);
    if (user && canSyncPrices()) {
      void insertCloudTrack(user.id, track).then((id) => {
        if (!id) return;
        setTracks((prev) => {
          const next = prev.map((t) => (t.id === track.id ? { ...t, cloudId: id } : t));
          saveTracks(next);
          return next;
        });
      });
    }
  }

  function handleToggle(id: string) {
    const target = tracks.find((t) => t.id === id);
    persist(tracks.map((t) => (t.id === id ? { ...t, active: !t.active } : t)));
    if (target?.cloudId && canSyncPrices()) {
      void updateCloudTrack(target.cloudId, { active: !target.active });
    }
  }

  function handleDelete(id: string) {
    const target = tracks.find((t) => t.id === id);
    persist(tracks.filter((t) => t.id !== id));
    if (target?.cloudId && canSyncPrices()) {
      void deleteCloudTrack(target.cloudId);
    }
  }

  function handleUpdatePrice(id: string, price: number) {
    const target = tracks.find((t) => t.id === id);
    if (!target) return;
    const updated = appendPrice(target, price);
    persist(tracks.map((t) => (t.id === id ? updated : t)));
    if (target.cloudId && canSyncPrices()) {
      void updateCloudTrack(target.cloudId, {
        current_price: updated.currentPrice,
        history: updated.history,
      });
    }
  }

  const onTarget = tracksOnTarget(tracks);
  const active = tracks.filter((t) => t.active);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex flex-wrap items-center gap-2 text-2xl font-extrabold tracking-tight text-[#0B2D5B] sm:text-3xl">
          Preços
          {user && cloudState === "on" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 ring-1 ring-inset ring-emerald-200">
              <Cloud className="h-3 w-3" aria-hidden="true" /> Nuvem ativa
            </span>
          )}
          {user && cloudState === "error" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700 ring-1 ring-inset ring-amber-200">
              <CloudOff className="h-3 w-3" aria-hidden="true" /> Somente local
            </span>
          )}
        </h1>
        <p className="mt-1 text-sm text-slate-500 sm:text-base">
          Monitore produtos, acompanhe o histórico e receba o alerta no alvo.
        </p>
      </div>

      {!authLoading && !user && (
        <Card className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-base font-bold text-[#0B2D5B]">Entre para sincronizar na nuvem</p>
            <p className="text-sm text-slate-500">
              Sem conta, seus produtos ficam só neste navegador.
            </p>
          </div>
          <Link
            href="/login"
            className="rounded-xl bg-[#0B2D5B] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#123e7a]"
          >
            Entrar
          </Link>
        </Card>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Monitorando</p>
          <p className="mt-1 text-2xl font-extrabold text-[#0B2D5B]">{active.length}</p>
        </Card>
        <Card>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">No alvo</p>
          <p className="mt-1 text-2xl font-extrabold text-emerald-600">{onTarget.length}</p>
        </Card>
        <Card>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Economia total</p>
          <p className="mt-1 text-2xl font-extrabold text-[#0B2D5B]">
            {formatBRLTrack(totalSavings(tracks))}
          </p>
        </Card>
      </div>

      <PriceTrackForm onCreate={handleCreate} />

      <div>
        <h2 className="mb-3 text-base font-bold text-[#0B2D5B]">
          Seus produtos ({tracks.length})
        </h2>
        {tracks.length === 0 ? (
          <Card>
            <p className="text-sm text-slate-500">
              Nenhum produto ainda. Monitore o primeiro acima.
            </p>
          </Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {tracks.map((track) => (
              <PriceTrackCard
                key={track.id}
                track={track}
                onToggle={handleToggle}
                onDelete={handleDelete}
                onUpdatePrice={handleUpdatePrice}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
