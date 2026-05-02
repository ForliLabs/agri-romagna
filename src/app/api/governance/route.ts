import {
  agmEventsStore,
  bylawsStore,
  calculateQuorum,
  getProposals,
  getVotingResults,
  memberProfilesStore,
  proposalsStore,
  type Proposal,
  type ProposalCategory,
  type ProposalStatus,
} from "@/lib/governance-data";

type ProposalPayload = Partial<Proposal> & {
  title?: string;
  description?: string;
  proposedBy?: string;
  status?: ProposalStatus;
  category?: ProposalCategory;
};

export async function GET() {
  const proposals = await proposalsStore.findAll();
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
    votingResults: proposals.map((proposal) => ({
      proposalId: proposal.id,
      ...getVotingResults(proposal.id),
    })),
  });
}

export async function POST(request: Request) {
  const payload = (await request.json()) as ProposalPayload;

  if (!payload.title || !payload.description || !payload.proposedBy) {
    return Response.json(
      { error: "Campi richiesti: title, description, proposedBy." },
      { status: 400 }
    );
  }

  const proposal: Proposal = {
    id: payload.id ?? `proposal-${crypto.randomUUID()}`,
    title: payload.title,
    description: payload.description,
    proposedBy: payload.proposedBy,
    status: payload.status ?? "draft",
    category: payload.category ?? "operational",
    createdAt: payload.createdAt ?? new Date().toISOString(),
    votingDeadline:
      payload.votingDeadline ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  };

  await proposalsStore.create(proposal);

  return Response.json({ proposal }, { status: 201 });
}
