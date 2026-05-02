import {
  getLotTimeline,
  getSupplyChainSummary,
  processHarvestDeclaration,
  supplyChainLotsStore,
  transitionLot,
  type HarvestDeclarationPayload,
  type LotLifecycle,
} from "@/lib/supply-chain-data";

async function getPayload() {
  const lots = await supplyChainLotsStore.findAll();
  return {
    summary: getSupplyChainSummary(),
    lots,
    timelines: Object.fromEntries(lots.map((lot) => [lot.id, getLotTimeline(lot.id)])),
  };
}

export async function GET() {
  return Response.json(await getPayload());
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as
      | {
          action?: "transition";
          lotId?: string;
          toStatus?: LotLifecycle;
        }
      | HarvestDeclarationPayload;

    if ("action" in body && body.action === "transition") {
      if (!body.lotId || !body.toStatus) {
        return Response.json({ error: "lotId e toStatus sono obbligatori." }, { status: 400 });
      }

      const lot = transitionLot(body.lotId, body.toStatus);
      return Response.json({
        ...(await getPayload()),
        updatedLot: lot,
        timeline: getLotTimeline(body.lotId),
      });
    }

    if (!("fieldId" in body) || !("crop" in body) || !("harvestDate" in body)) {
      return Response.json({ error: "Payload dichiarazione raccolta non valido." }, { status: 400 });
    }

    const result = processHarvestDeclaration(body);
    return Response.json({
      ...(await getPayload()),
      createdLot: result.lot,
      timeline: result.timeline,
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Operazione supply chain non riuscita." },
      { status: 400 }
    );
  }
}
