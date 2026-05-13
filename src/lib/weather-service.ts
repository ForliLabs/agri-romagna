import type {
  WeatherCurrent,
  ForecastDay,
  RiverLevel,
  RiskAlert,
} from "@/lib/data";

// --- ARPAE & OpenMeteo API Integration Layer ---

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttlMs: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;
  if (Date.now() - entry.timestamp > entry.ttlMs) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache<T>(key: string, data: T, ttlMs: number): void {
  cache.set(key, { data, timestamp: Date.now(), ttlMs });
}

// OpenMeteo API (free, no key required)
const OPENMETEO_BASE = "https://api.open-meteo.com/v1";
const FORLI_LAT = 44.2227;
const FORLI_LON = 12.0408;

interface OpenMeteoCurrentResponse {
  current?: {
    temperature_2m?: number;
    relative_humidity_2m?: number;
    wind_speed_10m?: number;
    precipitation_probability?: number;
    surface_pressure?: number;
    weather_code?: number;
  };
}

interface OpenMeteoForecastResponse {
  daily?: {
    time?: string[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
    precipitation_probability_max?: number[];
    weather_code?: number[];
  };
}

const weatherCodeMap: Record<number, string> = {
  0: "Sereno",
  1: "Prevalentemente sereno",
  2: "Parzialmente nuvoloso",
  3: "Coperto",
  45: "Nebbia",
  48: "Nebbia con brina",
  51: "Pioviggine leggera",
  53: "Pioviggine moderata",
  55: "Pioviggine intensa",
  61: "Pioggia leggera",
  63: "Pioggia moderata",
  65: "Pioggia intensa",
  71: "Neve leggera",
  73: "Neve moderata",
  75: "Neve intensa",
  80: "Rovescio leggero",
  81: "Rovescio moderato",
  82: "Rovescio intenso",
  85: "Neve a tratti",
  95: "Temporale",
  96: "Temporale con grandine",
  99: "Temporale con grandine forte",
};

const dayNames = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];

function weatherCodeToCondition(code: number): string {
  return weatherCodeMap[code] ?? "Variabile";
}

function generateAgronomicNote(code: number, rainProb: number, minC: number): string {
  if (minC <= 0) return "Rischio gelo: proteggere colture sensibili e impianti irrigui.";
  if (minC <= 3) return "Temperature prossime allo zero: monitorare vigneti in fase fenologica.";
  if (code >= 95) return "Temporale previsto: sospendere trattamenti fogliari e raccolta manuale.";
  if (code >= 80) return "Rovesci possibili: verificare drenaggio appezzamenti bassi.";
  if (rainProb > 60) return "Ridurre finestre di raccolta manuale. Rischio ristagno nei fondovalle.";
  if (rainProb > 30) return "Possibili rovesci: pianificare trattamenti al mattino presto.";
  if (code <= 1) return "Ottimo per trattamenti fogliari e operazioni in campo.";
  return "Condizioni variabili: consultare aggiornamento prima di uscire in campo.";
}

export async function fetchCurrentWeather(): Promise<WeatherCurrent> {
  const cacheKey = "current-weather";
  const cached = getCached<WeatherCurrent>(cacheKey);
  if (cached) return cached;

  try {
    const url = `${OPENMETEO_BASE}/forecast?latitude=${FORLI_LAT}&longitude=${FORLI_LON}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation_probability,surface_pressure,weather_code&timezone=Europe%2FRome`;
    const res = await fetch(url, { next: { revalidate: 900 } }); // 15-min cache
    if (!res.ok) throw new Error(`OpenMeteo current weather HTTP ${res.status}`);
    const json = (await res.json()) as OpenMeteoCurrentResponse;
    const c = json.current;

    const result: WeatherCurrent = {
      location: "Forlì",
      observedAt: new Date().toISOString(),
      temperatureC: Math.round(c?.temperature_2m ?? 22),
      condition: weatherCodeToCondition(c?.weather_code ?? 2),
      humidity: c?.relative_humidity_2m ?? 64,
      windKmh: Math.round(c?.wind_speed_10m ?? 14),
      precipitationChance: c?.precipitation_probability ?? 25,
      pressureHpa: Math.round(c?.surface_pressure ?? 1017),
    };

    setCache(cacheKey, result, 15 * 60 * 1000);
    return result;
  } catch {
    // Fallback to seed-like data on error
    return {
      location: "Forlì",
      observedAt: new Date().toISOString(),
      temperatureC: 22,
      condition: "Parzialmente nuvoloso",
      humidity: 64,
      windKmh: 14,
      precipitationChance: 25,
      pressureHpa: 1017,
    };
  }
}

