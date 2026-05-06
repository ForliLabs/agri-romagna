import {
  activityStore,
  annotationsStore,
  decisionsStore,
  getCollaborationSummary,
  getFieldAnnotations,
  getFieldDecisions,
  getUserTasks,
  presenceStore,
  tasksStore,
} from "@/lib/collaboration-hub";
import { authorizeRoute } from "@/lib/api-response";
import { validateBody } from "@/lib/api-errors";
import { collaborationActionSchema } from "@/lib/validators/schemas";

export async function GET(request: Request) {
  const { denied } = await authorizeRoute(request, "fields:read");
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const fieldId = searchParams.get("fieldId");
  const userId = searchParams.get("userId");
  const view = searchParams.get("view");

  if (view === "summary") {
    return Response.json(getCollaborationSummary());
  }

  if (fieldId) {
    return Response.json({
      annotations: getFieldAnnotations(fieldId),
      decisions: getFieldDecisions(fieldId),
    });
  }

  if (userId) {
    return Response.json({
      tasks: getUserTasks(userId),
    });
  }

  const presence = await presenceStore.findAll();
  const annotations = await annotationsStore.findAll();
  const decisions = await decisionsStore.findAll();
  const tasks = await tasksStore.findAll();
  const activity = await activityStore.findAll();

  return Response.json({
    summary: getCollaborationSummary(),
    presence,
    annotations,
    decisions,
    tasks,
    recentActivity: activity,
  });
}

export async function POST(request: Request) {
  const { denied } = await authorizeRoute(request, "fields:write");
  if (denied) return denied;

  const { data: payload, error } = await validateBody(request, collaborationActionSchema);
  if (error) return error;

  if (payload.action === "update_presence") {
    const presence = await presenceStore.findById(
      (await presenceStore.findAll()).find((p) => p.userId === payload.userId)?.id ?? ""
    );
    if (!presence) {
      return Response.json({ error: "Collaboratore non trovato." }, { status: 404 });
    }
    await presenceStore.update(presence.id, {
      status: payload.status ?? presence.status,
      currentFieldId: payload.fieldId ?? presence.currentFieldId,
      lastActiveAt: new Date().toISOString(),
    });
    return Response.json({ success: true });
  }

  if (payload.action === "vote_decision") {
    const decision = await decisionsStore.findById(payload.decisionId);
    if (!decision) {
      return Response.json({ error: "Decisione non trovata." }, { status: 404 });
    }
    return Response.json({ success: true, decisionId: payload.decisionId });
  }

  return Response.json({ error: "Azione non riconosciuta." }, { status: 400 });
}
