import { InMemoryStore } from "@/lib/db";

export interface FarmProfile {
  id: string;
  name: string;
  location: string;
  province: string;
  hectares: number;
  specialty: string;
}

export interface Field {
  id: string;
  name: string;
  crop: string;
  areaHa: number;
  status: string;
  plantingDate: string;
  municipality: string;
  expectedHarvest: string;
  expectedVolume: number;
  health: string;
  irrigation: string;
  notes: string;
}

export interface WeatherCurrent {
  location: string;
  observedAt: string;
  temperatureC: number;
  condition: string;
  humidity: number;
  windKmh: number;
  precipitationChance: number;
  pressureHpa: number;
}

export interface ForecastDay {
  day: string;
  date: string;
  condition: string;
  minC: number;
  maxC: number;
  rainProbability: number;
  note: string;
}

export interface RiverLevel {
  name: string;
  levelMeters: number;
  thresholdMeters: number;
  trend: string;
  status: "normale" | "attenzione" | "preallarme";
}

export interface RiskAlert {
  id: string;
  type: "gelo" | "grandine" | "piena";
  severity: "bassa" | "media" | "alta";
  title: string;
  detail: string;
  timeWindow: string;
}

export interface HistoricalRainfallPoint {
  label: string;
  mm: number;
}

export interface CooperativeMember {
  id: string;
  name: string;
  location: string;
  crops: string[];
  expectedVolumeTonnes: number;
  nextCollection: string;
}

export interface HarvestItem {
  id: string;
  fieldId: string;
  crop: string;
  plannedDate: string;
  estimatedVolume: number;
  crew: string;
  status: string;
  quality: {
    gradeZuccherino?: string;
    acidita?: string;
    calibro?: string;
    maturazione?: string;
    note: string;
  };
}

export interface CrewAssignment {
  id: string;
  date: string;
  team: string;
  shift: string;
  members: number;
  task: string;
  fieldId: string;
}

export interface CollectionRoute {
  id: string;
  day: string;
  route: string;
  departureTime: string;
  vehicle: string;
  stops: string[];
  capacityTonnes: number;
}

export interface ActivityItem {
  id: string;
  time: string;
  title: string;
  description: string;
  tag: string;
}

export const farm: FarmProfile = {
  id: "azienda-tondini",
  name: "Azienda Agricola Tondini",
  location: "Bertinoro",
  province: "Forlì-Cesena",
  hectares: 12,
  specialty: "Vigneti romagnoli, frutta estiva e cereali",
};

export const fields: Field[] = [
  {
    id: "vigna-collina-sud",
    name: "Vigna Collina Sud",
    crop: "Sangiovese",
    areaHa: 3.5,
    status: "Invaiatura avanzata",
    plantingDate: "2021-03-18",
    municipality: "Bertinoro",
    expectedHarvest: "2026-09-12",
    expectedVolume: 28,
    health: "Vigore alto, chioma uniforme",
    irrigation: "A goccia · turnazione 48h",
    notes: "Controllo oidio completato, acidità in equilibrio.",
  },
  {
    id: "vigna-argine-est",
    name: "Vigna Argine Est",
    crop: "Albana",
    areaHa: 2,
    status: "Fioritura stabile",
    plantingDate: "2020-04-09",
    municipality: "Bertinoro",
    expectedHarvest: "2026-08-29",
    expectedVolume: 15,
    health: "Buona allegagione, umidità sotto controllo",
    irrigation: "Sensori suolo attivi · 22% VWC",
    notes: "Programmare sfogliatura lato monte entro 5 giorni.",
  },
  {
    id: "frutteto-san-mamante",
    name: "Frutteto San Mamante",
    crop: "Pesche",
    areaHa: 1.5,
    status: "Maturazione in corso",
    plantingDate: "2022-02-10",
    municipality: "Bertinoro",
    expectedHarvest: "2026-06-18",
    expectedVolume: 11,
    health: "Calibro omogeneo, stress idrico assente",
    irrigation: "A manichetta · ultimo ciclo ieri",
    notes: "Lotto destinato in parte a vendita diretta in cascina.",
  },
  {
    id: "seminativo-via-zampeschi",
    name: "Seminativo Via Zampeschi",
    crop: "Grano tenero",
    areaHa: 5,
    status: "Granigione",
    plantingDate: "2025-11-08",
    municipality: "Bertinoro",
    expectedHarvest: "2026-07-06",
    expectedVolume: 34,
    health: "Copertura uniforme, pressione infestanti bassa",
    irrigation: "Non irrigato · monitoraggio rugiada",
    notes: "Proteina stimata 12,6%, finestra di trebbiatura in definizione.",
  },
];

