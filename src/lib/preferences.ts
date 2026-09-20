import type { InterestOption, UserPreferences } from "@/types";

export const INTERESTS: InterestOption[] = [
  { id: "clima", label: "Clima" },
  { id: "noticias", label: "Notícias" },
  { id: "mercado", label: "Mercado" },
  { id: "precos", label: "Preços e ofertas" },
  { id: "vagas", label: "Vagas e concursos" },
  { id: "esportes", label: "Esportes" },
  { id: "encomendas", label: "Encomendas" },
  { id: "agenda", label: "Agenda" },
];

export const DEFAULT_PREFERENCES: UserPreferences = {
  interests: ["clima", "noticias", "mercado", "esportes"],
  city: "Rio de Janeiro, RJ",
  team: "Flamengo",
  notifyEmail: true,
  notifyPush: true,
};

const STORAGE_KEY = "meuradar-preferences-v1";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function loadPreferences(): UserPreferences {
  if (!isBrowser()) return DEFAULT_PREFERENCES;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(raw) as Partial<UserPreferences>;
    return {
      interests: Array.isArray(parsed.interests) ? parsed.interests : DEFAULT_PREFERENCES.interests,
      city: typeof parsed.city === "string" ? parsed.city : DEFAULT_PREFERENCES.city,
      team: typeof parsed.team === "string" ? parsed.team : DEFAULT_PREFERENCES.team,
      notifyEmail: typeof parsed.notifyEmail === "boolean" ? parsed.notifyEmail : true,
      notifyPush: typeof parsed.notifyPush === "boolean" ? parsed.notifyPush : true,
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function savePreferences(prefs: UserPreferences): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}
