import { readFileSync } from "node:fs";
import path from "node:path";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

import { PrismaClient } from "../src/generated/prisma";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" });
const prisma = new PrismaClient({ adapter });
const now = new Date();
const DAY_MS = 24 * 60 * 60 * 1000;

const daysAgo = (days: number, hour = 9, minute = 0) => {
  const value = new Date(now.getTime() - days * DAY_MS);
  value.setHours(hour, minute, 0, 0);
  return value;
};

const daysFromNow = (days: number, hour = 9, minute = 0) => {
  const value = new Date(now.getTime() + days * DAY_MS);
  value.setHours(hour, minute, 0, 0);
  return value;
};

const monthPoint = (monthsAgo: number, day = 6, hour = 10) =>
  new Date(now.getFullYear(), now.getMonth() - monthsAgo, day, hour, 0, 0, 0);

const round = (value: number, decimals = 1) => Math.round(value * 10 ** decimals) / 10 ** decimals;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const pick = <T,>(values: readonly T[], index: number) => values[index % values.length]!;

type CropType = "vite" | "grano" | "girasole" | "olivo" | "pomodoro" | "erba_medica" | "mais" | "pesco";

type SeedData = {
  cooperatives: Array<{
    id: string;
    name: string;
    region: string;
    province: string;
    plan: string;
    memberCount: number;
    adminUserId: string;
  }>;
  farms: Array<{
    id: string;
    cooperativeId: string;
    name: string;
    location: string;
    province: string;
    hectares: number;
    specialty: string;
  }>;
  fields: Array<{
    id: string;
    farmId: string;
    cooperativeId: string;
    name: string;
    crop: string;
    cropType: CropType;
    variety: string;
    municipality: string;
    areaHa: number;
    status: string;
    health: string;
    irrigation: string;
    notes: string;
    organic: boolean;
    certifications: string[];
    plantingDaysAgo: number;
    harvestInDays: number;
    expectedVolume: number;
  }>;
  users: Array<{
    id: string;
    email: string;
    name: string;
    role: string;
    cooperativeId?: string;
    farmId?: string;
    phone: string;
    avatarInitials: string;
  }>;
};

const dataPath = path.join(process.cwd(), "prisma/seed-data/demo.json");
const seedData = JSON.parse(readFileSync(dataPath, "utf8")) as SeedData;

const cooperativeSeeds = seedData.cooperatives;
const farmSeeds = seedData.farms;
const userSeeds = seedData.users.map((user) => ({ ...user, passwordHash: "demo-password-hash" }));
const fieldSeeds = seedData.fields.map((field) => ({
  ...field,
  plantingDate: daysAgo(field.plantingDaysAgo, 8),
  expectedHarvest: daysFromNow(field.harvestInDays, field.cropType === "grano" ? 8 : 6),
}));

const farmsById = new Map(farmSeeds.map((farm) => [farm.id, farm]));
const fieldsByFarmId = Object.fromEntries(farmSeeds.map((farm) => [farm.id, fieldSeeds.filter((field) => field.farmId === farm.id)]));

async function clearDatabase() {
  try {
    await prisma.cooperative.updateMany({ data: { adminUserId: null } });
  } catch {
    // Empty database on first run.
  }

  await prisma.message.deleteMany();
  await prisma.communicationChannel.deleteMany();
  await prisma.order.deleteMany();
  await prisma.marketplaceProduct.deleteMany();
  await prisma.vote.deleteMany();
  await prisma.proposal.deleteMany();
  await prisma.workShift.deleteMany();
  await prisma.seasonalWorker.deleteMany();
  await prisma.maintenanceEvent.deleteMany();
  await prisma.equipment.deleteMany();
  await prisma.sprayPrescription.deleteMany();
  await prisma.diseaseRisk.deleteMany();
  await prisma.soilAnalysis.deleteMany();
  await prisma.irrigationSchedule.deleteMany();
  await prisma.supplyChainLot.deleteMany();
  await prisma.harvestDeclaration.deleteMany();
  await prisma.eSGIndicator.deleteMany();
  await prisma.carbonEntry.deleteMany();
  await prisma.revenueEntry.deleteMany();
  await prisma.costEntry.deleteMany();
  await prisma.sensorReading.deleteMany();
  await prisma.sensorDevice.deleteMany();
  await prisma.nDVIReading.deleteMany();
  await prisma.traceabilityEvent.deleteMany();
  await prisma.productLot.deleteMany();
  await prisma.complianceEvent.deleteMany();
  await prisma.complianceRecord.deleteMany();
  await prisma.farmBenchmark.deleteMany();
  await prisma.yieldPrediction.deleteMany();
  await prisma.regulatoryUpdate.deleteMany();
  await prisma.simulationScenario.deleteMany();
  await prisma.insurancePolicy.deleteMany();
  await prisma.user.deleteMany();
  await prisma.field.deleteMany();
  await prisma.farm.deleteMany();
  await prisma.cooperative.deleteMany();
}