export async function fetchForecast(): Promise<ForecastDay[]> {
  const cacheKey = "forecast";
  const cached = getCached<ForecastDay[]>(cacheKey);
  if (cached) return cached;

  try {
    const url = `${OPENMETEO_BASE}/forecast?latitude=${FORLI_LAT}&longitude=${FORLI_LON}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code&timezone=Europe%2FRome&forecast_days=7`;
    const res = await fetch(url, { next: { revalidate: 3600 } }); // 1-hour cache
    if (!res.ok) throw new Error(`OpenMeteo forecast HTTP ${res.status}`);
    const json = (await res.json()) as OpenMeteoForecastResponse;
    const d = json.daily;

    if (!d?.time) throw new Error("No forecast data");

    const result: ForecastDay[] = d.time.map((dateStr, i) => {
      const date = new Date(dateStr);
      const code = d.weather_code?.[i] ?? 2;
      const rain = d.precipitation_probability_max?.[i] ?? 20;
      const minC = d.temperature_2m_min?.[i] ?? 14;
      const maxC = d.temperature_2m_max?.[i] ?? 25;

      return {
        day: dayNames[date.getDay()],
        date: dateStr,
        condition: weatherCodeToCondition(code),
        minC: Math.round(minC),
        maxC: Math.round(maxC),
        rainProbability: rain,
        note: generateAgronomicNote(code, rain, minC),
      };
    });

    setCache(cacheKey, result, 60 * 60 * 1000);
    return result;
  } catch {
    // Fallback
    return [];
  }
}

// ARPAE river monitoring — uses static data as ARPAE's real-time API
// requires institutional access. In production, integrate with
// https://allertameteo.regione.emilia-romagna.it/
export async function fetchRiverLevels(): Promise<RiverLevel[]> {
  const cacheKey = "river-levels";
  const cached = getCached<RiverLevel[]>(cacheKey);
  if (cached) return cached;

  // Simulated with realistic variations (production: ARPAE SOAP/REST API)
  const baseTime = Date.now();
  const variation = Math.sin(baseTime / 3600000) * 0.15;

  const result: RiverLevel[] = [
    {
      name: "Fiume Montone",
      levelMeters: +(1.82 + variation).toFixed(2),
      thresholdMeters: 2.4,
      trend: variation > 0.05 ? "in aumento" : variation < -0.05 ? "in diminuzione" : "stabile",
      status: 1.82 + variation > 2.2 ? "attenzione" : "normale",
    },
    {
      name: "Fiume Rabbi",
      levelMeters: +(1.36 + variation * 0.8).toFixed(2),
      thresholdMeters: 1.8,
      trend: variation > 0 ? "in aumento" : "stabile",
      status: 1.36 + variation * 0.8 > 1.65 ? "attenzione" : "normale",
    },
  ];

  setCache(cacheKey, result, 10 * 60 * 1000); // 10-min cache
  return result;
}

