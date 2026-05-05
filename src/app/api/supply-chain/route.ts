import {
  getLotTimeline,
  getSupplyChainSummary,
  processHarvestDeclaration,
  supplyChainLotsStore,
  transitionLot,
} from "@/lib/supply-chain-data";
import { authorizeRoute, createSuccessResponse } from "@/lib/api-response";
import { validationError, withErrorHandling } from "@/lib/api-errors";
import { logisticsDispatchRecommendations } from "@/lib/operations-insights";
import {
  createSupplyChainDeclarationSchema,
  createSupplyChainTransitionSchema,
} from "@/lib/validators/schemas";

async function getPayload() {
  const lots = await supplyChainLotsStore.findAll();
  return {
    summary: getSupplyChainSummary(),
    lots,
    timelines: Object.fromEntries(lots.map((lot) => [lot.id, getLotTimeline(lot.id)])),
    dispatchRecommendations: logisticsDispatchRecommendations,
  };
}

export const GET = withErrorHandling(async (request: Request) => {
  const { denied } = await authorizeRoute(request, "supply-chain:read");
  if (denied) return denied;

  return createSuccessResponse(await getPayload(), { meta: { domain: "supply-chain" } });
});

export const POST = withErrorHandling(async (request: Request) => {
  const { denied } = await authorizeRoute(request, "supply-chain:write");
  if (denied) return denied;

  const body = await request.json();
  const transitionPayload = createSupplyChainTransitionSchema.safeParse(body);

  if (transitionPayload.success) {
    const lot = transitionLot(transitionPayload.data.lotId, transitionPayload.data.toStatus);
    return createSuccessResponse(
      {
        ...(await getPayload()),
        updatedLot: lot,
        timeline: getLotTimeline(transitionPayload.data.lotId),
      },
      { meta: { domain: "supply-chain" } }
    );
  }

  const declarationPayload = createSupplyChainDeclarationSchema.safeParse(body);
  if (!declarationPayload.success) {
    return validationError(declarationPayload.error);
  }

  const result = processHarvestDeclaration(declarationPayload.data);
  return createSuccessResponse(
    {
      ...(await getPayload()),
      createdLot: result.lot,
      timeline: result.timeline,
    },
    { status: 201, meta: { domain: "supply-chain" } }
  );
});
