import {
  auditPackageStore,
  complianceChainStore,
  complianceMappingStore,
  getComplianceScores,
} from "@/lib/compliance-chain-data";

export async function GET() {
  const [chains, mappings, auditPackages] = await Promise.all([
    complianceChainStore.findAll(),
    complianceMappingStore.findAll(),
    auditPackageStore.findAll(),
  ]);

  return Response.json({
    chains,
    mappings,
    auditPackages,
    scores: getComplianceScores(),
  });
}
