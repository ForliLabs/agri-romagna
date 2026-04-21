import { InMemoryStore } from "@/lib/db";

// --- Satellite / NDVI / Copernicus Types ---

export interface FieldBoundary {
  id: string;
  fieldId: string;
  coordinates: [number, number][]; // [lng, lat] pairs forming polygon
  areaHa: number;
  cadastralRef?: string;
}

export interface NDVIReading {
  id: string;
  fieldId: string;
  date: string;
  meanNDVI: number;
  minNDVI: number;
  maxNDVI: number;
  cloudCoverPercent: number;
  source: "sentinel-2" | "landsat";
  healthStatus: "ottimo" | "buono" | "moderato" | "stress" | "critico";
}

export interface CropHealthAlert {
  id: string;
  fieldId: string;
  date: string;
  type: "ndvi_drop" | "anomaly" | "improvement";
  severity: "info" | "warning" | "critical";
  title: string;
  detail: string;
  ndviChange: number;
}

export interface SatellitePass {
  id: string;
  satellite: string;
  date: string;
  cloudCover: number;
  usable: boolean;
}

// NDVI health classification
export function classifyNDVI(ndvi: number): NDVIReading["healthStatus"] {
  if (ndvi >= 0.7) return "ottimo";
  if (ndvi >= 0.5) return "buono";
  if (ndvi >= 0.35) return "moderato";
  if (ndvi >= 0.2) return "stress";
  return "critico";
}

export function ndviToColor(ndvi: number): string {
  if (ndvi >= 0.7) return "#15803d";
  if (ndvi >= 0.5) return "#65a30d";
  if (ndvi >= 0.35) return "#ca8a04";
  if (ndvi >= 0.2) return "#ea580c";
  return "#dc2626";
}

export function healthStatusLabel(status: NDVIReading["healthStatus"]): string {
  const labels: Record<NDVIReading["healthStatus"], string> = {
    ottimo: "Ottimo — vigore elevato",
    buono: "Buono — crescita regolare",
    moderato: "Moderato — monitorare",
    stress: "Stress — intervento consigliato",
    critico: "Critico — azione immediata",
  };
  return labels[status];
}

// --- Seed Data: Romagna field boundaries (approx. coords around Bertinoro) ---

export const fieldBoundaries: FieldBoundary[] = [
  {
    id: "boundary-vigna-collina-sud",
    fieldId: "vigna-collina-sud",
    coordinates: [
      [12.1340, 44.1485],
      [12.1385, 44.1485],
      [12.1385, 44.1460],
      [12.1340, 44.1460],
    ],
    areaHa: 3.5,
    cadastralRef: "FC-035-A-142",
  },
  {
    id: "boundary-vigna-argine-est",
    fieldId: "vigna-argine-est",
    coordinates: [
      [12.1395, 44.1490],
      [12.1425, 44.1490],
      [12.1425, 44.1470],
      [12.1395, 44.1470],
    ],
    areaHa: 2,
    cadastralRef: "FC-035-A-143",
  },
  {
    id: "boundary-frutteto-san-mamante",
    fieldId: "frutteto-san-mamante",
    coordinates: [
      [12.1300, 44.1510],
      [12.1325, 44.1510],
      [12.1325, 44.1495],
      [12.1300, 44.1495],
    ],
    areaHa: 1.5,
    cadastralRef: "FC-035-B-067",
  },
  {
    id: "boundary-seminativo-zampeschi",
    fieldId: "seminativo-via-zampeschi",
    coordinates: [
      [12.1250, 44.1530],
      [12.1330, 44.1530],
      [12.1330, 44.1500],
      [12.1250, 44.1500],
    ],
    areaHa: 5,
    cadastralRef: "FC-035-C-221",
  },
];

