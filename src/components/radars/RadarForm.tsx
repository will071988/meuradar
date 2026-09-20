"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { Radar } from "@/types";
import { RADAR_TYPES } from "@/lib/radars";
import { loadPreferences } from "@/lib/preferences";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface RadarFormProps {
  onCreate: (input: { title: string; type: Radar["type"]; target: string; city: string }) => void;
}

export function RadarForm({ onCreate }: RadarFormProps) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<Radar["type"]>("preco");
  const [target, setTarget] = useState("");
  const [city, setCity] = useState("Rio de Janeiro, RJ");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCity(loadPreferences().city || "Rio de Janeiro, RJ");
  }, []);

  const typeMeta = RADAR_TYPES.find((t) => t.id === type) ?? RADAR_TYPES[0];

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Dê um nome ao radar. Ex.: " + (typeMeta?.example ?? ""));
      return;
    }
    setError(null);
    onCreate({ title, type, target, city });
    setTitle("");
    setTarget("");
  }

  return (
    <Card>
      <h2 className="text-base font-bold text-[#0B2D5B]">Criar novo radar</h2>
      <p className="text-sm text-slate-500">
        Ex.: “Notebook gamer abaixo de R$ 4.000”, “Chuva forte na minha região”.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <div>
          <label htmlFor="radar-title" className="text-sm font-bold text-[#0B2D5B]">
            O que monitorar?
          </label>
          <input
            id="radar-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={typeMeta?.example}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-[#00C2D7] focus:outline-none"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="radar-type" className="text-sm font-bold text-[#0B2D5B]">
              Tipo
            </label>
            <select
              id="radar-type"
              value={type}
              onChange={(e) => setType(e.target.value as Radar["type"])}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-[#00C2D7] focus:outline-none"
            >
              {RADAR_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="radar-target" className="text-sm font-bold text-[#0B2D5B]">
              {typeMeta?.targetLabel}
            </label>
            <input
              id="radar-target"
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder={typeMeta?.targetPlaceholder}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-[#00C2D7] focus:outline-none"
            />
          </div>
        </div>

        {(type === "clima" || type === "custom") && (
          <div>
            <label htmlFor="radar-city" className="text-sm font-bold text-[#0B2D5B]">
              Cidade (clima)
            </label>
            <input
              id="radar-city"
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-[#00C2D7] focus:outline-none"
            />
          </div>
        )}

        {error && (
          <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full sm:w-auto">
          Ativar radar
        </Button>
      </form>
    </Card>
  );
}
