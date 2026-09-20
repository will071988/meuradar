import type { MarketItem, Radar, RadarAlert, RadarTypeOption, WeatherData } from "@/types";
import { jobsMock, marketMock, packageMock, priceAlertMock, sportsMock, weatherMock } from "@/data/mock";
import { loadPreferences } from "./preferences";

export const RADAR_TYPES: RadarTypeOption[] = [
  {
    id: "preco",
    label: "Preço",
    example: 'Notebook gamer abaixo de R$ 4.000',
    targetLabel: "Preço-alvo (R$)",
    targetPlaceholder: "4000",
  },
  {
    id: "clima",
    label: "Clima",
    example: "Alertas de chuva forte na minha região",
    targetLabel: "Temperatura de alerta (°C)",
    targetPlaceholder: "32",
  },
  {
    id: "mercado",
    label: "Mercado",
    example: "Bitcoin cair mais de 5%",
    targetLabel: "Ativo (USD, EUR, BTC)",
    targetPlaceholder: "BTC",
  },
  {
    id: "concurso",
    label: "Concurso",
    example: "Concursos administrativos no Rio de Janeiro",
    targetLabel: "Palavra-chave (opcional)",
    targetPlaceholder: "Banco do Brasil",
  },
  {
    id: "vaga",
    label: "Vaga",
    example: "Novas vagas de suporte técnico remoto",
    targetLabel: "Palavra-chave (opcional)",
    targetPlaceholder: "Front-end",
  },
  {
    id: "esporte",
    label: "Esporte",
    example: "Avisar quando meu time jogar",
    targetLabel: "Time (opcional)",
    targetPlaceholder: "Flamengo",
  },
  {
    id: "encomenda",
    label: "Encomenda",
    example: "Avisar quando sair para entrega",
    targetLabel: "Etapa (opcional)",
    targetPlaceholder: "Saiu para entrega",
  },
  {
    id: "custom",
    label: "Personalizado",
    example: "Passagem Rio → Lisboa abaixo de R$ 2.500",
    targetLabel: "Detalhe (opcional)",
    targetPlaceholder: "R$ 2.500",
  },
];

