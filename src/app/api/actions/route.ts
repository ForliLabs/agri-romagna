import { authorizeRoute, createSuccessResponse } from "@/lib/api-response";
import { validateBody, withErrorHandling } from "@/lib/api-errors";
import {
  confirmWorkflowAction,
  getConfirmedActions,
} from "@/lib/confirmed-actions";
import { confirmActionSchema } from "@/lib/validators/schemas";

export const GET = withErrorHandling(async (request: Request) => {
  const { denied } = await authorizeRoute(request, "fields:read");
  if (denied) return denied;

  const actions = await getConfirmedActions();
  return createSuccessResponse(actions);
});

export const POST = withErrorHandling(async (request: Request) => {
  const { denied } = await authorizeRoute(request, "fields:write");
  if (denied) return denied;

  const parsed = await validateBody(request, confirmActionSchema);
  if (parsed.error) return parsed.error;

  const action = await confirmWorkflowAction({
    workflow: parsed.data.workflow,
    recommendedDay: parsed.data.recommendedDay,
    recommendation: parsed.data.recommendation,
    confirmedBy: parsed.data.confirmedBy,
    scheduledDate: parsed.data.scheduledDate,
    note: parsed.data.note,
  });

  return createSuccessResponse(action, { status: 201 });
});
