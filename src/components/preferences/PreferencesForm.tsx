"use client";

import { useEffect, useState } from "react";
import type { UserPreferences } from "@/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DEFAULT_PREFERENCES, INTERESTS, loadPreferences, savePreferences } from "@/lib/preferences";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/components/auth/AuthProvider";
import { cn } from "@/lib/utils";

export function PreferencesForm() {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setPrefs(loadPreferences());
  }, []);

  function toggleInterest(id: string) {
    setPrefs((prev) => ({
      ...prev,
      interests: prev.interests.includes(id)
        ? prev.interests.filter((i) => i !== id)
        : [...prev.interests, id],
    }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    savePreferences(prefs);

    if (user && isSupabaseConfigured()) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        await supabase.from("preferences").upsert({
          user_id: user.id,
          interests: prefs.interests,
          city: prefs.city,
          team: prefs.team,
          notify_email: prefs.notifyEmail,
          notify_push: prefs.notifyPush,
        });
      }
    }

    setSaving(false);
    setSaved(true);
  }

  return (
    <Card>
      <h2 className="text-base font-bold text-[#0B2D5B] sm:text-lg">Suas preferências</h2>
      <p className="text-sm text-slate-500">Escolha o que o MeuRadar deve priorizar para você.</p>

      <p className="mt-4 text-sm font-bold text-[#0B2D5B]">Interesses</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {INTERESTS.map((opt) => {
          const active = prefs.interests.includes(opt.id);
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => toggleInterest(opt.id)}
              aria-pressed={active}
              className={cn(
                "rounded-full px-3.5 py-2 text-sm font-semibold ring-1 ring-inset transition",
                active
                  ? "bg-[#0B2D5B] text-white ring-[#0B2D5B]"
                  : "bg-slate-50 text-slate-600 ring-slate-200 hover:bg-slate-100"
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="city" className="text-sm font-bold text-[#0B2D5B]">
            Cidade
          </label>
          <input
            id="city"
            type="text"
            value={prefs.city}
            onChange={(e) => setPrefs({ ...prefs, city: e.target.value })}
            placeholder="Rio de Janeiro, RJ"
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-[#00C2D7] focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="team" className="text-sm font-bold text-[#0B2D5B]">
            Time
          </label>
          <input
            id="team"
            type="text"
            value={prefs.team}
            onChange={(e) => setPrefs({ ...prefs, team: e.target.value })}
            placeholder="Flamengo"
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-[#00C2D7] focus:outline-none"
          />
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {(
          [
            { key: "notifyEmail", label: "Alertas por e-mail" },
            { key: "notifyPush", label: "Alertas push / WhatsApp (futuro)" },
          ] as const
        ).map((row) => (
          <label key={row.key} className="flex cursor-pointer items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-700">
            {row.label}
            <input
              type="checkbox"
              checked={prefs[row.key]}
              onChange={(e) => {
                setPrefs({ ...prefs, [row.key]: e.target.checked });
                setSaved(false);
              }}
              aria-label={row.label}
              className="h-5 w-5 accent-[#0B2D5B]"
            />
          </label>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <Button type="button" onClick={handleSave} disabled={saving}>
          {saving ? "Salvando..." : "Salvar preferências"}
        </Button>
        {saved && (
          <span role="status" className="text-sm font-bold text-emerald-600">
            Salvo!
          </span>
        )}
      </div>
    </Card>
  );
}
