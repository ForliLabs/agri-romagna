import {
  calculateCarbonValue,
  calculateFieldCarbon,
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
import { withAuth } from "@/lib/api-response";
import { carbonEntryQueries } from "@/lib/data-layer";
import { validateBody } from "@/lib/api-errors";
import { createCarbonEntrySchema } from "@/lib/validators/schemas";

const emissionSources = new Set<string>(emissionFactors.map((factor) => factor.key));
const sequestrationSources = new Set<string>(sequestrationFactors.map((factor) => factor.key));

// Map Prisma CarbonEntry → carbon-data CarbonEntry interface
function toCarbonEntry(row: {
  id: string;
  farmId: string;
  type: string;
  category: string;
  description: string;
  co2Kg: number;
  date: Date;
  fieldId: string | null;
}): CarbonEntry {
  return {
    id: row.id,
    fieldId: row.fieldId ?? row.farmId,
    date: row.date.toISOString().slice(0, 10),
    category: row.type as CarbonCategory,
    source: row.category as CarbonSource,
    quantity: 1,
    unit: "unit",
    co2eKg: row.co2Kg,
  };
}

type PrismaCarbonRow = {
  id: string;
  farmId: string;
  type: string;
  category: string;
  description: string;
  co2Kg: number;
  date: Date;
  fieldId: string | null;
};

async function getEntries(): Promise<CarbonEntry[]> {
  const dbEntries = (await carbonEntryQueries.findAll()) as PrismaCarbonRow[];
  return dbEntries.map(toCarbonEntry);
}

export const GET = withAuth("carbon:read", async (request) => {
  const url = new URL(request.url);
  const fieldIdFilter = url.searchParams.get("fieldId");
  const categoryFilter = url.searchParams.get("category") as CarbonCategory | null;
  const dateFrom = url.searchParams.get("dateFrom");
  const dateTo = url.searchParams.get("dateTo");

  let entries = await getEntries();

  if (fieldIdFilter) {
    entries = entries.filter((e) => e.fieldId === fieldIdFilter);
  }
  if (categoryFilter) {
    entries = entries.filter((e) => e.category === categoryFilter);
  }
  if (dateFrom) {
    entries = entries.filter((e) => e.date >= dateFrom);
  }
  if (dateTo) {
    entries = entries.filter((e) => e.date <= dateTo);
  }

  return Response.json({
    entries,
    fieldSummaries: fields.map((field) => calculateFieldCarbon(field.id, entries)),
    cooperativeSummary: getCooperativeCarbonSummary(entries),
    categoryBreakdown: getCarbonByCategory(entries),
    readiness: getCarbonComplianceReadiness(entries),
  });
});

export const POST = withAuth("carbon:write", async (request: Request, user) => {
  const parsed = await validateBody(request, createCarbonEntrySchema);
  if (parsed.error) return parsed.error;
  const payload = parsed.data;

  const source = payload.source as CarbonSource;

  if (!fields.some((field) => field.id === payload.fieldId)) {
    return Response.json({ error: "Campo non valido." }, { status: 400 });
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

  const created = await carbonEntryQueries.create({
    id: payload.id ?? `carbon-${crypto.randomUUID()}`,
    farmId: payload.farmId ?? user.farmId ?? "azienda-tondini",
    fieldId: payload.fieldId,
    type: payload.category,
    category: source,
    description: payload.description ?? `${source} — ${payload.quantity} ${payload.unit ?? "unit"}`,
    co2Kg: co2eKg,
    date: new Date(payload.date),
    verified: false,
  });

  const entry = toCarbonEntry(created as PrismaCarbonRow);
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
});
