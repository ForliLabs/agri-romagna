import { InMemoryStore } from "@/lib/db";

// --- EU CAP & Organic Compliance Types ---

export type ComplianceType = "cap" | "organic" | "dop" | "igp";
export type ComplianceStatus = "conforme" | "in_corso" | "scaduto" | "da_completare";
export type EventType =
  | "trattamento"
  | "ispezione"
  | "certificazione"
  | "dichiarazione_pac"
  | "analisi"
  | "audit";

export interface ComplianceRecord {
  id: string;
  fieldId: string;
  type: ComplianceType;
  status: ComplianceStatus;
  title: string;
  description: string;
  dueDate: string;
  completedDate?: string;
  documents: string[];
  agencyRef?: string;
}

export interface ComplianceEvent {
  id: string;
  recordId: string;
  fieldId: string;
  type: EventType;
  date: string;
  description: string;
  operator: string;
  product?: string;
  quantity?: string;
  notes: string;
  verified: boolean;
}

export interface CAPDeclaration {
  id: string;
  year: number;
  farmId: string;
  status: ComplianceStatus;
  totalHectares: number;
  fields: {
    fieldId: string;
    declaredCrop: string;
    hectares: number;
    greeningMeasure: string;
  }[];
  submissionDate?: string;
  ageaProtocol?: string;
  subsidyEstimate: number;
}

export interface OrganicCertification {
  id: string;
  farmId: string;
  certBody: string;
  certNumber: string;
  validFrom: string;
  validTo: string;
  status: ComplianceStatus;
  scope: string[];
  lastAuditDate: string;
  nextAuditDate: string;
  findings: string[];
}

export interface ComplianceReport {
  id: string;
  type: ComplianceType;
  title: string;
  generatedAt: string;
  format: "pdf" | "csv" | "agea";
  fields: string[];
  period: { from: string; to: string };
}

// --- Seed Data ---

export const complianceRecords: ComplianceRecord[] = [
  {
    id: "comp-pac-2026",
    fieldId: "seminativo-via-zampeschi",
    type: "cap",
    status: "in_corso",
    title: "Dichiarazione PAC 2026 — Seminativo",
    description: "Dichiarazione superfici per grano tenero con misura di greening (fascia inerbita).",
    dueDate: "2026-05-15",
    documents: ["Visura catastale", "Piano colturale"],
    agencyRef: "AGEA-FC-2026-0847",
  },
  {
    id: "comp-bio-vigna",
    fieldId: "vigna-collina-sud",
    type: "organic",
    status: "conforme",
    title: "Certificazione biologica — Vigna Collina Sud",
    description: "Registrazione trattamenti ammessi e quaderno di campo per certificazione bio Sangiovese.",
    dueDate: "2026-12-31",
    completedDate: "2026-03-15",
    documents: ["Quaderno di campo", "Registro trattamenti bio", "Certificato ICEA"],
    agencyRef: "ICEA-IT-BIO-2026-1234",
  },
  {
    id: "comp-dop-albana",
    fieldId: "vigna-argine-est",
    type: "dop",
    status: "in_corso",
    title: "DOP Albana di Romagna — Documentazione vendemmia",
    description: "Documentazione per denominazione di origine protetta: resa per ettaro, grado zuccherino minimo.",
    dueDate: "2026-09-30",
    documents: ["Registro vendemmia DOP", "Analisi enologica"],
  },
  {
    id: "comp-pac-frutteto",
    fieldId: "frutteto-san-mamante",
    type: "cap",
    status: "da_completare",
    title: "Dichiarazione PAC 2026 — Frutteto",
    description: "Registrazione superfici a pesco con misura agroambientale (lotta integrata).",
    dueDate: "2026-05-15",
    documents: ["Visura catastale"],
    agencyRef: "AGEA-FC-2026-0848",
  },
];