function buildCompliance() {
  const records: Array<Record<string, unknown>> = [];
  const events: Array<Record<string, unknown>> = [];

  fieldSeeds.forEach((field, index) => {
    const operator = pick(["Lucia Giorgi", "Sara Monti", "Anna Bassi", "Elena Bellini"], index);

    if (field.organic) {
      const recordId = `organic-${field.id}`;
      records.push({
        id: recordId,
        fieldId: field.id,
        type: "organic",
        status: index % 5 === 0 ? "in_rinnovo" : "attiva",
        title: `Certificazione biologica ${field.name}`,
        description: `Registro e input conformi al Reg. UE 2018/848 per ${field.crop.toLowerCase()}.`,
        dueDate: daysFromNow(40 + index),
        completedDate: daysAgo(120 - index),
        documents: [{ name: `registro-${field.id}.pdf` }, { name: `audit-${field.id}.pdf` }],
        agencyRef: `BIO-${field.id.toUpperCase()}`,
      });
      events.push(
        {
          id: `${recordId}-audit`,
          recordId,
          fieldId: field.id,
          type: "audit",
          date: daysAgo(55 + index),
          description: "Audit annuale e verifica quaderno di campagna.",
          operator,
          notes: "Nessuna non conformità rilevata.",
          verified: true,
        },
        {
          id: `${recordId}-upload`,
          recordId,
          fieldId: field.id,
          type: "document_upload",
          date: daysAgo(18 + index),
          description: "Aggiornata documentazione di superfici e input.",
          operator,
          notes: "Documentazione condivisa con l'ente certificatore.",
          verified: true,
        },
      );
    }

    const originTitle =
      field.cropType === "vite"
        ? `DOP ${field.variety} Romagna`
        : field.cropType === "olivo"
          ? "DOP Brisighella"
          : field.cropType === "pesco"
            ? "IGP Pesca e Nettarina di Romagna"
            : null;

    if (originTitle) {
      const recordId = `origin-${field.id}`;
      records.push({
        id: recordId,
        fieldId: field.id,
        type: originTitle.startsWith("IGP") ? "IGP" : "DOP",
        status: "attiva",
        title: originTitle,
        description: `Tracciabilità e disciplinare di origine mantenuti per ${field.name}.`,
        dueDate: daysFromNow(50 + index),
        completedDate: daysAgo(70 - (index % 12)),
        documents: [{ name: `disciplinare-${field.id}.pdf` }, { name: `mappa-${field.id}.geojson` }],
        agencyRef: `ORI-${field.id.toUpperCase()}`,
      });
      events.push(
        {
          id: `${recordId}-check`,
          recordId,
          fieldId: field.id,
          type: "inspection",
          date: daysAgo(40 + index),
          description: "Verifica disciplinare, superfici e mappa catastale.",
          operator,
          notes: "Controllo superato.",
          verified: true,
        },
        {
          id: `${recordId}-sampling`,
          recordId,
          fieldId: field.id,
          type: "sampling",
          date: daysAgo(8 + index),
          description: "Campionamento pre-raccolta e conferma destinazione di filiera.",
          operator,
          notes: "Parametri coerenti con il disciplinare di origine.",
          verified: true,
        },
      );
    }

    if (["pomodoro", "grano"].includes(field.cropType) && !field.organic) {
      const recordId = `filiera-${field.id}`;
      records.push({
        id: recordId,
        fieldId: field.id,
        type: "filiera",
        status: "attiva",
        title: `Controllo di filiera ${field.crop}`,
        description: `Piano di tracciabilità e controlli residui per ${field.crop.toLowerCase()}.`,
        dueDate: daysFromNow(30 + index),
        completedDate: daysAgo(15 + index),
        documents: [{ name: `contratto-${field.id}.pdf` }],
        agencyRef: `FIL-${field.id.toUpperCase()}`,
      });
      events.push({
        id: `${recordId}-residui`,
        recordId,
        fieldId: field.id,
        type: "residue_check",
        date: daysAgo(5 + index),
        description: "Aggiornato piano residui e calendario conferimenti.",
        operator,
        notes: "I residui attesi restano sotto le soglie interne.",
        verified: true,
      });
    }
  });

  return { records, events };
}

function buildLots() {
  const selected = fieldSeeds.filter((field) => ["vite", "pesco", "olivo", "pomodoro", "grano"].includes(field.cropType));
  const lots = selected.map((field, index) => {
    const harvestDate = daysAgo(8 + index * 4, 6 + (index % 3));
    return {
      id: `lot-${field.id}`,
      product:
        field.cropType === "vite"
          ? "Uva"
          : field.cropType === "olivo"
            ? "Olive"
            : field.cropType === "pesco"
              ? "Pesche"
              : field.cropType === "pomodoro"
                ? "Pomodoro"
                : "Grano",
      variety: field.variety,
      harvestDate,
      fieldId: field.id,
      quantity: round(field.expectedVolume * (field.cropType === "vite" ? 930 : field.cropType === "olivo" ? 720 : 1000), 0),
      unit: "kg",
      status: pick(["stored", "packed", "quality_checked", "in_transit"], index),
      certifications: field.certifications,
    };
  });

  const traceabilityEvents = lots.flatMap((lot, index) => {
    const field = fieldSeeds.find((item) => item.id === lot.fieldId)!;
    const farm = farmsById.get(field.farmId)!;
    return [
      {
        id: `trace-harvest-${lot.id}`,
        lotId: lot.id,
        type: "harvested",
        timestamp: lot.harvestDate,
        location: `${field.name}, ${field.municipality}`,
        operator: pick(["Marco Tondini", "Sara Monti", "Anna Bassi", "Lucia Giorgi"], index),
        details: `Raccolta completata in ${field.name}.`,
        verified: true,
      },
      {
        id: `trace-weight-${lot.id}`,
        lotId: lot.id,
        type: "weighed",
        timestamp: new Date(lot.harvestDate.getTime() + 2 * 60 * 60 * 1000),
        location: `${farm.name} · pesa aziendale`,
        operator: "Centro conferimento cooperativo",
        details: `Peso netto registrato ${lot.quantity} kg.`,
        verified: true,
      },
      {
        id: `trace-quality-${lot.id}`,
        lotId: lot.id,
        type: "quality_checked",
        timestamp: new Date(lot.harvestDate.getTime() + 7 * 60 * 60 * 1000),
        location: field.cropType === "vite" ? "Cantina sociale" : field.cropType === "olivo" ? "Frantoio partner" : "Hub ortofrutta cooperativo",
        operator: "Ufficio qualità cooperativa",
        details: `Campione allineato alla certificazione ${field.certifications[0] ?? "di filiera"}.`,
        verified: true,
      },
      {
        id: `trace-ship-${lot.id}`,
        lotId: lot.id,
        type: "shipped",
        timestamp: new Date(lot.harvestDate.getTime() + 12 * 60 * 60 * 1000),
        location: farm.location,
        operator: "Logistica Romagna Fresh",
        details: "Spedizione avviata con tracking logistico.",
        verified: index % 5 !== 0,
      },
    ];
  });

  const supplyChainLots = lots.map((lot, index) => {
    const field = fieldSeeds.find((item) => item.id === lot.fieldId)!;
    return {
      id: `supply-${lot.id}`,
      product: `${lot.product} ${lot.variety}`,
      origin: field.municipality,
      destination:
        field.cropType === "vite"
          ? "Cantina sociale di Forlì"
          : field.cropType === "olivo"
            ? "Frantoio Brisighella"
            : field.cropType === "pomodoro"
              ? "Stabilimento di trasformazione Lugo"
              : field.cropType === "grano"
                ? "Molino artigianale Forlimpopoli"
                : "Piattaforma fresco Cesena",
      status: pick(["listed", "quality_checked", "routed", "received"], index),
      quantity: lot.quantity,
      departureDate: new Date(lot.harvestDate.getTime() + 10 * 60 * 60 * 1000),
      arrivalDate: new Date(lot.harvestDate.getTime() + 15 * 60 * 60 * 1000),
    };
  });

  return { lots, traceabilityEvents, supplyChainLots };
}