// Historical NDVI readings (simulated Sentinel-2 data)
export const ndviReadings: NDVIReading[] = [
  // Vigna Collina Sud — Sangiovese
  { id: "ndvi-vcs-1", fieldId: "vigna-collina-sud", date: "2026-03-15", meanNDVI: 0.32, minNDVI: 0.22, maxNDVI: 0.41, cloudCoverPercent: 15, source: "sentinel-2", healthStatus: "moderato" },
  { id: "ndvi-vcs-2", fieldId: "vigna-collina-sud", date: "2026-04-01", meanNDVI: 0.45, minNDVI: 0.35, maxNDVI: 0.55, cloudCoverPercent: 8, source: "sentinel-2", healthStatus: "buono" },
  { id: "ndvi-vcs-3", fieldId: "vigna-collina-sud", date: "2026-04-16", meanNDVI: 0.58, minNDVI: 0.48, maxNDVI: 0.67, cloudCoverPercent: 12, source: "sentinel-2", healthStatus: "buono" },
  { id: "ndvi-vcs-4", fieldId: "vigna-collina-sud", date: "2026-05-01", meanNDVI: 0.71, minNDVI: 0.62, maxNDVI: 0.79, cloudCoverPercent: 5, source: "sentinel-2", healthStatus: "ottimo" },
  { id: "ndvi-vcs-5", fieldId: "vigna-collina-sud", date: "2026-05-13", meanNDVI: 0.74, minNDVI: 0.65, maxNDVI: 0.82, cloudCoverPercent: 20, source: "sentinel-2", healthStatus: "ottimo" },
  // Vigna Argine Est — Albana
  { id: "ndvi-vae-1", fieldId: "vigna-argine-est", date: "2026-03-15", meanNDVI: 0.28, minNDVI: 0.18, maxNDVI: 0.38, cloudCoverPercent: 15, source: "sentinel-2", healthStatus: "stress" },
  { id: "ndvi-vae-2", fieldId: "vigna-argine-est", date: "2026-04-01", meanNDVI: 0.42, minNDVI: 0.33, maxNDVI: 0.52, cloudCoverPercent: 10, source: "sentinel-2", healthStatus: "buono" },
  { id: "ndvi-vae-3", fieldId: "vigna-argine-est", date: "2026-05-01", meanNDVI: 0.55, minNDVI: 0.44, maxNDVI: 0.64, cloudCoverPercent: 8, source: "sentinel-2", healthStatus: "buono" },
  { id: "ndvi-vae-4", fieldId: "vigna-argine-est", date: "2026-05-13", meanNDVI: 0.61, minNDVI: 0.52, maxNDVI: 0.70, cloudCoverPercent: 18, source: "sentinel-2", healthStatus: "buono" },
  // Frutteto San Mamante — Pesche
  { id: "ndvi-fsm-1", fieldId: "frutteto-san-mamante", date: "2026-03-15", meanNDVI: 0.35, minNDVI: 0.25, maxNDVI: 0.44, cloudCoverPercent: 15, source: "sentinel-2", healthStatus: "moderato" },
  { id: "ndvi-fsm-2", fieldId: "frutteto-san-mamante", date: "2026-04-16", meanNDVI: 0.62, minNDVI: 0.52, maxNDVI: 0.71, cloudCoverPercent: 6, source: "sentinel-2", healthStatus: "buono" },
  { id: "ndvi-fsm-3", fieldId: "frutteto-san-mamante", date: "2026-05-13", meanNDVI: 0.68, minNDVI: 0.58, maxNDVI: 0.77, cloudCoverPercent: 10, source: "sentinel-2", healthStatus: "buono" },
  // Seminativo — Grano
  { id: "ndvi-svz-1", fieldId: "seminativo-via-zampeschi", date: "2026-03-15", meanNDVI: 0.52, minNDVI: 0.42, maxNDVI: 0.62, cloudCoverPercent: 15, source: "sentinel-2", healthStatus: "buono" },
  { id: "ndvi-svz-2", fieldId: "seminativo-via-zampeschi", date: "2026-04-01", meanNDVI: 0.68, minNDVI: 0.58, maxNDVI: 0.78, cloudCoverPercent: 5, source: "sentinel-2", healthStatus: "buono" },
  { id: "ndvi-svz-3", fieldId: "seminativo-via-zampeschi", date: "2026-05-01", meanNDVI: 0.75, minNDVI: 0.66, maxNDVI: 0.84, cloudCoverPercent: 8, source: "sentinel-2", healthStatus: "ottimo" },
  { id: "ndvi-svz-4", fieldId: "seminativo-via-zampeschi", date: "2026-05-13", meanNDVI: 0.72, minNDVI: 0.61, maxNDVI: 0.80, cloudCoverPercent: 22, source: "sentinel-2", healthStatus: "ottimo" },
];

export const cropHealthAlerts: CropHealthAlert[] = [
  {
    id: "alert-vae-spring",
    fieldId: "vigna-argine-est",
    date: "2026-03-15",
    type: "ndvi_drop",
    severity: "warning",
    title: "NDVI basso in Vigna Argine Est",
    detail: "Indice di vigore vegetativo sotto soglia per Albana. Verificare stato di germogliamento e umidità del suolo.",
    ndviChange: -0.08,
  },
  {
    id: "alert-vcs-improvement",
    fieldId: "vigna-collina-sud",
    date: "2026-05-01",
    type: "improvement",
    severity: "info",
    title: "Vigore in forte crescita — Vigna Collina Sud",
    detail: "NDVI in aumento del 22% nell'ultimo mese. Sangiovese in ottima forma per la stagione.",
    ndviChange: 0.13,
  },
];

// Upcoming satellite passes
export const upcomingPasses: SatellitePass[] = [
  { id: "pass-1", satellite: "Sentinel-2A", date: "2026-05-18", cloudCover: 15, usable: true },
  { id: "pass-2", satellite: "Sentinel-2B", date: "2026-05-23", cloudCover: 65, usable: false },
  { id: "pass-3", satellite: "Sentinel-2A", date: "2026-05-28", cloudCover: 10, usable: true },
];

// Helper: get latest NDVI for each field
export function getLatestNDVIByField(readings: NDVIReading[]): Map<string, NDVIReading> {
  const latest = new Map<string, NDVIReading>();
  for (const r of readings) {
    const existing = latest.get(r.fieldId);
    if (!existing || r.date > existing.date) {
      latest.set(r.fieldId, r);
    }
  }
  return latest;
}

export const ndviStore = new InMemoryStore<NDVIReading>();
ndviStore.seed(ndviReadings.map((r) => ({ ...r })));
