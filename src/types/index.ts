// ─── Widget Types ────────────────────────────────────────────────────────────

export type WidgetType =
  | "poll"
  | "clock"
  | "weather"
  | "rss"
  | "crypto"
  | "note"
  | "stats"
  | "calendar"
  | "pomodoro"
  | "stocks";

export type WidgetSize = "small" | "medium" | "large";

// "grid"     → petite carte dans la grille (toujours interactive)
// "expanded" → widget déposé dans le slot central (prend tout l'espace)
export type DisplayMode = "grid" | "expanded";

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  position: number;
  size: WidgetSize;
  focusable: boolean;
  adminOnly?: boolean;
  data: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// ─── Poll Widget ─────────────────────────────────────────────────────────────

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface PollData {
  question: string;
  options: PollOption[];
  userVote?: string;
  closedAt?: string;
  history?: PollQuestion[];
}

export interface PollQuestion {
  id: string;
  question: string;
  options: PollOption[];
  closedAt: string;
}

// ─── RSS Widget ──────────────────────────────────────────────────────────────

export interface RssItem {
  id: string;
  title: string;
  description: string;
  link: string;
  pubDate: string;
  source: string;
}

export interface RssData {
  feedUrl: string;
  feedName: string;
  items: RssItem[];
  lastFetched?: string;
}

// ─── Crypto Widget ───────────────────────────────────────────────────────────

export interface CryptoAsset {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  sparkline: number[];
}

export interface CryptoData {
  assets: CryptoAsset[];
  currency: string;
}

// ─── Stats Widget ────────────────────────────────────────────────────────────

export interface StatMetric {
  id: string;
  label: string;
  value: number;
  unit: string;
  trend: "up" | "down" | "stable";
  trendValue: number;
  history: number[];
}

export interface StatsData {
  metrics: StatMetric[];
}

// ─── Note Widget ─────────────────────────────────────────────────────────────

export interface NoteData {
  content: string;
  color: string;
  pinned: boolean;
}

// ─── Calendar Widget ─────────────────────────────────────────────────────────

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  color: string;
  description?: string;
}

export interface CalendarData {
  events: CalendarEvent[];
}

// ─── Weather Widget ──────────────────────────────────────────────────────────

export interface WeatherDay {
  date: string;        // "2025-05-21"
  label: string;       // "Lun", "Mar"...
  icon: string;        // emoji météo
  tempMin: number;
  tempMax: number;
  condition: string;
}

export interface WeatherData {
  city: string;
  country: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  condition: string;   // "Ensoleillé", "Nuageux"...
  icon: string;        // emoji
  forecast: WeatherDay[];
}

// ─── Pomodoro Widget ─────────────────────────────────────────────────────────

export type PomodoroPhase = "work" | "shortBreak" | "longBreak";

export interface PomodoroData {
  workDuration: number;       // minutes
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsUntilLongBreak: number;
  label: string;              // tâche en cours (ex: "Implémenter OrbitDash")
}

// ─── Stocks Widget ───────────────────────────────────────────────────────────

export interface StockAsset {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;        // variation absolue sur la journée
  changePercent: number;
  sparkline: number[];
  currency: string;
}

export interface StocksData {
  assets: StockAsset[];
  market: string;        // ex: "NYSE", "NASDAQ", "EURONEXT"
}

// ─── User & Auth ─────────────────────────────────────────────────────────────

export type UserRole = "admin" | "user";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

// ─── Theme ───────────────────────────────────────────────────────────────────

export interface Theme {
  mode: "dark";
  density: "compact";
  accent: string;
}

// ─── App State ───────────────────────────────────────────────────────────────

export interface AppState {
  widgets: WidgetConfig[];
  expandedWidgetId: string | null;
  currentView: "dashboard" | "admin";
  isAdminLayoutMode: boolean;
}