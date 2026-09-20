import { NextResponse } from "next/server";
import type { ApiResponse, MarketItem } from "@/types";
import { marketMock } from "@/data/mock";
import { fetchWithTimeout, getCache, setCache } from "@/lib/cache";
import { formatBRL, formatPct } from "@/lib/format";

export const dynamic = "force-dynamic";

const TTL_MS = 5 * 60 * 1000;
const KEY = "mercado:v1";

interface AwesomeQuote {
  bid?: string;
  pctChange?: string;
}

interface AwesomeResponse {
  USDBRL?: AwesomeQuote;
  EURBRL?: AwesomeQuote;
  BTCBRL?: AwesomeQuote;
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

export async function GET(): Promise<NextResponse<ApiResponse<MarketItem[]>>> {
  const cached = getCache<ApiResponse<MarketItem[]>>(KEY);
  if (cached) return NextResponse.json(cached);

  try {
    const res = await fetchWithTimeout(
      "https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL,BTC-BRL"
    );
    if (!res.ok) throw new Error("quotes");
    const json = (await res.json()) as AwesomeResponse;

    const byId = new Map(marketMock.map((m) => [m.id, m]));
    const data: MarketItem[] = [
      toItem("usd", "Dólar", json.USDBRL, 2, byId.get("usd") as MarketItem),
      toItem("eur", "Euro", json.EURBRL, 2, byId.get("eur") as MarketItem),
      toItem("btc", "Bitcoin", json.BTCBRL, 0, byId.get("btc") as MarketItem),
      byId.get("ibov") as MarketItem,
    ];

    const payload: ApiResponse<MarketItem[]> = {
      source: "live",
      updatedAt: new Date().toISOString(),
      data,
    };
    setCache(KEY, payload, TTL_MS);
    return NextResponse.json(payload);
  } catch {
    return NextResponse.json({
      source: "demo",
      updatedAt: new Date().toISOString(),
      data: marketMock,
    });
  }
}
