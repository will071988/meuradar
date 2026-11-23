import type { MatchTrackerData, TrackerEvent, TrackerPlayer, TrackerTeam } from "@/types";

/** Posição tática por `formationPlace` da ESPN (x, y em % do campo). Casa ataca à direita. */
const FORMATION: Record<number, [number, number]> = {
  1: [7, 50],   // Goleiro
  2: [38, 12],  // Lateral direito
  3: [38, 88],  // Lateral esquerdo
  4: [42, 50],  // Volante
  5: [25, 34],  // Zagueiro direito
  6: [25, 66],  // Zagueiro esquerdo
  7: [62, 16],  // Meio direito
  8: [58, 50],  // Meio central
  9: [82, 50],  // Atacante
  10: [66, 34], // Meio atacante
  11: [62, 84], // Meio esquerdo
};

export function formationCoordinates(place: number, homeAway: "home" | "away") {
  const [rawX, y] = FORMATION[place] ?? [50, 50];
  return { x: homeAway === "home" ? rawX : 100 - rawX, y };
}

interface EspnAthlete {
  id?: string;
  shortName?: string;
  displayName?: string;
}

interface EspnRosterPlayer {
  jersey?: string;
  starter?: boolean;
  formationPlace?: string;
  position?: string;
  athlete?: EspnAthlete;
}

interface EspnRoster {
  homeAway?: string;
  team?: { id?: string; displayName?: string; abbreviation?: string; color?: string };
  roster?: EspnRosterPlayer[];
}

interface EspnKeyEvent {
  id?: string;
  text?: string;
  type?: { text?: string };
  period?: { number?: number };
  clock?: { displayValue?: string };
  team?: { id?: string };
  fieldPositionX?: number;
  fieldPositionY?: number;
  fieldPosition2X?: number;
  fieldPosition2Y?: number;
}

interface EspnCompetitor {
  homeAway?: string;
  score?: string;
}

interface EspnSummary {
  rosters?: EspnRoster[];
  keyEvents?: EspnKeyEvent[];
  header?: {
    competitions?: Array<{
      status?: { type?: { state?: string; shortDetail?: string; detail?: string } };
      competitors?: EspnCompetitor[];
    }>;
  };
}

function toPlayers(roster: EspnRoster, homeAway: "home" | "away"): TrackerPlayer[] {
  const teamId = roster.team?.id ?? "";
  return (roster.roster ?? [])
    .filter((p) => p.starter && Number(p.formationPlace) > 0)
    .sort((a, b) => Number(a.formationPlace) - Number(b.formationPlace))
    .slice(0, 11)
    .map((p) => ({
      id: p.athlete?.id ?? `${teamId}-${p.jersey ?? p.formationPlace}`,
      teamId,
      homeAway,
      jersey: p.jersey ?? "-",
      name: p.athlete?.shortName ?? p.athlete?.displayName ?? "Jogador",
      position: p.position ?? "",
      formationPlace: Number(p.formationPlace),
    }));
}

function toTeam(roster: EspnRoster | undefined, homeAway: "home" | "away", score: number): TrackerTeam {
  return {
    id: roster?.team?.id ?? "",
    name: roster?.team?.displayName ?? (homeAway === "home" ? "Casa" : "Visitante"),
    abbreviation: roster?.team?.abbreviation ?? "—",
    color: roster?.team?.color ? `#${roster.team.color}` : "#0B2D5B",
    score,
    players: roster ? toPlayers(roster, homeAway) : [],
  };
}

function minuteOf(event: EspnKeyEvent): number {
  // A ESPN já devolve o minuto acumulado da partida em `displayValue` (ex.: "62'").
  const match = /(\d+)/.exec(event.clock?.displayValue ?? "");
  return match ? Number(match[1]) : 0;
}

function toEvent(event: EspnKeyEvent): TrackerEvent {
  const result: TrackerEvent = {
    id: event.id ?? `${event.type?.text}-${event.clock?.displayValue}`,
    type: event.type?.text ?? "Evento",
    text: event.text || event.type?.text || "Evento",
    minute: minuteOf(event),
    period: event.period?.number ?? 1,
    teamId: event.team?.id ?? "",
  };
  if (typeof event.fieldPositionX === "number") result.x = event.fieldPositionX;
  if (typeof event.fieldPositionY === "number") result.y = event.fieldPositionY;
  if (typeof event.fieldPosition2X === "number") result.x2 = event.fieldPosition2X;
  if (typeof event.fieldPosition2Y === "number") result.y2 = event.fieldPosition2Y;
  return result;
}

/** Normaliza o payload de `GET /summary` da ESPN para o contrato do rastreador. */
export function normalizeSummary(json: unknown, eventId: string): MatchTrackerData {
  const data = (json ?? {}) as EspnSummary;
  const competition = data.header?.competitions?.[0];
  const status = competition?.status?.type;
  const scoreFor = (homeAway: string) => {
    const found = competition?.competitors?.find((c) => c.homeAway === homeAway);
    const value = Number(found?.score);
    return Number.isFinite(value) ? value : 0;
  };

  const homeRoster = data.rosters?.find((r) => r.homeAway === "home");
  const awayRoster = data.rosters?.find((r) => r.homeAway === "away");

  return {
    eventId,
    home: toTeam(homeRoster, "home", scoreFor("home")),
    away: toTeam(awayRoster, "away", scoreFor("away")),
    status: status?.state ?? "pre",
    clock: status?.shortDetail ?? status?.detail ?? "—",
    events: (data.keyEvents ?? []).map(toEvent),
  };
}
