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
