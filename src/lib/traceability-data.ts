import { InMemoryStore } from "@/lib/db";

// --- QR Traceability & Digital Product Passport Types ---

export interface ProductLot {
  id: string;
  lotCode: string;
  product: string;
  variety: string;
  fieldId: string;
  fieldName: string;
  farmName: string;
  municipality: string;
  harvestDate: string;
  volumeKg: number;
  organic: boolean;
  dop: boolean;
}

export interface TraceabilityEvent {
  id: string;
  lotId: string;
  timestamp: string;
  phase: "campo" | "raccolta" | "trasporto" | "lavorazione" | "confezionamento" | "distribuzione";
  title: string;
  description: string;
  operator: string;
  location: string;
  verified: boolean;
}

export interface QualityRecord {
  id: string;
  lotId: string;
  date: string;
  metrics: Record<string, string>;
  lab?: string;
  passed: boolean;
  notes: string;
}

export interface DigitalProductPassport {
  lotId: string;
  lotCode: string;
  product: string;
  variety: string;
  farm: { name: string; location: string; organic: boolean; dop: boolean };
  harvestDate: string;
  events: TraceabilityEvent[];
  quality: QualityRecord[];
  certifications: string[];
  carbonFootprint?: string;
  qrUrl: string;
}

// --- Seed Data ---

export const productLots: ProductLot[] = [
  {
    id: "lot-sangiovese-2026-a",
    lotCode: "SGV-2026-A-001",
    product: "Uva Sangiovese",
    variety: "Sangiovese di Romagna",
    fieldId: "vigna-collina-sud",
    fieldName: "Vigna Collina Sud",
    farmName: "Azienda Agricola Tondini",
    municipality: "Bertinoro",
    harvestDate: "2026-09-12",
    volumeKg: 4200,
    organic: true,
    dop: false,
  },
  {
    id: "lot-albana-2026-a",
    lotCode: "ALB-2026-A-001",
    product: "Uva Albana",
    variety: "Albana di Romagna DOCG",
    fieldId: "vigna-argine-est",
    fieldName: "Vigna Argine Est",
    farmName: "Azienda Agricola Tondini",
    municipality: "Bertinoro",
    harvestDate: "2026-08-29",
    volumeKg: 2700,
    organic: true,
    dop: true,
  },
  {
    id: "lot-pesche-2026-a",
    lotCode: "PSC-2026-A-001",
    product: "Pesche",
    variety: "Pesca di Romagna IGP",
    fieldId: "frutteto-san-mamante",
    fieldName: "Frutteto San Mamante",
    farmName: "Azienda Agricola Tondini",
    municipality: "Bertinoro",
    harvestDate: "2026-06-18",
    volumeKg: 1800,
    organic: false,
    dop: false,
  },
  {
    id: "lot-grano-2026-a",
    lotCode: "GRT-2026-A-001",
    product: "Grano tenero",
    variety: "Grano tenero romagnolo",
    fieldId: "seminativo-via-zampeschi",
    fieldName: "Seminativo Via Zampeschi",
    farmName: "Azienda Agricola Tondini",
    municipality: "Bertinoro",
    harvestDate: "2026-07-06",
    volumeKg: 34000,
    organic: false,
    dop: false,
  },
];

export const traceabilityEvents: TraceabilityEvent[] = [
  // Sangiovese lot
  { id: "evt-sgv-1", lotId: "lot-sangiovese-2026-a", timestamp: "2026-04-22T08:00:00+02:00", phase: "campo", title: "Trattamento rameico preventivo", description: "Poltiglia bordolese 3.2 kg/ha contro peronospora. Biologico certificato.", operator: "Marco Tondini", location: "Vigna Collina Sud, Bertinoro", verified: true },
  { id: "evt-sgv-2", lotId: "lot-sangiovese-2026-a", timestamp: "2026-06-15T07:00:00+02:00", phase: "campo", title: "Sfogliatura e diradamento", description: "Sfogliatura lato sud per esposizione grappoli. Diradamento 15% dei grappoli.", operator: "Squadra Cantina", location: "Vigna Collina Sud, Bertinoro", verified: true },
  { id: "evt-sgv-3", lotId: "lot-sangiovese-2026-a", timestamp: "2026-09-12T05:30:00+02:00", phase: "raccolta", title: "Vendemmia manuale", description: "Raccolta in cassette da 18 kg. Selezione grappoli in campo.", operator: "Squadra Cantina (10 addetti)", location: "Vigna Collina Sud, Bertinoro", verified: true },
  { id: "evt-sgv-4", lotId: "lot-sangiovese-2026-a", timestamp: "2026-09-12T11:00:00+02:00", phase: "trasporto", title: "Conferimento in cantina", description: "Trasporto con vasca FC-331 a temperatura controllata. Tempo campo-cantina: 45 min.", operator: "Autista cooperativa", location: "Cantina Sociale Bertinoro", verified: true },
  { id: "evt-sgv-5", lotId: "lot-sangiovese-2026-a", timestamp: "2026-09-12T14:00:00+02:00", phase: "lavorazione", title: "Diraspatura e pigiatura", description: "Prima lavorazione entro 3 ore dalla raccolta. Temperatura mosto controllata.", operator: "Enologo cooperativa", location: "Cantina Sociale Bertinoro", verified: true },
  // Pesche lot
  { id: "evt-psc-1", lotId: "lot-pesche-2026-a", timestamp: "2026-05-10T08:00:00+02:00", phase: "campo", title: "Diradamento frutti", description: "Diradamento manuale per calibro ottimale (68-73 mm).", operator: "Marco Tondini", location: "Frutteto San Mamante, Bertinoro", verified: true },
  { id: "evt-psc-2", lotId: "lot-pesche-2026-a", timestamp: "2026-06-18T05:30:00+02:00", phase: "raccolta", title: "Raccolta pesche", description: "Raccolta mattiniera per freschezza. Prima cernita in campo.", operator: "Squadra Alba (8 addetti)", location: "Frutteto San Mamante, Bertinoro", verified: true },
  { id: "evt-psc-3", lotId: "lot-pesche-2026-a", timestamp: "2026-06-18T10:00:00+02:00", phase: "confezionamento", title: "Calibratura e confezionamento", description: "Selezione per calibro, confezionamento in cassette da 5 kg per vendita diretta.", operator: "Operatori magazzino", location: "Hub cooperativo Forlì", verified: true },
  { id: "evt-psc-4", lotId: "lot-pesche-2026-a", timestamp: "2026-06-18T14:00:00+02:00", phase: "distribuzione", title: "Consegna mercato locale", description: "6 cassette premium per vendita diretta in cascina + 2 pallet per GDO regionale.", operator: "Autista consegne", location: "Mercato Forlì / GDO", verified: true },
];

