import {
  agmEventsStore,
  bylawsStore,
  calculateQuorum,
  getProposals,
  getVotingResults,
  memberProfilesStore,
} from "@/lib/governance-data";
import { proposalQueries } from "@/lib/data-layer";

export async function GET() {
  const proposals = await proposalQueries.findAll();
  const agmCalendar = await agmEventsStore.findAll();
  const memberProfiles = await memberProfilesStore.findAll();
  const bylaws = await bylawsStore.findAll();

  return Response.json({
    proposals,
    agmCalendar,
    quorum: calculateQuorum(),
    memberProfiles,
    bylaws,
    proposalTimeline: getProposals(),
    votingResults: (proposals as any[]).map((proposal: any) => ({
      proposalId: proposal.id,
      ...getVotingResults(proposal.id),
    })),
  });
}

export async function POST(request: Request) {
  const payload = await request.json();

  if (!payload.title || !payload.description || !payload.proposedBy) {
    return Response.json(
      { error: "Campi richiesti: title, description, proposedBy." },
      { status: 400 }
    );
  }

  const proposal = await proposalQueries.create({
    id: payload.id ?? `proposal-${crypto.randomUUID()}`,
    cooperativeId: payload.cooperativeId ?? "coop-romagna-unita",
    title: payload.title,
    description: payload.description,
    status: payload.status ?? "draft",
    createdBy: payload.proposedBy,
    votesFor: 0,
    votesAgainst: 0,
  });

  return Response.json({ proposal }, { status: 201 });
}