const sensorBase = (field: (typeof fieldSeeds)[number], type: string) => {
  if (type === "soil_moisture") return field.cropType === "pomodoro" ? 28 : field.cropType === "vite" ? 22 : field.cropType === "olivo" ? 19 : 24;
  if (type === "temperature") return field.cropType === "pomodoro" ? 25 : field.cropType === "mais" ? 24 : 22;
  if (type === "humidity") return field.cropType === "vite" ? 63 : field.cropType === "pomodoro" ? 68 : 60;
  return field.municipality === "Ravenna" ? 14 : 8;
};

function buildSensors() {
  const devices: Array<Record<string, unknown>> = [];
  const readings: Array<Record<string, unknown>> = [];

  fieldSeeds.forEach((field, fieldIndex) => {
    const specs = [
      { suffix: "soil", type: "soil_moisture", label: "Sonda umidità suolo", unit: "% VWC", create: true },
      { suffix: "temp", type: "temperature", label: "Sensore temperatura aria", unit: "°C", create: true },
      { suffix: "humidity", type: "humidity", label: "Sensore umidità aria", unit: "%", create: true },
      { suffix: "wind", type: "wind", label: "Anemometro meteo", unit: "km/h", create: ["vite", "pomodoro", "mais", "girasole"].includes(field.cropType) || fieldIndex % 3 === 0 },
    ];

    specs.filter((spec) => spec.create).forEach((spec, specIndex) => {
      const sensorId = `sensor-${field.id}-${spec.suffix}`;
      devices.push({
        id: sensorId,
        name: `${spec.label} · ${field.name}`,
        type: spec.type,
        fieldId: field.id,
        status: fieldIndex % 11 === 0 && spec.type === "wind" ? "maintenance" : "online",
        lastReading: daysAgo(0, 6 + specIndex * 2 + (fieldIndex % 4), 30),
        batteryLevel: 48 + ((fieldIndex * 9 + specIndex * 7) % 49),
        firmware: `v${1 + (fieldIndex % 2)}.${2 + specIndex}.${fieldIndex % 10}`,
      });

      for (let readingIndex = 0; readingIndex < 4; readingIndex += 1) {
        const raw =
          spec.type === "soil_moisture"
            ? sensorBase(field, spec.type) + fieldIndex * 0.35 + readingIndex * 0.6
            : spec.type === "temperature"
              ? sensorBase(field, spec.type) + (readingIndex - 1.5) * 1.4 + (fieldIndex % 3)
              : spec.type === "humidity"
                ? sensorBase(field, spec.type) + (2 - readingIndex) * 2.5 + (fieldIndex % 4)
                : sensorBase(field, spec.type) + readingIndex * 1.7 + (fieldIndex % 5);

        const value =
          spec.type === "soil_moisture"
            ? clamp(round(raw, 1), 14, 39)
            : spec.type === "temperature"
              ? clamp(round(raw, 1), 15, 34)
              : spec.type === "humidity"
                ? clamp(round(raw, 1), 42, 88)
                : clamp(round(raw, 1), 2, 32);

        readings.push({
          id: `reading-${sensorId}-${readingIndex + 1}`,
          sensorId,
          timestamp: daysAgo(0, 2 + readingIndex * 4 + (fieldIndex % 2), 15),
          value,
          unit: spec.unit,
          quality: value > 30 && spec.type === "temperature" ? "warning" : "good",
        });
      }
    });
  });

  return { devices, readings };
}

function buildNdvi() {
  return fieldSeeds.flatMap((field, index) => [0, 1, 2].map((step) => {
    const base = field.cropType === "vite" ? 0.55 : field.cropType === "pomodoro" ? 0.58 : field.cropType === "olivo" ? 0.49 : field.cropType === "pesco" ? 0.63 : 0.52;
    const ndviValue = clamp(round(base + step * 0.07 + (index % 5) * 0.02, 2), 0.32, 0.86);
    return {
      id: `ndvi-${field.id}-${step + 1}`,
      fieldId: field.id,
      date: daysAgo(95 - step * 38 - (index % 6), 10),
      ndviValue,
      healthStatus: ndviValue >= 0.72 ? "ottimo" : ndviValue >= 0.58 ? "buono" : "monitorare",
      cloudCover: 6 + ((index * 4 + step * 7) % 22),
      satellite: step % 2 === 0 ? "sentinel-2" : "landsat-9",
    };
  }));
}