export const complianceEvents: ComplianceEvent[] = [
  {
    id: "evt-1",
    recordId: "comp-bio-vigna",
    fieldId: "vigna-collina-sud",
    type: "trattamento",
    date: "2026-04-22",
    description: "Trattamento rameico preventivo anti-peronospora",
    operator: "Marco Tondini",
    product: "Poltiglia bordolese (20% Cu)",
    quantity: "3.2 kg/ha",
    notes: "Applicazione al mattino con umidità 72%. Vento sotto 8 km/h.",
    verified: true,
  },
  {
    id: "evt-2",
    recordId: "comp-bio-vigna",
    fieldId: "vigna-collina-sud",
    type: "ispezione",
    date: "2026-03-15",
    description: "Visita ispettiva ICEA — audit annuale biologico",
    operator: "Dott.ssa Ferri (ICEA)",
    notes: "Nessuna non conformità rilevata. Documentazione completa e aggiornata.",
    verified: true,
  },
  {
    id: "evt-3",
    recordId: "comp-pac-2026",
    fieldId: "seminativo-via-zampeschi",
    type: "dichiarazione_pac",
    date: "2026-04-28",
    description: "Compilazione fascicolo aziendale per dichiarazione PAC 2026",
    operator: "Marco Tondini",
    notes: "Attesa conferma AGEA per protocollo definitivo. Fascia inerbita documentata con foto georeferenziate.",
    verified: false,
  },
  {
    id: "evt-4",
    recordId: "comp-dop-albana",
    fieldId: "vigna-argine-est",
    type: "analisi",
    date: "2026-05-10",
    description: "Prelievo campioni per analisi pre-vendemmia DOP",
    operator: "Giulia Rossi",
    notes: "Campioni inviati al laboratorio CRPV per grado zuccherino e acidità totale.",
    verified: true,
  },
];

export const capDeclarations: CAPDeclaration[] = [
  {
    id: "cap-2026",
    year: 2026,
    farmId: "azienda-tondini",
    status: "in_corso",
    totalHectares: 12,
    fields: [
      {
        fieldId: "vigna-collina-sud",
        declaredCrop: "Sangiovese (vite da vino)",
        hectares: 3.5,
        greeningMeasure: "Inerbimento interfilare permanente",
      },
      {
        fieldId: "vigna-argine-est",
        declaredCrop: "Albana (vite da vino)",
        hectares: 2,
        greeningMeasure: "Siepe perimetrale 120m",
      },
      {
        fieldId: "frutteto-san-mamante",
        declaredCrop: "Pesco (frutteto)",
        hectares: 1.5,
        greeningMeasure: "Lotta integrata certificata",
      },
      {
        fieldId: "seminativo-via-zampeschi",
        declaredCrop: "Grano tenero",
        hectares: 5,
        greeningMeasure: "Fascia inerbita 5m lungo scolo",
      },
    ],
    subsidyEstimate: 4320,
  },
];

export const organicCertifications: OrganicCertification[] = [
  {
    id: "cert-bio-tondini",
    farmId: "azienda-tondini",
    certBody: "ICEA",
    certNumber: "IT-BIO-2026-FC-1234",
    validFrom: "2026-01-01",
    validTo: "2026-12-31",
    status: "conforme",
    scope: ["Sangiovese", "Albana"],
    lastAuditDate: "2026-03-15",
    nextAuditDate: "2027-03-15",
    findings: [],
  },
];

// Compliance summary helpers
export function getComplianceSummary(records: ComplianceRecord[]) {
  return {
    total: records.length,
    conforme: records.filter((r) => r.status === "conforme").length,
    inCorso: records.filter((r) => r.status === "in_corso").length,
    scaduto: records.filter((r) => r.status === "scaduto").length,
    daCompletare: records.filter((r) => r.status === "da_completare").length,
    completionRate: Math.round(
      (records.filter((r) => r.status === "conforme").length / records.length) * 100
    ),
  };
}

export function getUpcomingDeadlines(records: ComplianceRecord[], daysAhead = 30): ComplianceRecord[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + daysAhead);
  return records
    .filter((r) => r.status !== "conforme" && new Date(r.dueDate) <= cutoff)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

export const complianceRecordsStore = new InMemoryStore<ComplianceRecord>();
complianceRecordsStore.seed(complianceRecords.map((r) => ({ ...r })));

export const complianceEventsStore = new InMemoryStore<ComplianceEvent>();
complianceEventsStore.seed(complianceEvents.map((e) => ({ ...e })));
