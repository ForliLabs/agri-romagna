import {
  calculateCarbonValue,
  calculateFieldCarbon,
  emissionFactors,
  getCarbonByCategory,
  getCarbonComplianceReadiness,
  getCooperativeCarbonSummary,
  sequestrationFactors,
  type CarbonSource,
} from "@/lib/carbon-data";
import { fields } from "@/lib/data";
import { carbonEntryQueries } from "@/lib/data-layer";

const emissionSources = new Set<string>(emissionFactors.map((factor) => factor.key));
const sequestrationSources = new Set<string>(
  sequestrationFactors.map((factor) => factor.key)
);

export async function GET() {
  const entries = (await carbonEntryQueries.findAll()) as any[];

  return Response.json({
    entries,
    fieldSummaries: fields.map((field) => calculateFieldCarbon(field.id, entries)),
    cooperativeSummary: getCooperativeCarbonSummary(entries),
    categoryBreakdown: getCarbonByCategory(entries),
    readiness: getCarbonComplianceReadiness(entries),
  });
}

export async function POST(request: Request) {
  const payload = await request.json();
  const source = payload.source as CarbonSource | undefined;

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

  const co2eKg =
    typeof payload.co2eKg === "number"
      ? payload.co2eKg
      : calculateCarbonValue(source, payload.quantity);

  const entry = await carbonEntryQueries.create({
    id: payload.id ?? `carbon-${crypto.randomUUID()}`,
    farmId: payload.farmId ?? "azienda-tondini",
    type: payload.category,
    category: payload.category,
    description: payload.description ?? source,
    co2Kg: co2eKg,
    date: new Date(payload.date),
    fieldId: payload.fieldId,
    verified: false,
  });

  const entries = (await carbonEntryQueries.findAll()) as any[];

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
