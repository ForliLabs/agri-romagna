import {
  calculateQuorum,
  getProposals,
  getVotingResults,
  bylawDocuments,
  memberProfiles,
  agmEvents,
  type Proposal,
  type ProposalCategory,
  type ProposalStatus,
} from "@/lib/governance-data";
import { proposalQueries } from "@/lib/data-layer";
import { withAuth } from "@/lib/api-response";

type ProposalPayload = Partial<Proposal> & {
  title?: string;
  description?: string;
  proposedBy?: string;
  status?: ProposalStatus;
  category?: ProposalCategory;
};

export const GET = withAuth("governance:read", async () => {
  const dbProposals = await proposalQueries.findAll();

  // Use Prisma data if available, fall back to seed data
  const proposals = (dbProposals as { id: string }[]).length > 0
    ? dbProposals
    : getProposals();

  return Response.json({
    proposals,
    agmCalendar: agmEvents,
    quorum: calculateQuorum(),
    memberProfiles,
    bylaws: bylawDocuments,
    proposalTimeline: getProposals(),
    votingResults: getProposals().map((proposal) => ({
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

  const proposal = await proposalQueries.create({
    id: payload.id ?? `proposal-${crypto.randomUUID()}`,
    title: payload.title,
    description: payload.description,
    createdBy: payload.proposedBy,
    status: payload.status ?? "draft",
    cooperativeId: "coop-romagna-unita",
  });

  return Response.json({ proposal }, { status: 201 });
});

export const PUT = withAuth("governance:write", async (request: Request) => {
  const body = (await request.json()) as { id: string } & Partial<Proposal>;

  if (!body.id) {
    return Response.json({ error: "ID proposta obbligatorio." }, { status: 400 });
  }

  const existing = await proposalQueries.findById(body.id);
  if (!existing) {
    return Response.json({ error: "Proposta non trovata." }, { status: 404 });
  }

  const { id, ...updates } = body;
  const updated = await proposalQueries.update(id, updates);

  return Response.json({ proposal: updated });
});

export const DELETE = withAuth("governance:write", async (request: Request) => {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return Response.json({ error: "ID proposta obbligatorio." }, { status: 400 });
  }

  const existing = await proposalQueries.findById(id);
  if (!existing) {
    return Response.json({ error: "Proposta non trovata." }, { status: 404 });
  }

  await proposalQueries.delete(id);

  return Response.json({ deleted: true, id });
});
