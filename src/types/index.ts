export interface ForecastDay {
  label: string;
  min: number;
  max: number;
}

export interface WeatherData {
  city: string;
  temperature: number;
  condition: string;
  feelsLike: number;
  forecast: ForecastDay[];
  alertTitle: string;
  alertDescription: string;
}

export interface MarketItem {
  id: string;
  name: string;
  value: string;
  variation: string;
  trend: "up" | "down";
}

export interface PackageStep {
  id: string;
  label: string;
}

export interface PackageData {
  status: string;
  eta: string;
  currentStepIndex: number;
  steps: PackageStep[];
}

export interface PriceAlert {
  product: string;
  currentPrice: string;
  oldPrice: string;
  discount: string;
}

export interface JobItem {
  id: string;
  title: string;
  detail: string;
  extra?: string;
  badge: string;
  badgeTone: "new" | "hot";
}

export interface NewsItem {
  id: string;
  category: string;
  title: string;
  description: string;
  time: string;
}

export interface SportMatch {
  id: string;
  competition: string;
  home: string;
  away: string;
  time: string;
  /** Dia do jogo (módulo /esportes, Sprint 8). */
  day?: "hoje" | "amanha";
  live?: boolean;
  /** pre = a iniciar | live = em andamento | post = encerrado. */
  status: "pre" | "live" | "post";
  homeScore?: number;
  awayScore?: number;
  /** ISO do início e versão formatada em Brasília (ex.: "29/11, 16:00"). */
  startsAt?: string;
  startTime?: string;
  leagueId?: string;
}

/** Tabela de uma competição, com um grupo por `children` da ESPN. */
export interface LeagueStandings {
  leagueId: string;
  name: string;
  groups: Array<{ name: string; entries: Standing[] }>;
}

/** Aggregate returned by GET /api/esportes. */
export interface EsportsOverview {
  live: SportMatch[];
  upcoming: SportMatch[];
  finished: SportMatch[];
  standings: LeagueStandings[];
}

export interface Standing {
  pos: number;
  team: string;
  pts: number;
  games: number;
}

/** Aggregated live sports data returned by GET /api/esportes. */
export interface SportsData {
  matches: SportMatch[];
  standings: Standing[];
}

/* --- Rastreador tático (2D) --- */

export interface TrackerPlayer {
  id: string;
  teamId: string;
  homeAway: "home" | "away";
  jersey: string;
  name: string;
  position: string;
  formationPlace: number;
}

export interface TrackerEvent {
  id: string;
  type: string;
  text: string;
  minute: number;
  period: number;
  teamId: string;
  /** Coordenadas percentuais no campo (0–100), quando a ESPN as fornece. */
  x?: number;
  y?: number;
  x2?: number;
  y2?: number;
}

export interface TrackerTeam {
  id: string;
  name: string;
  abbreviation: string;
  color: string;
  score: number;
  players: TrackerPlayer[];
}

export interface MatchTrackerData {
  eventId: string;
  home: TrackerTeam;
  away: TrackerTeam;
  /** in | post | pre */
  status: string;
  clock: string;
  events: TrackerEvent[];
}

export interface CalendarEvent {
  id: string;
  time: string;
  title: string;
  dateBadge: string;
}

export interface RadarFeedItem {
  id: string;
  text: string;
  icon: "cloud-rain" | "tag" | "trophy" | "package" | "bell";
}

export interface AppUser {
  id: string;
  email: string;
  name: string;
}

export interface UserPreferences {
  interests: string[];
  city: string;
  team: string;
  notifyEmail: boolean;
  notifyPush: boolean;
}

export interface InterestOption {
  id: string;
  label: string;
}

export type DataSource = "live" | "demo";

export interface ApiResponse<T> {
  source: DataSource;
  updatedAt: string;
  data: T;
}

export type RadarType =
  | "preco"
  | "clima"
  | "mercado"
  | "concurso"
  | "vaga"
  | "esporte"
  | "encomenda"
  | "custom";

export interface Radar {
  id: string;
  title: string;
  type: RadarType;
  target: string;
  city: string;
  active: boolean;
  createdAt: string;
  /** Id da linha no Supabase quando sincronizado (Sprint 5). */
  cloudId?: string;
}

export interface RadarTypeOption {
  id: RadarType;
  label: string;
  example: string;
  targetLabel: string;
  targetPlaceholder: string;
}

export interface RadarAlert {
  radarId: string;
  title: string;
  message: string;
}

export interface PricePoint {
  at: string;
  price: number;
}

export interface PriceTrack {
  id: string;
  product: string;
  store: string;
  targetPrice: number;
  currentPrice: number;
  history: PricePoint[];
  active: boolean;
  createdAt: string;
  /** Id da linha no Supabase quando sincronizado (Sprint 6). */
  cloudId?: string;
}

export interface RemoteJob {
  id: string;
  title: string;
  company: string;
  location: string;
  remote: boolean;
  url: string;
  postedAt: string;
  salary?: string;
}
