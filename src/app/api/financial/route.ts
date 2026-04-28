import {
  calculateFieldProfitability,
  calculateMemberSettlements,
  getCashFlowProjection,
  getCooperativePL,
} from "@/lib/financial-data";
import { fields } from "@/lib/data";
import { costEntryQueries, revenueEntryQueries } from "@/lib/data-layer";

export async function GET() {
  const costs = (await costEntryQueries.findAll()) as any[];
  const revenues = (await revenueEntryQueries.findAll()) as any[];

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
  const payload = await request.json();

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

    const entry = await costEntryQueries.create({
      id: payload.id ?? `cost-${crypto.randomUUID()}`,
      farmId: payload.farmId ?? "azienda-tondini",
      category: payload.category,
      description: payload.description,
      amount: payload.amount,
      date: new Date(payload.date),
      fieldId: payload.fieldId,
    });

    const costs = (await costEntryQueries.findAll()) as any[];
    const revenues = (await revenueEntryQueries.findAll()) as any[];

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

    const entry = await revenueEntryQueries.create({
      id: payload.id ?? `revenue-${crypto.randomUUID()}`,
      farmId: payload.farmId ?? "azienda-tondini",
      source: payload.source,
      description: payload.description,
      amount: payload.amount,
      date: new Date(payload.date),
    });

    const costs = (await costEntryQueries.findAll()) as any[];
    const revenues = (await revenueEntryQueries.findAll()) as any[];

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
