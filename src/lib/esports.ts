import type { LeagueStandings, SportMatch, Standing } from "@/types";

export interface LeagueCatalog {
  id: string;
  name: string;
  group: "Brasil" | "Estaduais" | "Internacionais";
  standings: boolean;
  /** Temporada alternativa quando a atual ainda não tem tabela publicada. */
  fallbackSeason?: number;
}

/** Catálogo de competições com dados públicos na ESPN (sem chave). */
export const LEAGUES: LeagueCatalog[] = [
  { id: "bra.1", name: "Brasileirão Série A", group: "Brasil", standings: true },
  { id: "bra.2", name: "Brasileirão Série B", group: "Brasil", standings: true },
  { id: "bra.3", name: "Brasileirão Série C", group: "Brasil", standings: true },
  { id: "bra.copa_do_brazil", name: "Copa do Brasil", group: "Brasil", standings: false },
  { id: "bra.supercopa_do_brazil", name: "Supercopa Rei", group: "Brasil", standings: false },
  { id: "bra.camp.paulista", name: "Campeonato Paulista", group: "Estaduais", standings: true, fallbackSeason: 2025 },
  { id: "bra.camp.carioca", name: "Campeonato Carioca", group: "Estaduais", standings: true, fallbackSeason: 2025 },
  { id: "bra.camp.gaucho", name: "Campeonato Gaúcho", group: "Estaduais", standings: true, fallbackSeason: 2025 },
  { id: "bra.camp.mineiro", name: "Campeonato Mineiro", group: "Estaduais", standings: true, fallbackSeason: 2025 },
  { id: "conmebol.libertadores", name: "Libertadores", group: "Internacionais", standings: true },
  { id: "conmebol.sudamericana", name: "Sul-Americana", group: "Internacionais", standings: true, fallbackSeason: 2025 },
  { id: "conmebol.recopa", name: "Recopa Sul-Americana", group: "Internacionais", standings: false },
  { id: "uefa.champions", name: "Champions League", group: "Internacionais", standings: true },
  { id: "uefa.europa", name: "Europa League", group: "Internacionais", standings: true },
  { id: "fifa.world", name: "Copa do Mundo", group: "Internacionais", standings: true, fallbackSeason: 2022 },
];

const brDate = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Sao_Paulo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const brTime = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  hour: "2-digit",
  minute: "2-digit",
});

export function brasiliaDateKey(date: Date): string {
  return brDate.format(date);
}

export function brasiliaTime(iso: string | undefined): string | undefined {
  if (!iso) return undefined;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return undefined;
  return brTime.format(date);
}

export function kickoffLabel(iso: string | undefined): string | undefined {
  if (!iso) return undefined;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return undefined;
  const [year, month, day] = brasiliaDateKey(date).split("-");
  return `${day}/${month}, ${brTime.format(date)} · ${year}`;
}

export function dayOf(iso: string | undefined): "hoje" | "amanha" | undefined {
  if (!iso) return undefined;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return undefined;
  const key = (d: Date) => Date.parse(`${brasiliaDateKey(d)}T00:00:00Z`);
  const diff = Math.round((key(date) - key(new Date())) / 86400000);
  if (diff === 0) return "hoje";
  if (diff === 1) return "amanha";
  return undefined;
}

interface EspnCompetitor {
  homeAway?: string;
  score?: string;
  team?: { displayName?: string; shortDisplayName?: string };
}

interface EspnEvent {
  id?: string;
  date?: string;
  shortName?: string;
  competitions?: Array<{
    competitors?: EspnCompetitor[];
    status?: { type?: { state?: string; shortDetail?: string; detail?: string } };
  }>;
}

interface EspnScoreboard {
  events?: EspnEvent[];
}

function scoreOf(competitors: EspnCompetitor[] | undefined, homeAway: string): number | undefined {
  const found = competitors?.find((c) => c.homeAway === homeAway);
  if (!found?.score) return undefined;
  const value = Number(found.score);
  return Number.isFinite(value) ? value : undefined;
}

function nameOf(competitors: EspnCompetitor[] | undefined, homeAway: string): string {
  const team = competitors?.find((c) => c.homeAway === homeAway)?.team;
  return team?.shortDisplayName || team?.displayName || "—";
}

/** Normaliza o scoreboard da ESPN para partidas com status, placar e horário. */
export function normalizeScoreboard(json: unknown, league: LeagueCatalog): SportMatch[] {
  const events = (json as EspnScoreboard | null)?.events ?? [];
  return events.flatMap((event): SportMatch[] => {
    if (!event.id) return [];
    const comp = event.competitions?.[0];
    const state = comp?.status?.type?.state;
    const status: SportMatch["status"] = state === "in" ? "live" : state === "post" ? "post" : "pre";
    const home = nameOf(comp?.competitors, "home");
    const away = nameOf(comp?.competitors, "away");
    const homeScore = scoreOf(comp?.competitors, "home");
    const awayScore = scoreOf(comp?.competitors, "away");
    const startTime = brasiliaTime(event.date);
    const detail = comp?.status?.type?.shortDetail || comp?.status?.type?.detail;

    return [{
      id: event.id,
      competition: league.name,
      leagueId: league.id,
      home,
      away,
      status,
      homeScore: status === "post" || status === "live" ? homeScore : undefined,
      awayScore: status === "post" || status === "live" ? awayScore : undefined,
      startsAt: event.date,
      startTime,
      time: status === "pre" ? (startTime ?? "—") : status === "post" ? "Encerrado" : (detail ?? "AO VIVO"),
      day: dayOf(event.date),
      live: status === "live",
    }];
  });
}

interface EspnStandingEntry {
  team?: { displayName?: string };
  stats?: Array<{ name?: string; value?: number }>;
}

interface EspnStandings {
  children?: Array<{ name?: string; standings?: { entries?: EspnStandingEntry[] } }>;
}

function stat(entry: EspnStandingEntry, name: string): number {
  return entry.stats?.find((s) => s.name === name)?.value ?? 0;
}

/** Normaliza todas as tabelas/grupos de uma competição. */
export function normalizeStandings(json: unknown, league: LeagueCatalog): LeagueStandings {
  const children = (json as EspnStandings | null)?.children ?? [];
  const groups = children
    .map((child, index) => {
      const entries: Standing[] = (child.standings?.entries ?? [])
        .map((entry) => ({
          pos: stat(entry, "rank"),
          team: entry.team?.displayName ?? "",
          pts: stat(entry, "points"),
          games: stat(entry, "gamesPlayed"),
        }))
        .filter((entry) => entry.team)
        .sort((a, b) => a.pos - b.pos);
      return { name: child.name || `Grupo ${index + 1}`, entries };
    })
    .filter((group) => group.entries.length > 0);

  return { leagueId: league.id, name: league.name, groups };
}