export const weatherData = {
  current: {
    location: "Forlì",
    observedAt: "2026-05-13T08:30:00+02:00",
    temperatureC: 22,
    condition: "Parzialmente nuvoloso",
    humidity: 64,
    windKmh: 14,
    precipitationChance: 25,
    pressureHpa: 1017,
  } satisfies WeatherCurrent,
  forecast: [
    {
      day: "Lun",
      date: "2026-05-18",
      condition: "Soleggiato",
      minC: 14,
      maxC: 25,
      rainProbability: 10,
      note: "Ottimo per trattamenti fogliari.",
    },
    {
      day: "Mar",
      date: "2026-05-19",
      condition: "Variabile",
      minC: 15,
      maxC: 23,
      rainProbability: 35,
      note: "Possibili rovesci nel pomeriggio.",
    },
    {
      day: "Mer",
      date: "2026-05-20",
      condition: "Pioggia debole",
      minC: 13,
      maxC: 20,
      rainProbability: 70,
      note: "Ridurre finestre di raccolta manuale.",
    },
    {
      day: "Gio",
      date: "2026-05-21",
      condition: "Coperto",
      minC: 12,
      maxC: 19,
      rainProbability: 45,
      note: "Attenzione ai ristagni nelle aree basse.",
    },
    {
      day: "Ven",
      date: "2026-05-22",
      condition: "Sole e nubi",
      minC: 13,
      maxC: 22,
      rainProbability: 20,
      note: "Ripresa ideale per logistica cooperativa.",
    },
    {
      day: "Sab",
      date: "2026-05-23",
      condition: "Temporali isolati",
      minC: 16,
      maxC: 24,
      rainProbability: 60,
      note: "Rischio grandine moderato tra collina e fondovalle.",
    },
    {
      day: "Dom",
      date: "2026-05-24",
      condition: "Sereno",
      minC: 14,
      maxC: 26,
      rainProbability: 5,
      note: "Ottimo per visite in campo e mercati locali.",
    },
  ] satisfies ForecastDay[],
  rivers: [
    {
      name: "Fiume Montone",
      levelMeters: 1.82,
      thresholdMeters: 2.4,
      trend: "stabile",
      status: "normale",
    },
    {
      name: "Fiume Rabbi",
      levelMeters: 1.36,
      thresholdMeters: 1.8,
      trend: "in aumento",
      status: "attenzione",
    },
  ] satisfies RiverLevel[],
  alerts: [
    {
      id: "allerta-grandine",
      type: "grandine",
      severity: "media",
      title: "Possibili chicchi di media intensità",
      detail: "Finestra critica sabato 23 maggio tra le 16:00 e le 20:00 sulle colline tra Bertinoro e Meldola.",
      timeWindow: "Sab 23 · 16:00-20:00",
    },
    {
      id: "allerta-piena",
      type: "piena",
      severity: "bassa",
      title: "Rabbi in lieve crescita",
      detail: "Monitorare gli appezzamenti di fondovalle e verificare accessi carrabili in caso di ulteriori piogge.",
      timeWindow: "Mer 20 · 06:00-18:00",
    },
    {
      id: "allerta-gelo",
      type: "gelo",
      severity: "bassa",
      title: "Rischio gelo assente nel breve periodo",
      detail: "Temperature minime sempre superiori a 12 °C nella prossima settimana.",
      timeWindow: "Orizzonte 7 giorni",
    },
  ] satisfies RiskAlert[],
  historicalRainfall: [
    { label: "Gen", mm: 42 },
    { label: "Feb", mm: 38 },
    { label: "Mar", mm: 56 },
    { label: "Apr", mm: 61 },
    { label: "Mag", mm: 48 },
    { label: "Giu", mm: 33 },
  ] satisfies HistoricalRainfallPoint[],
};

export const cooperativeMembers: CooperativeMember[] = [
  {
    id: "podere-san-vittore",
    name: "Podere San Vittore",
    location: "Forlimpopoli",
    crops: ["Sangiovese", "Albana"],
    expectedVolumeTonnes: 42,
    nextCollection: "2026-08-30",
  },
  {
    id: "tenuta-fratta",
    name: "Tenuta La Fratta",
    location: "Cesena",
    crops: ["Pesche", "Susine"],
    expectedVolumeTonnes: 24,
    nextCollection: "2026-06-20",
  },
  {
    id: "azienda-ca-bianca",
    name: "Azienda Cà Bianca",
    location: "Faenza",
    crops: ["Grano tenero", "Erba medica"],
    expectedVolumeTonnes: 58,
    nextCollection: "2026-07-07",
  },
];