export const qualityRecords: QualityRecord[] = [
  {
    id: "qr-sgv-1",
    lotId: "lot-sangiovese-2026-a",
    date: "2026-09-12",
    metrics: {
      "Grado zuccherino": "21.4 °Brix",
      "Acidità totale": "5.8 g/L",
      "pH": "3.42",
      "Stato sanitario": "Eccellente",
    },
    lab: "Laboratorio CRPV Cesena",
    passed: true,
    notes: "Parametri ottimali per vinificazione linea superiore.",
  },
  {
    id: "qr-psc-1",
    lotId: "lot-pesche-2026-a",
    date: "2026-06-18",
    metrics: {
      "Calibro medio": "71 mm",
      "Colorazione": "85%",
      "Durezza polpa": "4.2 kg/cm²",
      "Residui fitosanitari": "Non rilevati",
    },
    passed: true,
    notes: "Conforme a standard GDO e vendita diretta.",
  },
];

// Build a Digital Product Passport for a lot
export function buildDPP(lotId: string): DigitalProductPassport | null {
  const lot = productLots.find((l) => l.id === lotId);
  if (!lot) return null;

  const events = traceabilityEvents
    .filter((e) => e.lotId === lotId)
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  const quality = qualityRecords.filter((q) => q.lotId === lotId);

  const certs: string[] = [];
  if (lot.organic) certs.push("Biologico certificato ICEA");
  if (lot.dop) certs.push("DOP / DOCG Romagna");

  return {
    lotId: lot.id,
    lotCode: lot.lotCode,
    product: lot.product,
    variety: lot.variety,
    farm: {
      name: lot.farmName,
      location: `${lot.municipality}, Forlì-Cesena`,
      organic: lot.organic,
      dop: lot.dop,
    },
    harvestDate: lot.harvestDate,
    events,
    quality,
    certifications: certs,
    carbonFootprint: "2.1 kg CO₂e / kg",
    qrUrl: `/traceability/${lot.id}`,
  };
}

// Generate SVG QR code placeholder (real implementation would use a QR library)
export function generateQRSVG(url: string, size = 200): string {
  // In production, use a library like 'qrcode' to generate real QR codes
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" fill="white" rx="12"/>
    <rect x="20" y="20" width="60" height="60" fill="#193524" rx="4"/>
    <rect x="30" y="30" width="40" height="40" fill="white" rx="2"/>
    <rect x="38" y="38" width="24" height="24" fill="#193524" rx="2"/>
    <rect x="${size - 80}" y="20" width="60" height="60" fill="#193524" rx="4"/>
    <rect x="${size - 70}" y="30" width="40" height="40" fill="white" rx="2"/>
    <rect x="${size - 62}" y="38" width="24" height="24" fill="#193524" rx="2"/>
    <rect x="20" y="${size - 80}" width="60" height="60" fill="#193524" rx="4"/>
    <rect x="30" y="${size - 70}" width="40" height="40" fill="white" rx="2"/>
    <rect x="38" y="${size - 62}" width="24" height="24" fill="#193524" rx="2"/>
    <text x="${size / 2}" y="${size / 2 + 5}" text-anchor="middle" fill="#193524" font-size="10" font-family="monospace">QR: ${url.slice(0, 20)}</text>
  </svg>`;
}

export const lotsStore = new InMemoryStore<ProductLot>();
lotsStore.seed(productLots.map((l) => ({ ...l })));
