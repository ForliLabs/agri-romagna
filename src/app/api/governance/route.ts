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
import { withAuth } from "@/lib/api-response";

type ProposalPayload = Partial<Proposal> & {
  title?: string;
  description?: string;
  proposedBy?: string;
  status?: ProposalStatus;
  category?: ProposalCategory;
};

export const GET = withAuth("governance:read", async () => {
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
});

export const POST = withAuth("governance:write", async (request: Request) => {
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
});

export const PUT = withAuth("governance:write", async (request: Request) => {
  const body = (await request.json()) as { id: string } & Partial<Proposal>;

  if (!body.id) {
    return Response.json({ error: "ID proposta obbligatorio." }, { status: 400 });
  }

  const existing = await proposalsStore.findById(body.id);
  if (!existing) {
    return Response.json({ error: "Proposta non trovata." }, { status: 404 });
  }

  const { id, ...updates } = body;
  const updated = await proposalsStore.update(id, updates);

  return Response.json({ proposal: updated });
});

export const DELETE = withAuth("governance:write", async (request: Request) => {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return Response.json({ error: "ID proposta obbligatorio." }, { status: 400 });
  }

  const existed = await proposalsStore.delete(id);
  if (!existed) {
    return Response.json({ error: "Proposta non trovata." }, { status: 404 });
  }

  return Response.json({ deleted: true, id });
});