function buildFinance() {
  const costEntries: Array<Record<string, unknown>> = [];
  const revenueEntries: Array<Record<string, unknown>> = [];
  const carbonEntries: Array<Record<string, unknown>> = [];

  farmSeeds.forEach((farm, farmIndex) => {
    const mainField = fieldsByFarmId[farm.id]?.[0];
    for (let month = 5; month >= 0; month -= 1) {
      const monthDate = monthPoint(month, 7 + (farmIndex % 3), 10);
      costEntries.push(
        {
          id: `cost-${farm.id}-${month}-inputs`,
          farmId: farm.id,
          category: "input",
          description: `Input tecnici del mese per ${farm.name}.`,
          amount: round(farm.hectares * 62 + farmIndex * 34 + month * 18, 2),
          date: monthDate,
          fieldId: mainField?.id,
        },
        {
          id: `cost-${farm.id}-${month}-labour`,
          farmId: farm.id,
          category: "manodopera",
          description: `Manodopera specializzata e operazioni meccaniche a ${farm.location}.`,
          amount: round(farm.hectares * 48 + farmIndex * 21 + month * 11, 2),
          date: new Date(monthDate.getTime() + 5 * DAY_MS),
          fieldId: fieldsByFarmId[farm.id]?.[1]?.id,
        },
      );

      revenueEntries.push({
        id: `revenue-${farm.id}-${month}`,
        farmId: farm.id,
        source: pick(["cooperativa", "horeca", "marketplace"], farmIndex + month),
        description: `Incasso mensile da conferimenti e vendita diretta per ${farm.name}.`,
        amount: round(farm.hectares * 155 + farmIndex * 64 + (5 - month) * 88, 2),
        date: new Date(monthDate.getTime() + 14 * DAY_MS),
      });

      if (month % 2 === 1) {
        carbonEntries.push(
          {
            id: `carbon-${farm.id}-${month}-emission`,
            farmId: farm.id,
            type: "emission",
            category: "diesel",
            description: "Emissioni operative da meccanizzazione e logistica.",
            co2Kg: round(farm.hectares * 18 + farmIndex * 12 + month * 9, 1),
            date: new Date(monthDate.getTime() + 9 * DAY_MS),
            fieldId: mainField?.id,
            verified: true,
          },
          {
            id: `carbon-${farm.id}-${month}-sequestration`,
            farmId: farm.id,
            type: "sequestration",
            category: "cover_crop",
            description: "Stima sequestro da inerbito, residui colturali e minime lavorazioni.",
            co2Kg: round(-1 * (farm.hectares * 11 + farmIndex * 7 + month * 4), 1),
            date: new Date(monthDate.getTime() + 12 * DAY_MS),
            fieldId: fieldsByFarmId[farm.id]?.[2]?.id ?? mainField?.id,
            verified: month !== 5,
          },
        );
      }
    }
  });

  return { costEntries, revenueEntries, carbonEntries };
}

function buildGovernance() {
  const proposals = [
    { id: "proposal-vigne-irrigation", cooperativeId: "coop-vigne-romagna", title: "Piano condiviso per irrigazione di precisione in collina", description: "Investimento congiunto in nuove centraline e dashboard unificata per le vigne di Bertinoro e Forlimpopoli.", status: "open", createdBy: "user-elena-bellini", createdAt: daysAgo(12, 9) },
    { id: "proposal-vigne-hub", cooperativeId: "coop-vigne-romagna", title: "Hub logistico pesche premium per Cesena e Forlì", description: "Linea di confezionamento rapida per pesche e nettarine IGP con etichettatura dinamica.", status: "approved", createdBy: "user-marco-tondini", createdAt: daysAgo(34, 17) },
    { id: "proposal-bio-carbon", cooperativeId: "coop-terre-faentine", title: "Credito carbonio cooperativo su rotazioni cerealicole", description: "Formalizzazione del progetto comune di carbon farming con misure MRV trimestrali.", status: "approved", createdBy: "user-giacomo-rossi", createdAt: daysAgo(28, 10) },
    { id: "proposal-bio-storage", cooperativeId: "coop-terre-faentine", title: "Nuovo silo bio dedicato a Faenza", description: "Espansione della capacità di stoccaggio separato per cereali biologici e lotti certificati.", status: "open", createdBy: "user-sara-monti", createdAt: daysAgo(7, 18) },
    { id: "proposal-orto-weather", cooperativeId: "coop-orto-adriatico", title: "Rete meteo condivisa per pomodoro e mais", description: "Installazione di nuove stazioni meteo collegate all'alerting fitosanitario cooperativo.", status: "approved", createdBy: "user-paolo-rinaldi", createdAt: daysAgo(19, 8) },
    { id: "proposal-orto-cold-chain", cooperativeId: "coop-orto-adriatico", title: "Rafforzamento catena del freddo per consegne costiere", description: "Accordo quadro per due navette refrigerate nei picchi di raccolta orticola e marketplace.", status: "open", createdBy: "user-anna-bassi", createdAt: daysAgo(5, 11) },
  ];

  const votes = [
    ["vote-1", "proposal-vigne-irrigation", "user-elena-bellini", "favor", daysAgo(11, 9, 15)],
    ["vote-2", "proposal-vigne-irrigation", "user-marco-tondini", "favor", daysAgo(10, 14)],
    ["vote-3", "proposal-vigne-irrigation", "user-lucia-giorgi", "favor", daysAgo(9, 8, 45)],
    ["vote-4", "proposal-vigne-irrigation", "user-simone-verdi", "against", daysAgo(8, 12, 10)],
    ["vote-5", "proposal-vigne-hub", "user-elena-bellini", "favor", daysAgo(31, 17, 10)],
    ["vote-6", "proposal-vigne-hub", "user-marco-tondini", "favor", daysAgo(31, 18, 22)],
    ["vote-7", "proposal-vigne-hub", "user-simone-verdi", "favor", daysAgo(30, 9, 4)],
    ["vote-8", "proposal-bio-carbon", "user-giacomo-rossi", "favor", daysAgo(27, 9, 25)],
    ["vote-9", "proposal-bio-carbon", "user-sara-monti", "favor", daysAgo(26, 16)],
    ["vote-10", "proposal-bio-carbon", "user-marta-neri", "favor", daysAgo(25, 10, 30)],
    ["vote-11", "proposal-bio-storage", "user-giacomo-rossi", "favor", daysAgo(6, 11)],
    ["vote-12", "proposal-bio-storage", "user-sara-monti", "against", daysAgo(5, 14, 12)],
    ["vote-13", "proposal-orto-weather", "user-paolo-rinaldi", "favor", daysAgo(18, 8, 30)],
    ["vote-14", "proposal-orto-weather", "user-anna-bassi", "favor", daysAgo(18, 12)],
    ["vote-15", "proposal-orto-weather", "user-lorenzo-ferri", "favor", daysAgo(17, 9, 50)],
    ["vote-16", "proposal-orto-cold-chain", "user-paolo-rinaldi", "favor", daysAgo(4, 11, 15)],
    ["vote-17", "proposal-orto-cold-chain", "user-anna-bassi", "favor", daysAgo(3, 15, 5)],
    ["vote-18", "proposal-orto-cold-chain", "user-lorenzo-ferri", "against", daysAgo(2, 9, 40)],
  ].map(([id, proposalId, userId, vote, timestamp]) => ({ id, proposalId, userId, vote, timestamp }));

  return {
    proposals: proposals.map((proposal) => ({
      ...proposal,
      votesFor: votes.filter((vote) => vote.proposalId === proposal.id && vote.vote === "favor").length,
      votesAgainst: votes.filter((vote) => vote.proposalId === proposal.id && vote.vote === "against").length,
    })),
    votes,
  };
}

