import { getMoonshotFeature, isMoonshotFeatureId } from "@/lib/moonshot-operating-system";
import { authorizeRoute } from "@/lib/api-response";
import { withErrorHandling } from "@/lib/api-errors";

export const GET = withErrorHandling(async (
  request: Request,
  { params }: { params: Promise<{ feature: string }> }
) => {
  const { denied } = await authorizeRoute(request, "dashboard:view");
  if (denied) return denied;

  const { feature } = await params;

  if (!isMoonshotFeatureId(feature)) {
    return Response.json({ error: "Moonshot non trovato." }, { status: 404 });
  }

  return Response.json(getMoonshotFeature(feature));
});
