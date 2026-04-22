import {
  calculateFieldProfitability,
  calculateMemberSettlements,
  costEntriesStore,
  getCashFlowProjection,
  getCooperativePL,
  revenueEntriesStore,
  type CostCategory,
  type CostEntry,
  type RevenueEntry,
  type RevenueSource,
} from "@/lib/financial-data";
import { fields } from "@/lib/data";

const costCategories: CostCategory[] = [
  "seed",
  "fertilizer",
  "plant_protection",
  "fuel",
  "labor",
  "machinery",
  "water",
  "insurance",
  "overhead",
];

const revenueSources: RevenueSource[] = [
  "marketplace",
  "cooperative_distribution",
  "cap_subsidy",
];

export async function GET() {
  const costs = await costEntriesStore.findAll();
  const revenues = await revenueEntriesStore.findAll();

  return Response.json({
    costs,
    revenues,
    fieldProfitability: fields.map((field) => calculateFieldProfitability(field.id, costs, revenues)),
    cooperativePL: getCooperativePL(costs, revenues),
    memberSettlements: calculateMemberSettlements(),
    cashFlowProjection: getCashFlowProjection(),
  });
}

export async function POST(request: Request) {
  const payload = (await request.json()) as
    | ({ type: "cost" } & Partial<CostEntry>)
    | ({ type: "revenue" } & Partial<RevenueEntry>);

  if (!payload.fieldId || !fields.some((field) => field.id === payload.fieldId)) {
    return Response.json({ error: "Campo non valido." }, { status: 400 });
  }

  if (payload.type === "cost") {
    if (
      !payload.date ||
      !payload.category ||
      !costCategories.includes(payload.category) ||
      !payload.description ||
      typeof payload.amount !== "number" ||
      typeof payload.quantity !== "number" ||
      !payload.unit
    ) {
      return Response.json(
        {
          error:
            "Campi richiesti per un costo: fieldId, date, category, description, amount, quantity, unit.",
        },
        { status: 400 }
      );
    }

    const entry: CostEntry = {
      id: payload.id ?? `cost-${crypto.randomUUID()}`,
      fieldId: payload.fieldId,
      date: payload.date,
      category: payload.category,
      description: payload.description,
      amount: payload.amount,
      quantity: payload.quantity,
      unit: payload.unit,
    };

    await costEntriesStore.create(entry);
    const costs = await costEntriesStore.findAll();
    const revenues = await revenueEntriesStore.findAll();

    return Response.json(
      {
        entry,
        fieldProfitability: calculateFieldProfitability(entry.fieldId, costs, revenues),
        cooperativePL: getCooperativePL(costs, revenues),
      },
      { status: 201 }
    );
  }

  if (
    payload.type === "revenue" &&
    payload.date &&
    payload.source &&
    revenueSources.includes(payload.source) &&
    payload.description &&
    typeof payload.amount === "number" &&
    typeof payload.quantity === "number"
  ) {
    const entry: RevenueEntry = {
      id: payload.id ?? `revenue-${crypto.randomUUID()}`,
      fieldId: payload.fieldId,
      date: payload.date,
      source: payload.source,
      description: payload.description,
      amount: payload.amount,
      quantity: payload.quantity,
    };

    await revenueEntriesStore.create(entry);
    const costs = await costEntriesStore.findAll();
    const revenues = await revenueEntriesStore.findAll();

    return Response.json(
      {
        entry,
        fieldProfitability: calculateFieldProfitability(entry.fieldId, costs, revenues),
        cooperativePL: getCooperativePL(costs, revenues),
      },
      { status: 201 }
    );
  }

  return Response.json(
    {
      error:
        "Payload non valido. Specificare type: cost | revenue e i campi richiesti.",
    },
    { status: 400 }
  );
}