function buildMarketplace() {
  const products = [
    ["market-oil-rio", "Olio EVO Brisighella DOP 0,5L", "olio", 14.5, "bottiglia", "farm-rio-del-solco", true],
    ["market-pesche-tondini", "Pesche gialle IGP cassette 5 kg", "frutta fresca", 16.9, "cassetta", "farm-tondini", false],
    ["market-nettarine-savio", "Nettarine bianche IGP 3 kg", "frutta fresca", 11.4, "cassetta", "farm-valle-savio", false],
    ["market-uve-san-vittore", "Uva Sangiovese premium", "uva da vino", 0.98, "kg", "farm-san-vittore", false],
    ["market-grano-ca-bianca", "Grano duro bio in big bag", "cereali", 0.56, "kg", "farm-ca-bianca", true],
    ["market-medica-bidente", "Balle di erba medica bio", "foraggere", 89, "balla", "farm-fattoria-bidente", true],
    ["market-pomodoro-santerno", "Pomodoro da salsa filiera Lugo", "orticole", 0.42, "kg", "farm-cascina-santerno", false],
    ["market-pomodoro-pineta", "Pomodoro fresco costa romagnola", "orticole", 1.35, "kg", "farm-pineta-verde", false],
    ["market-girasole-ca-bianca", "Seme di girasole alto oleico", "oleaginose", 0.73, "kg", "farm-ca-bianca", true],
    ["market-olio-bidente", "Olio EVO collina Bidente 0,75L", "olio", 12.8, "bottiglia", "farm-fattoria-bidente", true],
  ].map(([id, name, category, price, unit, farmId, organic]) => ({ id, name, category, price, unit, farmId, available: true, organic }));

  const buyers = ["user-davide-costa", "user-chiara-romani", "user-superadmin", "user-simone-verdi", "user-lorenzo-ferri"];
  const orders = Array.from({ length: 15 }, (_, index) => {
    const product = products[index % products.length]!;
    const quantity = round(product.unit === "kg" ? 180 + index * 15 : product.unit === "bottiglia" ? 12 + (index % 6) : 4 + (index % 3), 1);
    return {
      id: `order-market-${index + 1}`,
      productId: product.id,
      buyerId: buyers[index % buyers.length]!,
      quantity,
      totalPrice: round(quantity * product.price, 2),
      status: pick(["confirmed", "processing", "shipped", "delivered"], index),
      orderDate: daysAgo(22 - index, 10),
    };
  });

  return { products, orders };
}

const esgIndicators = cooperativeSeeds.flatMap((cooperative, index) => [
  { id: `esg-${cooperative.id}-renewable`, cooperativeId: cooperative.id, category: "environment", name: "Energia rinnovabile utilizzata", value: 34 + index * 11, unit: "%", period: "ultimi_6_mesi", target: 60 },
  { id: `esg-${cooperative.id}-certified`, cooperativeId: cooperative.id, category: "compliance", name: "Superficie certificata bio/DOP/IGP", value: 61 + index * 8, unit: "%", period: "campagna_corrente", target: 75 },
  { id: `esg-${cooperative.id}-water`, cooperativeId: cooperative.id, category: "resource_efficiency", name: "Efficienza irrigua", value: 2.8 + index * 0.3, unit: "kg/m3", period: "ultimi_6_mesi", target: 3.4 },
  { id: `esg-${cooperative.id}-safety`, cooperativeId: cooperative.id, category: "social", name: "Ore formazione sicurezza", value: 14 + index * 3, unit: "ore", period: "anno_corrente", target: 18 },
]);

const harvestDeclarations = fieldSeeds.map((field, index) => ({
  id: `harvest-${field.id}`,
  fieldId: field.id,
  estimatedDate: field.expectedHarvest,
  estimatedKg: round(field.expectedVolume * 1000, 0),
  actualKg: field.expectedHarvest.getTime() < now.getTime() ? round(field.expectedVolume * 970, 0) : undefined,
  status: field.expectedHarvest.getTime() < now.getTime() ? "completed" : index % 4 === 0 ? "confirmed" : "planned",
  quality: pick(["premium", "ottima", "commerciale_a"], index),
  notes: `Piano di raccolta predisposto per ${field.name}.`,
}));

const irrigationSchedules = fieldSeeds
  .filter((field) => !["grano", "girasole"].includes(field.cropType))
  .map((field, index) => ({
    id: `irrigation-${field.id}`,
    fieldId: field.id,
    method: field.irrigation,
    startDate: daysFromNow((index % 6) + 1, 2 + (index % 3)),
    endDate: daysFromNow((index % 6) + 1, 5 + (index % 3), 30),
    waterMm: round(8 + (index % 5) * 1.8 + (field.cropType === "pomodoro" ? 4 : 0), 1),
    status: index % 5 === 0 ? "in_progress" : "scheduled",
    frequency: field.cropType === "pomodoro" ? "48h" : field.cropType === "vite" ? "72h" : "96h",
  }));

const soilAnalyses = fieldSeeds.map((field, index) => ({
  id: `soil-${field.id}`,
  fieldId: field.id,
  date: daysAgo(25 + index, 9),
  ph: round(6.3 + (index % 6) * 0.2, 1),
  organicMatter: round(1.8 + (field.organic ? 0.8 : 0.2) + (index % 4) * 0.2, 1),
  nitrogen: round(38 + (index % 5) * 5.5, 1),
  phosphorus: round(24 + (index % 4) * 4.5, 1),
  potassium: round(165 + (index % 6) * 18, 1),
  texture: pick(["franco limoso", "franco argilloso", "franco sabbioso"], index),
  notes: field.organic ? "Buona attività biologica e struttura stabile." : "Integrazione mirata prevista prima della prossima fase fenologica.",
}));

