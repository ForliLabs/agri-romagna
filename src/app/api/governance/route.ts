import type { Proposal, ProposalCategory, ProposalStatus } from "@/lib/governance-data";
import {
  agmEventsStore,
  bylawsStore,
  calculateQuorum,
  getProposals,
  getVotingResults,
  memberProfilesStore,
  proposalsStore,
} from "@/lib/governance-data";

const proposalStatuses: ProposalStatus[] = ["draft", "open", "voting", "approved", "rejected"];
const proposalCategories: ProposalCategory[] = [
  "operational",
  "financial",
  "regulatory",
  "strategic",
];

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
  const payload = (await request.json()) as Partial<Proposal>;

  if (
    !payload.title ||
    !payload.description ||
    !payload.proposedBy ||
    !payload.category ||
    !payload.votingDeadline
  ) {
    return Response.json(
      {
        error: "Campi richiesti: title, description, proposedBy, category, votingDeadline.",
      },
      { status: 400 }
    );
  }

  if (!proposalCategories.includes(payload.category)) {
    return Response.json({ error: "Categoria proposta non valida." }, { status: 400 });
  }

  if (payload.status && !proposalStatuses.includes(payload.status)) {
    return Response.json({ error: "Stato proposta non valido." }, { status: 400 });
  }

  const proposal: Proposal = {
    id: payload.id ?? `proposal-${crypto.randomUUID()}`,
    title: payload.title,
    description: payload.description,
    proposedBy: payload.proposedBy,
    status: payload.status ?? "draft",
    category: payload.category,
    createdAt: payload.createdAt ?? new Date().toISOString(),
    votingDeadline: payload.votingDeadline,
  };

  const createdProposal = await proposalsStore.create(proposal);
  return Response.json({ proposal: createdProposal }, { status: 201 });
}
