import {
  calculateCarbonValue,
  calculateFieldCarbon,
  carbonEntriesStore,
  emissionFactors,
  getCarbonByCategory,
  getCarbonComplianceReadiness,
  getCooperativeCarbonSummary,
  sequestrationFactors,
  type CarbonCategory,
  type CarbonEntry,
  type CarbonSource,
} from "@/lib/carbon-data";
import { fields } from "@/lib/data";

const emissionSources = new Set<string>(emissionFactors.map((factor) => factor.key));
const sequestrationSources = new Set<string>(sequestrationFactors.map((factor) => factor.key));

type CarbonPayload = Partial<CarbonEntry> & {
  fieldId?: string;
  date?: string;
  category?: CarbonCategory;
  source?: CarbonSource;
  quantity?: number;
};

async function getEntries() {
  return carbonEntriesStore.findAll();
}

export async function GET() {
  const entries = await getEntries();

  return Response.json({
    entries,
    fieldSummaries: fields.map((field) => calculateFieldCarbon(field.id, entries)),
    cooperativeSummary: getCooperativeCarbonSummary(entries),
    categoryBreakdown: getCarbonByCategory(entries),
    readiness: getCarbonComplianceReadiness(entries),
  });
}

export async function POST(request: Request) {
  const payload = (await request.json()) as CarbonPayload;
  const source = payload.source;

  if (
    !payload.fieldId ||
    !payload.date ||
    !payload.category ||
    typeof payload.quantity !== "number" ||
    !source ||
    !fields.some((field) => field.id === payload.fieldId)
  ) {
    return Response.json(
      { error: "Campi richiesti: fieldId, date, category, source, quantity." },
      { status: 400 }
    );
  }

  if (!emissionSources.has(source) && !sequestrationSources.has(source)) {
    return Response.json({ error: "Fonte carbonica non riconosciuta." }, { status: 400 });
  }

  if (payload.category === "emission" && !emissionSources.has(source)) {
    return Response.json(
      { error: "La fonte selezionata non appartiene alle emissioni." },
      { status: 400 }
    );
  }

  if (payload.category === "sequestration" && !sequestrationSources.has(source)) {
    return Response.json(
      { error: "La fonte selezionata non appartiene al sequestro." },
      { status: 400 }
    );
  }

  const entry: CarbonEntry = {
    id: payload.id ?? `carbon-${crypto.randomUUID()}`,
    fieldId: payload.fieldId,
    date: payload.date,
    category: payload.category,
    source,
    quantity: payload.quantity,
    unit: payload.unit ?? "unit",
    co2eKg:
      typeof payload.co2eKg === "number"
        ? payload.co2eKg
        : calculateCarbonValue(source, payload.quantity),
  };

  await carbonEntriesStore.create(entry);

  const entries = await getEntries();

  return Response.json(
    {
      entry,
      fieldSummary: calculateFieldCarbon(payload.fieldId, entries),
      cooperativeSummary: getCooperativeCarbonSummary(entries),
      categoryBreakdown: getCarbonByCategory(entries),
      readiness: getCarbonComplianceReadiness(entries),
    },
    { status: 201 }
  );
}
