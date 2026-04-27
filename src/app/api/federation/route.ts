import {
  carbonCreditPoolsStore,
  federatedBenchmarksStore,
  federatedSupplyStore,
  federationGovernanceStore,
  federationMembersStore,
  federationsStore,
  getCarbonPool,
  getFederatedSupply,
  getFederationOverview,
} from "@/lib/federation-data";

export async function GET() {
  const [federations, members, supply, benchmarks, carbonPools, governance] = await Promise.all([
    federationsStore.findAll(),
    federationMembersStore.findAll(),
    federatedSupplyStore.findAll(),
    federatedBenchmarksStore.findAll(),
    carbonCreditPoolsStore.findAll(),
    federationGovernanceStore.findAll(),
  ]);

  return Response.json({
    ...getFederationOverview(),
    federations,
    members,
    federatedSupply: getFederatedSupply(),
    supply,
    benchmarks,
    carbonPool: getCarbonPool(),
    carbonPools,
    governance,
  });
}