const diseaseRisks = [
  ["risk-vite-peronospora", "Peronospora", "Vite", "medio-alto", "Forlì-Cesena", daysAgo(3, 7), ["Ripetere monitoraggio fogliare dopo il prossimo evento piovoso", "Mantenere chioma arieggiata nelle parcelle di fondovalle"]],
  ["risk-vite-oidio", "Oidio", "Vite", "medio", "Ravenna", daysAgo(5, 8), ["Verificare grappoli su impianti più vigorosi", "Programmare trattamento solo dove il rischio supera la soglia aziendale"]],
  ["risk-olivo-mosca", "Mosca olearia", "Olivo", "attenzione", "Brisighella", daysAgo(2, 9), ["Controllare trappole ogni 72 ore", "Mantenere copertura caolino nei lotti più esposti"]],
  ["risk-pomodoro-tuta", "Tuta absoluta", "Pomodoro", "alto", "Lugo-Ravenna", daysAgo(1, 6), ["Rafforzare cattura massale", "Eseguire sopralluogo serale sui campi più chiusi"]],
  ["risk-mais-piralide", "Piralide", "Mais", "medio", "Lugo", daysAgo(4, 8), ["Controllare prime ovature su bordure", "Confermare soglia con rilievo di campo entro 48 ore"]],
  ["risk-pesco-monilia", "Monilia", "Pesco", "medio", "Cesena-Bertinoro", daysAgo(6, 9), ["Rimuovere frutti lesionati", "Aumentare ventilazione nelle file più fitte"]],
  ["risk-grano-septoria", "Septoria", "Grano", "basso", "Faenza", daysAgo(8, 10), ["Monitoraggio passivo", "Valutare solo su appezzamenti tardivi"]],
].map(([id, disease, crop, riskLevel, region, detectedDate, recommendations]) => ({ id, disease, crop, riskLevel, region, detectedDate, recommendations }));

const sprayPrescriptions = [
  ["field-vigna-collina-sud", "Rame metallo 20%", "2.8 kg/ha", "approved"],
  ["field-vigna-argine-est", "Zolfo bagnabile micronizzato", "4 kg/ha", "approved"],
  ["field-pesco-fratta", "Bacillus subtilis", "2.5 L/ha", "draft"],
  ["field-pomodoro-malagola", "Bacillus thuringiensis", "1.2 kg/ha", "approved"],
  ["field-pomodoro-santerno", "Trappole feromoniche aggiuntive", "20/ha", "approved"],
  ["field-oliveto-rio", "Caolino micronizzato", "5 kg/ha", "planned"],
  ["field-mais-santerno", "Trichogramma brassicae", "10 capsule/ha", "approved"],
  ["field-olivo-bidente", "Caolino micronizzato", "4.5 kg/ha", "planned"],
].map(([fieldId, product, dosage, status], index) => ({
  id: `spray-${index + 1}`,
  fieldId,
  product,
  dosage,
  applicationDate: daysFromNow((index % 5) + 1, 6 + (index % 3)),
  status,
  operator: pick(["Lucia Giorgi", "Sara Monti", "Anna Bassi", "Marco Tondini"], index),
  weatherOk: index % 3 !== 0,
}));

const equipment = farmSeeds.flatMap((farm, index) => [
  { id: `equipment-${farm.id}-tractor`, name: `Trattore ${farm.location}`, type: "tractor", status: "operativo", farmId: farm.id, lastMaintenance: daysAgo(35 + index * 2, 8), nextMaintenance: daysFromNow(22 + index * 3, 8), hoursUsed: 620 + index * 74 },
  { id: `equipment-${farm.id}-${index % 2 === 0 ? "atomizer" : "irrigation"}`, name: index % 2 === 0 ? `Atomizzatore ${farm.location}` : `Centralina irrigua ${farm.location}`, type: index % 2 === 0 ? "sprayer" : "irrigation_controller", status: index % 4 === 0 ? "attenzione" : "operativo", farmId: farm.id, lastMaintenance: daysAgo(18 + index * 3, 9), nextMaintenance: daysFromNow(18 + index * 4, 9), hoursUsed: 190 + index * 26 },
]);

const maintenanceEvents = equipment.map((item, index) => ({
  id: `maintenance-${item.id}`,
  equipmentId: item.id,
  date: item.lastMaintenance ?? daysAgo(20),
  type: item.type === "tractor" ? "tagliando" : "controllo funzionale",
  description: item.type === "tractor" ? "Cambio filtri, verifica idraulica e check sicurezza." : "Taratura ugelli, test elettrovalvole e aggiornamento centralina.",
  cost: round(220 + index * 18, 2),
  technician: pick(["Officina Agrimec Faenza", "Service Romagna FieldTech", "Tecnico consortile"], index),
}));

const seasonalWorkers = [
  ["worker-vigne-1", "Nicola Serra", "potatore specializzato", "coop-vigne-romagna", daysAgo(120, 7), daysFromNow(50, 18), "active", ["sicurezza_base", "lavori_in_quota"]],
  ["worker-vigne-2", "Alessia Marini", "caposquadra raccolta", "coop-vigne-romagna", daysAgo(95, 7), daysFromNow(65, 18), "active", ["primo_soccorso", "uso_trattore"]],
  ["worker-bio-1", "Youssef El Amrani", "operatore cerealicolo", "coop-terre-faentine", daysAgo(110, 7), daysFromNow(40, 18), "active", ["sicurezza_base"]],
  ["worker-bio-2", "Marta Righi", "addetta qualità campi bio", "coop-terre-faentine", daysAgo(140, 7), daysFromNow(55, 18), "active", ["haccp", "audit_interno"]],
  ["worker-orto-1", "Goran Petrovic", "operatore irrigazione", "coop-orto-adriatico", daysAgo(130, 7), daysFromNow(70, 18), "active", ["sicurezza_base", "spazi_confinati"]],
  ["worker-orto-2", "Ilenia Casadei", "coordinatrice raccolta orticole", "coop-orto-adriatico", daysAgo(88, 7), daysFromNow(60, 18), "active", ["primo_soccorso", "carrelli_elevatori"]],
].map(([id, name, role, cooperativeId, startDate, endDate, status, certifications]) => ({ id, name, role, cooperativeId, startDate, endDate, status, certifications }));