const STORAGE_KEY = "meuradar-radars-v1";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function uid(): string {
  return `r-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function defaultRadars(): Radar[] {
  const now = new Date().toISOString();
  const city = isBrowser() ? loadPreferences().city : weatherMock.city;
  return [
    {
      id: uid(),
      title: "Notebook gamer abaixo de R$ 4.000",
      type: "preco",
      target: "4000",
      city,
      active: true,
      createdAt: now,
    },
    {
      id: uid(),
      title: "Alerta de calor forte na minha região",
      type: "clima",
      target: "32",
      city,
      active: true,
      createdAt: now,
    },
    {
      id: uid(),
      title: "Bitcoin cair mais de 5%",
      type: "mercado",
      target: "BTC",
      city,
      active: true,
      createdAt: now,
    },
  ];
}

function sanitize(list: unknown): Radar[] | null {
  if (!Array.isArray(list)) return null;
  const validIds = new Set(RADAR_TYPES.map((t) => t.id));
  const out: Radar[] = [];
  for (const item of list) {
    if (typeof item !== "object" || item === null) continue;
    const r = item as Partial<Radar>;
    if (typeof r.id !== "string" || typeof r.title !== "string" || !r.title.trim()) continue;
    if (typeof r.type !== "string" || !validIds.has(r.type as Radar["type"])) continue;
    out.push({
      id: r.id,
      title: r.title,
      type: r.type as Radar["type"],
      target: typeof r.target === "string" ? r.target : "",
      city: typeof r.city === "string" && r.city ? r.city : weatherMock.city,
      active: r.active !== false,
      createdAt: typeof r.createdAt === "string" ? r.createdAt : new Date().toISOString(),
    });
  }
  return out;
}

export function loadRadars(): Radar[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = defaultRadars();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = sanitize(JSON.parse(raw));
    return parsed ?? defaultRadars();
  } catch {
    return defaultRadars();
  }
}

export function saveRadars(radars: Radar[]): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(radars));
}

export function createRadar(input: { title: string; type: Radar["type"]; target: string; city: string }): Radar {
  return {
    id: uid(),
    title: input.title.trim(),
    type: input.type,
    target: input.target.trim(),
    city: input.city.trim() || weatherMock.city,
    active: true,
    createdAt: new Date().toISOString(),
  };
}

function parseNumber(text: string): number | null {
  const cleaned = text.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

export interface EvalContext {
  weather: WeatherData | null;
  market: MarketItem[] | null;
}

function marketById(market: MarketItem[] | null, id: string): MarketItem | undefined {
  const list = market ?? marketMock;
  return list.find((m) => m.id === id);
}

/** Motor de avaliação: cruza cada radar ativo com clima/mercado/mocks. Puro e testável. */
export function evaluateRadars(radars: Radar[], ctx: EvalContext): RadarAlert[] {
  const alerts: RadarAlert[] = [];
  const weather = ctx.weather ?? weatherMock;
  const market = ctx.market ?? marketMock;

  for (const radar of radars) {
    if (!radar.active) continue;
    const title = radar.title;

    if (radar.type === "preco") {
      const alvo = parseNumber(radar.target || radar.title);
      // Referência: monitor mockado a R$ 1.899
      const atual = 1899;
      if (alvo !== null && atual <= alvo) {
        alerts.push({
          radarId: radar.id,
          title,
          message: `${priceAlertMock.product} por ${priceAlertMock.currentPrice} — dentro do alvo de R$ ${alvo.toLocaleString("pt-BR")}.`,
        });
      } else if (alvo === null) {
        alerts.push({
          radarId: radar.id,
          title,
          message: `${priceAlertMock.product} caiu 15%: ${priceAlertMock.oldPrice} → ${priceAlertMock.currentPrice}.`,
        });
      }
    } else if (radar.type === "clima") {
      const limite = parseNumber(radar.target) ?? 32;
      const chovendo = /chuva|chovendo|tempestade/i.test(weather.condition);
      if (weather.temperature >= limite) {
        alerts.push({
          radarId: radar.id,
          title,
          message: `${weather.city}: ${weather.temperature}°C agora (limite ${limite}°C). ${weather.alertDescription}`,
        });
      } else if (/chuva/i.test(title) && (chovendo || /chuva/i.test(weather.alertTitle))) {
        alerts.push({
          radarId: radar.id,
          title,
          message: `${weather.city}: ${weather.condition}. ${weather.alertDescription}`,
        });
      }
    } else if (radar.type === "mercado") {
      const key = radar.target.trim().toUpperCase();
      const pick = key.includes("BTC")
        ? marketById(market, "btc")
        : key.includes("EUR") || key.includes("EURO")
          ? marketById(market, "eur")
          : key.includes("IBOV") || key.includes("BOLSA")
            ? marketById(market, "ibov")
            : marketById(market, "usd");
      if (pick && pick.trend === "down") {
        alerts.push({
          radarId: radar.id,
          title,
          message: `${pick.name} em queda: ${pick.value} (${pick.variation}).`,
        });
      } else if (pick && /dólar|dolar/i.test(title)) {
        alerts.push({
          radarId: radar.id,
          title,
          message: `${pick.name} agora ${pick.value} (${pick.variation}).`,
        });
      }
    } else if (radar.type === "concurso" || radar.type === "vaga") {
      const kw = (radar.target || radar.title).toLowerCase();
      const hits = jobsMock.filter(
        (j) =>
          !kw ||
          j.title.toLowerCase().includes(kw) ||
          j.detail.toLowerCase().includes(kw) ||
          (j.extra ?? "").toLowerCase().includes(kw) ||
          kw.split(/\s+/).some((w) => w.length > 3 && j.title.toLowerCase().includes(w))
      );
      const show = (hits.length > 0 ? hits : jobsMock).slice(0, 2);
      alerts.push({
        radarId: radar.id,
        title,
        message: show.map((j) => `${j.title} (${j.detail})`).join(" • "),
      });
    } else if (radar.type === "esporte") {
      const team = (radar.target || "").toLowerCase();
      const match = sportsMock.find(
        (m) => !team || m.home.toLowerCase().includes(team) || m.away.toLowerCase().includes(team)
      );
      const game = match ?? sportsMock[0];
      alerts.push({
        radarId: radar.id,
        title,
        message: `${game?.competition}: ${game?.home} x ${game?.away} às ${game?.time}.`,
      });
    } else if (radar.type === "encomenda") {
      alerts.push({
        radarId: radar.id,
        title,
        message: `${packageMock.status} — ${packageMock.eta.toLowerCase()}.`,
      });
    } else {
      alerts.push({
        radarId: radar.id,
        title,
        message: "Monitoramento ativo. Avisaremos quando a condição for atendida.",
      });
    }
  }

  return alerts;
}
