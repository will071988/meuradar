import { NextResponse } from "next/server";
import type { ApiResponse, WeatherData } from "@/types";
import { weatherMock } from "@/data/mock";
import { fetchWithTimeout, getCache, setCache } from "@/lib/cache";

export const dynamic = "force-dynamic";

const TTL_MS = 10 * 60 * 1000;

interface GeocodingResult {
  latitude: number;
  longitude: number;
  name: string;
}

interface ForecastResponse {
  current?: {
    temperature_2m?: number;
    apparent_temperature?: number;
    weather_code?: number;
  };
  daily?: {
    time?: string[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
    weather_code?: number[];
  };
}

function describeCode(code: number): string {
  if (code === 0) return "Ensolarado";
  if (code <= 3) return "Parcialmente nublado";
  if (code <= 48) return "Nevoeiro";
  if (code <= 57) return "Chuvisco";
  if (code <= 67) return "Chuva";
  if (code <= 77) return "Chuva fraca";
  if (code <= 82) return "Pancadas de chuva";
  if (code <= 86) return "Chuva forte";
  return "Tempestade";
}

async function geocode(city: string): Promise<GeocodingResult | null> {
  const q = city.split(",")[0]?.trim() || city;
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    q
  )}&count=1&language=pt&format=json`;
  const res = await fetchWithTimeout(url);
  if (!res.ok) return null;
  const json = (await res.json()) as { results?: GeocodingResult[] };
  return json.results?.[0] ?? null;
}

export async function GET(request: Request): Promise<NextResponse<ApiResponse<WeatherData>>> {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city")?.trim() || weatherMock.city;
  const key = `clima:${city.toLowerCase()}`;
  const cached = getCache<ApiResponse<WeatherData>>(key);
  if (cached) return NextResponse.json(cached);

  try {
    const geo = await geocode(city);
    if (!geo) throw new Error("geo");

    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${geo.latitude}&longitude=${geo.longitude}` +
      `&current=temperature_2m,apparent_temperature,weather_code` +
      `&daily=temperature_2m_max,temperature_2m_min,weather_code` +
      `&timezone=auto&forecast_days=4`;
    const res = await fetchWithTimeout(url);
    if (!res.ok) throw new Error("forecast");
    const fc = (await res.json()) as ForecastResponse;

    const temp = Math.round(fc.current?.temperature_2m ?? weatherMock.temperature);
    const feels = Math.round(fc.current?.apparent_temperature ?? temp);
    const condition = describeCode(fc.current?.weather_code ?? 0);

    const days = fc.daily?.time ?? [];
    const maxs = fc.daily?.temperature_2m_max ?? [];
    const mins = fc.daily?.temperature_2m_min ?? [];
    const fmt = new Intl.DateTimeFormat("pt-BR", { weekday: "short" });
    const forecast = days.slice(0, 4).map((d, i) => ({
      label:
        i === 0
          ? "Hoje"
          : fmt.format(new Date(`${d}T12:00:00`)).replace(".", "").replace(/^\w/, (c) => c.toUpperCase()),
      min: Math.round(mins[i] ?? 0),
      max: Math.round(maxs[i] ?? 0),
    }));

    const maxHeat = Math.max(...maxs.slice(0, 4), temp);
    const rainy = [60, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(
      fc.current?.weather_code ?? -1
    );
    const payload: ApiResponse<WeatherData> = {
      source: "live",
      updatedAt: new Date().toISOString(),
      data: {
        city,
        temperature: temp,
        condition,
        feelsLike: feels,
        forecast: forecast.length === 4 ? forecast : weatherMock.forecast,
        alertTitle: maxHeat >= 32 ? "Alerta de calor intenso" : rainy ? "Alerta de chuva" : "Sem alertas severos",
        alertDescription:
          maxHeat >= 32
            ? "Temperaturas acima da média nos próximos dias."
            : rainy
              ? "Previsão de chuva para sua região. Leve guarda-chuva."
              : "Condições estáveis para as próximas horas.",
      },
    };
    setCache(key, payload, TTL_MS);
    return NextResponse.json(payload);
  } catch {
    const fallback: ApiResponse<WeatherData> = {
      source: "demo",
      updatedAt: new Date().toISOString(),
      data: { ...weatherMock, city },
    };
    return NextResponse.json(fallback);
  }
}