const shiftFields = ["field-vigna-collina-sud", "field-pesco-fratta", "field-girasole-ca-bianca", "field-oliveto-rio", "field-pomodoro-santerno", "field-pomodoro-pineta"];
const workShifts = seasonalWorkers.flatMap((worker, index) => [0, 1].map((step) => ({
  id: `shift-${worker.id}-${step + 1}`,
  workerId: worker.id,
  date: daysAgo(6 - step, 6),
  startTime: daysAgo(6 - step, 6, 30),
  endTime: daysAgo(6 - step, 13 + step),
  fieldId: shiftFields[(index + step) % shiftFields.length]!,
  task: pick(["Monitoraggio fitosanitario e rilievo vigore", "Preparazione raccolta e controllo maturazione", "Manutenzione ali gocciolanti", "Verifica lotti pronti al conferimento"], index + step),
  hoursWorked: 6.5 + step,
})));

const insurancePolicies = farmSeeds.map((farm, index) => ({
  id: `insurance-${farm.id}`,
  farmId: farm.id,
  type: pick(["grandine", "multirischio", "parametrica_siccita"], index),
  provider: pick(["Generali Italia", "UnipolSai Agro", "VH Italia Agrisafe"], index),
  coverageAmount: round(85000 + farm.hectares * 2200, 2),
  premium: round(3200 + farm.hectares * 74, 2),
  startDate: monthPoint(5, 1, 0),
  endDate: daysFromNow(170, 0),
  status: index % 4 === 0 ? "quoted" : "active",
}));

const communicationChannels = cooperativeSeeds.flatMap((cooperative) => [
  { id: `channel-${cooperative.id}-meteo`, name: `${cooperative.name} · Meteo e allerte`, type: "broadcast", cooperativeId: cooperative.id, memberCount: cooperative.memberCount },
  { id: `channel-${cooperative.id}-assemblea`, name: `${cooperative.name} · Assemblea soci`, type: "discussion", cooperativeId: cooperative.id, memberCount: cooperative.memberCount },
]);

const messages = [
  ["message-1", "channel-coop-vigne-romagna-meteo", "user-lucia-giorgi", "Previste raffiche fino a 28 km/h su Bertinoro dalle 17:00. Anticipare eventuali trattamenti sui vigneti esposti.", daysAgo(0, 7, 35), ["user-elena-bellini", "user-marco-tondini", "user-simone-verdi"]],
  ["message-2", "channel-coop-vigne-romagna-assemblea", "user-elena-bellini", "Ordine del giorno confermato per lunedì: irrigazione di precisione, linea pesche premium e budget sensori 2025.", daysAgo(1, 18, 20), ["user-marco-tondini", "user-lucia-giorgi"]],
  ["message-3", "channel-coop-terre-faentine-meteo", "user-giacomo-rossi", "Accumulo pioggia previsto 14 mm tra Faenza e Brisighella. Sospendere i turni irrigui sulle mediche per 48 ore.", daysAgo(0, 6, 50), ["user-sara-monti", "user-marta-neri"]],
  ["message-4", "channel-coop-terre-faentine-assemblea", "user-sara-monti", "Caricata la proposta sul nuovo silo bio: allegato business case e confronto costi/benefici.", daysAgo(3, 13, 10), ["user-giacomo-rossi", "user-marta-neri"]],
  ["message-5", "channel-coop-orto-adriatico-meteo", "user-paolo-rinaldi", "Allerta tuta absoluta alta su Lugo e Ravenna: verificare trappole e monitoraggi serali fino a venerdì.", daysAgo(0, 8, 5), ["user-anna-bassi", "user-lorenzo-ferri"]],
  ["message-6", "channel-coop-orto-adriatico-assemblea", "user-anna-bassi", "Domani test nuova procedura cold-chain sulle consegne marketplace: partenza navetta alle 05:45 da Ravenna.", daysAgo(2, 17, 40), ["user-paolo-rinaldi", "user-lorenzo-ferri"]],
].map(([id, channelId, senderId, content, timestamp, readBy]) => ({ id, channelId, senderId, content, timestamp, readBy }));

const farmBenchmarks = farmSeeds.map((farm, index) => ({
  id: `benchmark-${farm.id}`,
  farmId: farm.id,
  period: "ultimi_6_mesi",
  yieldPerHa: round(5.6 + index * 0.45, 2),
  costPerHa: round(1160 + index * 80, 2),
  waterEfficiency: round(2.1 + (index % 4) * 0.35, 2),
  carbonPerHa: round(182 - index * 9, 2),
  overallScore: round(73 + index * 2.4, 1),
}));

const yieldPredictions = fieldSeeds.map((field, index) => ({
  id: `prediction-${field.id}`,
  fieldId: field.id,
  crop: field.crop,
  predictedYield: round(field.expectedVolume * (0.95 + (index % 4) * 0.03), 2),
  confidenceLow: round(field.expectedVolume * 0.86, 2),
  confidenceHigh: round(field.expectedVolume * 1.08, 2),
  predictionDate: daysAgo(2 + (index % 4), 5),
  factors: {
    ndvi: round(0.52 + (index % 5) * 0.04, 2),
    soilMoisture: sensorBase(field, "soil_moisture") + (index % 3),
    rainfall7d: 4 + (index % 6) * 3,
    degreeDays: 120 + index * 8,
    pestPressure: pick(["bassa", "media", "monitorata"], index),
  },
}));

const regulatoryUpdates = [
  { id: "regulation-1", title: "Aggiornamento disciplinari SQNPI Emilia-Romagna", source: "Regione Emilia-Romagna", category: "disciplinari", publishDate: daysAgo(30, 9), effectiveDate: daysAgo(10, 0), summary: "Aggiornati i limiti di intervento su vite e pomodoro da industria con nuove soglie di monitoraggio.", impact: "Richiede riallineamento dei piani di campo e dei registri trattamenti.", url: "https://agricoltura.regione.emilia-romagna.it/disciplinari-sqnpi" },
  { id: "regulation-2", title: "Nuovo bando investimenti irrigui 4.0", source: "PSR Emilia-Romagna", category: "finanziamenti", publishDate: daysAgo(18, 10), effectiveDate: daysAgo(5, 0), summary: "Contributi per sensori, elettrovalvole e piattaforme di monitoraggio dei consumi idrici.", impact: "Opportunità diretta per le tre cooperative e i piani di investimento 2025.", url: "https://agrea.regione.emilia-romagna.it/bandi/irrigazione-4-0" },
  { id: "regulation-3", title: "Linee guida nazionali crediti carbonio in agricoltura", source: "Ministero dell'Agricoltura", category: "sostenibilita", publishDate: daysAgo(12, 11), effectiveDate: daysFromNow(15, 0), summary: "Definiti standard minimi di monitoraggio per pratiche conservative e sequestro in suolo.", impact: "Influenza i progetti carbon farming di Terre Faentine Bio.", url: "https://masaf.gov.it/carbon-farming-linee-guida" },
];

