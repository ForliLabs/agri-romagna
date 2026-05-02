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

type FinancialPayload = {
  type?: "cost" | "revenue";
  id?: string;
  fieldId?: string;
  farmId?: string;
  date?: string;
  category?: CostCategory;
  source?: RevenueSource;
  description?: string;
  amount?: number;
  quantity?: number;
  unit?: string;
};

async function getEntries() {
  const [costs, revenues] = await Promise.all([
    costEntriesStore.findAll(),
    revenueEntriesStore.findAll(),
  ]);

  return { costs, revenues };
}

export async function GET() {
  const { costs, revenues } = await getEntries();

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
}

export async function POST(request: Request) {
  const payload = (await request.json()) as FinancialPayload;

  if (!payload.fieldId || !fields.some((field) => field.id === payload.fieldId)) {
    return Response.json({ error: "Campo non valido." }, { status: 400 });
  }

  if (payload.type === "cost") {
    if (
      !payload.date ||
      !payload.category ||
      !payload.description ||
      typeof payload.amount !== "number"
    ) {
      return Response.json(
        {
          error:
            "Campi richiesti per un costo: fieldId, date, category, description, amount.",
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
      quantity: payload.quantity ?? 1,
      unit: payload.unit ?? "unit",
    };

    await costEntriesStore.create(entry);

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

  if (payload.type === "revenue") {
    if (
      !payload.date ||
      !payload.source ||
      !payload.description ||
      typeof payload.amount !== "number"
    ) {
      return Response.json(
        {
          error:
            "Campi richiesti per un ricavo: fieldId, date, source, description, amount.",
        },
        { status: 400 }
      );
    }

    const entry: RevenueEntry = {
      id: payload.id ?? `revenue-${crypto.randomUUID()}`,
      fieldId: payload.fieldId,
      date: payload.date,
      source: payload.source,
      description: payload.description,
      amount: payload.amount,
      quantity: payload.quantity ?? 1,
    };

    await revenueEntriesStore.create(entry);

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
}