// Alert engine: generates alerts based on weather + river data.
// Accepts optional pre-fetched data to avoid duplicate API calls.
export async function generateWeatherAlerts(options?: {
  forecast?: ForecastDay[];
  rivers?: RiverLevel[];
}): Promise<RiskAlert[]> {
  const cacheKey = "weather-alerts";
  const cached = getCached<RiskAlert[]>(cacheKey);
  if (cached) return cached;

  const forecast = options?.forecast ?? await fetchForecast();
  const rivers = options?.rivers ?? await fetchRiverLevels();
  const alerts: RiskAlert[] = [];

  // Guard: skip forecast-derived alerts when forecast is empty
  if (forecast.length > 0) {
    // Frost alert
    const frostDays = forecast.filter((d) => d.minC <= 2);
    if (frostDays.length > 0) {
      alerts.push({
        id: "alert-gelo-auto",
        type: "gelo",
        severity: frostDays.some((d) => d.minC <= 0) ? "alta" : "media",
        title: `Rischio gelo su ${frostDays.length} giorn${frostDays.length === 1 ? "o" : "i"}`,
        detail: `Temperature minime fino a ${Math.min(...frostDays.map((d) => d.minC))}°C. Proteggere vigneti e frutteti sensibili.`,
        timeWindow: frostDays.map((d) => d.day).join(", "),
      });
    } else {
      alerts.push({
        id: "alert-gelo-ok",
        type: "gelo",
        severity: "bassa",
        title: "Rischio gelo assente nel breve periodo",
        detail: `Temperature minime sempre superiori a ${Math.min(...forecast.map((d) => d.minC))}°C nella prossima settimana.`,
        timeWindow: "Orizzonte 7 giorni",
      });
    }

    // Hail alert
    const hailDays = forecast.filter((d) =>
      d.condition.toLowerCase().includes("grandine") || d.condition.toLowerCase().includes("temporale")
    );
    if (hailDays.length > 0) {
      alerts.push({
        id: "alert-grandine-auto",
        type: "grandine",
        severity: hailDays.length > 2 ? "alta" : "media",
        title: "Possibile grandine in finestra temporalesca",
        detail: `Temporali previsti ${hailDays.map((d) => d.day).join(", ")} con rischio grandine sulle colline tra Bertinoro e Meldola.`,
        timeWindow: hailDays.map((d) => `${d.day} · pomeriggio`).join(", "),
      });
    }
  }

  // Flood alert from river levels
  for (const river of rivers) {
    if (river.status === "attenzione" || river.status === "preallarme") {
      alerts.push({
        id: `alert-piena-${river.name.toLowerCase().replace(/\s/g, "-")}`,
        type: "piena",
        severity: river.status === "preallarme" ? "alta" : "media",
        title: `${river.name}: livello in ${river.trend}`,
        detail: `Livello attuale ${river.levelMeters.toFixed(2)} m su soglia ${river.thresholdMeters.toFixed(2)} m. Monitorare appezzamenti di fondovalle.`,
        timeWindow: "Prossime 24 ore",
      });
    }
  }

  // If no flood alerts, add an OK entry
  if (!alerts.some((a) => a.type === "piena")) {
    alerts.push({
      id: "alert-piena-ok",
      type: "piena",
      severity: "bassa",
      title: "Livelli fluviali nella norma",
      detail: "Montone e Rabbi entro le soglie di attenzione. Nessun intervento richiesto.",
      timeWindow: "Prossime 48 ore",
    });
  }

  setCache(cacheKey, alerts, 30 * 60 * 1000);
  return alerts;
}

export interface WeatherNotification {
  id: string;
  type: "frost" | "hail" | "flood" | "wind";
  severity: "info" | "warning" | "critical";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

// Push notification engine — generates notifications from alerts
export function generateNotifications(alerts: RiskAlert[]): WeatherNotification[] {
  return alerts
    .filter((a) => a.severity !== "bassa")
    .map((a) => ({
      id: `notif-${a.id}`,
      type: a.type === "gelo" ? "frost" as const : a.type === "grandine" ? "hail" as const : "flood" as const,
      severity: a.severity === "alta" ? "critical" as const : "warning" as const,
      title: a.title,
      message: a.detail,
      timestamp: new Date().toISOString(),
      read: false,
    }));
}
