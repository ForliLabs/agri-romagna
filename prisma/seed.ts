import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

import { PrismaClient } from "../src/generated/prisma";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

const date = (value: string) => new Date(value);

async function clearDatabase() {
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
  await prisma.field.deleteMany();
  await prisma.farm.deleteMany();
  await prisma.cooperative.deleteMany();
  await prisma.user.deleteMany();
}

async function seed() {
  await clearDatabase();

  const cooperativeId = "coop-romagna-unita";
  const farmIds = {
    tondini: "azienda-tondini",
    sanVittore: "podere-san-vittore",
    fratta: "tenuta-fratta",
    caBianca: "azienda-ca-bianca",
  };

  const fieldIds = {
    vignaCollinaSud: "vigna-collina-sud",
    vignaArgineEst: "vigna-argine-est",
    fruttetoSanMamante: "frutteto-san-mamante",
    seminativoZampeschi: "seminativo-via-zampeschi",
    vignaSanVittore: "vigna-san-vittore",
    ulivetoRonco: "uliveto-ronco",
    susinetoFratta: "susineto-la-fratta",
    albicoccheFratta: "albicocche-colli-fratta",
    medicaBianca: "medica-ovest-bianca",
    granoBianca: "grano-nuovo-bianca",
  };

  await prisma.cooperative.create({
    data: {
      id: cooperativeId,
      name: "Cooperativa Romagna Unita",
      region: "Emilia-Romagna",
      province: "Forlì-Cesena",
      memberCount: 4,
      plan: "cooperativa",
    },
  });

  await prisma.farm.createMany({
    data: [
      {
        id: farmIds.tondini,
        name: "Azienda Agricola Tondini",
        location: "Bertinoro",
        province: "Forlì-Cesena",
        hectares: 12,
        specialty: "Vigneti romagnoli, frutta estiva e cereali",
        cooperativeId,
      },
      {
        id: farmIds.sanVittore,
        name: "Podere San Vittore",
        location: "Forlimpopoli",
        province: "Forlì-Cesena",
        hectares: 9.4,
        specialty: "Viticoltura collinare e olivicoltura",
        cooperativeId,
      },
      {
        id: farmIds.fratta,
        name: "Tenuta La Fratta",
        location: "Cesena",
        province: "Forlì-Cesena",
        hectares: 14.2,
        specialty: "Frutticoltura specializzata",
        cooperativeId,
      },
      {
        id: farmIds.caBianca,
        name: "Azienda Cà Bianca",
        location: "Faenza",
        province: "Ravenna",
        hectares: 22.8,
        specialty: "Cereali, proteiche e foraggere",
        cooperativeId,
      },
    ],
  });

  await prisma.field.createMany({
    data: [
      {
        id: fieldIds.vignaCollinaSud,
        name: "Vigna Collina Sud",
        crop: "Sangiovese",
        areaHa: 3.5,
        status: "Invaiatura avanzata",
        plantingDate: date("2021-03-18"),
        municipality: "Bertinoro",
        expectedHarvest: date("2026-09-12"),
        expectedVolume: 28,
        health: "Vigore alto, chioma uniforme",
        irrigation: "A goccia · turnazione 48h",
        notes: "Controllo oidio completato, acidità in equilibrio.",
        farmId: farmIds.tondini,
      },
      {
        id: fieldIds.vignaArgineEst,
        name: "Vigna Argine Est",
        crop: "Albana",
        areaHa: 2,
        status: "Fioritura stabile",
        plantingDate: date("2020-04-09"),
        municipality: "Bertinoro",
        expectedHarvest: date("2026-08-29"),
        expectedVolume: 15,
        health: "Buona allegagione, umidità sotto controllo",
        irrigation: "Sensori suolo attivi · 22% VWC",
        notes: "Programmare sfogliatura lato monte entro 5 giorni.",
        farmId: farmIds.tondini,
      },
      {
        id: fieldIds.fruttetoSanMamante,
        name: "Frutteto San Mamante",
        crop: "Pesche",
        areaHa: 1.5,
        status: "Maturazione in corso",
        plantingDate: date("2022-02-10"),
        municipality: "Bertinoro",
        expectedHarvest: date("2026-06-18"),
        expectedVolume: 11,
        health: "Calibro omogeneo, stress idrico assente",
        irrigation: "A manichetta · ultimo ciclo ieri",
        notes: "Lotto destinato in parte a vendita diretta in cascina.",
        farmId: farmIds.tondini,
      },
      {
        id: fieldIds.seminativoZampeschi,
        name: "Seminativo Via Zampeschi",
        crop: "Grano tenero",
        areaHa: 5,
        status: "Granigione",
        plantingDate: date("2025-11-08"),
        municipality: "Bertinoro",
        expectedHarvest: date("2026-07-06"),
        expectedVolume: 34,
        health: "Copertura uniforme, pressione infestanti bassa",
        irrigation: "Non irrigato · monitoraggio rugiada",
        notes: "Proteina stimata 12,6%, finestra di trebbiatura in definizione.",
        farmId: farmIds.tondini,
      },
      {
        id: fieldIds.vignaSanVittore,
        name: "Vigna San Vittore",
        crop: "Sangiovese",
        areaHa: 3.2,
        status: "Pre-invaiatura",
        plantingDate: date("2019-03-28"),
        municipality: "Forlimpopoli",
        expectedHarvest: date("2026-09-08"),
        expectedVolume: 24,
        health: "Foglia sana e sviluppo omogeneo",
        irrigation: "Microirrigazione di supporto",
        notes: "Parcella destinata alla linea cooperativa premium.",
        farmId: farmIds.sanVittore,
      },
      {
        id: fieldIds.ulivetoRonco,
        name: "Uliveto Ronco",
        crop: "Olivo",
        areaHa: 2.4,
        status: "Allegagione",
        plantingDate: date("2018-04-02"),
        municipality: "Forlimpopoli",
        expectedHarvest: date("2026-10-20"),
        expectedVolume: 8,
        health: "Buona carica produttiva",
        irrigation: "Deficit irrigation controllata",
        notes: "Monitorare mosca olearia a inizio estate.",
        farmId: farmIds.sanVittore,
      },
      {
        id: fieldIds.susinetoFratta,
        name: "Susineto La Fratta",
        crop: "Susine",
        areaHa: 2.8,
        status: "Accrescimento frutto",
        plantingDate: date("2021-02-22"),
        municipality: "Cesena",
        expectedHarvest: date("2026-07-10"),
        expectedVolume: 18,
        health: "Frutti omogenei, bassa pressione parassitaria",
        irrigation: "Microjet con sensori tensiometrici",
        notes: "Lotto destinato a GDO e mercati locali.",
        farmId: farmIds.fratta,
      },
      {
        id: fieldIds.albicoccheFratta,
        name: "Albicocche Colli Fratta",
        crop: "Albicocche",
        areaHa: 1.9,
        status: "Pre-raccolta",
        plantingDate: date("2020-02-15"),
        municipality: "Cesena",
        expectedHarvest: date("2026-06-12"),
        expectedVolume: 10,
        health: "Maturazione uniforme",
        irrigation: "Goccia con fertirrigazione",
        notes: "Verificare finestra raccolta per canale horeca.",
        farmId: farmIds.fratta,
      },
      {
        id: fieldIds.medicaBianca,
        name: "Medica Ovest",
        crop: "Erba medica",
        areaHa: 4.5,
        status: "Ricaccio vegetativo",
        plantingDate: date("2024-03-12"),
        municipality: "Faenza",
        expectedHarvest: date("2026-06-28"),
        expectedVolume: 22,
        health: "Cotico fitto e uniforme",
        irrigation: "Piovana di soccorso",
        notes: "Campo utile per carbon farming e rotazione.",
        farmId: farmIds.caBianca,
      },
      {
        id: fieldIds.granoBianca,
        name: "Grano Nuovo Bianca",
        crop: "Grano duro",
        areaHa: 6.1,
        status: "Levata avanzata",
        plantingDate: date("2025-11-02"),
        municipality: "Faenza",
        expectedHarvest: date("2026-07-03"),
        expectedVolume: 41,
        health: "Buona densità, basso stress",
        irrigation: "Secco",
        notes: "Prevista destinazione a filiera pasta regionale.",
        farmId: farmIds.caBianca,
      },
    ],
  });

  await prisma.user.createMany({
    data: [
      {
        id: "user-tondini",
        email: "marco@tondini.farm",
        name: "Marco Tondini",
        passwordHash: "$2b$12$demoMarcoTondiniHash0000000000000000000000000",
        role: "coop_admin",
        cooperativeId,
        farmId: farmIds.tondini,
        phone: "+39 347 123 4567",
        avatarInitials: "MT",
        isActive: true,
      },
      {
        id: "user-rossi",
        email: "giulia@sanvittore.it",
        name: "Giulia Rossi",
        passwordHash: "$2b$12$demoGiuliaRossiHash0000000000000000000000000",
        role: "member",
        cooperativeId,
        farmId: farmIds.sanVittore,
        phone: "+39 348 234 5678",
        avatarInitials: "GR",
        isActive: true,
      },
      {
        id: "user-bianchi",
        email: "luca@lafratta.it",
        name: "Luca Bianchi",
        passwordHash: "$2b$12$demoLucaBianchiHash0000000000000000000000000",
        role: "farmer",
        cooperativeId,
        farmId: farmIds.fratta,
        phone: "+39 349 345 6789",
        avatarInitials: "LB",
        isActive: true,
      },
      {
        id: "user-verdi",
        email: "anna@cabianca.farm",
        name: "Anna Verdi",
        passwordHash: "$2b$12$demoAnnaVerdiHash00000000000000000000000000",
        role: "member",
        cooperativeId,
        farmId: farmIds.caBianca,
        phone: "+39 350 456 7890",
        avatarInitials: "AV",
        isActive: true,
      },
    ],
  });

  await prisma.cooperative.update({
    where: { id: cooperativeId },
    data: { adminUserId: "user-tondini" },
  });

  await prisma.complianceRecord.createMany({
    data: [
      {
        id: "comp-pac-2026",
        fieldId: fieldIds.seminativoZampeschi,
        type: "cap",
        status: "in_corso",
        title: "Dichiarazione PAC 2026 — Seminativo",
        description: "Dichiarazione superfici per grano tenero con misura di greening.",
        dueDate: date("2026-05-15"),
        documents: ["Visura catastale", "Piano colturale"],
        agencyRef: "AGEA-FC-2026-0847",
      },
      {
        id: "comp-bio-vigna",
        fieldId: fieldIds.vignaCollinaSud,
        type: "organic",
        status: "conforme",
        title: "Certificazione biologica — Vigna Collina Sud",
        description: "Quaderno di campagna e registrazione trattamenti bio.",
        dueDate: date("2026-12-31"),
        completedDate: date("2026-03-15"),
        documents: ["Quaderno di campo", "Registro trattamenti bio", "Certificato ICEA"],
        agencyRef: "ICEA-IT-BIO-2026-1234",
      },
      {
        id: "comp-dop-albana",
        fieldId: fieldIds.vignaArgineEst,
        type: "dop",
        status: "in_corso",
        title: "DOP Albana di Romagna — Documentazione vendemmia",
        description: "Resa per ettaro e grado zuccherino minimo per DOCG.",
        dueDate: date("2026-09-30"),
        documents: ["Registro vendemmia DOP", "Analisi enologica"],
      },
      {
        id: "comp-igp-pesche",
        fieldId: fieldIds.fruttetoSanMamante,
        type: "igp",
        status: "da_completare",
        title: "Pesca di Romagna IGP — Registri di filiera",
        description: "Preparazione documenti di tracciabilità e disciplinare prodotto.",
        dueDate: date("2026-06-30"),
        documents: ["Registro raccolta", "Tracciabilità lotti", "Analisi residui"],
        agencyRef: "IGP-ROM-2026-441",
      },
    ],
  });

  await prisma.complianceEvent.createMany({
    data: [
      {
        id: "evt-1",
        recordId: "comp-bio-vigna",
        fieldId: fieldIds.vignaCollinaSud,
        type: "trattamento",
        date: date("2026-04-22T08:00:00+02:00"),
        description: "Trattamento rameico preventivo anti-peronospora",
        operator: "Marco Tondini",
        product: "Poltiglia bordolese (20% Cu)",
        quantity: "3.2 kg/ha",
        notes: "Applicazione al mattino con umidità 72%.",
        verified: true,
      },
      {
        id: "evt-2",
        recordId: "comp-bio-vigna",
        fieldId: fieldIds.vignaCollinaSud,
        type: "ispezione",
        date: date("2026-03-15T10:30:00+02:00"),
        description: "Audit annuale ICEA completato senza non conformità",
        operator: "Dott.ssa Ferri",
        notes: "Documentazione completa e aggiornata.",
        verified: true,
      },
      {
        id: "evt-3",
        recordId: "comp-pac-2026",
        fieldId: fieldIds.seminativoZampeschi,
        type: "dichiarazione_pac",
        date: date("2026-04-28T09:00:00+02:00"),
        description: "Compilazione fascicolo aziendale per PAC 2026",
        operator: "Marco Tondini",
        notes: "In attesa conferma AGEA per protocollo definitivo.",
        verified: false,
      },
      {
        id: "evt-4",
        recordId: "comp-dop-albana",
        fieldId: fieldIds.vignaArgineEst,
        type: "analisi",
        date: date("2026-05-10T07:45:00+02:00"),
        description: "Prelievo campioni per analisi pre-vendemmia",
        operator: "Giulia Rossi",
        notes: "Campioni inviati al laboratorio CRPV.",
        verified: true,
      },
    ],
  });

  await prisma.productLot.createMany({
    data: [
      {
        id: "lot-sangiovese-2026-a",
        product: "Uva Sangiovese",
        variety: "Sangiovese di Romagna",
        harvestDate: date("2026-09-12"),
        fieldId: fieldIds.vignaCollinaSud,
        quantity: 4200,
        unit: "kg",
        status: "quality_checked",
        certifications: ["Biologico certificato ICEA"],
      },
      {
        id: "lot-albana-2026-a",
        product: "Uva Albana",
        variety: "Albana di Romagna DOCG",
        harvestDate: date("2026-08-29"),
        fieldId: fieldIds.vignaArgineEst,
        quantity: 2700,
        unit: "kg",
        status: "routed",
        certifications: ["DOCG Romagna", "Filiera cooperativa"],
      },
      {
        id: "lot-pesche-2026-a",
        product: "Pesche",
        variety: "Pesca di Romagna IGP",
        harvestDate: date("2026-06-18"),
        fieldId: fieldIds.fruttetoSanMamante,
        quantity: 1800,
        unit: "kg",
        status: "listed",
        certifications: ["Controllo residui superato"],
      },
      {
        id: "lot-grano-2026-a",
        product: "Grano tenero",
        variety: "Grano tenero romagnolo",
        harvestDate: date("2026-07-06"),
        fieldId: fieldIds.seminativoZampeschi,
        quantity: 34000,
        unit: "kg",
        status: "received",
        certifications: ["Filiera cereali Emilia-Romagna"],
      },
    ],
  });

  await prisma.traceabilityEvent.createMany({
    data: [
      {
        id: "evt-sgv-1",
        lotId: "lot-sangiovese-2026-a",
        type: "campo",
        timestamp: date("2026-04-22T08:00:00+02:00"),
        location: "Vigna Collina Sud, Bertinoro",
        operator: "Marco Tondini",
        details: "Trattamento rameico preventivo e registrazione biologica completata.",
        verified: true,
      },
      {
        id: "evt-sgv-2",
        lotId: "lot-sangiovese-2026-a",
        type: "raccolta",
        timestamp: date("2026-09-12T05:30:00+02:00"),
        location: "Vigna Collina Sud, Bertinoro",
        operator: "Squadra Cantina",
        details: "Vendemmia manuale in cassette da 18 kg.",
        verified: true,
      },
      {
        id: "evt-sgv-3",
        lotId: "lot-sangiovese-2026-a",
        type: "lavorazione",
        timestamp: date("2026-09-12T14:00:00+02:00"),
        location: "Cantina Sociale Bertinoro",
        operator: "Enologo cooperativa",
        details: "Diraspatura e pigiatura entro 3 ore dalla raccolta.",
        verified: true,
      },
      {
        id: "evt-psc-1",
        lotId: "lot-pesche-2026-a",
        type: "raccolta",
        timestamp: date("2026-06-18T05:30:00+02:00"),
        location: "Frutteto San Mamante, Bertinoro",
        operator: "Squadra Alba",
        details: "Raccolta mattutina con prima cernita in campo.",
        verified: true,
      },
      {
        id: "evt-psc-2",
        lotId: "lot-pesche-2026-a",
        type: "distribuzione",
        timestamp: date("2026-06-18T14:00:00+02:00"),
        location: "Mercato Forlì / GDO",
        operator: "Autista consegne",
        details: "Consegna mercato locale e GDO regionale.",
        verified: true,
      },
      {
        id: "evt-grano-1",
        lotId: "lot-grano-2026-a",
        type: "trasporto",
        timestamp: date("2026-07-06T12:00:00+02:00"),
        location: "Molino partner Forlimpopoli",
        operator: "Logistica cooperativa",
        details: "Conferimento immediato al molino con documento di pesatura.",
        verified: true,
      },
    ],
  });

  await prisma.sensorDevice.createMany({
    data: [
      {
        id: "sensor-soil-vcs",
        name: "Sonda suolo #1 — Vigna Collina Sud",
        type: "soil_moisture",
        fieldId: fieldIds.vignaCollinaSud,
        status: "online",
        lastReading: date("2026-05-13T08:25:00+02:00"),
        batteryLevel: 78,
        firmware: "v2.1.4",
      },
      {
        id: "sensor-temp-vcs",
        name: "Termometro aria — Vigna Collina Sud",
        type: "temperature",
        fieldId: fieldIds.vignaCollinaSud,
        status: "online",
        lastReading: date("2026-05-13T08:28:00+02:00"),
        batteryLevel: 85,
        firmware: "v2.1.4",
      },
      {
        id: "sensor-soil-vae",
        name: "Sonda suolo #2 — Vigna Argine Est",
        type: "soil_moisture",
        fieldId: fieldIds.vignaArgineEst,
        status: "online",
        lastReading: date("2026-05-13T08:20:00+02:00"),
        batteryLevel: 62,
        firmware: "v2.1.3",
      },
      {
        id: "sensor-rain-farm",
        name: "Pluviometro — Stazione aziendale",
        type: "rain_gauge",
        fieldId: fieldIds.vignaCollinaSud,
        status: "online",
        lastReading: date("2026-05-13T08:30:00+02:00"),
        batteryLevel: 100,
        firmware: "v3.0.1",
      },
      {
        id: "sensor-flow-fsm",
        name: "Flussimetro irrigazione — Frutteto",
        type: "irrigation_flow",
        fieldId: fieldIds.fruttetoSanMamante,
        status: "warning",
        lastReading: date("2026-05-13T07:45:00+02:00"),
        batteryLevel: 18,
        firmware: "v1.5.0",
      },
    ],
  });

  await prisma.sensorReading.createMany({
    data: [
      { id: "reading-soil-vcs-1", sensorId: "sensor-soil-vcs", timestamp: date("2026-05-13T06:30:00+02:00"), value: 21.7, unit: "% VWC", quality: "good" },
      { id: "reading-soil-vcs-2", sensorId: "sensor-soil-vcs", timestamp: date("2026-05-13T07:30:00+02:00"), value: 22.1, unit: "% VWC", quality: "good" },
      { id: "reading-soil-vcs-3", sensorId: "sensor-soil-vcs", timestamp: date("2026-05-13T08:25:00+02:00"), value: 22.4, unit: "% VWC", quality: "good" },
      { id: "reading-temp-vcs-1", sensorId: "sensor-temp-vcs", timestamp: date("2026-05-13T06:30:00+02:00"), value: 18.9, unit: "°C", quality: "good" },
      { id: "reading-temp-vcs-2", sensorId: "sensor-temp-vcs", timestamp: date("2026-05-13T07:30:00+02:00"), value: 19.8, unit: "°C", quality: "good" },
      { id: "reading-temp-vcs-3", sensorId: "sensor-temp-vcs", timestamp: date("2026-05-13T08:28:00+02:00"), value: 20.6, unit: "°C", quality: "good" },
      { id: "reading-soil-vae-1", sensorId: "sensor-soil-vae", timestamp: date("2026-05-13T06:00:00+02:00"), value: 18.2, unit: "% VWC", quality: "good" },
      { id: "reading-soil-vae-2", sensorId: "sensor-soil-vae", timestamp: date("2026-05-13T07:00:00+02:00"), value: 18.9, unit: "% VWC", quality: "good" },
      { id: "reading-soil-vae-3", sensorId: "sensor-soil-vae", timestamp: date("2026-05-13T08:20:00+02:00"), value: 19.4, unit: "% VWC", quality: "good" },
      { id: "reading-rain-1", sensorId: "sensor-rain-farm", timestamp: date("2026-05-13T08:30:00+02:00"), value: 0.6, unit: "mm", quality: "good" },
      { id: "reading-flow-1", sensorId: "sensor-flow-fsm", timestamp: date("2026-05-13T06:45:00+02:00"), value: 2.1, unit: "L/min", quality: "warning" },
      { id: "reading-flow-2", sensorId: "sensor-flow-fsm", timestamp: date("2026-05-13T07:45:00+02:00"), value: 1.8, unit: "L/min", quality: "warning" },
    ],
  });

  await prisma.nDVIReading.createMany({
    data: [
      { id: "ndvi-vcs-1", fieldId: fieldIds.vignaCollinaSud, date: date("2026-03-15"), ndviValue: 0.32, healthStatus: "moderato", cloudCover: 15, satellite: "sentinel-2" },
      { id: "ndvi-vcs-2", fieldId: fieldIds.vignaCollinaSud, date: date("2026-05-13"), ndviValue: 0.74, healthStatus: "ottimo", cloudCover: 20, satellite: "sentinel-2" },
      { id: "ndvi-vae-1", fieldId: fieldIds.vignaArgineEst, date: date("2026-03-15"), ndviValue: 0.28, healthStatus: "stress", cloudCover: 15, satellite: "sentinel-2" },
      { id: "ndvi-vae-2", fieldId: fieldIds.vignaArgineEst, date: date("2026-05-13"), ndviValue: 0.61, healthStatus: "buono", cloudCover: 18, satellite: "sentinel-2" },
      { id: "ndvi-fsm-1", fieldId: fieldIds.fruttetoSanMamante, date: date("2026-04-16"), ndviValue: 0.62, healthStatus: "buono", cloudCover: 6, satellite: "sentinel-2" },
      { id: "ndvi-fsm-2", fieldId: fieldIds.fruttetoSanMamante, date: date("2026-05-13"), ndviValue: 0.68, healthStatus: "buono", cloudCover: 10, satellite: "sentinel-2" },
      { id: "ndvi-svz-1", fieldId: fieldIds.seminativoZampeschi, date: date("2026-04-01"), ndviValue: 0.68, healthStatus: "buono", cloudCover: 5, satellite: "sentinel-2" },
      { id: "ndvi-svz-2", fieldId: fieldIds.seminativoZampeschi, date: date("2026-05-13"), ndviValue: 0.72, healthStatus: "ottimo", cloudCover: 22, satellite: "sentinel-2" },
    ],
  });

  await prisma.costEntry.createMany({
    data: [
      { id: "cost-vcs-fertilizer", farmId: farmIds.tondini, fieldId: fieldIds.vignaCollinaSud, category: "fertilizer", description: "Concimazione fogliare di supporto e microelementi", amount: 820, date: date("2026-04-17") },
      { id: "cost-vcs-protection", farmId: farmIds.tondini, fieldId: fieldIds.vignaCollinaSud, category: "plant_protection", description: "Trattamenti rameici e zolfo bagnabile", amount: 1260, date: date("2026-04-22") },
      { id: "cost-vae-fuel", farmId: farmIds.tondini, fieldId: fieldIds.vignaArgineEst, category: "fuel", description: "Gasolio per passaggi interfilari", amount: 610, date: date("2026-05-02") },
      { id: "cost-vae-labor", farmId: farmIds.tondini, fieldId: fieldIds.vignaArgineEst, category: "labor", description: "Sfogliatura lato monte e campionamenti", amount: 1560, date: date("2026-05-06") },
      { id: "cost-fsm-water", farmId: farmIds.tondini, fieldId: fieldIds.fruttetoSanMamante, category: "water", description: "Irrigazione a manichetta e filtrazione", amount: 380, date: date("2026-05-07") },
      { id: "cost-fsm-labor", farmId: farmIds.tondini, fieldId: fieldIds.fruttetoSanMamante, category: "labor", description: "Diradamento e raccolta anticipata", amount: 1980, date: date("2026-05-21") },
      { id: "cost-svz-seed", farmId: farmIds.tondini, fieldId: fieldIds.seminativoZampeschi, category: "seed", description: "Seme certificato grano tenero", amount: 540, date: date("2025-11-08") },
      { id: "cost-svz-machinery", farmId: farmIds.tondini, fieldId: fieldIds.seminativoZampeschi, category: "machinery", description: "Trebbia e logistica di campagna", amount: 1320, date: date("2026-07-06") },
      { id: "cost-san-vittore-shared", farmId: farmIds.sanVittore, fieldId: fieldIds.vignaSanVittore, category: "machinery", description: "Noleggio attrezzature condivise cooperativa", amount: 760, date: date("2026-05-11") },
      { id: "cost-fratta-packaging", farmId: farmIds.fratta, fieldId: fieldIds.susinetoFratta, category: "overhead", description: "Packaging e logistica frutta fresca", amount: 690, date: date("2026-06-27") },
      { id: "cost-cabianca-insurance", farmId: farmIds.caBianca, fieldId: fieldIds.granoBianca, category: "insurance", description: "Polizza grandine cereali", amount: 520, date: date("2026-04-01") },
    ],
  });

  await prisma.revenueEntry.createMany({
    data: [
      { id: "revenue-vcs-coop", farmId: farmIds.tondini, source: "cooperative_distribution", description: "Conferimento Sangiovese alla cantina cooperativa", amount: 18480, date: date("2026-09-12") },
      { id: "revenue-vcs-marketplace", farmId: farmIds.tondini, source: "marketplace", description: "Vendita diretta lotto premium e degustazioni", amount: 3820, date: date("2026-10-08") },
      { id: "revenue-vae-coop", farmId: farmIds.tondini, source: "cooperative_distribution", description: "Conferimento Albana DOCG alla cantina cooperativa", amount: 12300, date: date("2026-08-29") },
      { id: "revenue-fsm-marketplace", farmId: farmIds.tondini, source: "marketplace", description: "Vendita diretta cassette pesche e canale horeca", amount: 14250, date: date("2026-06-18") },
      { id: "revenue-svz-coop", farmId: farmIds.tondini, source: "cooperative_distribution", description: "Conferimento grano tenero al molino partner", amount: 11900, date: date("2026-07-06") },
      { id: "revenue-san-vittore", farmId: farmIds.sanVittore, source: "cooperative_distribution", description: "Conferimento Sangiovese collinare", amount: 15800, date: date("2026-09-08") },
      { id: "revenue-fratta", farmId: farmIds.fratta, source: "marketplace", description: "Vendita susine premium e albicocche horeca", amount: 13240, date: date("2026-07-10") },
      { id: "revenue-cabianca", farmId: farmIds.caBianca, source: "cap_subsidy", description: "Premio carbon farming e rotazione foraggere", amount: 4680, date: date("2026-11-02") },
    ],
  });

  await prisma.carbonEntry.createMany({
    data: [
      { id: "carbon-vcs-diesel", farmId: farmIds.tondini, fieldId: fieldIds.vignaCollinaSud, type: "emission", category: "fuel", description: "Gasolio agricolo per trattore filare", co2Kg: 375.2, date: date("2026-05-04"), verified: true },
      { id: "carbon-vcs-cover-crop", farmId: farmIds.tondini, fieldId: fieldIds.vignaCollinaSud, type: "sequestration", category: "cover_crop", description: "Inerbimento permanente interfilare", co2Kg: 630, date: date("2026-05-10"), verified: true },
      { id: "carbon-vae-pesticide", farmId: farmIds.tondini, fieldId: fieldIds.vignaArgineEst, type: "emission", category: "treatments", description: "Prodotti fitosanitari e passaggi di difesa", co2Kg: 29.6, date: date("2026-04-26"), verified: true },
      { id: "carbon-fsm-electricity", farmId: farmIds.tondini, fieldId: fieldIds.fruttetoSanMamante, type: "emission", category: "electricity", description: "Energia per impianto irriguo e celle frigo", co2Kg: 84.4, date: date("2026-05-08"), verified: true },
      { id: "carbon-cabianca-medica", farmId: farmIds.caBianca, fieldId: fieldIds.medicaBianca, type: "sequestration", category: "organic_matter", description: "Miglioramento carbonio organico su medica pluriennale", co2Kg: 540, date: date("2026-06-01"), verified: false },
      { id: "carbon-grano-bianca", farmId: farmIds.caBianca, fieldId: fieldIds.granoBianca, type: "emission", category: "machinery", description: "Ore macchina e lavorazioni conservative", co2Kg: 240, date: date("2026-04-22"), verified: false },
    ],
  });

  await prisma.eSGIndicator.createMany({
    data: [
      { id: "esg-e01", cooperativeId, category: "environmental", name: "Impronta carbonica (Scope 1+2)", value: 142, unit: "tCO2e/anno", period: "2026", target: 120 },
      { id: "esg-e02", cooperativeId, category: "environmental", name: "Efficienza idrica", value: 185, unit: "m3/t", period: "2026", target: 160 },
      { id: "esg-s01", cooperativeId, category: "social", name: "Occupazione locale", value: 65, unit: "% del totale", period: "2026", target: 70 },
      { id: "esg-s02", cooperativeId, category: "social", name: "Formazione sicurezza", value: 12, unit: "ore/lav/anno", period: "2026", target: 16 },
      { id: "esg-g01", cooperativeId, category: "governance", name: "Partecipazione assembleare", value: 78, unit: "% soci", period: "2026", target: 85 },
      { id: "esg-g02", cooperativeId, category: "governance", name: "Trasparenza decisionale", value: 94, unit: "% decisioni", period: "2026", target: 100 },
    ],
  });

  await prisma.harvestDeclaration.createMany({
    data: [
      {
        id: "harvest-pesche",
        fieldId: fieldIds.fruttetoSanMamante,
        estimatedDate: date("2026-06-18"),
        estimatedKg: 11000,
        actualKg: 10850,
        status: "confermato",
        quality: "Extra",
        notes: "Destinazione: mercato locale e GDO regionale.",
      },
      {
        id: "harvest-grano",
        fieldId: fieldIds.seminativoZampeschi,
        estimatedDate: date("2026-07-06"),
        estimatedKg: 34000,
        status: "programmato",
        quality: "Molitoria A",
        notes: "Controllare umidità granella prima della trebbiatura.",
      },
      {
        id: "harvest-albana",
        fieldId: fieldIds.vignaArgineEst,
        estimatedDate: date("2026-08-29"),
        estimatedKg: 15000,
        status: "programmato",
        quality: "DOCG selezione",
        notes: "Raccolta in cassette da 18 kg per selezione manuale.",
      },
      {
        id: "harvest-sangiovese",
        fieldId: fieldIds.vignaCollinaSud,
        estimatedDate: date("2026-09-12"),
        estimatedKg: 28000,
        status: "programmato",
        quality: "Superiore",
        notes: "Obiettivo: linea superiore cooperativa.",
      },
    ],
  });

  await prisma.supplyChainLot.createMany({
    data: [
      { id: "supply-pesche-fresco-2026-a", product: "Pesche", origin: "Bertinoro", destination: "Hub cooperativo Forlì", status: "listed", quantity: 1800, departureDate: date("2026-06-18T10:10:00+02:00"), arrivalDate: date("2026-06-18T12:40:00+02:00") },
      { id: "supply-grano-mulino-2026-a", product: "Grano tenero", origin: "Bertinoro", destination: "Molino partner Forlimpopoli", status: "received", quantity: 34000, departureDate: date("2026-07-06T08:00:00+02:00"), arrivalDate: date("2026-07-06T12:00:00+02:00") },
      { id: "supply-albana-cantina-2026-a", product: "Albana", origin: "Vigna Argine Est", destination: "Cantina Sociale Bertinoro", status: "routed", quantity: 2700, departureDate: date("2026-08-29T06:00:00+02:00") },
      { id: "supply-sangiovese-cantina-2026-a", product: "Sangiovese", origin: "Vigna Collina Sud", destination: "Cantina Sociale Bertinoro", status: "quality_checked", quantity: 4200, departureDate: date("2026-09-12T11:00:00+02:00") },
    ],
  });

  await prisma.irrigationSchedule.createMany({
    data: [
      { id: "irr-vigna-collina-sud", fieldId: fieldIds.vignaCollinaSud, method: "Ala gocciolante notturna", startDate: date("2026-05-14T01:00:00+02:00"), endDate: date("2026-05-14T05:00:00+02:00"), waterMm: 11, status: "scheduled", frequency: "48h" },
      { id: "irr-vigna-argine-est", fieldId: fieldIds.vignaArgineEst, method: "Goccia con sensori VWC", startDate: date("2026-05-14T02:00:00+02:00"), endDate: date("2026-05-14T05:30:00+02:00"), waterMm: 13, status: "scheduled", frequency: "72h" },
      { id: "irr-frutteto-san-mamante", fieldId: fieldIds.fruttetoSanMamante, method: "Microjet a settore", startDate: date("2026-05-13T04:00:00+02:00"), endDate: date("2026-05-13T07:00:00+02:00"), waterMm: 16, status: "completed", frequency: "24h" },
      { id: "irr-seminativo-zampeschi", fieldId: fieldIds.seminativoZampeschi, method: "Turno sospeso e monitoraggio rugiada", startDate: date("2026-05-15T05:00:00+02:00"), endDate: date("2026-05-15T07:00:00+02:00"), waterMm: 5, status: "skipped", frequency: "on-demand" },
    ],
  });

  await prisma.soilAnalysis.createMany({
    data: [
      { id: "soil-vcs-2026", fieldId: fieldIds.vignaCollinaSud, date: date("2026-02-18"), ph: 7.4, organicMatter: 2.2, nitrogen: 1120, phosphorus: 18, potassium: 210, texture: "argilloso", notes: "Valutare aumento sostanza organica con cover crop." },
      { id: "soil-vae-2026", fieldId: fieldIds.vignaArgineEst, date: date("2026-02-18"), ph: 7.1, organicMatter: 2.5, nitrogen: 1240, phosphorus: 22, potassium: 195, texture: "franco-argilloso", notes: "Buona dotazione, correggere stress idrico primaverile." },
      { id: "soil-fsm-2026", fieldId: fieldIds.fruttetoSanMamante, date: date("2026-02-25"), ph: 6.8, organicMatter: 3.1, nitrogen: 1680, phosphorus: 35, potassium: 165, texture: "franco", notes: "Campione equilibrato, mantenere apporto organico." },
      { id: "soil-svz-2026", fieldId: fieldIds.seminativoZampeschi, date: date("2026-01-30"), ph: 7.5, organicMatter: 2.4, nitrogen: 1280, phosphorus: 22, potassium: 195, texture: "franco-argilloso", notes: "Attenzione al bilancio potassico in post-raccolta." },
    ],
  });

  await prisma.diseaseRisk.createMany({
    data: [
      {
        id: "risk-vcs-peronospora",
        disease: "Peronospora",
        crop: "Sangiovese",
        riskLevel: "high",
        region: "Romagna collinare",
        detectedDate: date("2026-05-13T08:30:00+02:00"),
        recommendations: [
          "Trattamento preventivo entro 24 ore con finestra mattutina.",
          "Ridurre densità chioma lato sud per aumentare ventilazione.",
        ],
      },
      {
        id: "risk-vae-oidio",
        disease: "Oidio",
        crop: "Albana",
        riskLevel: "high",
        region: "Bertinoro",
        detectedDate: date("2026-05-13T08:30:00+02:00"),
        recommendations: [
          "Applicare zolfo micronizzato in serata.",
          "Completare sfogliatura lato monte entro 5 giorni.",
        ],
      },
      {
        id: "risk-fsm-monilia",
        disease: "Monilia bruna",
        crop: "Pesche",
        riskLevel: "high",
        region: "Forlì-Cesena",
        detectedDate: date("2026-05-13T08:30:00+02:00"),
        recommendations: [
          "Intensificare monitoraggio frutti in maturazione.",
          "Prediligere raccolta nelle parcelle con umidità più alta.",
        ],
      },
      {
        id: "risk-grano-fusariosi",
        disease: "Fusariosi di rete",
        crop: "Grano tenero",
        riskLevel: "moderate",
        region: "Pianura romagnola",
        detectedDate: date("2026-05-13T08:30:00+02:00"),
        recommendations: [
          "Continuare sorveglianza post-pioggia.",
          "Verificare umidità granella in pre-raccolta.",
        ],
      },
    ],
  });

  await prisma.sprayPrescription.createMany({
    data: [
      { id: "rx-vcs-peronospora", fieldId: fieldIds.vignaCollinaSud, product: "Poltiglia Bordolese 20%", dosage: "3 kg/ha", applicationDate: date("2026-05-14T07:00:00+02:00"), status: "approvato", operator: "Marco Tondini", weatherOk: true },
      { id: "rx-vae-oidio", fieldId: fieldIds.vignaArgineEst, product: "Zolfo bagnabile micronizzato", dosage: "4 kg/ha", applicationDate: date("2026-05-14T19:00:00+02:00"), status: "approvato", operator: "Giulia Rossi", weatherOk: true },
      { id: "rx-fsm-monilia", fieldId: fieldIds.fruttetoSanMamante, product: "Bacillus subtilis", dosage: "2.5 L/ha", applicationDate: date("2026-05-13T18:30:00+02:00"), status: "bozza", operator: "Luca Bianchi", weatherOk: false },
    ],
  });

  await prisma.equipment.createMany({
    data: [
      { id: "eq-001", name: "Trattore Landini Rex 4-110", type: "trattore", status: "operativo", farmId: farmIds.tondini, lastMaintenance: date("2025-06-10"), nextMaintenance: date("2025-09-10"), hoursUsed: 2340 },
      { id: "eq-002", name: "Irroratrice Caffini Synthesis", type: "irroratrice", status: "operativo", farmId: farmIds.tondini, lastMaintenance: date("2025-04-20"), nextMaintenance: date("2025-10-20"), hoursUsed: 620 },
      { id: "eq-003", name: "Mietitrebbia Claas Lexion 6700", type: "mietitrebbia", status: "operativo", farmId: farmIds.caBianca, lastMaintenance: date("2025-06-25"), nextMaintenance: date("2025-07-25"), hoursUsed: 4120 },
      { id: "eq-004", name: "Impianto irrigazione a goccia Netafim", type: "irrigazione", status: "in_manutenzione", farmId: farmIds.fratta, lastMaintenance: date("2025-03-15"), nextMaintenance: date("2025-09-15"), hoursUsed: 3200 },
    ],
  });

  await prisma.maintenanceEvent.createMany({
    data: [
      { id: "mnt-001", equipmentId: "eq-001", date: date("2025-06-10"), type: "tagliando", description: "Tagliando 2.000 ore con cambio filtri", cost: 450, technician: "Officina Tosi Forlì" },
      { id: "mnt-002", equipmentId: "eq-002", date: date("2025-04-20"), type: "calibrazione", description: "Calibrazione ugelli e verifica portata", cost: 280, technician: "Caffini Service Center" },
      { id: "mnt-003", equipmentId: "eq-003", date: date("2025-06-25"), type: "tagliando", description: "Pre-campagna mietitura e controllo barra", cost: 1850, technician: "Claas Dealer Ravenna" },
      { id: "mnt-004", equipmentId: "eq-004", date: date("2025-07-10"), type: "riparazione", description: "Sostituzione pompa e verifica impianto", cost: 920, technician: "Netafim Service Emilia-Romagna" },
    ],
  });

  await prisma.seasonalWorker.createMany({
    data: [
      { id: "w-001", name: "Andrei Popescu", role: "Raccoglitore", cooperativeId, startDate: date("2026-05-01"), endDate: date("2026-10-31"), status: "attivo", certifications: ["sicurezza_base"] },
      { id: "w-002", name: "Maria Ionescu", role: "Potatore", cooperativeId, startDate: date("2026-04-15"), endDate: date("2026-11-15"), status: "attivo", certifications: ["sicurezza_base", "fitosanitario"] },
      { id: "w-003", name: "Ahmed El Fassi", role: "Trattorista", cooperativeId, startDate: date("2026-03-01"), endDate: date("2026-11-30"), status: "attivo", certifications: ["sicurezza_base", "trattorista", "primo_soccorso"] },
      { id: "w-004", name: "Elena Dragomir", role: "Addetta confezionamento", cooperativeId, startDate: date("2026-06-01"), endDate: date("2026-10-15"), status: "in_onboarding", certifications: ["sicurezza_base"] },
    ],
  });

  await prisma.workShift.createMany({
    data: [
      { id: "shift-001", workerId: "w-001", date: date("2026-06-18"), startTime: date("2026-06-18T05:30:00+02:00"), endTime: date("2026-06-18T12:30:00+02:00"), fieldId: fieldIds.fruttetoSanMamante, task: "Raccolta pesche e prima cernita", hoursWorked: 6.5 },
      { id: "shift-002", workerId: "w-002", date: date("2026-05-14"), startTime: date("2026-05-14T06:00:00+02:00"), endTime: date("2026-05-14T12:30:00+02:00"), fieldId: fieldIds.vignaCollinaSud, task: "Sfogliatura verde Sangiovese", hoursWorked: 6 },
      { id: "shift-003", workerId: "w-003", date: date("2026-05-14"), startTime: date("2026-05-14T07:00:00+02:00"), endTime: date("2026-05-14T15:00:00+02:00"), fieldId: fieldIds.vignaArgineEst, task: "Trattamento fitosanitario Albana", hoursWorked: 7 },
      { id: "shift-004", workerId: "w-004", date: date("2026-06-18"), startTime: date("2026-06-18T13:30:00+02:00"), endTime: date("2026-06-18T18:30:00+02:00"), fieldId: fieldIds.fruttetoSanMamante, task: "Confezionamento pesche", hoursWorked: 4.5 },
      { id: "shift-005", workerId: "w-003", date: date("2026-07-06"), startTime: date("2026-07-06T07:00:00+02:00"), endTime: date("2026-07-06T18:00:00+02:00"), fieldId: fieldIds.seminativoZampeschi, task: "Supporto trebbiatura e logistica", hoursWorked: 10 },
    ],
  });

  await prisma.proposal.createMany({
    data: [
      {
        id: "proposal-irrigazione-2026",
        cooperativeId,
        title: "Piano turni irrigui condivisi estate 2026",
        description: "Turnazione cooperativa per ottimizzare le finestre di pompaggio e ridurre i picchi di prelievo.",
        status: "open",
        createdBy: "user-tondini",
        createdAt: date("2026-05-08T09:00:00+02:00"),
        votesFor: 1,
        votesAgainst: 0,
      },
      {
        id: "proposal-liquidazioni-estive",
        cooperativeId,
        title: "Anticipo liquidazioni conferimenti estivi",
        description: "Anticipo del 35% sulle liquidazioni delle pesche conferite.",
        status: "voting",
        createdBy: "user-rossi",
        createdAt: date("2026-05-05T11:30:00+02:00"),
        votesFor: 2,
        votesAgainst: 0,
      },
      {
        id: "proposal-sensori-cantina",
        cooperativeId,
        title: "Acquisto modulo sensori qualità per la cantina sociale",
        description: "Investimento condiviso per monitoraggio temperatura, umidità e tracciabilità lotti.",
        status: "approved",
        createdBy: "user-tondini",
        createdAt: date("2026-04-01T10:00:00+02:00"),
        votesFor: 3,
        votesAgainst: 0,
      },
    ],
  });

  await prisma.vote.createMany({
    data: [
      { id: "vote-liquidazioni-1", proposalId: "proposal-liquidazioni-estive", userId: "user-tondini", vote: "favor", timestamp: date("2026-05-13T08:10:00+02:00") },
      { id: "vote-liquidazioni-2", proposalId: "proposal-liquidazioni-estive", userId: "user-rossi", vote: "favor", timestamp: date("2026-05-13T08:25:00+02:00") },
      { id: "vote-liquidazioni-3", proposalId: "proposal-liquidazioni-estive", userId: "user-verdi", vote: "abstain", timestamp: date("2026-05-13T08:42:00+02:00") },
      { id: "vote-sensori-1", proposalId: "proposal-sensori-cantina", userId: "user-tondini", vote: "favor", timestamp: date("2026-04-17T17:10:00+02:00") },
      { id: "vote-sensori-2", proposalId: "proposal-sensori-cantina", userId: "user-rossi", vote: "favor", timestamp: date("2026-04-17T18:05:00+02:00") },
      { id: "vote-sensori-3", proposalId: "proposal-sensori-cantina", userId: "user-bianchi", vote: "favor", timestamp: date("2026-04-18T09:20:00+02:00") },
      { id: "vote-irrigazione-1", proposalId: "proposal-irrigazione-2026", userId: "user-tondini", vote: "favor", timestamp: date("2026-05-14T07:45:00+02:00") },
    ],
  });

  await prisma.marketplaceProduct.createMany({
    data: [
      { id: "prod-sangiovese-sfuso", name: "Sangiovese di Romagna — Sfuso", category: "vino", price: 6.5, unit: "litro", farmId: farmIds.tondini, available: true, organic: true },
      { id: "prod-albana-docg", name: "Albana di Romagna DOCG", category: "vino", price: 12, unit: "bottiglia 0.75L", farmId: farmIds.tondini, available: true, organic: true },
      { id: "prod-pesche-cassetta", name: "Pesche di Romagna — Cassetta 5 kg", category: "frutta", price: 15, unit: "cassetta 5 kg", farmId: farmIds.tondini, available: true, organic: false },
      { id: "prod-farina-grano", name: "Farina di grano tenero tipo 2", category: "cereali", price: 3.8, unit: "kg", farmId: farmIds.tondini, available: true, organic: false },
      { id: "prod-miele-acacia", name: "Miele di Acacia della Romagna", category: "trasformati", price: 9.5, unit: "vasetto 500g", farmId: farmIds.sanVittore, available: true, organic: false },
    ],
  });

  await prisma.order.createMany({
    data: [
      { id: "ord-001", productId: "prod-pesche-cassetta", buyerId: "user-rossi", quantity: 2, totalPrice: 30, status: "confermato", orderDate: date("2026-06-15T10:30:00+02:00") },
      { id: "ord-002", productId: "prod-albana-docg", buyerId: "user-bianchi", quantity: 12, totalPrice: 144, status: "in_preparazione", orderDate: date("2026-06-14T14:00:00+02:00") },
      { id: "ord-003", productId: "prod-miele-acacia", buyerId: "user-verdi", quantity: 2, totalPrice: 19, status: "nuovo", orderDate: date("2026-06-16T08:15:00+02:00") },
    ],
  });

  await prisma.insurancePolicy.createMany({
    data: [
      { id: "pol-001", farmId: farmIds.tondini, type: "Multirischio colture", provider: "Generali Agro", coverageAmount: 85000, premium: 4200, startDate: date("2026-03-01"), endDate: date("2026-11-30"), status: "attiva" },
      { id: "pol-002", farmId: farmIds.sanVittore, type: "Parametrica siccità", provider: "Cattolica Assicurazioni", coverageAmount: 62000, premium: 2800, startDate: date("2026-04-01"), endDate: date("2026-10-31"), status: "attiva" },
      { id: "pol-003", farmId: farmIds.caBianca, type: "Resa garantita", provider: "Generali Agro", coverageAmount: 45000, premium: 1950, startDate: date("2026-01-01"), endDate: date("2026-12-31"), status: "attiva" },
    ],
  });

  await prisma.communicationChannel.createMany({
    data: [
      { id: "ch-001", name: "Cooperativa Generale", type: "cooperativa", cooperativeId, memberCount: 42 },
      { id: "ch-002", name: "Viticoltori", type: "coltura", cooperativeId, memberCount: 18 },
      { id: "ch-003", name: "Lavoratori stagionali", type: "ruolo", cooperativeId, memberCount: 24 },
    ],
  });

  await prisma.message.createMany({
    data: [
      {
        id: "msg-001",
        channelId: "ch-001",
        senderId: "user-tondini",
        content: "⚠️ Allerta grandine domani 16/07 ore 14-18. Verificare reti antigrandine e teli di copertura.",
        timestamp: date("2026-07-15T14:30:00+02:00"),
        readBy: ["user-tondini", "user-rossi"],
      },
      {
        id: "msg-002",
        channelId: "ch-002",
        senderId: "user-rossi",
        content: "Trattamento antiperonosporico entro venerdì 18/07 come da bollettino ARPAE.",
        timestamp: date("2026-07-15T11:20:00+02:00"),
        readBy: ["user-rossi"],
      },
      {
        id: "msg-003",
        channelId: "ch-003",
        senderId: "user-tondini",
        content: "Turni settimana 14-18 luglio pubblicati nel modulo Workforce.",
        timestamp: date("2026-07-15T06:30:00+02:00"),
        readBy: ["user-tondini", "user-verdi"],
      },
      {
        id: "msg-004",
        channelId: "ch-001",
        senderId: "user-bianchi",
        content: "Assemblea ordinaria dei soci il 25 luglio ore 20:30 presso la sede cooperativa.",
        timestamp: date("2026-07-14T16:00:00+02:00"),
        readBy: ["user-bianchi", "user-verdi"],
      },
      {
        id: "msg-005",
        channelId: "ch-001",
        senderId: "user-verdi",
        content: "Nuova normativa su restrizione prelievo idrico disponibile nel Regulatory Radar.",
        timestamp: date("2026-07-15T10:00:00+02:00"),
        readBy: ["user-verdi"],
      },
    ],
  });

  await prisma.farmBenchmark.createMany({
    data: [
      { id: "benchmark-tondini-2026", farmId: farmIds.tondini, period: "2026", yieldPerHa: 7.4, costPerHa: 4620, waterEfficiency: 3.37, carbonPerHa: 0.29, overallScore: 77 },
      { id: "benchmark-san-vittore-2026", farmId: farmIds.sanVittore, period: "2026", yieldPerHa: 8.1, costPerHa: 4950, waterEfficiency: 3.12, carbonPerHa: 0.27, overallScore: 82 },
      { id: "benchmark-fratta-2026", farmId: farmIds.fratta, period: "2026", yieldPerHa: 6.3, costPerHa: 5380, waterEfficiency: 2.95, carbonPerHa: 0.34, overallScore: 57 },
      { id: "benchmark-cabianca-2026", farmId: farmIds.caBianca, period: "2026", yieldPerHa: 7.9, costPerHa: 4180, waterEfficiency: 4.47, carbonPerHa: 0.22, overallScore: 88 },
    ],
  });

  await prisma.yieldPrediction.createMany({
    data: [
      {
        id: "yield-vcs-2026",
        fieldId: fieldIds.vignaCollinaSud,
        crop: "Sangiovese",
        predictedYield: 8120,
        confidenceLow: 7560,
        confidenceHigh: 8680,
        predictionDate: date("2026-05-13"),
        factors: {
          ndvi: 0.74,
          soilMoisturePercent: 22.4,
          gddProgressPercent: 82,
          risks: ["Peronospora moderata"],
        },
      },
      {
        id: "yield-vae-2026",
        fieldId: fieldIds.vignaArgineEst,
        crop: "Albana",
        predictedYield: 7450,
        confidenceLow: 6900,
        confidenceHigh: 8060,
        predictionDate: date("2026-05-13"),
        factors: {
          ndvi: 0.61,
          soilMoisturePercent: 19.4,
          gddProgressPercent: 71,
          risks: ["Oidio alto", "Stress idrico moderato"],
        },
      },
      {
        id: "yield-fsm-2026",
        fieldId: fieldIds.fruttetoSanMamante,
        crop: "Pesche",
        predictedYield: 12100,
        confidenceLow: 11400,
        confidenceHigh: 12850,
        predictionDate: date("2026-05-13"),
        factors: {
          ndvi: 0.68,
          soilMoisturePercent: 26.2,
          gddProgressPercent: 89,
          risks: ["Monilia alta"],
        },
      },
      {
        id: "yield-svz-2026",
        fieldId: fieldIds.seminativoZampeschi,
        crop: "Grano tenero",
        predictedYield: 6860,
        confidenceLow: 6410,
        confidenceHigh: 7240,
        predictionDate: date("2026-05-13"),
        factors: {
          ndvi: 0.72,
          soilMoisturePercent: 23.5,
          gddProgressPercent: 86,
          risks: ["Fusariosi moderata"],
        },
      },
    ],
  });

  await prisma.regulatoryUpdate.createMany({
    data: [
      {
        id: "reg-001",
        title: "Nuovi limiti fitosanitari per rame in viticoltura biologica",
        source: "eu_official_journal",
        category: "fitosanitario",
        publishDate: date("2025-06-28"),
        effectiveDate: date("2026-01-01"),
        summary: "Riduzione del limite massimo di rame da 4 kg/ha/anno a 3,5 kg/ha/anno per la viticoltura biologica.",
        impact: "alto",
        url: "https://example.com/reg-001",
      },
      {
        id: "reg-002",
        title: "Aggiornamento eco-schemi PAC 2025 — Emilia-Romagna",
        source: "regione_emilia_romagna",
        category: "PAC",
        publishDate: date("2025-07-01"),
        effectiveDate: date("2025-09-15"),
        summary: "Aggiornati i criteri di ammissibilità per eco-schema 4 e 5 con premio aumentato a 150 €/ha.",
        impact: "medio",
        url: "https://example.com/reg-002",
      },
      {
        id: "reg-003",
        title: "Ordinanza restrizione prelievo idrico — Bacino Ronco-Montone",
        source: "arpae",
        category: "idrico",
        publishDate: date("2025-07-10"),
        effectiveDate: date("2025-07-15"),
        summary: "Restrizione prelievo idrico del 30% per uso irriguo nel bacino Ronco-Montone.",
        impact: "alto",
        url: "https://example.com/reg-003",
      },
    ],
  });

  await prisma.simulationScenario.createMany({
    data: [
      {
        id: "sim-001",
        name: "Conversione Campo Nord: Pesche → Albana",
        fieldId: fieldIds.fruttetoSanMamante,
        type: "cambio_coltura",
        parameters: {
          fromCrop: "Pesche",
          toCrop: "Albana DOCG",
          irrigationShift: "4200->2800 m3/ha",
        },
        results: {
          overallScore: 72,
          projectedRevenuePerHa: 14600,
          projectedWaterUsePerHa: 2850,
          recommendation: "Procedere con fase pilota su 1/3 della superficie.",
        },
        createdAt: date("2025-06-20"),
        createdBy: "user-tondini",
      },
      {
        id: "sim-002",
        name: "Irrigazione a goccia su Vigneto Bertinoro",
        fieldId: fieldIds.vignaCollinaSud,
        type: "irrigazione",
        parameters: {
          fromMethod: "Aspersione 5500 m3/ha",
          toMethod: "Goccia 3200 m3/ha",
        },
        results: {
          overallScore: 81,
          projectedYieldDeltaPercent: 2.8,
          projectedWaterDeltaPercent: -40.9,
          recommendation: "Investimento con payback stimato in 2.5 stagioni.",
        },
        createdAt: date("2025-06-25"),
        createdBy: "user-rossi",
      },
      {
        id: "sim-003",
        name: "Gelata tardiva aprile — Seminativo Via Zampeschi",
        fieldId: fieldIds.seminativoZampeschi,
        type: "evento_meteo",
        parameters: {
          event: "Gelata -3C per 6h in spigatura",
        },
        results: {
          overallScore: 35,
          projectedYieldDeltaPercent: -38.2,
          insuredCoverage: "70% delle perdite sotto soglia resa",
          recommendation: "Valutare sistemi anti-gelo e verifica copertura assicurativa.",
        },
        createdAt: date("2025-07-01"),
        createdBy: "user-bianchi",
      },
    ],
  });

  const [cooperatives, users, farms, fields, lots, devices] = await Promise.all([
    prisma.cooperative.count(),
    prisma.user.count(),
    prisma.farm.count(),
    prisma.field.count(),
    prisma.productLot.count(),
    prisma.sensorDevice.count(),
  ]);

  console.log(`Seeded ${cooperatives} cooperative, ${users} users, ${farms} farms, ${fields} fields, ${lots} product lots, ${devices} sensors.`);
}

seed()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