const simulationScenarios = [
  { id: "scenario-vite-water", name: "Riduzione irrigua 15% su Vigna Collina Sud", fieldId: "field-vigna-collina-sud", type: "irrigation_optimization", parameters: { reductionPercent: 15, baselineMm: 42, horizonDays: 30 }, results: { predictedYieldDelta: -2.1, savingsM3: 184, qualityRisk: "basso" }, createdAt: daysAgo(4, 15), createdBy: "user-lucia-giorgi" },
  { id: "scenario-pomodoro-heat", name: "Stress termico su Pomodoro Santerno Sud", fieldId: "field-pomodoro-santerno", type: "weather_event", parameters: { maxTemperature: 36, durationDays: 4, alertSource: "stazione_meteo" }, results: { yieldDelta: -6.4, irrigationBoostMm: 9, harvestAdvanceDays: 3 }, createdAt: daysAgo(3, 17), createdBy: "user-paolo-rinaldi" },
  { id: "scenario-grano-carbon", name: "Scenario semina su sodo Grano Cà Bianca", fieldId: "field-grano-ca-bianca", type: "carbon_farming", parameters: { tillage: "no_till", residueRetention: true, horizonMonths: 6 }, results: { dieselReductionPercent: 18, co2KgDelta: -420, marginDelta: 740 }, createdAt: daysAgo(6, 11), createdBy: "user-sara-monti" },
  { id: "scenario-pesco-logistics", name: "Raccolta anticipata Pesche San Mamante", fieldId: "field-pesco-san-mamante", type: "logistics", parameters: { harvestAdvanceDays: 2, destination: "hub_forli", packagingTeam: 2 }, results: { shelfLifeGainDays: 1.5, wasteReductionPercent: 8.2 }, createdAt: daysAgo(2, 14), createdBy: "user-marco-tondini" },
];

async function seed() {
  await clearDatabase();

  await prisma.cooperative.createMany({ data: cooperativeSeeds.map(({ adminUserId: _adminUserId, ...cooperative }) => cooperative) });
  await prisma.farm.createMany({ data: farmSeeds });
  await prisma.field.createMany({
    data: fieldSeeds.map(({ cropType: _cropType, variety: _variety, organic: _organic, certifications: _certifications, cooperativeId: _cooperativeId, plantingDaysAgo: _plantingDaysAgo, harvestInDays: _harvestInDays, ...field }) => field),
  });
  await prisma.user.createMany({ data: userSeeds });

  for (const cooperative of cooperativeSeeds) {
    await prisma.cooperative.update({ where: { id: cooperative.id }, data: { adminUserId: cooperative.adminUserId } });
  }

  const { records, events } = buildCompliance();
  const { lots, traceabilityEvents, supplyChainLots } = buildLots();
  const { devices, readings } = buildSensors();
  const { costEntries, revenueEntries, carbonEntries } = buildFinance();
  const { proposals, votes } = buildGovernance();
  const { products, orders } = buildMarketplace();

  await prisma.complianceRecord.createMany({ data: records });
  await prisma.complianceEvent.createMany({ data: events });
  await prisma.productLot.createMany({ data: lots });
  await prisma.traceabilityEvent.createMany({ data: traceabilityEvents });
  await prisma.sensorDevice.createMany({ data: devices });
  await prisma.sensorReading.createMany({ data: readings });
  await prisma.nDVIReading.createMany({ data: buildNdvi() });
  await prisma.costEntry.createMany({ data: costEntries });
  await prisma.revenueEntry.createMany({ data: revenueEntries });
  await prisma.carbonEntry.createMany({ data: carbonEntries });
  await prisma.eSGIndicator.createMany({ data: esgIndicators });
  await prisma.harvestDeclaration.createMany({ data: harvestDeclarations });
  await prisma.supplyChainLot.createMany({ data: supplyChainLots });
  await prisma.irrigationSchedule.createMany({ data: irrigationSchedules });
  await prisma.soilAnalysis.createMany({ data: soilAnalyses });
  await prisma.diseaseRisk.createMany({ data: diseaseRisks });
  await prisma.sprayPrescription.createMany({ data: sprayPrescriptions });
  await prisma.equipment.createMany({ data: equipment });
  await prisma.maintenanceEvent.createMany({ data: maintenanceEvents });
  await prisma.seasonalWorker.createMany({ data: seasonalWorkers });
  await prisma.workShift.createMany({ data: workShifts });
  await prisma.proposal.createMany({ data: proposals });
  await prisma.vote.createMany({ data: votes });
  await prisma.marketplaceProduct.createMany({ data: products });
  await prisma.order.createMany({ data: orders });
  await prisma.insurancePolicy.createMany({ data: insurancePolicies });
  await prisma.communicationChannel.createMany({ data: communicationChannels });
  await prisma.message.createMany({ data: messages });
  await prisma.farmBenchmark.createMany({ data: farmBenchmarks });
  await prisma.yieldPrediction.createMany({ data: yieldPredictions });
  await prisma.regulatoryUpdate.createMany({ data: regulatoryUpdates });
  await prisma.simulationScenario.createMany({ data: simulationScenarios });

  const [cooperatives, users, farms, fieldsCount, sensors, readingsCount] = await prisma.$transaction([
    prisma.cooperative.count(),
    prisma.user.count(),
    prisma.farm.count(),
    prisma.field.count(),
    prisma.sensorDevice.count(),
    prisma.sensorReading.count(),
  ]);

  console.log(`Seeded ${cooperatives} cooperatives, ${users} users, ${farms} farms, ${fieldsCount} fields, ${sensors} sensors and ${readingsCount} IoT readings.`);
}

seed()
  .catch((error) => {
    console.error("Error seeding agri-romagna demo data", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
