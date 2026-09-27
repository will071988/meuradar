import type { PriceTrack } from "@/types";
import { priceAlertMock } from "@/data/mock";

const STORAGE_KEY = "meuradar-prices-v1";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function uid(): string {
  return `p-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** "R$ 1.899,00" / "1899" / "1.899,90" -> 1899 */
export function parseBRL(text: string): number | null {
  const cleaned = text.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
  const n = Number(cleaned);
  return Number.isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : null;
}

export function formatBRLTrack(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function discountPct(current: number, reference: number): string {
  if (reference <= 0 || current >= reference) return "-0%";
  return `-${Math.round(((reference - current) / reference) * 100)}%`;
}

function seed(): PriceTrack[] {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  return [
    {
      id: uid(),
      product: 'Monitor LG UltraGear 27"',
      store: "Loja demo",
      targetPrice: 1899,
      currentPrice: 1899,
      history: [
        { at: new Date(now - 21 * day).toISOString(), price: 2249 },
        { at: new Date(now - 14 * day).toISOString(), price: 2149 },
        { at: new Date(now - 7 * day).toISOString(), price: 1999 },
        { at: new Date(now - 1 * day).toISOString(), price: 1899 },
      ],
      active: true,
      createdAt: new Date(now - 21 * day).toISOString(),
    },
  ];
}

function sanitize(list: unknown): PriceTrack[] | null {
  if (!Array.isArray(list)) return null;
  const out: PriceTrack[] = [];
  for (const item of list) {
    if (typeof item !== "object" || item === null) continue;
    const t = item as Partial<PriceTrack>;
    if (typeof t.id !== "string" || typeof t.product !== "string" || !t.product.trim()) continue;
    if (typeof t.currentPrice !== "number" || !Number.isFinite(t.currentPrice)) continue;
    const history = Array.isArray(t.history)
      ? t.history.filter(
          (h): h is { at: string; price: number } =>
            typeof h === "object" &&
            h !== null &&
            typeof (h as { at?: unknown }).at === "string" &&
            typeof (h as { price?: unknown }).price === "number"
        )
      : [];
    out.push({
      id: t.id,
      product: t.product,
      store: typeof t.store === "string" && t.store ? t.store : "Loja demo",
      targetPrice:
        typeof t.targetPrice === "number" && Number.isFinite(t.targetPrice)
          ? t.targetPrice
          : t.currentPrice,
      currentPrice: t.currentPrice,
      history,
      active: t.active !== false,
      createdAt: typeof t.createdAt === "string" ? t.createdAt : new Date().toISOString(),
      ...(typeof t.cloudId === "string" ? { cloudId: t.cloudId } : {}),
    });
  }
  return out;
}

export function loadTracks(): PriceTrack[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = seed();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return sanitize(JSON.parse(raw)) ?? seed();
  } catch {
    return seed();
  }
}

export function saveTracks(tracks: PriceTrack[]): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tracks));
}

export function createTrack(input: {
  product: string;
  store: string;
  targetPrice: number;
  currentPrice: number;
}): PriceTrack {
  const now = new Date().toISOString();
  return {
    id: uid(),
    product: input.product.trim(),
    store: input.store.trim() || "Loja demo",
    targetPrice: input.targetPrice,
    currentPrice: input.currentPrice,
    history: [{ at: now, price: input.currentPrice }],
    active: true,
    createdAt: now,
  };
}

/** Anexa novo preço ao histórico (mantém últimos 30 pontos). */
export function appendPrice(track: PriceTrack, price: number): PriceTrack {
  const history = [...track.history, { at: new Date().toISOString(), price }].slice(-30);
  return { ...track, currentPrice: price, history };
}

/** Trilhas ativas cujo preço atual atingiu o alvo. */
export function tracksOnTarget(tracks: PriceTrack[]): PriceTrack[] {
  return tracks.filter((t) => t.active && t.currentPrice <= t.targetPrice);
}

/** Economia total somada nas trilhas ativas (ref = maior preço do histórico ou mock). */
export function totalSavings(tracks: PriceTrack[]): number {
  return tracks
    .filter((t) => t.active)
    .reduce((sum, t) => {
      const ref = Math.max(t.targetPrice, ...t.history.map((h) => h.price), priceAlertMockPrice());
      return sum + Math.max(0, ref - t.currentPrice);
    }, 0);
}

function priceAlertMockPrice(): number {
  return parseBRL(priceAlertMock.oldPrice) ?? 0;
}
