import {
  calculateFieldProfitability,
  calculateMemberSettlements,
  getCashFlowProjection,
  getCooperativePL,
  type CostCategory,
  type CostEntry,
  type RevenueEntry,
  type RevenueSource,
} from "@/lib/financial-data";
import { fields } from "@/lib/data";
import { withAuth } from "@/lib/api-response";
import { costEntryQueries, revenueEntryQueries } from "@/lib/data-layer";
import { validateBody } from "@/lib/api-errors";
import { createCostEntrySchema, createRevenueEntrySchema } from "@/lib/validators/schemas";

// Map Prisma CostEntry → financial-data CostEntry interface
function toCostEntry(row: { id: string; farmId: string; category: string; description: string; amount: number; date: Date; fieldId: string | null }): CostEntry {
  return {
    id: row.id,
    fieldId: row.fieldId ?? row.farmId,
    date: row.date.toISOString().slice(0, 10),
    category: row.category as CostCategory,
    description: row.description,
    amount: row.amount,
    quantity: 1,
    unit: "unit",
  };
}

// Map Prisma RevenueEntry → financial-data RevenueEntry interface
function toRevenueEntry(row: { id: string; farmId: string; source: string; description: string; amount: number; date: Date }): RevenueEntry {
  return {
    id: row.id,
    fieldId: row.farmId,
    date: row.date.toISOString().slice(0, 10),
    source: row.source as RevenueSource,
    description: row.description,
    amount: row.amount,
    quantity: 1,
  };
}

async function getEntries() {
  const [dbCosts, dbRevenues] = await Promise.all([
    costEntryQueries.findAll() as Promise<{ id: string; farmId: string; category: string; description: string; amount: number; date: Date; fieldId: string | null }[]>,
    revenueEntryQueries.findAll() as Promise<{ id: string; farmId: string; source: string; description: string; amount: number; date: Date }[]>,
  ]);

  return {
    costs: dbCosts.map(toCostEntry),
    revenues: dbRevenues.map(toRevenueEntry),
  };
}

export const GET = withAuth("financial:read", async (request) => {
  const url = new URL(request.url);
  const fieldIdFilter = url.searchParams.get("fieldId");
  const categoryFilter = url.searchParams.get("category");
  const sourceFilter = url.searchParams.get("source");
  const dateFrom = url.searchParams.get("dateFrom");
  const dateTo = url.searchParams.get("dateTo");

  let { costs, revenues } = await getEntries();

  if (fieldIdFilter) {
    costs = costs.filter((c) => c.fieldId === fieldIdFilter);
    revenues = revenues.filter((r) => r.fieldId === fieldIdFilter);
  }
  if (categoryFilter) {
    costs = costs.filter((c) => c.category === categoryFilter);
  }
  if (sourceFilter) {
    revenues = revenues.filter((r) => r.source === sourceFilter);
  }
  if (dateFrom) {
    costs = costs.filter((c) => c.date >= dateFrom);
    revenues = revenues.filter((r) => r.date >= dateFrom);
  }
  if (dateTo) {
    costs = costs.filter((c) => c.date <= dateTo);
    revenues = revenues.filter((r) => r.date <= dateTo);
  }

  return Response.json({
    costs,
    revenues,
    fieldProfitability: fields.map((field) =>
      calculateFieldProfitability(field.id, costs, revenues)
    ),
    cooperativePL: getCooperativePL(costs, revenues),
    memberSettlements: calculateMemberSettlements(),
    cashFlowProjection: getCashFlowProjection(),
  });
});

export const POST = withAuth("financial:write", async (request: Request, user) => {
  // Peek at type field to choose the correct schema
  const body = await request.clone().json();
  const type = body?.type;

  if (type === "cost") {
    const parsed = await validateBody(request, createCostEntrySchema);
    if (parsed.error) return parsed.error;
    const payload = parsed.data;

    if (!fields.some((field) => field.id === payload.fieldId)) {
      return Response.json({ error: "Campo non valido." }, { status: 400 });
    }

    const created = await costEntryQueries.create({
      id: payload.id ?? `cost-${crypto.randomUUID()}`,
      farmId: payload.farmId ?? user.farmId ?? "azienda-tondini",
      fieldId: payload.fieldId,
      category: payload.category,
      description: payload.description,
      amount: payload.amount,
      date: new Date(payload.date),
    });

    const entry = toCostEntry(created as { id: string; farmId: string; category: string; description: string; amount: number; date: Date; fieldId: string | null });
    const { costs, revenues } = await getEntries();

    return Response.json(
      {
        entry,
        fieldProfitability: calculateFieldProfitability(payload.fieldId, costs, revenues),
        cooperativePL: getCooperativePL(costs, revenues),
      },
      { status: 201 }
    );
  }

  if (type === "revenue") {
    const parsed = await validateBody(request, createRevenueEntrySchema);
    if (parsed.error) return parsed.error;
    const payload = parsed.data;

    if (!fields.some((field) => field.id === payload.fieldId)) {
      return Response.json({ error: "Campo non valido." }, { status: 400 });
    }

    const created = await revenueEntryQueries.create({
      id: payload.id ?? `revenue-${crypto.randomUUID()}`,
      farmId: payload.farmId ?? user.farmId ?? "azienda-tondini",
      source: payload.source,
      description: payload.description,
      amount: payload.amount,
      date: new Date(payload.date),
    });

    const entry = toRevenueEntry(created as { id: string; farmId: string; source: string; description: string; amount: number; date: Date });
    const { costs, revenues } = await getEntries();

    return Response.json(
      {
        entry,
        fieldProfitability: calculateFieldProfitability(payload.fieldId, costs, revenues),
        cooperativePL: getCooperativePL(costs, revenues),
      },
      { status: 201 }
    );
  }

  return Response.json(
    { error: "Payload non valido. Specificare type: cost | revenue e i campi richiesti." },
    { status: 400 }
  );
});
