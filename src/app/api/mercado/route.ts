import { NextResponse } from "next/server";
import type { ApiResponse, MarketItem } from "@/types";
import { marketMock } from "@/data/mock";
import { fetchWithTimeout, getCache, setCache } from "@/lib/cache";
import { formatBRL, formatPct } from "@/lib/format";

export const dynamic = "force-dynamic";
export const preferredRegion = "gru1";

const TTL_MS = 5 * 60 * 1000;
const KEY = "mercado:v1";
const PREV_KEY = "mercado:prev";

interface AwesomeQuote {
  bid?: string;
  pctChange?: string;
}

interface AwesomeResponse {
  USDBRL?: AwesomeQuote;
  EURBRL?: AwesomeQuote;
  BTCBRL?: AwesomeQuote;
}

interface FrankfurterResponse {
  rates?: { USD?: number; EUR?: number };
}

interface CoinGeckoResponse {
  bitcoin?: { brl?: number };
}

interface PrevQuotes {
  usd: number;
  eur: number;
  btc: number;
}

function toItem(
  id: string,
  name: string,
  quote: AwesomeQuote | undefined,
  digits: number,
  fallback: MarketItem
): MarketItem {
  const bid = Number(quote?.bid ?? NaN);
  const pct = Number(quote?.pctChange ?? NaN);
  if (!Number.isFinite(bid)) return fallback;
  const variation = Number.isFinite(pct) ? formatPct(pct) : fallback.variation;
  return {
    id,
    name,
    value: formatBRL(bid, digits),
    variation,
    trend: variation.trim().startsWith("-") ? "down" : "up",
  };
}

function deltaItem(
  id: string,
  name: string,
  bid: number,
  prev: number | undefined,
  digits: number,
  fallback: MarketItem
): MarketItem {
  if (!Number.isFinite(bid) || bid <= 0) return fallback;
  const pct = prev !== undefined && prev > 0 ? ((bid - prev) / prev) * 100 : 0;
  const variation = formatPct(pct);
  return {
    id,
    name,
    value: formatBRL(bid, digits),
    variation,
    trend: variation.trim().startsWith("-") ? "down" : "up",
  };
}

async function fromAwesome(): Promise<MarketItem[] | null> {
  const res = await fetchWithTimeout(
    "https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL,BTC-BRL",
    9000
  );
  if (!res.ok) return null;
  const json = (await res.json()) as AwesomeResponse;
  if (!json.USDBRL?.bid) return null;

  const byId = new Map(marketMock.map((m) => [m.id, m]));
  const usd = Number(json.USDBRL.bid);
  const eur = Number(json.EURBRL?.bid ?? NaN);
  const btc = Number(json.BTCBRL?.bid ?? NaN);
  if (Number.isFinite(usd)) setCache<PrevQuotes>(PREV_KEY, { usd, eur, btc }, 24 * 60 * 60 * 1000);

  return [
    toItem("usd", "Dólar", json.USDBRL, 2, byId.get("usd") as MarketItem),
    toItem("eur", "Euro", json.EURBRL, 2, byId.get("eur") as MarketItem),
    toItem("btc", "Bitcoin", json.BTCBRL, 0, byId.get("btc") as MarketItem),
    byId.get("ibov") as MarketItem,
  ];
}

async function fromFallback(): Promise<MarketItem[] | null> {
  const [fx, cg] = await Promise.all([
    fetchWithTimeout("https://api.frankfurter.app/latest?from=BRL&to=USD,EUR", 9000)
      .then((r) => (r.ok ? (r.json() as Promise<FrankfurterResponse>) : null))
      .catch(() => null),
    fetchWithTimeout("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=brl", 9000)
      .then((r) => (r.ok ? (r.json() as Promise<CoinGeckoResponse>) : null))
      .catch(() => null),
  ]);
  const usdRate = fx?.rates?.USD;
  const eurRate = fx?.rates?.EUR;
  const btcBrl = cg?.bitcoin?.brl;
  if (!usdRate || !eurRate || !btcBrl) return null;

  const byId = new Map(marketMock.map((m) => [m.id, m]));
  const prev = getCache<PrevQuotes>(PREV_KEY);
  const usd = 1 / usdRate;
  const eur = 1 / eurRate;
  setCache<PrevQuotes>(PREV_KEY, { usd, eur, btc: btcBrl }, 24 * 60 * 60 * 1000);

  return [
    deltaItem("usd", "Dólar", usd, prev?.usd, 2, byId.get("usd") as MarketItem),
    deltaItem("eur", "Euro", eur, prev?.eur, 2, byId.get("eur") as MarketItem),
    deltaItem("btc", "Bitcoin", btcBrl, prev?.btc, 0, byId.get("btc") as MarketItem),
    byId.get("ibov") as MarketItem,
  ];
}

function demo(): NextResponse<ApiResponse<MarketItem[]>> {
  return NextResponse.json({
    source: "demo",
    updatedAt: new Date().toISOString(),
    data: marketMock,
  });
}

export async function GET(): Promise<NextResponse<ApiResponse<MarketItem[]>>> {
  const cached = getCache<ApiResponse<MarketItem[]>>(KEY);
  if (cached) return NextResponse.json(cached);

  try {
    const data = (await fromAwesome()) ?? (await fromFallback());
    if (!data) return demo();

    const payload: ApiResponse<MarketItem[]> = {
      source: "live",
      updatedAt: new Date().toISOString(),
      data,
    };
    setCache(KEY, payload, TTL_MS);
    return NextResponse.json(payload);
  } catch {
    return demo();
  }
}