export const harvestSchedule: HarvestItem[] = [
  {
    id: "harvest-pesche",
    fieldId: "frutteto-san-mamante",
    crop: "Pesche",
    plannedDate: "2026-06-18",
    estimatedVolume: 11,
    crew: "Squadra Alba",
    status: "Confermato",
    quality: {
      calibro: "68-73 mm",
      maturazione: "85% colorazione",
      note: "Destinazione: mercato locale e GDO regionale.",
    },
  },
  {
    id: "harvest-grano",
    fieldId: "seminativo-via-zampeschi",
    crop: "Grano tenero",
    plannedDate: "2026-07-06",
    estimatedVolume: 34,
    crew: "Squadra Trebbia",
    status: "Da confermare con meteo",
    quality: {
      note: "Controllare umidità granella prima della trebbiatura.",
    },
  },
  {
    id: "harvest-albana",
    fieldId: "vigna-argine-est",
    crop: "Albana",
    plannedDate: "2026-08-29",
    estimatedVolume: 15,
    crew: "Squadra Cantina",
    status: "Programmato",
    quality: {
      gradeZuccherino: "19.1 °Brix",
      acidita: "6.4 g/L",
      note: "Raccolta in cassette da 18 kg per selezione manuale.",
    },
  },
  {
    id: "harvest-sangiovese",
    fieldId: "vigna-collina-sud",
    crop: "Sangiovese",
    plannedDate: "2026-09-12",
    estimatedVolume: 28,
    crew: "Squadra Cantina",
    status: "Programmato",
    quality: {
      gradeZuccherino: "21.4 °Brix",
      acidita: "5.8 g/L",
      note: "Obiettivo: selezione per linea superiore cooperativa.",
    },
  },
];

export const crewAssignments: CrewAssignment[] = [
  {
    id: "crew-1",
    date: "2026-06-18",
    team: "Squadra Alba",
    shift: "05:30 - 12:30",
    members: 8,
    task: "Raccolta pesche e prima cernita",
    fieldId: "frutteto-san-mamante",
  },
  {
    id: "crew-2",
    date: "2026-07-06",
    team: "Squadra Trebbia",
    shift: "07:00 - 18:00",
    members: 5,
    task: "Trebbia + rimorchi di supporto",
    fieldId: "seminativo-via-zampeschi",
  },
  {
    id: "crew-3",
    date: "2026-08-29",
    team: "Squadra Cantina",
    shift: "06:00 - 14:00",
    members: 10,
    task: "Raccolta Albana per pressatura in giornata",
    fieldId: "vigna-argine-est",
  },
];

export const collectionRoutes: CollectionRoute[] = [
  {
    id: "route-bertinoro",
    day: "Lunedì",
    route: "Bertinoro → Forlimpopoli → Forlì",
    departureTime: "06:10",
    vehicle: "Autocarro frigo RF-218",
    stops: ["Azienda Agricola Tondini", "Podere San Vittore", "Hub cooperativo Forlì"],
    capacityTonnes: 18,
  },
  {
    id: "route-cesena",
    day: "Mercoledì",
    route: "Cesena → Bertinoro → Faenza",
    departureTime: "05:45",
    vehicle: "Bilico leggero RA-074",
    stops: ["Tenuta La Fratta", "Azienda Agricola Tondini", "Azienda Cà Bianca"],
    capacityTonnes: 24,
  },
  {
    id: "route-cantina",
    day: "Sabato",
    route: "Bertinoro → Cantina cooperativa",
    departureTime: "17:30",
    vehicle: "Vasca uva FC-331",
    stops: ["Vigna Collina Sud", "Vigna Argine Est", "Cantina sociale"],
    capacityTonnes: 20,
  },
];

export const recentActivity: ActivityItem[] = [
  {
    id: "activity-1",
    time: "08:10",
    title: "Rilievo meteo aggiornato su Forlì",
    description: "Pressione stabile e vento da nord-est in calo. Nessun blocco alle uscite di campo.",
    tag: "Meteo",
  },
  {
    id: "activity-2",
    time: "07:40",
    title: "Sfogliatura pianificata in Vigna Argine Est",
    description: "Assegnata la squadra di 4 operatori per la finestra di martedì mattina.",
    tag: "Campi",
  },
  {
    id: "activity-3",
    time: "Ieri",
    title: "Confermato ritiro pesche per il mercato di Forlì",
    description: "Prenotate 6 cassette premium per vendita diretta e 2 pallet per la cooperativa.",
    tag: "Commerciale",
  },
];

export const fieldsStore = new InMemoryStore<Field>();
fieldsStore.seed(fields.map((field) => ({ ...field })));
