import type {
  CalendarEvent,
  JobItem,
  MarketItem,
  NewsItem,
  PackageData,
  PriceAlert,
  RadarFeedItem,
  SportMatch,
  WeatherData,
} from "@/types";

export const weatherMock: WeatherData = {
  city: "Rio de Janeiro, RJ",
  temperature: 28,
  condition: "Ensolarado",
  feelsLike: 31,
  forecast: [
    { label: "Hoje", min: 21, max: 28 },
    { label: "Qua", min: 21, max: 27 },
    { label: "Qui", min: 22, max: 29 },
    { label: "Sex", min: 22, max: 30 },
  ],
  alertTitle: "Alerta de calor intenso",
  alertDescription: "Temperaturas acima da média nos próximos dias.",
};

export const marketMock: MarketItem[] = [
  { id: "usd", name: "Dólar", value: "R$ 5,02", variation: "+0,38%", trend: "up" },
  { id: "eur", name: "Euro", value: "R$ 5,45", variation: "+0,21%", trend: "up" },
  { id: "btc", name: "Bitcoin", value: "R$ 312.450", variation: "-1,12%", trend: "down" },
  { id: "ibov", name: "Ibovespa", value: "127.846 pts", variation: "+0,67%", trend: "up" },
];

export const packageMock: PackageData = {
  status: "Encomenda em trânsito",
  eta: "Chega amanhã",
  currentStepIndex: 1,
  steps: [
    { id: "posted", label: "Postagem" },
    { id: "transit", label: "Em transporte" },
    { id: "out", label: "Saiu para entrega" },
    { id: "done", label: "Entregue" },
  ],
};

export const priceAlertMock: PriceAlert = {
  product: 'Monitor LG UltraGear 27"',
  currentPrice: "R$ 1.899,00",
  oldPrice: "R$ 2.249,00",
  discount: "-15%",
};

export const jobsMock: JobItem[] = [
  {
    id: "job-1",
    title: "Desenvolvedor(a) Front-end",
    detail: "Remoto",
    extra: "R$ 6.000 – 10.000",
    badge: "Nova",
    badgeTone: "new",
  },
  {
    id: "job-2",
    title: "Concurso Banco do Brasil",
    detail: "Nível Médio",
    extra: "4.480 vagas",
    badge: "Em alta",
    badgeTone: "hot",
  },
  {
    id: "job-3",
    title: "Analista de Dados",
    detail: "São Paulo, SP",
    extra: "Híbrido",
    badge: "Nova",
    badgeTone: "new",
  },
];

export const newsMock: NewsItem[] = [
  {
    id: "news-1",
    category: "Tecnologia",
    title: "Brasil avança no uso de IA para prevenção de desastres naturais",
    description: "Iniciativa promete tornar cidades mais seguras e resilientes.",
    time: "Há 2 horas",
  },
  {
    id: "news-2",
    category: "Economia",
    title: "Mercado acompanha novos indicadores econômicos no Brasil",
    description: "Analistas projetam estabilidade e atenção ao cenário externo.",
    time: "Há 4 horas",
  },
  {
    id: "news-3",
    category: "Esportes",
    title: "Rodada decisiva movimenta torcedores em todo o país",
    description: "Jogos de hoje podem definir os rumos das competições.",
    time: "Há 6 horas",
  },
];

export const sportsMock: SportMatch[] = [
  { id: "m1", competition: "Libertadores", home: "Flamengo", away: "Bolívar", time: "21:30" },
  { id: "m2", competition: "Copa do Brasil", home: "Palmeiras", away: "Botafogo", time: "20:00" },
  { id: "m3", competition: "Brasileirão", home: "São Paulo", away: "Grêmio", time: "18:30" },
];

export const calendarMock: CalendarEvent[] = [
  { id: "e1", time: "09:00", title: "Reunião de alinhamento", dateBadge: "21 MAI" },
  { id: "e2", time: "14:00", title: "Projeto MeuRadar", dateBadge: "21 MAI" },
  { id: "e3", time: "17:00", title: "Academia", dateBadge: "21 MAI" },
];

export const radarTodayMock: RadarFeedItem[] = [
  { id: "r1", text: "Chuva forte prevista para sua região", icon: "cloud-rain" },
  { id: "r2", text: "Produto monitorado caiu 15%", icon: "tag" },
  { id: "r3", text: "Novo concurso disponível", icon: "bell" },
  { id: "r4", text: "Seu time joga hoje", icon: "trophy" },
  { id: "r5", text: "Sua encomenda está em trânsito", icon: "package" },
];
