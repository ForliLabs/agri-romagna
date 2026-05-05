import {
  auditPackageStore,
  complianceChainStore,
  complianceMappingStore,
  getComplianceScores,
} from "@/lib/compliance-chain-data";
import { authorizeRoute, createSuccessResponse } from "@/lib/api-response";
import { withErrorHandling } from "@/lib/api-errors";

export const GET = withErrorHandling(async (request: Request) => {
  const { denied } = await authorizeRoute(request, "compliance-chain:read");
  if (denied) return denied;

  const [chains, mappings, auditPackages] = await Promise.all([
    complianceChainStore.findAll(),
    complianceMappingStore.findAll(),
    auditPackageStore.findAll(),
  ]);

  return createSuccessResponse(
    {
      chains,
      mappings,
      auditPackages,
      scores: getComplianceScores(),
      attentionChains: chains.filter((chain) => chain.completeness < 90 || chain.status !== "complete"),
    },
    { meta: { domain: "compliance-chain" } }
  );
});
